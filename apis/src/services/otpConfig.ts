import moment from 'moment';
import { query } from '../config/db';

/**
 * Central OTP configuration. The OTP expiry is set by the admin in the Laravel
 * admin panel (Settings → OTP, key `otp_expiry_time` in the shared `settings`
 * table) and read here, so expiry is configured in ONE place rather than
 * hardcoded across the controllers.
 *
 * Bounds mirror the admin-side validation (60s–600s, default 300s): a value
 * outside the range — or a missing / unreadable setting — falls back safely,
 * so a bad row can never produce a zero-second or absurdly long OTP.
 */
export const DEFAULT_OTP_EXPIRY_SECONDS = 300; // 5 minutes
export const MIN_OTP_EXPIRY_SECONDS = 60; // 1 minute
export const MAX_OTP_EXPIRY_SECONDS = 600; // 10 minutes

/**
 * Minimum gap between OTP requests for the same account — a fixed 60-second
 * resend cooldown, separate from the OTP expiry. Prevents resend spam and
 * duplicate OTP generation from repeated clicks or concurrent requests.
 */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Re-read from the DB at most this often, so an admin change takes effect within
// the window without a query on every single OTP generated.
const CACHE_TTL_MS = 30 * 1000;

let cache: { seconds: number; at: number } | null = null;

/** The configured OTP lifetime in seconds, clamped to the allowed range. */
export async function getOtpExpirySeconds(): Promise<number> {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
        return cache.seconds;
    }

    let seconds = DEFAULT_OTP_EXPIRY_SECONDS;
    try {
        const [rows] = await query<{ value: string }>(
            "SELECT `value` FROM `settings` WHERE `key` = 'otp_expiry_time' LIMIT 1"
        );
        const parsed = rows?.[0]?.value != null ? parseInt(String(rows[0].value), 10) : NaN;
        if (Number.isFinite(parsed)) {
            seconds = parsed;
        }
    } catch {
        // Settings unavailable (e.g. table missing in a bare test DB) — use the default.
    }

    seconds = Math.min(Math.max(seconds, MIN_OTP_EXPIRY_SECONDS), MAX_OTP_EXPIRY_SECONDS);
    cache = { seconds, at: Date.now() };
    return seconds;
}

/**
 * The expiry timestamp for an OTP generated now, as a MySQL datetime string.
 * Use this everywhere an OTP is issued so every flow honours the admin setting.
 */
export async function getOtpExpiresAt(): Promise<string> {
    const seconds = await getOtpExpirySeconds();
    return moment().add(seconds, 'seconds').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Seconds still remaining on the resend cooldown given when the last OTP was
 * sent (a MySQL datetime string, Date, or null). 0 means a resend is allowed.
 */
export function resendCooldownRemaining(lastSentAt: string | Date | null | undefined): number {
    if (!lastSentAt) return 0;
    const last = moment(lastSentAt);
    if (!last.isValid()) return 0;
    const elapsed = moment().diff(last, 'seconds');
    const remaining = OTP_RESEND_COOLDOWN_SECONDS - elapsed;
    return remaining > 0 ? remaining : 0;
}

/** Test helper: drop the cached value so the next read hits the DB. */
export function clearOtpConfigCache(): void {
    cache = null;
}
