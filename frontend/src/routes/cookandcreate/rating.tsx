import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { ReviewRatingPage } from './-components/ReviewRatingPage';
import { cookAndCreateService } from '@/api/services/cookandcreate.service';
import type { CCAwardsBoard, CCGameStateResponse, CCOtherDish } from '@/api/types/cookandcreate';
import { getParticipantSession } from '@/lib/participant-session';
import { toastError } from '@/lib/toast';

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

  const groupId = session?.groupId;
  const participantId = session?.participantId;

  const loadAll = useCallback(async () => {
    if (!groupId || !participantId) return;
    try {
      const [state, dishes, board] = await Promise.all([
        cookAndCreateService.getGameState(groupId, participantId),
        cookAndCreateService.getOtherDishes(groupId, participantId).catch(() => ({ dishes: [] })),
        cookAndCreateService.getAwards(groupId).catch(() => null),
      ]);
      setGameState(state);
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

  const handleRate = useCallback(
    async (ratedGroupId: number, categoryId: number) => {
      if (!gameState || !participantId) return;
      try {
        await cookAndCreateService.submitRating({
          instance_id: gameState.instance.id,
          participant_id: participantId,
          rated_group_id: ratedGroupId,
          category_id: categoryId,
        });
        // The rated group drops out of rotation server-side — refresh both
        // the pool and the live award tallies.
        const [dishes, board] = await Promise.all([
          cookAndCreateService.getOtherDishes(groupId!, participantId).catch(() => ({ dishes: [] })),
          cookAndCreateService.getAwards(groupId!).catch(() => null),
        ]);
        setOtherDishes(dishes.dishes);
        setAwards(board);
      } catch (err) {
        toastError(err instanceof Error ? err.message : 'Could not submit that rating.');
      }
    },
    [gameState, participantId, groupId]
  );

  if (loading || !gameState) {
    return (
      <CookCreateLayout breadcrumb="Cook & Create / Results">
        <div className="flex items-center justify-center min-h-[50vh] text-[#8B7355]">Loading results…</div>
      </CookCreateLayout>
    );
  }

  const myId = participantId ? Number(participantId) : null;
  const impostor = gameState.participants.find((p) => p.id === awards?.my_group.impostor_participant_id);
  const mostVoted = gameState.participants.find((p) => p.id === awards?.my_group.most_voted_participant_id);

  return (
    <ReviewRatingPage
      dishName={gameState.instance.dish_name || awards?.my_group.dish_name || 'Your dish'}
      groupWon={awards?.my_group.group_won ?? gameState.instance.group_won}
      impostorName={impostor ? (impostor.isYou ? 'You' : impostor.name) : null}
      mostVotedName={mostVoted ? (mostVoted.isYou ? 'You' : mostVoted.name) : null}
      ratingCategories={gameState.rating_categories}
      otherDishes={otherDishes}
      onRate={handleRate}
      awardEntries={awards?.groups ?? []}
      myGroupId={gameState.instance.group_id}
      myParticipantId={myId}
    />
  );
}
