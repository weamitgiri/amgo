import { CountdownTimer } from './CountdownTimer';
import logoImg from '../../../assets/cookandcreate/Cook  and Create Logo.png';

interface CookCreateHeaderProps {
  showGameTimer?: boolean;
  timerMinutes?: number;
  timerSeconds?: number;
}

export function CookCreateHeader({
  showGameTimer = true,
  timerMinutes = 24,
  timerSeconds = 58,
}: CookCreateHeaderProps) {
  return (
    <div className="w-full bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#F0E4D4] shadow-sm">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <img src={logoImg} alt="Cook & Create" className="w-9 h-9 object-contain" />
        <span className="text-lg font-extrabold text-[#3D2E1F]">
          Cook &amp; Create
        </span>
      </div>

      {/* Center/Right: Game Timer */}
      {showGameTimer && (
        <div className="flex items-center gap-3 bg-[#FFF3E0] border border-[#E8881E]/15 rounded-xl px-4 py-2">
          <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">
            Game Time Remaining
          </span>
          <span className="text-base font-extrabold text-[#3D2E1F] font-mono">
            {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Right: User Avatar */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#FF8A65] text-white font-bold text-xs flex items-center justify-center shadow-sm">
          SK
        </div>
        <span className="text-sm font-bold text-[#3D2E1F]">
          Sneha Kapoor
        </span>
      </div>
    </div>
  );
}

