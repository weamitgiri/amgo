import { useState, useEffect, useRef, useCallback } from 'react';

interface CountdownTimerProps {
  initialMinutes: number;
  initialSeconds: number;
  variant?: 'badge' | 'large';
  label?: string;
  running?: boolean;
}

export function CountdownTimer({
  initialMinutes,
  initialSeconds,
  variant = 'badge',
  label,
  running = true,
}: CountdownTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(
    initialMinutes * 60 + initialSeconds
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setTotalSeconds(initialMinutes * 60 + initialSeconds);
  }, [initialMinutes, initialSeconds]);

  useEffect(() => {
    if (!running || totalSeconds <= 0) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [running, totalSeconds <= 0, clearTimer]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (variant === 'large') {
    return (
      <div className="flex flex-col items-center gap-2">
        {label && (
          <span
            className="text-sm font-medium"
            style={{ color: '#8B7355' }}
          >
            {label}
          </span>
        )}
        <div
          className="rounded-2xl px-8 py-4 text-center"
          style={{ backgroundColor: '#FFF3E0' }}
        >
          <span
            className="text-4xl font-bold tracking-wider font-mono"
            style={{ color: '#E8881E' }}
          >
            {display}
          </span>
        </div>
      </div>
    );
  }

  // badge variant
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold font-mono"
      style={{
        backgroundColor: '#FFF3E0',
        color: '#E8881E',
      }}
    >
      {display}
    </span>
  );
}
