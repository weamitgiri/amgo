interface RoundProgressProps {
  currentRound: 1 | 2 | 3;
}

const STEPS = [
  { num: '01', emoji: '🧺', label: 'Ingredients' },
  { num: '02', emoji: '🍲', label: 'Steps' },
  { num: '03', emoji: '📋', label: 'Elimination' },
] as const;

export function RoundProgress({ currentRound }: RoundProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((step, i) => {
        const isActive = i + 1 === currentRound;
        const isPast = i + 1 < currentRound;
        const activeColor = isActive || isPast ? '#E8881E' : '#9E9E9E';
        const activeBg = isActive || isPast ? '#FFF3E0' : '#F5F5F5';

        return (
          <div key={step.num} className="flex items-center gap-2">
            {/* Step */}
            <div className="flex items-center gap-2">
              {/* Numbered circle */}
              <div
                className="flex items-center justify-center rounded-full text-xs font-bold"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: activeBg,
                  color: activeColor,
                  border: `2px solid ${activeColor}`,
                }}
              >
                {step.num}
              </div>
              {/* Emoji + Label */}
              <span className="text-lg">{step.emoji}</span>
              <span
                className="text-sm font-medium"
                style={{ color: activeColor }}
              >
                {step.label}
              </span>
            </div>

            {/* Arrow connector */}
            {i < STEPS.length - 1 && (
              <svg
                width="40"
                height="12"
                viewBox="0 0 40 12"
                className="mx-1"
              >
                <line
                  x1="0"
                  y1="6"
                  x2="32"
                  y2="6"
                  stroke={i + 1 < currentRound ? '#E8881E' : '#D0D0D0'}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <polygon
                  points="32,2 40,6 32,10"
                  fill={i + 1 < currentRound ? '#E8881E' : '#D0D0D0'}
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
