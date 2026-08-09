export type CCIngredient = {
    id: number;
    name: string;
    image_url: string | null;
    is_absurd: boolean;
};
export type CCGameTemplate = {
    id: number;
    activity_game_id: number;
    name: string;
    tagline: string | null;
    description: string | null;
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
export type CCGameInstance = {
    id: number;
    group_id: number;
    template_id: number;
    status: 'waiting' | 'round1' | 'round2' | 'round3_discussion' | 'round3_voting' | 'completed';
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
/**
 * Get default ingredients for Cook & Create activity
 */
export declare function getCCIngredients(activityId?: number | string): Promise<CCIngredient[]>;
/**
 * Get template by activity_game_id
 */
export declare function getCCTemplateByGameId(activityGameId: number | string): Promise<CCGameTemplate | null>;
/**
 * Get or create cook & create game instance for a group
 */
export declare function getOrCreateCCInstance(groupId: number | string, activityGameId: number | string | null): Promise<{
    instance: CCGameInstance;
    template: CCGameTemplate;
} | null>;
/**
 * Assign random roles (impostor, show host, chefs) to participants
 */
export declare function assignCCRoles(instanceId: number | string, participantIds: number[]): Promise<{
    impostorId: number | null;
    showHostId: number | null;
}>;
/**
 * Save ingredient votes for round 1
 */
export declare function saveRound1Votes(instanceId: number | string, participantId: number | string, ingredientIds: number[]): Promise<boolean>;
/**
 * Calculate round 1 results and save top N ingredients
 */
export declare function calculateRound1Results(instanceId: number | string, topCount: number): Promise<{
    ingredientId: number;
    count: number;
}[]>;
/**
 * Save a cooking step for round 2
 */
export declare function saveRound2Step(instanceId: number | string, participantId: number | string, stepText: string, stepLetter: string): Promise<number>;
/**
 * Save a keep/remove vote for a step
 */
export declare function saveRound2StepVote(instanceId: number | string, participantId: number | string, stepId: number | string, vote: 'keep' | 'remove'): Promise<boolean>;
/**
 * Save a chat message for round 3
 */
export declare function saveRound3Message(instanceId: number | string, participantId: number | string, message: string, isImpostorPrivate?: boolean): Promise<number>;
/**
 * Save an impostor vote for round 3
 */
export declare function saveRound3ImpostorVote(instanceId: number | string, participantId: number | string, votedForId: number | string): Promise<void>;
/**
 * Get rating categories
 */
export declare function getCCRatingCategories(): Promise<{
    id: number;
    name: string;
    slug: string;
    emoji: string | null;
    description: string | null;
}[]>;
