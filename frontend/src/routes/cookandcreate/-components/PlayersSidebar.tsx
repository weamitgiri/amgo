import chefHatImg from '../../../assets/cookandcreate/chef-1 1.png';

interface PlayersSidebarProps {
  currentRound: 1 | 2 | 3;
  highlightPlayer?: string;
}

const players = [
  { name: 'Ptoto79', initials: 'P7', bg: '#E8881E', status: 'available', time: '' },
  { name: 'John32', initials: 'J3', bg: '#E5A023', status: 'submitting', time: '01:15' },
  { name: 'James45', initials: 'J3', bg: '#36B37E', status: 'available', time: '' },
  { name: 'Fred36', initials: 'J3', bg: '#00B8D9', status: 'available', time: '' },
  { name: 'Mark32 (You)', initials: 'J3', bg: '#6554C0', status: 'available', time: '', isYou: true },
];

export function PlayersSidebar({ highlightPlayer }: PlayersSidebarProps) {
  return (
    <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-3 space-y-3">
      {/* Title */}
      <h3 className="text-sm font-extrabold text-[#3D2E1F] px-2 pt-1">
        Players
      </h3>

      {/* Players list */}
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.name}
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-[#F5E6D3] shadow-xs
              ${highlightPlayer && player.name.includes(highlightPlayer) ? 'ring-2 ring-[#E8881E]' : ''}
            `}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar circle */}
              <div
                className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: player.bg }}
              >
                {player.initials}
              </div>

              {/* Player details */}
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#3D2E1F] block truncate">
                  {player.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      player.status === 'available' ? 'bg-[#36B37E]' : 'bg-[#E8881E] animate-pulse'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      player.status === 'available' ? 'text-[#36B37E]' : 'text-[#E8881E]'
                    }`}
                  >
                    {player.status === 'available' ? 'Available' : 'Submitting'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer badge */}
            {player.time && (
              <span className="text-xs font-bold text-[#E8881E] font-mono shrink-0 ml-1">
                {player.time}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Your Role card */}
      <div className="bg-[#FFF3E0] rounded-xl p-3 border border-[#F5DCBD] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white border border-[#F5E6D3] p-1 flex items-center justify-center shrink-0">
          <img src={chefHatImg} alt="Chef" className="w-full h-full object-contain" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-[#8B7355] block">
            Your Role
          </span>
          <span className="text-sm font-black text-[#3D2E1F] block">
            CHEF
          </span>
          <span className="text-[10px] text-[#8B7355] block leading-tight">
            Work with your team to win.
          </span>
        </div>
      </div>
    </div>
  );
}

