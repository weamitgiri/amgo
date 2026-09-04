import { Request, Response } from 'express';
import { query, withTransaction } from '../config/db';
import { sendOtpEmail } from '../services/emailService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import moment from 'moment';
import jwt from 'jsonwebtoken';

import { buildEventStats } from '../services/eventStatsService';
import { ensureOrganizerStatusColumns } from '../utils/schemaHelpers';
import { generateNumericOtp } from '../utils/otp';
import { getJwtSecret } from '../utils/jwtSecret';
import {
    PAYMENT_METHODS,
    PaymentMethod,
    activateBooking,
    assertMethodAllowed,
    attachRazorpayOrder,
    calculateBookingAmount,
    createPaymentRecord,
} from '../services/paymentService';

// Total number of days a session may be scheduled/rescheduled within, counting
// the payment day itself. So a payment on the 27th allows dates through the 31st
// (27 + 4). Mirrors SCHEDULE_WINDOW_DAYS on the frontend.
const SCHEDULE_WINDOW_DAYS = 5;

// Mirrors frontend/src/utils/common.ts::isCookAndCreateSlug's fallback rule
// (the two codebases can't share a module) — used only to scope the
// template-completeness guard in createBooking below to Cook & Create
// activities, never Mystery ones.
function isCookAndCreateSlug(slug: string | null | undefined): boolean {
    if (!slug) return false;
    return slug.trim().toLowerCase().startsWith('cook');
}

