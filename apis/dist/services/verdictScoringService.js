"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAccusation = submitAccusation;
exports.finalizeVerdict = finalizeVerdict;
exports.markGroupIncomplete = markGroupIncomplete;
const moment_1 = __importDefault(require("moment"));
const db_1 = require("../config/db");
const AppError_1 = require("../utils/AppError");
const serializer_1 = require("../utils/serializer");
const server_1 = require("../server");
const resultsPdfService_1 = require("./resultsPdfService");
const NON_CULPRIT_ROLES = ['investigator', 'suspect', 'witness', 'participant'];
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
/**
 * Records one participant's final accusation. Once every non-culprit role in the
 * group has submitted (or the questioning timer independently expires — see
 * timerService.ts), finalizeVerdict computes and broadcasts the outcome.
 */
async function submitAccusation(groupId, participantSessionId, accusedSessionId, reasoning) {
    const [sessionRows] = await (0, db_1.query)(`SELECT ps.id, ps.group_id, gr.role_type FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         WHERE ps.id = ? LIMIT 1`, [participantSessionId]);
    const session = sessionRows?.[0];
    if (!session || String(session.group_id) !== String(groupId)) {
        throw new AppError_1.AppError('Session not found in this group', 404);
    }
    if (!session.role_type || !NON_CULPRIT_ROLES.includes(session.role_type)) {
        throw new AppError_1.AppError('The culprit cannot submit an accusation', 403);
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
    const [nonCulpritRows] = await (0, db_1.query)(`SELECT ps.id FROM participant_sessions ps
         JOIN game_roles gr ON gr.id = ps.role_id
         WHERE ps.group_id = ? AND gr.role_type != 'culprit'`, [groupId]);
    const [countRows] = await (0, db_1.query)('SELECT COUNT(*) as cnt FROM group_accusations WHERE group_id = ?', [groupId]);
    const allSubmitted = Number(countRows?.[0]?.cnt || 0) >= nonCulpritRows.length && nonCulpritRows.length > 0;
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
        const [sessions] = await conn.query(`SELECT ps.id, ps.total_score, gr.role_type FROM participant_sessions ps
             LEFT JOIN game_roles gr ON gr.id = ps.role_id
             WHERE ps.group_id = ?`, [groupId]);
        const culpritSession = sessions.find((s) => s.role_type === 'culprit');
        const nonCulpritSessions = sessions.filter((s) => s.role_type && s.role_type !== 'culprit');
        const [accusations] = await conn.query('SELECT * FROM group_accusations WHERE group_id = ?', [groupId]);
        const accusationBySession = new Map(accusations.map((a) => [String(a.participant_session_id), a]));
        const perRoleResults = nonCulpritSessions.map((s) => {
            const acc = accusationBySession.get(String(s.id));
            const isCorrect = !!acc && !!culpritSession && String(acc.accused_session_id) === String(culpritSession.id);
            const isInvestigator = s.role_type === 'investigator';
            const verdictPoints = acc
                ? isCorrect
                    ? isInvestigator
                        ? VERDICT_POINTS.investigatorCorrect
                        : VERDICT_POINTS.othersCorrect
                    : isInvestigator
                        ? VERDICT_POINTS.investigatorWrong
                        : VERDICT_POINTS.othersWrong
                : isInvestigator
                    ? VERDICT_POINTS.investigatorNoAccusation
                    : 0;
            return {
                session_id: Number(s.id),
                role_type: s.role_type,
                guessed_session_id: acc ? Number(acc.accused_session_id) : null,
                is_correct: isCorrect,
                guess_submitted_at: acc?.created_at ? (0, moment_1.default)(acc.created_at).toISOString() : null,
                verdict_points: verdictPoints,
                final_score: Number(s.total_score || 0) + verdictPoints,
                status: 'loser', // provisional; resolved below
            };
        });
        const correctResults = perRoleResults.filter((r) => r.is_correct);
        const correctGuessCount = correctResults.length;
        const culpritWins = correctGuessCount === 0;
        const culpritVerdictPoints = culpritSession
            ? culpritWins
                ? VERDICT_POINTS.culpritEscaped
                : VERDICT_POINTS.culpritCaught
            : 0;
        // Winner declaration: highest final score among correct guessers; earlier
        // accusation submission wins ties; identical score AND timestamp → co-winners.
        let winners = [];
        if (culpritWins) {
            if (culpritSession)
                winners = [Number(culpritSession.id)];
        }
        else {
            const ranked = [...correctResults].sort((a, b) => {
                if (b.final_score !== a.final_score)
                    return b.final_score - a.final_score;
                const aTime = a.guess_submitted_at ? Date.parse(a.guess_submitted_at) : Number.MAX_SAFE_INTEGER;
                const bTime = b.guess_submitted_at ? Date.parse(b.guess_submitted_at) : Number.MAX_SAFE_INTEGER;
                return aTime - bTime;
            });
            const top = ranked[0];
            winners = ranked
                .filter((r) => r.final_score === top.final_score &&
                (r.guess_submitted_at ?? null) === (top.guess_submitted_at ?? null))
                .map((r) => r.session_id);
        }
        const winnerSet = new Set(winners.map((id) => String(id)));
        for (const r of perRoleResults) {
            r.status = winnerSet.has(String(r.session_id)) ? 'winner' : r.is_correct ? 'correct' : 'loser';
        }
        if (culpritSession) {
            perRoleResults.push({
                session_id: Number(culpritSession.id),
                role_type: 'culprit',
                guessed_session_id: null,
                is_correct: false,
                guess_submitted_at: null,
                verdict_points: culpritVerdictPoints,
                final_score: Number(culpritSession.total_score || 0) + culpritVerdictPoints,
                status: culpritWins ? 'killer_wins' : 'loser',
            });
        }
        const investigatorSession = nonCulpritSessions.find((s) => s.role_type === 'investigator');
        const investigatorAccusation = investigatorSession
            ? accusationBySession.get(String(investigatorSession.id))
            : null;
        for (const r of perRoleResults) {
            if (r.verdict_points !== 0) {
                await conn.query(`UPDATE participant_sessions SET total_score = total_score + ? WHERE id = ?`, [
                    r.verdict_points,
                    r.session_id,
                ]);
                await conn.query(`INSERT INTO score_logs (participant_session_id, points, reason, created_at, updated_at)
                        VALUES (?, ?, 'final_verdict', NOW(), NOW())`, [r.session_id, r.verdict_points]);
            }
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
    const culpritSession = sessions.find((s) => s.role_type === 'culprit');
    const completedAt = new Date();
    const retentionPurgeAt = (0, moment_1.default)(completedAt).add(1, 'hour').toDate();
    // Conditional for the same reason as finalizeVerdict's claim: if a concurrent
    // finalization just completed the group, don't overwrite its outcome.
    const [, header] = await (0, db_1.query)(`UPDATE game_groups SET status = 'incomplete', completed_at = ?, retention_purge_at = ?
          WHERE id = ? AND status NOT IN ('completed', 'incomplete')`, [completedAt, retentionPurgeAt, groupId]);
    if (Number(header?.affectedRows || 0) === 0)
        return;
    server_1.io.to(`group_${groupId}`).emit('game_incomplete', (0, serializer_1.serializeData)({
        reason,
        culprit: culpritSession
            ? { session_id: Number(culpritSession.id), character_name: culpritSession.character_name }
            : null,
    }));
}
