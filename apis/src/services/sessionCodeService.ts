import { query } from '../config/db';

// 6-character codes. Look-alike characters O/0 and I/1 are excluded so a code
// shared on paper/chat can't be mistyped.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateSessionCode(): string {
    let out = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return out;
}

/**
 * Normalise a user-entered login code for comparison: trim, strip spaces and any
 * non-alphanumeric characters, and upper-case. Codes never contain O/0/I/1, so a
 * simple upper-case compare is enough.
 */
export function normaliseCode(input: unknown): string {
    return String(input ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
}

/**
 * One shared login code per booking (Option A). HR shares this single code with
 * every employee; employees enter their name + this code to join — no email, no
 * OTP. Idempotent: returns the booking's existing code, or generates, stores and
 * returns a new one that is unique across bookings.
 */
export async function getOrCreateBookingSessionCode(bookingId: number | string): Promise<string> {
    const [rows] = await query<any>('SELECT session_code FROM organizer_bookings WHERE id = ? LIMIT 1', [bookingId]);
    if ((rows as any[]).length === 0) return '';
    const existing = rows[0].session_code;
    if (existing) return String(existing);

    for (let attempt = 0; attempt < 8; attempt++) {
        const code = generateSessionCode();
        const [dupe] = await query<any>('SELECT id FROM organizer_bookings WHERE session_code = ? LIMIT 1', [code]);
        if ((dupe as any[]).length > 0) continue;
        // Only set it if still empty, so two concurrent callers can't overwrite
        // each other — then read back whichever value won.
        await query('UPDATE organizer_bookings SET session_code = ? WHERE id = ? AND session_code IS NULL', [
            code,
            bookingId,
        ]);
        const [fresh] = await query<any>('SELECT session_code FROM organizer_bookings WHERE id = ? LIMIT 1', [bookingId]);
        const won = fresh?.[0]?.session_code;
        if (won) return String(won);
    }
    throw new Error('Could not generate a unique session code');
}
