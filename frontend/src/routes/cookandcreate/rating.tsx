import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { ReviewRatingPage } from './-components/ReviewRatingPage';
import { clockOffsetMs } from './-components/clock';
import { cookAndCreateService } from '@/api/services/cookandcreate.service';
import type { CCAwardsBoard, CCGameStateResponse, CCOtherDish } from '@/api/types/cookandcreate';
import { getParticipantSession } from '@/lib/participant-session';
import { toastError } from '@/lib/toast';

import a from '../../assets/cookandcreate/rating-icon/a.png';
import b from '../../assets/cookandcreate/rating-icon/b.png';
import c from '../../assets/cookandcreate/rating-icon/c.png';
import d from '../../assets/cookandcreate/rating-icon/d.png';
import e from '../../assets/cookandcreate/rating-icon/e.png';


export const Route = createFileRoute('/cookandcreate/rating')({
  component: RatingPage,
});

function RatingPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const [gameState, setGameState] = useState<CCGameStateResponse | null>(null);
  const [otherDishes, setOtherDishes] = useState<CCOtherDish[]>([]);
  const [awards, setAwards] = useState<CCAwardsBoard | null>(null);
  const [loading, setLoading] = useState(true);
  // Browser-to-server clock correction for the header's Game Time.
  const [clockOffset, setClockOffset] = useState(0);

  const groupId = session?.groupId;
  const participantId = session?.participantId;

  const loadAll = useCallback(async () => {
    if (!groupId || !participantId) return;
    try {
      const [state, dishes, board] = await Promise.all([
        cookAndCreateService.getGameState(groupId, participantId),
        cookAndCreateService.getOtherDishes(groupId, participantId).catch(() => ({ dishes: [] })),
        // The awards board is gated server-side (403 until every review is done),
        // so this stays null until the player has unlocked it.
        cookAndCreateService.getAwards(groupId, participantId).catch(() => null),
      ]);
      setGameState(state);
      setClockOffset(clockOffsetMs(state.schedule, Date.now()));
      setOtherDishes(dishes.dishes);
      setAwards(board);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not load results.');
    } finally {
      setLoading(false);
    }
  }, [groupId, participantId]);

  useEffect(() => {
    if (!groupId || !participantId) {
      navigate({ to: '/' });
      return;
    }
    loadAll();
  }, [groupId, participantId, navigate, loadAll]);

  // A game still in progress shouldn't be here — send them back to it.
  useEffect(() => {
    if (gameState && gameState.instance.status !== 'completed') {
      navigate({ to: '/cookandcreate/game' });
    }
  }, [gameState, navigate]);

  // A review is one atomic submission — a 1–5 star rating AND an emoji reaction,
  // sent together, once per dish. After it saves we re-pull everything so the
  // dish card flips to its read-only state and, if this was the last required
  // dish, the protected left results unlock. The dish is never removed.
  const handleRate = useCallback(
    async (ratedGroupId: number, review: { categoryId: number; stars: number }) => {
      if (!gameState || !participantId) return;
      try {
        await cookAndCreateService.submitRating({
          instance_id: gameState.instance.id,
          participant_id: participantId,
          rated_group_id: ratedGroupId,
          category_id: review.categoryId,
          stars: review.stars,
        });
        await loadAll();
      } catch (err) {
        toastError(err instanceof Error ? err.message : 'Could not submit that rating.');
        // Re-sync in case the dish was already rated elsewhere (e.g. another tab),
        // so the card settles into its correct read-only state.
        await loadAll();
      }
    },
    [gameState, participantId, loadAll]
  );

  if (loading || !gameState) {
    return (
      <CookCreateLayout maxWidthClass="max-w-[1376px]">
        <div className="flex items-center justify-center min-h-[50vh] text-[#8B7355]">Loading results…</div>
      </CookCreateLayout>
    );
  }

  // The left column's protected results (Recipe Reveal / Imposter / Fun Awards)
  // are masked until `reviews_complete` (the backend's own verdict). Rating of
  // every other kitchen happens in the always-visible right column.
  const myId = participantId ? Number(participantId) : null;
  const impostor = gameState.participants.find((p) => p.id === awards?.my_group.impostor_participant_id);
  const mostVoted = gameState.participants.find((p) => p.id === awards?.my_group.most_voted_participant_id);

  // Only surfaced to the one participant who was actually offered Double Down
  // and chose to use it — everyone else's `my_group` outcome fields describe
  // the same event, but it isn't theirs to see.
  const iAmDoubleDown = myId != null && myId === awards?.my_group.double_down_participant_id;
  const doubleDownOutcome =
    iAmDoubleDown && awards?.my_group.double_down_used
      ? { penaltyApplied: awards.my_group.double_down_penalty_applied }
      : null;

  return (
    <ReviewRatingPage
      dishName={gameState.instance.dish_name || awards?.my_group.dish_name || 'Your dish'}
      groupWon={awards?.my_group.group_won ?? gameState.instance.group_won}
      impostor={impostor ? { name: impostor.isYou ? 'You' : impostor.name, roleLabel: impostor.role_label } : null}
      mostVoted={mostVoted ? { name: mostVoted.isYou ? 'You' : mostVoted.name, roleLabel: mostVoted.role_label } : null}
      reactionCounts={awards?.my_group.reaction_counts ?? {}}
      averageRating={awards?.my_group.average_rating ?? null}
      ratingCount={awards?.my_group.rating_count ?? 0}
      ratingCategories={gameState.rating_categories}
      awardEntries={awards?.groups ?? []}
      otherDishes={otherDishes}
      reviewsComplete={gameState.reviews_complete}
      onRate={handleRate}
      myGroupId={gameState.instance.group_id}
      template={gameState.template}
      doubleDownOutcome={doubleDownOutcome}
      participantName={gameState.participants.find((p) => p.isYou)?.name ?? session?.name}
      gameEndsAt={gameState.schedule.game_ends_at}
      clockOffsetMs={clockOffset}
    />
  );
}
