import type { PoolConnection } from 'mysql2/promise';
import { query } from '../config/db';
import moment from 'moment';

const PLAYERS_PER_GROUP = 5;

export type EventStatsPayload = {
    event_progress: {
        participants_joined: number;
        max_participants: number;
        groups_formed: number;
        max_groups: number;
        remaining_to_form_group: number;
        access_link_clicks: number | null;
    };
    event_status: {
        scheduled_at: string;
        reschedule_cutoff: string;
        is_reschedule_allowed: boolean;
        min_players_per_group: number;
    };
    recent_groups: Array<{
        id: number;
        name: string;
        fill_status: string;
        is_complete: boolean;
    }>;
    recent_participants: Array<{
        name: string;
        email: string;
        joined_at: string | null;
        group_id: number | null;
        group_name: string | null;
    }>;
    participants: Array<{
        id: number;
        name: string;
        email: string;
        joined_at: string | null;
        group_id: number | null;
        group_name: string | null;
    }>;
    groups: Array<{
        id: number;
        name: string;
        team_lead: string | null;
        member_count: number;
        capacity: number;
        status: 'Complete' | 'In Progress' | 'Pending';
        last_updated: string | null;
        members: Array<{ id: number; name: string; initials: string }>;
    }>;
};

function initialsFromName(name: string): string {
    return String(name || '')
        .trim()
        .split(/\s+/)
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';
}

function groupStatus(memberCount: number): 'Complete' | 'In Progress' | 'Pending' {
    if (memberCount >= PLAYERS_PER_GROUP) return 'Complete';
    if (memberCount > 0) return 'In Progress';
    return 'Pending';
}

export type BookingLimits = {
    maxUsers: number;
    maxGroups: number;
    playersPerGroup: number;
};

export async function getBookingLimits(bookingId: number | string): Promise<BookingLimits | null> {
    const [rows] = await query(
        `SELECT p.max_users, p.total_groups
         FROM organizer_bookings ob
         JOIN packages p ON ob.package_id = p.id
         WHERE ob.id = ?`,
        [bookingId]
    );

    if (rows.length === 0) return null;

    return {
        maxUsers: Number(rows[0].max_users) || 0,
        maxGroups: Number(rows[0].total_groups) || 0,
        playersPerGroup: PLAYERS_PER_GROUP,
    };
}

export async function countVerifiedParticipants(
    bookingId: number | string,
    conn?: PoolConnection
): Promise<number> {
    const sql =
        'SELECT COUNT(*) as total FROM game_participants WHERE booking_id = ? AND email_verified_at IS NOT NULL';
    const params = [bookingId];

    if (conn) {
        const [rows] = (await conn.query(sql, params)) as any;
        return Number(rows[0]?.total ?? 0);
    }

    const [rows] = await query(sql, params);
    return Number(rows[0]?.total ?? 0);
}

export async function isParticipantVerified(
    bookingId: number | string,
    email: string,
    conn?: PoolConnection
): Promise<boolean> {
    const normalizedEmail = String(email).trim().toLowerCase();
    const sql =
        'SELECT id FROM game_participants WHERE booking_id = ? AND LOWER(email) = ? AND email_verified_at IS NOT NULL LIMIT 1';
    const params = [bookingId, normalizedEmail];

    if (conn) {
        const [rows] = (await conn.query(sql, params)) as any;
        return rows.length > 0;
    }

    const [rows] = await query(sql, params);
    return rows.length > 0;
}

export async function assertCanJoinBooking(
    bookingId: number | string,
    email: string,
    conn?: PoolConnection
): Promise<BookingLimits> {
    const limits = await getBookingLimits(bookingId);
    if (!limits) {
        throw new Error('Booking not found');
    }

    if (limits.maxUsers <= 0) {
        return limits;
    }

    const alreadyVerified = await isParticipantVerified(bookingId, email, conn);
    if (alreadyVerified) {
        return limits;
    }

    const verifiedCount = await countVerifiedParticipants(bookingId, conn);
    if (verifiedCount >= limits.maxUsers) {
        const err = new Error(
            `Join limit reached. This package allows a maximum of ${limits.maxUsers} participants.`
        );
        (err as any).statusCode = 403;
        throw err;
    }

    return limits;
}

