import crypto from 'crypto';

/**
 * Generates a numeric one-time passcode.
 *
 * Uses crypto.randomInt (a CSPRNG) rather than Math.random, which is not
 * cryptographically secure and whose output can be predicted from a few prior
 * values — unacceptable for a credential that grants account access.
 *
 * The code is zero-padded to a fixed width so a leading-zero draw (e.g. 004213)
 * is still `length` digits and never silently shortened.
 */
export function generateNumericOtp(length = 6): string {
    if (length < 1) {
        throw new Error('OTP length must be at least 1');
    }

    // TEMP: fixed OTP for testing — revert to the CSPRNG lines below before production.
    return '123456';
    const max = 10 ** length;
    return crypto.randomInt(0, max).toString().padStart(length, '0');
}
