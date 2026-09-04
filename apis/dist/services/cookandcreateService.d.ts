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
    round2_phase: 'submit' | 'review';
    /** 0-based position in the group's join order whose Round-2 turn it is; null before Round 2. */
    round2_turn_index: number | null;
    round2_turn_started_at: string | null;
    /** When the review sub-phase opened — anchors the review countdown. */
    round2_review_started_at: string | null;
    double_down_participant_id: number | null;
    double_down_status: 'offered' | 'accepted' | 'declined' | null;
};
/**
 * Get the ingredient pool for a specific template — via cc_game_template_ingredients,
 * not cc_ingredients.activity_id. The admin Template form already lets an admin pick
 * which ingredients belong to a template (so different games CAN have different
 * ingredient sets); this makes gameplay actually respect that pick instead of
 * ignoring it. (Previously filtered by activity_id, which was hardcoded to a single
 * orphaned default activity on cc_ingredients and returned zero rows for every real
 * Cook & Create booking — see git history for the incident.)
 */
export declare function getCCIngredients(templateId: number | string): Promise<CCIngredient[]>;
/**
 * Get template by activity_game_id
 */
export declare function getCCTemplateByGameId(activityGameId: number | string): Promise<CCGameTemplate | null>;
/**
 * Get template by its own id (any status — used by admin/instance lookups).
 */
export declare function getCCTemplateById(templateId: number | string): Promise<CCGameTemplate | null>;
/**
 * Get a CC instance (+ its template) by instance id. Used by the round-completion
 * checks and timer-expiry handlers, which only have instance_id/group_id on hand.
 */
export declare function getInstanceById(instanceId: number | string): Promise<{
    instance: CCGameInstance;
    template: CCGameTemplate;
} | null>;
/** Turn 0 -> 'A', turn 1 -> 'B', ... Group size is capped well under 26. */
export declare function round2StepLetter(turnIndex: number): string;
/**
 * Back-fills round2_review_started_at for a round that entered review before
 * that column existed, which would otherwise render its countdown as 00:00.
 *
 * Derived from the review timer that is actually running (expiry minus the
 * configured review length) rather than simply stamping "now", so the clock the
 * players see matches the moment the server will really close the phase.
 */
