import { pool, query, withTransaction } from '../config/db';
import moment from 'moment';
import { io } from '../server';
import { finalizeVerdict } from './verdictScoringService';
import { runRetentionSweep } from './retentionService';
import {
    finalizeRound1 as finalizeCCRound1,
    advanceRound2ToReview as advanceCCRound2ToReview,
    advanceRound2Turn as advanceCCRound2Turn,
    finalizeRound2Review as finalizeCCRound2Review,
    advanceRound3ToVoting as advanceCCRound3ToVoting,
    finalizeRound3 as finalizeCCRound3,
} from './cookandcreateService';

/**
 * When the main questioning clock runs out, players get a fixed window to submit
 * their final accusation before the verdict is computed. Spec: 2 minutes.
 */
const FINAL_VERDICT_SECS = 120;

/**
 * Timer Service
 * Periodically checks for expired timers and triggers game state transitions.
 */
export const startTimerService = () => {
    console.log('[TimerService] Started...');

    // Run every 5 seconds — game-phase timers need second-level responsiveness.
    // `ticking` stops a slow tick (DB stall, a long transition) from overlapping the
    // next one and picking up the same expired timer twice.
    let ticking = false;
    setInterval(async () => {
        if (ticking) return;
        ticking = true;
        try {
            const now = new Date();
            const [expiredTimers] = await query<any>('SELECT * FROM timers WHERE is_active = 1 AND expires_at <= ?', [now]);
            for (const timer of expiredTimers) {
                await handleTimerExpiration(timer);
            }
        } catch (error) {
            console.error('[TimerService] Error:', error);
        } finally {
            ticking = false;
        }
    }, 5000);

    // Post-game data-retention sweep — a much heavier, multi-table purge, so it
    // runs on a coarser interval separate from the fast game-timer loop.
    setInterval(() => {
        runRetentionSweep();
    }, 60000);
};

/**
 * Starts the game clock for a group by creating its initial case_summary timer.
 * Idempotent — safe to call from every lobby poll / game-summary load; only the
 * first call after game start actually inserts the timer.
 */
export async function ensureCaseSummaryTimer(groupId: number | string, caseSummarySecs: number): Promise<void> {
    // check-then-insert is NOT atomic: the lobby poll, the game-summary load and the
    // game-state load all call this at the moment the game starts, so two of them can
    // both see "no timer yet" and both insert — leaving two case_summary timers that
    // each spawn their own questioning / clue-room timers (double phase_changed,
    // double final_verdict). A MySQL advisory lock (held on one dedicated connection)
    // serialises the check+insert across concurrent requests AND across processes.
    const lockName = `zoventro_case_summary_${groupId}`;
    const conn = await pool.getConnection();
    try {
        const [lockRows] = await conn.query<any[]>('SELECT GET_LOCK(?, 5) AS got', [lockName]);
        // Couldn't get the lock in 5s → someone else is creating it right now.
        if (!Number((lockRows as any[])[0]?.got)) return;
        try {
            const [existing] = await conn.query<any[]>(
                `SELECT t.id FROM timers t JOIN game_groups g ON g.id = t.group_id
              WHERE t.group_id = ? AND t.timer_type = 'case_summary' AND (g.created_at IS NULL OR t.created_at IS NULL OR t.created_at >= g.created_at) LIMIT 1`,
                [groupId]
            );
            if ((existing as any[]).length > 0) return;
            await conn.query('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [
                groupId,
                'case_summary',
                moment().add(Number(caseSummarySecs) || 300, 'seconds').toDate(),
            ]);
            console.log(`[TimerService] case_summary timer started for group ${groupId}`);
        } finally {
            await conn.query('SELECT RELEASE_LOCK(?)', [lockName]);
        }
    } finally {
        conn.release();
    }
}

/**
 * Self-heal a group whose Case Summary has ended but whose Questioning phase never
 * started — i.e. the questioning + clue_room timers were never created (the process
 * was down for the 5-second tick that should have advanced it, so the game sits at
 * 00:00 forever). Safe to call from getGameState on every load: a cheap unlocked
 * pre-check returns immediately in the normal case (a questioning timer already
 * exists), and the actual repair is serialised by a lock and re-checked, so it can
 * never race the timer service into duplicate timers.
 */
