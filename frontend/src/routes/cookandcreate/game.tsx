import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Utensils, Lightbulb } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { CountdownTimer } from './-components/CountdownTimer';
import { RoundProgress } from './-components/RoundProgress';
import { PlayersSidebar } from './-components/PlayersSidebar';
import { ActivityFeed } from './-components/ActivityFeed';
import { IngredientCard } from './-components/IngredientCard';
import { RoundResultsModal } from './-components/RoundResultsModal';

export const Route = createFileRoute('/cookandcreate/game')({
  component: GamePage,
});

const ingredients = [
  { emoji: '🍗', name: 'Chicken' },
  { emoji: '🧀', name: 'Paneer' },
  { emoji: '🍅', name: 'Tomatoes' },
  { emoji: '🧊', name: 'Ice Cubes' },
  { emoji: '🧄', name: 'Garlic' },
  { emoji: '🥛', name: 'Cream' },
  { emoji: '🫗', name: 'Soy Sauce' },
  { emoji: '🏖️', name: 'Sand' },
  { emoji: '🧅', name: 'Onions' },
  { emoji: '🧈', name: 'Butter' },
];

const selectedFromRound1 = [
  { emoji: '🍗', name: 'Chicken' },
  { emoji: '🍅', name: 'Tomatoes' },
  { emoji: '🧅', name: 'Onions' },
  { emoji: '🧄', name: 'Garlic' },
];

function GamePage() {
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [showResults, setShowResults] = useState(false);
  const [cookingStep, setCookingStep] = useState('');
  const [stepSubmitted, setStepSubmitted] = useState(false);

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < 2) {
        next.add(name);
      }
      return next;
    });
  };

  const handleConfirmVote = () => {
    setShowResults(true);
  };

  const handleResultsClose = () => {
    setShowResults(false);
    setCurrentRound(2);
  };

  const handleSubmitStep = () => {
    if (cookingStep.trim()) {
      setStepSubmitted(true);
    }
  };

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Game">
      <CookCreateHeader showGameTimer timerMinutes={24} timerSeconds={58} />

      {/* Sub-header bar */}
      <div className="bg-[#FFF3E0] border-b border-[#E8881E]/10 px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left */}
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#E8881E] flex items-center justify-center shadow-sm">
              <Utensils size={18} className="text-white" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#3D2E1F] leading-tight">
                Cook & Create
              </h2>
              <p className="text-xs text-[#8B7355]">
                Round {currentRound}:{' '}
                {currentRound === 1 ? 'Ingredient Selection' : 'Cooking Steps'}
              </p>
            </div>
          </div>

          {/* Center */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#8B7355] hidden sm:inline">
              Confirm the Vote before times Runs Out
            </span>
            <CountdownTimer
              initialMinutes={1}
              initialSeconds={54}
              variant="badge"
              running
            />
          </div>

          {/* Right */}
          <RoundProgress currentRound={currentRound} />
        </div>
      </div>

      {/* Three column layout */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-5">
        {/* ===== LEFT SIDEBAR ===== */}
        <div className="order-2 lg:order-1">
          <PlayersSidebar currentRound={currentRound} />
        </div>

        {/* ===== CENTER COLUMN ===== */}
        <div className="order-1 lg:order-2">
          {currentRound === 1 ? (
            <Round1Content
              ingredients={ingredients}
              selectedIngredients={selectedIngredients}
              toggleIngredient={toggleIngredient}
              onConfirmVote={handleConfirmVote}
            />
          ) : (
            <Round2Content
              cookingStep={cookingStep}
              setCookingStep={setCookingStep}
              stepSubmitted={stepSubmitted}
              onSubmitStep={handleSubmitStep}
            />
          )}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="order-3">
          <ActivityFeed currentRound={currentRound} />
        </div>
      </div>

      {/* Results Modal */}
      <RoundResultsModal isOpen={showResults} onClose={handleResultsClose} />
    </CookCreateLayout>
  );
}