export declare function ensureRound2ReviewStartedAt(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Repairs a Round-2 instance that has no turn state.
 *
 * Any game that was already mid-Round-2 when turn-based submission shipped has
 * round2_turn_index / round2_turn_order NULL. Under the turn rules that means
 * no turn is ever open, so every submission is rejected and no turn timer runs
 * — the group is stuck with nothing to advance it. This heals such an instance
 * on the next state read.
 *
 * Steps already submitted keep their existing letters: the recovered order puts
 * their authors first, in that letter order, and shuffles only the players who
 * have yet to go. Resuming at the count of existing steps therefore hands the
 * turn to the first player who hasn't submitted, exactly where the round left off.
 */
export declare function ensureRound2TurnState(instanceId: number | string, groupId: number | string): Promise<void>;
export declare function getRound2TurnParticipantId(instanceId: number | string, groupId: number | string, turnIndex: number | null): Promise<number | null>;
export declare function getRound2TurnCount(instanceId: number | string, groupId: number | string): Promise<number>;
/** Where THIS participant sits in the hidden turn order (null if not playing). */
export declare function getMyRound2TurnIndex(instanceId: number | string, groupId: number | string, participantId: number | null): Promise<number | null>;
/**
 * Starts (or restarts) the single active timer for a Cook & Create group's
 * current phase, on the same shared `timers` table Mystery's timerService polls
 * every 5s. Only one cc_* timer is ever active per group — unlike Mystery's
 * timers (several run in parallel), CC's rounds are strictly sequential, so
 * starting a new one first deactivates whatever cc_* timer was running before.
 * That guards against a stale timer firing after the round already advanced
 * via the "everyone finished early" fast path (see checkRound1Completion etc).
 */
export declare function ensureCCTimer(groupId: number | string, instanceId: number | string, timerType: string, secs: number): Promise<void>;
/**
 * Get or create cook & create game instance for a group
 */
export declare function getOrCreateCCInstance(groupId: number | string, activityGameId: number | string | null): Promise<{
    instance: CCGameInstance;
    template: CCGameTemplate;
} | null>;
/**
 * See getOrCreateCCInstance's call site above.
 */
export declare function ensureCCParticipantSessions(groupId: number | string): Promise<void>;
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
 * Round 1 -> Round 2. Idempotent: the UPDATE...WHERE status='round1' claim
 * ensures only the first caller (the "everyone voted" fast path in
 * checkRound1Completion, or the timer expiry in timerService.ts) actually
 * applies the transition — the same claim pattern verdictScoringService.ts
 * uses for Mystery's finalizeVerdict.
 */
export declare function finalizeRound1(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Called after every round-1 vote submission — checks whether the whole group
 * has now voted and, if so, finalizes immediately instead of waiting for the
 * timer safety net.
 */
export declare function checkRound1Completion(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Save a cooking step for round 2
 */
export declare function saveRound2Step(instanceId: number | string, participantId: number | string, stepText: string, stepLetter: string): Promise<number>;
/**
 * Save a keep/remove vote for a step
 */
export declare function saveRound2StepVote(instanceId: number | string, participantId: number | string, stepId: number | string, vote: 'keep' | 'remove'): Promise<boolean>;
/**
 * Round 2 submit -> review. Idempotent claim on round2_phase.
 */
export declare function advanceRound2ToReview(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Closes the current Round-2 turn and opens the next one — or moves the whole
 * round on to review once the last player has had their turn.
 *
 * Two things race to call this: the player submitting their step (fast path)
 * and their turn timer expiring (safety net, via timerService). The
 * compare-and-set on round2_turn_index means only the first one for a given
 * turn actually advances it, so a submission landing at the same moment the
 * timer fires can't skip a player.
 *
 * A turn that expires without a step simply produces no step for that player —
 * they miss their slot, matching how Round 1 treats a missed vote.
 */
export declare function advanceRound2Turn(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Resolves every step's final keep/remove status by simple majority (a tie
 * defaults to "kept" — lenient, per the plan). Idempotent: guarded by whether
 * any step is still in 'submitted' status, so a race between the "everyone
 * voted" fast path and the review-timer expiry can't double-resolve.
 */
export declare function finalizeRound2Review(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Called after every round-2 keep/remove vote — checks whether every
 * participant has now voted on every submitted step.
 */
export declare function checkRound2ReviewCompletion(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Save a chat message for round 3
 */
export declare function saveRound3Message(instanceId: number | string, participantId: number | string, message: string, isImpostorPrivate?: boolean): Promise<number>;
/**
 * Save an impostor vote for round 3
 */
export declare function saveRound3ImpostorVote(instanceId: number | string, participantId: number | string, votedForId: number | string): Promise<void>;
/**
 * Starts the Round 3 discussion timer. Called once the Show Host names the
 * dish and the instance transitions to round3_discussion (see
 * cookandcreateController.submitDishName).
 */
export declare function startRound3DiscussionTimer(groupId: number | string, instanceId: number | string): Promise<void>;
/**
 * Round 3 discussion -> voting. Timer-driven only — unlike the other rounds,
 * open-ended group chat has no natural "everyone's done" signal, so this is
 * called exclusively from timerService's cc_round3_discussion case (still
 * idempotent via the status claim, matching every other transition here).
 */
export declare function advanceRound3ToVoting(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Records the targeted participant's Accept/Decline response to the Double
 * Down offer. Idempotent — only the first response is honored.
 */
export declare function respondToDoubleDown(instanceId: number | string, participantId: number | string, accept: boolean): Promise<void>;
/**
 * Round 3 finalize & reveal. Idempotent claim on status. Also marks the parent
 * game_groups row completed (same 1-hour retention window Mystery uses) —
 * that's what makes the group show up in the organizer's existing Results tab
 * (organizerController.getOrganizerResults, already generic — no changes
 * needed there) and enter the existing retention-purge sweep.
 */
export declare function finalizeRound3(instanceId: number | string, groupId: number | string): Promise<void>;
/**
 * Called after every round-3 impostor vote — checks whether everyone (impostor
 * included, they vote too per the game design) has now voted.
 */
export declare function checkRound3VotingCompletion(instanceId: number | string, groupId: number | string): Promise<void>;
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
/**
 * Admin-editable game rules for the lobby screen (Laravel admin: Cook &
 * Create > Templates), same shape/pattern as Mystery's game_rules.
 */
export declare function getCCRules(templateId: number | string): Promise<{
    id: number;
    rule_text: string;
    order: number;
}[]>;
export type CCOtherDish = {
    group_id: number;
    group_name: string;
    dish_name: string;
    nomination_counts: Record<string, number>;
    /** The dish's final recipe — its kept Round-2 steps, in order. */
    steps: {
        letter: string;
        text: string;
    }[];
};
/**
 * Up to 3 random *other* completed groups in the same booking, excluding any
 * group this participant has already nominated in any category — so the pool
 * naturally shrinks to unseen groups as the participant keeps rating.
 */
export declare function getOtherDishes(groupId: number | string, participantId: number | string): Promise<CCOtherDish[]>;
/**
 * Records one participant's award nomination for another group's dish.
 * One nomination per (participant, rated group, category) — re-tapping the
 * same category for the same group is a harmless idempotent no-op via the
 * unique key added in schemaHelpers.ts.
 */
export declare function submitRating(instanceId: number | string, participantId: number | string, ratedGroupId: number | string, categoryId: number | string): Promise<void>;
export type CCAwardEntry = {
    group_id: number;
    group_name: string;
    dish_name: string | null;
    awards: {
        category_id: number;
        category_name: string;
        emoji: string | null;
        slug: string;
    }[];
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
/**
 * The Final Results / Leaderboard board: every completed group in this
 * group's booking, plus whichever award category each one leads (most
 * nominations wins; earliest cc_game_instances.finished_at breaks ties),
 * plus this group's own impostor reveal.
 */
export declare function getAwards(groupId: number | string): Promise<CCAwardsBoard | null>;
