import { Request, Response } from 'express';
import { query, withTransaction } from '../config/db';
import { sendOtpEmail } from '../services/emailService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import moment from 'moment';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';
import { buildEventStats } from '../services/eventStatsService';

export const registerOrganizer = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, company_name, company_website } = req.body;

    //const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '123456';
    const otp_expires_at = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    // Check if organizer already exists
    const [existing] = await query('SELECT id FROM organizers WHERE email = ?', [email]);
    
    let organizerId;
    if (existing.length > 0) {
        organizerId = existing[0].id;
        await query(
            'UPDATE organizers SET name = ?, company_name = ?, company_website = ?, otp = ?, otp_expires_at = ? WHERE id = ?',
            [name, company_name, company_website, otp, otp_expires_at, organizerId]
        );
    } else {
        const [result] = await query(
            'INSERT INTO organizers (name, email, company_name, company_website, otp, otp_expires_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, company_name, company_website, otp, otp_expires_at, 'active']
        );
        organizerId = (result as any).insertId;
    }

    // Send OTP via email (fire-and-forget to avoid blocking response)
    sendOtpEmail(email, otp);

    return successResponse(res, 'Registration initiated. OTP sent to email.', { organizer_id: organizerId });
});

/**
 * Organizer Login - Step 1: Send OTP
 */
export const organizerLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const [rows] = await query('SELECT id FROM organizers WHERE email = ?', [email]);
    if (rows.length === 0) {
        throw new AppError('Organizer not found. Please register first.', 404);
    }

    //const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '123456';
    const otp_expires_at = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    await query(
        'UPDATE organizers SET otp = ?, otp_expires_at = ? WHERE email = ?',
        [otp, otp_expires_at, email]
    );

    // Send OTP via email (fire-and-forget to avoid blocking response)
    sendOtpEmail(email, otp);

    return successResponse(res, 'Login OTP sent to your email.');
});

/**
 * Organizer Login - Step 2: Verify OTP & Return Token
 */
export const verifyLoginOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const [rows] = await query(
        'SELECT id, name, otp, otp_expires_at FROM organizers WHERE email = ?',
        [email]
    );

    if (rows.length === 0) {
        throw new AppError('Organizer not found', 404);
    }

    const organizer = rows[0];

    if (organizer.otp !== otp) {
        throw new AppError('Invalid OTP', 400);
    }

    if (moment().isAfter(moment(organizer.otp_expires_at))) {
        throw new AppError('OTP expired', 400);
    }

    // Clear OTP after successful login
    await query(
        'UPDATE organizers SET otp = NULL, otp_expires_at = NULL WHERE id = ?',
        [organizer.id]
    );

    // Generate JWT Token
    const token = jwt.sign(
        { id: organizer.id, email: email, role: 'organizer' },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '24h' }
    );

    return successResponse(res, 'Logged in successfully.', {
        token,
        organizer: {
            id: organizer.id,
            name: organizer.name,
            email: email
        }
    });
});

/**
 * Organizer Dashboard - Get Purchased Activities & Bookings
 */
export const getOrganizerDashboard = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user.id; // From auth middleware

    // Get all bookings and their associated activities/packages
    const [bookings] = await query(`
        SELECT 
            ob.id as booking_id,
            ob.scheduled_date,
            ob.scheduled_time,
            ob.status as booking_status,
            ob.invitation_link,
            ob.is_rescheduled,
            a.title as activity_name,
            a.cover_image,
            a.icon as activity_icon,
            p.name as package_name,
            p.price as package_price,
            p.max_users,
            (SELECT COUNT(*) FROM game_participants WHERE booking_id = ob.id AND email_verified_at IS NOT NULL) as registered_participants
        FROM organizer_bookings ob
        JOIN activities a ON ob.activity_id = a.id
        JOIN packages p ON ob.package_id = p.id
        WHERE ob.organizer_id = ?
        ORDER BY ob.created_at DESC
    `, [organizerId]);

    const [organizerInfoRows] = await query(
        'SELECT id, name, email, company_name FROM organizers WHERE id = ?',
        [organizerId]
    );

    const organizer = organizerInfoRows[0] || null;

    return successResponse(res, 'Dashboard data retrieved.', {
        organizer,
        bookings,
        total_bookings: bookings.length,
    });
});

/**
 * Get Real-time Event Stats for Organizer Dashboard
 */
