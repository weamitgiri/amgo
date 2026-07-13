import { Check, Clock, Loader2 } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';

interface ActivityFeedProps {
  currentRound: 1 | 2;
}

const round1Activities = [
  {
    name: 'Mark32',
    colorIndex: 4,
    text: 'submitting...',
    time: '',
    status: 'submitting' as const,
  },
  {
    name: 'John32',
    colorIndex: 1,
    text: 'submitting...',
    time: '',
    status: 'submitting' as const,
  },
  {
    name: 'Ptoto79',
    colorIndex: 0,
    text: 'Has submitted their vote.',
    time: 'Just Now',
    status: 'done' as const,
  },
  {
    name: 'James45',
    colorIndex: 2,
    text: 'Missed to submit their vote',
    time: '2 minutes ago',
    status: 'missed' as const,
  },
  {
    name: 'Fred36',
    colorIndex: 3,
    text: 'Has submitted their vote.',
    time: '4 minutes ago',
    status: 'done' as const,
  },
];

const round2Steps = [
  {
    label: 'Step A',
    text: 'Marinate the chicken with garlic and spices',
    status: 'done' as const,
  },
  {
    label: 'Step B',
    text: 'Dice the tomatoes and onions finely',
    status: 'done' as const,
  },
  {
    label: 'Step C',
    text: 'Sauté the onions until golden brown',
    status: 'submitting' as const,
  },
  {
    label: 'Step D',
    text: 'Add the tomatoes and simmer',
    status: 'awaiting' as const,
  },
  {
    label: 'Step E',
    text: 'Garnish and serve hot',
    status: 'awaiting' as const,
  },
];

export function ActivityFeed({ currentRound }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E4D4] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0E4D4] flex items-center justify-between">
        <h3 className="text-base font-bold text-[#3D2E1F] flex items-center gap-2">
          <span className="text-lg">📋</span>
          Recent Activity
        </h3>
        <span className="text-xs font-bold text-[#E8881E] bg-[#FFF3E0] px-2.5 py-1 rounded-full">
          Round {currentRound}
        </span>
      </div>

      {/* Round 1: Player activities */}
      {currentRound === 1 && (
        <div className="divide-y divide-[#F0E4D4]/60">
          {round1Activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5">
              <div className="pt-0.5">
                <PlayerAvatar
                  name={activity.name}
                  colorIndex={activity.colorIndex}
                  size="sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold text-[#3D2E1F]">{activity.name}</span>{' '}
                  {activity.status === 'submitting' && (
                    <span className="text-[#E8881E] inline-flex items-center gap-1">
                      submitting
                      <Loader2 size={12} className="animate-spin text-[#E8881E]" />
                    </span>
                  )}
                  {activity.status === 'done' && (
                    <span className="text-[#8B7355]">{activity.text}</span>
                  )}
                  {activity.status === 'missed' && (
                    <span className="text-[#E53935] font-medium">{activity.text}</span>
                  )}
                </p>
                {activity.time && (
                  <p className="text-xs text-[#8B7355] mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {activity.time}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Round 2: Steps progress */}
      {currentRound === 2 && (
        <div className="p-4 space-y-2.5">
          {round2Steps.map((step, i) => (
            <div
              key={i}
              className={`
                flex items-start gap-3 p-3 rounded-xl border transition-colors
                ${step.status === 'done' ? 'bg-[#F0FFF0] border-[#4CAF50]/20' : ''}
                ${step.status === 'submitting' ? 'bg-[#FFF3E0] border-[#E8881E]/30' : ''}
                ${step.status === 'awaiting' ? 'bg-[#FFFAF4] border-[#F0E4D4]' : ''}
              `}
            >
              {/* Status icon */}
              <div className="pt-0.5 shrink-0">
                {step.status === 'done' && (
                  <span className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </span>
                )}
                {step.status === 'submitting' && (
                  <span className="w-6 h-6 rounded-full bg-[#E8881E] flex items-center justify-center">
                    <Loader2 size={14} className="text-white animate-spin" />
                  </span>
                )}
                {step.status === 'awaiting' && (
                  <span className="w-6 h-6 rounded-full bg-[#F0E4D4] flex items-center justify-center">
                    <Clock size={14} className="text-[#8B7355]" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[#8B7355] uppercase">{step.label}</span>
                  {step.status === 'done' && (
                    <span className="text-[10px] font-bold text-[#4CAF50]">✓ Submitted</span>
                  )}
                  {step.status === 'submitting' && (
                    <span className="text-[10px] font-bold text-[#E8881E]">Currently Submitting...</span>
                  )}
                  {step.status === 'awaiting' && (
                    <span className="text-[10px] font-medium text-[#8B7355]">Awaiting turn</span>
                  )}
                </div>
                <p className="text-xs text-[#3D2E1F] leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
