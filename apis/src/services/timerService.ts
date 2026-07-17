import { query, withTransaction } from '../config/db';
import moment from 'moment';
import { io } from '../server';
import { finalizeVerdict } from './verdictScoringService';
import { runRetentionSweep } from './retentionService';

/**
 * Timer Service
 * Periodically checks for expired timers and triggers game state transitions.
 */
export const startTimerService = () => {
    console.log('[TimerService] Started...');

    // Run every 5 seconds — game-phase timers need second-level responsiveness.
    setInterval(async () => {
        try {
            const now = new Date();
            const [expiredTimers] = await query<any>('SELECT * FROM timers WHERE is_active = 1 AND expires_at <= ?', [now]);
            for (const timer of expiredTimers) {
                await handleTimerExpiration(timer);
            }
        } catch (error) {
            console.error('[TimerService] Error:', error);
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
    const [existing] = await query<any>(
        "SELECT id FROM timers WHERE group_id = ? AND timer_type = 'case_summary' LIMIT 1",
        [groupId]
    );
    if ((existing as any[]).length > 0) return;
    await query('INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)', [
        groupId,
        'case_summary',
        moment().add(Number(caseSummarySecs) || 300, 'seconds').toDate(),
    ]);
    console.log(`[TimerService] case_summary timer started for group ${groupId}`);
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

    await withTransaction(async (conn) => {
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

            case 'questioning':
                io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'final_verdict',
                    message: 'Questioning time is up! Please submit your final accusation.',
                });
                break;
        }
    });

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
    if (timer.timer_type === 'questioning') {
        try {
            await finalizeVerdict(timer.group_id);
        } catch (err) {
            console.error('[TimerService] finalizeVerdict on timeout failed:', err);
        }
    }
}
