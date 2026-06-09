export type JoinLinkResponse = {
  booking_id: number | string;
  activity_id: number | string;
  activity_title: string;
  activity_slug?: string;
  activity_description?: string | null;
  organizer_name?: string;
  organizer_company?: string;
  scheduled_date: string;
  scheduled_time: string;
  schedule_start: string;
  join_window_ends_at: string;
  is_pending: boolean;
  is_join: boolean;
  is_active: boolean;
};

export type ParticipantJoinPayload = {
  booking_id: number;
  name: string;
  email: string;
};

export type ParticipantVerifyOtpPayload = {
  booking_id: number;
  email: string;
  otp: string;
};

export type ParticipantVerifyOtpResponse = {
  participant_id: number;
  name: string;
  join_token: string;
  group_id: number;
  group_name: string;
};

export type LobbyMember = {
  id: number;
  name: string;
  status: string;
  is_you: boolean;
};

export type LobbySessionResponse = {
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
  rules: { id: number; rule_text: string; order: number }[];
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
  lobby_phase: "before_start" | "waiting_members" | "lobby_timer" | "ready";
  lobby_countdown_seconds: number | null;
  game_starts_at: string | null;
  can_start_game: boolean;
  status_message: string;
};

/** @deprecated Use LobbySessionResponse */
export type LobbyInfoResponse = LobbySessionResponse;

export type GameSummaryRole = {
  id: number;
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
};

export type GameSummaryResponse = {
  group_id: number;
  participant: { id: number; name: string };
  activity: { title: string; slug: string };
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
    timeline: { time: string; event: string }[];
    quick_facts: { label: string; value: string; icon: string }[];
  };
  roles: GameSummaryRole[];
  photos: { id: number; label: string; image: string | null }[];
  rules: { id: number; title: string; description: string; details: string[] }[];
  strategy_slides: { title: string; description: string; details: string[] }[];
  clues: {
    id: number;
    clue_title: string;
    clue_short_description: string | null;
    clue_detail: string | null;
    clue_image: string | null;
  }[];
};
