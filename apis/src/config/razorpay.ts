import crypto from 'crypto';
import logger from '../utils/logger';
import { AppError } from '../utils/AppError';

/**
 * Razorpay credentials and REST access.
 *
 * Credentials come from the environment only — never from the database, never
 * from the request. Swapping test keys for live keys is an .env edit plus a
 * restart; no code path branches on mode.
 *
 * The official `razorpay` npm SDK is deliberately not used. Everything this
 * project needs from Razorpay is one authenticated POST (Orders), two GETs
 * (Order/Payment fetch) and two HMAC-SHA256 comparisons, all of which Node's
 * stdlib does natively. That keeps the dependency surface — and the audit
 * surface for a module that handles money — as small as possible.
 */

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

// Razorpay works in the smallest currency unit: paise for INR.
const CURRENCY_SUBUNITS = 100;

export interface RazorpayCredentials {
    keyId: string;
    keySecret: string;
}

function readEnv(name: string): string {
    return (process.env[name] || '').trim();
}

/**
 * Which credential set to use.
 *
 * RAZORPAY_MODE is optional. When absent, the plain RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET pair is used and the mode is inferred from the key
 * prefix. When present, it selects between the TEST and LIVE pairs — which is
 * what makes going live a one-word env change rather than a copy-paste of
 * credentials between variables.
 */
function configuredMode(): 'test' | 'live' | null {
    const mode = readEnv('RAZORPAY_MODE').toLowerCase();
    return mode === 'live' || mode === 'test' ? mode : null;
}

/**
 * Resolves the active key pair.
 *
 * Order: the mode-specific pair (RAZORPAY_TEST_* / RAZORPAY_LIVE_*) when
 * RAZORPAY_MODE names one and it is populated, otherwise the generic
 * RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET pair. Both styles work, so an existing
 * deployment that only sets the generic pair keeps running unchanged.
 */
function resolveCredentials(): { keyId: string; keySecret: string } {
    const mode = configuredMode();

    if (mode) {
        const prefix = mode === 'live' ? 'RAZORPAY_LIVE' : 'RAZORPAY_TEST';
        const keyId = readEnv(`${prefix}_KEY`);
        const keySecret = readEnv(`${prefix}_SECRET`);

        if (keyId && keySecret) {
            return { keyId, keySecret };
        }
    }

    return {
        keyId: readEnv('RAZORPAY_KEY_ID'),
        keySecret: readEnv('RAZORPAY_KEY_SECRET'),
    };
}

/**
 * True when both API credentials are present. Checkout uses this to decide
 * whether to offer Razorpay at all — a half-configured deployment shows COD
 * only rather than presenting a button that fails on click.
 */
export function isRazorpayConfigured(): boolean {
    const { keyId, keySecret } = resolveCredentials();
    return keyId !== '' && keySecret !== '';
}

export function isRazorpayWebhookConfigured(): boolean {
    return resolveWebhookSecret() !== '';
}

export function getRazorpayCredentials(): RazorpayCredentials {
    const { keyId, keySecret } = resolveCredentials();

    if (!keyId || !keySecret) {
        throw new AppError('Online payment is not configured. Please contact support.', 503);
    }

    // A key whose prefix contradicts RAZORPAY_MODE means the wrong pair is
    // populated. Refusing here is deliberate: the alternative is silently
    // taking real money on test keys, or the reverse, with no visible symptom.
    const mode = configuredMode();
    if (mode && !keyId.startsWith(`rzp_${mode}_`)) {
        logger.error(
            `[Razorpay] RAZORPAY_MODE=${mode} but the resolved key id is not an rzp_${mode}_ key. Refusing to transact.`
        );
        throw new AppError('Online payment is misconfigured. Please contact support.', 503);
    }

    return { keyId, keySecret };
}

/** Only the key id is ever safe to hand to a browser. */
export function getPublicRazorpayKeyId(): string {
    return getRazorpayCredentials().keyId;
}

/**
 * Razorpay issues a separate webhook secret per mode, so a mode-specific
 * variable wins when present. RAZORPAY_WEBHOOK_SECRET remains the fallback.
 */
function resolveWebhookSecret(): string {
    const mode = configuredMode();

    if (mode) {
        const scoped = readEnv(mode === 'live' ? 'RAZORPAY_LIVE_WEBHOOK_SECRET' : 'RAZORPAY_TEST_WEBHOOK_SECRET');
        if (scoped) return scoped;
    }

    return readEnv('RAZORPAY_WEBHOOK_SECRET');
}

export function getRazorpayWebhookSecret(): string {
    const secret = resolveWebhookSecret();

    if (!secret) {
        throw new AppError('Razorpay webhook secret is not configured.', 503);
    }

    return secret;
}

