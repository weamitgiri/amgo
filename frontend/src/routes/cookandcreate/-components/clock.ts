import type { CCSchedule } from '@/api/types/cookandcreate';

/**
 * How far the browser's clock is behind the server's, in ms.
 *
 * Every Cook & Create countdown is derived from a server timestamp compared
 * against the local clock, so a device whose clock is off by minutes would show
 * a correspondingly wrong (or permanently 00:00) timer. Adding this offset to
 * Date.now() puts both sides on the same reference.
 *
 * Measured from the moment the response was received, so it does not drift as
 * the state snapshot ages.
 */
export function clockOffsetMs(schedule: CCSchedule | null | undefined, receivedAtMs: number): number {
  if (!schedule?.server_time) return 0;
  const serverMs = new Date(schedule.server_time).getTime();
  if (Number.isNaN(serverMs)) return 0;
  return serverMs - receivedAtMs;
}

/** Seconds left until an absolute instant, corrected for clock skew. Never negative. */
export function secondsUntil(targetAt: string | null | undefined, offsetMs = 0): number {
  if (!targetAt) return 0;
  const target = new Date(targetAt).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.round((target - (Date.now() + offsetMs)) / 1000));
}
