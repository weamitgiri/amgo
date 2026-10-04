import moment from 'moment';
import { query, withTransaction } from '../config/db';
import { AppError } from '../utils/AppError';
import { serializeData } from '../utils/serializer';
import { io } from '../server';
import { generateResultsPdf } from './resultsPdfService';

/**
 * The culprit's role_type is stored as "hidden culprit" (the admin dropdown value),
 * so detect it by substring. Everyone accuses, but only non-culprit roles are scored
 * as guessers; the culprit is scored on whether they were caught.
 */
export function isCulpritRole(roleType?: string | null): boolean {
    return typeof roleType === 'string' && roleType.toLowerCase().includes('culprit');
}

/**
 * End-game points, per the "Mystery Quest — Scoreboard Logic" spec:
 *  - Investigator: +80 correct accusation, −30 wrong person, −20 no accusation at all.
 *  - Key Suspect / Witness / Participant: +50 correct final guess, −10 wrong guess
 *    (no extra penalty for not guessing — they simply lose).
 *  - Hidden Culprit: +100 when nobody identifies them (Killer Wins), −20 when caught.
 */
const VERDICT_POINTS = {
    investigatorCorrect: 80,
    investigatorWrong: -30,
    investigatorNoAccusation: -20,
    othersCorrect: 50,
    othersWrong: -10,
    culpritEscaped: 100,
    culpritCaught: -20,
} as const;

/** Use the admin-configured value when present/valid, else the spec default. */
function numOr(value: unknown, fallback: number): number {
    if (value === null || value === undefined || value === '') return fallback;
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
}

export type PlayerStatus = 'winner' | 'correct' | 'loser' | 'killer_wins';

type PerRoleResult = {
    session_id: number;
    role_type: string;
    guessed_session_id: number | null;
    is_correct: boolean;
    guess_submitted_at: string | null;
    verdict_points: number;
    final_score: number;
    status: PlayerStatus;
    /** Highest final score in the group (ties share it). Extra badge, not a win. */
    is_mvp?: boolean;
};

/**
 * Records one participant's final accusation. EVERY player names the killer —
 * including the culprit, who has to bluff and accuse someone else (their pick is
 * not scored; see finalizeVerdict). Once every player still in the game has
 * submitted (or the final-accusation timer expires — see timerService.ts),
 * finalizeVerdict computes and broadcasts the outcome.
 */
