import crypto from 'crypto';
import { Request, Response } from 'express';
import { query } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import logger from '../utils/logger';
import {
    isRazorpayWebhookConfigured,
    verifyWebhookSignature,
} from '../config/razorpay';
import {
    PAYMENT_STATUS,
    gatewayMetadata,
    markPaymentFailed,
    parseMetadata,
    settlePayment,
    truncateReason,
} from '../services/paymentService';

/**
 * Razorpay webhook receiver.
 *
 * This — not the browser callback — is the authoritative signal that a payment
 * completed. A customer who closes the tab the instant Razorpay confirms will
 * never hit the verify endpoint, and their booking would sit unpaid forever if
 * the callback were the only path.
 *
 * Three properties this handler must hold:
 *
 *  1. Authenticity — HMAC-SHA256 over the *raw* body using the dedicated
 *     webhook secret (never the API key secret).
 *  2. Idempotency — Razorpay retries until it sees a 2xx and can redeliver even
 *     after one. Every event id is claimed under a unique key before any work.
 *  3. Durability of the ack — anything that is not a signature failure returns
 *     2xx, so a bug in our handling does not trigger an infinite retry storm.
 */

const HANDLED_EVENTS = new Set([
    'payment.captured',
    'payment.failed',
    'order.paid',
    // Refund handling is wired but inert until refunds are issued from the
    // dashboard; the ledger columns already exist.
    'refund.created',
    'refund.processed',
    'refund.failed',
]);

export const handleRazorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.header('x-razorpay-signature') || '';

    if (!isRazorpayWebhookConfigured()) {
        logger.error('[Webhook] Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set');
        return res.status(503).json({ status: 'not_configured' });
    }

    // express.json's verify hook stashes the exact bytes Razorpay signed.
    // Re-serialising req.body would change key order and escaping and break the
    // HMAC — a common cause of "signature always invalid".
    const rawBody: Buffer | undefined = (req as any).rawBody;

    if (!rawBody || !verifyWebhookSignature(rawBody, signature)) {
        logger.warn('[Webhook] Rejected Razorpay webhook with invalid signature');
        // 400, not 200: an unsigned request is not something to acknowledge.
        return res.status(400).json({ status: 'invalid_signature' });
    }

    const payload = req.body || {};
    const eventType: string = payload.event || 'unknown';

    // Razorpay sends a stable id per event; hash the body as a fallback so an
    // event without the header still gets a deterministic idempotency key.
    const eventId =
        req.header('x-razorpay-event-id') ||
        crypto.createHash('sha256').update(rawBody).digest('hex');

    // Claim the event before doing any work. A concurrent redelivery loses the
    // insert and exits here rather than settling the same payment twice.
    let webhookRowId: number;
    try {
        const [result] = await query(
            `INSERT INTO payment_webhook_events
                (gateway, event_id, event_type, status, payload, created_at, updated_at)
             VALUES ('razorpay', ?, ?, 'received', ?, NOW(), NOW())`,
            [eventId, eventType.slice(0, 64), JSON.stringify(redactPayload(payload))]
        );
        webhookRowId = (result as any).insertId;
    } catch (err: any) {
        if (err?.code === 'ER_DUP_ENTRY' || /Duplicate entry/i.test(err?.message || '')) {
            logger.info(`[Webhook] Duplicate Razorpay event ${eventId} (${eventType}) ignored`);
            return res.status(200).json({ status: 'already_processed' });
        }
        throw err;
    }

    if (!HANDLED_EVENTS.has(eventType)) {
        await finishEvent(webhookRowId, 'ignored', null, null);
        return res.status(200).json({ status: 'ignored' });
    }

    try {
        const outcome = await dispatchEvent(eventType, payload);
        await finishEvent(webhookRowId, outcome.status, outcome.paymentId, null);
        return res.status(200).json({ status: outcome.status });
    } catch (err: any) {
        // Record and acknowledge. Razorpay retrying a payload that made us throw
        // would just throw again; the failed row is the signal for an operator,
        // and the payment can be reconciled from the dashboard.
        logger.error(`[Webhook] Failed handling ${eventType} (${eventId}): ${err?.message}`);
        await finishEvent(webhookRowId, 'failed', null, err?.message ?? 'Unknown error');
        return res.status(200).json({ status: 'error_recorded' });
    }
});

