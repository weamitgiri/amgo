export type GameSummaryPayload = {
    group_id: number;
    participant: {
        id: number;
        name: string;
    };
    activity: {
        title: string;
        slug: string;
    };
    settings: {
        case_summary_view_secs: number;
        game_duration_secs: number;
        max_questions: number;
        question_response_secs: number;
        clue_room_unlock_secs: number;
        strategy_guide_delay_secs: number;
        lie_detector_enabled: boolean;
        lie_detector_max_questions: number;
        lie_detector_timer_secs: number;
        no_response_penalty: number;
    };
    game: {
        id: number;
        title: string;
        tagline: string | null;
        case_summary_html: string | null;
        timeline: {
            time: string;
            event: string;
        }[];
        quick_facts: {
            label: string;
            value: string;
            icon: string;
        }[];
        victim_name: string | null;
    };
    players: {
        session_id: number;
        pseudonym: string;
        is_you: boolean;
    }[];
    roles: {
        id: number;
        session_id: number | null;
        role_type: string;
        role_label: string;
        role_subtitle: string;
        name: string;
        short: string;
        grad: string;
        objective: string;
        you_know: string[];
        keep_in_mind: string[];
        role_image: string | null;
        is_you: boolean;
    }[];
    photos: {
        id: number;
        label: string;
        image: string | null;
    }[];
    clues: {
        id: number;
        clue_title: string;
        clue_short_description: string | null;
        clue_detail: string | null;
        clue_image: string | null;
    }[];
    rules: {
        id: number;
        title: string;
        description: string;
        details: string[];
    }[];
    role_strategy_slides: {
        title: string;
        description: string;
        details: string[];
    }[];
    strategy_slides: {
        title: string;
        description: string;
        details: string[];
        appears_at_secs: number;
        closes_at_secs: number;
    }[];
};
export declare function buildGameSummaryPayload(groupId: number | string, participantId?: number | string | null): Promise<GameSummaryPayload | null>;
