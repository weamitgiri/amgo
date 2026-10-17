import { useEffect, useState } from "react";
import type { DashboardBooking } from "@/api/types/organizer";

type BookingSchedule = Pick<DashboardBooking, "scheduled_date" | "scheduled_time" | "game_duration_secs">;

const toNumber = (value: unknown, fallback = 0) => {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

/** Parses a booking's scheduled date + time exactly as the dashboard does. */
function parseDateTime(
  dateValue: string | Date | null | undefined,
  timeValue: string | Date | null | undefined
): Date | null {
  if (!dateValue || !timeValue) return null;

  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (dateValue instanceof Date) {
    year = dateValue.getFullYear();
    month = dateValue.getMonth() + 1;
    day = dateValue.getDate();
  } else if (typeof dateValue === "string") {
    const dateParts = dateValue.trim().split(/[-\/]/).map((s) => parseInt(s, 10));
    if (dateParts.length === 3) {
      [year, month, day] = dateParts;
    }
  }

  if (timeValue instanceof Date) {
    hours = timeValue.getHours();
    minutes = timeValue.getMinutes();
    seconds = timeValue.getSeconds();
  } else if (typeof timeValue === "string") {
    const timeParts = timeValue.trim().split(":").map((s) => parseInt(s, 10));
    if (timeParts.length >= 2) {
      [hours, minutes, seconds] = [timeParts[0] ?? 0, timeParts[1] ?? 0, timeParts[2] ?? 0];
    }
  }

  if (year === null || month === null || day === null) return null;

  const result = new Date(year, month - 1, day, hours, minutes, seconds);
  return Number.isNaN(result.getTime()) ? null : result;
}

/** When the event ends: scheduled start + game duration (25 min if unknown). */
function getEventEndTime(booking: BookingSchedule | undefined): Date | null {
  const start = parseDateTime(booking?.scheduled_date, booking?.scheduled_time);
  const durationSecs = toNumber(booking?.game_duration_secs, 25 * 60);
  return start && durationSecs > 0 ? new Date(start.getTime() + durationSecs * 1000) : null;
}

/**
 * True once the organizer's event has ended — the same rule as the dashboard's
 * "Event Completed" status. Re-evaluates when the end time passes, so an open
 * page switches over without a refresh.
 */
export function useIsEventCompleted(booking: BookingSchedule | undefined): boolean {
  const endMs = getEventEndTime(booking)?.getTime() ?? null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endMs === null || endMs <= now) return;
    // Capped so very distant events don't overflow setTimeout's 32-bit delay.
    const delay = Math.min(endMs - Date.now(), 60 * 60 * 1000);
    const timer = setTimeout(() => setNow(Date.now()), Math.max(0, delay) + 50);
    return () => clearTimeout(timer);
  }, [endMs, now]);

  return endMs !== null && endMs <= now;
}
