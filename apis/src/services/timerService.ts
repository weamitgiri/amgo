import { query, withTransaction } from '../config/db';
import moment from 'moment';
import { io } from '../server';

/**
 * Timer Service
 * Periodically checks for expired timers and triggers game state transitions
 */
export const startTimerService = () => {
    console.log('[TimerService] Started...');
    
    // Run every 5 seconds
    setInterval(async () => {
        try {
            const now = new Date();
            
            // Find active timers that have expired
            const [expiredTimers] = await query<any>(
                'SELECT * FROM timers WHERE is_active = 1 AND expires_at <= ?',
                [now]
            );

            for (const timer of expiredTimers) {
                await handleTimerExpiration(timer);
            }
        } catch (error) {
            console.error('[TimerService] Error:', error);
        }
    }, 5000);
};

async function handleTimerExpiration(timer: any) {
    console.log(`[TimerService] Timer expired: ${timer.timer_type} for group ${timer.group_id}`);

    await withTransaction(async (conn) => {
        // Mark timer as inactive
        await conn.query('UPDATE timers SET is_active = 0 WHERE id = ?', [timer.id]);

        switch (timer.timer_type) {
            case 'case_summary':
                // Transition to Questioning phase (20 mins as per requirements)
                await conn.query(
                    'INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)',
                    [timer.group_id, 'questioning', moment().add(20, 'minutes').toDate()]
                );
                
                // Clue Room activates 10 minutes from game start.
                // Since Case Summary was 5 mins, we add 5 more minutes.
                await conn.query(
                    'INSERT INTO timers (group_id, timer_type, expires_at, is_active) VALUES (?, ?, ?, 1)',
                    [timer.group_id, 'clue_room_unlock', moment().add(5, 'minutes').toDate()]
                );

                io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'questioning',
                    message: 'Case Summary ended. Questioning phase started!'
                });
                break;

            case 'clue_room_unlock':
                // Unlock clues
                await conn.query(
                    'UPDATE clue_rooms SET is_unlocked = 1, unlocked_at = ? WHERE group_id = ?',
                    [new Date(), timer.group_id]
                );

                io.to(`group_${timer.group_id}`).emit('clues_unlocked', {
                    message: 'Clue Room is now open!'
                });
                break;

            case 'lie_detector':
                // Auto-complete lie detector if time runs out
                await conn.query(
                    "UPDATE lie_detector_rounds SET status = 'completed' WHERE group_id = ? AND status = 'active'",
                    [timer.group_id]
                );

                io.to(`group_${timer.group_id}`).emit('lie_detector_ended', {
                    message: 'Lie Detector round ended!'
                });
                break;
                
            case 'questioning':
                // Transition to final verdict
                await conn.query(
                    "UPDATE game_groups SET status = 'finished' WHERE id = ?",
                    [timer.group_id]
                );

                io.to(`group_${timer.group_id}`).emit('phase_changed', {
                    new_phase: 'final_verdict',
                    message: 'Questioning time is up! Investigator, please submit your final verdict.'
                });
                break;
        }
    });
}
