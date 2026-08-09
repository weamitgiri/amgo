/**
 * Timer Service
 * Periodically checks for expired timers and triggers game state transitions.
 */
export declare const startTimerService: () => void;
/**
 * Starts the game clock for a group by creating its initial case_summary timer.
 * Idempotent — safe to call from every lobby poll / game-summary load; only the
 * first call after game start actually inserts the timer.
 */
export declare function ensureCaseSummaryTimer(groupId: number | string, caseSummarySecs: number): Promise<void>;
