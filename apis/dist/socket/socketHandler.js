"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const db_1 = require("../config/db");
const logger_1 = __importDefault(require("../utils/logger"));
const verdictScoringService_1 = require("../services/verdictScoringService");
/**
 * Page refreshes, SPA navigation, and React dev double-mounts all produce brief
 * socket disconnects that are NOT real departures. Every departure signal goes
 * through this grace window first — if the participant reconnects within it,
 * nothing happens; only a genuine absence triggers the departure consequences.
 */
const DEPARTURE_GRACE_MS = 12000;
const pendingDepartures = new Map();
function departureKey(groupId, participantId) {
    return `${groupId}:${participantId}`;
}
function cancelPendingDeparture(groupId, participantId) {
    const key = departureKey(groupId, participantId);
    const timer = pendingDepartures.get(key);
    if (timer) {
        clearTimeout(timer);
        pendingDepartures.delete(key);
    }
}
function scheduleDeparture(io, groupId, participantId) {
    const key = departureKey(groupId, participantId);
    if (pendingDepartures.has(key))
        return;
    pendingDepartures.set(key, setTimeout(async () => {
        pendingDepartures.delete(key);
        try {
            // Skip if the participant reconnected during the grace window.
            const [rows] = await (0, db_1.query)('SELECT is_online FROM participant_sessions WHERE group_id = ? AND participant_id = ? LIMIT 1', [groupId, participantId]);
            if (rows?.[0] && Number(rows[0].is_online) === 1)
                return;
            await handlePlayerDeparture(io, groupId, participantId);
        }
        catch (err) {
            logger_1.default.error(`[Socket] departure grace check failed: ${err.message}`);
        }
    }, DEPARTURE_GRACE_MS));
}
/**
 * Resolves the departing session's role, marks it left, and applies the
 * FSD-required consequence: the Investigator leaving ends the game
 * ("Game Incomplete"); anyone else leaving just freezes their slot for the rest of
 * the group (their in-flight question/score handling happens in timerService.ts /
 * verdictScoringService.ts, keyed off `left_at`).
 */
