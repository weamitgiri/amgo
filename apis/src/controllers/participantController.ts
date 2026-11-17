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
import {
    assertBrowserNotBoundToOtherParticipant,
    assertCanStartJoin,
    assignParticipantToGroup,
} from '../services/participantGroupService';
import { emitEventStatsUpdate } from '../services/eventStatsService';
import { generateNumericOtp } from '../utils/otp';
import { getOtpExpiresAt, OTP_RESEND_COOLDOWN_SECONDS } from '../services/otpConfig';
import { assertResendCooldown } from '../services/otpResend';
import { notifyParticipantJoined } from '../services/notificationService';
import { normaliseCode } from '../services/sessionCodeService';

/**
 * Verify Invitation Link and Get Booking Info
 * Increments link click counter
 */
export const verifyInvitation = asyncHandler(async (req: Request, res: Response) => {
    const { link_token } = req.params;

    const [rows] = await query(
        `SELECT ob.id, ob.status, ob.game_id, ob.activity_id, ob.scheduled_date, ob.scheduled_time,
            a.title AS activity_title, a.description AS activity_description,
            a.lobby_wait_secs,
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

    // Entry window is admin-configurable per activity (activities.lobby_wait_secs).
    const lobbyWaitSecs = Number(booking.lobby_wait_secs) || 900;
    const joinWindowEnd = scheduleStart.clone().add(lobbyWaitSecs, 'seconds');
    const now = moment();
    const isPending = now.isBefore(scheduleStart);
    const isJoin = now.isSameOrAfter(scheduleStart) && now.isSameOrBefore(joinWindowEnd);
    const isExpired = now.isAfter(joinWindowEnd);

    if (isExpired) {
        throw new AppError(
            `Access Denied: You have joined after the allowed time. The session started at ${scheduleStart.format('h:mm A')} and entry was closed at ${joinWindowEnd.format('h:mm A')}. Please contact the Organiser for assistance.`,
            403
        );
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
    await assertBrowserNotBoundToOtherParticipant(req.get('x-participant-token'), booking_id, normalizedEmail);
    await assertCanStartJoin(booking_id, normalizedEmail);

    const [existing] = await query(
        'SELECT id, join_token FROM game_participants WHERE LOWER(email) = ? AND booking_id = ?',
        [normalizedEmail, booking_id]
    );

    if (existing.length === 0) {
        const { getBookingLimits } = await import('../services/eventStatsService');
        const limits = await getBookingLimits(booking_id);
        if (limits && limits.maxUsers > 0) {
            // Count only VERIFIED participants — the same count the dashboard shows
            // and the OTP-verify step enforces (under a booking row lock). Counting
            // every row also counted people who requested an OTP but never verified
            // (typo'd email, abandoned attempt), so e.g. 9 joined + 1 abandoned
            // attempt blocked the genuine 10th participant.
            const [totalRows] = await query(
                'SELECT COUNT(*) as total FROM game_participants WHERE booking_id = ? AND email_verified_at IS NOT NULL',
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

    const otp = generateNumericOtp(6);
    const otp_expires_at = await getOtpExpiresAt();
    const join_token = crypto.randomBytes(32).toString('hex');

    // Get game_id from booking
    const [bookingRows] = await query('SELECT game_id FROM organizer_bookings WHERE id = ?', [booking_id]);
    if (bookingRows.length === 0) throw new AppError('Booking not found', 404);
    const game_id = bookingRows[0].game_id;

    if (existing.length > 0) {
        // Keep the participant's existing join_token stable across re-joins and OTP
        // resends. The token is this participant's persistent credential — the
        // browser lock and the participant game-API auth both key on it — so
        // regenerating it here would silently invalidate a still-valid session on
        // another device. Only mint one for a legacy row that somehow has none.
        const preservedToken = existing[0].join_token || join_token;
        await query(
            'UPDATE game_participants SET name = ?, otp = ?, otp_expires_at = ?, otp_sent_at = NOW(), join_token = ? WHERE id = ?',
            [name, otp, otp_expires_at, preservedToken, existing[0].id]
        );
    } else {
        await query(
            'INSERT INTO game_participants (booking_id, game_id, name, email, otp, otp_expires_at, otp_sent_at, join_token, status) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)',
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
 * Participant: Resend OTP to an already-joined (but perhaps not yet verified)
 * participant. Regenerates the OTP for the existing row, honouring the 60s
 * resend cooldown; it does NOT re-run the join/group logic or mint a new token.
 */
export const resendParticipantOtp = asyncHandler(async (req: Request, res: Response) => {
    const { booking_id, email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    await assertBrowserNotBoundToOtherParticipant(req.get('x-participant-token'), booking_id, normalizedEmail);

    const [rows] = await query(
        'SELECT id, email_verified_at FROM game_participants WHERE LOWER(email) = ? AND booking_id = ?',
        [normalizedEmail, booking_id]
    );
    if (rows.length === 0) throw new AppError('Please join first before requesting a code.', 404);
    if (rows[0].email_verified_at) throw new AppError('This email is already verified.', 400);

    await assertResendCooldown('game_participants', 'id', rows[0].id);

    const otp = generateNumericOtp(6);
    const otp_expires_at = await getOtpExpiresAt();
    await query(
        'UPDATE game_participants SET otp = ?, otp_expires_at = ?, otp_sent_at = NOW() WHERE id = ?',
        [otp, otp_expires_at, rows[0].id]
    );

    // Fire-and-forget: SMTP can block and exceed the client timeout.
    sendOtpEmail(normalizedEmail, otp);

    const payload: { email: string; resend_cooldown: number; dev_otp?: string } = {
        email: normalizedEmail,
        resend_cooldown: OTP_RESEND_COOLDOWN_SECONDS,
    };
    if (process.env.NODE_ENV === 'development') {
        payload.dev_otp = otp;
    }

    return successResponse(res, 'A new code has been sent to your email.', payload);
});

/**
 * Participant Step 2: Verify OTP and Assign Group
 */
export const verifyParticipantOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, booking_id } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    await assertBrowserNotBoundToOtherParticipant(req.get('x-participant-token'), booking_id, normalizedEmail);

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
 * Participant Join via shared Login Code (Option A — single session code).
 *
 * The employee enters their full name and the one login code the organiser
 * shared for this session. There is no email and no OTP: a matching code IS the
 * verification, so the participant is marked verified and assigned to a group in
 * one step, then lands in the lobby. The downstream lobby/game flow, grouping,
 * timing and scoring are completely unchanged — only the join/auth step differs.
 */
export const participantJoinWithCode = asyncHandler(async (req: Request, res: Response) => {
    const { booking_id, name, code } = req.body;

    const trimmedName = String(name ?? '').trim();
    if (!trimmedName) throw new AppError('Name is required', 400);

    const [bookingRows] = await query(
        `SELECT ob.id, ob.status, ob.game_id, ob.scheduled_date, ob.scheduled_time,
                a.lobby_wait_secs
         FROM organizer_bookings ob
         JOIN activities a ON a.id = ob.activity_id
         WHERE ob.id = ? LIMIT 1`,
        [booking_id]
    );
    if (bookingRows.length === 0) throw new AppError('Booking not found', 404);
    const booking = bookingRows[0];

    if (booking.status === 'expired' || booking.status === 'cancelled') {
        throw new AppError('This session link has expired', 400);
    }

    // Entry window — identical rule to the OTP flow (verifyInvitation): entry
    // closes lobby_wait_secs after the scheduled start.
    if (booking.scheduled_date && booking.scheduled_time) {
        const scheduledDate = moment(booking.scheduled_date).isValid()
            ? moment(booking.scheduled_date).format('YYYY-MM-DD')
            : String(booking.scheduled_date);
        const scheduledTime = moment(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true).isValid()
            ? moment(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true).format('HH:mm:ss')
            : String(booking.scheduled_time);
        const scheduleStart = moment(`${scheduledDate} ${scheduledTime}`, 'YYYY-MM-DD HH:mm:ss');
        if (scheduleStart.isValid()) {
            const lobbyWaitSecs = Number(booking.lobby_wait_secs) || 900;
            const joinWindowEnd = scheduleStart.clone().add(lobbyWaitSecs, 'seconds');
            if (moment().isAfter(joinWindowEnd)) {
                throw new AppError(
                    `Access Denied: entry closed at ${joinWindowEnd.format('h:mm A')}. Please contact the Organiser.`,
                    403
                );
            }
        }
    }

    const enteredCode = normaliseCode(code);
    if (!enteredCode) throw new AppError('Login code is required', 400);

    // One participant per browser. If this browser already holds a token for a
    // participant in THIS booking, treat the submit as a rejoin (return the same
    // participant, no duplicate row). If the token belongs to an active game in a
    // DIFFERENT booking, block — mirrors assertBrowserNotBoundToOtherParticipant.
    const browserToken = req.get('x-participant-token');
    if (typeof browserToken === 'string' && /^[a-f0-9]{64}$/.test(browserToken)) {
        const [boundRows] = await query(
            `SELECT gp.id, gp.booking_id, gp.name, gp.group_id, gg.group_name, gg.status AS group_status
             FROM game_participants gp
             JOIN game_groups gg ON gg.id = gp.group_id
             WHERE gp.join_token = ? AND gp.email_verified_at IS NOT NULL AND gp.status <> 'finished'
             LIMIT 1`,
            [browserToken]
        );
        if ((boundRows as any[]).length > 0) {
            const bound = boundRows[0];
            if (String(bound.booking_id) === String(booking_id)) {
                return successResponse(res, 'Rejoined this session.', {
                    participant_id: bound.id,
                    name: bound.name,
                    join_token: browserToken,
                    group_id: bound.group_id,
                    group_name: bound.group_name,
                });
            }
            if (!['completed', 'incomplete', 'finished'].includes(String(bound.group_status))) {
                throw new AppError(
                    `This browser is already joined to an active game as ${bound.name}. ` +
                        'Leave or finish that game before joining a different one.',
                    409
                );
            }
        }
    }

    // Look up the per-employee login code issued for this booking (Option B / PDF).
    const [codeRows] = await query(
        'SELECT id, participant_id FROM participant_login_codes WHERE booking_id = ? AND code = ? LIMIT 1',
        [booking_id, enteredCode]
    );
    const codeRow = (codeRows as any[])[0];
    if (!codeRow) {
        throw new AppError('Invalid login code. Please check the code shared by your organiser.', 403);
    }
    if (codeRow.participant_id) {
        // Already claimed. The same browser would have rejoined above via its token,
        // so reaching here means a different person is reusing someone else's code.
        throw new AppError('This login code has already been used. Each code works for one participant.', 409);
    }

    const join_token = crypto.randomBytes(32).toString('hex');

    const result = await withTransaction(async (conn) => {
        // Lock the booking so the code claim and insert are race-safe.
        await conn.query('SELECT id FROM organizer_bookings WHERE id = ? FOR UPDATE', [booking_id]);

        // A validated code is the verification, so set email_verified_at now.
        // email stays NULL — code participants have no email.
        const [insertRes] = (await conn.query(
            `INSERT INTO game_participants
                (booking_id, game_id, name, email, email_verified_at, join_token, status, created_at, updated_at)
             VALUES (?, ?, ?, NULL, NOW(), ?, 'joined', NOW(), NOW())`,
            [booking_id, booking.game_id, trimmedName, join_token]
        )) as any;
        const participantId = insertRes.insertId;

        // Claim the code for this participant — single-use and race-safe: the
        // WHERE participant_id IS NULL means only the first claimant wins.
        const [claim] = (await conn.query(
            'UPDATE participant_login_codes SET participant_id = ?, used_at = NOW() WHERE id = ? AND participant_id IS NULL',
            [participantId, codeRow.id]
        )) as any;
        if (!claim || Number(claim.affectedRows || 0) === 0) {
            throw new AppError('This login code was just used. Please try a different code.', 409);
        }

        // Reuse the existing group-assignment logic. It keys its "already in a
        // group?" lookup on email; passing the fresh join_token (never an email)
        // makes that lookup miss, so this is treated as a brand-new assignment.
        const { groupId, groupName } = await assignParticipantToGroup(conn, booking_id, participantId, join_token);

        return {
            participant_id: participantId,
            name: trimmedName,
            join_token,
            group_id: groupId,
            group_name: groupName,
        };
    });

    const { io } = require('../server');
    if (io) {
        await emitLobbyUpdate(io, result.group_id);
        await emitEventStatsUpdate(io, booking_id);
        await notifyParticipantJoined(
            io,
            booking_id,
            { id: result.participant_id, name: result.name },
            { id: result.group_id, name: result.group_name }
        );
    }

    return successResponse(res, 'Joined successfully. Entering lobby...', result);
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
