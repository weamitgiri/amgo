"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTimerService = void 0;
exports.ensureCaseSummaryTimer = ensureCaseSummaryTimer;
const db_1 = require("../config/db");
const moment_1 = __importDefault(require("moment"));
const server_1 = require("../server");
const verdictScoringService_1 = require("./verdictScoringService");
const retentionService_1 = require("./retentionService");
const cookandcreateService_1 = require("./cookandcreateService");
/**
 * When the main questioning clock runs out, players get a fixed window to submit
 * their final accusation before the verdict is computed. Spec: 2 minutes.
 */
const FINAL_VERDICT_SECS = 120;
/**
 * Timer Service
 * Periodically checks for expired timers and triggers game state transitions.
 */
const startTimerService = () => {
    console.log('[TimerService] Started...');
    // Run every 5 seconds — game-phase timers need second-level responsiveness.
    setInterval(async () => {
        try {
            const now = new Date();
            const [expiredTimers] = await (0, db_1.query)('SELECT * FROM timers WHERE is_active = 1 AND expires_at <= ?', [now]);
            for (const timer of expiredTimers) {
                await handleTimerExpiration(timer);
            }
        }
        catch (error) {
            console.error('[TimerService] Error:', error);
        }
    }, 5000);
    // Post-game data-retention sweep — a much heavier, multi-table purge, so it
    // runs on a coarser interval separate from the fast game-timer loop.
    setInterval(() => {
        (0, retentionService_1.runRetentionSweep)();
    }, 60000);
};
exports.startTimerService = startTimerService;
/**
 * Starts the game clock for a group by creating its initial case_summary timer.
 * Idempotent — safe to call from every lobby poll / game-summary load; only the
 * first call after game start actually inserts the timer.
 */
