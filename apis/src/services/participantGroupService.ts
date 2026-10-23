import type { PoolConnection } from 'mysql2/promise';
import { query } from '../config/db';
import { clearStaleDataForNewGroup } from './groupDataCleanup';
import { AppError } from '../utils/AppError';
import { assertCanJoinBooking, getBookingLimits } from './eventStatsService';

type GroupRow = { id: number; group_name: string; member_count: number };

/**
 * Pick the game for the Nth group (0-based) of a booking.
 *
 * Games are distributed round-robin across the activity's active games:
 * with 4 games and 8 groups, groups 1-4 get games 1-4 and groups 5-8 cycle
 * back to games 1-4 again. An activity with a single game assigns that game
 * to every group. Falls back to the booking-level game selection when the
 * activity has no active games of its own.
 */
async function resolveGameForGroup(
    conn: PoolConnection,
    bookingId: number | string,
    groupIndex: number
): Promise<number | null> {
    const [bookingRows] = (await conn.query(
        'SELECT activity_id, game_id FROM organizer_bookings WHERE id = ?',
        [bookingId]
    )) as any;
    if (bookingRows.length === 0) return null;

    const { activity_id: activityId, game_id: bookingGameId } = bookingRows[0];

    const [gameRows] = (await conn.query(
        "SELECT id FROM activity_games WHERE activity_id = ? AND status = 'active' ORDER BY id ASC",
        [activityId]
    )) as any;

    if (gameRows.length === 0) {
        return bookingGameId ? Number(bookingGameId) : null;
    }

    return Number(gameRows[groupIndex % gameRows.length].id);
}

export async function assignParticipantToGroup(
    conn: PoolConnection,
    bookingId: number | string,
    participantId: number,
    email: string
): Promise<{ groupId: number; groupName: string; alreadyVerified: boolean }> {
    const [verifiedRows] = (await conn.query(
        `SELECT id, group_id
         FROM game_participants
         WHERE email = ? AND booking_id = ? AND email_verified_at IS NOT NULL`,
        [email, bookingId]
    )) as any;

    if (verifiedRows.length > 0 && verifiedRows[0].group_id) {
        const [groupInfo] = (await conn.query(
            'SELECT id, group_name FROM game_groups WHERE id = ?',
            [verifiedRows[0].group_id]
        )) as any;
        return {
            groupId: verifiedRows[0].group_id,
            groupName: groupInfo[0]?.group_name ?? 'Group',
            alreadyVerified: true,
        };
    }

    const limits = await getBookingLimits(bookingId);
    if (!limits) {
        throw new AppError('Booking not found', 404);
    }

    const [groupRows] = (await conn.query(
        `SELECT g.id, g.group_name,
            (SELECT COUNT(*) FROM game_participants
             WHERE group_id = g.id AND email_verified_at IS NOT NULL) as member_count
         FROM game_groups g
         WHERE g.booking_id = ?
         ORDER BY g.id ASC`,
        [bookingId]
    )) as any;

    const groups = groupRows as GroupRow[];
    // Group capacity is admin-configured per activity (activities.group_size).
    const availableGroup = groups.find((g) => Number(g.member_count) < limits.playersPerGroup);

    let groupId: number;
    let groupName: string;

    if (availableGroup) {
        groupId = availableGroup.id;
        groupName = availableGroup.group_name;
    } else {
        if (limits.maxGroups > 0 && groups.length >= limits.maxGroups) {
            throw new AppError(
                'All groups are full for this event. No additional participants can join.',
                403
            );
        }

        const nextGroupNum = groups.length + 1;
        groupName = `Group ${nextGroupNum}`;

        const gameId = await resolveGameForGroup(conn, bookingId, groups.length);

        const [newGroup] = (await conn.query(
            'INSERT INTO game_groups (booking_id, game_id, group_name, status) VALUES (?, ?, ?, ?)',
            [bookingId, gameId, groupName, 'waiting']
        )) as any;
        groupId = newGroup.insertId;
        // The id may have been used by an earlier (since-deleted) group whose timers,
        // questions, sessions etc. were left behind. Clear them now so this new game
        // doesn't inherit an old, already-expired clock (fresh game opening on
        // Investigation at 00:00) or old players/answers.
        await clearStaleDataForNewGroup(conn, groupId);
    }

    await conn.query('UPDATE game_participants SET group_id = ? WHERE id = ?', [groupId, participantId]);

    return { groupId, groupName, alreadyVerified: false };
}

export async function assertCanStartJoin(bookingId: number | string, email: string): Promise<void> {
    try {
        await assertCanJoinBooking(bookingId, email);
    } catch (err: any) {
        throw new AppError(err.message, err.statusCode ?? 403);
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
export async function assertBrowserNotBoundToOtherParticipant(
    browserToken: unknown,
    bookingId: number | string,
    email: string
): Promise<void> {
    if (typeof browserToken !== 'string' || !/^[a-f0-9]{64}$/.test(browserToken)) return;

    const [rows] = await query(
        `SELECT gp.booking_id, LOWER(gp.email) AS email, gp.name
         FROM game_participants gp
         JOIN game_groups gg ON gg.id = gp.group_id
         JOIN organizer_bookings ob ON ob.id = gp.booking_id
         WHERE gp.join_token = ?
           AND gp.email_verified_at IS NOT NULL
           AND gp.status <> 'finished'
           AND gg.status NOT IN ('completed', 'incomplete', 'finished')
           AND (ob.scheduled_date IS NULL OR ob.scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 1 DAY))
         LIMIT 1`,
        [browserToken]
    );
    if (rows.length === 0) return;

    const bound = rows[0] as { booking_id: number; email: string; name: string };
    const sameParticipant =
        String(bound.booking_id) === String(bookingId) && bound.email === email.trim().toLowerCase();
    if (sameParticipant) return;

    throw new AppError(
        `This browser is already joined to an active game as ${bound.name}. ` +
            'Leave that game or wait for it to end before joining as a different participant.',
        409
    );
}