export const registerOrganizer = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, company_name, company_website } = req.body;

    const otp = generateNumericOtp(6);
    const otp_expires_at = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    // Ensure schema has payment/account columns (avoid runtime SQL errors)
    await ensureOrganizerStatusColumns();

    // Check if organizer already exists
    const [existing] = await query('SELECT id, email_verified_at FROM organizers WHERE email = ?', [email]);
    
    let organizerId;
    if (existing.length > 0) {
        if (existing[0].email_verified_at) {
            throw new AppError('You already registered this email id. Please login.', 409);
        }

        organizerId = existing[0].id;
        await query(
            'UPDATE organizers SET name = ?, company_name = ?, company_website = ?, otp = ?, otp_expires_at = ? WHERE id = ?',
            [name, company_name, company_website, otp, otp_expires_at, organizerId]
        );
    } else {
        const [result] = await query(
            'INSERT INTO organizers (name, email, company_name, company_website, otp, otp_expires_at, status, payment_status, account_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, company_name, company_website, otp, otp_expires_at, 'active', 'pending', 'pending']
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

    const otp = generateNumericOtp(6);
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

    await ensureOrganizerStatusColumns();

    const [rows] = await query(
        'SELECT id, name, otp, otp_expires_at, email_verified_at, status, payment_status, account_status FROM organizers WHERE email = ?',
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

    if (!organizer.email_verified_at) {
        throw new AppError('Email verification required before signing in.', 403);
    }

    // Payment is intentionally NOT required to sign in. An organizer who verified
    // her email but hasn't paid yet can still log in; the dashboard then prompts
    // her to complete payment and activate her package (payment_status is returned
    // below so the client can show that prompt). Running an actual event stays
    // gated on the booking being paid.

    // Clear OTP after successful login
    await query(
        'UPDATE organizers SET otp = NULL, otp_expires_at = NULL WHERE id = ?',
        [organizer.id]
    );

    // Generate JWT Token
    const token = jwt.sign(
        {
            id: organizer.id,
            email: email,
            role: 'organizer',
            payment_status: organizer.payment_status,
            account_status: organizer.account_status,
        },
        getJwtSecret(),
        { expiresIn: '24h' }
    );

    return successResponse(res, 'Logged in successfully.', {
        token,
        organizer: {
            id: organizer.id,
            name: organizer.name,
            email: email,
            payment_status: organizer.payment_status,
            account_status: organizer.account_status,
        },
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
            a.game_duration_secs,
            p.name as package_name,
            p.price as package_price,
            p.max_users,
            (SELECT COUNT(*) FROM game_participants WHERE booking_id = ob.id AND email_verified_at IS NOT NULL) as registered_participants,
            (SELECT COALESCE(bill.created_at, ob.created_at) FROM organizer_billings bill WHERE bill.booking_id = ob.id ORDER BY bill.id DESC LIMIT 1) as payment_date
        FROM organizer_bookings ob
        JOIN activities a ON ob.activity_id = a.id
        JOIN packages p ON ob.package_id = p.id
        WHERE ob.organizer_id = ?
        ORDER BY ob.created_at DESC
    `, [organizerId]);

    const [organizerInfoRows] = await query(
        'SELECT id, name, email, company_name, payment_status, account_status FROM organizers WHERE id = ?',
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

    await ensureOrganizerStatusColumns();

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
        'UPDATE organizers SET email_verified_at = ?, otp = NULL, otp_expires_at = NULL, account_status = CASE WHEN account_status = ? THEN ? ELSE ? END, payment_status = COALESCE(payment_status, ?) WHERE id = ?',
        [moment().format('YYYY-MM-DD HH:mm:ss'), 'active', 'active', 'pending', 'pending', organizer.id]
    );

    return successResponse(res, 'Email verified successfully.', { organizer_id: organizer.id });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const [rows] = await query('SELECT id FROM organizers WHERE email = ?', [email]);
    if (rows.length === 0) {
        throw new AppError('Organizer not found', 404);
    }

    const otp = generateNumericOtp(6);

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

    // Cook & Create-only guard: a group assigned to a game with no matching
    // cc_game_templates row (or a template with too few ingredients to play
    // Round 1) 404s/breaks the whole session at play time (getCCGameState).
    // Catch that here instead — at booking time, before real participants can
    // be affected. Every active game under the activity must have a properly
    // configured template, since participantGroupService.resolveGameForGroup
    // round-robins group assignment across ALL of them, not just the one
    // named here. No-op for Mystery activities (which have no
    // cc_game_templates rows at all).
    const [activityRows] = await query<any>('SELECT slug FROM activities WHERE id = ?', [activity_id]);
    if (isCookAndCreateSlug(activityRows?.[0]?.slug)) {
        const gameIds: number[] = game_id
            ? [Number(game_id)]
            : (
                  await query<any>("SELECT id FROM activity_games WHERE activity_id = ? AND status = 'active'", [activity_id])
              )[0].map((r: any) => Number(r.id));

        if (gameIds.length > 0) {
            const [templateRows] = await query<any>(
                `SELECT t.activity_game_id, COUNT(ti.id) AS ingredient_count
                 FROM cc_game_templates t
                 LEFT JOIN cc_game_template_ingredients ti ON ti.template_id = t.id
                 WHERE t.activity_game_id IN (?) AND t.status = 'active'
                 GROUP BY t.id, t.activity_game_id`,
                [gameIds]
            );
            const readySet = new Set(
                templateRows.filter((r: any) => Number(r.ingredient_count) >= 4).map((r: any) => Number(r.activity_game_id))
            );
            if (gameIds.some((id) => !readySet.has(id))) {
                throw new AppError(
                    "This Cook & Create game isn't fully configured yet. Please contact support.",
                    422
                );
            }
        }
    }

    const [result] = await query(
        'INSERT INTO organizer_bookings (organizer_id, activity_id, game_id, package_id, scheduled_date, scheduled_time, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
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

/**
 * Checkout entry point: captures billing details and starts payment.
 *
 * The two supported methods diverge in what this returns, not in how much of
 * the flow they share:
 *
 *   cod      -> booking is activated here and the invitation link is issued
 *               immediately, with the payment left `pending` for an admin to
 *               settle on collection.
 *   razorpay -> a local payment row and a Razorpay Order are created and the
 *               checkout parameters are returned. The booking stays
 *               `pending_activation` and no link is issued until the payment is
 *               verified server-side (or confirmed by webhook).
 *
 * Previously this wrote `payment_status = 'paid'` unconditionally with no
 * gateway involved at all.
 */
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

    const method = String(payment_method || '').toLowerCase() as PaymentMethod;
    if (!PAYMENT_METHODS.includes(method)) {
        throw new AppError('Unsupported payment method.', 422);
    }

    // ---- Pre-flight validation (reads only) -------------------------------
    // The gateway call further down must not happen inside a transaction — it
    // would hold row locks open across a network round trip to Razorpay — so
    // validation runs first and the write transaction re-checks under a lock.

    const [bookingRows] = await query<any>(
        `SELECT ob.status, ob.organizer_id, ob.package_id, ob.scheduled_date, ob.scheduled_time,
                o.email_verified_at, p.price
           FROM organizer_bookings ob
           JOIN organizers o ON o.id = ob.organizer_id
           JOIN packages p ON p.id = ob.package_id
          WHERE ob.id = ?`,
        [booking_id]
    );

    if (bookingRows.length === 0) {
        throw new AppError('Booking not found', 404);
    }

    const booking = bookingRows[0];

    if (booking.status !== 'pending_activation') {
        throw new AppError('Booking is already completed or invalid for payment.', 400);
    }

    if (!booking.email_verified_at) {
        throw new AppError('Organizer must verify email before completing payment.', 403);
    }

    const eventStart = moment(`${booking.scheduled_date} ${booking.scheduled_time}`, 'YYYY-MM-DD HH:mm:ss');
    const now = moment();
    const maxAllowedSchedule = moment(now).add(SCHEDULE_WINDOW_DAYS - 1, 'days').endOf('day');

    if (eventStart.isBefore(now)) {
        throw new AppError('Scheduled session must be in the future.', 400);
    }

    if (eventStart.isAfter(maxAllowedSchedule)) {
        throw new AppError(`Session must be scheduled within ${SCHEDULE_WINDOW_DAYS} days of payment.`, 400);
    }

    // Amount is always recomputed from the package on record. Nothing about
    // pricing is accepted from the request.
    const amounts = calculateBookingAmount(parseFloat(booking.price || 0));

    // Server-side gate on the chosen method: COD may be switched off or capped,
    // and Razorpay may be off or unconfigured. The UI hides those options, but
    // hiding is not enforcing.
    await assertMethodAllowed(method, amounts.totalPayable);

    // ---- Persist billing + payment attempt --------------------------------

    const prepared = await withTransaction(async (conn) => {
        // Re-read under a lock. Two tabs submitting checkout at once would
        // otherwise both pass the status check above and create two payments.
        const [lockedRows] = (await conn.query(
            'SELECT status, organizer_id FROM organizer_bookings WHERE id = ? FOR UPDATE',
            [booking_id]
        )) as any;

        if (lockedRows.length === 0) {
            throw new AppError('Booking not found', 404);
        }

        if (lockedRows[0].status !== 'pending_activation') {
            throw new AppError('Booking is already completed or invalid for payment.', 400);
        }

        const organizerId = lockedRows[0].organizer_id;

        // A booking that already has a settled payment must never be charged
        // again, whatever the booking status says.
        const [settledRows] = (await conn.query(
            "SELECT id FROM payments WHERE booking_id = ? AND payment_status = 'captured' LIMIT 1",
            [booking_id]
        )) as any;

        if (settledRows.length > 0) {
            throw new AppError('This booking has already been paid for.', 409);
        }

        // Reuse the billing row on a retry (failed card, abandoned checkout)
        // instead of stacking up a second GST snapshot per attempt.
        const [existingBilling] = (await conn.query(
            'SELECT id FROM organizer_billings WHERE booking_id = ? LIMIT 1',
            [booking_id]
        )) as any;

        const billingValues = [
            gst_number || null,
            billing_address,
            city,
            state,
            pin_code,
            amounts.packagePrice,
            0, // taxes
            0, // additional_charges
            amounts.gstAmount,
            amounts.totalPayable,
            method,
            'pending',
            JSON.stringify(consents),
        ];

        let billingId: number;

        if (existingBilling.length > 0) {
            billingId = existingBilling[0].id;
            await conn.query(
                `UPDATE organizer_billings
                    SET gst_number = ?, billing_address = ?, city = ?, state = ?, pin_code = ?,
                        package_price = ?, taxes = ?, additional_charges = ?, gst_amount = ?,
                        total_payable = ?, payment_method = ?, payment_status = ?,
                        confirmation_details = ?, updated_at = NOW()
                  WHERE id = ?`,
                [...billingValues, billingId]
            );
        } else {
            const [insertResult] = (await conn.query(
                `INSERT INTO organizer_billings
                    (booking_id, gst_number, billing_address, city, state, pin_code, package_price,
                     taxes, additional_charges, gst_amount, total_payable, payment_method,
                     payment_status, confirmation_details, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [booking_id, ...billingValues]
            )) as any;
            billingId = insertResult.insertId;
        }

        const paymentId = await createPaymentRecord(conn, {
            bookingId: Number(booking_id),
            billingId,
            organizerId,
            method,
            amount: amounts.totalPayable,
            metadata: { package_price: amounts.packagePrice, gst_amount: amounts.gstAmount },
        });

        // COD is settled on delivery, so the booking activates here and the
        // payment stays pending for an admin to reconcile.
        if (method === 'cod') {
            const invitationLink = await activateBooking(conn, {
                bookingId: Number(booking_id),
                organizerId,
                billingId,
                markBillingPaid: false,
            });

            return { billingId, paymentId, organizerId, invitationLink };
        }

        return { billingId, paymentId, organizerId, invitationLink: '' };
    });

    if (method === 'cod') {
        return successResponse(res, 'Order placed successfully. Payment will be collected as per COD terms.', {
            booking_id,
            invitation_link: prepared.invitationLink,
            payment_method: 'cod',
            payment_status: 'pending',
            amount: amounts.totalPayable,
            requires_payment: false,
        });
    }

    // ---- Razorpay: create the gateway order, outside the transaction ------

    const order = await attachRazorpayOrder(prepared.paymentId, {
        bookingId: Number(booking_id),
        organizerId: prepared.organizerId,
        amount: amounts.totalPayable,
    });

    return successResponse(res, 'Payment initiated.', {
        booking_id,
        payment_method: 'razorpay',
        payment_status: 'pending',
        requires_payment: true,
        // Everything Razorpay Checkout needs. The key secret is not here and
        // never reaches the browser.
        razorpay: {
            key_id: order.keyId,
            order_id: order.orderId,
            amount: order.amountSubunits,
            currency: 'INR',
        },
        amount: amounts.totalPayable,
    });
});

