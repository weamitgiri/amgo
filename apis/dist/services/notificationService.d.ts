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
export declare function assertOrganizerBooking(bookingId: number | string, organizerId: number | string): Promise<void>;
export declare function getNotifications(bookingId: number | string, organizerId: number | string, options?: {
    limit?: number;
    offset?: number;
}): Promise<NotificationListResult>;
export declare function markAllNotificationsRead(bookingId: number | string, organizerId: number | string): Promise<number>;
export declare function emitOrganizerNotification(io: any, bookingId: number | string, notification: OrganizerNotification, unreadCount: number): Promise<void>;
export declare function notifyParticipantJoined(io: any, bookingId: number | string, participant: {
    id: number;
    name: string;
}, group: {
    id: number;
    name: string;
}): Promise<void>;