export async function recoverMissedQuestioningPhase(groupId: number | string): Promise<void> {
    // Fast path (no lock): the game already advanced past case summary.
    const [qPre] = await query<any>(
        `SELECT t.id FROM timers t JOIN game_groups g ON g.id = t.group_id
              WHERE t.group_id = ? AND t.timer_type = 'questioning' AND (g.created_at IS NULL OR t.created_at IS NULL OR t.created_at >= g.created_at) LIMIT 1`,
        [groupId]
    );
    if ((qPre as any[]).length > 0) return;

    const lockName = `zoventro_phase_${groupId}`;
    const conn = await pool.getConnection();
    try {
        const [lockRows] = await conn.query<any[]>('SELECT GET_LOCK(?, 3) AS got', [lockName]);
        if (!Number((lockRows as any[])[0]?.got)) return;
        try {
            // Re-check under the lock (the timer service may have just created it).
            const [qRows] = await conn.query<any[]>(
                `SELECT t.id FROM timers t JOIN game_groups g ON g.id = t.group_id
              WHERE t.group_id = ? AND t.timer_type = 'questioning' AND (g.created_at IS NULL OR t.created_at IS NULL OR t.created_at >= g.created_at) LIMIT 1`,
                [groupId]
            );
            if ((qRows as any[]).length > 0) return;

            // Only recover once the case summary has actually ended.
            const [csRows] = await conn.query<any[]>(
                `SELECT t.expires_at, t.is_active FROM timers t JOIN game_groups g ON g.id = t.group_id
              WHERE t.group_id = ? AND t.timer_type = 'case_summary' AND (g.created_at IS NULL OR t.created_at IS NULL OR t.created_at >= g.created_at) ORDER BY t.id DESC LIMIT 1`,
                [groupId]
            );
            const cs = (csRows as any[])[0];
            if (!cs) return; // case summary never started — nothing to recover
            const caseEnded = Number(cs.is_active) === 0 || new Date(cs.expires_at) <= new Date();
            if (!caseEnded) return; // still inside the case summary window

            const config = await getActivityConfigForGroup(groupId);
            const totalSecs = Number(config?.game_duration_secs ?? 1500);
            const caseSummarySecs = Number(config?.case_summary_view_secs ?? 300);
            const clueUnlockSecs = Number(config?.clue_room_unlock_secs ?? 600);
            const questioningSecs = Math.max(totalSecs - caseSummarySecs, 60);

            // Anchor to when the case summary actually ended so the recovered clock is
            // honest (a long-stuck game will produce an already-past questioning
            // deadline, which the timer loop then advances straight to the verdict).
            const caseEnd = new Date(cs.expires_at);
            const anchor = caseEnd > new Date() ? new Date() : caseEnd;
            const questioningExpiry = new Date(anchor.getTime() + questioningSecs * 1000);
            const clueDelaySecs = Math.max(questioningSecs - clueUnlockSecs, 0);
            const clueExpiry = new Date(anchor.getTime() + clueDelaySecs * 1000);

            await conn.query('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [
                groupId,
                'questioning',
                questioningExpiry,
            ]);
            await conn.query('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [
                groupId,
                'clue_room_unlock',
                clueExpiry,
            ]);
            io.to(`group_${groupId}`).emit('phase_changed', {
                new_phase: 'questioning',
                message: 'Case Summary ended. Questioning phase started!',
            });
            console.log(`[TimerService] Recovered missed questioning phase for group ${groupId}`);
        } finally {
            await conn.query('SELECT RELEASE_LOCK(?)', [lockName]);
        }
    } finally {
        conn.release();
    }
}

/**
 * DEV / TESTING ONLY — skip the current phase's timer so the next screen opens
 * without waiting out the clock. If the game hasn't started yet it starts it;
 * otherwise it expires the current active phase timer and runs its transition
 * immediately (Lie Detector round → Case Summary → Questioning → Final Verdict →
 * Results). Wire this behind a button you remove before production.
 */