async function handlePlayerDeparture(io, groupId, participantId) {
    const [sessionRows] = await (0, db_1.query)(`SELECT ps.id, gr.role_type FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? LIMIT 1`, [groupId, participantId]);
    const session = sessionRows?.[0];
    await (0, db_1.query)(`UPDATE participant_sessions
            SET is_online = 0, socket_id = NULL, left_at = COALESCE(left_at, NOW())
            WHERE group_id = ? AND participant_id = ?`, [groupId, participantId]);
    await broadcastPresence(io, groupId);
    if (!session)
        return;
    const [groupRows] = await (0, db_1.query)('SELECT status FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const groupStatus = groupRows?.[0]?.status;
    if (groupStatus === 'completed' || groupStatus === 'incomplete')
        return; // game already over
    if (session.role_type === 'investigator') {
        await (0, verdictScoringService_1.markGroupIncomplete)(groupId, 'investigator_left');
    }
    else {
        io.to(`group_${groupId}`).emit('participant_left', { participant_session_id: session.id, frozen: true });
    }
}
/**
 * Broadcasts the group's live presence to everyone in the room so each player's
 * sidebar can show "Available" (online) / "Offline" / "Left" in real time. Sent
 * whenever someone joins, leaves, disconnects, or is marked departed — the
 * client keeps its own snapshot from getGameState only for the initial paint.
 */
async function broadcastPresence(io, groupId) {
    try {
        const [rows] = await (0, db_1.query)('SELECT id, is_online, left_at FROM participant_sessions WHERE group_id = ?', [groupId]);
        const online = (rows || []).filter((r) => Number(r.is_online) === 1).map((r) => r.id);
        const left = (rows || []).filter((r) => r.left_at).map((r) => r.id);
        io.to(`group_${groupId}`).emit('presence_updated', { online, left });
    }
    catch (err) {
        logger_1.default.error(`[Socket] presence broadcast failed: ${err.message}`);
    }
}
/**
 * Socket.IO Handler for Game Activities and Real-time Communications
 */
const setupSocketHandlers = (io, socket) => {
    logger_1.default.debug(`[Socket] User connected: ${socket.id}`);
    /**
     * Join lobby room for live group updates (alias: join_lobby)
     */
    const handleJoinLobby = async (data) => {
        try {
            const { groupId, participantId } = data;
            if (!groupId)
                throw new Error('Group ID is required');
            socket.join(`group_${groupId}`);
            logger_1.default.info(`[Socket] Client joined lobby room: group_${groupId}`);
            if (participantId) {
                cancelPendingDeparture(groupId, participantId);
                try {
                    // Rejoining also clears left_at while the game is still running —
                    // a refreshed player should not stay frozen.
                    await (0, db_1.query)(`UPDATE participant_sessions ps
                            JOIN game_groups gg ON gg.id = ps.group_id
                            SET ps.socket_id = ?, ps.is_online = 1,
                                ps.left_at = IF(gg.status IN ('waiting','active'), NULL, ps.left_at)
                            WHERE ps.group_id = ? AND ps.participant_id = ?`, [socket.id, groupId, participantId]);
                }
                catch {
                    /* participant_sessions may not exist yet during lobby */
                }
            }
            const { buildLobbyPayload } = await Promise.resolve().then(() => __importStar(require('../services/lobbyService')));
            const payload = await buildLobbyPayload(groupId, participantId || null);
            if (payload) {
                socket.emit('lobby_updated', payload);
            }
            // Tell the whole group this player is now online (and give the joining
            // socket a fresh snapshot of everyone else who's already here).
            await broadcastPresence(io, groupId);
            socket.emit('joined_group', { groupId, success: true });
        }
        catch (error) {
            logger_1.default.error(`[Socket] join_lobby error: ${error.message}`);
            socket.emit('socket_error', { message: error.message });
        }
    };
    socket.on('join_lobby', handleJoinLobby);
    socket.on('join_game_group', handleJoinLobby);
    /**
     * Explicit presence resync. The game page loads its initial online snapshot
     * over HTTP (getGameState), which can land AFTER the join broadcast and
     * overwrite it with a stale "everyone offline" set. The client emits this
     * once its snapshot is applied so an authoritative presence event always
     * comes last.
     */
    socket.on('request_presence', async (data) => {
        try {
            if (data?.groupId)
                await broadcastPresence(io, data.groupId);
        }
        catch (error) {
            logger_1.default.error(`[Socket] request_presence error: ${error.message}`);
        }
    });
    /**
     * Organizer dashboard — live event stats
     */
    socket.on('join_organizer_dashboard', async (data) => {
        try {
            const bookingId = data?.bookingId;
            if (!bookingId)
                throw new Error('Booking ID is required');
            socket.join(`organizer_${bookingId}`);
            logger_1.default.info(`[Socket] Organizer joined dashboard room: organizer_${bookingId}`);
            const { buildEventStats } = await Promise.resolve().then(() => __importStar(require('../services/eventStatsService')));
            const stats = await buildEventStats(bookingId);
            if (stats) {
                socket.emit('event_stats_updated', stats);
            }
            socket.emit('joined_organizer_dashboard', { bookingId, success: true });
        }
        catch (error) {
            logger_1.default.error(`[Socket] join_organizer_dashboard error: ${error.message}`);
            socket.emit('socket_error', { message: error.message });
        }
    });
    /**
     * Leave Game Group
     */
    socket.on('leave_game_group', async (data) => {
        try {
            const { groupId, participantId } = data;
            socket.leave(`group_${groupId}`);
            // Mark offline right away, but confirm the departure only after the
            // grace window — a page navigation emits this too.
            await (0, db_1.query)('UPDATE participant_sessions SET is_online = 0 WHERE group_id = ? AND participant_id = ?', [groupId, participantId]);
            await broadcastPresence(io, groupId);
            scheduleDeparture(io, groupId, participantId);
            logger_1.default.info(`[Socket] Participant ${participantId} left group: group_${groupId}`);
        }
        catch (error) {
            logger_1.default.error(`[Socket] leave_game_group error: ${error.message}`);
            socket.emit('socket_error', { message: error.message });
        }
    });
    /**
     * Handle Disconnection
     */
    socket.on('disconnect', async (reason) => {
        logger_1.default.debug(`[Socket] User disconnected: ${socket.id}, Reason: ${reason}`);
        try {
            const [rows] = await (0, db_1.query)('SELECT group_id, participant_id FROM participant_sessions WHERE socket_id = ? LIMIT 1', [socket.id]);
            const row = rows?.[0];
            if (row) {
                // Mark offline immediately; confirm the departure only if they
                // don't reconnect within the grace window (refresh/navigation).
                await (0, db_1.query)('UPDATE participant_sessions SET is_online = 0, socket_id = NULL WHERE socket_id = ?', [
                    socket.id,
                ]);
                await broadcastPresence(io, row.group_id);
                scheduleDeparture(io, row.group_id, row.participant_id);
            }
        }
        catch (error) {
            logger_1.default.error(`[Socket] Disconnect update error: ${error.message}`);
        }
    });
    /**
     * Generic Error Handling
     */
    socket.on('error', (error) => {
        logger_1.default.error(`[Socket] Socket error for ${socket.id}:`, error);
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
