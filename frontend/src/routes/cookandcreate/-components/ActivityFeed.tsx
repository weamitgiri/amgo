interface ActivityFeedProps {
  currentRound: 1 | 2 | 3;
}

const activities = [
  {
    name: 'Mark32',
    initials: 'M3',
    bg: '#6554C0',
    text: 'submitting...',
    time: '',
    type: 'submitting',
  },
  {
    name: 'John32',
    initials: 'J3',
    bg: '#E5A023',
    text: 'submitting...',
    time: '',
    type: 'submitting',
  },
  {
    name: 'Ptoto79',
    initials: 'P7',
    bg: '#E8881E',
    text: 'Has submitted their vote.',
    time: 'Just Now',
    type: 'submitted',
  },
  {
    name: 'James45',
    initials: 'J4',
    bg: '#36B37E',
    text: 'Missed to submit their vote.',
    time: '2 minutes ago',
    type: 'missed',
  },
  {
    name: 'Fred36',
    initials: 'F3',
    bg: '#00B8D9',
    text: 'Has submitted their vote.',
    time: '4 minutes ago',
    type: 'submitted',
  },
];

export function ActivityFeed({ currentRound }: ActivityFeedProps) {
  return (
    <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-4 space-y-3">
      {/* Header */}
      <div>
        <h3 className="text-sm font-extrabold text-[#3D2E1F]">
          Recent Activity
        </h3>
        <span className="text-xs font-bold text-[#E8881E] mt-1 block">
          Round {currentRound}
        </span>
      </div>

      <hr className="border-t border-[#F0D5B5]" />

      {/* Activity list */}
      <div className="space-y-3.5 pt-1">
        {activities.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            {/* Avatar circle */}
            <div
              className="w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: item.bg }}
            >
              {item.initials}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#3D2E1F] leading-tight">
                <span className="font-bold text-[#E8881E]">{item.name}</span>{' '}
                <span className="text-[#6E5A44]">{item.text}</span>
              </p>
              {item.time && (
                <span className="text-[10px] text-[#9C826B] mt-1 block">
                  {item.time}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

