import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  /** Absolute instant to count down to (ISO string from the server). */
  targetAt?: string | null;
  /**
   * Milliseconds to add to the browser clock to match the server's, so a device
   * with a skewed clock still shows the right remainder.
   */
  clockOffsetMs?: number;
  variant?: 'badge' | 'large';
  label?: string;
  /** Shown instead of a clock when there is no target to count down to. */
  emptyLabel?: string;
}

function remainingSeconds(targetAt: string, clockOffsetMs: number): number {
  const target = new Date(targetAt).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.round((target - (Date.now() + clockOffsetMs)) / 1000));
}

/**
 * Counts down to a fixed instant rather than running a duration down from
 * whatever it was mounted with.
 *
 * That distinction is the whole point: a duration-based timer restarts at full
 * on every mount, so refreshing the lobby page used to put the "Game Starts in"
 * clock back to 2:00 no matter how long the player had actually been waiting.
 * Deriving the remainder from an absolute target each tick makes a refresh (or
 * a re-mount, or a backgrounded tab) show the true time left.
 */
export function CountdownTimer({
  targetAt,
  clockOffsetMs = 0,
  variant = 'badge',
  label,
  emptyLabel = '--:--',
}: CountdownTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(() =>
    targetAt ? remainingSeconds(targetAt, clockOffsetMs) : 0
  );

  useEffect(() => {
    if (!targetAt) return;
    // Recompute immediately so a target change isn't a tick behind.
    setTotalSeconds(remainingSeconds(targetAt, clockOffsetMs));
    const id = setInterval(() => setTotalSeconds(remainingSeconds(targetAt, clockOffsetMs)), 1000);
    return () => clearInterval(id);
  }, [targetAt, clockOffsetMs]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = targetAt
    ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : emptyLabel;

  if (variant === 'large') {
    return (
      <div className="flex flex-col items-center gap-2">
        {label && (
          <span className="text-sm font-medium" style={{ color: '#8B7355' }}>
            {label}
          </span>
        )}
        <div className="rounded-2xl px-8 py-4 text-center" style={{ backgroundColor: '#FFF3E0' }}>
          <span className="text-4xl font-bold tracking-wider font-mono" style={{ color: '#E8881E' }}>
            {display}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold font-mono"
      style={{ backgroundColor: '#FFF3E0', color: '#E8881E' }}
    >
      {display}
    </span>
  );
}
