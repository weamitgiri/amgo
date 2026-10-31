import fs from 'fs';
import moment from 'moment';
import { query, withTransaction } from '../config/db';
import { resolvePdfPath } from './resultsPdfService';

/**
 * How long after a game STARTS its joining data (participants, groups and group
 * membership) is automatically deleted. Matches the 1-hour value the game
 * previously used (hardcoded in verdictScoringService); no new admin setting is
 * introduced.
 */
const RETENTION_WINDOW_HOURS = 1;

// Cook & Create per-instance child tables, children first so each delete can
// still resolve its parent instance. Mirrors the list in purgeGroupParticipantData.
const CC_CHILD_TABLES = [
    'cc_round1_votes',
    'cc_round1_selected_ingredients',
    'cc_round2_steps',
    'cc_round2_step_votes',
    'cc_round2_released_clues',
    'cc_round3_messages',
    'cc_round3_impostor_votes',
    'cc_ratings',
];

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

/**
 * Permanently DELETES all joining data for one booking (game event): every
 * participant who joined, every group that was formed, and their group-membership
 * (participant_sessions) rows — plus the per-group game content those rows own.
 * Covers complete, incomplete AND never-filled groups uniformly, since it is
 * scoped by booking_id, not group status.
 *
 * Scoped to this booking only (other events are never touched), and it never
 * touches organizers, organizer_bookings or organizer_billings (the HR account,
 * booking and GST records). The HR results PDF is captured to disk first so HR
 * keeps the session results after the rows are gone.
 */
export async function purgeBookingJoiningData(bookingId: number | string): Promise<void> {
    const [groupRows] = await query<any>('SELECT id, results_pdf_path FROM game_groups WHERE booking_id = ?', [bookingId]);

    // Capture the HR results PDF(s) ONCE while every group's rows are still intact,
    // so HR keeps the session results after the joining data is deleted. Best-effort.
    if ((groupRows as any[]).length > 0) {
        try {
            const { generateMQResultsPdfForBooking } = await import('./mqSessionResultsPdfService');
            await generateMQResultsPdfForBooking(Number(bookingId));
        } catch (err) {
            console.error('[retentionService] MQ session PDF capture before purge failed:', err);
        }
        try {
            const [ccInst] = await query<any>(
                'SELECT 1 FROM cc_game_instances ci JOIN game_groups gg ON gg.id = ci.group_id WHERE gg.booking_id = ? LIMIT 1',
                [bookingId]
            );
            if ((ccInst as any).length > 0) {
                const { generateCCResultsPdfForBooking } = await import('./ccResultsPdfService');
                await generateCCResultsPdfForBooking(Number(bookingId));
            }
        } catch (err) {
            console.error('[retentionService] CC awards PDF capture before purge failed:', err);
        }
    }

    // All deletes scoped to THIS booking's groups, children first so each can still
    // resolve its parent. game_participants is deleted by booking_id so unassigned
    // joiners (group_id NULL) go too. game_groups is deleted last.
    const inBookingGroups = 'group_id IN (SELECT id FROM game_groups WHERE booking_id = ?)';
    await withTransaction(async (conn) => {
        await conn.query(
            `DELETE FROM score_logs WHERE participant_session_id IN (SELECT id FROM participant_sessions WHERE ${inBookingGroups})`,
            [bookingId]
        );
        await conn.query(
            `DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE ${inBookingGroups})`,
            [bookingId]
        );
        for (const sql of [
            `DELETE FROM questions WHERE ${inBookingGroups}`,
            `DELETE FROM votes WHERE ${inBookingGroups}`,
            `DELETE FROM lie_detector_rounds WHERE ${inBookingGroups}`,
            `DELETE FROM group_accusations WHERE ${inBookingGroups}`,
            `DELETE FROM witness_passcards WHERE ${inBookingGroups}`,
            `DELETE FROM clue_rooms WHERE ${inBookingGroups}`,
            `DELETE FROM timers WHERE ${inBookingGroups}`,
            `DELETE FROM results WHERE ${inBookingGroups}`,
        ]) {
            await conn.query(sql, [bookingId]);
        }

        // Cook & Create instance children, then the instances (no-op for Mystery).
        for (const t of CC_CHILD_TABLES) {
            try {
                await conn.query(
                    `DELETE FROM ${t} WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE ${inBookingGroups})`,
                    [bookingId]
                );
            } catch (err: any) {
                if (err?.code !== 'ER_NO_SUCH_TABLE') throw err;
            }
        }
        try {
            await conn.query(`DELETE FROM cc_game_instances WHERE ${inBookingGroups}`, [bookingId]);
        } catch (err: any) {
            if (err?.code !== 'ER_NO_SUCH_TABLE') throw err;
        }

        // Joining data — hard delete. Membership first, then joiners, then groups.
        await conn.query(`DELETE FROM participant_sessions WHERE ${inBookingGroups}`, [bookingId]);
        await conn.query('DELETE FROM game_participants WHERE booking_id = ?', [bookingId]);
        await conn.query('DELETE FROM game_groups WHERE booking_id = ?', [bookingId]);
    });

    // Remove each group's own (1-hour) results PDF file. The session/awards PDF
    // captured above is kept.
    for (const g of groupRows as any[]) {
        if (!g.results_pdf_path) continue;
        try {
            const filePath = resolvePdfPath(g.results_pdf_path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.error('[retentionService] Failed to delete results PDF file:', err);
        }
    }
}

export async function runRetentionSweep(): Promise<void> {
    try {
        // Event-wide joining-data cleanup, anchored to when the game actually
        // STARTS: the booking's scheduled start plus the lobby entry window
        // (activities.lobby_wait_secs) — the same moment buildLobbyPayload flips a
        // group to active. RETENTION_WINDOW_HOURS after that, every group and
        // participant of the booking is deleted (complete, incomplete, or never
        // filled). Runs on the server timer loop, so it works with no admin panel
        // or browser open. Per booking, so other events are unaffected.
        // Dynamic import avoids a static retentionService → lobbyService →
        // timerService → retentionService import cycle.
        const { parseBookingSchedule } = await import('./lobbyService');
        const [bookings] = await query<any>(
            `SELECT ob.id AS booking_id, ob.scheduled_date, ob.scheduled_time, a.lobby_wait_secs
               FROM organizer_bookings ob
               JOIN activities a ON a.id = ob.activity_id
              WHERE EXISTS (SELECT 1 FROM game_groups gg WHERE gg.booking_id = ob.id)`
        );
        const now = moment();
        for (const b of bookings as any[]) {
            const start = parseBookingSchedule(b.scheduled_date, b.scheduled_time);
            if (!start) continue;
            const lobbyWaitSecs = Number(b.lobby_wait_secs) || 900;
            const purgeAt = start.clone().add(lobbyWaitSecs, 'seconds').add(RETENTION_WINDOW_HOURS, 'hours');
            if (now.isSameOrAfter(purgeAt)) {
                await purgeBookingJoiningData(b.booking_id);
            }
        }
    } catch (err) {
        console.error('[RetentionService] Error:', err);
    }
}
