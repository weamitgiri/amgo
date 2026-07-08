import { query } from '../config/db';
import { AppError } from '../utils/AppError';

const PLAYERS_PER_GROUP = 5;

export type OrganizerNotification = {
    id: number;
    booking_id: number;
    type: string;
    message: string;
    dot_color: string;
    participant_id: number | null;
    group_id: number | null;
    is_read: boolean;
    created_at: string;
};

export type NotificationListResult = {
    notifications: OrganizerNotification[];
    unread_count: number;
    total: number;
};

function mapRow(row: any): OrganizerNotification {
    return {
        id: Number(row.id),
        booking_id: Number(row.booking_id),
        type: row.type,
        message: row.message,
        dot_color: row.dot_color || 'emerald',
        participant_id: row.participant_id != null ? Number(row.participant_id) : null,
        group_id: row.group_id != null ? Number(row.group_id) : null,
        is_read: Boolean(row.is_read),
        created_at: row.created_at,
    };
}

export async function assertOrganizerBooking(
    bookingId: number | string,
    organizerId: number | string
): Promise<void> {
    const [rows] = await query(
        'SELECT id FROM organizer_bookings WHERE id = ? AND organizer_id = ? LIMIT 1',
        [bookingId, organizerId]
    );
    if (rows.length === 0) {
        throw new AppError('Booking not found', 404);
    }
}

async function insertNotification(input: {
    bookingId: number | string;
    organizerId: number | string;
    type: string;
    message: string;
    dotColor: string;
    participantId?: number | null;
    groupId?: number | null;
}): Promise<OrganizerNotification | null> {
    const [, header] = await query(
        `INSERT INTO organizer_notifications
            (booking_id, organizer_id, type, message, dot_color, participant_id, group_id, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
        [
            input.bookingId,
            input.organizerId,
            input.type,
            input.message,
            input.dotColor,
            input.participantId ?? null,
            input.groupId ?? null,
        ]
    );

    const insertId = (header as any)?.insertId;
    if (!insertId) return null;

    const [rows] = await query('SELECT * FROM organizer_notifications WHERE id = ?', [insertId]);
    return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function getNotifications(
    bookingId: number | string,
    organizerId: number | string,
    options: { limit?: number; offset?: number } = {}
): Promise<NotificationListResult> {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const [countRows] = await query(
        'SELECT COUNT(*) as total FROM organizer_notifications WHERE booking_id = ? AND organizer_id = ?',
        [bookingId, organizerId]
    );
    const [unreadRows] = await query(
        'SELECT COUNT(*) as total FROM organizer_notifications WHERE booking_id = ? AND organizer_id = ? AND is_read = 0',
        [bookingId, organizerId]
    );
    const [rows] = await query(
        `SELECT * FROM organizer_notifications
         WHERE booking_id = ? AND organizer_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT ? OFFSET ?`,
        [bookingId, organizerId, limit, offset]
    );

    return {
        notifications: rows.map(mapRow),
        unread_count: Number(unreadRows[0]?.total ?? 0),
        total: Number(countRows[0]?.total ?? 0),
    };
}

export async function markAllNotificationsRead(
    bookingId: number | string,
    organizerId: number | string
): Promise<number> {
    const [, header] = await query(
        'UPDATE organizer_notifications SET is_read = 1 WHERE booking_id = ? AND organizer_id = ? AND is_read = 0',
        [bookingId, organizerId]
    );
    return Number((header as any)?.affectedRows ?? 0);
}

export async function emitOrganizerNotification(
    io: any,
    bookingId: number | string,
    notification: OrganizerNotification,
    unreadCount: number
): Promise<void> {
    if (!io) return;
    io.to(`organizer_${bookingId}`).emit('organizer_notification', {
        notification,
        unread_count: unreadCount,
    });
}

export async function notifyParticipantJoined(
    io: any,
    bookingId: number | string,
    participant: { id: number; name: string },
    group: { id: number; name: string }
): Promise<void> {
    const [bookingRows] = await query(
        'SELECT organizer_id FROM organizer_bookings WHERE id = ? LIMIT 1',
        [bookingId]
    );
    if (bookingRows.length === 0) return;

    const organizerId = bookingRows[0].organizer_id;
    const displayGroup = group.name?.trim() || `Group ${group.id}`;

    const notification = await insertNotification({
        bookingId,
        organizerId,
        type: 'participant_joined',
        message: `${participant.name} joined ${displayGroup}`,
        dotColor: 'emerald',
        participantId: participant.id,
        groupId: group.id,
    });

    if (!notification) return;

    const { unread_count } = await getNotifications(bookingId, organizerId, { limit: 1 });
    await emitOrganizerNotification(io, bookingId, notification, unread_count);

    const [countRows] = await query(
        `SELECT COUNT(*) as total FROM game_participants
         WHERE group_id = ? AND email_verified_at IS NOT NULL`,
        [group.id]
    );
    const memberCount = Number(countRows[0]?.total ?? 0);

    // Group capacity is admin-configured per activity (activities.group_size).
    const [sizeRows] = await query(
        `SELECT a.group_size FROM organizer_bookings ob
         JOIN activities a ON a.id = ob.activity_id WHERE ob.id = ? LIMIT 1`,
        [bookingId]
    );
    const playersPerGroup = Number(sizeRows[0]?.group_size) || PLAYERS_PER_GROUP;

    if (memberCount >= playersPerGroup) {
        await notifyGroupComplete(io, bookingId, organizerId, group.id, displayGroup);
    }
}

async function notifyGroupComplete(
    io: any,
    bookingId: number | string,
    organizerId: number | string,
    groupId: number,
    groupName: string
): Promise<void> {
    const notification = await insertNotification({
        bookingId,
        organizerId,
        type: 'group_complete',
        message: `${groupName} is now complete`,
        dotColor: 'primary',
        groupId,
    });

    if (!notification) return;

    const { unread_count } = await getNotifications(bookingId, organizerId, { limit: 1 });
    await emitOrganizerNotification(io, bookingId, notification, unread_count);
}
