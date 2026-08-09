export type PlayerStatus = 'winner' | 'correct' | 'loser' | 'killer_wins';
/**
 * Records one participant's final accusation. Once every non-culprit role in the
 * group has submitted (or the questioning timer independently expires — see
 * timerService.ts), finalizeVerdict computes and broadcasts the outcome.
 */
export declare function submitAccusation(groupId: number | string, participantSessionId: number, accusedSessionId: number, reasoning: string): Promise<{
    accepted: true;
    all_submitted: boolean;
}>;
/**
 * Computes the final winner/loser outcome for a group, using whatever accusations
 * have been submitted so far. Any eligible role that never submitted (left mid-game,
 * or the questioning timer ran out) counts as an incorrect guess. Idempotent — safe
 * to call more than once (e.g. from both the last submission and a timer expiry
 * race); a group that's already completed/incomplete is left untouched.
 *
 * Applies the end-game VERDICT_POINTS to every player's total_score, then declares
 * the result per the spec's winner conditions: among all players who correctly
 * identified the culprit, only the highest final score is the WINNER (earliest
 * accusation timestamp breaks ties; an exact tie on both declares co-winners).
 * Other correct guessers are marked CORRECT, wrong/no guessers LOSER. If nobody
 * identifies the culprit, the culprit alone wins (KILLER WINS).
 */
export declare function finalizeVerdict(groupId: number | string): Promise<void>;
/**
 * Ends a game early because the Investigator left mid-session. No scoring/winners —
 * just an auto-reveal of the culprit and an "incomplete" marker. Retention still
 * applies (1 hour from this moment) so participant PII is purged on the same schedule
 * as a normally-completed game.
 */
export declare function markGroupIncomplete(groupId: number | string, reason: string): Promise<void>;