export async function buildEventStats(bookingId: number | string): Promise<EventStatsPayload | null> {
    const [bookingRows] = await query(
        `SELECT
            ob.id, ob.link_clicks, ob.scheduled_date, ob.scheduled_time, ob.is_rescheduled,
            p.max_users, p.total_groups
         FROM organizer_bookings ob
         JOIN packages p ON ob.package_id = p.id
         WHERE ob.id = ?`,
        [bookingId]
    );

    if (bookingRows.length === 0) return null;

    const booking = bookingRows[0];
    const maxParticipants = Number(booking.max_users) || 0;
    const maxGroups = Number(booking.total_groups) || 0;

    const totalJoined = await countVerifiedParticipants(bookingId);

    const [groupRows] = await query(
        `SELECT
            g.id, g.group_name, g.status,
            (SELECT COUNT(*) FROM game_participants
             WHERE group_id = g.id AND email_verified_at IS NOT NULL) as member_count
         FROM game_groups g
         WHERE g.booking_id = ?
         ORDER BY g.id ASC`,
        [bookingId]
    );

    const groupsFormed = groupRows.filter((g: any) => Number(g.member_count) === PLAYERS_PER_GROUP).length;

    const currentIncompleteGroup = groupRows.find(
        (g: any) => Number(g.member_count) > 0 && Number(g.member_count) < PLAYERS_PER_GROUP
    );
    const membersInIncompleteGroup = currentIncompleteGroup
        ? Number(currentIncompleteGroup.member_count)
        : 0;
    const remainingToFormGroup =
        membersInIncompleteGroup > 0 ? PLAYERS_PER_GROUP - membersInIncompleteGroup : 0;

    const eventStart = moment(
        `${booking.scheduled_date} ${booking.scheduled_time}`,
        'YYYY-MM-DD HH:mm:ss'
    );
    const cutoffTime = moment(eventStart).subtract(1, 'hour');

    const [allParticipants] = await query(
        `SELECT
            p.id, p.name, p.email,
            p.email_verified_at as joined_at,
            p.group_id,
            g.group_name
         FROM game_participants p
         LEFT JOIN game_groups g ON p.group_id = g.id
         WHERE p.booking_id = ? AND p.email_verified_at IS NOT NULL
         ORDER BY p.email_verified_at DESC`,
        [bookingId]
    );

    const recentParticipants = (allParticipants as any[]).slice(0, 20);

    const groupsList = [];
    for (const g of groupRows as any[]) {
        const [memberRows] = await query(
            `SELECT id, name, email_verified_at
             FROM game_participants
             WHERE group_id = ? AND email_verified_at IS NOT NULL
             ORDER BY email_verified_at ASC`,
            [g.id]
        );

        const members = (memberRows as any[]).map((m) => ({
            id: m.id,
            name: m.name,
            initials: initialsFromName(m.name),
        }));

        const memberCount = members.length;
        const lastMember = (memberRows as any[])[memberRows.length - 1];
        const lastUpdated = lastMember?.email_verified_at ?? g.updated_at ?? g.created_at ?? null;

        groupsList.push({
            id: g.id,
            name: g.group_name,
            team_lead: members[0]?.name ?? null,
            member_count: memberCount,
            capacity: PLAYERS_PER_GROUP,
            status: groupStatus(memberCount),
            last_updated: lastUpdated,
            members,
        });
    }

    return {
        event_progress: {
            participants_joined: totalJoined,
            max_participants: maxParticipants,
            groups_formed: groupsFormed,
            max_groups: maxGroups,
            remaining_to_form_group: remainingToFormGroup,
            access_link_clicks: booking.link_clicks ?? 0,
        },
        event_status: {
            scheduled_at: `${booking.scheduled_date} ${booking.scheduled_time}`,
            reschedule_cutoff: cutoffTime.format('DD MMM YYYY, hh:mm A'),
            is_reschedule_allowed: !booking.is_rescheduled && moment().isBefore(cutoffTime),
            min_players_per_group: PLAYERS_PER_GROUP,
        },
        recent_groups: groupRows.slice(-10).map((g: any) => ({
            id: g.id,
            name: g.group_name,
            fill_status: `${g.member_count}/${PLAYERS_PER_GROUP}`,
            is_complete: Number(g.member_count) === PLAYERS_PER_GROUP,
        })),
        recent_participants: recentParticipants,
        participants: (allParticipants as any[]).map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            joined_at: p.joined_at,
            group_id: p.group_id ?? null,
            group_name: p.group_name,
        })),
        groups: groupsList,
    };
}

export async function emitEventStatsUpdate(io: any, bookingId: number | string): Promise<void> {
    if (!io) return;
    const stats = await buildEventStats(bookingId);
    if (stats) {
        io.to(`organizer_${bookingId}`).emit('event_stats_updated', stats);
    }
}
