import fs from 'fs';
import { query, withTransaction } from '../config/db';
import { resolvePdfPath } from './resultsPdfService';

/**
 * Permanently removes participant PII and game content for a group whose
 * `retention_purge_at` has passed. Never touches organizers, organizer_bookings, or
 * organizer_billings — those carry the HR email, booking date/package, and GST
 * invoice, all of which the FSD requires retaining indefinitely.
 */
export async function purgeGroupParticipantData(groupId: number | string): Promise<void> {
    const [groupRows] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const group = groupRows?.[0];
    if (!group || group.purged_at) return;

    await withTransaction(async (conn) => {
        await conn.query('UPDATE game_participants SET name = NULL, email = NULL, otp = NULL, otp_expires_at = NULL WHERE group_id = ?', [groupId]);

        await conn.query('DELETE FROM group_accusations WHERE group_id = ?', [groupId]);
        await conn.query(
            'DELETE FROM score_logs WHERE participant_session_id IN (SELECT id FROM participant_sessions WHERE group_id = ?)',
            [groupId]
        );
        await conn.query('DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE group_id = ?)', [groupId]);
        await conn.query('DELETE FROM questions WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM votes WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM lie_detector_rounds WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM witness_passcards WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM clue_rooms WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM timers WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM results WHERE group_id = ?', [groupId]);

        await conn.query('UPDATE participant_sessions SET role_id = NULL, total_score = 0, socket_id = NULL WHERE group_id = ?', [groupId]);

        // Run last: every statement above is scoped by group_id against other tables,
        // so nulling this doesn't break them — kept last for a clean rollback point.
        await conn.query('UPDATE game_participants SET group_id = NULL WHERE group_id = ?', [groupId]);

        await conn.query('UPDATE game_groups SET purged_at = NOW() WHERE id = ?', [groupId]);
    });

    if (group.results_pdf_path) {
        try {
            const filePath = resolvePdfPath(group.results_pdf_path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.error('[retentionService] Failed to delete results PDF file:', err);
        }
        await query('UPDATE game_groups SET results_pdf_path = NULL, results_pdf_expires_at = NULL WHERE id = ?', [groupId]);
    }
}

export async function runRetentionSweep(): Promise<void> {
    try {
        const [dueGroups] = await query<any>(
            `SELECT id FROM game_groups
             WHERE status IN ('completed', 'incomplete') AND retention_purge_at IS NOT NULL
               AND retention_purge_at <= NOW() AND purged_at IS NULL`
        );
        for (const g of dueGroups) {
            await purgeGroupParticipantData(g.id);
        }
    } catch (err) {
        console.error('[RetentionService] Error:', err);
    }
}
