export type CCIngredient = {
  id: number;
  name: string;
  image_url: string | null;
  is_absurd: boolean;
};

export type CCTemplate = {
  id: number;
  activity_game_id: number;
  name: string;
  tagline: string | null;
  description: string | null;
  background_image: string | null;
  chef1_image: string | null;
  chef2_image: string | null;
  chef3_image: string | null;
  chef4_image: string | null;
  show_host_image: string | null;
  round1_ingredients_count: number;
  round1_votes_per_player: number;
  round1_top_ingredients: number;
  round1_timer_secs: number;
  round2_step_max_chars: number;
  round2_submit_timer_secs: number;
  round2_review_timer_secs: number;
  round3_discussion_timer_secs: number;
  round3_voting_timer_secs: number;
  round3_max_messages_per_player: number;
  show_host_role_enabled: boolean;
  impostor_bias_card_text: string | null;
};

export type CCInstance = {
  id: number;
  group_id: number;
  template_id: number;
  status: "waiting" | "round1" | "round2" | "round3_discussion" | "round3_voting" | "completed";
  round2_phase: "submit" | "review";
  round2_turn_index: number | null;
  round2_turn_started_at: string | null;
  round2_review_started_at: string | null;
  impostor_participant_id: number | null;
  show_host_participant_id: number | null;
  dish_name: string | null;
  dish_named_by_participant_id: number | null;
  round1_started_at: string | null;
  round2_started_at: string | null;
  round3_discussion_started_at: string | null;
  round3_voting_started_at: string | null;
  finished_at: string | null;
  group_won: boolean | null;
  double_down_participant_id: number | null;
  double_down_status: "offered" | "accepted" | "declined" | null;
};

export type CCParticipant = {
  id: number;
  name: string;
  isYou: boolean;
  status: string;
  role_label: string;
};

export type CCSelectedIngredient = {
  id: number;
  name: string;
  image_url: string | null;
  is_absurd: boolean;
  vote_count: number;
  rank: number;
};

export type CCCookingStep = {
  id: number;
  letter: string;
  text: string;
  status: "submitted" | "kept" | "removed";
  keep_votes: number;
  remove_votes: number;
};

export type CCSchedule = {
  scheduled_start_at: string | null;
  /** When the lobby's entry window closes and play begins. */
  game_starts_at: string | null;
  game_ends_at: string | null;
  lobby_wait_secs: number;
  game_duration_secs: number;
  /** Server's clock at response time — lets the client cancel out local clock skew. */
  server_time: string;
};

export type CCRound2TurnStep = {
  letter: string;
  status: "submitted" | "current" | "awaiting" | "missed";
};

/**
 * Anonymous by design — it says which step letter is being written and which
 * are done, never who is writing them. Only your OWN position is revealed
 * (is_my_turn / my_turn_index).
 */
export type CCRound2Turn = {
  total: number;
  current_index: number | null;
  started_at: string | null;
  turn_secs: number;
  is_my_turn: boolean;
  my_turn_index: number | null;
  steps: CCRound2TurnStep[];
};

export type CCChatMessage = {
  id: number;
  participant_id: number;
  participant_name: string;
  is_you: boolean;
  message: string;
  is_impostor_private: boolean;
  created_at: string;
};

export type CCImpostorVoteCount = {
  voted_for_participant_id: number;
  count: number;
};

export type CCRatingCategory = {
  id: number;
  name: string;
  slug: string;
  emoji: string | null;
  description: string | null;
};

export type CCClue = {
  id: number;
  text: string;
  round_number: number;
};

export type CCRule = {
  id: number;
  rule_text: string;
  order: number;
};

export type CCGameStateResponse = {
  instance: CCInstance;
  template: CCTemplate;
  participants: CCParticipant[];
  submitted_participant_ids: number[];
  my_participant: CCParticipant | null;
  my_role: string | null;
  my_role_label: string | null;
  is_impostor: boolean;
  is_show_host: boolean;
  impostor_bias_card: string | null;
  // Round 1
  all_ingredients: CCIngredient[];
  my_ingredient_votes: number[];
  ingredient_vote_counts: Record<number, number>;
  selected_ingredients: CCSelectedIngredient[];
  // Round 2
  cooking_steps: CCCookingStep[];
  my_cooking_step: string | null;
  my_step_votes: Record<number, "keep" | "remove">;
  /** Turn-based step submission. Null outside the Round-2 submit phase. */
  round2_turn: CCRound2Turn | null;
  released_clues: CCClue[];
  // Round 3
  chat_messages: CCChatMessage[];
  my_impostor_vote: number | null;
  impostor_vote_counts: CCImpostorVoteCount[];
  // Ratings
  rating_categories: CCRatingCategory[];
  // Dish
  dish_name: string | null;
  // Admin-editable game rules (lobby screen)
  rules: CCRule[];
  /**
   * Absolute instants for the lobby / header countdowns. Sent as points in time
   * rather than durations so a page refresh recomputes the same remainder
   * instead of restarting the clock.
   */
  schedule: CCSchedule;
  // Round 3 Double Down — only populated for the participant who was offered it
  my_double_down: { offered: boolean; status: "offered" | "accepted" | "declined" | null } | null;
};

export type CCOtherDish = {
  group_id: number;
  group_name: string;
  dish_name: string;
  nomination_counts: Record<string, number>;
  /** The dish's final recipe — its kept Round-2 steps, in order. */
  steps: { letter: string; text: string }[];
};

export type CCAward = {
  category_id: number;
  category_name: string;
  emoji: string | null;
  slug: string;
};

export type CCAwardEntry = {
  group_id: number;
  group_name: string;
  dish_name: string | null;
  awards: CCAward[];
};

export type CCAwardsBoard = {
  groups: CCAwardEntry[];
  my_group: {
    impostor_participant_id: number | null;
    most_voted_participant_id: number | null;
    group_won: boolean | null;
    dish_name: string | null;
    double_down_participant_id: number | null;
    double_down_used: boolean;
    double_down_penalty_applied: boolean;
    /** How many nominations this group's dish received, per category slug. */
    reaction_counts: Record<string, number>;
  };
};
