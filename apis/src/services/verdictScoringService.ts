import moment from 'moment';
import { query, withTransaction } from '../config/db';
import { AppError } from '../utils/AppError';
import { serializeData } from '../utils/serializer';
import { io } from '../server';
import { generateResultsPdf } from './resultsPdfService';

const NON_CULPRIT_ROLES = ['investigator', 'suspect', 'witness', 'participant'];

type PerRoleResult = {
    session_id: number;
    role_type: string;
    guessed_session_id: number | null;
    is_correct: boolean;
};

/**
 * Records one participant's final accusation. Once every non-culprit role in the
 * group has submitted (or the questioning timer independently expires — see
 * timerService.ts), finalizeVerdict computes and broadcasts the outcome.
 */
export async function submitAccusation(
    groupId: number | string,
    participantSessionId: number,
    accusedSessionId: number,
    reasoning: string
): Promise<{ accepted: true; all_submitted: boolean }> {
    const [sessionRows] = await query<any>(
        `SELECT ps.id, ps.group_id, gr.role_type FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         WHERE ps.id = ? LIMIT 1`,
        [participantSessionId]
    );
    const session = sessionRows?.[0];
    if (!session || String(session.group_id) !== String(groupId)) {
        throw new AppError('Session not found in this group', 404);
    }
    if (!session.role_type || !NON_CULPRIT_ROLES.includes(session.role_type)) {
        throw new AppError('The culprit cannot submit an accusation', 403);
    }

    const [existingRows] = await query<any>(
        'SELECT id FROM group_accusations WHERE participant_session_id = ? LIMIT 1',
        [participantSessionId]
    );
    if (existingRows?.[0]) {
        throw new AppError('You have already submitted your accusation', 400);
    }

    await query(
        `INSERT INTO group_accusations (group_id, participant_session_id, accused_session_id, reasoning, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [groupId, participantSessionId, accusedSessionId, reasoning]
    );

    io.to(`group_${groupId}`).emit('accusation_submitted', { participant_session_id: participantSessionId });

    const [nonCulpritRows] = await query<any>(
        `SELECT ps.id FROM participant_sessions ps
         JOIN game_roles gr ON gr.id = ps.role_id
         WHERE ps.group_id = ? AND gr.role_type != 'culprit'`,
        [groupId]
    );
    const [countRows] = await query<any>('SELECT COUNT(*) as cnt FROM group_accusations WHERE group_id = ?', [groupId]);
    const allSubmitted = Number(countRows?.[0]?.cnt || 0) >= nonCulpritRows.length && nonCulpritRows.length > 0;

    if (allSubmitted) {
        await finalizeVerdict(groupId);
    }

    return { accepted: true, all_submitted: allSubmitted };
}

/**
 * Computes the final winner/loser outcome for a group, using whatever accusations
 * have been submitted so far. Any eligible role that never submitted (left mid-game,
 * or the questioning timer ran out) counts as an incorrect guess. Idempotent — safe
 * to call more than once (e.g. from both the last submission and a timer expiry
 * race); a group that's already completed/incomplete is left untouched.
 */
export async function finalizeVerdict(groupId: number | string): Promise<void> {
    const [groupRows] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const group = groupRows?.[0];
    if (!group || group.status === 'completed' || group.status === 'incomplete') return;

    const [sessions] = await query<any>(
        `SELECT ps.id, gr.role_type FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         WHERE ps.group_id = ?`,
        [groupId]
    );
    const culpritSession = sessions.find((s: any) => s.role_type === 'culprit');
    const nonCulpritSessions = sessions.filter((s: any) => s.role_type && s.role_type !== 'culprit');

    const [accusations] = await query<any>('SELECT * FROM group_accusations WHERE group_id = ?', [groupId]);
    const accusationBySession = new Map<string, any>(accusations.map((a: any) => [String(a.participant_session_id), a]));

    const perRoleResults: PerRoleResult[] = nonCulpritSessions.map((s: any) => {
        const acc = accusationBySession.get(String(s.id));
        const isCorrect = !!acc && !!culpritSession && String(acc.accused_session_id) === String(culpritSession.id);
        return {
            session_id: Number(s.id),
            role_type: s.role_type,
            guessed_session_id: acc ? Number(acc.accused_session_id) : null,
            is_correct: isCorrect,
        };
    });

    const correctGuessCount = perRoleResults.filter((r) => r.is_correct).length;
    const culpritWins = correctGuessCount === 0;
    const winners: number[] = culpritWins
        ? culpritSession
            ? [Number(culpritSession.id)]
            : []
        : perRoleResults.filter((r) => r.is_correct).map((r) => r.session_id);

    const investigatorSession = nonCulpritSessions.find((s: any) => s.role_type === 'investigator');
    const investigatorAccusation = investigatorSession ? accusationBySession.get(String(investigatorSession.id)) : null;

    const completedAt = new Date();
    const retentionPurgeAt = moment(completedAt).add(1, 'hour').toDate();

    await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO results
                (group_id, identified_culprit_id, investigator_reasoning, is_correct, winner_ids, correct_guess_count, per_role_results, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                groupId,
                culpritSession ? culpritSession.id : null,
                investigatorAccusation?.reasoning || null,
                culpritWins ? 0 : 1,
                JSON.stringify(winners),
                correctGuessCount,
                JSON.stringify(perRoleResults),
            ]
        );

        await conn.query(
            `UPDATE game_groups SET status = 'completed', completed_at = ?, retention_purge_at = ? WHERE id = ?`,
            [completedAt, retentionPurgeAt, groupId]
        );
    });

    try {
        await generateResultsPdf(groupId);
    } catch (err) {
        console.error('[verdictScoringService] Results PDF generation failed:', err);
    }

    const [resultRows] = await query<any>('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [groupId]);
    io.to(`group_${groupId}`).emit(
        'game_ended',
        serializeData({ ...resultRows?.[0], correct_guess_count: correctGuessCount, per_role_results: perRoleResults })
    );
}

/**
 * Ends a game early because the Investigator left mid-session. No scoring/winners —
 * just an auto-reveal of the culprit and an "incomplete" marker. Retention still
 * applies (1 hour from this moment) so participant PII is purged on the same schedule
 * as a normally-completed game.
 */
export async function markGroupIncomplete(groupId: number | string, reason: string): Promise<void> {
    const [groupRows] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const group = groupRows?.[0];
    if (!group || group.status === 'completed' || group.status === 'incomplete') return;

    const [sessions] = await query<any>(
        `SELECT ps.id, ps.participant_id, gr.role_type, gr.character_name, gp.name AS participant_name
         FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         LEFT JOIN game_participants gp ON gp.id = ps.participant_id
         WHERE ps.group_id = ?`,
        [groupId]
    );
    const culpritSession = sessions.find((s: any) => s.role_type === 'culprit');

    const completedAt = new Date();
    const retentionPurgeAt = moment(completedAt).add(1, 'hour').toDate();

    await query(
        `UPDATE game_groups SET status = 'incomplete', completed_at = ?, retention_purge_at = ? WHERE id = ?`,
        [completedAt, retentionPurgeAt, groupId]
    );

    io.to(`group_${groupId}`).emit(
        'game_incomplete',
        serializeData({
            reason,
            culprit: culpritSession
                ? { session_id: Number(culpritSession.id), character_name: culpritSession.character_name }
                : null,
        })
    );
}
