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
exports.getGameSummary = exports.getLobbyInfo = exports.verifyParticipantOtp = exports.resendParticipantOtp = exports.participantJoin = exports.verifyInvitation = void 0;
const db_1 = require("../config/db");
const emailService_1 = require("../services/emailService");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const AppError_1 = require("../utils/AppError");
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const lobbyService_1 = require("../services/lobbyService");
const gameSummaryService_1 = require("../services/gameSummaryService");
const participantGroupService_1 = require("../services/participantGroupService");
const eventStatsService_1 = require("../services/eventStatsService");
const otp_1 = require("../utils/otp");
const otpConfig_1 = require("../services/otpConfig");
const otpResend_1 = require("../services/otpResend");
const notificationService_1 = require("../services/notificationService");
/**
 * Verify Invitation Link and Get Booking Info
 * Increments link click counter
 */
exports.verifyInvitation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { link_token } = req.params;
    const [rows] = await (0, db_1.query)(`SELECT ob.id, ob.status, ob.game_id, ob.activity_id, ob.scheduled_date, ob.scheduled_time,
            a.title AS activity_title, a.description AS activity_description,
            a.lobby_wait_secs,
            o.name AS organizer_name, o.company_name AS organizer_company
         FROM organizer_bookings ob
         JOIN activities a ON ob.activity_id = a.id
         JOIN organizers o ON ob.organizer_id = o.id
         WHERE ob.invitation_link = ?`, [link_token]);
    if (rows.length === 0) {
        throw new AppError_1.AppError('Invalid invitation link', 404);
    }
    const booking = rows[0];
    // Only allow joining if booking is completed/active
    if (booking.status === 'expired' || booking.status === 'cancelled') {
        throw new AppError_1.AppError('This invitation link has expired', 400);
    }
    if (!booking.scheduled_date || !booking.scheduled_time) {
        throw new AppError_1.AppError('Event schedule information is not available yet', 400);
    }
    const scheduledDate = (0, moment_1.default)(booking.scheduled_date).isValid()
        ? (0, moment_1.default)(booking.scheduled_date).format('YYYY-MM-DD')
        : String(booking.scheduled_date);
    const scheduledTime = (0, moment_1.default)(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment_1.default.ISO_8601], true).isValid()
        ? (0, moment_1.default)(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment_1.default.ISO_8601], true).format('HH:mm:ss')
        : String(booking.scheduled_time);
    const scheduleStart = (0, moment_1.default)(`${scheduledDate} ${scheduledTime}`, 'YYYY-MM-DD HH:mm:ss');
    if (!scheduleStart.isValid()) {
        throw new AppError_1.AppError('Event schedule information is invalid', 400);
    }
    // Entry window is admin-configurable per activity (activities.lobby_wait_secs).
    const lobbyWaitSecs = Number(booking.lobby_wait_secs) || 900;
    const joinWindowEnd = scheduleStart.clone().add(lobbyWaitSecs, 'seconds');
    const now = (0, moment_1.default)();
    const isPending = now.isBefore(scheduleStart);
    const isJoin = now.isSameOrAfter(scheduleStart) && now.isSameOrBefore(joinWindowEnd);
    const isExpired = now.isAfter(joinWindowEnd);
    if (isExpired) {
        throw new AppError_1.AppError(`Access Denied: You have joined after the allowed time. The session started at ${scheduleStart.format('h:mm A')} and entry was closed at ${joinWindowEnd.format('h:mm A')}. Please contact the Organiser for assistance.`, 403);
    }
    // Increment link clicks
    await (0, db_1.query)('UPDATE organizer_bookings SET link_clicks = link_clicks + 1 WHERE id = ?', [booking.id]);
    const { io } = require('../server');
    if (io) {
        const { emitEventStatsUpdate } = await Promise.resolve().then(() => __importStar(require('../services/eventStatsService')));
        await emitEventStatsUpdate(io, booking.id);
    }
    return (0, apiResponse_1.successResponse)(res, 'Invitation link is active', {
        booking_id: booking.id,
        activity_id: booking.activity_id,
        activity_title: booking.activity_title,
        activity_description: booking.activity_description,
        organizer_name: booking.organizer_name,
        organizer_company: booking.organizer_company,
        scheduled_date: booking.scheduled_date,
        scheduled_time: booking.scheduled_time,
        schedule_start: scheduleStart.toISOString(),
        join_window_ends_at: joinWindowEnd.toISOString(),
        is_pending: isPending,
        is_join: isJoin,
        is_active: !isPending && !isExpired,
    });
});
/**
 * Participant Join - Step 1: Submit Name & Email
 */
