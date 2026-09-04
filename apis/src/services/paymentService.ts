import crypto from 'crypto';
import { PoolConnection } from 'mysql2/promise';
import { query, withTransaction } from '../config/db';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import {
    createRazorpayOrder,
    fetchRazorpayPayment,
    fromSubunits,
    getPublicRazorpayKeyId,
    getRazorpayMode,
    isRazorpayConfigured,
    toSubunits,
    verifyPaymentSignature,
} from '../config/razorpay';

/**
 * Payment orchestration for organizer bookings.
 *
 * The "order" in this project is an `organizer_bookings` row; `organizer_billings`
 * carries its GST/invoice snapshot and `payments` records each gateway attempt.
 * Everything that moves a booking from unpaid to activated funnels through
 * `settlePayment` below, so the checkout callback, the webhook and an admin
 * marking a COD order paid all take the same idempotent path.
 */

export type PaymentMethod = 'razorpay' | 'cod';

export const PAYMENT_METHODS: PaymentMethod[] = ['razorpay', 'cod'];

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    AUTHORIZED: 'authorized',
    CAPTURED: 'captured',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
} as const;

/** Razorpay payment.status -> our payment_status. */
const RAZORPAY_STATUS_MAP: Record<string, string> = {
    created: PAYMENT_STATUS.PENDING,
    authorized: PAYMENT_STATUS.AUTHORIZED,
    captured: PAYMENT_STATUS.CAPTURED,
    refunded: PAYMENT_STATUS.REFUNDED,
    failed: PAYMENT_STATUS.FAILED,
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

interface PaymentSettings {
    razorpayEnabled: boolean;
    codEnabled: boolean;
    codMinAmount: number;
    codMaxAmount: number;
    optionUpi: boolean;
    optionCard: boolean;
    optionNetBanking: boolean;
    optionWallet: boolean;
}

const SETTINGS_KEYS = [
    'payment_gateway_razorpay_enabled',
    'payment_gateway_cod_enabled',
    'payment_cod_min_amount',
    'payment_cod_max_amount',
    'payment_option_upi',
    'payment_option_card',
    'payment_option_net_banking',
    'payment_option_wallet',
];

// Checkout reads these on every page load; a short TTL keeps an admin toggle
// taking effect within a minute without a query per request.
const SETTINGS_TTL_MS = 60_000;
let settingsCache: { value: PaymentSettings; expiresAt: number } | null = null;

function asBool(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined || value === null || value === '') return fallback;
    return value === '1' || value.toLowerCase() === 'true';
}

function asNumber(value: string | undefined, fallback: number): number {
    const n = parseFloat(value ?? '');
    return Number.isFinite(n) ? n : fallback;
}

export async function getPaymentSettings(forceRefresh = false): Promise<PaymentSettings> {
    if (!forceRefresh && settingsCache && settingsCache.expiresAt > Date.now()) {
        return settingsCache.value;
    }

    const [rows] = await query<any>(
        `SELECT \`key\`, \`value\` FROM settings WHERE \`key\` IN (${SETTINGS_KEYS.map(() => '?').join(',')})`,
        SETTINGS_KEYS
    );

    const raw: Record<string, string> = {};
    rows.forEach((row: any) => {
        raw[row.key] = row.value;
    });

    const value: PaymentSettings = {
        razorpayEnabled: asBool(raw.payment_gateway_razorpay_enabled, true),
        codEnabled: asBool(raw.payment_gateway_cod_enabled, false),
        codMinAmount: asNumber(raw.payment_cod_min_amount, 0),
        // 0 is treated as "no ceiling" so an unset limit never blocks checkout.
        codMaxAmount: asNumber(raw.payment_cod_max_amount, 0),
        optionUpi: asBool(raw.payment_option_upi, true),
        optionCard: asBool(raw.payment_option_card, true),
        optionNetBanking: asBool(raw.payment_option_net_banking, true),
        optionWallet: asBool(raw.payment_option_wallet, true),
    };

    settingsCache = { value, expiresAt: Date.now() + SETTINGS_TTL_MS };
    return value;
}

export function clearPaymentSettingsCache(): void {
    settingsCache = null;
}

/**
 * Public, browser-safe description of what the checkout may offer.
 *
 * Razorpay is listed only when it is both switched on by an admin and actually
 * configured with credentials, so the UI can never render a button that has no
 * working gateway behind it. Only the key id crosses this boundary.
 */