interface DispatchOutcome {
    status: 'processed' | 'ignored';
    paymentId: number | null;
}

async function dispatchEvent(eventType: string, payload: any): Promise<DispatchOutcome> {
    switch (eventType) {
        case 'payment.captured':
            return handlePaymentCaptured(payload);
        case 'payment.failed':
            return handlePaymentFailed(payload);
        case 'order.paid':
            return handleOrderPaid(payload);
        case 'refund.created':
        case 'refund.processed':
        case 'refund.failed':
            return handleRefund(eventType, payload);
        default:
            return { status: 'ignored', paymentId: null };
    }
}

async function handlePaymentCaptured(payload: any): Promise<DispatchOutcome> {
    const entity = payload?.payload?.payment?.entity;
    if (!entity?.order_id) {
        return { status: 'ignored', paymentId: null };
    }

    const payment = await findPaymentByOrderId(entity.order_id);
    if (!payment) {
        logger.warn(`[Webhook] payment.captured for unknown order ${entity.order_id}`);
        return { status: 'ignored', paymentId: null };
    }

    // Guard the amount here too. The webhook is signed, so this is not about
    // forgery — it catches a genuine mismatch (partial capture, wrong order
    // linkage) before a booking is activated for less than it costs.
    if (!amountMatches(payment.amount, entity.amount)) {
        logger.error(
            `[Webhook] Amount mismatch on payment ${payment.id}: local ${payment.amount}, gateway ${entity.amount}`
        );
        await markPaymentFailed({
            paymentId: payment.id,
            reason: `Webhook amount mismatch: gateway reported ${entity.amount} paise`,
            gatewayPaymentId: entity.id,
            metadata: { verification: 'webhook_amount_mismatch' },
        });
        return { status: 'processed', paymentId: payment.id };
    }

    await settlePayment({
        paymentId: payment.id,
        gatewayPaymentId: entity.id,
        status: PAYMENT_STATUS.CAPTURED,
        metadata: gatewayMetadata(entity),
        source: 'webhook',
    });

    return { status: 'processed', paymentId: payment.id };
}

async function handleOrderPaid(payload: any): Promise<DispatchOutcome> {
    const orderEntity = payload?.payload?.order?.entity;
    const paymentEntity = payload?.payload?.payment?.entity;

    if (!orderEntity?.id) {
        return { status: 'ignored', paymentId: null };
    }

    const payment = await findPaymentByOrderId(orderEntity.id);
    if (!payment) {
        logger.warn(`[Webhook] order.paid for unknown order ${orderEntity.id}`);
        return { status: 'ignored', paymentId: null };
    }

    if (!amountMatches(payment.amount, orderEntity.amount_paid ?? orderEntity.amount)) {
        logger.error(
            `[Webhook] order.paid amount mismatch on payment ${payment.id}: local ${payment.amount}, gateway ${orderEntity.amount_paid}`
        );
        return { status: 'processed', paymentId: payment.id };
    }

    await settlePayment({
        paymentId: payment.id,
        gatewayPaymentId: paymentEntity?.id || null,
        status: PAYMENT_STATUS.CAPTURED,
        metadata: paymentEntity ? gatewayMetadata(paymentEntity) : { gateway_status: 'paid' },
        source: 'webhook',
    });

    return { status: 'processed', paymentId: payment.id };
}

async function handlePaymentFailed(payload: any): Promise<DispatchOutcome> {
    const entity = payload?.payload?.payment?.entity;
    if (!entity?.order_id) {
        return { status: 'ignored', paymentId: null };
    }

    const payment = await findPaymentByOrderId(entity.order_id);
    if (!payment) {
        return { status: 'ignored', paymentId: null };
    }

    await markPaymentFailed({
        paymentId: payment.id,
        status: PAYMENT_STATUS.FAILED,
        reason: entity.error_description || entity.error_reason || 'Payment failed at gateway',
        gatewayPaymentId: entity.id,
        metadata: {
            ...gatewayMetadata(entity),
            error_code: entity.error_code || null,
            error_source: entity.error_source || null,
        },
    });

    return { status: 'processed', paymentId: payment.id };
}

