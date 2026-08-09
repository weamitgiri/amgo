import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Utensils, Check, Send, Lock } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { RoundProgress } from './-components/RoundProgress';
import { PlayersSidebar, type CCPlayerSidebarEntry } from './-components/PlayersSidebar';
import { ActivityFeed, type CCActivityItem } from './-components/ActivityFeed';
import { RoundResultsModal } from './-components/RoundResultsModal';
import { CookingStepReviewModal } from './-components/CookingStepReviewModal';
import { NameDishModal } from './-components/NameDishModal';
import { cookAndCreateService } from '@/api/services/cookandcreate.service';
import type { CCGameStateResponse } from '@/api/types/cookandcreate';
import { getParticipantSession } from '@/lib/participant-session';
import { getSocket } from '@/lib/socket';
import { toastError } from '@/lib/toast';

export const Route = createFileRoute('/cookandcreate/game')({
  component: GamePage,
});

/** Same server-timestamp parsing Mystery Quest's game.tsx already uses. */
function secondsRemaining(startedAt: string | null, durationSecs: number): number {
  if (!startedAt) return durationSecs;
  const startedMs = new Date(startedAt.replace(' ', 'T')).getTime();
  if (Number.isNaN(startedMs)) return durationSecs;
  const elapsed = Math.floor((Date.now() - startedMs) / 1000);
  return Math.max(0, durationSecs - elapsed);
}

const ROLE_EMOJI: Record<string, string> = {
  chef: '🍳',
  show_host: '🎬',
  impostor: '🎭',
};