export async function submitAccusation(
    groupId: number | string,
    participantSessionId: number,
    accusedSessionId: number,
    reasoning: string
): Promise<{ accepted: true; all_submitted: boolean }> {
    const [sessionRows] = await query<any>(
        `SELECT ps.id, ps.group_id, gr.role_type FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         WHERE ps.id = ? LIMIT 1`,
        [participantSessionId]
    );
    const session = sessionRows?.[0];
    if (!session || String(session.group_id) !== String(groupId)) {
        throw new AppError('Session not found in this group', 404);
    }
    if (!session.role_type) {
        throw new AppError('You have no role in this game', 403);
    }
    if (String(accusedSessionId) === String(participantSessionId)) {
        throw new AppError('You cannot accuse yourself', 400);
    }
    const [accusedRows] = await query<any>(
        'SELECT id FROM participant_sessions WHERE id = ? AND group_id = ? LIMIT 1',
        [accusedSessionId, groupId]
    );
    if (!accusedRows?.[0]) {
        throw new AppError('That player is not in this game', 400);
    }
    const [groupRows] = await query<any>('SELECT status FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    if (['completed', 'incomplete'].includes(groupRows?.[0]?.status)) {
        throw new AppError('The verdict is already in — accusations are closed', 400);
    }

    const [existingRows] = await query<any>(
        'SELECT id FROM group_accusations WHERE participant_session_id = ? LIMIT 1',
        [participantSessionId]
    );
    if (existingRows?.[0]) {
        throw new AppError('You have already submitted your accusation', 400);
    }

    try {
        await query(
            `INSERT INTO group_accusations (group_id, participant_session_id, accused_session_id, reasoning, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [groupId, participantSessionId, accusedSessionId, reasoning]
        );
    } catch (err: any) {
        // Two rapid submissions can both pass the SELECT check above; the unique
        // key on participant_session_id catches the straggler.
        if (err?.code === 'ER_DUP_ENTRY') {
            throw new AppError('You have already submitted your accusation', 400);
        }
        throw err;
    }

    io.to(`group_${groupId}`).emit('accusation_submitted', { participant_session_id: participantSessionId });

    // Everyone with a role who hasn't left the game must accuse. (This used to compare
    // against role_type != 'culprit', but the stored value is "hidden culprit", so it
    // counted the culprit — who couldn't submit — and the verdict only ever came when
    // the timer ran out.)
    const [progressRows] = await query<any>(
        `SELECT COUNT(*) AS total, COALESCE(SUM(ga.id IS NOT NULL), 0) AS submitted
           FROM participant_sessions ps
           JOIN game_roles gr ON gr.id = ps.role_id
           LEFT JOIN group_accusations ga ON ga.participant_session_id = ps.id
          WHERE ps.group_id = ? AND ps.left_at IS NULL`,
        [groupId]
    );
    const total = Number(progressRows?.[0]?.total || 0);
    const allSubmitted = total > 0 && Number(progressRows?.[0]?.submitted || 0) >= total;

    if (allSubmitted) {
        await finalizeVerdict(groupId);
    }

    return { accepted: true, all_submitted: allSubmitted };
}

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
export async function finalizeVerdict(groupId: number | string): Promise<void> {
    const completedAt = new Date();
    const retentionPurgeAt = moment(completedAt).add(1, 'hour').toDate();

    const outcome = await withTransaction(async (conn) => {
        // Atomically claim the finalization. finalizeVerdict can be triggered from
        // two independent paths at once (the last player's accusation and the
        // questioning-timer expiry) — only the caller that flips the status gets to
        // apply verdict points and write the result row, so points can never be
        // applied twice.
        const [claim] = await conn.query<any>(
            `UPDATE game_groups SET status = 'completed', completed_at = ?, retention_purge_at = ?
              WHERE id = ? AND status NOT IN ('completed', 'incomplete')`,
            [completedAt, retentionPurgeAt, groupId]
        );
        if (!claim || Number(claim.affectedRows || 0) === 0) return null;

        const [sessions] = await conn.query<any[]>(
            `SELECT ps.id, ps.total_score, ps.left_at, gr.role_type FROM participant_sessions ps
             LEFT JOIN game_roles gr ON gr.id = ps.role_id
             WHERE ps.group_id = ?`,
            [groupId]
        );
        const culpritSession = (sessions as any[]).find((s: any) => isCulpritRole(s.role_type));
        const nonCulpritSessions = (sessions as any[]).filter((s: any) => s.role_type && !isCulpritRole(s.role_type));

        const [accusations] = await conn.query<any[]>('SELECT * FROM group_accusations WHERE group_id = ?', [groupId]);
        const accusationBySession = new Map<string, any>(
            (accusations as any[]).map((a: any) => [String(a.participant_session_id), a])
        );

        // Equal-Chance scoreboard (Scoreboard Logic PDF). Every role earns the same
        // five parts (max 100): role goal, cooperation, lie detector, clue room,
        // final accusation; minus answer-timeout and investigator-no-accusation
        // penalties. The final score is computed from scratch here (not the live
        // in-game running total), so the results always reflect the PDF model.
        const [cfgRows] = await conn.query<any[]>(
            `SELECT a.role_goal_bonus, a.cooperation_bonus, a.lie_detector_participation_bonus,
                    a.clue_room_bonus, a.final_accusation_bonus, a.no_response_penalty,
                    a.investigator_no_accusation_penalty
             FROM game_groups gg
             JOIN organizer_bookings ob ON ob.id = gg.booking_id
             JOIN activities a ON a.id = ob.activity_id
             WHERE gg.id = ? LIMIT 1`,
            [groupId]
        );
        const cfg = (cfgRows as any[])[0] || {};
        const P = {
            roleGoal: numOr(cfg.role_goal_bonus, 60),
            cooperation: numOr(cfg.cooperation_bonus, 10),
            lieDetector: numOr(cfg.lie_detector_participation_bonus, 10),
            clueRoom: numOr(cfg.clue_room_bonus, 10),
            accusation: numOr(cfg.final_accusation_bonus, 10),
            noResponsePenalty: Math.abs(numOr(cfg.no_response_penalty, -10)),
            investigatorNoAccusation: Math.abs(numOr(cfg.investigator_no_accusation_penalty, -20)),
        };

        // Per-player facts the model needs.
        const [qRows] = await conn.query<any[]>('SELECT asked_by FROM questions WHERE group_id = ?', [groupId]);
        const questionsAskedBy = new Map<string, number>();
        for (const q of qRows as any[]) {
            questionsAskedBy.set(String(q.asked_by), (questionsAskedBy.get(String(q.asked_by)) || 0) + 1);
        }
        const [missRows] = await conn.query<any[]>(
            `SELECT a.participant_session_id AS sid, COUNT(*) AS misses
               FROM answers a JOIN questions q ON q.id = a.question_id
              WHERE q.group_id = ? AND a.answer_text = '(No response — auto-skipped)'
              GROUP BY a.participant_session_id`,
            [groupId]
        );
        const missedBySession = new Map<string, number>();
        for (const m of missRows as any[]) missedBySession.set(String(m.sid), Number(m.misses));

        // Lie Detector and Clue Room are cooperative team actions: if the round happened /
        // the clue room unlocked at all, every player who stayed earns that part.
        const [ldRows] = await conn.query<any[]>('SELECT id FROM lie_detector_rounds WHERE group_id = ? LIMIT 1', [groupId]);
        const lieDetectorHappened = (ldRows as any[]).length > 0;
        const [crTimerRows] = await conn.query<any[]>(
            `SELECT is_active, expires_at FROM timers WHERE group_id = ? AND timer_type = 'clue_room_unlock' ORDER BY id DESC LIMIT 1`,
            [groupId]
        );
        const crTimer = (crTimerRows as any[])[0];
        const clueRoomOpened = !!crTimer && (Number(crTimer.is_active) === 0 || new Date(crTimer.expires_at) <= new Date());

        // Did a player correctly name the Hidden Culprit?
        const namedCulprit = (s: any): boolean => {
            const acc = accusationBySession.get(String(s.id));
            return !s.left_at && !!acc && !!culpritSession && String(acc.accused_session_id) === String(culpritSession.id);
        };
        const correctGuessers = nonCulpritSessions.filter(namedCulprit);
        const correctGuessCount = correctGuessers.length;
        const culpritWins = correctGuessCount === 0;

        const roleSessions = (sessions as any[]).filter((s: any) => s.role_type);
        const perRoleResults: PerRoleResult[] = roleSessions.map((s: any) => {
            const isInvestigator = s.role_type === 'investigator';
            const isCulprit = isCulpritRole(s.role_type);
            const hasLeft = Boolean(s.left_at);
            const acc = accusationBySession.get(String(s.id));
            const submitted = !!acc;
            const reachedGoal = isCulprit ? culpritWins : namedCulprit(s);
            const missed = Math.min(missedBySession.get(String(s.id)) || 0, 2);

            // A player who left mid-game scores 0 and cannot win (spec §8).
            let bonus = 0;
            let penalty = 0;
            if (!hasLeft) {
                if (reachedGoal) bonus += P.roleGoal;
                const cooperationOk = isInvestigator
                    ? (questionsAskedBy.get(String(s.id)) || 0) >= 3
                    : missed === 0;
                if (cooperationOk) bonus += P.cooperation;
                if (lieDetectorHappened) bonus += P.lieDetector;
                if (clueRoomOpened) bonus += P.clueRoom;
                if (submitted) bonus += P.accusation;
                bonus = Math.min(bonus, 100);
                penalty = missed * P.noResponsePenalty;
                if (isInvestigator && !submitted) penalty += P.investigatorNoAccusation;
            }
            const finalScore = hasLeft ? 0 : bonus - penalty;

            return {
                session_id: Number(s.id),
                role_type: isCulprit ? 'culprit' : s.role_type,
                guessed_session_id: acc ? Number(acc.accused_session_id) : null,
                is_correct: !isCulprit && reachedGoal,
                guess_submitted_at: acc?.created_at ? moment(acc.created_at).toISOString() : null,
                verdict_points: finalScore,
                final_score: finalScore,
                status: hasLeft ? 'loser' : reachedGoal ? (isCulprit ? 'killer_wins' : 'winner') : 'loser',
                is_mvp: false,
            };
        });

        // WINNER = everyone who reached their role goal (1–4 possible, plus the culprit
        // when they escape). MVP badge = highest final score; ties share it.
        const winners = perRoleResults
            .filter((r) => r.status === 'winner' || r.status === 'killer_wins')
            .map((r) => r.session_id);
        const topScore = perRoleResults.reduce((m, r) => (r.final_score > m ? r.final_score : m), -Infinity);
        for (const r of perRoleResults) {
            if (topScore > -Infinity && r.final_score === topScore) r.is_mvp = true;
        }

        const investigatorSession = nonCulpritSessions.find((s: any) => s.role_type === 'investigator');
        const investigatorAccusation = investigatorSession
            ? accusationBySession.get(String(investigatorSession.id))
            : null;

        // Set each player's final total to the equal-chance score (replacing the live
        // running total), and record it in the score log for audit.
        for (const r of perRoleResults) {
            await conn.query(`UPDATE participant_sessions SET total_score = ? WHERE id = ?`, [r.final_score, r.session_id]);
            await conn.query(
                `INSERT INTO score_logs (participant_session_id, points, reason, created_at, updated_at)
                    VALUES (?, ?, 'final_scoreboard', NOW(), NOW())`,
                [r.session_id, r.final_score]
            );
        }

        await conn.query(
            `INSERT INTO results
                (group_id, identified_culprit_id, investigator_reasoning, is_correct, winner_ids, correct_guess_count, per_role_results, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                groupId,
                culpritSession ? culpritSession.id : null,
                investigatorAccusation?.reasoning || null,
                culpritWins ? 0 : 1,
                JSON.stringify(winners),
                correctGuessCount,
                JSON.stringify(perRoleResults),
            ]
        );

        return { correctGuessCount, perRoleResults };
    });

    // Another caller already finalized this group — nothing more to do.
    if (!outcome) return;
    const { correctGuessCount, perRoleResults } = outcome;

    try {
        await generateResultsPdf(groupId);
    } catch (err) {
        console.error('[verdictScoringService] Results PDF generation failed:', err);
    }

    // Verdict points changed everyone's totals — push the final scores before the
    // results screen reads them.
    io.to(`group_${groupId}`).emit('scores_updated', {
        scores: perRoleResults.map((r) => ({ session_id: r.session_id, total_score: r.final_score })),
    });

    const [resultRows] = await query<any>('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [groupId]);
    io.to(`group_${groupId}`).emit(
        'game_ended',
        serializeData({ ...resultRows?.[0], correct_guess_count: correctGuessCount, per_role_results: perRoleResults })
    );
}

