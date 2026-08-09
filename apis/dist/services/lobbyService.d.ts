import { Moment } from 'moment';
export type LobbyMember = {
    id: number;
    name: string;
    status: string;
    is_you: boolean;
};
export type LobbyPhase = 'before_start' | 'waiting_members' | 'lobby_timer' | 'ready';
export type LobbyPayload = {
    group_id: number;
    group_name: string;
    group_status: string;
    booking_id: number;
    invitation_link: string | null;
    activity: {
        id: number;
        title: string;
        slug: string;
        description: string | null;
        cover_image: string | null;
        icon: string | null;
    };
    game: {
        id: number | null;
        title: string | null;
        tagline: string | null;
        case_summary: string | null;
    };
    rules: {
        id: number;
        rule_text: string;
        order: number;
    }[];
    settings: {
        group_size: number;
        lobby_wait_secs: number;
        game_duration_secs: number;
        max_questions: number;
        question_response_secs: number;
        clue_room_unlock_secs: number;
        lie_detector_enabled: boolean;
        lie_detector_timer_secs: number;
    };
    members: LobbyMember[];
    member_count: number;
    group_capacity: number;
    remaining_slots: number;
    is_group_full: boolean;
    scheduled_start_at: string | null;
    scheduled_start_label: string | null;
    game_redirect_at: string | null;
    lobby_phase: LobbyPhase;
    lobby_countdown_seconds: number | null;
    game_starts_at: string | null;
    can_start_game: boolean;
    status_message: string;
};
export declare function parseBookingSchedule(scheduled_date: unknown, scheduled_time: unknown): Moment | null;
export declare function buildLobbyPayload(groupId: number | string, currentParticipantId?: number | string | null): Promise<LobbyPayload | null>;
export declare function emitLobbyUpdate(io: any, groupId: number | string): Promise<void>;
