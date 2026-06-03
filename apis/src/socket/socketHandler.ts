import { Server, Socket } from 'socket.io';
import { query } from '../config/db';
import logger from '../utils/logger';

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
                try {
                    await query(
                        'UPDATE participant_sessions SET socket_id = ?, is_online = 1 WHERE group_id = ? AND participant_id = ?',
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
    socket.on('leave_game_group', async (data: { groupId: string, participantId: string }) => {
        try {
            const { groupId, participantId } = data;
            socket.leave(`group_${groupId}`);
            
            // Update online status
            await query(
                'UPDATE participant_sessions SET is_online = 0, socket_id = NULL WHERE group_id = ? AND participant_id = ?',
                [groupId, participantId]
            );

            logger.info(`[Socket] Participant ${participantId} left group: group_${groupId}`);
            socket.to(`group_${groupId}`).emit('player_left', { 
                participantId,
                timestamp: new Date().toISOString()
            });
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
            // Find and update the session that was using this socket
            await query(
                'UPDATE participant_sessions SET is_online = 0, socket_id = NULL WHERE socket_id = ?',
                [socket.id]
            );
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
