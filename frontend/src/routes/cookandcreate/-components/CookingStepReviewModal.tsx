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
   * Read-only outcome view shown after voting resolves and before the
   * dish-naming step: instead of the Keep/Remove table it simply lists the
   * steps that survived the vote (re-lettered A, B, C…). The button becomes a
   * plain "Continue" that calls `onContinue`.
   */
  resultMode?: boolean;
  onContinue?: () => void;
}

/* Design colours for this modal. */
const BROWN = '#592e16';
const KEEP = '#29c48e';
const REMOVE = '#940000';
const SUBMIT = '#f39e3a';

/** Round Keep/Remove mark: filled with a white check when on, white with a thin border when off. */
function VoteMark({ on, color }: { on: boolean; color: string }) {
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
      style={on ? { background: color, border: `1.5px solid ${color}` } : { background: '#FFFFFF', border: '1.5px solid #D9C7B2' }}
    >
      {on && <Check size={15} className="text-white" strokeWidth={3} />}
    </span>
  );
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
  // In result mode we only list the steps that survived the vote.
  const keptSteps = steps.filter((s) => s.status !== 'removed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — voting is mandatory, so this deliberately doesn't dismiss. */}
      <div className="absolute inset-0 bg-[#2E2A26]/45 backdrop-blur-[2px]" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-[760px] max-h-[92vh] overflow-y-auto rounded-[28px] border border-[#F2C38A] shadow-[0_24px_60px_rgba(89,46,22,0.25)] p-5 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'linear-gradient(180deg, #FDE8CB 0%, #FCE0B6 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-[#FFF4E4] border border-[#F3D3A8] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(120,70,20,0.12)]">
            <img src={step2Img} alt="Cooking" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-[22px] sm:text-[28px] font-bold leading-tight" style={{ color: BROWN }}>
            {resultMode ? 'Round 2: Review the Steps & Result' : 'Round 2: Review the Steps & Vote'}
          </h2>
        </div>

        {resultMode ? (
          /* ===== Result view — final recipe, no checkboxes ===== */
          <>
            <p className="text-[15px] text-[#5A4A3A] mb-5 leading-relaxed">
              Following steps were selected based on the team's votes:
            </p>

            <div className="rounded-2xl border border-[#F1D9B8] bg-[#FFFAF3]/85 overflow-hidden">
              {keptSteps.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-[#8C847B]">No steps remained after the vote.</p>
              ) : (
                keptSteps.map((step, i) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 px-5 py-4 ${i < keptSteps.length - 1 ? 'border-b border-[#F1D9B8]' : ''}`}
                  >
                    <span className="text-base font-bold shrink-0" style={{ color: BROWN }}>
                      Step {String.fromCharCode(65 + i)}:
                    </span>
                    <p className="text-[15px] text-[#3F3A35] leading-relaxed">{step.text}</p>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* ===== Voting view ===== */
          <>
            {/* Description + Timer row */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <p className="text-[15px] text-[#5A4A3A] max-w-[380px] leading-relaxed">
                Review all the steps submitted by your team and Vote to keep or remove each step.
              </p>
              <div className="flex items-center gap-5 rounded-lg border border-[#F2CD9C] bg-[#FDD9A9] px-4 py-2">
                <span className="text-sm leading-snug text-[#5A4A3A] text-center">
                  Vote before the times
                  <br />
                  runs out
                </span>
                <span className="text-[34px] font-bold tabular-nums leading-none" style={{ color: BROWN }}>
                  {timerLabel}
                </span>
              </div>
            </div>

            {/* Steps voting table */}
            <div className="rounded-2xl border border-[#F1D9B8] bg-[#FFFAF3]/85 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_56px_64px] sm:grid-cols-[1fr_88px_88px] px-4 sm:px-5 py-3 border-b border-[#F1D9B8]">
                <span className="text-[15px] font-semibold" style={{ color: BROWN }}>Step</span>
                <span className="text-[15px] font-semibold text-center" style={{ color: KEEP }}>Keep</span>
                <span className="text-[15px] font-semibold text-center" style={{ color: REMOVE }}>Remove</span>
              </div>

              {/* Step rows */}
              {steps.map((step, i) => {
                const removed = removeStepId === step.id;
                return (
                  <div
                    key={step.id}
                    className={`grid grid-cols-[1fr_56px_64px] sm:grid-cols-[1fr_88px_88px] px-4 sm:px-5 py-4 items-center ${
                      i < steps.length - 1 ? 'border-b border-[#F1D9B8]' : ''
                    }`}
                  >
                    {/* Step text */}
                    <div className="flex items-start gap-3 pr-3 min-w-0">
                      <span className="text-base font-bold shrink-0 w-4" style={{ color: BROWN }}>
                        {step.letter}
                      </span>
                      <p className="text-[15px] text-[#3F3A35] leading-relaxed break-words">{step.text}</p>
                    </div>

                    {/* Keep — derived from the Remove choice, never directly clickable */}
                    <div className="flex justify-center" aria-label={removed ? 'Not kept' : 'Kept'}>
                      <VoteMark on={!removed} color={KEEP} />
                    </div>

                    {/* Remove — single-choice across all steps */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => onSelectRemove(step.id)}
                        aria-pressed={removed}
                        className={`rounded-full transition-transform ${
                          locked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        }`}
                      >
                        <VoteMark on={removed} color={REMOVE} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-[#5A4A3A] mt-6 mb-4">
              Your votes are anonymous. Focus on logic, not assumptions.
            </p>
          </>
        )}

        <button
          onClick={resultMode ? onContinue : onSubmit}
          disabled={resultMode ? false : locked || removeStepId === null}
          className={`w-full h-[52px] rounded-full text-white text-[17px] font-semibold transition-all hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100 shadow-[0_6px_16px_rgba(243,158,58,0.35)] cursor-pointer ${
            resultMode ? 'mt-6' : ''
          }`}
          style={{ background: SUBMIT }}
        >
          {resultMode
            ? 'Continue'
            : submitted
              ? 'Waiting for your teammates to vote…'
              : submitting
                ? 'Submitting…'
                : removeStepId === null
                  ? 'Select 1 step to remove'
                  : 'Submit Votes'}
        </button>
      </div>
    </div>
  );
}
