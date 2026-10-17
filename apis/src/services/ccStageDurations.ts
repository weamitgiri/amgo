/**
 * The static Cook & Create stage durations (seconds) are one global set shared
 * by every template — cc_stage_durations (single row, id = 1), edited from the
 * admin template form. The lobby wait is also copied to every Cook & Create
 * activity (activities.lobby_wait_secs, read by the join/lobby code); the eight
 * in-game durations below are snapshotted onto each game when it is created
 * (cc_game_instances.stage_durations), so a game in progress keeps the
 * durations it started with while new games use the latest values.
 */
export const CC_GAME_DURATION_FIELDS = [
    'role_brief_secs',
    'round1_timer_secs',
    'round1_results_secs',
    'round2_submit_timer_secs',
    'round2_review_timer_secs',
    'round3_discussion_timer_secs',
    'round3_voting_timer_secs',
    'dish_naming_secs',
] as const;

export type CCGameDurations = Record<(typeof CC_GAME_DURATION_FIELDS)[number], number>;

/**
 * The template with its in-game durations replaced by the game's own snapshot
 * (cc_game_instances.stage_durations), when the game has one.
 */
export function withGameDurations<T extends Partial<CCGameDurations>>(template: T, instanceRow: any): T {
    let snapshot = instanceRow?.stage_durations;
    if (typeof snapshot === 'string') {
        try { snapshot = JSON.parse(snapshot); } catch { snapshot = null; }
    }
    if (!snapshot || typeof snapshot !== 'object') return template;

    const result: any = { ...template };
    for (const f of CC_GAME_DURATION_FIELDS) {
        const v = Number(snapshot[f]);
        if (Number.isFinite(v) && v > 0) result[f] = v;
    }
    return result;
}