export async function getAvailablePaymentMethods(amount?: number) {
    const settings = await getPaymentSettings();
    const razorpayAvailable = settings.razorpayEnabled && isRazorpayConfigured();

    const supported: string[] = [];
    if (settings.optionUpi) supported.push('UPI');
    if (settings.optionCard) supported.push('Credit Card', 'Debit Card');
    if (settings.optionNetBanking) supported.push('Net Banking');
    if (settings.optionWallet) supported.push('Wallets');

    const codRange = codAmountRejection(amount, settings);

    return {
        methods: [
            {
                id: 'razorpay' as const,
                label: 'Razorpay',
                description: 'Pay securely using UPI, Card, Net Banking or Wallet',
                enabled: razorpayAvailable,
                supported_methods: supported,
                key_id: razorpayAvailable ? getPublicRazorpayKeyId() : null,
                mode: razorpayAvailable ? getRazorpayMode() : null,
                cta: 'Continue to Payment',
                unavailable_reason: razorpayAvailable ? null : 'Online payment is currently unavailable',
            },
            {
                id: 'cod' as const,
                label: 'Cash on Delivery',
                description: 'Pay when your order is delivered',
                enabled: settings.codEnabled && !codRange,
                min_amount: settings.codMinAmount || null,
                max_amount: settings.codMaxAmount || null,
                cta: 'Place Order',
                unavailable_reason: !settings.codEnabled
                    ? 'Cash on Delivery is currently unavailable'
                    : codRange,
            },
        ],
        currency: 'INR',
    };
}

/** Returns a human-readable reason when COD limits exclude this amount. */
function codAmountRejection(amount: number | undefined, settings: PaymentSettings): string | null {
    if (amount === undefined || !Number.isFinite(amount)) return null;

    if (settings.codMinAmount > 0 && amount < settings.codMinAmount) {
        return `Cash on Delivery requires a minimum order of ₹${settings.codMinAmount}`;
    }

    if (settings.codMaxAmount > 0 && amount > settings.codMaxAmount) {
        return `Cash on Delivery is not available above ₹${settings.codMaxAmount}`;
    }

    return null;
}

/**
 * Gate a checkout attempt server-side.
 *
 * The browser also hides disabled methods, but that is presentation only — a
 * crafted request must not be able to place a COD order while COD is switched
 * off or outside its configured limits.
 */