export async function devAdvancePhase(groupId: number | string): Promise<{ advanced: string | null }> {
    // Not started yet (no case_summary timer) → start the game now.
    const [csRows] = await query<any>(
        `SELECT t.id FROM timers t JOIN game_groups g ON g.id = t.group_id
              WHERE t.group_id = ? AND t.timer_type = 'case_summary' AND (g.created_at IS NULL OR t.created_at IS NULL OR t.created_at >= g.created_at) LIMIT 1`,
        [groupId]
    );
    if ((csRows as any[]).length === 0) {
        await query("UPDATE game_groups SET status = 'active' WHERE id = ? AND status IN ('waiting','active')", [groupId]);
        const cfg = await getActivityConfigForGroup(groupId);
        await ensureCaseSummaryTimer(groupId, Number(cfg?.case_summary_view_secs) || 300);
        return { advanced: 'game_started' };
    }

    // Otherwise expire the current active phase timer and process it right away.
    const priority = ['lie_detector', 'final_verdict', 'questioning', 'case_summary'];
    const [timerRows] = await query<any>('SELECT * FROM timers WHERE group_id = ? AND is_active = 1', [groupId]);
    const active = timerRows as any[];
    let target: any = null;
    for (const type of priority) {
        target = active.find((t: any) => t.timer_type === type);
        if (target) break;
    }
    if (!target) return { advanced: null };

    target.expires_at = new Date(Date.now() - 1000);
    await query('UPDATE timers SET expires_at = ? WHERE id = ?', [target.expires_at, target.id]);
    await handleTimerExpiration(target);
    return { advanced: target.timer_type };
}

async function getActivityConfigForGroup(groupId: number | string) {
    const [rows] = await query<any>(
        `SELECT a.* FROM game_groups gg
            JOIN organizer_bookings ob ON ob.id = gg.booking_id
            JOIN activities a ON a.id = ob.activity_id
            WHERE gg.id = ? LIMIT 1`,
        [groupId]
    );
    return rows?.[0] || null;
}

