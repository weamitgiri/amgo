import { X } from 'lucide-react';
import { resolveMediaUrl } from '@/utils/media';
import basketImg from '../../../assets/cookandcreate/game-flow-step-1.png';

export type CCTopIngredient = {
  id: number;
  name: string;
  image_url: string | null;
  is_absurd: boolean;
};

interface RoundResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topIngredients: CCTopIngredient[];
  /**
   * Every absurd ingredient that drew at least one vote — including ones that
   * did NOT make the top 4. That's the whole point of the callout: it hints
   * that someone in the group is steering the dish somewhere strange, which
   * the top-4 list alone would hide.
   */
  absurdVoted: CCTopIngredient[];
}

const HEADING = '#3D2E1F';
const DESC = '#53301B';

export function RoundResultsModal({ isOpen, onClose, topIngredients, absurdVoted }: RoundResultsModalProps) {
  if (!isOpen) return null;

  const absurdNames = absurdVoted.map((a) => a.name);
  const absurdLabel =
    absurdNames.length > 1
      ? `${absurdNames.slice(0, -1).join(', ')} and ${absurdNames[absurdNames.length - 1]}`
      : absurdNames[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — dark translucent overlay */}
      <div className="absolute inset-0 bg-[#2E2A26]/45 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-[660px] max-h-[92vh] overflow-y-auto rounded-[28px] border border-[#F2C892] shadow-[0_24px_60px_rgba(89,46,22,0.25)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300"
        style={{ background: 'linear-gradient(180deg, #FCE9CC 0%, #F6DBB4 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="w-14 h-14 rounded-full bg-[#FBEED5] border border-[#F6E0C0] flex items-center justify-center shrink-0">
            <img src={basketImg} alt="" className="w-9 h-9 object-contain" />
          </span>
          <h2 className="text-[22px] sm:text-2xl font-bold" style={{ color: HEADING }}>
            Round 1: Results
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto w-11 h-11 rounded-[14px] bg-[#BE6534] hover:bg-[#A8552A] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            <X size={22} className="text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Description */}
        <p className="text-center text-[17px] font-semibold leading-snug mt-6 max-w-[420px] mx-auto" style={{ color: DESC }}>
          Here are the top {topIngredients.length || 4} ingredients selected by the group:
        </p>

        {/* Ingredients row — 4 across on desktop, 2×2 on small screens */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {topIngredients.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center justify-between rounded-2xl bg-white border border-[#EDE3D6] shadow-[0_2px_8px_rgba(80,50,20,0.06)] px-2 pt-4 pb-3 h-[150px]"
            >
              <div className="flex-1 flex items-center justify-center w-full">
                {item.image_url ? (
                  <img
                    src={resolveMediaUrl(item.image_url) ?? item.image_url}
                    alt={item.name}
                    className="max-w-[84px] max-h-[82px] object-contain"
                  />
                ) : (
                  <span className="text-4xl select-none">🥘</span>
                )}
              </div>
              <span className="text-sm font-medium text-center mt-2" style={{ color: HEADING }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Warning — the absurd votes callout */}
        {absurdVoted.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#F2D3A3] bg-[#F9E3C4] px-4 py-3.5">
            <span className="text-2xl leading-none shrink-0" aria-hidden>
              😈
            </span>
            <p className="text-sm text-[#2E2E2E] leading-relaxed">
              <span className="font-semibold">{absurdLabel}</span> also received votes.
              <br />
              Interesting choices from someone in your group.
            </p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={onClose}
          className="mt-7 w-full h-[52px] rounded-full text-white text-[17px] font-semibold transition-transform hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] shadow-[0_6px_16px_rgba(239,133,23,0.35)] cursor-pointer"
          style={{ background: 'linear-gradient(180deg, #F2A24A 0%, #E88A1E 100%)' }}
        >
          Okay Continue
        </button>
      </div>
    </div>
  );
}