export async function assertMethodAllowed(method: PaymentMethod, amount: number): Promise<void> {
    const settings = await getPaymentSettings();

    if (method === 'razorpay') {
        if (!settings.razorpayEnabled || !isRazorpayConfigured()) {
            throw new AppError('Online payment is currently unavailable. Please try another method.', 422);
        }
        return;
    }

    if (method === 'cod') {
        if (!settings.codEnabled) {
            throw new AppError('Cash on Delivery is currently unavailable.', 422);
        }

        const rejection = codAmountRejection(amount, settings);
        if (rejection) {
            throw new AppError(rejection, 422);
        }
        return;
    }

    throw new AppError('Unsupported payment method.', 422);
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export interface BookingAmount {
    packagePrice: number;
    gstAmount: number;
    totalPayable: number;
}

const GST_RATE = 0.18;

/**
 * Recomputes the payable amount from the package price on record.
 *
 * The amount is never read from the request. A browser that could name its own
 * total could buy a package for a rupee.
 */
export function calculateBookingAmount(packagePrice: number): BookingAmount {
    const price = Number.isFinite(packagePrice) ? packagePrice : 0;
    const gstAmount = parseFloat((price * GST_RATE).toFixed(2));

    return {
        packagePrice: price,
        gstAmount,
        totalPayable: parseFloat((price + gstAmount).toFixed(2)),
    };
}

// ---------------------------------------------------------------------------
// Payment records
// ---------------------------------------------------------------------------

export interface CreatePaymentInput {
    bookingId: number;
    billingId: number;
    organizerId: number;
    method: PaymentMethod;
    amount: number;
    metadata?: Record<string, any>;
}

/**
 * Inserts a payment attempt. `metadata` is JSON-encoded here so callers never
 * have to remember; it holds gateway method detail and reconciliation context
 * only — never card numbers, UPI handles, CVVs or tokens.
 */
export async function createPaymentRecord(
    conn: PoolConnection,
    input: CreatePaymentInput
): Promise<number> {
    const [result] = (await conn.query(
        `INSERT INTO payments
            (booking_id, billing_id, organizer_id, payment_method, gateway, amount, currency,
             payment_status, refund_status, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'INR', ?, 'none', ?, NOW(), NOW())`,
        [
            input.bookingId,
            input.billingId,
            input.organizerId,
            input.method,
            input.method, // gateway mirrors method today; diverges if Stripe is added
            input.amount,
            PAYMENT_STATUS.PENDING,
            input.metadata ? JSON.stringify(input.metadata) : null,
        ]
    )) as any;

    return result.insertId as number;
}

/**
 * Creates the Razorpay Order and links it to an existing local payment row.
 *
 * Order of operations matters: the local row exists first, so a crash between
 * the gateway call and the update still leaves a traceable pending attempt
 * rather than an orphaned Razorpay order nobody can reconcile.
 */
export async function attachRazorpayOrder(paymentId: number, params: {
    bookingId: number;
    organizerId: number;
    amount: number;
}): Promise<{ orderId: string; amountSubunits: number; keyId: string }> {
    const order = await createRazorpayOrder({
        amount: params.amount,
        currency: 'INR',
        receipt: `booking_${params.bookingId}_${paymentId}`,
        notes: {
            booking_id: String(params.bookingId),
            organizer_id: String(params.organizerId),
            payment_id: String(paymentId),
        },
    });

    await query(
        'UPDATE payments SET gateway_order_id = ?, updated_at = NOW() WHERE id = ?',
        [order.id, paymentId]
    );

    return {
        orderId: order.id,
        amountSubunits: order.amount ?? toSubunits(params.amount),
        keyId: getPublicRazorpayKeyId(),
    };
}

// ---------------------------------------------------------------------------
// Settlement
// ---------------------------------------------------------------------------

export interface SettlementResult {
    /** False when the payment was already settled — the caller should not re-notify. */
    changed: boolean;
    bookingId: number;
    invitationLink: string;
    paymentStatus: string;
}

/**
 * Marks a payment captured and activates its booking, exactly once.
 *
 * Called from three places that routinely race: the browser callback after
 * checkout, the Razorpay webhook, and an admin settling a COD payment. The row
 * is locked FOR UPDATE and re-read inside the transaction, so the second caller
 * sees `captured`, returns `changed: false` and touches nothing. Without that
 * lock a booking could be activated — and an invitation link regenerated —
 * twice, invalidating the link the organizer already received.
 */
export async function settlePayment(params: {
    paymentId: number;
    gatewayPaymentId?: string | null;
    signature?: string | null;
    status?: string;
    metadata?: Record<string, any>;
    /** Where the settlement came from, for the audit trail. */
    source: 'checkout' | 'webhook' | 'admin';
}): Promise<SettlementResult> {
    return withTransaction(async (conn) => {
        const [paymentRows] = (await conn.query(
            'SELECT * FROM payments WHERE id = ? FOR UPDATE',
            [params.paymentId]
        )) as any;

        if (paymentRows.length === 0) {
            throw new AppError('Payment record not found.', 404);
        }

        const payment = paymentRows[0];
        const targetStatus = params.status || PAYMENT_STATUS.CAPTURED;

        // Already settled — a duplicate callback or a webhook redelivery.
        if (payment.payment_status === PAYMENT_STATUS.CAPTURED) {
            const [bookingRows] = (await conn.query(
                'SELECT invitation_link FROM organizer_bookings WHERE id = ?',
                [payment.booking_id]
            )) as any;

            logger.info(
                `[Payment] Settlement for payment ${payment.id} ignored (already captured, source=${params.source})`
            );

            return {
                changed: false,
                bookingId: payment.booking_id,
                invitationLink: bookingRows[0]?.invitation_link || '',
                paymentStatus: payment.payment_status,
            };
        }

        const mergedMetadata = {
            ...(parseMetadata(payment.metadata) || {}),
            ...(params.metadata || {}),
            settled_by: params.source,
        };

        await conn.query(
            `UPDATE payments
                SET payment_status = ?,
                    gateway_payment_id = COALESCE(?, gateway_payment_id),
                    gateway_signature = COALESCE(?, gateway_signature),
                    transaction_reference = COALESCE(?, transaction_reference),
                    paid_at = COALESCE(paid_at, NOW()),
                    failure_reason = NULL,
                    metadata = ?,
                    updated_at = NOW()
              WHERE id = ?`,
            [
                targetStatus,
                params.gatewayPaymentId || null,
                params.signature || null,
                params.gatewayPaymentId || null,
                JSON.stringify(mergedMetadata),
                payment.id,
            ]
        );

        const invitationLink = await activateBooking(conn, {
            bookingId: payment.booking_id,
            organizerId: payment.organizer_id,
            billingId: payment.billing_id,
            markBillingPaid: targetStatus === PAYMENT_STATUS.CAPTURED,
        });

        logger.info(
            `[Payment] Payment ${payment.id} settled as ${targetStatus} for booking ${payment.booking_id} (source=${params.source})`
        );

        return {
            changed: true,
            bookingId: payment.booking_id,
            invitationLink,
            paymentStatus: targetStatus,
        };
    });
}

/**
 * Activates a booking: issues its invitation link and flips the organizer live.
 *
 * The link is generated only when absent. Regenerating it on a second call
 * would silently break every invitation already sent to participants.
 */
export async function activateBooking(
    conn: PoolConnection,
    params: {
        bookingId: number;
        organizerId: number;
        billingId?: number | null;
        markBillingPaid: boolean;
    }
): Promise<string> {
    const [bookingRows] = (await conn.query(
        'SELECT invitation_link FROM organizer_bookings WHERE id = ? FOR UPDATE',
        [params.bookingId]
    )) as any;

    if (bookingRows.length === 0) {
        throw new AppError('Booking not found.', 404);
    }

    const invitationLink = bookingRows[0].invitation_link || crypto.randomBytes(10).toString('hex');

    await conn.query(
        'UPDATE organizer_bookings SET status = ?, invitation_link = ?, updated_at = NOW() WHERE id = ?',
        ['completed', invitationLink, params.bookingId]
    );

    if (params.billingId) {
        await conn.query(
            'UPDATE organizer_billings SET payment_status = ?, updated_at = NOW() WHERE id = ?',
            [params.markBillingPaid ? 'paid' : 'pending', params.billingId]
        );
    }

    await conn.query(
        'UPDATE organizers SET payment_status = ?, account_status = ?, updated_at = NOW() WHERE id = ?',
        [params.markBillingPaid ? 'paid' : 'pending', 'active', params.organizerId]
    );

    return invitationLink;
}

/**
 * Records a failed or cancelled attempt.
 *
 * Never touches the booking: a failure must leave the organizer free to retry,
 * and an earlier successful payment on the same booking must not be undone by
 * a late failure webhook for a different attempt.
 */
export async function markPaymentFailed(params: {
    paymentId: number;
    status?: string;
    reason?: string | null;
    gatewayPaymentId?: string | null;
    metadata?: Record<string, any>;
}): Promise<boolean> {
    const status = params.status || PAYMENT_STATUS.FAILED;

    const [rows] = await query<any>('SELECT payment_status, metadata FROM payments WHERE id = ?', [
        params.paymentId,
    ]);

    if (rows.length === 0) {
        return false;
    }

    // A captured payment is terminal. Razorpay can deliver payment.failed for an
    // earlier failed attempt on an order that later succeeded; honouring it here
    // would un-pay a paid booking.
    if (rows[0].payment_status === PAYMENT_STATUS.CAPTURED) {
        logger.warn(`[Payment] Ignoring '${status}' for already-captured payment ${params.paymentId}`);
        return false;
    }

    const mergedMetadata = {
        ...(parseMetadata(rows[0].metadata) || {}),
        ...(params.metadata || {}),
    };

    await query(
        `UPDATE payments
            SET payment_status = ?,
                failure_reason = ?,
                gateway_payment_id = COALESCE(?, gateway_payment_id),
                metadata = ?,
                updated_at = NOW()
          WHERE id = ?`,
        [
            status,
            truncateReason(params.reason),
            params.gatewayPaymentId || null,
            JSON.stringify(mergedMetadata),
            params.paymentId,
        ]
    );

    return true;
}

// ---------------------------------------------------------------------------
// Razorpay verification
// ---------------------------------------------------------------------------

export interface VerificationInput {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    /**
     * When the caller is authenticated, the payment must belong to them. Null
     * for a first-time registrant who has no session token yet — the signature
     * check below is what establishes authenticity in both cases.
     */
    organizerId?: number | null;
}

/**
 * Server-side verification of a Razorpay checkout callback.
 *
 * Nothing the browser sends is trusted beyond the three identifiers: the
 * signature is recomputed from the key secret, then the payment is re-fetched
 * from Razorpay and its amount and order linkage checked against our own
 * record. A forged callback fails the HMAC; a replayed one from another
 * booking fails the ownership and amount checks.
 */
export async function verifyRazorpayPayment(input: VerificationInput): Promise<SettlementResult> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, organizerId } = input;

    const [rows] = await query<any>(
        'SELECT * FROM payments WHERE gateway_order_id = ? AND gateway = ? LIMIT 1',
        [razorpayOrderId, 'razorpay']
    );

    if (rows.length === 0) {
        throw new AppError('Payment record not found for this order.', 404);
    }

    const payment = rows[0];

    if (organizerId != null && Number(payment.organizer_id) !== Number(organizerId)) {
        logger.warn(
            `[Payment] Organizer ${organizerId} attempted to verify payment ${payment.id} belonging to organizer ${payment.organizer_id}`
        );
        throw new AppError('Payment record not found for this order.', 404);
    }

    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        await markPaymentFailed({
            paymentId: payment.id,
            reason: 'Signature verification failed',
            gatewayPaymentId: razorpayPaymentId,
            metadata: { verification: 'signature_mismatch' },
        });

        logger.warn(`[Payment] Signature mismatch for order ${razorpayOrderId} (payment ${payment.id})`);
        throw new AppError('Payment verification failed. If money was debited it will be refunded automatically.', 400);
    }

    // Signature only proves the ids were issued by Razorpay for this key. It
    // says nothing about whether the payment actually succeeded or for how
    // much, so ask Razorpay directly.
    const gatewayPayment = await fetchRazorpayPayment(razorpayPaymentId);

    if (gatewayPayment.order_id !== razorpayOrderId) {
        await markPaymentFailed({
            paymentId: payment.id,
            reason: 'Payment does not belong to the expected order',
            gatewayPaymentId: razorpayPaymentId,
            metadata: { verification: 'order_mismatch' },
        });
        throw new AppError('Payment verification failed.', 400);
    }

    const expectedSubunits = toSubunits(Number(payment.amount));
    if (Number(gatewayPayment.amount) !== expectedSubunits) {
        await markPaymentFailed({
            paymentId: payment.id,
            reason: `Amount mismatch: expected ${expectedSubunits}, gateway reported ${gatewayPayment.amount}`,
            gatewayPaymentId: razorpayPaymentId,
            metadata: { verification: 'amount_mismatch' },
        });

        logger.error(
            `[Payment] Amount mismatch on payment ${payment.id}: expected ${expectedSubunits}, got ${gatewayPayment.amount}`
        );
        throw new AppError('Payment verification failed.', 400);
    }

    const mappedStatus = RAZORPAY_STATUS_MAP[gatewayPayment.status] || PAYMENT_STATUS.PENDING;

    if (mappedStatus === PAYMENT_STATUS.FAILED) {
        await markPaymentFailed({
            paymentId: payment.id,
            reason: gatewayPayment.error_description || 'Payment failed at gateway',
            gatewayPaymentId: razorpayPaymentId,
            metadata: gatewayMetadata(gatewayPayment),
        });
        throw new AppError(gatewayPayment.error_description || 'Payment failed. Please try again.', 400);
    }

    // 'authorized' means captured is still pending at Razorpay's end. Orders are
    // created with payment_capture=1 so this normally resolves within seconds;
    // the webhook completes it if it has not by the time the browser returns.
    if (mappedStatus === PAYMENT_STATUS.AUTHORIZED) {
        logger.info(`[Payment] Payment ${payment.id} authorized but not yet captured; awaiting webhook`);
    }

    return settlePayment({
        paymentId: payment.id,
        gatewayPaymentId: razorpayPaymentId,
        signature: razorpaySignature,
        status: PAYMENT_STATUS.CAPTURED,
        metadata: gatewayMetadata(gatewayPayment),
        source: 'checkout',
    });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Distils a Razorpay payment into the non-sensitive fields worth keeping.
 *
 * Explicitly an allowlist, not a redaction pass: dumping the whole gateway
 * object would drag card bins, UPI VPAs and contact details into a table the
 * admin UI renders.
 */
function gatewayMetadata(payment: {
    method?: string;
    bank?: string | null;
    wallet?: string | null;
    status?: string;
    captured?: boolean;
    acquirer_data?: Record<string, any>;
}): Record<string, any> {
    return {
        method: payment.method || null,
        bank: payment.bank || null,
        wallet: payment.wallet || null,
        gateway_status: payment.status || null,
        captured: payment.captured ?? null,
        rrn: payment.acquirer_data?.rrn || null,
    };
}

function parseMetadata(value: any): Record<string, any> | null {
    if (!value) return null;
    if (typeof value === 'object') return value;

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

/** failure_reason is a TEXT column but gateway errors can be unbounded. */
function truncateReason(reason: string | null | undefined): string | null {
    if (!reason) return null;
    return reason.length > 500 ? `${reason.slice(0, 497)}...` : reason;
}

export { fromSubunits, RAZORPAY_STATUS_MAP, gatewayMetadata, parseMetadata, truncateReason };