/**
 * Refund events.
 *
 * Deliberately minimal: it keeps the ledger truthful (status, refunded amount)
 * and never reverses booking activation, because whether a refunded session
 * should also be revoked is a business decision, not a gateway one.
 */
async function handleRefund(eventType: string, payload: any): Promise<DispatchOutcome> {
    const entity = payload?.payload?.refund?.entity;
    const gatewayPaymentId = entity?.payment_id;

    if (!gatewayPaymentId) {
        return { status: 'ignored', paymentId: null };
    }

    const [rows] = await query<any>(
        'SELECT id, amount, refunded_amount, metadata FROM payments WHERE gateway_payment_id = ? LIMIT 1',
        [gatewayPaymentId]
    );

    if (rows.length === 0) {
        logger.warn(`[Webhook] ${eventType} for unknown payment ${gatewayPaymentId}`);
        return { status: 'ignored', paymentId: null };
    }

    const payment = rows[0];

    if (eventType === 'refund.failed') {
        await query(
            'UPDATE payments SET metadata = ?, updated_at = NOW() WHERE id = ?',
            [
                JSON.stringify({
                    ...(parseMetadata(payment.metadata) || {}),
                    last_refund_error: truncateReason(entity.error_description || 'Refund failed'),
                }),
                payment.id,
            ]
        );
        return { status: 'processed', paymentId: payment.id };
    }

    // Razorpay reports refund amounts in paise; the ledger is in rupees.
    const refundedThisEvent = Number(entity.amount || 0) / 100;
    const totalRefunded = Number(payment.refunded_amount || 0) + refundedThisEvent;
    const isFull = totalRefunded >= Number(payment.amount) - 0.01;

    await query(
        `UPDATE payments
            SET refunded_amount = ?,
                refund_status = ?,
                payment_status = CASE WHEN ? THEN ? ELSE payment_status END,
                metadata = ?,
                updated_at = NOW()
          WHERE id = ?`,
        [
            totalRefunded.toFixed(2),
            isFull ? 'full' : 'partial',
            isFull ? 1 : 0,
            PAYMENT_STATUS.REFUNDED,
            JSON.stringify({
                ...(parseMetadata(payment.metadata) || {}),
                last_refund_id: entity.id || null,
                last_refund_status: entity.status || null,
            }),
            payment.id,
        ]
    );

    return { status: 'processed', paymentId: payment.id };
}

async function findPaymentByOrderId(orderId: string): Promise<any | null> {
    const [rows] = await query<any>(
        'SELECT id, amount, payment_status, booking_id FROM payments WHERE gateway_order_id = ? LIMIT 1',
        [orderId]
    );
    return rows.length > 0 ? rows[0] : null;
}

/** Compares a rupee decimal against a paise integer, tolerating float drift. */
function amountMatches(localRupees: any, gatewaySubunits: any): boolean {
    const expected = Math.round(Number(localRupees) * 100);
    return expected === Number(gatewaySubunits);
}

async function finishEvent(
    id: number,
    status: string,
    paymentId: number | null,
    error: string | null
): Promise<void> {
    await query(
        'UPDATE payment_webhook_events SET status = ?, payment_id = ?, error = ?, updated_at = NOW() WHERE id = ?',
        [status, paymentId, truncateReason(error), id]
    );
}

/**
 * Strips contact and instrument details before the payload is archived.
 *
 * The stored payload is for support and reconciliation; it has no business
 * holding a customer's card fingerprint, UPI VPA, email or phone number.
 */
function redactPayload(payload: any): any {
    const clone = JSON.parse(JSON.stringify(payload ?? {}));
    const sensitive = ['card', 'card_id', 'vpa', 'email', 'contact', 'token', 'token_id', 'customer_id'];

    const scrub = (node: any): void => {
        if (!node || typeof node !== 'object') return;

        for (const key of Object.keys(node)) {
            if (sensitive.includes(key)) {
                delete node[key];
            } else {
                scrub(node[key]);
            }
        }
    };

    scrub(clone);
    return clone;
}
