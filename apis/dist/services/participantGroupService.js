"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignParticipantToGroup = assignParticipantToGroup;
exports.assertCanStartJoin = assertCanStartJoin;
exports.assertBrowserNotBoundToOtherParticipant = assertBrowserNotBoundToOtherParticipant;
const db_1 = require("../config/db");
const groupDataCleanup_1 = require("./groupDataCleanup");
const AppError_1 = require("../utils/AppError");
const eventStatsService_1 = require("./eventStatsService");
/**
 * Pick the game for the Nth group (0-based) of a booking.
 *
 * Games are distributed round-robin across the activity's active games:
 * with 4 games and 8 groups, groups 1-4 get games 1-4 and groups 5-8 cycle
 * back to games 1-4 again. An activity with a single game assigns that game
 * to every group. Falls back to the booking-level game selection when the
 * activity has no active games of its own.
 */
async function resolveGameForGroup(conn, bookingId, groupIndex) {
    const [bookingRows] = (await conn.query('SELECT activity_id, game_id FROM organizer_bookings WHERE id = ?', [bookingId]));
    if (bookingRows.length === 0)
        return null;
    const { activity_id: activityId, game_id: bookingGameId } = bookingRows[0];
    const [gameRows] = (await conn.query("SELECT id FROM activity_games WHERE activity_id = ? AND status = 'active' ORDER BY id ASC", [activityId]));
    if (gameRows.length === 0) {
        return bookingGameId ? Number(bookingGameId) : null;
    }
    return Number(gameRows[groupIndex % gameRows.length].id);
}
async function assignParticipantToGroup(conn, bookingId, participantId, email) {
    const [verifiedRows] = (await conn.query(`SELECT id, group_id
         FROM game_participants
         WHERE email = ? AND booking_id = ? AND email_verified_at IS NOT NULL`, [email, bookingId]));
    if (verifiedRows.length > 0 && verifiedRows[0].group_id) {
        const [groupInfo] = (await conn.query('SELECT id, group_name FROM game_groups WHERE id = ?', [verifiedRows[0].group_id]));
        return {
            groupId: verifiedRows[0].group_id,
            groupName: groupInfo[0]?.group_name ?? 'Group',
            alreadyVerified: true,
        };
    }
    const limits = await (0, eventStatsService_1.getBookingLimits)(bookingId);
    if (!limits) {
        throw new AppError_1.AppError('Booking not found', 404);
    }
    const [groupRows] = (await conn.query(`SELECT g.id, g.group_name,
            (SELECT COUNT(*) FROM game_participants
             WHERE group_id = g.id AND email_verified_at IS NOT NULL) as member_count
         FROM game_groups g
         WHERE g.booking_id = ?
         ORDER BY g.id ASC`, [bookingId]));
    const groups = groupRows;
    // Group capacity is admin-configured per activity (activities.group_size).
    const availableGroup = groups.find((g) => Number(g.member_count) < limits.playersPerGroup);
    let groupId;
    let groupName;
    if (availableGroup) {
        groupId = availableGroup.id;
        groupName = availableGroup.group_name;
    }
    else {
        if (limits.maxGroups > 0 && groups.length >= limits.maxGroups) {
            throw new AppError_1.AppError('All groups are full for this event. No additional participants can join.', 403);
        }
        const nextGroupNum = groups.length + 1;
        groupName = `Group ${nextGroupNum}`;
        const gameId = await resolveGameForGroup(conn, bookingId, groups.length);
        const [newGroup] = (await conn.query('INSERT INTO game_groups (booking_id, game_id, group_name, status) VALUES (?, ?, ?, ?)', [bookingId, gameId, groupName, 'waiting']));
        groupId = newGroup.insertId;
        // The id may have been used by an earlier (since-deleted) group whose timers,
        // questions, sessions etc. were left behind. Clear them now so this new game
        // doesn't inherit an old, already-expired clock (fresh game opening on
        // Investigation at 00:00) or old players/answers.
        await (0, groupDataCleanup_1.clearStaleDataForNewGroup)(conn, groupId);
    }
    await conn.query('UPDATE game_participants SET group_id = ? WHERE id = ?', [groupId, participantId]);
    return { groupId, groupName, alreadyVerified: false };
}
async function assertCanStartJoin(bookingId, email) {
    try {
        await (0, eventStatsService_1.assertCanJoinBooking)(bookingId, email);
    }
    catch (err) {
        throw new AppError_1.AppError(err.message, err.statusCode ?? 403);
    }
}
/**
 * One participant per browser. The browser sends the join token it received from
 * its last successful OTP verification (X-Participant-Token). If that token still
 * belongs to a verified participant whose game is running, only that same
 * participant (same booking + email) may join from this browser; anyone else is
 * refused until that game ends or the player leaves (the frontend then drops the
 * token). The identity comes from the server-issued token, never from a
 * client-supplied participant id. Other browsers/devices send no token and are
 * unaffected.
 */
async function assertBrowserNotBoundToOtherParticipant(browserToken, bookingId, email) {
    if (typeof browserToken !== 'string' || !/^[a-f0-9]{64}$/.test(browserToken))
        return;
    const [rows] = await (0, db_1.query)(`SELECT gp.booking_id, LOWER(gp.email) AS email, gp.name
         FROM game_participants gp
         JOIN game_groups gg ON gg.id = gp.group_id
         JOIN organizer_bookings ob ON ob.id = gp.booking_id
         WHERE gp.join_token = ?
           AND gp.email_verified_at IS NOT NULL
           AND gp.status <> 'finished'
           AND gg.status NOT IN ('completed', 'incomplete', 'finished')
           AND (ob.scheduled_date IS NULL OR ob.scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 1 DAY))
         LIMIT 1`, [browserToken]);
    if (rows.length === 0)
        return;
    const bound = rows[0];
    const sameParticipant = String(bound.booking_id) === String(bookingId) && bound.email === email.trim().toLowerCase();
    if (sameParticipant)
        return;
    throw new AppError_1.AppError(`This browser is already joined to an active game as ${bound.name}. ` +
        'Leave that game or wait for it to end before joining as a different participant.', 409);
}