function GamePage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const groupId = session?.groupId;
  const participantId = session?.participantId;

  const [gameState, setGameState] = useState<CCGameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRound1Results, setShowRound1Results] = useState(false);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<number>>(new Set());
  const [stepText, setStepText] = useState('');
  const [chatText, setChatText] = useState('');
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchState = useCallback(async () => {
    if (!groupId || !participantId) return;
    try {
      const data = await cookAndCreateService.getGameState(groupId, participantId);
      setGameState(data);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not load game state.');
    } finally {
      setLoading(false);
    }
  }, [groupId, participantId]);

  // Initial hydration + redirect guards
  useEffect(() => {
    if (!groupId || !participantId) {
      navigate({ to: '/' });
      return;
    }
    fetchState();
  }, [groupId, participantId, navigate, fetchState]);

  // Join the presence room (group_${groupId}) and the gameplay room
  // (cc-instance-${instanceId}) once we know the instance id.
  useEffect(() => {
    if (!gameState?.instance.id || !groupId || !participantId) return;
    const socket = getSocket();
    socket.emit('join_lobby', { groupId, participantId });
    socket.emit('join_cc_instance', { instanceId: gameState.instance.id });
  }, [gameState?.instance.id, groupId, participantId]);

  // The instance transitioning to 'completed' sends everyone to the rating /
  // leaderboard flow — outside the game page entirely.
  useEffect(() => {
    if (gameState?.instance.status === 'completed') {
      navigate({ to: '/cookandcreate/rating' });
    }
  }, [gameState?.instance.status, navigate]);

  // Socket listeners. The server is authoritative and the group is capped at
  // 5 players, so re-fetching full state on every phase-transition event is
  // cheap and avoids subtle client-side state-merge bugs — the one exception
  // is the Round 1 "results" modal, which needs to pop up exactly once.
  useEffect(() => {
    if (!groupId || !participantId) return;
    const socket = getSocket();
    const refetch = () => fetchState();
    const onRound1Complete = () => {
      setShowRound1Results(true);
      refetch();
    };

    socket.on('cc_round1_started', refetch);
    socket.on('cc_round1_vote_submitted', refetch);
    socket.on('cc_round1_complete', onRound1Complete);
    socket.on('cc_round2_step_submitted', refetch);
    socket.on('cc_round2_review_started', refetch);
    socket.on('cc_round2_step_vote_submitted', refetch);
    socket.on('cc_round2_review_complete', refetch);
    socket.on('cc_dish_name_submitted', refetch);
    socket.on('cc_round3_discussion_started', refetch);
    socket.on('cc_round3_message_new', refetch);
    socket.on('cc_round3_voting_started', refetch);
    socket.on('cc_round3_impostor_vote_submitted', refetch);
    socket.on('cc_round3_complete', refetch);

    return () => {
      socket.off('cc_round1_started', refetch);
      socket.off('cc_round1_vote_submitted', refetch);
      socket.off('cc_round1_complete', onRound1Complete);
      socket.off('cc_round2_step_submitted', refetch);
      socket.off('cc_round2_review_started', refetch);
      socket.off('cc_round2_step_vote_submitted', refetch);
      socket.off('cc_round2_review_complete', refetch);
      socket.off('cc_dish_name_submitted', refetch);
      socket.off('cc_round3_discussion_started', refetch);
      socket.off('cc_round3_message_new', refetch);
      socket.off('cc_round3_voting_started', refetch);
      socket.off('cc_round3_impostor_vote_submitted', refetch);
      socket.off('cc_round3_complete', refetch);
    };
  }, [groupId, participantId, fetchState]);

  // Fallback poll — catches timer-driven transitions that fire while this tab
  // wasn't focused / the socket briefly dropped (same safety-net pattern the
  // lobby page already uses).
  useEffect(() => {
    if (!groupId || !participantId) return;
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, [groupId, participantId, fetchState]);

  if (loading || !gameState) {
    return (
      <CookCreateLayout breadcrumb="Cook & Create / Game">
        <div className="flex items-center justify-center min-h-[50vh] text-[#8B7355]">Loading game…</div>
      </CookCreateLayout>
    );
  }

  const { instance, template, participants, submitted_participant_ids: submittedIds } = gameState;
  const myId = participantId ? Number(participantId) : null;

  const currentRound: 1 | 2 | 3 =
    instance.status === 'round1' ? 1 : instance.status === 'round2' ? 2 : 3;

  const sidebarPlayers: CCPlayerSidebarEntry[] = participants.map((p) => ({
    id: p.id,
    name: p.name,
    isYou: p.isYou,
    online: p.status === 'online' || p.status === 'active' || p.isYou,
    submitted: submittedIds.includes(p.id),
  }));

  const myRoleEmoji = gameState.my_role ? ROLE_EMOJI[gameState.my_role] ?? '🍳' : '🍳';

  const submit = async (fn: () => Promise<unknown>) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fn();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'That didn’t go through — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleIngredient = (id: number) => {
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < template.round1_votes_per_player) {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmVote = () =>
    submit(async () => {
      if (!myId) return;
      await cookAndCreateService.submitRound1Votes({
        instance_id: instance.id,
        participant_id: myId,
        ingredient_ids: Array.from(selectedIngredientIds),
      });
      await fetchState();
    });

  const handleSubmitStep = () =>
    submit(async () => {
      if (!myId || !stepText.trim()) return;
      // Steps are anonymous once submitted (never shown to who wrote them),
      // so the letter is just a stable display order — assign it from how
      // many steps exist so far.
      const nextLetter = String.fromCharCode(65 + gameState.cooking_steps.length);
      await cookAndCreateService.submitRound2Step({
        instance_id: instance.id,
        participant_id: myId,
        step_text: stepText.trim(),
        step_letter: nextLetter,
      });
      await fetchState();
    });

  const handleStepVote = (stepId: number, vote: 'keep' | 'remove') =>
    submit(async () => {
      if (!myId) return;
      await cookAndCreateService.submitRound2StepVote({
        instance_id: instance.id,
        participant_id: myId,
        step_id: stepId,
        vote,
      });
      await fetchState();
    });

  const handleDishNameSubmit = (dishName: string) =>
    submit(async () => {
      if (!myId) return;
      await cookAndCreateService.submitDishName({
        instance_id: instance.id,
        participant_id: myId,
        dish_name: dishName,
      });
      await fetchState();
    });

  const handleSendChat = () =>
    submit(async () => {
      if (!myId || !chatText.trim()) return;
      await cookAndCreateService.submitRound3Message({
        instance_id: instance.id,
        participant_id: myId,
        message: chatText.trim(),
      });
      setChatText('');
      await fetchState();
    });

  const handleSubmitVote = () =>
    submit(async () => {
      if (!myId || !selectedVoteId) return;
      await cookAndCreateService.submitRound3ImpostorVote({
        instance_id: instance.id,
        participant_id: myId,
        voted_for_participant_id: selectedVoteId,
      });
      await fetchState();
    });

  const getRoundLabel = () => {
    if (currentRound === 1) return 'Ingredient Market';
    if (currentRound === 2) return instance.round2_phase === 'review' ? 'Review & Vote' : 'Cooking Steps';
    return instance.status === 'round3_voting' ? 'Elimination Vote' : 'Discussion';
  };

  const roundTimer = (() => {
    if (currentRound === 1) return secondsRemaining(instance.round1_started_at, template.round1_timer_secs);
    if (currentRound === 2) {
      return instance.round2_phase === 'review'
        ? secondsRemaining(instance.round2_started_at, template.round2_review_timer_secs)
        : secondsRemaining(instance.round2_started_at, template.round2_submit_timer_secs);
    }
    if (instance.status === 'round3_voting') {
      return secondsRemaining(instance.round3_voting_started_at, template.round3_voting_timer_secs);
    }
    return secondsRemaining(instance.round3_discussion_started_at, template.round3_discussion_timer_secs);
  })();
  const timerMm = String(Math.floor(roundTimer / 60)).padStart(2, '0');
  const timerSs = String(roundTimer % 60).padStart(2, '0');

  const activityItems: CCActivityItem[] = (() => {
    if (currentRound === 1) {
      return [
        {
          id: 'r1',
          name: 'Round 1',
          text: `${submittedIds.length}/${participants.length} players have voted.`,
          time: '',
          type: 'info',
        },
      ];
    }
    if (currentRound === 2 && instance.round2_phase === 'submit') {
      return [
        {
          id: 'r2s',
          name: 'Round 2',
          text: `${submittedIds.length}/${participants.length} steps submitted.`,
          time: '',
          type: 'info',
        },
      ];
    }
    if (currentRound === 2 && instance.round2_phase === 'review') {
      return gameState.cooking_steps.map((s) => ({
        id: `step-${s.id}`,
        name: `Step ${s.letter}`,
        text:
          s.status === 'submitted'
            ? `${s.keep_votes} keep / ${s.remove_votes} remove so far.`
            : s.status === 'kept'
              ? 'Kept in the final recipe.'
              : 'Removed from the final recipe.',
        time: '',
        type: 'info' as const,
      }));
    }
    if (instance.status === 'round3_discussion') {
      return gameState.chat_messages
        .filter((m) => !m.is_impostor_private)
        .map((m) => ({
          id: `msg-${m.id}`,
          name: m.is_you ? 'You' : m.participant_name,
          text: m.message,
          time: '',
          type: 'submitted' as const,
        }));
    }
    if (instance.status === 'round3_voting') {
      return [
        {
          id: 'r3v',
          name: 'Round 3',
          text: `${submittedIds.length}/${participants.length} players have voted.`,
          time: '',
          type: 'info',
        },
      ];
    }
    return [];
  })();

  const topIngredientsForNameDish = gameState.selected_ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    image_url: i.image_url,
  }));

  const canNameDish = !template.show_host_role_enabled || gameState.is_show_host;
  const reviewResolved = gameState.cooking_steps.length > 0 && gameState.cooking_steps.every((s) => s.status !== 'submitted');
  const myMessagesSent = gameState.chat_messages.filter((m) => m.is_you && !m.is_impostor_private).length;
  const messagesRemaining = Math.max(0, template.round3_max_messages_per_player - myMessagesSent);

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Game">
      <div className="relative z-10 space-y-4">
        <CookCreateHeader showGameTimer={false} />

        {/* Sub-header status bar */}
        <div className="bg-[#FFF3E0] border border-[#F5DCBD] rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8881E] flex items-center justify-center shadow-xs">
                <Utensils size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#3D2E1F] leading-tight">Cook &amp; Create</h2>
                <p className="text-[11px] font-bold text-[#E8881E]">
                  Round {currentRound}: {getRoundLabel()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/70 border border-[#F5E2C8] rounded-xl px-4 py-1.5">
              <span className="text-base font-black text-[#3D2E1F] font-mono">
                {timerMm}:{timerSs}
              </span>
            </div>

            <RoundProgress currentRound={currentRound} />
          </div>
        </div>

        {/* Three column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-4 items-start">
          <div>
            <PlayersSidebar players={sidebarPlayers} myRoleLabel={gameState.my_role_label ?? 'Chef'} myRoleEmoji={myRoleEmoji} />
          </div>

          <div>
            {currentRound === 1 ? (
              <Round1Content
                ingredients={gameState.all_ingredients}
                votesPerPlayer={template.round1_votes_per_player}
                selectedIngredientIds={selectedIngredientIds}
                toggleIngredient={toggleIngredient}
                onConfirmVote={handleConfirmVote}
                alreadyVoted={gameState.my_ingredient_votes.length > 0}
                submitting={submitting}
              />
            ) : currentRound === 2 ? (
              <Round2Content
                stepText={stepText}
                setStepText={setStepText}
                maxChars={template.round2_step_max_chars}
                mySubmittedStep={gameState.my_cooking_step}
                onSubmitStep={handleSubmitStep}
                submitting={submitting}
                selectedIngredients={gameState.selected_ingredients}
                allSubmitted={reviewResolved}
                phase={instance.round2_phase}
              />
            ) : (
              <Round3Content
                status={instance.status}
                participants={participants}
                myId={myId}
                selectedVoteId={selectedVoteId}
                onSelectPlayer={setSelectedVoteId}
                onSubmitVote={handleSubmitVote}
                myVoted={gameState.my_impostor_vote != null}
                chatMessages={gameState.chat_messages}
                chatText={chatText}
                setChatText={setChatText}
                onSendChat={handleSendChat}
                messagesRemaining={messagesRemaining}
                isImpostor={gameState.is_impostor}
                impostorBiasCard={gameState.impostor_bias_card}
                submitting={submitting}
              />
            )}
          </div>

          <div>
            <ActivityFeed currentRound={currentRound} items={activityItems} />
          </div>
        </div>

        <RoundResultsModal
          isOpen={showRound1Results}
          onClose={() => setShowRound1Results(false)}
          topIngredients={gameState.selected_ingredients}
        />

        <CookingStepReviewModal
          isOpen={currentRound === 2 && instance.round2_phase === 'review' && !reviewResolved}
          onClose={() => undefined}
          steps={gameState.cooking_steps}
          myVotes={gameState.my_step_votes}
          onVote={handleStepVote}
          timerLabel={`${timerMm}:${timerSs}`}
          canContinue={false}
        />

        <NameDishModal
          isOpen={currentRound === 2 && instance.round2_phase === 'review' && reviewResolved && !instance.dish_name}
          onSubmit={handleDishNameSubmit}
          topIngredients={topIngredientsForNameDish}
          canSubmit={canNameDish}
          waitingLabel={
            template.show_host_role_enabled
              ? 'Waiting for the Show Host to name the dish…'
              : 'Waiting for a teammate to name the dish…'
          }
        />
      </div>
    </CookCreateLayout>
  );
}

/* ---------- Round 1 ---------- */
function Round1Content({
  ingredients,
  votesPerPlayer,
  selectedIngredientIds,
  toggleIngredient,
  onConfirmVote,
  alreadyVoted,
  submitting,
}: {
  ingredients: { id: number; name: string; image_url: string | null }[];
  votesPerPlayer: number;
  selectedIngredientIds: Set<number>;
  toggleIngredient: (id: number) => void;
  onConfirmVote: () => void;
  alreadyVoted: boolean;
  submitting: boolean;
}) {
  if (alreadyVoted) {
    return (
      <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-8 text-center space-y-3">
        <span className="text-2xl block">✅</span>
        <p className="text-sm font-bold text-[#36B37E]">Your votes are in!</p>
        <p className="text-xs text-[#8B7355]">Waiting for the rest of your team to vote…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 text-center space-y-5">
      <div>
        <h2 className="text-lg font-black text-[#3D2E1F]">Round 1 of 3 – Ingredients Market</h2>
        <h3 className="text-sm font-extrabold text-[#3D2E1F] mt-0.5">Vote for Ingredients</h3>
        <p className="text-xs text-[#8B7355] mt-1 font-medium">
          Select {votesPerPlayer} ingredients you think should go into our recipe.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {ingredients.map((item) => {
          const isSelected = selectedIngredientIds.has(item.id);
          const disabled = selectedIngredientIds.size >= votesPerPlayer && !isSelected;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleIngredient(item.id)}
              disabled={disabled}
              className={`relative flex flex-col items-center justify-between p-3 rounded-2xl bg-white border-2 transition-all duration-150 ease-out cursor-pointer min-h-[125px] w-full shadow-xs ${
                isSelected ? 'border-[#E8881E] ring-2 ring-[#E8881E]/20 bg-[#FFFDF9]' : 'border-[#F5E6D3] hover:border-[#E8881E]/50'
              } ${!disabled ? 'hover:scale-[1.03]' : ''} ${disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E8881E] flex items-center justify-center shadow-xs z-10">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
              )}
              <div className="flex-1 flex items-center justify-center w-full my-1">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="max-w-[65px] max-h-[65px] object-contain drop-shadow-sm" />
                ) : (
                  <span className="text-3xl">🥘</span>
                )}
              </div>
              <span className="text-xs font-bold text-[#3D2E1F] text-center leading-tight">{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-start text-xs font-bold text-[#3D2E1F]">
          Selected <span className="text-[#E8881E] mx-1">{selectedIngredientIds.size}/{votesPerPlayer}</span> ingredients
        </div>

        <div className="flex justify-center">
          <button
            onClick={onConfirmVote}
            disabled={selectedIngredientIds.size !== votesPerPlayer || submitting}
            className="px-12 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer"
          >
            Confirm Vote
          </button>
        </div>

        <p className="text-[11px] text-[#8B7355] font-medium">Your actions are anonymous, observe patterns carefully.</p>
      </div>
    </div>
  );
}

/* ---------- Round 2 ---------- */
function Round2Content({
  stepText,
  setStepText,
  maxChars,
  mySubmittedStep,
  onSubmitStep,
  submitting,
  selectedIngredients,
  allSubmitted,
  phase,
}: {
  stepText: string;
  setStepText: (v: string) => void;
  maxChars: number;
  mySubmittedStep: string | null;
  onSubmitStep: () => void;
  submitting: boolean;
  selectedIngredients: { id: number; name: string; image_url: string | null }[];
  allSubmitted: boolean;
  phase: 'submit' | 'review';
}) {
  return (
    <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-black text-[#3D2E1F]">Round 2 of 3 — Cooking Step Submission</h2>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">
          Your top {selectedIngredients.length || 4} Final
          <br />
          Ingredients
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedIngredients.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-1.5 bg-white rounded-xl px-3 py-2 border border-[#F5E6D3] shadow-xs">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-8 h-8 object-contain drop-shadow-xs" />
              ) : (
                <span className="text-xl">🥘</span>
              )}
              <span className="text-xs font-bold text-[#3D2E1F]">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t border-[#F0D5B5]" />

      {phase === 'review' ? (
        <div className="text-center space-y-6 py-4">
          <h3 className="text-base sm:text-lg font-black text-[#3D2E1F] leading-snug">
            {allSubmitted ? 'Steps reviewed — waiting on the dish name…' : 'Review the steps in the popup and vote to keep or remove each one.'}
          </h3>
        </div>
      ) : !mySubmittedStep ? (
        <div className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFEAD1] border border-[#F5CE9E] text-xs font-extrabold text-[#E8881E]">
              ✋ It's your Turn
            </span>
          </div>
          <p className="text-xs text-[#3D2E1F] font-medium">Submit one cooking step using the selected ingredients.</p>
          <div>
            <label className="block text-xs font-bold text-[#3D2E1F] mb-1.5">Enter your step (max {maxChars} characters)</label>
            <textarea
              value={stepText}
              onChange={(e) => setStepText(e.target.value.slice(0, maxChars))}
              placeholder="Write your step here... Example: Chop the vegetables into small pieces."
              rows={4}
              className="w-full rounded-xl border border-[#F5E2C8] focus:border-[#E8881E] focus:ring-2 focus:ring-[#E8881E]/20 outline-none p-3.5 text-xs text-[#3D2E1F] placeholder:text-[#8B7355]/60 bg-white resize-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-[#8B7355]">Tip: A good step is clear, simple and moves the recipe forward.</p>
              <span className="text-[11px] font-mono font-bold text-[#8B7355]">
                {stepText.length}/{maxChars}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={onSubmitStep}
              disabled={!stepText.trim() || submitting}
              className="px-10 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#E8881E]/25 cursor-pointer"
            >
              Submit Step
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#F0FFF0] border border-[#4CAF50]/30 rounded-xl p-5 text-center">
          <span className="text-2xl block mb-1">✅</span>
          <p className="text-xs font-bold text-[#36B37E]">Your step has been submitted!</p>
          <p className="text-[11px] text-[#8B7355] mt-0.5">Waiting for other players to complete their steps...</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Round 3 ---------- */
function Round3Content({
  status,
  participants,
  myId,
  selectedVoteId,
  onSelectPlayer,
  onSubmitVote,
  myVoted,
  chatMessages,
  chatText,
  setChatText,
  onSendChat,
  messagesRemaining,
  isImpostor,
  impostorBiasCard,
  submitting,
}: {
  status: string;
  participants: { id: number; name: string; isYou: boolean; role_label: string }[];
  myId: number | null;
  selectedVoteId: number | null;
  onSelectPlayer: (id: number) => void;
  onSubmitVote: () => void;
  myVoted: boolean;
  chatMessages: { id: number; participant_name: string; is_you: boolean; message: string; is_impostor_private: boolean }[];
  chatText: string;
  setChatText: (v: string) => void;
  onSendChat: () => void;
  messagesRemaining: number;
  isImpostor: boolean;
  impostorBiasCard: string | null;
  submitting: boolean;
}) {
  if (status === 'round3_discussion') {
    return (
      <div className="bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 space-y-4 flex flex-col h-[520px]">
        <div className="text-center">
          <h2 className="text-lg font-black text-[#3D2E1F]">Round 3 of 3 — The Kitchen Talks</h2>
          <p className="text-xs text-[#8B7355] mt-1">
            "Someone in this kitchen was never really cooking." Say what you think — {messagesRemaining} message
            {messagesRemaining === 1 ? '' : 's'} left.
          </p>
        </div>

        {isImpostor && impostorBiasCard && (
          <div className="bg-[#3D2E1F] rounded-xl px-4 py-3 text-white flex items-start gap-2">
            <Lock size={14} className="shrink-0 mt-0.5 text-[#FFC98A]" />
            <div
              className="text-xs leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-1"
              dangerouslySetInnerHTML={{ __html: impostorBiasCard }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2.5 bg-white/60 rounded-xl border border-[#F5E6D3] p-4">
          {chatMessages.filter((m) => !m.is_impostor_private).length === 0 ? (
            <p className="text-xs text-[#9C826B] text-center py-6">No messages yet — be the first to say something.</p>
          ) : (
            chatMessages
              .filter((m) => !m.is_impostor_private)
              .map((m) => (
                <div key={m.id} className={`flex ${m.is_you ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs ${
                      m.is_you ? 'bg-[#E8881E] text-white' : 'bg-white border border-[#F5E6D3] text-[#3D2E1F]'
                    }`}
                  >
                    {!m.is_you && <p className="font-bold text-[10px] mb-0.5 opacity-70">{m.participant_name}</p>}
                    {m.message}
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value.slice(0, 200))}
            onKeyDown={(e) => e.key === 'Enter' && messagesRemaining > 0 && chatText.trim() && onSendChat()}
            disabled={messagesRemaining === 0 || submitting}
            placeholder={messagesRemaining === 0 ? "You're out of messages" : 'Say something…'}
            className="flex-1 rounded-full border border-[#F5E2C8] focus:border-[#E8881E] outline-none px-4 py-2.5 text-xs bg-white disabled:opacity-50"
          />
          <button
            onClick={onSendChat}
            disabled={!chatText.trim() || messagesRemaining === 0 || submitting}
            className="w-10 h-10 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-40 flex items-center justify-center text-white shrink-0 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // round3_voting
  const votable = participants.filter((p) => p.id !== myId);

  return (
    <div className="bg-[#FFF8EE] rounded-2xl border-2 border-[#E8881E]/30 p-6 text-center space-y-5">
      <div>
        <h2 className="text-lg font-black text-[#3D2E1F]">Round 3 of 3 – Imposter Voting</h2>
        <p className="text-sm font-semibold text-[#E8881E] mt-2 leading-relaxed max-w-[400px] mx-auto">
          Vote to eliminate one player. Who do you think is not contributing well to the dish &amp; is the impostor?
        </p>
        <p className="text-xs text-[#6E5A44] mt-2 font-medium">Vote wisely, one wrong vote can save the impostor.</p>
      </div>

      {myVoted ? (
        <div className="bg-[#F0FFF0] border border-[#4CAF50]/30 rounded-xl p-5">
          <span className="text-2xl block mb-1">✅</span>
          <p className="text-xs font-bold text-[#36B37E]">Your vote has been submitted!</p>
          <p className="text-[11px] text-[#8B7355] mt-0.5">Waiting for other players to finish voting...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-3 flex-wrap py-2">
            {votable.map((player) => {
              const isSelected = selectedVoteId === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => onSelectPlayer(player.id)}
                  className="relative flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                >
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E8881E] flex items-center justify-center shadow-md z-10">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-white border-2 flex items-center justify-center text-2xl transition-all ${
                      isSelected ? 'border-[#E8881E] ring-2 ring-[#E8881E]/30 shadow-lg' : 'border-[#F5E2C8] shadow-xs'
                    }`}
                  >
                    🧑‍🍳
                  </div>
                  <span className="text-[11px] font-bold text-[#6E5A44]">{player.name}</span>
                  <span className="text-[10px] font-semibold text-[#8B7355]">{player.role_label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-[#6E5A44] font-medium">Your vote is anonymous.</p>

          <button
            onClick={onSubmitVote}
            disabled={!selectedVoteId || submitting}
            className="w-full max-w-md mx-auto py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer block"
          >
            Submit Vote
          </button>
        </>
      )}
    </div>
  );
}