/*
 * `confirmPayment` (POST /v1/organizer/confirm-payment) was removed here.
 *
 * It was unauthenticated and took a bare booking id, so any caller could mark
 * any booking paid and activate the organizer — which with a live gateway in
 * front of it is a free-session bypass, not just a stale endpoint. Nothing in
 * the frontend referenced it.
 *
 * Its two legitimate uses are now served properly:
 *   - gateway confirmation -> POST /v1/webhooks/razorpay (signature-verified)
 *   - manual COD settlement -> admin panel, Payments > mark as paid
 */

export const updateSession = asyncHandler(async (req: Request, res: Response) => {
    const { booking_id, scheduled_date, scheduled_time } = req.body;
    const organizerId = (req as any).user?.id;

    const [rows] = await query(
        'SELECT organizer_id, is_rescheduled, scheduled_date, scheduled_time, status, created_at FROM organizer_bookings WHERE id = ?',
        [booking_id]
    );

    if (rows.length === 0) {
        throw new AppError('Booking not found', 404);
    }

    const booking = rows[0];

    if (!organizerId || Number(booking.organizer_id) !== Number(organizerId)) {
        throw new AppError('You are not allowed to reschedule this booking.', 403);
    }

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

        if (billingRows.length === 0) {
            // A completed booking with no billing record is a data-integrity
            // problem — never treat it as "no restriction".
            throw new AppError('No billing record found for this booking. Please contact support.', 400);
        }

        // Legacy billing rows may have a NULL created_at — fall back to the
        // booking's creation time rather than silently skipping the window.
        const paymentTime = moment(billingRows[0].created_at || booking.created_at);
        if (!paymentTime.isValid()) {
            throw new AppError('Could not determine the payment date for this booking. Please contact support.', 400);
        }
        const allowedRescheduleUntil = moment(paymentTime).add(SCHEDULE_WINDOW_DAYS - 1, 'days').endOf('day');
        const newSchedule = moment(`${scheduled_date} ${scheduled_time}`, 'YYYY-MM-DD HH:mm:ss');

        if (newSchedule.isAfter(allowedRescheduleUntil)) {
            throw new AppError(`Rescheduled session must remain within ${SCHEDULE_WINDOW_DAYS} days of payment.`, 400);
        }
    }

    await query(
        'UPDATE organizer_bookings SET scheduled_date = ?, scheduled_time = ?, is_rescheduled = 1 WHERE id = ?',
        [scheduled_date, scheduled_time, booking_id]
    );

    return successResponse(res, 'Session rescheduled successfully.');
});

