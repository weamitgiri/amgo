import { Check } from 'lucide-react';
import step1Img from '../../../assets/cookandcreate/game-flow-step-1.png';
import step2Img from '../../../assets/cookandcreate/game-flow-step-2.png';
import step4Img from '../../../assets/cookandcreate/game-flow-step-4.png';

interface RoundProgressProps {
  currentRound: 1 | 2 | 3;
}

const STEPS = [
  { num: '01', img: step1Img, label: 'Ingredients' },
  { num: '02', img: step2Img, label: 'Steps' },
  { num: '03', img: step4Img, label: 'Elimination' },
] as const;

export function RoundProgress({ currentRound }: RoundProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const isActive = i + 1 === currentRound;
        const isPast = i + 1 < currentRound;
        const activeColor = isActive || isPast ? '#E8881E' : '#A08C78';

        return (
          <div key={step.num} className="flex items-center gap-2">
            {/* Step container */}
            <div className="flex items-center gap-1.5">
              {/* Completed checkmark or number badge */}
              {isPast ? (
                <div className="w-5 h-5 rounded-full bg-[#36B37E] text-white flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              ) : (
                <div
                  className="w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: activeColor }}
                >
                  {step.num}
                </div>
              )}

              {/* Step Image */}
              <img src={step.img} alt={step.label} className="w-7 h-7 object-contain" />

              {/* Label */}
              <span
                className="text-xs font-bold"
                style={{ color: activeColor }}
              >
                {step.label}
              </span>
            </div>

            {/* Arrow connector */}
            {i < STEPS.length - 1 && (
              <span className="text-[#D4A44C] opacity-60 text-xs px-0.5">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
