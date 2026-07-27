import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Utensils, Check } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { RoundProgress } from './-components/RoundProgress';
import { PlayersSidebar } from './-components/PlayersSidebar';
import { ActivityFeed } from './-components/ActivityFeed';
import { RoundResultsModal } from './-components/RoundResultsModal';
import { CookingStepReviewModal } from './-components/CookingStepReviewModal';
import { NameDishModal } from './-components/NameDishModal';
import { ReviewRatingPage } from './-components/ReviewRatingPage';
import chickenImg from '../../assets/cookandcreate/chicken.jpg';
import paneerImg from '../../assets/cookandcreate/paneer.jpg';
import tomatoesImg from '../../assets/cookandcreate/tomatoes.jpg';
import iceCubesImg from '../../assets/cookandcreate/ice-cubes.jpg';
import garlicImg from '../../assets/cookandcreate/garlic.jpg';
import creamImg from '../../assets/cookandcreate/cream.jpg';
import soySauceImg from '../../assets/cookandcreate/soy-sauce.jpg';
import sandImg from '../../assets/cookandcreate/sand.jpg';
import onionsImg from '../../assets/cookandcreate/onions.jpg';
import butterImg from '../../assets/cookandcreate/butter.jpg';
import step2Img from '../../assets/cookandcreate/game-flow-step-2.png';
import chef1 from '../../assets/cookandcreate/chef-1 1.png';
import chef2 from '../../assets/cookandcreate/chef-2 1.png';
import chef3 from '../../assets/cookandcreate/chef-3 1.png';
import showHost from '../../assets/cookandcreate/show-hos 1.png';
import chef4 from '../../assets/cookandcreate/chef-4 1.png';
import imposterImg from '../../assets/cookandcreate/imposter 1.png';

export const Route = createFileRoute('/cookandcreate/game')({
  component: GamePage,
});

const ingredients = [
  { img: chickenImg, name: 'Chicken' },
  { img: paneerImg, name: 'Paneer' },
  { img: tomatoesImg, name: 'Tomatoes' },
  { img: iceCubesImg, name: 'Ice Cubes' },
  { img: garlicImg, name: 'Garlic' },
  { img: creamImg, name: 'Cream' },
  { img: soySauceImg, name: 'Soy Sauce' },
  { img: sandImg, name: 'Sand' },
  { img: onionsImg, name: 'Onions' },
  { img: butterImg, name: 'Butter' },
];

const selectedFromRound1 = [
  { img: chickenImg, name: 'Chicken' },
  { img: tomatoesImg, name: 'Tomatoes' },
  { img: onionsImg, name: 'Onions' },
  { img: garlicImg, name: 'Garlic' },
];

const votingPlayers = [
  { name: 'Ptoto79', role: 'Chef 1', img: chef1 },
  { name: 'John32', role: 'Chef 2', img: chef2 },
  { name: 'James45', role: 'Chef 3', img: chef3 },
  { name: 'Fred36', role: 'Show Host', img: showHost },
  { name: 'Mark32', role: 'Chef 4', img: chef4 },
];

