import { Request, Response } from 'express';
import { query } from '../config/db';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import {
    PAYMENT_STATUS,
    getAvailablePaymentMethods,
    markPaymentFailed,
    verifyRazorpayPayment,
} from '../services/paymentService';

/**
 * Razorpay checkout endpoints.
 *
 * Order creation happens in `organizerController.completeBooking` — that is
 * where the booking, billing snapshot and consents are written, and splitting
 * it out would mean two entry points into checkout. What lives here is
 * everything that happens *after* Razorpay Checkout closes.
 */

/**
 * Public catalogue of payment methods for the checkout screen.
 *
 * Unauthenticated on purpose: the page renders before the organizer is known,
 * and nothing here is secret — the Razorpay key id is designed to be public,
 * and the key secret never leaves the server.
 */
export const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
    const amountParam = req.query.amount;
    const amount = amountParam !== undefined ? Number(amountParam) : undefined;

    const methods = await getAvailablePaymentMethods(
        Number.isFinite(amount) ? amount : undefined
    );

    return successResponse(res, 'Payment methods retrieved.', methods);
});

/**
 * Verifies a Razorpay checkout callback and activates the booking.
 *
 * The three identifiers from the browser are the only input, and none of them
 * is trusted: the signature is recomputed server-side and the payment is
 * re-fetched from Razorpay before anything is marked paid. Amount and payment
 * status from the browser are ignored entirely.
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Optional: a first-time registrant has no token yet. Authenticity comes
    // from the signature, not the session — the token, when present, adds an
    // ownership check on top.
    const organizerId = (req as any).user?.id ?? null;

    const result = await verifyRazorpayPayment({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        organizerId,
    });

    return successResponse(res, 'Payment verified successfully.', {
        booking_id: result.bookingId,
        invitation_link: result.invitationLink,
        payment_status: result.paymentStatus,
        // False when the webhook settled it first — the UI shows the same
        // success state either way, this is for support/debugging.
        newly_settled: result.changed,
    });
});

/**
 * Records an abandoned or failed checkout so the attempt is not left dangling
 * as `pending` forever.
 *
 * Purely advisory: the browser reporting a failure is a hint, never proof.
 * `markPaymentFailed` refuses to touch an already-captured payment, so a
 * malicious or confused client cannot use this to undo a successful payment.
 */
export const recordPaymentFailure = asyncHandler(async (req: Request, res: Response) => {
    const { razorpay_order_id, reason, cancelled } = req.body;
    const organizerId = (req as any).user?.id ?? null;

    const [rows] = await query<any>(
        'SELECT id, organizer_id, payment_status FROM payments WHERE gateway_order_id = ? LIMIT 1',
        [razorpay_order_id]
    );

    if (rows.length === 0) {
        // Nothing to record. Not an error worth surfacing at checkout.
        return successResponse(res, 'No matching payment attempt.');
    }

    const payment = rows[0];

    if (organizerId != null && Number(payment.organizer_id) !== Number(organizerId)) {
        logger.warn(
            `[Payment] Organizer ${organizerId} tried to fail payment ${payment.id} owned by ${payment.organizer_id}`
        );
        return successResponse(res, 'No matching payment attempt.');
    }

    await markPaymentFailed({
        paymentId: payment.id,
        status: cancelled ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.FAILED,
        reason: typeof reason === 'string' ? reason : cancelled ? 'Cancelled by user' : 'Payment failed',
        metadata: { reported_by: 'checkout' },
    });

    return successResponse(res, 'Payment attempt recorded.');
});

/**
 * Current state of a payment attempt, scoped to the caller.
 *
 * Lets the UI recover when the browser is closed mid-payment and reopened: the
 * webhook may already have settled the booking, in which case this returns the
 * invitation link without another gateway round trip.
 */
export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { order_id } = req.params;
    const organizerId = (req as any).user?.id ?? null;

    // A Razorpay order id is unguessable, so knowing one is itself the
    // capability here; a session token, when present, narrows it further.
    const [rows] = await query<any>(
        `SELECT p.id, p.payment_status, p.amount, p.currency, p.gateway, p.payment_method,
                p.gateway_order_id, p.gateway_payment_id, p.paid_at, p.failure_reason,
                p.booking_id, b.invitation_link
           FROM organizer_bookings b
           JOIN payments p ON p.booking_id = b.id
          WHERE p.gateway_order_id = ?
            AND (? IS NULL OR p.organizer_id = ?)
          LIMIT 1`,
        [order_id, organizerId, organizerId]
    );

    if (rows.length === 0) {
        throw new AppError('Payment not found.', 404);
    }

    const payment = rows[0];

    return successResponse(res, 'Payment status retrieved.', {
        payment_status: payment.payment_status,
        payment_method: payment.payment_method,
        gateway: payment.gateway,
        amount: payment.amount,
        currency: payment.currency,
        booking_id: payment.booking_id,
        // Only disclosed once the payment actually settled.
        invitation_link:
            payment.payment_status === PAYMENT_STATUS.CAPTURED ? payment.invitation_link : null,
        paid_at: payment.paid_at,
        failure_reason: payment.failure_reason,
    });
});
