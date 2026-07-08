import { Server, Socket } from 'socket.io';
import { query } from '../config/db';
import logger from '../utils/logger';
import { markGroupIncomplete } from '../services/verdictScoringService';

/**
 * Page refreshes, SPA navigation, and React dev double-mounts all produce brief
 * socket disconnects that are NOT real departures. Every departure signal goes
 * through this grace window first — if the participant reconnects within it,
 * nothing happens; only a genuine absence triggers the departure consequences.
 */
const DEPARTURE_GRACE_MS = 12_000;
const pendingDepartures = new Map<string, NodeJS.Timeout>();

function departureKey(groupId: string | number, participantId: string | number) {
    return `${groupId}:${participantId}`;
}

function cancelPendingDeparture(groupId: string | number, participantId: string | number) {
    const key = departureKey(groupId, participantId);
    const timer = pendingDepartures.get(key);
    if (timer) {
        clearTimeout(timer);
        pendingDepartures.delete(key);
    }
}

function scheduleDeparture(io: Server, groupId: string | number, participantId: string | number) {
    const key = departureKey(groupId, participantId);
    if (pendingDepartures.has(key)) return;

    pendingDepartures.set(
        key,
        setTimeout(async () => {
            pendingDepartures.delete(key);
            try {
                // Skip if the participant reconnected during the grace window.
                const [rows] = await query<any>(
                    'SELECT is_online FROM participant_sessions WHERE group_id = ? AND participant_id = ? LIMIT 1',
                    [groupId, participantId]
                );
                if (rows?.[0] && Number(rows[0].is_online) === 1) return;
                await handlePlayerDeparture(io, groupId, participantId);
            } catch (err: any) {
                logger.error(`[Socket] departure grace check failed: ${err.message}`);
            }
        }, DEPARTURE_GRACE_MS)
    );
}

/**
 * Resolves the departing session's role, marks it left, and applies the
 * FSD-required consequence: the Investigator leaving ends the game
 * ("Game Incomplete"); anyone else leaving just freezes their slot for the rest of
 * the group (their in-flight question/score handling happens in timerService.ts /
 * verdictScoringService.ts, keyed off `left_at`).
 */
async function handlePlayerDeparture(io: Server, groupId: string | number, participantId: string | number) {
    const [sessionRows] = await query<any>(
        `SELECT ps.id, gr.role_type FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? LIMIT 1`,
        [groupId, participantId]
    );
    const session = sessionRows?.[0];

    await query(
        `UPDATE participant_sessions
            SET is_online = 0, socket_id = NULL, left_at = COALESCE(left_at, NOW())
            WHERE group_id = ? AND participant_id = ?`,
        [groupId, participantId]
    );

    if (!session) return;

    const [groupRows] = await query<any>('SELECT status FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const groupStatus = groupRows?.[0]?.status;
    if (groupStatus === 'completed' || groupStatus === 'incomplete') return; // game already over

    if (session.role_type === 'investigator') {
        await markGroupIncomplete(groupId, 'investigator_left');
    } else {
        io.to(`group_${groupId}`).emit('participant_left', { participant_session_id: session.id, frozen: true });
    }
}

/**
 * Socket.IO Handler for Game Activities and Real-time Communications
 */
export const setupSocketHandlers = (io: Server, socket: Socket) => {
    logger.debug(`[Socket] User connected: ${socket.id}`);

    /**
     * Join lobby room for live group updates (alias: join_lobby)
     */
    const handleJoinLobby = async (data: { groupId: string; participantId?: string }) => {
        try {
            const { groupId, participantId } = data;
            if (!groupId) throw new Error('Group ID is required');

            socket.join(`group_${groupId}`);
            logger.info(`[Socket] Client joined lobby room: group_${groupId}`);

            if (participantId) {
                cancelPendingDeparture(groupId, participantId);
                try {
                    // Rejoining also clears left_at while the game is still running —
                    // a refreshed player should not stay frozen.
                    await query(
                        `UPDATE participant_sessions ps
                            JOIN game_groups gg ON gg.id = ps.group_id
                            SET ps.socket_id = ?, ps.is_online = 1,
                                ps.left_at = IF(gg.status IN ('waiting','active'), NULL, ps.left_at)
                            WHERE ps.group_id = ? AND ps.participant_id = ?`,
                        [socket.id, groupId, participantId]
                    );
                } catch {
                    /* participant_sessions may not exist yet during lobby */
                }
            }

            const { buildLobbyPayload } = await import('../services/lobbyService');
            const payload = await buildLobbyPayload(groupId, participantId || null);
            if (payload) {
                socket.emit('lobby_updated', payload);
            }

            socket.emit('joined_group', { groupId, success: true });
        } catch (error: any) {
            logger.error(`[Socket] join_lobby error: ${error.message}`);
            socket.emit('socket_error', { message: error.message });
        }
    };

    socket.on('join_lobby', handleJoinLobby);
    socket.on('join_game_group', handleJoinLobby);

    /**
     * Organizer dashboard — live event stats
     */
    socket.on('join_organizer_dashboard', async (data: { bookingId: string | number }) => {
        try {
            const bookingId = data?.bookingId;
            if (!bookingId) throw new Error('Booking ID is required');

            socket.join(`organizer_${bookingId}`);
            logger.info(`[Socket] Organizer joined dashboard room: organizer_${bookingId}`);

            const { buildEventStats } = await import('../services/eventStatsService');
            const stats = await buildEventStats(bookingId);
            if (stats) {
                socket.emit('event_stats_updated', stats);
            }

            socket.emit('joined_organizer_dashboard', { bookingId, success: true });
        } catch (error: any) {
            logger.error(`[Socket] join_organizer_dashboard error: ${error.message}`);
            socket.emit('socket_error', { message: error.message });
        }
    });

    /**
     * Leave Game Group
     */
    socket.on('leave_game_group', async (data: { groupId: string; participantId: string }) => {
        try {
            const { groupId, participantId } = data;
            socket.leave(`group_${groupId}`);

            // Mark offline right away, but confirm the departure only after the
            // grace window — a page navigation emits this too.
            await query(
                'UPDATE participant_sessions SET is_online = 0 WHERE group_id = ? AND participant_id = ?',
                [groupId, participantId]
            );
            scheduleDeparture(io, groupId, participantId);

            logger.info(`[Socket] Participant ${participantId} left group: group_${groupId}`);
        } catch (error: any) {
            logger.error(`[Socket] leave_game_group error: ${error.message}`);
            socket.emit('socket_error', { message: error.message });
        }
    });

    /**
     * Handle Disconnection
     */
    socket.on('disconnect', async (reason) => {
        logger.debug(`[Socket] User disconnected: ${socket.id}, Reason: ${reason}`);

        try {
            const [rows] = await query<any>(
                'SELECT group_id, participant_id FROM participant_sessions WHERE socket_id = ? LIMIT 1',
                [socket.id]
            );
            const row = rows?.[0];
            if (row) {
                // Mark offline immediately; confirm the departure only if they
                // don't reconnect within the grace window (refresh/navigation).
                await query('UPDATE participant_sessions SET is_online = 0, socket_id = NULL WHERE socket_id = ?', [
                    socket.id,
                ]);
                scheduleDeparture(io, row.group_id, row.participant_id);
            }
        } catch (error: any) {
            logger.error(`[Socket] Disconnect update error: ${error.message}`);
        }
    });

    /**
     * Generic Error Handling
     */
    socket.on('error', (error) => {
        logger.error(`[Socket] Socket error for ${socket.id}:`, error);
    });
};
