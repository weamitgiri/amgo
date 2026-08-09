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
};

export type CCOtherDish = {
  group_id: number;
  group_name: string;
  dish_name: string;
  nomination_counts: Record<string, number>;
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
  };
};