/**
 * Ends a game early because the Investigator left mid-session. No scoring/winners —
 * just an auto-reveal of the culprit and an "incomplete" marker. Retention still
 * applies (1 hour from this moment) so participant PII is purged on the same schedule
 * as a normally-completed game.
 */
export async function markGroupIncomplete(groupId: number | string, reason: string): Promise<void> {
    const [groupRows] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const group = groupRows?.[0];
    if (!group || group.status === 'completed' || group.status === 'incomplete') return;

    const [sessions] = await query<any>(
        `SELECT ps.id, ps.participant_id, gr.role_type, gr.character_name, gp.name AS participant_name
         FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         LEFT JOIN game_participants gp ON gp.id = ps.participant_id
         WHERE ps.group_id = ?`,
        [groupId]
    );
    const culpritSession = sessions.find((s: any) => isCulpritRole(s.role_type));

    const completedAt = new Date();
    const retentionPurgeAt = moment(completedAt).add(1, 'hour').toDate();

    // Conditional for the same reason as finalizeVerdict's claim: if a concurrent
    // finalization just completed the group, don't overwrite its outcome.
    const [, header] = await query(
        `UPDATE game_groups SET status = 'incomplete', completed_at = ?, retention_purge_at = ?
          WHERE id = ? AND status NOT IN ('completed', 'incomplete')`,
        [completedAt, retentionPurgeAt, groupId]
    );
    if (Number(header?.affectedRows || 0) === 0) return;

    io.to(`group_${groupId}`).emit(
        'game_incomplete',
        serializeData({
            reason,
            culprit: culpritSession
                ? { session_id: Number(culpritSession.id), character_name: culpritSession.character_name }
                : null,
        })
    );
}
