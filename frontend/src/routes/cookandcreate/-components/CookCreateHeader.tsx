import { useEffect, useState } from 'react';
import logoImg from '../../../assets/cookandcreate/Cook  and Create Logo.png';

interface CookCreateHeaderProps {
  showGameTimer?: boolean;
  /**
   * Absolute instant the session ends (ISO, from the server's schedule block).
   * The clock is derived from this every second, so it keeps counting correctly
   * across refreshes instead of restarting from a fixed duration.
   */
  gameEndsAt?: string | null;
  /** Browser-to-server clock correction in ms. */
  clockOffsetMs?: number;
  participantName?: string;
}

function formatRemaining(endsAt: string, clockOffsetMs: number): string {
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return '--:--';
  const secs = Math.max(0, Math.round((end - (Date.now() + clockOffsetMs)) / 1000));
  const mins = Math.floor(secs / 60);
  return `${String(mins).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
}

export function CookCreateHeader({
  showGameTimer = true,
  gameEndsAt = null,
  clockOffsetMs = 0,
  participantName = 'Participant',
}: CookCreateHeaderProps) {
  const initials = participantName.trim().slice(0, 2).toUpperCase() || 'P';

  const [remaining, setRemaining] = useState(() =>
    gameEndsAt ? formatRemaining(gameEndsAt, clockOffsetMs) : '--:--'
  );

  useEffect(() => {
    if (!showGameTimer || !gameEndsAt) return;
    setRemaining(formatRemaining(gameEndsAt, clockOffsetMs));
    const id = setInterval(() => setRemaining(formatRemaining(gameEndsAt, clockOffsetMs)), 1000);
    return () => clearInterval(id);
  }, [showGameTimer, gameEndsAt, clockOffsetMs]);

  return (
    <div className="w-full bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#F0E4D4] shadow-sm">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <img src={logoImg} alt="Cook & Create" className="w-9 h-9 object-contain" />
        <span className="text-lg font-extrabold text-[#3D2E1F]">Cook &amp; Create</span>
      </div>

      {/* Center/Right: Game Timer */}
      {showGameTimer && (
        <div className="flex items-center gap-3 bg-[#FFF3E0] border border-[#E8881E]/15 rounded-xl px-4 py-2">
          <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">Game Time Remaining</span>
          <span className="text-base font-extrabold text-[#3D2E1F] font-mono">{remaining}</span>
        </div>
      )}

      {/* Right: User Avatar */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#FF8A65] text-white font-bold text-xs flex items-center justify-center shadow-sm">
          {initials}
        </div>
        <span className="text-sm font-bold text-[#3D2E1F]">{participantName}</span>
      </div>
    </div>
  );
}
