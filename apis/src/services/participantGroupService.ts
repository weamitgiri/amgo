import type { PoolConnection } from 'mysql2/promise';
import { AppError } from '../utils/AppError';
import { assertCanJoinBooking, getBookingLimits } from './eventStatsService';

const PLAYERS_PER_GROUP = 5;

type GroupRow = { id: number; group_name: string; member_count: number };

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
    const availableGroup = groups.find((g) => Number(g.member_count) < PLAYERS_PER_GROUP);

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

        const [newGroup] = (await conn.query(
            'INSERT INTO game_groups (booking_id, group_name, status) VALUES (?, ?, ?)',
            [bookingId, groupName, 'waiting']
        )) as any;
        groupId = newGroup.insertId;
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
