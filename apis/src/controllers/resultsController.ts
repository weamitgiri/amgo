import { Request, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { query } from '../config/db';
import { serializeData } from '../utils/serializer';
import { shortName } from '../utils/pseudonym';
import { resolvePdfPath } from '../services/resultsPdfService';

/**
 * Post-game results for a group — always rendered with pseudonyms (never raw
 * participant names), matching how the live game already hides identities.
 */
export const getGameResults = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;

    const [groupRows] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groupRows?.[0];
    if (!group) throw new AppError('Group not found', 404);

    if (!['completed', 'incomplete'].includes(group.status)) {
        return successResponse(res, 'Game still in progress', { is_finished: false });
    }

    const [results] = await query<any>('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [group_id]);
    const result = results?.[0];

    const [sessions] = await query<any>(
        `SELECT ps.id, ps.total_score, gr.role_type, gp.name AS participant_name
            FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            LEFT JOIN game_participants gp ON gp.id = ps.participant_id
            WHERE ps.group_id = ?`,
        [group_id]
    );

    const winnerIds: number[] = result?.winner_ids
        ? typeof result.winner_ids === 'string'
            ? JSON.parse(result.winner_ids)
            : result.winner_ids
        : [];
    const winnerSet = new Set(winnerIds.map((id) => String(id)));

    const withPseudonym = (s: any) => ({
        session_id: Number(s.id),
        pseudonym: shortName(s.participant_name || 'Player', Number(s.id)),
        role_type: s.role_type,
        score: s.total_score,
    });

    const culpritSession = sessions.find((s: any) => s.role_type === 'culprit');

    const payload = {
        is_finished: true,
        is_incomplete: group.status === 'incomplete',
        group_id: Number(group.id),
        completed_at: group.completed_at,
        culprit: culpritSession ? withPseudonym(culpritSession) : null,
        winners: sessions.filter((s: any) => winnerSet.has(String(s.id))).map(withPseudonym),
        losers: sessions.filter((s: any) => s.role_type && !winnerSet.has(String(s.id))).map(withPseudonym),
        correct_guess_count: result?.correct_guess_count ?? null,
        total_guessers: sessions.filter((s: any) => s.role_type && s.role_type !== 'culprit').length,
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
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
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
