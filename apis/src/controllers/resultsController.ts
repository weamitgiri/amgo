import { Request, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { query } from '../config/db';
import { serializeData } from '../utils/serializer';
import { resolvePdfPath } from '../services/resultsPdfService';
import { isCulpritRole } from '../services/verdictScoringService';
import { getJwtSecret } from '../utils/jwtSecret';

/** Strip HTML tags/entities from admin-authored rich text down to plain text. */
function htmlToPlainText(html: string | null | undefined): string {
    if (!html) return '';
    return String(html)
        .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&quot;/gi, '"')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Post-game results for a group. The game is over, so identities are no longer
 * secret — the reveal screen shows each player's real registered name alongside
 * their character and role (the PDF already does the same).
 */
export const getGameResults = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id as string | undefined;

    const [groupRows] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groupRows?.[0];
    if (!group) throw new AppError('Group not found', 404);

    if (!['completed', 'incomplete'].includes(group.status)) {
        return successResponse(res, 'Game still in progress', { is_finished: false });
    }

    const [results] = await query<any>('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [group_id]);
    const result = results?.[0];

    // The game is over, so the player↔character mapping is no longer secret:
    // include each player's character name and portrait for the reveal screen.
    const [sessions] = await query<any>(
        `SELECT ps.id, ps.total_score, ps.participant_id, gr.role_type, gr.character_name, gr.role_image,
                gp.name AS participant_name
            FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            LEFT JOIN game_participants gp ON gp.id = ps.participant_id
            WHERE ps.group_id = ?`,
        [group_id]
    );

    // Post-game "Full Story" reveal: the admin-authored Full Story Reveal parts
    // (game_full_story), in order, plus the tagline. part_body is rich HTML pasted
    // from the admin editor, so strip tags to plain text for the results card.
    const [gameRows] = await query<any>(
        `SELECT ag.id AS game_row_id, ag.tagline
            FROM game_groups gg
            JOIN organizer_bookings ob ON ob.id = gg.booking_id
            LEFT JOIN activity_games ag ON ag.id = COALESCE(gg.game_id, ob.game_id)
            WHERE gg.id = ? LIMIT 1`,
        [group_id]
    );
    const gameRowId = gameRows?.[0]?.game_row_id;
    let fullStory: any[] = [];
    if (gameRowId) {
        const [storyRows] = await query<any>(
            `SELECT id, part_title, part_body, part_image
                FROM game_full_story WHERE game_id = ? ORDER BY part_number ASC, id ASC`,
            [gameRowId]
        );
        fullStory = (storyRows ?? []).map((s: any) => ({
            id: Number(s.id),
            title: s.part_title,
            text: htmlToPlainText(s.part_body),
            image: s.part_image,
        }));
    }

    const winnerIds: number[] = result?.winner_ids
        ? typeof result.winner_ids === 'string'
            ? JSON.parse(result.winner_ids)
            : result.winner_ids
        : [];
    const winnerSet = new Set(winnerIds.map((id) => String(id)));

    // Per-player verdict status (winner / correct / loser / killer_wins) computed
    // by verdictScoringService and stored on the result row.
    const perRoleResults: any[] = result?.per_role_results
        ? typeof result.per_role_results === 'string'
            ? JSON.parse(result.per_role_results)
            : result.per_role_results
        : [];
    const statusBySession = new Map<string, string>(
        perRoleResults.map((r: any) => [String(r.session_id), r.status])
    );

    const withPseudonym = (s: any) => ({
        session_id: Number(s.id),
        // Real registered name — the game is over, identities are revealed.
        pseudonym: (s.participant_name || '').trim() || 'Player',
        role_type: s.role_type,
        score: s.total_score,
        status: statusBySession.get(String(s.id)) ?? (winnerSet.has(String(s.id)) ? 'winner' : 'loser'),
        character_name: s.character_name ?? null,
        role_image: s.role_image ?? null,
        is_you: participantId != null && String(s.participant_id) === String(participantId),
    });

    // role_type is stored as "hidden culprit" — an exact 'culprit' match never found
    // them, so the results page never showed who the killer was.
    const culpritSession = sessions.find((s: any) => isCulpritRole(s.role_type));

    const payload = {
        is_finished: true,
        is_incomplete: group.status === 'incomplete',
        group_id: Number(group.id),
        completed_at: group.completed_at,
        killer_wins: result ? !result.is_correct : false,
        culprit: culpritSession ? withPseudonym(culpritSession) : null,
        players: sessions.filter((s: any) => s.role_type).map(withPseudonym),
        winners: sessions.filter((s: any) => winnerSet.has(String(s.id))).map(withPseudonym),
        losers: sessions.filter((s: any) => s.role_type && !winnerSet.has(String(s.id))).map(withPseudonym),
        correct_guess_count: result?.correct_guess_count ?? null,
        total_guessers: sessions.filter((s: any) => s.role_type && !isCulpritRole(s.role_type)).length,
        tagline: gameRows?.[0]?.tagline ?? null,
        full_story: fullStory,
        pdf_available: Boolean(
            group.results_pdf_path && group.results_pdf_expires_at && new Date(group.results_pdf_expires_at) > new Date()
        ),
        pdf_expires_at: group.results_pdf_expires_at,
    };

    return successResponse(res, 'Results retrieved', serializeData(payload));
});

/**
 * Downloads the results PDF. Available for exactly 1 hour after a group's game
 * ends, to either: the participant who was in the group (via participant_id query
 * param, matching the rest of the participant-facing API's auth-less pattern), or
 * the organizer who owns the booking (via their existing JWT).
 */
export const downloadResultsPdf = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id as string | undefined;

    const [groupRows] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groupRows?.[0];
    if (
        !group ||
        !group.results_pdf_path ||
        !group.results_pdf_expires_at ||
        new Date(group.results_pdf_expires_at) <= new Date()
    ) {
        throw new AppError('Results PDF not available', 404);
    }

    let authorized = false;

    if (participantId) {
        const [memberRows] = await query<any>(
            'SELECT id FROM game_participants WHERE group_id = ? AND id = ? LIMIT 1',
            [group_id, participantId]
        );
        authorized = !!memberRows?.[0];
    }

    const authHeader = req.headers.authorization;
    if (!authorized && authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded: any = jwt.verify(token, getJwtSecret());
            const [ownerRows] = await query<any>(
                `SELECT ob.id FROM game_groups gg
                    JOIN organizer_bookings ob ON ob.id = gg.booking_id
                    WHERE gg.id = ? AND ob.organizer_id = ? LIMIT 1`,
                [group_id, decoded.id]
            );
            authorized = !!ownerRows?.[0];
        } catch {
            authorized = false;
        }
    }

    if (!authorized) throw new AppError('Results PDF not available', 404);

    const filePath = resolvePdfPath(group.results_pdf_path);
    if (!fs.existsSync(filePath)) throw new AppError('Results PDF not available', 404);

    return res.download(filePath, 'mystery-quest-results.pdf');
});
