import { Zap, AlertTriangle } from 'lucide-react';

interface DoubleDownModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  submitting: boolean;
}

/**
 * Private Round 3 offer — only the one participant the server secretly picked
 * ever sees this (gated by `gameState.my_double_down` in game.tsx, which the
 * server only populates for that participant). Styled to match the existing
 * role-reveal treatment (warm card, orange accents, pill buttons).
 */
export function DoubleDownModal({ isOpen, onAccept, onDecline, submitting }: DoubleDownModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      <div className="relative z-10 w-full max-w-[480px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#E8881E] flex items-center justify-center shadow-md mb-4">
          <Zap size={30} className="text-white" strokeWidth={2.5} />
        </div>

        <span className="text-sm font-bold text-[#E8881E] tracking-wide">Secret Power</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#3D2E1F] tracking-tight mt-1">Double Down Moment</h2>
        <p className="text-sm text-[#6E5A44] leading-relaxed mt-3">
          You've been secretly chosen to <span className="font-bold text-[#3D2E1F]">double your vote's weight</span>{' '}
          in this round's impostor vote. Use it if you're confident — but if your vote turns out to be wrong,
          you'll lose points.
        </p>

        <div className="mt-4 bg-[#FDECEC] border border-[#F5C6C6] rounded-xl px-4 py-3 flex items-center gap-2.5 text-left">
          <AlertTriangle size={18} className="text-[#C0392B] shrink-0" />
          <span className="text-xs font-bold text-[#8C2F26]">Wrong guess costs you 50 points.</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDecline}
            disabled={submitting}
            className="flex-1 py-3 rounded-full bg-white border border-[#F5DCBD] hover:bg-[#FFF3E0] text-[#3D2E1F] font-extrabold text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={submitting}
            className="flex-1 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Use Double Down
          </button>
        </div>
      </div>
    </div>
  );
}
