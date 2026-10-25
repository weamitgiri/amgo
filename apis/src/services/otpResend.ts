import { query } from '../config/db';
import { AppError } from '../utils/AppError';
import { resendCooldownRemaining } from './otpConfig';

type AuthTable = 'organizers' | 'game_participants';

/**
 * Enforces the OTP resend cooldown for an account. Reads otp_sent_at for the
 * row identified by keyColumn = keyValue and, if an OTP was sent within the
 * cooldown window, throws 429 with the remaining seconds in errorData.retry_after
 * so the client can show an accurate countdown.
 *
 * table and keyColumn are controlled by the caller (never user input), so the
 * identifiers interpolated here are safe; keyValue is always parameterised.
 */
export async function assertResendCooldown(
    table: AuthTable,
    keyColumn: string,
    keyValue: number | string
): Promise<void> {
    const [rows] = await query<{ otp_sent_at: string | null }>(
        `SELECT otp_sent_at FROM \`${table}\` WHERE \`${keyColumn}\` = ? LIMIT 1`,
        [keyValue]
    );
    const remaining = resendCooldownRemaining(rows?.[0]?.otp_sent_at ?? null);
    if (remaining > 0) {
        throw new AppError(
            `Please wait ${remaining} second${remaining === 1 ? '' : 's'} before requesting another code.`,
            429,
            { retry_after: remaining }
        );
    }
}
