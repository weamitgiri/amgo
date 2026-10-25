import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A resend cooldown countdown. Call `start(seconds)` after an OTP is sent (or
 * when the server reports a 429 cooldown); `remaining` ticks down to 0 each
 * second and `active` is true while it runs. The Resend button should be
 * disabled while `active`.
 */
export function useResendCountdown(defaultSeconds = 60) {
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number = defaultSeconds) => {
      stop();
      const secs = Math.max(0, Math.ceil(seconds || 0));
      setRemaining(secs);
      if (secs <= 0) return;
      timer.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            stop();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    },
    [defaultSeconds, stop]
  );

  useEffect(() => stop, [stop]);

  return { remaining, active: remaining > 0, start, stop };
}
