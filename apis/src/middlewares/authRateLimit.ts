import rateLimit from 'express-rate-limit';

/**
 * Brute-force protection for the OTP-based auth flow.
 *
 * A 6-digit OTP has a million combinations and a ten-minute lifetime. Without a
 * cap, an attacker can simply enumerate it against /verify-login or /verify-otp
 * and take over any account by email alone. These limiters put a hard ceiling
 * on attempts per client so guessing is no longer feasible, and stop the
 * send/resend endpoints from being used to spam a victim's inbox.
 *
 * IP-keyed (express-rate-limit's default). A per-account attempt counter in the
 * organizers table would harden this further against a distributed attacker and
 * is the recommended follow-up.
 */

const standard = {
    standardHeaders: true,
    legacyHeaders: false,
} as const;

/**
 * Skip the OTP limiters outside production. In local dev / testing the OTP is a
 * fixed code and every participant joins from the same IP (localhost), so the
 * IP-keyed counters trip almost immediately (HTTP 429) even in normal use. The
 * brute-force protection still applies in production, where NODE_ENV=production.
 */
const skipOutsideProduction = () => process.env.NODE_ENV !== 'production';

/** Verification attempts — the actual guessing surface. Kept tight. */
export const otpVerifyRateLimit = rateLimit({
    ...standard,
    windowMs: 15 * 60 * 1000,
    max: 10,
    skip: skipOutsideProduction,
    message: {
        success: false,
        message: 'Too many verification attempts. Please wait a few minutes and try again.',
        errors: [],
    },
});

/** OTP send / resend / login-initiation — also limits email-spam abuse. */
export const otpRequestRateLimit = rateLimit({
    ...standard,
    windowMs: 15 * 60 * 1000,
    max: 15,
    skip: skipOutsideProduction,
    message: {
        success: false,
        message: 'Too many requests. Please wait a few minutes before trying again.',
        errors: [],
    },
});
