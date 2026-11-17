import { query } from '../config/db';

// 6-character codes. Look-alike characters O/0 and I/1 are excluded so a code
// shared on paper/chat can't be mistyped.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateCode(): string {
    let out = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return out;
}

/**
 * Normalise a user-entered login code for comparison: strip spaces and any
 * non-alphanumeric characters, and upper-case. Codes never contain O/0/I/1, so a
 * simple upper-case compare is enough.
 */
export function normaliseCode(input: unknown): string {
    return String(input ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
}

/** How many login codes a booking should have — one per seat in its package. */
async function getBookingSeatCount(bookingId: number | string): Promise<number> {
    const [rows] = await query<any>(
        `SELECT p.max_users FROM organizer_bookings ob
         JOIN packages p ON p.id = ob.package_id
         WHERE ob.id = ? LIMIT 1`,
        [bookingId]
    );
    if ((rows as any[]).length === 0) return 0;
    return Number(rows[0].max_users) || 0;
}

/**
 * Ensure a booking has its full set of per-employee login codes — one unique code
 * per seat in the selected package (Option B / PDF). Idempotent: it only tops up
 * the missing count, so calling it repeatedly is safe. Returns all codes, in order.
 */
export async function ensureBookingCodes(bookingId: number | string): Promise<string[]> {
    const target = await getBookingSeatCount(bookingId);

    const [existingRows] = await query<any>(
        'SELECT code FROM participant_login_codes WHERE booking_id = ? ORDER BY id ASC',
        [bookingId]
    );
    let codes = (existingRows as any[]).map((r) => String(r.code));
    if (target <= 0 || codes.length >= target) return codes;

    const have = new Set(codes);
    const toAdd = target - codes.length;
    const fresh: string[] = [];
    let guard = 0;
    while (fresh.length < toAdd && guard < toAdd * 50 + 100) {
        guard++;
        const c = generateCode();
        if (have.has(c)) continue;
        have.add(c);
        fresh.push(c);
    }

    if (fresh.length > 0) {
        const placeholders = fresh.map(() => '(?, ?)').join(', ');
        const params = fresh.flatMap((c) => [bookingId, c]);
        // INSERT IGNORE tolerates the UNIQUE(booking_id, code) key if two requests
        // generate at once — duplicates are simply skipped.
        await query(
            `INSERT IGNORE INTO participant_login_codes (booking_id, code) VALUES ${placeholders}`,
            params
        );
    }

    const [afterRows] = await query<any>(
        'SELECT code FROM participant_login_codes WHERE booking_id = ? ORDER BY id ASC',
        [bookingId]
    );
    codes = (afterRows as any[]).map((r) => String(r.code));
    return codes;
}

/**
 * Full list of a booking's codes with who used each one. Unused codes have a null
 * name/joined_at. Ordered by issue order, so the sheet and this list line up.
 */
export async function getBookingCodeList(
    bookingId: number | string
): Promise<{ code: string; participant_name: string | null; joined_at: string | null }[]> {
    const [rows] = await query<any>(
        `SELECT c.code, gp.name AS participant_name, c.used_at AS joined_at
         FROM participant_login_codes c
         LEFT JOIN game_participants gp ON gp.id = c.participant_id
         WHERE c.booking_id = ?
         ORDER BY c.id ASC`,
        [bookingId]
    );
    return (rows as any[]).map((r) => ({
        code: String(r.code),
        participant_name: r.participant_name ?? null,
        joined_at: r.joined_at ?? null,
    }));
}

/** Total vs used code counts for a booking (used = bound to a joined participant). */
export async function getBookingCodeStats(
    bookingId: number | string
): Promise<{ total: number; used: number }> {
    const [rows] = await query<any>(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(participant_id IS NOT NULL), 0) AS used
         FROM participant_login_codes WHERE booking_id = ?`,
        [bookingId]
    );
    return { total: Number(rows?.[0]?.total || 0), used: Number(rows?.[0]?.used || 0) };
}