async function ensureCaseSummaryTimer(groupId, caseSummarySecs) {
    const [existing] = await (0, db_1.query)("SELECT id FROM timers WHERE group_id = ? AND timer_type = 'case_summary' LIMIT 1", [groupId]);
    if (existing.length > 0)
        return;
    await (0, db_1.query)('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [
        groupId,
        'case_summary',
        (0, moment_1.default)().add(Number(caseSummarySecs) || 300, 'seconds').toDate(),
    ]);
    console.log(`[TimerService] case_summary timer started for group ${groupId}`);
}
async function getActivityConfigForGroup(groupId) {
    const [rows] = await (0, db_1.query)(`SELECT a.* FROM game_groups gg
            JOIN organizer_bookings ob ON ob.id = gg.booking_id
            JOIN activities a ON a.id = ob.activity_id
            WHERE gg.id = ? LIMIT 1`, [groupId]);
    return rows?.[0] || null;
}
async function handleTimerExpiration(timer) {
    console.log(`[TimerService] Timer expired: ${timer.timer_type} for group ${timer.group_id}`);
    // Cook & Create round advancement is queued in the switch below and invoked
    // only once the transaction has committed — see the note on the cc_* cases.
    let ccHandler = null;
    await (0, db_1.withTransaction)(async (conn) => {
        // Mark timer as inactive
        await conn.query('UPDATE timers SET is_active = 0 WHERE id = ?', [timer.id]);
        switch (timer.timer_type) {
            case 'case_summary': {
                const config = await getActivityConfigForGroup(timer.group_id);
                const totalSecs = Number(config?.game_duration_secs ?? 1500);
                const caseSummarySecs = Number(config?.case_summary_view_secs ?? 300);
                const clueUnlockSecs = Number(config?.clue_room_unlock_secs ?? 600);
                const questioningSecs = Math.max(totalSecs - caseSummarySecs, 60);
                // Transition to Questioning phase — duration is whatever's left of the
                // configured total session length after the case summary.
                await conn.query('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [timer.group_id, 'questioning', (0, moment_1.default)().add(questioningSecs, 'seconds').toDate()]);
                // Clue Room unlocks when `clue_room_unlock_secs` remain in the
                // questioning phase (equivalent to "10 min remaining of the full
                // session" for the default 5 + 20 = 25 minute split).
                const clueDelaySecs = Math.max(questioningSecs - clueUnlockSecs, 0);
                await conn.query('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [timer.group_id, 'clue_room_unlock', (0, moment_1.default)().add(clueDelaySecs, 'seconds').toDate()]);
                server_1.io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'questioning',
                    message: 'Case Summary ended. Questioning phase started!',
                });
                break;
            }
            case 'clue_room_unlock':
                await conn.query('UPDATE clue_rooms SET is_unlocked = 1, unlocked_at = ? WHERE group_id = ?', [
                    new Date(),
                    timer.group_id,
                ]);
                server_1.io.to(`group_${timer.group_id}`).emit('clues_unlocked', {
                    message: 'Clue Room is now open!',
                });
                break;
            case 'lie_detector':
                await conn.query("UPDATE lie_detector_rounds SET status = 'completed', updated_at = NOW() WHERE group_id = ? AND status = 'active'", [timer.group_id]);
                server_1.io.to(`group_${timer.group_id}`).emit('lie_detector_ended', {
                    message: 'Lie Detector round ended!',
                });
                server_1.io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'questioning',
                    message: 'Lie Detector time is up — back to questioning.',
                });
                break;
            case 'question_response': {
                const questionId = timer.reference_id;
                if (!questionId)
                    break;
                const [existingRows] = await conn.query('SELECT id FROM answers WHERE question_id = ? LIMIT 1', [
                    questionId,
                ]);
                if (existingRows.length > 0)
                    break; // already answered before this timer fired
                const [questionRows] = await conn.query('SELECT * FROM questions WHERE id = ? LIMIT 1', [
                    questionId,
                ]);
                const question = questionRows[0];
                if (!question)
                    break;
                const [sessionRows] = await conn.query('SELECT left_at FROM participant_sessions WHERE id = ? LIMIT 1', [question.asked_to]);
                const hasLeft = Boolean(sessionRows[0]?.left_at);
                const config = await getActivityConfigForGroup(timer.group_id);
                // A player who left the game is auto-skipped with no penalty — that's
                // a disconnect-path, not a fault-path. Genuine non-response (still
                // present, just didn't answer in time) uses the configured penalty.
                const penalty = hasLeft ? 0 : Math.abs(Number(config?.no_response_penalty ?? -10));
                await conn.query(`INSERT INTO answers (question_id, participant_session_id, answer_text, penalty_applied, answered_at, created_at, updated_at)
                        VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())`, [questionId, question.asked_to, '(No response — auto-skipped)', penalty]);
                if (penalty > 0) {
                    await conn.query('UPDATE participant_sessions SET total_score = total_score - ? WHERE id = ?', [
                        penalty,
                        question.asked_to,
                    ]);
                }
                server_1.io.to(`group_${timer.group_id}`).emit('new_answer', {
                    question_id: questionId,
                    participant_session_id: question.asked_to,
                    answer_text: '(No response — auto-skipped)',
                    penalty_applied: penalty,
                    auto_skipped: true,
                });
                break;
            }
            case 'questioning': {
                // Don't finalize yet — open a fixed final-accusation window and
                // force everyone into the accusation screen. The verdict is
                // computed when the final_verdict timer below expires (or earlier,
                // once every eligible player has submitted — see submitAccusation).
                const finalDeadline = (0, moment_1.default)().add(FINAL_VERDICT_SECS, 'seconds').toDate();
                await conn.query('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [timer.group_id, 'final_verdict', finalDeadline]);
                server_1.io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'final_verdict',
                    ends_at: (0, moment_1.default)(finalDeadline).format('YYYY-MM-DD HH:mm:ss'),
                    message: 'Questioning time is up! Submit your final accusation.',
                });
                break;
            }
            // The final-accusation window closed — compute the verdict (queued
            // after commit below, since finalizeVerdict runs its own transaction).
            case 'final_verdict':
                break;
            // ---- Cook & Create timer safety nets --------------------------------
            // Each of these is the fallback path — the primary path is the
            // "everyone finished early" checks in cookandcreateController.ts.
            // Every handler here is idempotent (guarded by a status/phase claim
            // inside cookandcreateService.ts), so firing after the round already
            // advanced via the fast path is a safe no-op. reference_id carries the
            // cc_game_instances id (see cookandcreateService.ensureCCTimer).
            //
            // These are only QUEUED here, and run after this transaction commits
            // (see below) — they must not execute inside it. Each one ends by
            // calling ensureCCTimer to start the next phase's timer, which
            // updates the `timers` table on a different pool connection; with
            // this transaction still holding the row lock taken by the UPDATE at
            // the top, that write blocks until innodb_lock_wait_timeout and then
            // fails. The failure is swallowed inside ensureCCTimer, so the round
            // would advance with NO timer for the next phase and the group would
            // sit there forever.
            case 'cc_round1':
                if (timer.reference_id)
                    ccHandler = () => (0, cookandcreateService_1.finalizeRound1)(timer.reference_id, timer.group_id);
                break;
            case 'cc_round2_submit':
                if (timer.reference_id)
                    ccHandler = () => (0, cookandcreateService_1.advanceRound2ToReview)(timer.reference_id, timer.group_id);
                break;
            // One player's Round-2 turn ran out — pass the turn on (or, if that
            // was the last player, move the round to review).
            case 'cc_round2_turn':
                if (timer.reference_id)
                    ccHandler = () => (0, cookandcreateService_1.advanceRound2Turn)(timer.reference_id, timer.group_id);
                break;
            case 'cc_round2_review':
                if (timer.reference_id)
                    ccHandler = () => (0, cookandcreateService_1.finalizeRound2Review)(timer.reference_id, timer.group_id);
                break;
            case 'cc_round3_discussion':
                if (timer.reference_id)
                    ccHandler = () => (0, cookandcreateService_1.advanceRound3ToVoting)(timer.reference_id, timer.group_id);
                break;
            case 'cc_round3_voting':
                if (timer.reference_id)
                    ccHandler = () => (0, cookandcreateService_1.finalizeRound3)(timer.reference_id, timer.group_id);
                break;
        }
    });
    // Committed now, so the `timers` row lock is released and the CC handler's
    // ensureCCTimer call can start the next phase's timer. (Read through a local
    // because TS can't see that the callback above already ran.)
    const queuedCcHandler = ccHandler;
    if (queuedCcHandler) {
        await queuedCcHandler();
    }
    // A no-response auto-skip may have applied a penalty above; push the fresh
    // scores to the group so the Score Board updates live (read after commit).
    if (timer.timer_type === 'question_response') {
        try {
            const [rows] = await (0, db_1.query)('SELECT id AS session_id, total_score FROM participant_sessions WHERE group_id = ?', [timer.group_id]);
            server_1.io.to(`group_${timer.group_id}`).emit('scores_updated', {
                scores: (rows || []).map((r) => ({
                    session_id: Number(r.session_id),
                    total_score: Number(r.total_score),
                })),
            });
        }
        catch {
            /* best-effort */
        }
    }
    // finalizeVerdict runs its own transaction (and may already have been triggered
    // by the last participant's accusation) — run it after the timer transaction
    // above commits. It's idempotent, so a race with a manual submission is safe.
    // This fires when the final-accusation window closes, not when questioning ends.
    if (timer.timer_type === 'final_verdict') {
        try {
            await (0, verdictScoringService_1.finalizeVerdict)(timer.group_id);
        }
        catch (err) {
            console.error('[TimerService] finalizeVerdict on timeout failed:', err);
        }
    }
}