async function handleTimerExpiration(timer: any) {
    console.log(`[TimerService] Timer expired: ${timer.timer_type} for group ${timer.group_id}`);

    // Cook & Create round advancement is queued in the switch below and invoked
    // only once the transaction has committed — see the note on the cc_* cases.
    let ccHandler: (() => Promise<void>) | null = null;
    let claimed = true;

    await withTransaction(async (conn) => {
        // Claim the timer atomically. Only the caller whose UPDATE actually flips
        // is_active 1 → 0 may run the transition; a concurrent tick / second process /
        // the dev "Next" button that raced us gets affectedRows = 0 and backs off.
        // Without this, both would run the transition and create duplicate follow-up
        // timers and broadcasts.
        const [claim] = await conn.query<any>('UPDATE timers SET is_active = 0 WHERE id = ? AND is_active = 1', [timer.id]);
        if (!claim?.affectedRows) {
            claimed = false;
            return;
        }

        switch (timer.timer_type) {
            case 'case_summary': {
                const config = await getActivityConfigForGroup(timer.group_id);
                const totalSecs = Number(config?.game_duration_secs ?? 1500);
                const caseSummarySecs = Number(config?.case_summary_view_secs ?? 300);
                const clueUnlockSecs = Number(config?.clue_room_unlock_secs ?? 600);
                const questioningSecs = Math.max(totalSecs - caseSummarySecs, 60);

                // Transition to Questioning phase — duration is whatever's left of the
                // configured total session length after the case summary.
                await conn.query(
                    'INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)',
                    [timer.group_id, 'questioning', moment().add(questioningSecs, 'seconds').toDate()]
                );

                // Clue Room unlocks when `clue_room_unlock_secs` remain in the
                // questioning phase (equivalent to "10 min remaining of the full
                // session" for the default 5 + 20 = 25 minute split).
                const clueDelaySecs = Math.max(questioningSecs - clueUnlockSecs, 0);
                await conn.query(
                    'INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)',
                    [timer.group_id, 'clue_room_unlock', moment().add(clueDelaySecs, 'seconds').toDate()]
                );

                io.to(`group_${timer.group_id}`).emit('phase_changed', {
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

                io.to(`group_${timer.group_id}`).emit('clues_unlocked', {
                    message: 'Clue Room is now open!',
                });
                break;

            case 'lie_detector':
                await conn.query(
                    "UPDATE lie_detector_rounds SET status = 'completed', updated_at = NOW() WHERE group_id = ? AND status = 'active'",
                    [timer.group_id]
                );

                io.to(`group_${timer.group_id}`).emit('lie_detector_ended', {
                    message: 'Lie Detector round ended!',
                });
                io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'questioning',
                    message: 'Lie Detector time is up — back to questioning.',
                });
                break;

            case 'question_response': {
                const questionId = timer.reference_id;
                if (!questionId) break;

                const [existingRows] = await conn.query<any[]>('SELECT id FROM answers WHERE question_id = ? LIMIT 1', [
                    questionId,
                ]);
                if ((existingRows as any[]).length > 0) break; // already answered before this timer fired

                const [questionRows] = await conn.query<any[]>('SELECT * FROM questions WHERE id = ? LIMIT 1', [
                    questionId,
                ]);
                const question = (questionRows as any[])[0];
                if (!question) break;

                const [sessionRows] = await conn.query<any[]>(
                    'SELECT left_at FROM participant_sessions WHERE id = ? LIMIT 1',
                    [question.asked_to]
                );
                const hasLeft = Boolean((sessionRows as any[])[0]?.left_at);

                const config = await getActivityConfigForGroup(timer.group_id);
                // A player who left the game is auto-skipped with no penalty — that's
                // a disconnect-path, not a fault-path. Genuine non-response (still
                // present, just didn't answer in time) uses the configured penalty.
                const penalty = hasLeft ? 0 : Math.abs(Number(config?.no_response_penalty ?? -10));

                await conn.query(
                    `INSERT INTO answers (question_id, participant_session_id, answer_text, penalty_applied, answered_at, created_at, updated_at)
                        VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())`,
                    [questionId, question.asked_to, '(No response — auto-skipped)', penalty]
                );
                if (penalty > 0) {
                    await conn.query('UPDATE participant_sessions SET total_score = total_score - ? WHERE id = ?', [
                        penalty,
                        question.asked_to,
                    ]);
                }

                io.to(`group_${timer.group_id}`).emit('new_answer', {
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
                const finalDeadline = moment().add(FINAL_VERDICT_SECS, 'seconds').toDate();
                await conn.query(
                    'INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)',
                    [timer.group_id, 'final_verdict', finalDeadline]
                );
                io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'final_verdict',
                    ends_at: moment(finalDeadline).format('YYYY-MM-DD HH:mm:ss'),
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
                if (timer.reference_id) ccHandler = () => finalizeCCRound1(timer.reference_id, timer.group_id);
                break;

            case 'cc_round2_submit':
                if (timer.reference_id) ccHandler = () => advanceCCRound2ToReview(timer.reference_id, timer.group_id);
                break;

            // One player's Round-2 turn ran out — pass the turn on (or, if that
            // was the last player, move the round to review).
            case 'cc_round2_turn':
                if (timer.reference_id) ccHandler = () => advanceCCRound2Turn(timer.reference_id, timer.group_id);
                break;

            case 'cc_round2_review':
                if (timer.reference_id) ccHandler = () => finalizeCCRound2Review(timer.reference_id, timer.group_id);
                break;

            case 'cc_round3_discussion':
                if (timer.reference_id) ccHandler = () => advanceCCRound3ToVoting(timer.reference_id, timer.group_id);
                break;

            case 'cc_round3_voting':
                if (timer.reference_id) ccHandler = () => finalizeCCRound3(timer.reference_id, timer.group_id);
                break;
        }
    });

    if (!claimed) return;

    // Committed now, so the `timers` row lock is released and the CC handler's
    // ensureCCTimer call can start the next phase's timer. (Read through a local
    // because TS can't see that the callback above already ran.)
    const queuedCcHandler = ccHandler as (() => Promise<void>) | null;
    if (queuedCcHandler) {
        await queuedCcHandler();
    }

    // A no-response auto-skip may have applied a penalty above; push the fresh
    // scores to the group so the Score Board updates live (read after commit).
    if (timer.timer_type === 'question_response') {
        try {
            const [rows] = await query<any>(
                'SELECT id AS session_id, total_score FROM participant_sessions WHERE group_id = ?',
                [timer.group_id]
            );
            io.to(`group_${timer.group_id}`).emit('scores_updated', {
                scores: (rows || []).map((r: any) => ({
                    session_id: Number(r.session_id),
                    total_score: Number(r.total_score),
                })),
            });
        } catch {
            /* best-effort */
        }
    }

    // finalizeVerdict runs its own transaction (and may already have been triggered
    // by the last participant's accusation) — run it after the timer transaction
    // above commits. It's idempotent, so a race with a manual submission is safe.
    // This fires when the final-accusation window closes, not when questioning ends.
    if (timer.timer_type === 'final_verdict') {
        try {
            await finalizeVerdict(timer.group_id);
        } catch (err) {
            console.error('[TimerService] finalizeVerdict on timeout failed:', err);
        }
    }
}