function GamePage() {
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set(['Tomatoes', 'Onions'])
  );
  const [showResults, setShowResults] = useState(false);
  const [cookingStep, setCookingStep] = useState('');
  const [stepSubmitted, setStepSubmitted] = useState(false);
  const [allStepsSubmitted, setAllStepsSubmitted] = useState(false);
  const [showStepReview, setShowStepReview] = useState(false);
  const [selectedVotePlayer, setSelectedVotePlayer] = useState<string | null>(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [showNameDish, setShowNameDish] = useState(false);
  const [dishName, setDishName] = useState('');
  const [showReview, setShowReview] = useState(false);

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
      // Simulate all steps being submitted after a delay
      setTimeout(() => {
        setAllStepsSubmitted(true);
      }, 2000);
    }
  };

  const handleProceedToReview = () => {
    setShowStepReview(true);
  };

  const handleStepReviewClose = () => {
    setShowStepReview(false);
    setCurrentRound(3);
  };

  const handleSubmitVote = () => {
    if (selectedVotePlayer) {
      setVoteSubmitted(true);
      // After vote submitted, show name dish modal
      setTimeout(() => {
        setShowNameDish(true);
      }, 2000);
    }
  };

  const handleDishNameSubmit = (name: string) => {
    setDishName(name);
    setShowNameDish(false);
    setShowReview(true);
  };

  // Determine sub-header text based on round
  const getRoundLabel = () => {
    switch (currentRound) {
      case 1:
        return 'Ingredient Market';
      case 2:
        return 'Cooking Steps';
      case 3:
        return 'Elimination Vote';
    }
  };

  const getTimerLabel = () => {
    switch (currentRound) {
      case 1:
        return 'Confirm the Vote before times Runs Out';
      case 2:
        return 'Submit your step before time runs out';
      case 3:
        return 'Voting Ends in';
    }
  };

  // Show Review & Rating page after game completes
  if (showReview) {
    return <ReviewRatingPage dishName={dishName} />;
  }

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Game">
      <div className="relative z-10 space-y-4">
        {/* Main Header */}
        <CookCreateHeader showGameTimer timerMinutes={24} timerSeconds={58} />

        {/* Sub-header status bar */}
        <div className="bg-[#FFF3E0] border border-[#F5DCBD] rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8881E] flex items-center justify-center shadow-xs">
                <Utensils size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#3D2E1F] leading-tight">
                  Cook &amp; Create
                </h2>
                <p className="text-[11px] font-bold text-[#E8881E]">
                  Round {currentRound}: {getRoundLabel()}
                </p>
              </div>
            </div>

            {/* Center */}
            <div className="flex items-center gap-3 bg-white/70 border border-[#F5E2C8] rounded-xl px-4 py-1.5">
              <span className="text-xs font-semibold text-[#8B7355] hidden sm:inline">
                {getTimerLabel()}
              </span>
              <span className="text-base font-black text-[#3D2E1F] font-mono">
                01:54
              </span>
            </div>

            {/* Right */}
            <RoundProgress currentRound={currentRound} />
          </div>
        </div>

        {/* Three column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-4 items-start">
          {/* ===== LEFT SIDEBAR ===== */}
          <div>
            <PlayersSidebar currentRound={currentRound} />
          </div>

          {/* ===== CENTER COLUMN ===== */}
          <div>
            {currentRound === 1 ? (
              <Round1Content
                ingredients={ingredients}
                selectedIngredients={selectedIngredients}
                toggleIngredient={toggleIngredient}
                onConfirmVote={handleConfirmVote}
              />
            ) : currentRound === 2 ? (
              <Round2Content
                cookingStep={cookingStep}
                setCookingStep={setCookingStep}
                stepSubmitted={stepSubmitted}
                allStepsSubmitted={allStepsSubmitted}
                onSubmitStep={handleSubmitStep}
                onProceedToReview={handleProceedToReview}
              />
            ) : (
              <Round3Content
                players={votingPlayers}
                selectedPlayer={selectedVotePlayer}
                onSelectPlayer={setSelectedVotePlayer}
                voteSubmitted={voteSubmitted}
                onSubmitVote={handleSubmitVote}
              />
            )}
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div>
            <ActivityFeed currentRound={currentRound} />
          </div>
        </div>

        {/* Results Modal */}
        <RoundResultsModal isOpen={showResults} onClose={handleResultsClose} />

        {/* Cooking Step Review Modal */}
        <CookingStepReviewModal
          isOpen={showStepReview}
          onClose={handleStepReviewClose}
        />

        {/* Name Dish Modal */}
        <NameDishModal
          isOpen={showNameDish}
          onSubmit={handleDishNameSubmit}
        />
      </div>
    </CookCreateLayout>
  );
}

function ImageIngredientCard({
  name,
  imgSrc,
  isSelected,
  onToggle,
  disabled = false,
}: {
  name: string;
  imgSrc: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-between p-3 rounded-2xl
        bg-white border-2 transition-all duration-150 ease-out cursor-pointer
        min-h-[125px] w-full shadow-xs
        ${
          isSelected
            ? 'border-[#E8881E] ring-2 ring-[#E8881E]/20 bg-[#FFFDF9]'
            : 'border-[#F5E6D3] hover:border-[#E8881E]/50'
        }
        ${!disabled ? 'hover:scale-[1.03]' : ''}
        ${disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {isSelected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E8881E] flex items-center justify-center shadow-xs z-10">
          <Check size={12} className="text-white" strokeWidth={3} />
        </span>
      )}
      <div className="flex-1 flex items-center justify-center w-full my-1">
        <img
          src={imgSrc}
          alt={name}
          className="max-w-[65px] max-h-[65px] object-contain drop-shadow-sm"
        />
      </div>
      <span className="text-xs font-bold text-[#3D2E1F] text-center leading-tight">
        {name}
      </span>
    </button>
  );
}

