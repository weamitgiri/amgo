import { Shield } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayersSidebarProps {
  currentRound: 1 | 2;
  highlightPlayer?: string;
}

const players = [
  { name: 'Ptoto79', colorIndex: 0, status: 'available' as const, isYou: false },
  { name: 'John32', colorIndex: 1, status: 'submitting' as const, isYou: false, timer: '01:15' },
  { name: 'James45', colorIndex: 2, status: 'available' as const, isYou: false },
  { name: 'Fred36', colorIndex: 3, status: 'available' as const, isYou: false },
  { name: 'Mark32', colorIndex: 4, status: 'available' as const, isYou: true },
];

export function PlayersSidebar({ currentRound, highlightPlayer }: PlayersSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E4D4] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0E4D4]">
        <h3 className="text-base font-bold text-[#3D2E1F] flex items-center gap-2">
          <span className="text-lg">👥</span>
          Players
        </h3>
      </div>

      {/* Player list */}
      <div className="divide-y divide-[#F0E4D4]/60">
        {players.map((player) => (
          <div
            key={player.name}
            className={`
              flex items-center gap-3 px-5 py-3 transition-colors duration-150
              ${highlightPlayer === player.name ? 'bg-[#FFF3E0]' : 'hover:bg-[#FFFAF4]'}
            `}
          >
            <PlayerAvatar
              name={player.name}
              colorIndex={player.colorIndex}
              size="sm"
              status={player.status}
              isYou={player.isYou}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#3D2E1F] truncate">
                  {player.name}
                </span>
                {player.isYou && (
                  <span className="text-[10px] font-bold text-[#E8881E] bg-[#FFF3E0] px-1.5 py-0.5 rounded-full">
                    YOU
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    player.status === 'available'
                      ? 'bg-[#4CAF50]'
                      : 'bg-[#E8881E] animate-pulse'
                  }`}
                />
                <span
                  className={`text-xs ${
                    player.status === 'available'
                      ? 'text-[#4CAF50]'
                      : 'text-[#E8881E]'
                  }`}
                >
                  {player.status === 'available' ? 'Available' : 'Submitting'}
                </span>
              </div>
            </div>

            {/* Timer badge for submitting players */}
            {player.status === 'submitting' && player.timer && (
              <span className="text-xs font-mono font-semibold text-[#E8881E] bg-[#FFF3E0] px-2 py-1 rounded-lg">
                {player.timer}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Your Role card */}
      <div className="m-4 mt-2">
        <div className="bg-gradient-to-br from-[#FFF3E0] to-[#FFECCC] rounded-xl p-4 border border-[#E8881E]/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-[#E8881E]" />
            <span className="text-xs font-semibold text-[#8B7355] uppercase tracking-wider">
              Your Role
            </span>
          </div>
          <p className="text-lg font-extrabold text-[#E8881E] tracking-wide">CHEF</p>
          <p className="text-xs text-[#8B7355] mt-0.5">Work with your team to win.</p>
        </div>
      </div>
    </div>
  );
}
