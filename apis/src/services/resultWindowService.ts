import { query } from '../config/db';

/** How long a session's results (and its Download PDF button) stay available. */
export const RESULTS_VISIBLE_MS = 60 * 60 * 1000;

/**
 * A session's result is DECLARED only once every group that actually played has
 * finished (status completed/incomplete) — none is still `active`. Groups still
 * `waiting` never started (they never filled before the entry window closed, see
 * buildLobbyPayload's group_incomplete), so they can never submit and are left
 * out. The declaration time is the moment the LAST played group finished; the
 * results stay available for RESULTS_VISIBLE_MS from that moment, never from game
 * start or page load. Returns null while the result is not declared yet.
 *
 * Shared by the HR Results tab / PDF downloads and the retention sweep, so the
 * data is never deleted while its results are still on show.
 */
export function getSessionResultWindow(groups: { status: string; completed_at: any }[]) {
    const played = groups.filter((g) => g.status !== 'waiting');
    if (played.length === 0) return null;
    if (!played.every((g) => g.status === 'completed' || g.status === 'incomplete')) return null;
    const times = played
        .map((g) => (g.completed_at ? new Date(g.completed_at).getTime() : NaN))
        .filter((t) => !isNaN(t));
    if (times.length !== played.length) return null;
    const declaredAt = Math.max(...times);
    const expiresAt = declaredAt + RESULTS_VISIBLE_MS;
    return { declaredAt, expiresAt, isOpen: Date.now() < expiresAt };
}

/** Loads one booking's groups and applies getSessionResultWindow. */
export async function getBookingResultWindow(bookingId: number) {
    const [groups] = await query<any>('SELECT status, completed_at FROM game_groups WHERE booking_id = ?', [bookingId]);
    return getSessionResultWindow(groups as any[]);
}
