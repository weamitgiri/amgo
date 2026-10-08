import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Leaf, Check, Send, Lock, ChefHat, UserRound } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import type { CCPlayerSidebarEntry } from './-components/PlayersSidebar';
import type { CCActivityItem } from './-components/ActivityFeed';
import logoImg from '../../assets/cookandcreate/Cook  and Create Logo.png';
import step1Img from '../../assets/cookandcreate/game-flow-step-1.png';
import step2Img from '../../assets/cookandcreate/game-flow-step-2.png';
import step4Img from '../../assets/cookandcreate/game-flow-step-4.png';
import leaf from '../../assets/cookandcreate/cook-game-rule-icon/leaf.png';
import maskGroup from '../../assets/cookandcreate/mask-group-removebg-preview.png';
import { RoundResultsModal } from './-components/RoundResultsModal';
import { CookingStepReviewModal } from './-components/CookingStepReviewModal';
import { NameDishModal } from './-components/NameDishModal';
import { portraitForRole } from './-components/portraits';
import { clockOffsetMs } from './-components/clock';
import { cookAndCreateService } from '@/api/services/cookandcreate.service';
import type { CCCookingStep, CCGameStateResponse, CCRound2Turn, CCTemplate } from '@/api/types/cookandcreate';
import { getParticipantSession } from '@/lib/participant-session';
import { getSocket } from '@/lib/socket';
import { toastError } from '@/lib/toast';
import imposterImg from '../../assets/cookandcreate/imposter 1.png';
import { resolveMediaUrl } from '@/utils/media';

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
  const [removeStepId, setRemoveStepId] = useState<number | null>(null);
  // Whether this player has clicked through the read-only vote-result screen
  // that sits between voting and dish-naming.
  const [reviewResultSeen, setReviewResultSeen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [onlineParticipantIds, setOnlineParticipantIds] = useState<Set<number> | null>(null);
  const [clockOffset, setClockOffset] = useState(0);
  // Forces a re-render once a second purely so the round countdown (derived
  // from Date.now() on every render) actually ticks — without this the timer
  // only ever updates when a socket event or the 10s poll happens to refetch.
  const [, setClockTick] = useState(0);

  const fetchState = useCallback(async () => {
    if (!groupId || !participantId) return;
    try {
      const data = await cookAndCreateService.getGameState(groupId, participantId);
      setGameState(data);
      setClockOffset(clockOffsetMs(data.schedule, Date.now()));
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

  useEffect(() => {
    const id = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Join the presence room (group_${groupId}) and the gameplay room
  // (cc-instance-${instanceId}) once we know the instance id.
  useEffect(() => {
    if (!gameState?.instance.id || !groupId || !participantId) return;
    const socket = getSocket();
    const instanceId = gameState.instance.id;
    const joinRooms = () => {
      socket.emit('join_lobby', { groupId, participantId });
      socket.emit('join_cc_instance', { instanceId });
      // The HTTP snapshot above can land after the join's presence broadcast
      // and clobber it with a stale "everyone offline" set — ask for a fresh
      // one now that we've definitely joined (same fix Mystery Quest's
      // game.tsx uses for the same race).
      socket.emit('request_presence', { groupId });
    };
    joinRooms();

    // Socket.IO reuses the same client Socket across reconnects, so this effect
    // never re-runs on its own and the reconnected socket sits in NEITHER
    // group_${groupId} nor cc-instance-${instanceId}. Re-join both rooms and
    // refetch full state on every (re)connect so cc_* round events keep flowing
    // after a network blip. `connect` fires on each successful (re)connect.
    const rejoinAndResync = () => {
      joinRooms();
      fetchState();
    };
    socket.on('connect', rejoinAndResync);
    return () => {
      socket.off('connect', rejoinAndResync);
    };
  }, [gameState?.instance.id, groupId, participantId, fetchState]);

  // Live presence — keeps the sidebar's online/offline dots accurate between
  // full refetches (someone closing their tab shouldn't take up to 10s to
  // show as offline).
  useEffect(() => {
    if (!groupId) return;
    const socket = getSocket();
    const onPresenceUpdated = (payload: { online_participant_ids?: number[] }) => {
      setOnlineParticipantIds(new Set(payload.online_participant_ids ?? []));
    };
    socket.on('presence_updated', onPresenceUpdated);
    return () => {
      socket.off('presence_updated', onPresenceUpdated);
    };
  }, [groupId]);

  // The instance transitioning to 'completed' sends everyone to the rating /
  // leaderboard flow — outside the game page entirely.

  useEffect(() => {
    if (gameState?.instance.status === 'completed') {
      navigate({ to: '/cookandcreate/game' });
     // navigate({ to: '/cookandcreate/game' });
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
    socket.on('cc_round2_turn_changed', refetch);
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
      socket.off('cc_round2_turn_changed', refetch);
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
      <CookCreateLayout maxWidthClass="max-w-[1376px]">
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
    // Live socket presence wins once it's arrived; the HTTP snapshot's
    // `status` (also real presence — see getCCGameState) covers the gap
    // before the first `presence_updated` event lands.
    online: p.isYou || (onlineParticipantIds ? onlineParticipantIds.has(p.id) : p.status === 'online'),
    submitted: submittedIds.includes(p.id),
  }));

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
      await cookAndCreateService.submitRound2Step({
        instance_id: instance.id,
        participant_id: myId,
        step_text: stepText.trim(),
      });
      await fetchState();
    });

  // Round 2 review is one decision, not one-vote-per-step: the player picks the
  // single step to remove and everything else is implicitly kept. Those implied
  // 'keep' votes are only written on Continue — the server still needs a vote
  // row per participant per step for checkRound2ReviewCompletion to fire.
  const handleSubmitStepVotes = () =>
    submit(async () => {
      if (!myId || removeStepId === null) return;
      for (const step of gameState.cooking_steps) {
        await cookAndCreateService.submitRound2StepVote({
          instance_id: instance.id,
          participant_id: myId,
          step_id: step.id,
          vote: step.id === removeStepId ? 'remove' : 'keep',
        });
      }
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
      if (instance.round2_phase === 'review') {
        // Anchored to when REVIEW opened, not to round2_started_at — by review
        // time every player's turn has already elapsed, so the round's own start
        // is minutes stale and the countdown rendered 00:00 instantly.
        return secondsRemaining(
          instance.round2_review_started_at ?? instance.round2_started_at,
          template.round2_review_timer_secs
        );
      }
      // Submit phase is turn-based — the clock belongs to the CURRENT turn,
      // not to the round as a whole.
      return secondsRemaining(
        instance.round2_turn_started_at ?? instance.round2_started_at,
        template.round2_submit_timer_secs
      );
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
      // Per-player vote status (matches the design's activity feed), those
      // who've already voted listed first.
      return [...participants]
        .map((p) => {
          const submitted = submittedIds.includes(p.id);
          const online = p.isYou || (onlineParticipantIds ? onlineParticipantIds.has(p.id) : p.status === 'online');
          const item: CCActivityItem = {
            id: `r1-${p.id}`,
            name: p.isYou ? `${p.name} (You)` : p.name,
            text: submitted ? 'Has submitted their vote.' : online ? 'submitting…' : 'Yet to submit their vote',
            time: submitted ? 'Just now' : '',
            type: submitted ? 'submitted' : online ? 'submitting' : 'missed',
          };
          return { rank: submitted ? 0 : online ? 1 : 2, item };
        })
        .sort((a, b) => a.rank - b.rank)
        .map((x) => x.item);
    }
    if (currentRound === 2 && instance.round2_phase === 'submit') {
      const turn = gameState.round2_turn;
      if (!turn) return [];
      // Step-by-step turn board. Intentionally shows no player names — the
      // server never sends them for Round 2, because a step traceable to a
      // player would give the impostor away in review.
      const textByLetter = new Map(gameState.cooking_steps.map((s) => [s.letter, s.text]));
      return turn.steps.map((s) => ({
        id: `turn-${s.letter}`,
        name: `Step ${s.letter}`,
        text:
          s.status === 'submitted'
            ? textByLetter.get(s.letter) ?? 'Submitted'
            : s.status === 'current'
              ? 'Currently submitting…'
              : s.status === 'missed'
                ? 'Missed their turn'
                : 'Awaiting turn',
        time: s.status === 'current' ? `${timerMm}:${timerSs}` : '',
        type:
          s.status === 'submitted'
            ? ('submitted' as const)
            : s.status === 'current'
              ? ('submitting' as const)
              : s.status === 'missed'
                ? ('missed' as const)
                : ('info' as const),
      }));
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

  // Absurd ingredients the group voted for, whether or not they made the top 4
  // — an absurd pick that lost the vote is exactly the signal players are meant
  // to notice, so it can't be derived from `selected_ingredients` alone.
  const absurdVotedIngredients = gameState.all_ingredients.filter(
    (i) => i.is_absurd && (gameState.ingredient_vote_counts[i.id] ?? 0) > 0
  );


  const canNameDish = !template.show_host_role_enabled || gameState.is_show_host;
  const reviewResolved = gameState.cooking_steps.length > 0 && gameState.cooking_steps.every((s) => s.status !== 'submitted');

  // Once my votes are on the server they win over the local pick, so a refresh
  // mid-phase still shows what I actually chose (and keeps the table locked).
  const myStepVoteEntries = Object.entries(gameState.my_step_votes);
  const reviewSubmitted = myStepVoteEntries.length > 0;
  const submittedRemoveId = myStepVoteEntries.find(([, v]) => v === 'remove')?.[0];
  const effectiveRemoveStepId = reviewSubmitted
    ? submittedRemoveId != null
      ? Number(submittedRemoveId)
      : null
    : removeStepId;
  const myMessagesSent = gameState.chat_messages.filter((m) => m.is_you && !m.is_impostor_private).length;
  const messagesRemaining = Math.max(0, template.round3_max_messages_per_player - myMessagesSent);

  // Players panel rows: same order (and avatar colour) as the activity feed.
  // Only your own turn is ever known to be "submitting" — the server never
  // says whose Round 2 turn it is, so the impostor can't be traced.
  const myTurnLive =
    currentRound === 2 &&
    instance.round2_phase === 'submit' &&
    !!gameState.round2_turn?.is_my_turn &&
    !gameState.my_cooking_step;
  const panelPlayers: PanelPlayer[] = sidebarPlayers.map((p, i) => {
    const submitting = p.isYou && myTurnLive;
    return {
      ...p,
      colorIndex: i,
      status: !p.online ? 'offline' : submitting ? 'submitting' : p.submitted ? 'submitted' : 'available',
      timer: submitting ? `${timerMm}:${timerSs}` : undefined,
    };
  });
  const colorIndexByName = new Map<string, number>();
  participants.forEach((p, i) => {
    colorIndexByName.set(p.name, i);
    if (p.isYou) colorIndexByName.set('You', i);
  });
  const activityColor = (name: string, fallback: number) =>
    colorIndexByName.get(name.replace(/\s*\(You\)$/, '')) ?? fallback;

  return (
    <CookCreateLayout maxWidthClass="max-w-[1376px]">
      <div className="relative z-10">
        <GameHeader
          participantName={session?.name}
          gameEndsAt={gameState.schedule.game_ends_at}
          clockOffsetMs={clockOffset}
        />

        {/* Round status bar */}
        <div
          className="mt-8 border border-[#E9CDA6] rounded-[20px] px-6 py-4 lg:min-h-[118px] flex items-center"
          style={{ background: 'linear-gradient(180deg, #FDE8CB 0%, #FCE0B6 100%)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-x-6 gap-y-4 w-full">
            <div className="flex items-center gap-4">
              <div
                className="w-[46px] h-[46px] rounded-[10px] flex items-center justify-center shadow-sm shrink-0"
                style={{ background: 'linear-gradient(180deg, #E57C25 0%, #D7650F 100%)' }}
              >

                <img src={leaf} alt="" className="w-[22px] h-[22px] object-contain shrink-0 mt-0.5" />

              </div>
              <div>
                <h2 className="text-[22px] font-semibold text-[#592e16] leading-tight">Cook &amp; Create</h2>
                <p className="text-base text-[#DE8234] mt-0.5">
                  Round {currentRound}: {getRoundLabel()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 rounded-lg border border-[#F2CD9C] bg-[#FDD9A9] px-4 py-2">
              <span className="text-sm leading-snug text-[#5A4A3A] text-center max-w-[150px]">
                {currentRound === 2 ? 'Add your cooking step before times Runs Out' : 'Voting Ends in'}
              </span>
              <span className="text-[34px] font-bold text-[#592e16] tabular-nums leading-none">
                {timerMm}:{timerSs}
              </span>
            </div>

            <RoundSteps currentRound={currentRound} />
          </div>
        </div>

        {/* Three column layout — Players / round content / Recent Activity, equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,260fr)_minmax(0,682fr)_minmax(0,323fr)] gap-8 items-stretch mt-7">
          <PlayersPanel players={panelPlayers} roleLabel={gameState.my_role_label ?? 'Chef'} />

          <div className="lg:min-h-[600px]">
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
                turn={gameState.round2_turn}
                turnTimerLabel={`${timerMm}:${timerSs}`}
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
                template={template}
              />
            )}
          </div>

          <ActivityPanel
            currentRound={currentRound}
            items={activityItems}
            colorFor={activityColor}
            round3Recap={
              currentRound === 3 ? { steps: gameState.cooking_steps, nowMs: Date.now() + clockOffset } : undefined
            }
          />
        </div>

        <RoundResultsModal
          isOpen={showRound1Results}
          onClose={() => setShowRound1Results(false)}
          topIngredients={gameState.selected_ingredients}
          absurdVoted={absurdVotedIngredients}
        />

      {  <CookingStepReviewModal
          isOpen={currentRound === 2 && instance.round2_phase === 'review' && !reviewResolved}
          steps={gameState.cooking_steps}
          removeStepId={effectiveRemoveStepId}
          onSelectRemove={setRemoveStepId}
          onSubmit={handleSubmitStepVotes}
          submitted={reviewSubmitted}
          submitting={submitting}
          timerLabel={`${timerMm}:${timerSs}`}
        />}

        {/* Read-only outcome of the vote — same modal, checkboxes locked — shown
            after votes resolve and before the dish-naming step. */}
        <CookingStepReviewModal
          isOpen={
            currentRound === 2 &&
            instance.round2_phase === 'review' &&
            reviewResolved &&
            !reviewResultSeen &&
            !instance.dish_name
          }
          steps={gameState.cooking_steps}
          removeStepId={null}
          onSelectRemove={() => undefined}
          onSubmit={() => undefined}
          submitted
          submitting={false}
          timerLabel={`${timerMm}:${timerSs}`}
          resultMode
          onContinue={() => setReviewResultSeen(true)}
        />

        <NameDishModal
          isOpen={
            currentRound === 2 &&
            instance.round2_phase === 'review' &&
            reviewResolved &&
            reviewResultSeen &&
            !instance.dish_name
          }
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

/* ---------- Screen chrome (header, round steps, side panels) ---------- */

/** Background of the centre (round content) panel. */
const CENTER_PANEL_STYLE = { background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF6E9 100%)' };
const CENTER_PANEL_CLASS =
  'h-full flex flex-col rounded-[20px] border border-[#F1E2D0] shadow-[0_2px_8px_rgba(80,50,20,0.05)]';

/** Same alias order everywhere: orange, yellow, green, blue, purple. */
const AVATAR_GRADIENTS = [
  'radial-gradient(circle at 35% 30%, #F7B56C 0%, #D9691C 75%)',
  'radial-gradient(circle at 35% 30%, #E6CC48 0%, #B39612 75%)',
  'radial-gradient(circle at 35% 30%, #86DD5E 0%, #3BA62D 75%)',
  'radial-gradient(circle at 35% 30%, #63C9E2 0%, #2890B3 75%)',
  'radial-gradient(circle at 35% 30%, #A274E4 0%, #6738B5 75%)',
];

/** "amit70" -> "A7", "John32 (You)" -> "J3"; names without digits -> first letters. */
function aliasInitials(name: string): string {
  const clean = name.replace(/\s*\(You\)$/, '').trim();
  const digit = /\d/.exec(clean)?.[0];
  const letter = /[A-Za-z]/.exec(clean)?.[0];
  if (letter && digit) return (letter + digit).toUpperCase();
  const words = clean.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : clean.slice(0, 2)).toUpperCase() || '?';
}

function AliasAvatar({ name, colorIndex, size }: { name: string; colorIndex: number; size: number }) {
  return (
    <span
      className="rounded-full flex items-center justify-center text-white font-medium shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: AVATAR_GRADIENTS[colorIndex % AVATAR_GRADIENTS.length],
        border: '1px solid rgba(90, 55, 20, 0.35)',
      }}
    >
      {aliasInitials(name)}
    </span>
  );
}

function formatGameRemaining(endsAt: string | null | undefined, offsetMs: number): string {
  if (!endsAt) return '--:--';
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return '--:--';
  const secs = Math.max(0, Math.round((end - (Date.now() + offsetMs)) / 1000));
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
}

/** Header — game timer sits beside the player, as in the design. Re-renders every second with the page. */
function GameHeader({
  participantName = 'Participant',
  gameEndsAt,
  clockOffsetMs,
}: {
  participantName?: string;
  gameEndsAt: string | null | undefined;
  clockOffsetMs: number;
}) {
  const words = participantName.trim().split(/\s+/).filter(Boolean);
  const initials =
    (words.length > 1 ? words[0][0] + words[1][0] : participantName.trim().slice(0, 2)).toUpperCase() || 'P';

  return (
    <div className="w-full bg-white rounded-[20px] border border-[#E8E7E3] px-5 py-[13px] flex items-center justify-between gap-4 shadow-[0_2px_8px_rgba(80,50,20,0.04)]">
      <div className="flex items-center gap-3 min-w-0">
        <img src={logoImg} alt="Cook & Create" className="w-11 h-11 object-contain shrink-0" />
        <span className="text-[22px] font-semibold text-[#2E2A26] whitespace-nowrap">Cook &amp; Create</span>
      </div>
      <div className="flex items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-3 sm:gap-4 rounded-lg border border-[#F1E3D5] bg-[#FFF5E6] px-3 sm:px-4 py-2.5">
          <span className="hidden sm:inline text-[15px] text-[#4A4540]">Game Time Remaining</span>
          <span className="text-xl font-bold text-[#2E2A26] tabular-nums leading-none">
            {formatGameRemaining(gameEndsAt, clockOffsetMs)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-medium shrink-0"
            style={{ background: 'radial-gradient(circle at 35% 30%, #FF9EC4 0%, #F35B91 75%)' }}
          >
            {initials}
          </span>
          <span className="hidden sm:inline text-base text-[#2E2A26] whitespace-nowrap">{participantName}</span>
        </div>
      </div>
    </div>
  );
}

const ROUND_STEPS = [
  { num: '01', img: step1Img, label: 'Ingredients' },
  { num: '02', img: step2Img, label: 'Steps' },
  { num: '03', img: step4Img, label: 'Elimination' },
] as const;

/** 01 Ingredients → 02 Steps → 03 Elimination: number badge overlapping the icon circle, label below. */
function RoundSteps({ currentRound }: { currentRound: 1 | 2 | 3 }) {
  return (
    <div className="flex items-start gap-3 sm:gap-6">
      {ROUND_STEPS.map((step, i) => {
        const active = i + 1 <= currentRound;
        const done = i + 1 < currentRound;
        return (
          <Fragment key={step.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center">
                <span
                  className="relative z-10 -mr-2 w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  style={active ? { background: '#F59C36', border: '1px solid #A65B1D' } : { background: '#C8BBA8' }}
                >
                  {done ? <Check size={15} strokeWidth={3} /> : step.num}
                </span>
                <span className="w-14 h-14 rounded-full bg-[#FDEBCF] flex items-center justify-center shadow-[0_2px_6px_rgba(120,70,20,0.12)]">
                  <img src={step.img} alt="" className="w-10 h-10 object-contain" />
                </span>
              </div>
              <span className={`text-base leading-none ${active ? 'font-medium text-[#3F3A35]' : 'text-[#8C847B]'}`}>
                {step.label}
              </span>
            </div>
            {i < ROUND_STEPS.length - 1 && (
              <span className="text-lg text-[#F2A65A] mt-[16px]" aria-hidden>
                →
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

type PanelPlayer = CCPlayerSidebarEntry & {
  colorIndex: number;
  status: 'available' | 'submitting' | 'submitted' | 'offline';
  timer?: string;
};

const PLAYER_STATUS: Record<PanelPlayer['status'], { label: string; color: string }> = {
  available: { label: 'Available', color: '#2CC48E' },
  submitted: { label: 'Submitted', color: '#2CC48E' },
  submitting: { label: 'Submitting', color: '#DB6D13' },
  offline: { label: 'Offline', color: '#A99E92' },
};

function PlayersPanel({ players, roleLabel }: { players: PanelPlayer[]; roleLabel: string }) {
  return (
    <div
      className="h-full flex flex-col rounded-[20px] border border-[#E8CBA6] px-6 pt-7 pb-6 lg:min-h-[600px]"
      style={{ background: 'linear-gradient(165deg, #FEE7CB 0%, #FDE0B9 100%)' }}
    >
      <h3 className="text-[22px] font-semibold text-[#2E2A26]">Players</h3>

      <div className="mt-5 space-y-2.5">
        {players.map((p) => {
          const st = PLAYER_STATUS[p.status];
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-[10px] bg-[#FFF6EA]/75 px-2.5 py-2">
              <AliasAvatar name={p.name} colorIndex={p.colorIndex} size={46} />
              <div className="min-w-0 flex-1">
                <p className="text-base text-[#3F3A35] truncate">
                  {p.name}
                  {p.isYou ? ' (You)' : ''}
                </p>
                <p className="flex items-center gap-1.5 text-[13px] font-medium mt-0.5" style={{ color: st.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                  {st.label}
                </p>
              </div>
              {p.timer && <span className="text-base tabular-nums text-[#BC7532] shrink-0">{p.timer}</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-[10px] border border-[#F5D7AE] bg-[#FFF0DC]/70 px-4 py-3 flex items-center gap-3">
          <img src={maskGroup} alt="" className="w-[35px] h-[35px] object-contain shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[13px] text-[#5c5c5c]">Your Role</p>
            <p className="text-xl font-bold text-[#592e16] uppercase leading-tight mt-0.5">{roleLabel}</p>
            <p className="text-[13px] text-[#5c5c5c] leading-snug mt-1">Work with your team to win.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Just now" / "3 minutes ago" / "1 hour ago" for the step history. */
function timeAgo(iso: string | null | undefined, nowMs: number): string {
  if (!iso) return '';
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return '';
  const mins = Math.floor(Math.max(0, nowMs - at) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

function ActivityPanel({
  currentRound,
  items,
  colorFor,
  round3Recap,
}: {
  currentRound: 1 | 2 | 3;
  items: CCActivityItem[];
  colorFor: (name: string, fallback: number) => number;
  /** Round 3 only: the hooded-imposter card plus the anonymous Round 2 step history. */
  round3Recap?: { steps: CCCookingStep[]; nowMs: number };
}) {
  return (
    <div
      className="h-full flex flex-col rounded-[20px] border border-[#E9CFB4] px-6 pt-7 pb-6 lg:min-h-[600px]"
      style={{ background: 'linear-gradient(180deg, #FEF3E2 0%, #FFF6E8 100%)' }}
    >
      <h3 className="text-[22px] font-semibold text-[#2E2A26]">Recent Activity</h3>

      {round3Recap ? (
        <div className="mt-5 flex-1 min-h-0 lg:max-h-[500px] overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#898989_transparent]">
          {/* Round 3 */}
          <p className="text-base font-medium text-[#CB7430]">Round 3</p>
          <p className="text-[13px] text-[#737373] mt-2">Work together and Vote out the imposter.</p>
          <div className="mt-4 w-[104px] h-[124px] rounded-lg border border-[#E6DDD0] bg-[#F7EDE2] overflow-hidden">
            <img src={imposterImg} alt="The hidden imposter" className="w-full h-full object-cover object-top" />
          </div>

          <hr className="my-5 border-t border-[#DDD6CC]" />

          {/* Round 2 — the steps, still anonymous */}
          <p className="text-base font-medium text-[#CB7430]">Round 2</p>
          <p className="text-[13px] text-[#737373] leading-relaxed mt-2">
            Step order are assigned automatically.
            <br />
            After all the Step are submitted, only host can Final submit all step.
          </p>
          <div className="mt-4 space-y-2.5">
            {round3Recap.steps.length === 0 ? (
              <p className="text-[13px] text-[#898989]">No steps were submitted.</p>
            ) : (
              round3Recap.steps.map((step) => {
                const ago = timeAgo(step.submitted_at, round3Recap.nowMs);
                return (
                  <div
                    key={step.id}
                    className="flex gap-2.5 rounded-lg border border-[#F6EADB] bg-[#FEF9F2] p-2.5 shadow-[0_1px_3px_rgba(80,50,20,0.05)]"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#969696] border border-[#7E7B78] flex items-center justify-center shrink-0">
                      <UserRound size={18} strokeWidth={1.75} className="text-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap">
                        <span className="text-[15px] font-semibold text-[#CB7430]">Step {step.letter}:</span>
                        <span className="flex items-center gap-1 text-[11px] text-[#5C5C5C]">
                          <Check size={12} strokeWidth={2.5} className="text-[#67AD5B]" />
                          Submitted
                        </span>
                        {ago && <span className="ml-auto text-[11px] text-[#898989]">{ago}</span>}
                      </div>
                      <p className="text-sm text-[#2E2E2E] leading-snug mt-1 break-words">{step.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="text-base text-[#E9883A] mt-3">Round {currentRound}</p>
          <hr className="mt-3 border-t border-[#E1DCD2]" />

          {items.length === 0 ? (
            <p className="text-sm text-[#8C847B] pt-5">Nothing yet — activity will appear here as your team plays.</p>
          ) : (
            <div className="mt-5 flex-1 min-h-0 lg:max-h-[440px] overflow-y-auto pr-2 space-y-5 [scrollbar-width:thin] [scrollbar-color:#C7BFB4_transparent]">
              {items.map((item, i) => (
                <div key={item.id} className="flex items-start gap-3">
                  <AliasAvatar name={item.name} colorIndex={colorFor(item.name, i)} size={38} />
                  <div className="min-w-0 pt-1.5">
                    <p className="text-[15px] leading-snug text-[#3F3A35] break-words">
                      <span className="text-[#D97A2B]">{item.name}</span> {item.text}
                    </p>
                    {item.time && <p className="text-xs text-[#8C847B] mt-1">{item.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
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
      <div className={`${CENTER_PANEL_CLASS} items-center justify-center p-8 text-center space-y-3`} style={CENTER_PANEL_STYLE}>
        <span className="text-2xl block">✅</span>
        <p className="text-base font-semibold text-[#2CC48E]">Your votes are in!</p>
        <p className="text-sm text-[#6F625A]">Waiting for the rest of your team to vote…</p>
      </div>
    );
  }

  return (
    <div className={`${CENTER_PANEL_CLASS} px-6 sm:px-8 pt-7 pb-6 text-center`} style={CENTER_PANEL_STYLE}>
      <div>
        <h2 className="text-[22px] font-semibold text-[#462A11] leading-tight">Round 1 of 3 – Ingredients Market</h2>
        <h3 className="text-lg font-semibold text-[#2E2A26] mt-1">Vote for Ingredients</h3>
        <p className="text-sm text-[#4A4540] mt-1.5">
          Select {votesPerPlayer} ingredients you think should go into our recipe.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-6">
        {ingredients.map((item) => {
          const isSelected = selectedIngredientIds.has(item.id);
          // At the cap, extra cards aren't dimmed (matches the design) — the
          // toggle itself caps selection, so clicking a non-selected one is a
          // no-op rather than a disabled, greyed-out state.
          const atCap = selectedIngredientIds.size >= votesPerPlayer && !isSelected;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleIngredient(item.id)}
              className={`relative flex flex-col items-center justify-between h-[140px] w-full rounded-lg border px-2 pt-4 pb-3 transition-all duration-150 ease-out cursor-pointer ${
                isSelected
                  ? 'bg-[#FFF8EF] border-[#E2934D] shadow-[0_0_0_0.5px_#E2934D]'
                  : 'bg-[#FDF7F2] border-[#D8D4D1] hover:border-[#E2934D]/60'
              } ${!atCap ? 'hover:-translate-y-0.5' : 'cursor-default'}`}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-[#DB6D11] flex items-center justify-center shadow-sm z-10">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </span>
              )}
              <div className="flex-1 flex items-center justify-center w-full">
                {item.image_url ? (
                  <img src={resolveMediaUrl(item.image_url) ?? item.image_url} alt={item.name} className="max-w-[84px] max-h-[68px] object-contain" />
                ) : (
                  <span className="text-4xl">🥘</span>
                )}
              </div>
              <span className="text-sm font-medium text-[#3F3A35] text-center leading-tight mt-2">{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <span className="text-base font-semibold text-[#2E2A26] whitespace-nowrap">
            Selected {selectedIngredientIds.size}/{votesPerPlayer} ingredients
          </span>
          <button
            onClick={onConfirmVote}
            disabled={selectedIngredientIds.size !== votesPerPlayer || submitting}
            className="w-full sm:max-w-[398px] h-[46px] rounded-full text-white text-[17px] font-medium transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_4px_12px_rgba(243,158,59,0.35)] cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #F39E3B 0%, #F9A548 50%, #F39E3B 100%)' }}
          >
            Confirm Vote
          </button>
        </div>

        <p className="text-sm text-[#5A544E] text-center mt-4">Your actions are anonymous, observe patterns carefully.</p>
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
  turn,
  turnTimerLabel,
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
  turn: CCRound2Turn | null;
  turnTimerLabel: string;
}) {
  const isMyTurn = turn?.is_my_turn ?? false;
  const currentLetter =
    turn?.current_index != null ? String.fromCharCode(65 + turn.current_index) : null;
  const myLetter = turn?.my_turn_index != null ? String.fromCharCode(65 + turn.my_turn_index) : null;
  const myTurnHasPassed =
    turn?.current_index != null && turn.my_turn_index != null && turn.current_index > turn.my_turn_index;
  return (
    <div className={`${CENTER_PANEL_CLASS} p-6 space-y-5`} style={CENTER_PANEL_STYLE}>
      <div className="text-center">
        <h2 className="text-lg font-black text-[#592e16]">Round 2 of 3 — Cooking Step Submission</h2>
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
                <img src={resolveMediaUrl(item.image_url) ?? item.image_url} alt={item.name} className="w-8 h-8 object-contain drop-shadow-xs" />
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
      ) : isMyTurn && !mySubmittedStep ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFEAD1] border border-[#F5CE9E] text-xs font-extrabold text-[#E8881E]">
              ✋ It's your Turn{myLetter ? ` — Step ${myLetter}` : ''}
            </span>
            <span className="text-xs font-bold text-[#8B7355]">
              Time left <span className="font-mono font-black text-[#3D2E1F]">{turnTimerLabel}</span>
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
      ) : mySubmittedStep ? (
        <div className="bg-[#F0FFF0] border border-[#4CAF50]/30 rounded-xl p-5 text-center">
          <span className="text-2xl block mb-1">✅</span>
          <p className="text-xs font-bold text-[#36B37E]">
            Your step has been submitted{myLetter ? ` as Step ${myLetter}` : ''}!
          </p>
          <p className="text-[11px] text-[#8B7355] mt-0.5">
            {currentLetter ? `Step ${currentLetter} is being written now…` : 'Waiting for the other players…'}
          </p>
        </div>
      ) : myTurnHasPassed ? (
        <div className="bg-[#FDECEC] border border-[#F5C6C6] rounded-xl p-5 text-center">
          <span className="text-2xl block mb-1">⌛</span>
          <p className="text-xs font-bold text-[#C0392B]">Your turn ran out.</p>
          <p className="text-[11px] text-[#8B7355] mt-0.5">
            {currentLetter ? `Step ${currentLetter} is being written now…` : 'Waiting for the other players…'}
          </p>
        </div>
      ) : (
        <div className="bg-[#FFF3E0] border border-[#F5CE9E] rounded-xl p-5 text-center space-y-1">
          <span className="text-2xl block mb-1">⏳</span>
          <p className="text-xs font-bold text-[#E8881E]">
            {currentLetter ? `Step ${currentLetter} is being written…` : 'Waiting for the round to start…'}
          </p>
          <p className="text-[11px] text-[#8B7355]">
            {myLetter ? `You're up on Step ${myLetter}. Get your step ready!` : 'Your turn is coming up.'}
          </p>
          <p className="text-[11px] font-mono font-black text-[#3D2E1F] pt-1">{turnTimerLabel}</p>
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
  template,
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
  template: CCTemplate;
}) {
  if (status === 'round3_discussion') {
    return (
      <div className="flex flex-col h-[600px] rounded-[20px] border border-[#F1E2D0] shadow-[0_2px_8px_rgba(80,50,20,0.05)] p-6 space-y-4" style={CENTER_PANEL_STYLE}>
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

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 bg-white/60 rounded-xl border border-[#F5E6D3] p-4">
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
    <div className={`${CENTER_PANEL_CLASS} p-6 text-center space-y-5`}  style={{
         background: `
           radial-gradient(
             ellipse at 50% 0%,
             rgba(253, 227, 194, 0.55) 0%,
             rgba(255, 250, 244, 0) 38%
           ),
           radial-gradient(
             ellipse at 50% 100%,
             rgba(246, 177, 67, 0.12) 0%,
             rgba(255, 250, 244, 0) 42%
           ),
           rgb(255, 250, 244)
         `,
       }}
     >
      <div>
        <h2 className="text-lg font-black text-[#592e16]">Round 3 of 3 – Imposter Voting</h2>
        <p className="text-sm font-semibold text-[#d96e14] mt-2 leading-relaxed max-w-[400px] mx-auto">
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
          <div className="flex items-center justify-center gap-10 flex-wrap py-2">
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
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-white border-2 overflow-hidden transition-all ${
                      isSelected ? 'border-[#E8881E] ring-2 ring-[#E8881E]/30 shadow-lg' : 'border-[#F5E2C8] shadow-xs'
                    }`}
                  >
                    <img
                      src={portraitForRole(player.role_label, template)}
                      alt={player.role_label}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center 0%' }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#6E5A44]">{player.name}</span>
                  <span className="text-[10px] font-semibold text-[#5c5c5c]">{player.role_label}</span>
                </button>
              );
            })}
          </div>
          <br />
          <br />
          <p className="text-xs text-[#5c5c5c] font-medium">Your vote is anonymous.</p>
            <br />
          <br />
          <button
            onClick={onSubmitVote}
            disabled={!selectedVoteId || submitting}
            className="w-full max-w-md mx-auto py-4 rounded-2xl bg-[#f39e3a] hover:bg-[#f39e3a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer block"
          >
            Submit Vote
          </button>
        </>
      )}
    </div>
  );
}
