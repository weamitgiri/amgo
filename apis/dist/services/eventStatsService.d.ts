import type { PoolConnection } from 'mysql2/promise';
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
        members: Array<{
            id: number;
            name: string;
            initials: string;
        }>;
    }>;
};
export type BookingLimits = {
    maxUsers: number;
    maxGroups: number;
    playersPerGroup: number;
};
export declare function getBookingLimits(bookingId: number | string): Promise<BookingLimits | null>;
export declare function countVerifiedParticipants(bookingId: number | string, conn?: PoolConnection): Promise<number>;
export declare function isParticipantVerified(bookingId: number | string, email: string, conn?: PoolConnection): Promise<boolean>;
export declare function assertCanJoinBooking(bookingId: number | string, email: string, conn?: PoolConnection): Promise<BookingLimits>;
export declare function buildEventStats(bookingId: number | string): Promise<EventStatsPayload | null>;
export declare function emitEventStatsUpdate(io: any, bookingId: number | string): Promise<void>;