exports.participantJoin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { booking_id, name, email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    await (0, participantGroupService_1.assertBrowserNotBoundToOtherParticipant)(req.get('x-participant-token'), booking_id, normalizedEmail);
    await (0, participantGroupService_1.assertCanStartJoin)(booking_id, normalizedEmail);
    const [existing] = await (0, db_1.query)('SELECT id, join_token FROM game_participants WHERE LOWER(email) = ? AND booking_id = ?', [normalizedEmail, booking_id]);
    if (existing.length === 0) {
        const { getBookingLimits } = await Promise.resolve().then(() => __importStar(require('../services/eventStatsService')));
        const limits = await getBookingLimits(booking_id);
        if (limits && limits.maxUsers > 0) {
            // Count only VERIFIED participants — the same count the dashboard shows
            // and the OTP-verify step enforces (under a booking row lock). Counting
            // every row also counted people who requested an OTP but never verified
            // (typo'd email, abandoned attempt), so e.g. 9 joined + 1 abandoned
            // attempt blocked the genuine 10th participant.
            const [totalRows] = await (0, db_1.query)('SELECT COUNT(*) as total FROM game_participants WHERE booking_id = ? AND email_verified_at IS NOT NULL', [booking_id]);
            if (Number(totalRows[0]?.total ?? 0) >= limits.maxUsers) {
                throw new AppError_1.AppError(`Join limit reached. This package allows a maximum of ${limits.maxUsers} participants.`, 403);
            }
        }
    }
    const otp = (0, otp_1.generateNumericOtp)(6);
    const otp_expires_at = await (0, otpConfig_1.getOtpExpiresAt)();
    const join_token = crypto_1.default.randomBytes(32).toString('hex');
    // Get game_id from booking
    const [bookingRows] = await (0, db_1.query)('SELECT game_id FROM organizer_bookings WHERE id = ?', [booking_id]);
    if (bookingRows.length === 0)
        throw new AppError_1.AppError('Booking not found', 404);
    const game_id = bookingRows[0].game_id;
    if (existing.length > 0) {
        // Keep the participant's existing join_token stable across re-joins and OTP
        // resends. The token is this participant's persistent credential — the
        // browser lock and the participant game-API auth both key on it — so
        // regenerating it here would silently invalidate a still-valid session on
        // another device. Only mint one for a legacy row that somehow has none.
        const preservedToken = existing[0].join_token || join_token;
        await (0, db_1.query)('UPDATE game_participants SET name = ?, otp = ?, otp_expires_at = ?, otp_sent_at = NOW(), join_token = ? WHERE id = ?', [name, otp, otp_expires_at, preservedToken, existing[0].id]);
    }
    else {
        await (0, db_1.query)('INSERT INTO game_participants (booking_id, game_id, name, email, otp, otp_expires_at, otp_sent_at, join_token, status) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)', [booking_id, game_id, name, normalizedEmail, otp, otp_expires_at, join_token, 'joined']);
    }
    // Fire-and-forget: SMTP can block 30s+ and exceed the client timeout
    (0, emailService_1.sendOtpEmail)(email, otp);
    const payload = { email };
    if (process.env.NODE_ENV === 'development') {
        payload.dev_otp = otp;
    }
    return (0, apiResponse_1.successResponse)(res, 'OTP sent to your email.', payload);
});
/**
 * Participant: Resend OTP to an already-joined (but perhaps not yet verified)
 * participant. Regenerates the OTP for the existing row, honouring the 60s
 * resend cooldown; it does NOT re-run the join/group logic or mint a new token.
 */