/* ---------- Round 1 Content ---------- */
function Round1Content({
  ingredients,
  selectedIngredients,
  toggleIngredient,
  onConfirmVote,
}: {
  ingredients: { emoji: string; name: string }[];
  selectedIngredients: Set<string>;
  toggleIngredient: (name: string) => void;
  onConfirmVote: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6">
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-[#3D2E1F]">
          Round 1 of 3 — Ingredients Market
        </h2>
        <h3 className="text-base font-bold text-[#C5630F] mt-1">
          Vote for Ingredients
        </h3>
        <p className="text-sm text-[#8B7355] mt-1">
          Select 2 ingredients you think should go into our recipe.
        </p>
      </div>

      {/* Ingredient grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
        {ingredients.map((item) => (
          <IngredientCard
            key={item.name}
            name={item.name}
            emoji={item.emoji}
            isSelected={selectedIngredients.has(item.name)}
            onToggle={() => toggleIngredient(item.name)}
            disabled={
              selectedIngredients.size >= 2 &&
              !selectedIngredients.has(item.name)
            }
          />
        ))}
      </div>

      {/* Selection counter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#3D2E1F]">
          Selected{' '}
          <span className="text-[#E8881E]">{selectedIngredients.size}/2</span>{' '}
          ingredients
        </p>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirmVote}
        disabled={selectedIngredients.size === 0}
        className="w-full py-3.5 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-colors shadow-md shadow-[#E8881E]/25 cursor-pointer active:scale-[0.98]"
      >
        Confirm Vote
      </button>

      {/* Hint text */}
      <p className="text-xs text-[#8B7355] text-center mt-3 flex items-center justify-center gap-1.5">
        <Lightbulb size={12} className="text-[#E8881E]" />
        Your actions are anonymous, observe patterns carefully.
      </p>
    </div>
  );
}

/* ---------- Round 2 Content ---------- */
function Round2Content({
  cookingStep,
  setCookingStep,
  stepSubmitted,
  onSubmitStep,
}: {
  cookingStep: string;
  setCookingStep: (v: string) => void;
  stepSubmitted: boolean;
  onSubmitStep: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E4D4] shadow-sm p-6">
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-[#3D2E1F]">
          Round 2 of 3 — Cooking Step Submission
        </h2>
      </div>

      {/* Top ingredients from Round 1 */}
      <div className="mb-5">
        <p className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-3">
          Your top 4 Final Ingredients
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedFromRound1.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 bg-[#FFF3E0] rounded-xl px-4 py-2.5 border border-[#E8881E]/15"
            >
              <span className="text-xl select-none">{item.emoji}</span>
              <span className="text-sm font-semibold text-[#3D2E1F]">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* It's your turn badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFF3E0] to-[#FFECCC] border border-[#E8881E]/20 text-sm font-bold text-[#E8881E] shadow-sm">
          ✋ It's your Turn
        </span>
      </div>

      {/* Instruction */}
      <p className="text-sm text-[#3D2E1F] mb-4">
        Submit one cooking step using the selected ingredients.
      </p>

      {/* Textarea */}
      {!stepSubmitted ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#3D2E1F] mb-2">
              Enter your step (max 120 characters)
            </label>
            <textarea
              value={cookingStep}
              onChange={(e) =>
                setCookingStep(e.target.value.slice(0, 120))
              }
              placeholder="Write your step here... Example: Chop the vegetables into small pieces."
              rows={4}
              className="w-full rounded-xl border-2 border-[#F0E4D4] focus:border-[#E8881E] focus:ring-2 focus:ring-[#E8881E]/20 outline-none p-4 text-sm text-[#3D2E1F] placeholder:text-[#8B7355]/50 bg-[#FFFAF4] resize-none transition-colors"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-[#8B7355] flex items-center gap-1">
                <Lightbulb size={12} className="text-[#E8881E]" />
                Tip: A good step is clear, simple and moves the recipe forward.
              </p>
              <span
                className={`text-xs font-mono font-semibold ${
                  cookingStep.length >= 110
                    ? 'text-[#E53935]'
                    : 'text-[#8B7355]'
                }`}
              >
                {cookingStep.length}/120
              </span>
            </div>
          </div>

          <button
            onClick={onSubmitStep}
            disabled={!cookingStep.trim()}
            className="w-full py-3.5 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-colors shadow-md shadow-[#E8881E]/25 cursor-pointer active:scale-[0.98]"
          >
            Submit Step
          </button>
        </>
      ) : (
        <div className="bg-[#F0FFF0] border border-[#4CAF50]/20 rounded-xl p-5 text-center">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-sm font-bold text-[#4CAF50]">
            Your step has been submitted!
          </p>
          <p className="text-xs text-[#8B7355] mt-1">
            Waiting for other players to complete their steps...
          </p>
        </div>
      )}
    </div>
  );
}