/* ---------- Round 1 Content ---------- */
function Round1Content({
  ingredients,
  selectedIngredients,
  toggleIngredient,
  onConfirmVote,
}: {
  ingredients: { img: string; name: string }[];
  selectedIngredients: Set<string>;
  toggleIngredient: (name: string) => void;
  onConfirmVote: () => void;
}) {
  return (
    <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 text-center space-y-5">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-black text-[#3D2E1F]">
          Round 1 of 3 – Ingredients Market
        </h2>
        <h3 className="text-sm font-extrabold text-[#3D2E1F] mt-0.5">
          Vote for Ingredients
        </h3>
        <p className="text-xs text-[#8B7355] mt-1 font-medium">
          Select 2 ingredients you think should go into our recipe.
        </p>
      </div>

      {/* Ingredient grid 2x5 */}
      <div className="grid grid-cols-5 gap-3">
        {ingredients.map((item) => (
          <ImageIngredientCard
            key={item.name}
            name={item.name}
            imgSrc={item.img}
            isSelected={selectedIngredients.has(item.name)}
            onToggle={() => toggleIngredient(item.name)}
            disabled={
              selectedIngredients.size >= 2 &&
              !selectedIngredients.has(item.name)
            }
          />
        ))}
      </div>

      {/* Bottom controls */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-start text-xs font-bold text-[#3D2E1F]">
          Selected{' '}
          <span className="text-[#E8881E] mx-1">{selectedIngredients.size}/2</span>{' '}
          ingredients
        </div>

        <div className="flex justify-center">
          <button
            onClick={onConfirmVote}
            disabled={selectedIngredients.size === 0}
            className="px-12 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer"
          >
            Confirm Vote
          </button>
        </div>

        <p className="text-[11px] text-[#8B7355] font-medium">
          Your actions are anonymous, observe patterns carefully.
        </p>
      </div>
    </div>
  );
}

/* ---------- Round 2 Content ---------- */
function Round2Content({
  cookingStep,
  setCookingStep,
  stepSubmitted,
  allStepsSubmitted,
  onSubmitStep,
  onProceedToReview,
}: {
  cookingStep: string;
  setCookingStep: (v: string) => void;
  stepSubmitted: boolean;
  allStepsSubmitted: boolean;
  onSubmitStep: () => void;
  onProceedToReview: () => void;
}) {
  return (
    <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 space-y-5">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-lg font-black text-[#3D2E1F]">
          Round 2 of 3 — Cooking Step Submission
        </h2>
      </div>

      {/* Top ingredients from Round 1 */}
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">
          Your top 4 Final
          <br />
          Ingredients
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedFromRound1.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center gap-1.5 bg-white rounded-xl px-3 py-2 border border-[#F5E6D3] shadow-xs"
            >
              <img src={item.img} alt={item.name} className="w-8 h-8 object-contain drop-shadow-xs" />
              <span className="text-xs font-bold text-[#3D2E1F]">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t border-[#F0D5B5]" />

      {/* Content based on state */}
      {!stepSubmitted ? (
        /* State 1: Input step */
        <div className="space-y-4">
          {/* It's your turn badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFEAD1] border border-[#F5CE9E] text-xs font-extrabold text-[#E8881E]">
              ✋ It's your Turn
            </span>
          </div>

          {/* Instruction */}
          <p className="text-xs text-[#3D2E1F] font-medium">
            Submit one cooking step using the selected ingredients.
          </p>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#3D2E1F] mb-1.5">
              Enter your step (max 120 characters)
            </label>
            <textarea
              value={cookingStep}
              onChange={(e) => setCookingStep(e.target.value.slice(0, 120))}
              placeholder="Write your step here... Example: Chop the vegetables into small pieces."
              rows={4}
              className="w-full rounded-xl border border-[#F5E2C8] focus:border-[#E8881E] focus:ring-2 focus:ring-[#E8881E]/20 outline-none p-3.5 text-xs text-[#3D2E1F] placeholder:text-[#8B7355]/60 bg-white resize-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-[#8B7355]">
                Tip: A good step is clear, simple and moves the recipe forward.
              </p>
              <span className="text-[11px] font-mono font-bold text-[#8B7355]">
                {cookingStep.length}/120
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onSubmitStep}
              disabled={!cookingStep.trim()}
              className="px-10 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#E8881E]/25 cursor-pointer"
            >
              Submit Step
            </button>
          </div>
        </div>
      ) : !allStepsSubmitted ? (
        /* State 2: Step submitted, waiting for others */
        <div className="bg-[#F0FFF0] border border-[#4CAF50]/30 rounded-xl p-5 text-center">
          <span className="text-2xl block mb-1">✅</span>
          <p className="text-xs font-bold text-[#36B37E]">
            Your step has been submitted!....
          </p>
          <p className="text-[11px] text-[#8B7355] mt-0.5">
            Waiting for other players to complete their steps...
          </p>
        </div>
      ) : (
        /* State 3: All steps submitted — proceed to review */
        <div className="text-center space-y-6 py-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#3D2E1F] leading-snug">
              All Step are Submitted, Please proceed to
              <br />
              Review the Steps & Vote
            </h3>
          </div>

          {/* Cooking pot with check illustration */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Check circle */}
              <div className="absolute -left-4 bottom-2 w-14 h-14 rounded-full bg-[#E8881E] flex items-center justify-center shadow-lg z-10">
                <Check size={28} className="text-white" strokeWidth={3} />
              </div>
              {/* Cooking pot image */}
              <div className="w-28 h-28 rounded-full bg-[#FFF3E0] border border-[#F5E2C8] flex items-center justify-center ml-6">
                <img
                  src={step2Img}
                  alt="Cooking pot"
                  className="w-16 h-16 object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Proceed button */}
          <button
            onClick={onProceedToReview}
            className="w-full max-w-md mx-auto py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer block"
          >
            Proceed to Review the Steps & Vote
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Round 3 Content: Imposter Voting ---------- */
function Round3Content({
  players,
  selectedPlayer,
  onSelectPlayer,
  voteSubmitted,
  onSubmitVote,
}: {
  players: { name: string; role: string; img: string }[];
  selectedPlayer: string | null;
  onSelectPlayer: (name: string) => void;
  voteSubmitted: boolean;
  onSubmitVote: () => void;
}) {
  return (
    <div className="bg-[#FFF8EE] rounded-2xl border-2 border-[#E8881E]/30 p-6 text-center space-y-5">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-black text-[#3D2E1F]">
          Round 3 of 3 – Imposter Voting
        </h2>
        <p className="text-sm font-semibold text-[#E8881E] mt-2 leading-relaxed max-w-[400px] mx-auto">
          Vote to eliminate one player. Who do you think is not contributing well
          to the dish & is a imposter?
        </p>
        <p className="text-xs text-[#6E5A44] mt-2 font-medium">
          Vote wisely, one wrong vote can save the impostor.
        </p>
      </div>

      {/* Players grid */}
      <div className="flex items-center justify-center gap-3 flex-wrap py-2">
        {players.map((player) => {
          const isSelected = selectedPlayer === player.name;
          return (
            <button
              key={player.name}
              onClick={() => !voteSubmitted && onSelectPlayer(player.name)}
              disabled={voteSubmitted}
              className={`
                relative flex flex-col items-center gap-1.5 cursor-pointer transition-all
                ${voteSubmitted ? 'cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E8881E] flex items-center justify-center shadow-md z-10">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              )}
              {/* Avatar */}
              <div
                className={`
                  w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all
                  ${
                    isSelected
                      ? 'border-[#E8881E] ring-2 ring-[#E8881E]/30 shadow-lg'
                      : 'border-[#F5E2C8] shadow-xs'
                  }
                `}
              >
                <img
                  src={player.img}
                  alt={player.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 15%' }}
                />
              </div>
              {/* Name & role */}
              <span className="text-[11px] font-bold text-[#6E5A44]">
                {player.name}
              </span>
              <span className="text-[10px] font-semibold text-[#8B7355]">
                {player.role}
              </span>
            </button>
          );
        })}
      </div>

      {/* Anonymous note */}
      <p className="text-xs text-[#6E5A44] font-medium">
        Your vote is anonymous.
      </p>

      {/* Submit button */}
      {!voteSubmitted ? (
        <button
          onClick={onSubmitVote}
          disabled={!selectedPlayer}
          className="w-full max-w-md mx-auto py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer block"
        >
          Submit Vote
        </button>
      ) : (
        <div className="bg-[#F0FFF0] border border-[#4CAF50]/30 rounded-xl p-5">
          <span className="text-2xl block mb-1">✅</span>
          <p className="text-xs font-bold text-[#36B37E]">
            Your vote has been submitted!
          </p>
          <p className="text-[11px] text-[#8B7355] mt-0.5">
            Waiting for other players to finish voting...
          </p>
        </div>
      )}
    </div>
  );
}
