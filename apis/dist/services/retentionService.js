"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeGroupParticipantData = purgeGroupParticipantData;
exports.purgeBookingJoiningData = purgeBookingJoiningData;
exports.runRetentionSweep = runRetentionSweep;
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const db_1 = require("../config/db");
const resultsPdfService_1 = require("./resultsPdfService");
const resultWindowService_1 = require("./resultWindowService");
/**
 * Fallback only: for a booking where NO group ever started playing (every group
 * stayed `waiting` because it never filled), there is no result to declare, so
 * its joining data is deleted this long after the game's start time. Bookings
 * that did play are kept until their one-hour results window has expired (see
 * runRetentionSweep). No new admin setting is introduced.
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
async function purgeGroupParticipantData(groupId) {
    const [groupRows] = await (0, db_1.query)('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const group = groupRows?.[0];
    if (!group || group.purged_at)
        return;
    // Cook & Create: capture the final awards PDF (kept permanently) while this
    // booking's member names/emails AND received star ratings are still intact.
    // Only on the FIRST group of the booking to be purged — once any sibling is
    // purged its given ratings are gone, which would skew the award winners. A
    // no-op for Mystery groups (no cc_game_instances row). Best-effort.
    try {
        const [ccInst] = await (0, db_1.query)('SELECT 1 FROM cc_game_instances WHERE group_id = ? LIMIT 1', [groupId]);
        if (ccInst.length > 0) {
            const [sib] = await (0, db_1.query)('SELECT COUNT(*) AS purged FROM game_groups WHERE booking_id = ? AND id <> ? AND purged_at IS NOT NULL', [group.booking_id, groupId]);
            if (Number(sib?.[0]?.purged || 0) === 0) {
                const { generateCCResultsPdfForBooking } = await Promise.resolve().then(() => __importStar(require('./ccResultsPdfService')));
                await generateCCResultsPdfForBooking(Number(group.booking_id));
            }
        }
    }
    catch (err) {
        console.error('[retentionService] CC results PDF capture before purge failed:', err);
    }
    // Mystery Quest: capture the session's single HR results PDF while every
    // group's results are still intact — only before the booking's first purge.
    // Kept until the last group is purged (below). A no-op for Cook & Create
    // bookings. Best-effort.
    let mqBookingId = null;
    try {
        const [ccInst] = await (0, db_1.query)('SELECT 1 FROM cc_game_instances WHERE group_id = ? LIMIT 1', [groupId]);
        if (ccInst.length === 0) {
            mqBookingId = Number(group.booking_id);
            const [sib] = await (0, db_1.query)('SELECT COUNT(*) AS purged FROM game_groups WHERE booking_id = ? AND id <> ? AND purged_at IS NOT NULL', [group.booking_id, groupId]);
            if (Number(sib?.[0]?.purged || 0) === 0) {
                const { generateMQResultsPdfForBooking } = await Promise.resolve().then(() => __importStar(require('./mqSessionResultsPdfService')));
                await generateMQResultsPdfForBooking(mqBookingId);
            }
        }
    }
    catch (err) {
        console.error('[retentionService] Mystery Quest session PDF capture before purge failed:', err);
    }
    await (0, db_1.withTransaction)(async (conn) => {
        await conn.query('UPDATE game_participants SET name = NULL, email = NULL, otp = NULL, otp_expires_at = NULL WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM group_accusations WHERE group_id = ?', [groupId]);
        await conn.query('DELETE FROM score_logs WHERE participant_session_id IN (SELECT id FROM participant_sessions WHERE group_id = ?)', [groupId]);
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
        await conn.query(`DELETE FROM cc_round1_votes WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query(`DELETE FROM cc_round1_selected_ingredients WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query(`DELETE FROM cc_round2_steps WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query(`DELETE FROM cc_round2_step_votes WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query(`DELETE FROM cc_round2_released_clues WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query(`DELETE FROM cc_round3_messages WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query(`DELETE FROM cc_round3_impostor_votes WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query(`DELETE FROM cc_ratings WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`, [groupId]);
        await conn.query('UPDATE participant_sessions SET role_id = NULL, total_score = 0, socket_id = NULL WHERE group_id = ?', [groupId]);
        // Run last: every statement above is scoped by group_id against other tables,
        // so nulling this doesn't break them — kept last for a clean rollback point.
        await conn.query('UPDATE game_participants SET group_id = NULL WHERE group_id = ?', [groupId]);
        await conn.query('UPDATE game_groups SET purged_at = NOW() WHERE id = ?', [groupId]);
    });
    if (group.results_pdf_path) {
        try {
            const filePath = (0, resultsPdfService_1.resolvePdfPath)(group.results_pdf_path);
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        }
        catch (err) {
            console.error('[retentionService] Failed to delete results PDF file:', err);
        }
        await (0, db_1.query)('UPDATE game_groups SET results_pdf_path = NULL, results_pdf_expires_at = NULL WHERE id = ?', [groupId]);
    }
    // Mystery Quest: once this was the session's last group to be purged, the
    // session PDF goes too (generate… deletes it when every group is purged).
    if (mqBookingId != null) {
        try {
            const { generateMQResultsPdfForBooking } = await Promise.resolve().then(() => __importStar(require('./mqSessionResultsPdfService')));
            await generateMQResultsPdfForBooking(mqBookingId);
        }
        catch (err) {
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
async function purgeBookingJoiningData(bookingId) {
    const [groupRows] = await (0, db_1.query)('SELECT id, results_pdf_path FROM game_groups WHERE booking_id = ?', [bookingId]);
    // Capture the HR results PDF(s) ONCE while every group's rows are still intact,
    // so HR keeps the session results after the joining data is deleted. Best-effort.
    if (groupRows.length > 0) {
        try {
            const { generateMQResultsPdfForBooking } = await Promise.resolve().then(() => __importStar(require('./mqSessionResultsPdfService')));
            await generateMQResultsPdfForBooking(Number(bookingId));
        }
        catch (err) {
            console.error('[retentionService] MQ session PDF capture before purge failed:', err);
        }
        try {
            const [ccInst] = await (0, db_1.query)('SELECT 1 FROM cc_game_instances ci JOIN game_groups gg ON gg.id = ci.group_id WHERE gg.booking_id = ? LIMIT 1', [bookingId]);
            if (ccInst.length > 0) {
                const { generateCCResultsPdfForBooking } = await Promise.resolve().then(() => __importStar(require('./ccResultsPdfService')));
                await generateCCResultsPdfForBooking(Number(bookingId));
            }
        }
        catch (err) {
            console.error('[retentionService] CC awards PDF capture before purge failed:', err);
        }
    }
    // All deletes scoped to THIS booking's groups, children first so each can still
    // resolve its parent. game_participants is deleted by booking_id so unassigned
    // joiners (group_id NULL) go too. game_groups is deleted last.
    const inBookingGroups = 'group_id IN (SELECT id FROM game_groups WHERE booking_id = ?)';
    await (0, db_1.withTransaction)(async (conn) => {
        await conn.query(`DELETE FROM score_logs WHERE participant_session_id IN (SELECT id FROM participant_sessions WHERE ${inBookingGroups})`, [bookingId]);
        await conn.query(`DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE ${inBookingGroups})`, [bookingId]);
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
                await conn.query(`DELETE FROM ${t} WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE ${inBookingGroups})`, [bookingId]);
            }
            catch (err) {
                if (err?.code !== 'ER_NO_SUCH_TABLE')
                    throw err;
            }
        }
        try {
            await conn.query(`DELETE FROM cc_game_instances WHERE ${inBookingGroups}`, [bookingId]);
        }
        catch (err) {
            if (err?.code !== 'ER_NO_SUCH_TABLE')
                throw err;
        }
        // Joining data — participant PII and membership are hard-deleted. The group
        // SHELLS are kept (soft-purged): a group's status + completed_at are the only
        // lasting record that the event actually ran and finished. If we deleted the
        // groups too, the dashboard — which derives "Event Completed" from the live
        // game_groups rows — would lose that signal and wrongly revert a finished
        // event to "Event Started" once this booking's rows were gone. Keeping the
        // shells (exactly as the per-group soft purge already does) fixes that while
        // still removing every participant name/email and all game content.
        // getSessionResultWindow keeps hiding the results an hour after declaration
        // (it is time-based), and the sweep stops re-visiting the booking once
        // purged_at is set.
        await conn.query(`DELETE FROM participant_sessions WHERE ${inBookingGroups}`, [bookingId]);
        await conn.query('DELETE FROM game_participants WHERE booking_id = ?', [bookingId]);
        await conn.query('UPDATE game_groups SET purged_at = NOW(), results_pdf_path = NULL, results_pdf_expires_at = NULL WHERE booking_id = ? AND purged_at IS NULL', [bookingId]);
    });
    // Remove each group's own (1-hour) results PDF file. The session/awards PDF
    // captured above is kept.
    for (const g of groupRows) {
        if (!g.results_pdf_path)
            continue;
        try {
            const filePath = (0, resultsPdfService_1.resolvePdfPath)(g.results_pdf_path);
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        }
        catch (err) {
            console.error('[retentionService] Failed to delete results PDF file:', err);
        }
    }
}
async function runRetentionSweep() {
    try {
        // Event-wide joining-data cleanup, anchored to the RESULT DECLARATION:
        // once every played group has finished, the booking's game data and PDF
        // downloads stay available for the full one-hour results window (the same
        // window the HR Results tab uses, from resultWindowService). Only when that
        // window has expired is every group and participant of the booking deleted
        // (complete, incomplete, or never filled). A game still being played is
        // never deleted. Runs on the server timer loop, so it works with no admin
        // panel or browser open. Per booking, so other events are unaffected.
        // Dynamic import avoids a static retentionService → lobbyService →
        // timerService → retentionService import cycle.
        const { parseBookingSchedule } = await Promise.resolve().then(() => __importStar(require('./lobbyService')));
        const [bookings] = await (0, db_1.query)(`SELECT ob.id AS booking_id, ob.scheduled_date, ob.scheduled_time, a.lobby_wait_secs,
                    (SELECT COUNT(*) FROM game_groups gg
                      WHERE gg.booking_id = ob.id AND gg.status <> 'waiting') AS played_groups
               FROM organizer_bookings ob
               JOIN activities a ON a.id = ob.activity_id
              WHERE EXISTS (SELECT 1 FROM game_groups gg WHERE gg.booking_id = ob.id AND gg.purged_at IS NULL)`);
        const now = (0, moment_1.default)();
        for (const b of bookings) {
            const window = await (0, resultWindowService_1.getBookingResultWindow)(Number(b.booking_id));
            if (window) {
                // Declared: keep everything until the one-hour results window ends.
                if (Date.now() >= window.expiresAt)
                    await purgeBookingJoiningData(b.booking_id);
                continue;
            }
            // Not declared. If any group played, one is still in progress — wait.
            if (Number(b.played_groups) > 0)
                continue;
            // No group ever started (none filled), so there is no result to keep:
            // delete RETENTION_WINDOW_HOURS after the game's start time.
            const start = parseBookingSchedule(b.scheduled_date, b.scheduled_time);
            if (!start)
                continue;
            const lobbyWaitSecs = Number(b.lobby_wait_secs) || 900;
            const purgeAt = start.clone().add(lobbyWaitSecs, 'seconds').add(RETENTION_WINDOW_HOURS, 'hours');
            if (now.isSameOrAfter(purgeAt)) {
                await purgeBookingJoiningData(b.booking_id);
            }
        }
    }
    catch (err) {
        console.error('[RetentionService] Error:', err);
    }
}
