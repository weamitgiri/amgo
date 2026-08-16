import { Check } from 'lucide-react';
import step2Img from '../../../assets/cookandcreate/game-flow-step-2.png';

export type CCReviewStep = {
  id: number;
  letter: string;
  text: string;
  status?: 'submitted' | 'kept' | 'removed';
  keep_votes: number;
  remove_votes: number;
};

interface CookingStepReviewModalProps {
  isOpen: boolean;
  steps: CCReviewStep[];
  /** The single step this player has picked to remove — null until they pick one. */
  removeStepId: number | null;
  onSelectRemove: (stepId: number) => void;
  onSubmit: () => void;
  /** True once this player's votes are recorded server-side (locks the table). */
  submitted: boolean;
  submitting: boolean;
  timerLabel: string;
  /**
   * Read-only outcome view: same design, but the checkboxes just reflect each
   * step's final kept/removed status (never clickable) and the button becomes a
   * plain "Continue" that calls `onContinue`. Shown after voting resolves and
   * before the dish-naming step.
   */
  resultMode?: boolean;
  onContinue?: () => void;
}

/**
 * Every step starts on "Keep" and exactly ONE must be voted out: Remove acts as
 * a single-choice radio across the whole table, so picking a new step to remove
 * automatically returns the previous one to Keep. Keep is therefore derived,
 * never directly clickable — that's what makes "at least one, at most one"
 * impossible to violate from the UI.
 */
export function CookingStepReviewModal({
  isOpen,
  steps,
  removeStepId,
  onSelectRemove,
  onSubmit,
  submitted,
  submitting,
  timerLabel,
  resultMode = false,
  onContinue,
}: CookingStepReviewModalProps) {
  if (!isOpen) return null;

  const locked = resultMode || submitted || submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — voting is mandatory, so this deliberately doesn't dismiss. */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[700px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FFF3E0] border border-[#F5E2C8] flex items-center justify-center">
            <img src={step2Img} alt="Cooking" className="w-6 h-6 object-contain" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#3D2E1F]">
            {resultMode ? 'Round 2: Review the Steps & Result' : 'Round 2: Review the Steps & Vote'}
          </h2>
        </div>

        {/* Description + Timer row */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {resultMode ? (
            <p className="text-sm font-semibold text-[#6E5A44] max-w-[420px] leading-relaxed">
              Voting is done. Here's what your team decided — the step marked{' '}
              <span className="font-black text-[#D32F2F]">Remove</span> was voted out, everything else stays.
            </p>
          ) : (
            <p className="text-sm font-semibold text-[#6E5A44] max-w-[340px] leading-relaxed">
              Review the steps your team submitted and pick the <span className="font-black text-[#D32F2F]">one</span>{' '}
              step to remove. Everything else stays.
            </p>
          )}
          {!resultMode && (
            <div className="flex items-center gap-3 bg-white/70 border border-[#F5E2C8] rounded-xl px-4 py-2">
              <span className="text-xs font-semibold text-[#8B7355]">
                Vote before the timer
                <br />
                runs out
              </span>
              <span className="text-2xl font-black text-[#3D2E1F] font-mono tracking-wider">{timerLabel}</span>
            </div>
          )}
        </div>

        {/* Steps voting table */}
        <div className="bg-[#FFEAD1]/50 rounded-2xl border border-[#F5CE9E]/60 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px] px-5 py-3 border-b border-[#F5CE9E]/60">
            <span className="text-sm font-extrabold text-[#E8881E]">Step</span>
            <span className="text-sm font-extrabold text-[#36B37E] text-center">Keep</span>
            <span className="text-sm font-extrabold text-[#D32F2F] text-center">Remove</span>
          </div>

          {/* Step rows */}
          {steps.map((step, i) => {
            // In result mode the checkboxes reflect the step's final status;
            // during voting they reflect this player's single Remove pick.
            const removed = resultMode ? step.status === 'removed' : removeStepId === step.id;
            return (
              <div
                key={step.id}
                className={`grid grid-cols-[1fr_80px_80px] px-5 py-3.5 items-center ${
                  i < steps.length - 1 ? 'border-b border-[#F5CE9E]/40' : ''
                }`}
              >
                {/* Step text */}
                <div className="flex items-start gap-3 pr-4">
                  <span className="text-base font-black text-[#E8881E] shrink-0 mt-0.5">{step.letter}</span>
                  <p className="text-sm text-[#3D2E1F] leading-relaxed font-medium">{step.text}</p>
                </div>

                {/* Keep — derived from the Remove choice, never directly clickable */}
                <div className="flex justify-center">
                  <div
                    aria-label={removed ? 'Not kept' : 'Kept'}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      removed ? 'border-[#D4C5B3] bg-white' : 'bg-[#36B37E] border-[#36B37E]'
                    }`}
                  >
                    {!removed && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>

                {/* Remove — single-choice across all steps (read-only in result mode) */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => onSelectRemove(step.id)}
                    aria-pressed={removed}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      locked ? 'cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      removed
                        ? 'bg-[#D32F2F] border-[#D32F2F]'
                        : `border-[#D4C5B3] bg-white ${locked ? '' : 'hover:border-[#D32F2F]'}`
                    }`}
                  >
                    {removed && <Check size={14} className="text-white" strokeWidth={3} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#6E5A44] font-medium mt-6 mb-4">
          Your votes are anonymous. Focus on logic, not assumptions.
        </p>

        <button
          onClick={resultMode ? onContinue : onSubmit}
          disabled={resultMode ? false : locked || removeStepId === null}
          className="w-full py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer"
        >
          {resultMode
            ? 'Continue'
            : submitted
              ? 'Waiting for your teammates to vote…'
              : submitting
                ? 'Submitting…'
                : removeStepId === null
                  ? 'Select 1 step to remove'
                  : 'Continue'}
        </button>
      </div>
    </div>
  );
}
