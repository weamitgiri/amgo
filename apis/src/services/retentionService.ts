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

    // Cook & Create: capture the final awards PDF (kept permanently) while this
    // booking's member names/emails AND received star ratings are still intact.
    // Only on the FIRST group of the booking to be purged — once any sibling is
    // purged its given ratings are gone, which would skew the award winners. A
    // no-op for Mystery groups (no cc_game_instances row). Best-effort.
    try {
        const [ccInst] = await query<any>('SELECT 1 FROM cc_game_instances WHERE group_id = ? LIMIT 1', [groupId]);
        if ((ccInst as any).length > 0) {
            const [sib] = await query<any>(
                'SELECT COUNT(*) AS purged FROM game_groups WHERE booking_id = ? AND id <> ? AND purged_at IS NOT NULL',
                [group.booking_id, groupId]
            );
            if (Number(sib?.[0]?.purged || 0) === 0) {
                const { generateCCResultsPdfForBooking } = await import('./ccResultsPdfService');
                await generateCCResultsPdfForBooking(Number(group.booking_id));
            }
        }
    } catch (err) {
        console.error('[retentionService] CC results PDF capture before purge failed:', err);
    }

    // Mystery Quest: capture the session's single HR results PDF while every
    // group's results are still intact — only before the booking's first purge.
    // Kept until the last group is purged (below). A no-op for Cook & Create
    // bookings. Best-effort.
    let mqBookingId: number | null = null;
    try {
        const [ccInst] = await query<any>('SELECT 1 FROM cc_game_instances WHERE group_id = ? LIMIT 1', [groupId]);
        if ((ccInst as any).length === 0) {
            mqBookingId = Number(group.booking_id);
            const [sib] = await query<any>(
                'SELECT COUNT(*) AS purged FROM game_groups WHERE booking_id = ? AND id <> ? AND purged_at IS NOT NULL',
                [group.booking_id, groupId]
            );
            if (Number(sib?.[0]?.purged || 0) === 0) {
                const { generateMQResultsPdfForBooking } = await import('./mqSessionResultsPdfService');
                await generateMQResultsPdfForBooking(mqBookingId);
            }
        }
    } catch (err) {
        console.error('[retentionService] Mystery Quest session PDF capture before purge failed:', err);
    }

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

        // Cook & Create — a no-op for Mystery groups (no matching instance_id),
        // additive to this shared sweep. Scoped via the group's own cc_game_instances
        // row, so ratings this group's participants GAVE to other groups are purged
        // too; ratings this group RECEIVED are tied to the other (rating) group's own
        // instance_id and get purged on that group's own retention schedule instead.
        await conn.query(
            `DELETE FROM cc_round1_votes WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );
        await conn.query(
            `DELETE FROM cc_round1_selected_ingredients WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );
        await conn.query(
            `DELETE FROM cc_round2_steps WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );
        await conn.query(
            `DELETE FROM cc_round2_step_votes WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );
        await conn.query(
            `DELETE FROM cc_round2_released_clues WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );
        await conn.query(
            `DELETE FROM cc_round3_messages WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );
        await conn.query(
            `DELETE FROM cc_round3_impostor_votes WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );
        await conn.query(
            `DELETE FROM cc_ratings WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`,
            [groupId]
        );

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

    // Mystery Quest: once this was the session's last group to be purged, the
    // session PDF goes too (generate… deletes it when every group is purged).
    if (mqBookingId != null) {
        try {
            const { generateMQResultsPdfForBooking } = await import('./mqSessionResultsPdfService');
            await generateMQResultsPdfForBooking(mqBookingId);
        } catch (err) {
            console.error('[retentionService] Mystery Quest session PDF cleanup failed:', err);
        }
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
