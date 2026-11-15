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
/**
 * Self-heal a group whose Case Summary has ended but whose Questioning phase never
 * started — i.e. the questioning + clue_room timers were never created (the process
 * was down for the 5-second tick that should have advanced it, so the game sits at
 * 00:00 forever). Safe to call from getGameState on every load: a cheap unlocked
 * pre-check returns immediately in the normal case (a questioning timer already
 * exists), and the actual repair is serialised by a lock and re-checked, so it can
 * never race the timer service into duplicate timers.
 */
export declare function recoverMissedQuestioningPhase(groupId: number | string): Promise<void>;
/**
 * DEV / TESTING ONLY — skip the current phase's timer so the next screen opens
 * without waiting out the clock. If the game hasn't started yet it starts it;
 * otherwise it expires the current active phase timer and runs its transition
 * immediately (Lie Detector round → Case Summary → Questioning → Final Verdict →
 * Results). Wire this behind a button you remove before production.
 */
export declare function devAdvancePhase(groupId: number | string): Promise<{
    advanced: string | null;
}>;