/**
 * 'test' | 'live'.
 *
 * Derived from the prefix of the key actually in use, not from RAZORPAY_MODE —
 * the key that will be charged is the truth, and getRazorpayCredentials()
 * already refuses to run when the two disagree.
 */
export function getRazorpayMode(): 'test' | 'live' {
    return resolveCredentials().keyId.startsWith('rzp_live_') ? 'live' : 'test';
}

export function toSubunits(amount: number): number {
    // Round rather than truncate: 1234.565 * 100 is 123456.49999 in binary
    // floating point, and truncating would undercharge by a paisa.
    return Math.round(amount * CURRENCY_SUBUNITS);
}

export function fromSubunits(subunits: number): number {
    return Number((subunits / CURRENCY_SUBUNITS).toFixed(2));
}

/**
 * Constant-time comparison of two hex digests.
 *
 * `===` on signatures leaks, through timing, how many leading characters an
 * attacker guessed correctly. timingSafeEqual needs equal-length buffers, so a
 * length mismatch short-circuits to false before the comparison.
 */
export function safeCompare(expected: string, received: string): boolean {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(received, 'utf8');

    if (a.length !== b.length) {
        return false;
    }

    return crypto.timingSafeEqual(a, b);
}

/**
 * Signature Razorpay Checkout returns to the browser:
 * HMAC-SHA256(order_id + '|' + payment_id, key_secret).
 */
export function verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    receivedSignature: string
): boolean {
    if (!razorpayOrderId || !razorpayPaymentId || !receivedSignature) {
        return false;
    }

    const { keySecret } = getRazorpayCredentials();
    const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    return safeCompare(expected, receivedSignature);
}

/**
 * Signature on the X-Razorpay-Signature header of a webhook:
 * HMAC-SHA256(raw request body, webhook_secret).
 *
 * Must run against the exact bytes received. JSON.stringify(req.body) is not
 * byte-identical to what Razorpay signed (key order, unicode escaping, spacing)
 * and will fail or, worse, pass inconsistently.
 */
export function verifyWebhookSignature(rawBody: Buffer | string, receivedSignature: string): boolean {
    if (!rawBody || !receivedSignature) {
        return false;
    }

    const expected = crypto
        .createHmac('sha256', getRazorpayWebhookSecret())
        .update(rawBody)
        .digest('hex');

    return safeCompare(expected, receivedSignature);
}

function authHeader(): string {
    const { keyId, keySecret } = getRazorpayCredentials();
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

async function razorpayRequest<T = any>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, any>
): Promise<T> {
    let response: globalThis.Response;

    try {
        response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
            method,
            headers: {
                Authorization: authHeader(),
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
            // Razorpay's own guidance is a 30s+ client timeout; without one a
            // stalled connection would hold the checkout request open forever.
            signal: AbortSignal.timeout(30_000),
        });
    } catch (err: any) {
        // Network/timeout. Never surface the raw error to the browser — it can
        // carry the outbound request including the Authorization header.
        logger.error(`[Razorpay] ${method} ${path} transport failure: ${err?.message}`);
        throw new AppError('Could not reach the payment gateway. Please try again.', 502);
    }

    const payload: any = await response.json().catch(() => ({}));

    if (!response.ok) {
        const description = payload?.error?.description || 'Unknown gateway error';
        const code = payload?.error?.code || response.status;
        logger.error(`[Razorpay] ${method} ${path} failed (${code}): ${description}`);
        throw new AppError(`Payment gateway error: ${description}`, 502, { code });
    }

    return payload as T;
}

export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    status: string;
    receipt?: string;
    notes?: Record<string, string>;
}

/**
 * Creates an Order via the Razorpay Orders API.
 *
 * Checkout is always opened against a server-created order id. A payment made
 * without one cannot be reconciled to a booking or auto-captured, and it would
 * let the browser dictate the amount.
 */
export async function createRazorpayOrder(params: {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
    return razorpayRequest<RazorpayOrder>('POST', '/orders', {
        amount: toSubunits(params.amount),
        currency: params.currency || 'INR',
        // Razorpay caps receipt at 40 chars and rejects longer ones outright.
        receipt: params.receipt.slice(0, 40),
        payment_capture: 1,
        notes: params.notes || {},
    });
}

export interface RazorpayPayment {
    id: string;
    order_id: string;
    status: string;
    method?: string;
    amount: number;
    currency: string;
    captured?: boolean;
    error_code?: string | null;
    error_description?: string | null;
    bank?: string | null;
    wallet?: string | null;
    acquirer_data?: Record<string, any>;
}

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
    return razorpayRequest<RazorpayPayment>('GET', `/payments/${encodeURIComponent(paymentId)}`);
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
    return razorpayRequest<RazorpayOrder>('GET', `/orders/${encodeURIComponent(orderId)}`);
}