export const deactivateAccount = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user?.id;
    if (!organizerId) {
        throw new AppError('Authentication required', 401);
    }

    // Soft delete only — GST invoices in organizer_billings must be retained
    // for 7 years per the GST Act, so billing/booking records are never touched.
    // authMiddleware/profileController already filter on deleted_at IS NULL, so
    // the organizer's JWT stops working from the very next request.
    await query(
        "UPDATE organizers SET deleted_at = NOW(), account_status = 'inactive' WHERE id = ? AND deleted_at IS NULL",
        [organizerId]
    );

    return successResponse(
        res,
        'Your account has been deactivated. Billing and GST invoice records are retained as required by law.'
    );
});

/**
 * Results tab — every completed/incomplete group across the organizer's
 * bookings, with results-PDF availability (PDFs live for 1 hour post-game).
 */
export const getOrganizerResults = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user.id;

    const [rows] = await query(
        `SELECT gg.id AS group_id, gg.group_name, gg.status, gg.completed_at,
                gg.results_pdf_path, gg.results_pdf_expires_at,
                ob.id AS booking_id, ob.scheduled_date, ob.scheduled_time,
                a.title AS activity_name
         FROM game_groups gg
         JOIN organizer_bookings ob ON ob.id = gg.booking_id
         JOIN activities a ON a.id = ob.activity_id
         WHERE ob.organizer_id = ? AND gg.status IN ('completed', 'incomplete')
         ORDER BY gg.completed_at DESC, gg.id DESC`,
        [organizerId]
    );

    const now = new Date();
    const results = (rows as any[]).map((r) => ({
        group_id: Number(r.group_id),
        group_name: r.group_name,
        booking_id: Number(r.booking_id),
        activity_name: r.activity_name,
        scheduled_date: r.scheduled_date,
        scheduled_time: r.scheduled_time,
        status: r.status,
        completed_at: r.completed_at,
        pdf_available: Boolean(
            r.results_pdf_path && r.results_pdf_expires_at && new Date(r.results_pdf_expires_at) > now
        ),
        pdf_expires_at: r.results_pdf_expires_at,
    }));

    return successResponse(res, 'Results retrieved.', { results });
});
