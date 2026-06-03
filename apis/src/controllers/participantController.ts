import { Request, Response } from 'express';
import { query, withTransaction } from '../config/db';
import { sendOtpEmail } from '../services/emailService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import moment from 'moment';
import crypto from 'crypto';
import { buildLobbyPayload, emitLobbyUpdate } from '../services/lobbyService';
import { buildGameSummaryPayload } from '../services/gameSummaryService';
import { assertCanStartJoin, assignParticipantToGroup } from '../services/participantGroupService';
import { emitEventStatsUpdate } from '../services/eventStatsService';
import { notifyParticipantJoined } from '../services/notificationService';

/**
 * Verify Invitation Link and Get Booking Info
 * Increments link click counter
 */
export const verifyInvitation = asyncHandler(async (req: Request, res: Response) => {
    const { link_token } = req.params;

    const [rows] = await query(
        `SELECT ob.id, ob.status, ob.game_id, ob.activity_id, ob.scheduled_date, ob.scheduled_time,
            a.title AS activity_title, a.description AS activity_description,
            o.name AS organizer_name, o.company_name AS organizer_company
         FROM organizer_bookings ob
         JOIN activities a ON ob.activity_id = a.id
         JOIN organizers o ON ob.organizer_id = o.id
         WHERE ob.invitation_link = ?`,
        [link_token]
    );

    if (rows.length === 0) {
        throw new AppError('Invalid invitation link', 404);
    }

    const booking = rows[0];

    // Only allow joining if booking is completed/active
    if (booking.status === 'expired' || booking.status === 'cancelled') {
        throw new AppError('This invitation link has expired', 400);
    }

    if (!booking.scheduled_date || !booking.scheduled_time) {
        throw new AppError('Event schedule information is not available yet', 400);
    }

    const scheduledDate = moment(booking.scheduled_date).isValid()
        ? moment(booking.scheduled_date).format('YYYY-MM-DD')
        : String(booking.scheduled_date);
    const scheduledTime = moment(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true).isValid()
        ? moment(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true).format('HH:mm:ss')
        : String(booking.scheduled_time);

    const scheduleStart = moment(`${scheduledDate} ${scheduledTime}`, 'YYYY-MM-DD HH:mm:ss');
    if (!scheduleStart.isValid()) {
        throw new AppError('Event schedule information is invalid', 400);
    }

    const joinWindowEnd = scheduleStart.clone().add(15, 'minutes');
    const now = moment();
    const isPending = now.isBefore(scheduleStart);
    const isJoin = now.isSameOrAfter(scheduleStart) && now.isSameOrBefore(joinWindowEnd);
    const isExpired = now.isAfter(joinWindowEnd);

    if (isExpired) {
        throw new AppError('This invitation link has expired', 400);
    }

    // Increment link clicks
    await query('UPDATE organizer_bookings SET link_clicks = link_clicks + 1 WHERE id = ?', [booking.id]);

    const { io } = require('../server');
    if (io) {
        const { emitEventStatsUpdate } = await import('../services/eventStatsService');
        await emitEventStatsUpdate(io, booking.id);
    }

    return successResponse(res, 'Invitation link is active', {
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
export const participantJoin = asyncHandler(async (req: Request, res: Response) => {
    const { booking_id, name, email } = req.body;

    const normalizedEmail = String(email).trim().toLowerCase();
    await assertCanStartJoin(booking_id, normalizedEmail);

    const [existing] = await query(
        'SELECT id FROM game_participants WHERE LOWER(email) = ? AND booking_id = ?',
        [normalizedEmail, booking_id]
    );

    if (existing.length === 0) {
        const { getBookingLimits } = await import('../services/eventStatsService');
        const limits = await getBookingLimits(booking_id);
        if (limits && limits.maxUsers > 0) {
            const [totalRows] = await query(
                'SELECT COUNT(*) as total FROM game_participants WHERE booking_id = ?',
                [booking_id]
            );
            if (Number(totalRows[0]?.total ?? 0) >= limits.maxUsers) {
                throw new AppError(
                    `Join limit reached. This package allows a maximum of ${limits.maxUsers} participants.`,
                    403
                );
            }
        }
    }

    //const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '123456';
    const otp_expires_at = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const join_token = crypto.randomBytes(32).toString('hex');

    // Get game_id from booking
    const [bookingRows] = await query('SELECT game_id FROM organizer_bookings WHERE id = ?', [booking_id]);
    if (bookingRows.length === 0) throw new AppError('Booking not found', 404);
    const game_id = bookingRows[0].game_id;

    if (existing.length > 0) {
        await query(
            'UPDATE game_participants SET name = ?, otp = ?, otp_expires_at = ?, join_token = ? WHERE id = ?',
            [name, otp, otp_expires_at, join_token, existing[0].id]
        );
    } else {
        await query(
            'INSERT INTO game_participants (booking_id, game_id, name, email, otp, otp_expires_at, join_token, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [booking_id, game_id, name, normalizedEmail, otp, otp_expires_at, join_token, 'joined']
        );
    }

    // Fire-and-forget: SMTP can block 30s+ and exceed the client timeout
    sendOtpEmail(email, otp);

    const payload: { email: string; dev_otp?: string } = { email };
    if (process.env.NODE_ENV === 'development') {
        payload.dev_otp = otp;
    }

    return successResponse(res, 'OTP sent to your email.', payload);
});

/**
 * Participant Step 2: Verify OTP and Assign Group
 */
export const verifyParticipantOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, booking_id } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await withTransaction(async (conn) => {
        await conn.query('SELECT id FROM organizer_bookings WHERE id = ? FOR UPDATE', [booking_id]);

        const [rows] = await conn.query(
            'SELECT id, otp, otp_expires_at, name, join_token, email_verified_at FROM game_participants WHERE email = ? AND booking_id = ?',
            [normalizedEmail, booking_id]
        ) as any;

        if (rows.length === 0) throw new AppError('Participant not found', 404);
        const participant = rows[0];

        if (String(participant.otp) !== String(otp)) throw new AppError('Invalid OTP', 400);
        if (moment().isAfter(moment(participant.otp_expires_at))) throw new AppError('OTP expired', 400);

        const isNewJoin = !participant.email_verified_at;

        if (isNewJoin) {
            await assertCanStartJoin(booking_id, normalizedEmail);
            await conn.query(
                'UPDATE game_participants SET email_verified_at = ?, otp = NULL, otp_expires_at = NULL WHERE id = ?',
                [moment().format('YYYY-MM-DD HH:mm:ss'), participant.id]
            );
        }

        const { groupId, groupName, alreadyVerified } = await assignParticipantToGroup(
            conn,
            booking_id,
            participant.id,
            normalizedEmail
        );

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
        await emitLobbyUpdate(io, result.group_id);
        await emitEventStatsUpdate(io, booking_id);
        if (result.is_new_join) {
            await notifyParticipantJoined(io, booking_id, {
                id: result.participant_id,
                name: result.name,
            }, {
                id: result.group_id,
                name: result.group_name,
            });
        }
    }

    return successResponse(res, 'Verified successfully. Entering lobby...', result);
});

/**
 * Get Lobby Info
 */
export const getLobbyInfo = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id as string | undefined;

    const payload = await buildLobbyPayload(group_id, participantId || null);
    if (!payload) {
        throw new AppError('Group not found', 404);
    }

    return successResponse(res, 'Lobby info retrieved', payload);
});

/**
 * Case summary / game page data (activity settings + game content from admin)
 */
export const getGameSummary = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id as string | undefined;

    const payload = await buildGameSummaryPayload(group_id, participantId || null);
    if (!payload) {
        throw new AppError('Game session not found', 404);
    }

    return successResponse(res, 'Game summary retrieved', payload);
});