export const getEventStats = asyncHandler(async (req: Request, res: Response) => {
    const { booking_id } = req.params;

    const stats = await buildEventStats(booking_id);
    if (!stats) {
        throw new AppError('Booking not found', 404);
    }

    return successResponse(res, 'Event stats retrieved successfully.', stats);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const [rows] = await query(
        'SELECT id, otp, otp_expires_at FROM organizers WHERE email = ?',
        [email]
    );

    if (rows.length === 0) {
        throw new AppError('Organizer not found', 404);
    }

    const organizer = rows[0];

    if (organizer.otp !== otp) {
        throw new AppError('Invalid OTP', 400);
    }

    if (moment().isAfter(moment(organizer.otp_expires_at))) {
        throw new AppError('OTP expired', 400);
    }

    // Mark as verified via email timestamp; keep status value aligned with schema
    await query(
        'UPDATE organizers SET email_verified_at = ?, otp = NULL, otp_expires_at = NULL WHERE id = ?',
        [moment().format('YYYY-MM-DD HH:mm:ss'), organizer.id]
    );

    return successResponse(res, 'Email verified successfully.', { organizer_id: organizer.id });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const [rows] = await query('SELECT id FROM organizers WHERE email = ?', [email]);
    if (rows.length === 0) {
        throw new AppError('Organizer not found', 404);
    }

    //const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '123456';

    const otp_expires_at = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    await query(
        'UPDATE organizers SET otp = ?, otp_expires_at = ? WHERE email = ?',
        [otp, otp_expires_at, email]
    );

    await sendOtpEmail(email, otp);

    return successResponse(res, 'OTP resent successfully.');
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
    const { organizer_id, activity_id, game_id, package_id, scheduled_date, scheduled_time } = req.body;

    // Sequential Step Validation: Check if organizer has verified email
    const [organizer] = await query('SELECT email_verified_at FROM organizers WHERE id = ?', [organizer_id]);
    if (!organizer.length || !organizer[0].email_verified_at) {
        throw new AppError('Organizer must verify email before creating a booking.', 403);
    }

    const [result] = await query(
        'INSERT INTO organizer_bookings (organizer_id, activity_id, game_id, package_id, scheduled_date, scheduled_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [organizer_id, activity_id, game_id, package_id, scheduled_date, scheduled_time, 'pending_activation']
    );

    const bookingId = (result as any).insertId;

    return successResponse(res, 'Booking created successfully.', { booking_id: bookingId });
});

export const getBookingDetails = asyncHandler(async (req: Request, res: Response) => {
    const { booking_id } = req.params;

    // Sequential Step Validation: Check if booking belongs to a verified organizer
    const [rows] = await query(`
        SELECT 
            ob.id as booking_id, 
            ob.scheduled_date, 
            ob.scheduled_time, 
            ob.status as booking_status,
            ob.invitation_link,
            o.name as organizer_name,
            o.email as organizer_email,
            o.email_verified_at as organizer_email_verified_at,
            o.status as organizer_status,
            o.company_name,
            a.title as activity_name,
            ag.title as game_name,
            p.name as package_name,
            p.price as package_price
        FROM organizer_bookings ob
        JOIN organizers o ON ob.organizer_id = o.id
        JOIN activities a ON ob.activity_id = a.id
        LEFT JOIN activity_games ag ON ob.game_id = ag.id
        JOIN packages p ON ob.package_id = p.id
        WHERE ob.id = ?
    `, [booking_id]);

    if (rows.length === 0) {
        throw new AppError('Booking not found', 404);
    }

    if (!rows[0].organizer_email_verified_at) {
        throw new AppError('Organizer must verify email before proceeding to payment.', 403);
    }

    return successResponse(res, 'Booking details retrieved.', rows[0]);
});

