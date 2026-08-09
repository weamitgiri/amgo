export type CCPlayerSidebarEntry = {
  id: number;
  name: string;
  isYou: boolean;
  online: boolean;
  submitted?: boolean;
};

interface PlayersSidebarProps {
  players: CCPlayerSidebarEntry[];
  myRoleLabel: string;
  myRoleEmoji?: string;
}

const AVATAR_COLORS = ['#E8881E', '#E5A023', '#36B37E', '#00B8D9', '#6554C0'];

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

export function PlayersSidebar({ players, myRoleLabel, myRoleEmoji = '🍳' }: PlayersSidebarProps) {
  return (
    <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-3 space-y-3">
      {/* Title */}
      <h3 className="text-sm font-extrabold text-[#3D2E1F] px-2 pt-1">Players</h3>

      {/* Players list */}
      <div className="space-y-2">
        {players.map((player, i) => (
          <div
            key={player.id}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-[#F5E6D3] shadow-xs ${
              player.isYou ? 'ring-2 ring-[#E8881E]' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar circle */}
              <div
                className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {initials(player.name)}
              </div>

              {/* Player details */}
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#3D2E1F] block truncate">
                  {player.name}
                  {player.isYou ? ' (You)' : ''}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      !player.online ? 'bg-[#B8A898]' : player.submitted ? 'bg-[#36B37E]' : 'bg-[#E8881E] animate-pulse'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      !player.online ? 'text-[#B8A898]' : player.submitted ? 'text-[#36B37E]' : 'text-[#E8881E]'
                    }`}
                  >
                    {!player.online ? 'Offline' : player.submitted ? 'Submitted' : 'Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Your Role card */}
      <div className="bg-[#FFF3E0] rounded-xl p-3 border border-[#F5DCBD] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white border border-[#F5E6D3] flex items-center justify-center shrink-0 text-xl">
          {myRoleEmoji}
        </div>
        <div>
          <span className="text-[10px] font-bold text-[#8B7355] block">Your Role</span>
          <span className="text-sm font-black text-[#3D2E1F] block">{myRoleLabel}</span>
          <span className="text-[10px] text-[#8B7355] block leading-tight">Work with your team to win.</span>
        </div>
      </div>
    </div>
  );
}