exports.resendParticipantOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { booking_id, email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    await (0, participantGroupService_1.assertBrowserNotBoundToOtherParticipant)(req.get('x-participant-token'), booking_id, normalizedEmail);
    const [rows] = await (0, db_1.query)('SELECT id, email_verified_at FROM game_participants WHERE LOWER(email) = ? AND booking_id = ?', [normalizedEmail, booking_id]);
    if (rows.length === 0)
        throw new AppError_1.AppError('Please join first before requesting a code.', 404);
    if (rows[0].email_verified_at)
        throw new AppError_1.AppError('This email is already verified.', 400);
    await (0, otpResend_1.assertResendCooldown)('game_participants', 'id', rows[0].id);
    const otp = (0, otp_1.generateNumericOtp)(6);
    const otp_expires_at = await (0, otpConfig_1.getOtpExpiresAt)();
    await (0, db_1.query)('UPDATE game_participants SET otp = ?, otp_expires_at = ?, otp_sent_at = NOW() WHERE id = ?', [otp, otp_expires_at, rows[0].id]);
    // Fire-and-forget: SMTP can block and exceed the client timeout.
    (0, emailService_1.sendOtpEmail)(normalizedEmail, otp);
    const payload = {
        email: normalizedEmail,
        resend_cooldown: otpConfig_1.OTP_RESEND_COOLDOWN_SECONDS,
    };
    if (process.env.NODE_ENV === 'development') {
        payload.dev_otp = otp;
    }
    return (0, apiResponse_1.successResponse)(res, 'A new code has been sent to your email.', payload);
});
/**
 * Participant Step 2: Verify OTP and Assign Group
 */
exports.verifyParticipantOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp, booking_id } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    await (0, participantGroupService_1.assertBrowserNotBoundToOtherParticipant)(req.get('x-participant-token'), booking_id, normalizedEmail);
    const result = await (0, db_1.withTransaction)(async (conn) => {
        await conn.query('SELECT id FROM organizer_bookings WHERE id = ? FOR UPDATE', [booking_id]);
        const [rows] = await conn.query('SELECT id, otp, otp_expires_at, name, join_token, email_verified_at FROM game_participants WHERE email = ? AND booking_id = ?', [normalizedEmail, booking_id]);
        if (rows.length === 0)
            throw new AppError_1.AppError('Participant not found', 404);
        const participant = rows[0];
        if (String(participant.otp) !== String(otp))
            throw new AppError_1.AppError('Invalid OTP', 400);
        if ((0, moment_1.default)().isAfter((0, moment_1.default)(participant.otp_expires_at)))
            throw new AppError_1.AppError('OTP expired', 400);
        const isNewJoin = !participant.email_verified_at;
        if (isNewJoin) {
            await (0, participantGroupService_1.assertCanStartJoin)(booking_id, normalizedEmail);
            await conn.query('UPDATE game_participants SET email_verified_at = ?, otp = NULL, otp_expires_at = NULL WHERE id = ?', [(0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss'), participant.id]);
        }
        const { groupId, groupName, alreadyVerified } = await (0, participantGroupService_1.assignParticipantToGroup)(conn, booking_id, participant.id, normalizedEmail);
        return {
            participant_id: participant.id,
            name: participant.name,
            join_token: participant.join_token,
            group_id: groupId,
            group_name: groupName,
            is_new_join: isNewJoin && !alreadyVerified,
        };
    });
    const { io } = require('../server');
    if (io) {
        await (0, lobbyService_1.emitLobbyUpdate)(io, result.group_id);
        await (0, eventStatsService_1.emitEventStatsUpdate)(io, booking_id);
        if (result.is_new_join) {
            await (0, notificationService_1.notifyParticipantJoined)(io, booking_id, {
                id: result.participant_id,
                name: result.name,
            }, {
                id: result.group_id,
                name: result.group_name,
            });
        }
    }
    return (0, apiResponse_1.successResponse)(res, 'Verified successfully. Entering lobby...', result);
});
/**
 * Get Lobby Info
 */
exports.getLobbyInfo = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id;
    const payload = await (0, lobbyService_1.buildLobbyPayload)(group_id, participantId || null);
    if (!payload) {
        throw new AppError_1.AppError('Group not found', 404);
    }
    return (0, apiResponse_1.successResponse)(res, 'Lobby info retrieved', payload);
});
/**
 * Case summary / game page data (activity settings + game content from admin)
 */
exports.getGameSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id;
    const payload = await (0, gameSummaryService_1.buildGameSummaryPayload)(group_id, participantId || null);
    if (!payload) {
        throw new AppError_1.AppError('Game session not found', 404);
    }
    return (0, apiResponse_1.successResponse)(res, 'Game summary retrieved', payload);
});