export const completeBooking = asyncHandler(async (req: Request, res: Response) => {
    const { 
        booking_id, 
        gst_number, 
        billing_address, 
        city, 
        state, 
        pin_code, 
        payment_method,
        consents 
    } = req.body;

    let invitation_link = '';

    // Start transaction for booking completion and billing record
    await withTransaction(async (conn) => {
        // Sequential Step Validation: Check if booking is in pending_activation status
        const [currentBooking] = await conn.query(
            'SELECT status, organizer_id FROM organizer_bookings WHERE id = ?',
            [booking_id]
        ) as any;

        if (currentBooking.length === 0) {
            throw new AppError('Booking not found', 404);
        }

        if (currentBooking[0].status !== 'pending_activation') {
            throw new AppError('Booking is already completed or invalid for payment.', 400);
        }

        // Check if organizer has verified email
        const [organizer] = await conn.query('SELECT email_verified_at FROM organizers WHERE id = ?', [currentBooking[0].organizer_id]) as any;
        if (!organizer.length || !organizer[0].email_verified_at) {
            throw new AppError('Organizer must verify email before completing payment.', 403);
        }

        // Get booking info for pricing
        const [bookingRows] = await conn.query(
            'SELECT package_id, scheduled_date, scheduled_time FROM organizer_bookings WHERE id = ?',
            [booking_id]
        ) as any;

        if (bookingRows.length === 0) {
            throw new AppError('Booking not found', 404);
        }

        const eventStart = moment(`${bookingRows[0].scheduled_date} ${bookingRows[0].scheduled_time}`, 'YYYY-MM-DD HH:mm:ss');
        const now = moment();
        const maxAllowedSchedule = moment(now).add(5, 'days').endOf('day');

        if (eventStart.isBefore(now)) {
            throw new AppError('Scheduled session must be in the future.', 400);
        }

        if (eventStart.isAfter(maxAllowedSchedule)) {
            throw new AppError('Session must be scheduled within 5 days of payment.', 400);
        }

        const [packageRows] = await conn.query(
            'SELECT price FROM packages WHERE id = ?',
            [bookingRows[0].package_id]
        ) as any;

        const price = parseFloat(packageRows[0]?.price || 0);
        const gstAmount = parseFloat((price * 0.18).toFixed(2)); // Assuming 18% GST
        const totalPayable = parseFloat((price + gstAmount).toFixed(2));

        // Generate Invitation Link
        invitation_link = crypto.randomBytes(10).toString('hex');

        // Insert billing record
        await conn.query(
            'INSERT INTO organizer_billings (booking_id, gst_number, billing_address, city, state, pin_code, package_price, taxes, additional_charges, gst_amount, total_payable, payment_method, payment_status, confirmation_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                booking_id, 
                gst_number || null, 
                billing_address, 
                city, 
                state, 
                pin_code, 
                price, 
                0, // taxes
                0, // additional_charges
                gstAmount, 
                totalPayable, 
                payment_method, 
                'paid', // Assuming payment is confirmed
                JSON.stringify(consents)
            ]
        );

        // Update booking status and save invitation link
        await conn.query(
            'UPDATE organizer_bookings SET status = ?, invitation_link = ? WHERE id = ?',
            ['completed', invitation_link, booking_id]
        );
    });

    return successResponse(res, 'Booking completed successfully.', {
        booking_id,
        invitation_link,
    });
});

export const updateSession = asyncHandler(async (req: Request, res: Response) => {
    const { booking_id, scheduled_date, scheduled_time } = req.body;

    const [rows] = await query(
        'SELECT is_rescheduled, scheduled_date, scheduled_time, status FROM organizer_bookings WHERE id = ?',
        [booking_id]
    );

    if (rows.length === 0) {
        throw new AppError('Booking not found', 404);
    }

    const booking = rows[0];

    // 1. One-time only rule
    if (booking.is_rescheduled) {
        throw new AppError('Reschedule is only allowed once.', 400);
    }

    // 2. Cutoff rule: Reschedule allowed until 1 hour before start
    const eventStart = moment(`${booking.scheduled_date} ${booking.scheduled_time}`, 'YYYY-MM-DD HH:mm:ss');
    const cutoffTime = moment(eventStart).subtract(1, 'hour');
    const now = moment();

    if (now.isAfter(cutoffTime)) {
        throw new AppError(`Rescheduling is only allowed until ${cutoffTime.format('DD MMM YYYY, hh:mm A')} (1 hour before start).`, 400);
    }

    // 3. Ensure game hasn't started or expired
    if (booking.status === 'active' || booking.status === 'expired') {
        throw new AppError('Cannot reschedule an event that has already started or expired.', 400);
    }

    // 4. Payment validity window: completed bookings must remain within 5 days of payment.
    if (booking.status === 'completed') {
        const [billingRows] = await query(
            'SELECT created_at FROM organizer_billings WHERE booking_id = ? ORDER BY id DESC LIMIT 1',
            [booking_id]
        );

        if (billingRows.length > 0) {
            const paymentTime = moment(billingRows[0].created_at);
            const allowedRescheduleUntil = moment(paymentTime).add(5, 'days').endOf('day');
            const newSchedule = moment(`${scheduled_date} ${scheduled_time}`, 'YYYY-MM-DD HH:mm:ss');

            if (newSchedule.isAfter(allowedRescheduleUntil)) {
                throw new AppError('Rescheduled session must remain within 5 days of payment.', 400);
            }
        }
    }

    await query(
        'UPDATE organizer_bookings SET scheduled_date = ?, scheduled_time = ?, is_rescheduled = 1 WHERE id = ?',
        [scheduled_date, scheduled_time, booking_id]
    );

    return successResponse(res, 'Session rescheduled successfully.');
});
