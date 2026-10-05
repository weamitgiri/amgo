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
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      {STEPS.map((step, i) => {
        const isActive = i + 1 === currentRound;
        const isPast = i + 1 < currentRound;
        const active = isActive || isPast;

        return (
          <div key={step.num} className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Step: circular icon with number badge + label below */}
            <div className="flex flex-col items-center gap-1 w-[64px]">
              <div
                className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-inner"
                style={{
                  backgroundColor: active ? '#FDEBD2' : '#F0ECE3',
                  border: `1px solid ${active ? '#F5D3A0' : '#E7DFD2'}`,
                }}
              >
                <span
                  className="absolute -top-1.5 -left-1.5 w-[18px] h-[18px] rounded-full text-white font-bold text-[9px] flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: active ? '#E8881E' : '#B6A68F' }}
                >
                  {isPast ? <Check size={11} strokeWidth={3} /> : step.num}
                </span>
                <img
                  src={step.img}
                  alt={step.label}
                  className={`w-7 h-7 sm:w-8 sm:h-8 object-contain ${active ? '' : 'opacity-60'}`}
                />
              </div>
              <span
                className="text-[11px] font-bold leading-none"
                style={{ color: active ? '#E8881E' : '#A08C78' }}
              >
                {step.label}
              </span>
            </div>

            {/* Arrow connector */}
            {i < STEPS.length - 1 && (
              <span className="text-[#E8881E]/50 text-sm font-bold -mt-4">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
