"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCulpritRole = isCulpritRole;
exports.submitAccusation = submitAccusation;
exports.finalizeVerdict = finalizeVerdict;
exports.markGroupIncomplete = markGroupIncomplete;
const moment_1 = __importDefault(require("moment"));
const db_1 = require("../config/db");
const AppError_1 = require("../utils/AppError");
const serializer_1 = require("../utils/serializer");
const server_1 = require("../server");
const resultsPdfService_1 = require("./resultsPdfService");
/**
 * The culprit's role_type is stored as "hidden culprit" (the admin dropdown value),
 * so detect it by substring. Everyone accuses, but only non-culprit roles are scored
 * as guessers; the culprit is scored on whether they were caught.
 */
function isCulpritRole(roleType) {
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
};
/** Use the admin-configured value when present/valid, else the spec default. */
function numOr(value, fallback) {
    if (value === null || value === undefined || value === '')
        return fallback;
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
}
/**
 * Records one participant's final accusation. EVERY player names the killer —
 * including the culprit, who has to bluff and accuse someone else (their pick is
 * not scored; see finalizeVerdict). Once every player still in the game has
 * submitted (or the final-accusation timer expires — see timerService.ts),
 * finalizeVerdict computes and broadcasts the outcome.
 */
async function submitAccusation(groupId, participantSessionId, accusedSessionId, reasoning) {
    const [sessionRows] = await (0, db_1.query)(`SELECT ps.id, ps.group_id, gr.role_type FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         WHERE ps.id = ? LIMIT 1`, [participantSessionId]);
    const session = sessionRows?.[0];
    if (!session || String(session.group_id) !== String(groupId)) {
        throw new AppError_1.AppError('Session not found in this group', 404);
    }
    if (!session.role_type) {
        throw new AppError_1.AppError('You have no role in this game', 403);
    }
    if (String(accusedSessionId) === String(participantSessionId)) {
        throw new AppError_1.AppError('You cannot accuse yourself', 400);
    }
    const [accusedRows] = await (0, db_1.query)('SELECT id FROM participant_sessions WHERE id = ? AND group_id = ? LIMIT 1', [accusedSessionId, groupId]);
    if (!accusedRows?.[0]) {
        throw new AppError_1.AppError('That player is not in this game', 400);
    }
    const [groupRows] = await (0, db_1.query)('SELECT status FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    if (['completed', 'incomplete'].includes(groupRows?.[0]?.status)) {
        throw new AppError_1.AppError('The verdict is already in — accusations are closed', 400);
    }
    const [existingRows] = await (0, db_1.query)('SELECT id FROM group_accusations WHERE participant_session_id = ? LIMIT 1', [participantSessionId]);
    if (existingRows?.[0]) {
        throw new AppError_1.AppError('You have already submitted your accusation', 400);
    }
    try {
        await (0, db_1.query)(`INSERT INTO group_accusations (group_id, participant_session_id, accused_session_id, reasoning, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())`, [groupId, participantSessionId, accusedSessionId, reasoning]);
    }
    catch (err) {
        // Two rapid submissions can both pass the SELECT check above; the unique
        // key on participant_session_id catches the straggler.
        if (err?.code === 'ER_DUP_ENTRY') {
            throw new AppError_1.AppError('You have already submitted your accusation', 400);
        }
        throw err;
    }
    server_1.io.to(`group_${groupId}`).emit('accusation_submitted', { participant_session_id: participantSessionId });
    // Everyone with a role who hasn't left the game must accuse. (This used to compare
    // against role_type != 'culprit', but the stored value is "hidden culprit", so it
    // counted the culprit — who couldn't submit — and the verdict only ever came when
    // the timer ran out.)
    const [progressRows] = await (0, db_1.query)(`SELECT COUNT(*) AS total, COALESCE(SUM(ga.id IS NOT NULL), 0) AS submitted
           FROM participant_sessions ps
           JOIN game_roles gr ON gr.id = ps.role_id
           LEFT JOIN group_accusations ga ON ga.participant_session_id = ps.id
          WHERE ps.group_id = ? AND ps.left_at IS NULL`, [groupId]);
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
async function finalizeVerdict(groupId) {
    const completedAt = new Date();
    const retentionPurgeAt = (0, moment_1.default)(completedAt).add(1, 'hour').toDate();
    const outcome = await (0, db_1.withTransaction)(async (conn) => {
        // Atomically claim the finalization. finalizeVerdict can be triggered from
        // two independent paths at once (the last player's accusation and the
        // questioning-timer expiry) — only the caller that flips the status gets to
        // apply verdict points and write the result row, so points can never be
        // applied twice.
        const [claim] = await conn.query(`UPDATE game_groups SET status = 'completed', completed_at = ?, retention_purge_at = ?
              WHERE id = ? AND status NOT IN ('completed', 'incomplete')`, [completedAt, retentionPurgeAt, groupId]);
        if (!claim || Number(claim.affectedRows || 0) === 0)
            return null;
        const [sessions] = await conn.query(`SELECT ps.id, ps.total_score, ps.left_at, gr.role_type FROM participant_sessions ps
             LEFT JOIN game_roles gr ON gr.id = ps.role_id
             WHERE ps.group_id = ?`, [groupId]);
        const culpritSession = sessions.find((s) => isCulpritRole(s.role_type));
        const nonCulpritSessions = sessions.filter((s) => s.role_type && !isCulpritRole(s.role_type));
        const [accusations] = await conn.query('SELECT * FROM group_accusations WHERE group_id = ?', [groupId]);
        const accusationBySession = new Map(accusations.map((a) => [String(a.participant_session_id), a]));
        // Spec scoreboard (the final source of truth): the live running total each
        // player earned DURING the game — question/answer/vote/lie-detector/clue-room
        // points — IS their score. At the verdict we apply ONLY the final-accusation
        // deltas on top; we never recompute or overwrite the per-action total the way
        // the old Equal-Chance model did. Mystery Quest only — no other game touched.
        const [cfgRows] = await conn.query(`SELECT a.role_goal_bonus, a.role_wrong_penalty, a.culprit_win_bonus, a.culprit_caught_penalty
             FROM game_groups gg
             JOIN organizer_bookings ob ON ob.id = gg.booking_id
             JOIN activities a ON a.id = ob.activity_id
             WHERE gg.id = ? LIMIT 1`, [groupId]);
        const cfg = cfgRows[0] || {};
        const P = {
            correctKiller: Math.abs(numOr(cfg.role_goal_bonus, 60)), // +60 correct accusation
            wrongKiller: -Math.abs(numOr(cfg.role_wrong_penalty, -20)), // -20 wrong / no accusation
            hiddenCulprit: Math.abs(numOr(cfg.culprit_win_bonus, 80)), // +80 culprit never identified
            culpritCaught: -Math.abs(numOr(cfg.culprit_caught_penalty, -20)), // culprit caught
        };
        // Did a player correctly name the Hidden Culprit?
        const namedCulprit = (s) => {
            const acc = accusationBySession.get(String(s.id));
            return !s.left_at && !!acc && !!culpritSession && String(acc.accused_session_id) === String(culpritSession.id);
        };
        const correctGuessers = nonCulpritSessions.filter(namedCulprit);
        const correctGuessCount = correctGuessers.length;
        const culpritWins = correctGuessCount === 0;
        const roleSessions = sessions.filter((s) => s.role_type);
        const perRoleResults = roleSessions.map((s) => {
            const isCulprit = isCulpritRole(s.role_type);
            const hasLeft = Boolean(s.left_at);
            const acc = accusationBySession.get(String(s.id));
            const reachedGoal = isCulprit ? culpritWins : namedCulprit(s);
            // Final-accusation delta, applied ON TOP of the running total:
            //  - non-culprit: +60 for naming the Hidden Culprit, else -20 (a wrong
            //    pick OR no accusation at all both count as a failed accusation).
            //  - Hidden Culprit: +80 only when NOBODY identified them, else caught.
            let delta = 0;
            if (!hasLeft) {
                if (isCulprit) {
                    delta = culpritWins ? P.hiddenCulprit : P.culpritCaught;
                }
                else {
                    delta = reachedGoal ? P.correctKiller : P.wrongKiller;
                }
            }
            // A player who left mid-game scores 0 and cannot win (spec §8); everyone
            // else keeps the points they earned plus this verdict delta.
            const runningTotal = Number(s.total_score) || 0;
            const finalScore = hasLeft ? 0 : runningTotal + delta;
            return {
                session_id: Number(s.id),
                role_type: isCulprit ? 'culprit' : s.role_type,
                guessed_session_id: acc ? Number(acc.accused_session_id) : null,
                is_correct: !isCulprit && reachedGoal,
                guess_submitted_at: acc?.created_at ? (0, moment_1.default)(acc.created_at).toISOString() : null,
                verdict_points: hasLeft ? 0 : delta,
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
            if (topScore > -Infinity && r.final_score === topScore)
                r.is_mvp = true;
        }
        const investigatorSession = nonCulpritSessions.find((s) => s.role_type === 'investigator');
        const investigatorAccusation = investigatorSession
            ? accusationBySession.get(String(investigatorSession.id))
            : null;
        // Persist each player's final total (running total + verdict delta) and
        // record the accusation delta in the score log for audit.
        for (const r of perRoleResults) {
            await conn.query(`UPDATE participant_sessions SET total_score = ? WHERE id = ?`, [r.final_score, r.session_id]);
            await conn.query(`INSERT INTO score_logs (participant_session_id, points, reason, created_at, updated_at)
                    VALUES (?, ?, 'final_accusation', NOW(), NOW())`, [r.session_id, r.verdict_points]);
        }
        await conn.query(`INSERT INTO results
                (group_id, identified_culprit_id, investigator_reasoning, is_correct, winner_ids, correct_guess_count, per_role_results, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
            groupId,
            culpritSession ? culpritSession.id : null,
            investigatorAccusation?.reasoning || null,
            culpritWins ? 0 : 1,
            JSON.stringify(winners),
            correctGuessCount,
            JSON.stringify(perRoleResults),
        ]);
        return { correctGuessCount, perRoleResults };
    });
    // Another caller already finalized this group — nothing more to do.
    if (!outcome)
        return;
    const { correctGuessCount, perRoleResults } = outcome;
    try {
        await (0, resultsPdfService_1.generateResultsPdf)(groupId);
    }
    catch (err) {
        console.error('[verdictScoringService] Results PDF generation failed:', err);
    }
    // Verdict points changed everyone's totals — push the final scores before the
    // results screen reads them.
    server_1.io.to(`group_${groupId}`).emit('scores_updated', {
        scores: perRoleResults.map((r) => ({ session_id: r.session_id, total_score: r.final_score })),
    });
    const [resultRows] = await (0, db_1.query)('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [groupId]);
    server_1.io.to(`group_${groupId}`).emit('game_ended', (0, serializer_1.serializeData)({ ...resultRows?.[0], correct_guess_count: correctGuessCount, per_role_results: perRoleResults }));
}
/**
 * Ends a game early because the Investigator left mid-session. No scoring/winners —
 * just an auto-reveal of the culprit and an "incomplete" marker. Retention still
 * applies (1 hour from this moment) so participant PII is purged on the same schedule
 * as a normally-completed game.
 */
async function markGroupIncomplete(groupId, reason) {
    const [groupRows] = await (0, db_1.query)('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const group = groupRows?.[0];
    if (!group || group.status === 'completed' || group.status === 'incomplete')
        return;
    const [sessions] = await (0, db_1.query)(`SELECT ps.id, ps.participant_id, gr.role_type, gr.character_name, gp.name AS participant_name
         FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         LEFT JOIN game_participants gp ON gp.id = ps.participant_id
         WHERE ps.group_id = ?`, [groupId]);
    const culpritSession = sessions.find((s) => isCulpritRole(s.role_type));
    const completedAt = new Date();
    const retentionPurgeAt = (0, moment_1.default)(completedAt).add(1, 'hour').toDate();
    // Conditional for the same reason as finalizeVerdict's claim: if a concurrent
    // finalization just completed the group, don't overwrite its outcome.
    // mysql2 returns an UPDATE's ResultSetHeader as the FIRST element (query()'s
    // second element is undefined for it), so read affectedRows from there —
    // reading only the second element made this always return before the
    // game_incomplete emit below, leaving players on a dead game until a poll.
    const [claim, header] = await (0, db_1.query)(`UPDATE game_groups SET status = 'incomplete', completed_at = ?, retention_purge_at = ?
          WHERE id = ? AND status NOT IN ('completed', 'incomplete')`, [completedAt, retentionPurgeAt, groupId]);
    if (Number((header ?? claim)?.affectedRows || 0) === 0)
        return;
    server_1.io.to(`group_${groupId}`).emit('game_incomplete', (0, serializer_1.serializeData)({
        reason,
        culprit: culpritSession
            ? { session_id: Number(culpritSession.id), character_name: culpritSession.character_name }
            : null,
    }));
}
