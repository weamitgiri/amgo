import { useState } from 'react';
import { X, Check } from 'lucide-react';
import step2Img from '../../../assets/cookandcreate/game-flow-step-2.png';

interface CookingStepReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cookingSteps = [
  {
    label: 'A',
    text: 'Sauté the onions and garlic in butter until soft and aromatic.',
  },
  {
    label: 'B',
    text: 'Marinate the chicken with garlic paste, salt, and spices, then let it rest for 15 minutes before cooking.',
  },
  {
    label: 'C',
    text: 'Add chopped tomatoes and cook until the mixture thickens.',
  },
  {
    label: 'D',
    text: 'Slowly add cream while stirring continuously to maintain a smooth texture and prevent the sauce from curdling.',
  },
  {
    label: 'E',
    text: 'Season with salt and pepper, then garnish and serve hot.',
  },
];

export function CookingStepReviewModal({
  isOpen,
  onClose,
}: CookingStepReviewModalProps) {
  const [votes, setVotes] = useState<Record<string, 'keep' | 'remove'>>({
    A: 'keep',
    B: 'remove',
    C: 'keep',
    D: 'keep',
    E: 'keep',
  });

  if (!isOpen) return null;

  const handleVote = (label: string, vote: 'keep' | 'remove') => {
    setVotes((prev) => ({ ...prev, [label]: vote }));
  };

  const allVoted = Object.keys(votes).length === cookingSteps.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[700px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FFF3E0] border border-[#F5E2C8] flex items-center justify-center">
            <img
              src={step2Img}
              alt="Cooking"
              className="w-6 h-6 object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#3D2E1F]">
            Round 2: Review the Steps & Vote
          </h2>
        </div>

        {/* Description + Timer row */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <p className="text-sm font-semibold text-[#6E5A44] max-w-[340px] leading-relaxed">
            Review all the steps submitted by your team and Vote to keep or
            remove each step.
          </p>
          <div className="flex items-center gap-3 bg-white/70 border border-[#F5E2C8] rounded-xl px-4 py-2">
            <span className="text-xs font-semibold text-[#8B7355]">
              Vote before the times
              <br />
              runs out
            </span>
            <span className="text-2xl font-black text-[#3D2E1F] font-mono tracking-wider">
              01:54
            </span>
          </div>
        </div>

        {/* Steps voting table */}
        <div className="bg-[#FFEAD1]/50 rounded-2xl border border-[#F5CE9E]/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px] px-5 py-3 border-b border-[#F5CE9E]/60">
            <span className="text-sm font-extrabold text-[#E8881E]">Step</span>
            <span className="text-sm font-extrabold text-[#36B37E] text-center">
              Keep
            </span>
            <span className="text-sm font-extrabold text-[#D32F2F] text-center">
              Remove
            </span>
          </div>

          {/* Step rows */}
          {cookingSteps.map((step, i) => (
            <div
              key={step.label}
              className={`grid grid-cols-[1fr_80px_80px] px-5 py-3.5 items-center ${
                i < cookingSteps.length - 1
                  ? 'border-b border-[#F5CE9E]/40'
                  : ''
              }`}
            >
              {/* Step text */}
              <div className="flex items-start gap-3 pr-4">
                <span className="text-base font-black text-[#E8881E] shrink-0 mt-0.5">
                  {step.label}
                </span>
                <p className="text-sm text-[#3D2E1F] leading-relaxed font-medium">
                  {step.text}
                </p>
              </div>

              {/* Keep radio */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleVote(step.label, 'keep')}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                    votes[step.label] === 'keep'
                      ? 'bg-[#36B37E] border-[#36B37E]'
                      : 'border-[#D4C5B3] bg-white hover:border-[#36B37E]'
                  }`}
                >
                  {votes[step.label] === 'keep' && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                </button>
              </div>

              {/* Remove radio */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleVote(step.label, 'remove')}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                    votes[step.label] === 'remove'
                      ? 'bg-[#D32F2F] border-[#D32F2F]'
                      : 'border-[#D4C5B3] bg-white hover:border-[#D32F2F]'
                  }`}
                >
                  {votes[step.label] === 'remove' && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#6E5A44] font-medium mt-6 mb-4">
          Your votes are anonymous. Focus on logic, not assumptions.
        </p>

        <button
          onClick={onClose}
          disabled={!allVoted}
          className="w-full py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer"
        >
          Submit Votes
        </button>
      </div>
    </div>
  );
}
