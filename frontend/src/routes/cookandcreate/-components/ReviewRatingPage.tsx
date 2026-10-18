import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Star, Check } from 'lucide-react';
import { CookCreateLayout } from './CookCreateLayout';
import type { CCAwardEntry, CCOtherDish, CCRatingCategory, CCTemplate } from '@/api/types/cookandcreate';
import { clearParticipantSession } from '@/lib/participant-session';
import { disconnectSocket } from '@/lib/socket';
import { portraitForRole } from './portraits';
import masterchefTeamImg from '../../../assets/cookandcreate/great_job_masterchef_team.jpg';
import otherKitchenDishImg from '../../../assets/cookandcreate/left-comman.png';
import imposterImg from '../../../assets/cookandcreate/imposter 1.png';
import imposterIcon from '../../../assets/cookandcreate/imposter-icon.png';

import logoImg from '../../../assets/cookandcreate/Cook  and Create Logo.png';

import a from '../../../assets/cookandcreate/rating-icon/a.png';
import b from '../../../assets/cookandcreate/rating-icon/b.png';
import c from '../../../assets/cookandcreate/rating-icon/c.png';
import d from '../../../assets/cookandcreate/rating-icon/d.png';
import e from '../../../assets/cookandcreate/rating-icon/e.png';

interface ReviewRatingPageProps {
  dishName: string;
  groupWon: boolean | null;
  impostor: { name: string; roleLabel: string } | null;
  mostVoted: { name: string; roleLabel: string } | null;
  /** This group's own received reactions, per category slug. */
  reactionCounts: Record<string, number>;
  /** This group's average 1–5 star rating received (null when none yet). */
  averageRating: number | null;
  /** How many star ratings the average is based on. */
  ratingCount: number;
  ratingCategories: CCRatingCategory[];
  awardEntries: CCAwardEntry[];
  /** Other teams' dishes still awaiting this player's review. The list is
   *  server-derived (a dish drops out once it has BOTH a star rating and an
   *  emoji reaction), so it stays correct after a refresh or reconnect. */
  otherDishes: CCOtherDish[];
  /** Backend truth: has this player finished every required review? This — not
   *  the local pool — is what unlocks the protected left section. */
  reviewsComplete: boolean;
  /** Submit a complete review for another team's dish: a 1–5 star rating AND an
   *  emoji reaction, together, once. */
  onRate: (ratedGroupId: number, review: { categoryId: number; stars: number }) => void | Promise<void>;
  myGroupId: number;
  /** For the role portraits in the impostor reveal. */
  template: CCTemplate;
  /** Only set when THIS participant was the one offered Double Down and accepted it. */
  doubleDownOutcome: { penaltyApplied: boolean } | null;
  /** Header: the player's own name and the session clock (other kitchens may still be cooking). */
  participantName?: string;
  gameEndsAt?: string | null;
  clockOffsetMs?: number;
}

/* Cook & Create results palette (from the design). */
const ORANGE = '#CB7430';
const HEADING = '#53301B';
const CARD_STYLE = { background: 'linear-gradient(180deg, #FFFEFD 0%, #FEF7EF 100%)' };
const PEACH_STYLE = { background: 'linear-gradient(180deg, #F8D5B0 0%, #FAE3C6 100%)' };

/* The five reaction face icons, in rating-category order (a = 1st category …
   e = 5th). Used for both the "Reactions" grid and the "Give Rating" grid so
   the same face always represents the same category. */
const RATING_ICONS = [a, b, c, d, e];
// Cycle through the five faces by position, so with more than five rating
// categories the extra cards keep getting varied faces (a, b, c, d, e, a, …)
// instead of all falling back to the last icon.
const ratingIconFor = (index: number) => RATING_ICONS[((index % RATING_ICONS.length) + RATING_ICONS.length) % RATING_ICONS.length];

/* Short reaction labels shown under each face in the "Reactions" section (the
   full category names are used in the "Give Rating" section), matched to the
   categories by order. */
const REACTION_LABELS = ['Delicious!', 'Creative!', 'Funny!', 'What is this?!', 'Yikes!'];

/* "N Voted …" wording for a dish's most-picked reaction, matched to the
   categories by order (e.g. "8 Voted Most Delicious"). */
const MOST_VOTED_LABELS = ['Most Delicious', 'Most Creative', 'Funniest', 'Most Confusing', 'Biggest Yikes'];

/* Fixed labels under the five faces in each dish's "Give Rating" grid (from the
   design), matched to the categories by order. */
const GIVE_RATING_LABELS = [
  'Would Actually Eat This',
  'Smartest Ingredient Use',
  'Too Spicy to Handle',
  'Taste Buds Destroyer',
  'Science Experiment Gone Wrong',
];

function formatRemaining(endsAt: string | null | undefined, offsetMs: number): string {
  if (!endsAt) return '--:--';
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return '--:--';
  const secs = Math.max(0, Math.round((end - (Date.now() + offsetMs)) / 1000));
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
}

/** Same header as the game screen, plus Exit to Lobby; the clock ticks on its own. */
function ResultsHeader({
  participantName = 'Participant',
  gameEndsAt,
  clockOffsetMs = 0,
  onExit,
}: {
  participantName?: string;
  gameEndsAt?: string | null;
  clockOffsetMs?: number;
  onExit: () => void;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!gameEndsAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameEndsAt]);

  const words = participantName.trim().split(/\s+/).filter(Boolean);
  const initials =
    (words.length > 1 ? words[0][0] + words[1][0] : participantName.trim().slice(0, 2)).toUpperCase() || 'P';

  return (
    <div className="w-full bg-white rounded-[20px] border border-[#E8E7E3] px-5 py-[13px] flex items-center justify-between gap-4 shadow-[0_2px_8px_rgba(80,50,20,0.04)]">
      <div className="flex items-center gap-3 min-w-0">
        <img src={logoImg} alt="Cook & Create" className="w-11 h-11 object-contain shrink-0" />
        <span className="text-[22px] font-semibold text-[#2E2A26] whitespace-nowrap">Cook &amp; Create</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={onExit}
          className="h-10 px-5 sm:px-7 rounded-full text-white text-[15px] font-medium whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_12px_rgba(231,162,79,0.35)] cursor-pointer"
          style={{ background: 'linear-gradient(180deg, #EDAA5C 0%, #E39A44 100%)' }}
        >
          Exit to Lobby
        </button>
        <div className="hidden md:flex items-center gap-4 rounded-lg border border-[#F1E3D5] bg-[#FDF6EE] px-4 py-2.5">
          <span className="text-[15px] text-[#4A4540]">Game Time</span>
          <span className="text-xl font-bold text-[#2E2A26] tabular-nums leading-none">
            {formatRemaining(gameEndsAt, clockOffsetMs)}
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

export function ReviewRatingPage({
  dishName,
  groupWon,
  impostor,
  mostVoted,
  reactionCounts,
  averageRating,
  ratingCount,
  ratingCategories,
  awardEntries,
  otherDishes,
  reviewsComplete,
  onRate,
  template,
  doubleDownOutcome,
  participantName,
  gameEndsAt,
  clockOffsetMs,
}: ReviewRatingPageProps) {
  const navigate = useNavigate();

  // The left results always render in their normal Figma layout (no lock
  // screens). The protected VALUES — imposter identity, award winners, the
  // average rating and reaction counts — come only from getAwards, which the
  // backend returns a 403 for until every required dish has been rated, so they
  // stay empty until then and can't be revealed early by refresh or direct URL.
  // Progress across every other kitchen's dish (right-column counter).
  const totalOther = otherDishes.length;
  const ratedCount = otherDishes.filter((d) => d.my_stars != null && d.my_category_id != null).length;

  const exitToHome = () => {
    disconnectSocket();
    clearParticipantSession();
    navigate({ to: '/' });
  };

  // Reactions this dish received — the five categories in order, each with its
  // face icon, short label and real received count (greyed when still 0 so the
  // section always matches the design).
  const reactionCards = ratingCategories.slice(0, 5).map((cat, i) => ({
    id: cat.id,
    icon: ratingIconFor(i),
    label: REACTION_LABELS[i] ?? cat.name,
    count: reactionCounts[cat.slug] ?? 0,
  }));
  const hasReactions = reactionCards.some((r) => r.count > 0);

  // Fun Awards: which group won each category (real, from the board — ranked by
  // average received star rating on the backend). Always show the actual group
  // name, including your own; cards with no winner yet render greyed.
  const winnerBySlug: Record<string, string> = {};
  for (const g of awardEntries) {
    for (const a of g.awards) {
      if (!winnerBySlug[a.slug]) winnerBySlug[a.slug] = g.group_name;
    }
  }
  const funAwards = ratingCategories.slice(0, 5).map((c) => ({
    ...c,
    winner: winnerBySlug[c.slug] ?? null,
  }));

  return (
    <CookCreateLayout maxWidthClass="max-w-[1376px]">
      <div className="relative z-10">
        <ResultsHeader
          participantName={participantName}
          gameEndsAt={gameEndsAt}
          clockOffsetMs={clockOffsetMs}
          onExit={exitToHome}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.68fr)_minmax(0,1fr)] gap-5 items-stretch">
          {/* LEFT — protected results; revealed only after every other dish is rated */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* Recipe Reveal + Ratings & Reaction (headings stay; the protected
                content is masked until every other dish is rated) */}
            <div className="rounded-[16px] border border-[#F5DFC0] p-5 sm:p-6" style={CARD_STYLE}>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
                {/* Recipe Reveal — dish name + a fixed-size static celebration image */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold" style={{ color: HEADING }}>Recipe Reveal</h3>
                  <p className="text-[13px] text-[#4A4540] mt-5">Your group cooked up...</p>
                  <p className="text-[15px] font-semibold mt-1" style={{ color: ORANGE }}>{dishName}</p>
                  <img
                    src={masterchefTeamImg}
                    alt="Great job, MasterChef team!"
                    className="mt-4 mx-auto w-[290px] max-w-full h-[233px] rounded-xl object-cover"
                  />
                </div>

                {/* Ratings & Reaction */}
                <div className="text-center flex flex-col">
                  <h3 className="text-lg font-semibold" style={{ color: HEADING }}>Ratings &amp; Reaction</h3>
                  <p className="text-[13px] text-[#4A4540] leading-relaxed mt-5 max-w-[230px] mx-auto">
                    The verdict is in. Other teams have tasted your creation.
                  </p>

                  {/* Average 1–5 star rating this dish received from other teams */}
                  <p className="text-[13px] text-[#4A4540] mt-4">Average Rating Received Dish</p>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = averageRating != null && n <= Math.round(averageRating);
                      return (
                        <Star
                          key={n}
                          size={30}
                          className={filled ? 'text-[#E7A24F]' : 'text-[#E3D7C7]'}
                          fill={filled ? '#F2B45E' : '#EFE6DA'}
                          strokeWidth={1.25}
                        />
                      );
                    })}
                    <span className={`ml-2 text-lg font-semibold ${averageRating != null ? 'text-[#CB7430]' : 'text-[#B8A898]'}`}>
                      {averageRating != null ? averageRating.toFixed(1) : '—'}
                      <span className="text-xs font-normal">/5</span>
                    </span>
                  </div>
                  {averageRating != null && (
                    <p className="text-[11px] text-[#A99E92] mt-1">
                      from {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
                    </p>
                  )}

                  {/* Reactions */}
                  <p className="text-[13px] text-[#4A4540] mt-6 mb-2">Reactions</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {reactionCards.map((r) => (
                      <div
                        key={r.id}
                        className={`flex flex-col items-center rounded-lg border border-[#F1E2D0] bg-[#FDF6ED] px-1 pt-2.5 pb-2 ${
                          r.count === 0 ? 'opacity-45' : ''
                        }`}
                      >
                        <img src={r.icon} alt={r.label} className="w-8 h-8 object-contain" />
                        <span className="text-[10px] text-[#3F3A35] leading-tight text-center mt-1.5 min-h-[25px] flex items-center">
                          {r.label}
                        </span>
                        <span className="text-base font-semibold mt-1" style={{ color: ORANGE }}>{r.count}</span>
                      </div>
                    ))}
                  </div>
                  {!hasReactions && (
                    <p className="text-[11px] text-[#A99E92] mt-2">No reactions yet — other teams are still tasting.</p>
                  )}

                  {doubleDownOutcome && (
                    <div
                      className={`mx-auto mt-4 max-w-[280px] rounded-lg px-3 py-2 border ${
                        doubleDownOutcome.penaltyApplied
                          ? 'bg-[#FDECEC] border-[#F5C6C6]'
                          : 'bg-[#EAF7EE] border-[#BEE6C9]'
                      }`}
                    >
                      <p className={`font-semibold text-xs ${doubleDownOutcome.penaltyApplied ? 'text-[#C0392B]' : 'text-[#1E8449]'}`}>
                        ⚡ Double Down —{' '}
                        {doubleDownOutcome.penaltyApplied ? 'Wrong guess: -50 points' : 'Correct guess: no penalty!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Impostor reveal + Fun Awards */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5 flex-1">
              {/* The Impostor has been unmarked */}
              <div className="flex flex-col rounded-[16px] border border-[#F4D1A5] p-5 sm:p-6" style={PEACH_STYLE}>
                <h3 className="text-lg font-semibold text-center" style={{ color: HEADING }}>
                  The Impostor has been unmarked
                </h3>
                

                {/* The ACTUAL impostor — the player assigned the Impostor role
                    when the Secret Box was opened. Shown as soon as the completed
                    game's state loads (before any rating). Left: the reveal text,
                    their real name and the red-devil icon. Right: the hooded
                    impostor overlapping the player's own chef portrait, with their
                    name and role. A short placeholder covers the brief load so the
                    section is never blank. */}
                {impostor ? (
                  <div className="flex-1 mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                    {/* Left — reveal text, impostor's name, red-devil icon */}
                    <div className="text-center">
                      <p className="text-[18px] font-semibold leading-snug" style={{ color: ORANGE }}>
                        The mask is off.
                        <br />
                        The impostor all along was
                      </p>
                      <p className="text-[18px] font-semibold text-[#3F2B20] mt-0.5 break-words">{impostor.name}</p>
                      <img src={imposterIcon} alt="" aria-hidden className="w-14 h-14 object-contain mt-5 mx-auto" />
                    </div>

                    {/* Right — hooded impostor overlapping the player's chef portrait */}
                    <div className="flex items-end">
                      <div className="relative z-10 -mr-2.5 w-[130px] h-[160px] rounded-[10px] border border-[#F1DCC0] bg-[#F7EDE2] overflow-hidden shadow-[0_2px_8px_rgba(80,50,20,0.12)]">
                        <img src={imposterImg} alt="Impostor" className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="w-[133px] shrink-0 text-center pb-6">
                        <div className="w-[133px] h-[160px] rounded-[10px] border border-[#F1DCC0] bg-[#FFF6EA]/80 overflow-hidden">
                          <img
                            src={portraitForRole(impostor.roleLabel, template)}
                            alt={impostor.name}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: 'center 12%' }}
                          />
                        </div>
                        {/* pl-3 keeps the text clear of the hooded figure, which overlaps this column; long names wrap. */}
                        <p className="pl-3 text-[15px] font-medium leading-snug mt-2 break-words" style={{ color: ORANGE }}>{impostor.name}</p>
                        <p className="pl-3 text-[14px] text-[#3F3A35] mt-0.5 break-words">{impostor.roleLabel}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-center text-[13px] text-[#A99E92]">Revealing the impostor…</p>
                )}
              </div>

              {/* Fun Awards — real category winners; empty slots render greyed */}
              <div className="rounded-[16px] border border-[#F4D1A5] p-5" style={PEACH_STYLE}>
                <h3 className="text-lg font-semibold text-center" style={{ color: HEADING }}>Fun Awards</h3>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  {funAwards.map((a, i) => (
                    <div
                      key={a.id}
                      className={`rounded-lg border border-[#F1DCC0] bg-[#FBF4EB] px-2.5 py-2.5 text-center ${
                        funAwards.length % 2 === 1 && i === funAwards.length - 1 ? 'col-span-2' : ''
                      } ${a.winner ? '' : 'opacity-60'}`}
                    >
                      <p className="text-[13px] font-semibold text-[#3F2B20] leading-tight">{a.name}</p>
                      <p className="text-[11px] text-[#6F625A] mt-0.5">{a.winner ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — What Other Kitchens Cooked Up: always visible. Every other
              kitchen's dish + steps, rated once (star + reaction) then shown
              read-only. The cards are never hidden by the rating gate. */}
          <div className="rounded-[16px] border border-[#F9EAD4] p-5 sm:p-6 min-w-0" style={{ background: 'linear-gradient(180deg, #FFFEFD 0%, #FDF5E9 100%)' }}>
            <div className="text-center">
              <h3 className="text-[22px] font-bold leading-tight" style={{ color: HEADING }}>What Other Kitchens Cooked Up</h3>
              {totalOther > 0 && (
                <span className="mt-1 inline-block text-[11px] font-semibold text-[#9A7B59]">{ratedCount}/{totalOther} rated</span>
              )}
            </div>
            {totalOther === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-[#E7D4BB] bg-[#FBF4EA] px-4 py-10 text-center">
                <span className="text-3xl" aria-hidden>🍽️</span>
                <p className="text-[13px] text-[#6F625A] mt-2">No other kitchens' dishes are available to rate yet.</p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#F1E2CF]">
                {otherDishes.map((dish) => (
                  <DishRatingCard
                    key={dish.group_id}
                    dish={dish}
                    ratingCategories={ratingCategories}
                    onRate={onRate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CookCreateLayout>
  );
}

/** One other kitchen's dish card in the always-visible right column: its name,
 *  image and final recipe steps, plus exactly five star-rating icons and five
 *  reaction cards. Both are required and submitted together, once; afterwards
 *  the same controls stay visible and highlighted but read-only (no second
 *  submission). The card is never removed. */
function DishRatingCard({
  dish,
  ratingCategories,
  onRate,
}: {
  dish: CCOtherDish;
  ratingCategories: CCRatingCategory[];
  onRate: (ratedGroupId: number, review: { categoryId: number; stars: number }) => void | Promise<void>;
}) {
  // A dish is already reviewed once BOTH parts are persisted — then it's locked.
  const alreadyRated = dish.my_stars != null && dish.my_category_id != null;

  // Exactly five reaction options (in their configured order); the star row is
  // always five stars. The star rating and the emoji reaction are two fully
  // independent inputs — picking one NEVER selects or changes the other.
  const reactions = ratingCategories.slice(0, 5);

  // The dish's most-picked reaction so far (first in category order on a tie).
  let topReaction: { icon: string; label: string; count: number } | null = null;
  for (const [i, cat] of reactions.entries()) {
    const count = dish.nomination_counts[cat.slug] ?? 0;
    if (count > 0 && (!topReaction || count > topReaction.count)) {
      topReaction = { icon: ratingIconFor(i), label: MOST_VOTED_LABELS[i] ?? cat.name, count };
    }
  }
  const averageRating = dish.average_rating ?? null;

  const [stars, setStars] = useState<number | null>(dish.my_stars ?? null);
  const [category, setCategory] = useState<number | null>(dish.my_category_id ?? null);
  const [submitting, setSubmitting] = useState(false);

  // Once rated, the saved values are the source of truth for the highlights.
  const selectedStars = alreadyRated ? dish.my_stars : stars;
  const selectedCategory = alreadyRated ? dish.my_category_id : category;
  const canSubmit = !alreadyRated && stars != null && category != null && !submitting;

  const submit = async () => {
    if (stars == null || category == null || submitting) return;
    setSubmitting(true);
    try {
      await onRate(dish.group_id, { categoryId: category, stars });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      {/* Dish header — static dish image, group and dish name */}
      <div className="flex items-center gap-4 rounded-xl border border-[#F5E6D3] bg-[#FFFCF8] p-3">
        <div className="w-[120px] h-[105px] rounded-[10px] bg-[#FAF1E6] overflow-hidden shrink-0">
          <img src={otherKitchenDishImg} alt={dish.dish_name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] text-[#6F625A]">{dish.group_name}</p>
          <p className="mt-1.5 text-[18px] font-semibold text-[#2E2A26] leading-tight break-words">{dish.dish_name}</p>
          {/* Received rating + top reaction — shown only after this player has
              submitted their own review, so it can't sway their vote. */}
          {alreadyRated && (averageRating != null || topReaction) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-1.5">
              {averageRating != null && (
                <span className="inline-flex items-center gap-2">
                  <Star size={24} className="text-[#F5B82E]" fill="#F7C044" strokeWidth={1} />
                  <span className="text-[15px] font-semibold text-[#3F3A35] tabular-nums">{averageRating.toFixed(1)} / 5</span>
                </span>
              )}
              {topReaction && (
                <span className="inline-flex items-center gap-2">
                  <img src={topReaction.icon} alt="" aria-hidden className="w-6 h-6 object-contain" />
                  <span className="text-[15px] text-[#3F3A35]">
                    {topReaction.count} Voted {topReaction.label}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
        {alreadyRated && (
          <span className="shrink-0 self-start inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-bold">
            <Check className="h-3 w-3" /> Rated
          </span>
        )}
      </div>

      {/* The dish's final recipe (its kept steps) */}
      <div className="mt-4 rounded-xl border border-[#F5E6D3] bg-[#FFFCF8] px-4 pt-4 pb-1">
        <h4 className="text-[17px] font-semibold pb-3 border-b border-[#F1E4D6]" style={{ color: ORANGE }}>Game Step</h4>
        {dish.steps.length === 0 ? (
          <p className="text-[13px] text-[#A99E92] py-3">No steps recorded for this dish.</p>
        ) : (
          <div className="divide-y divide-[#F1E4D6]">
            {dish.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <span className="text-[17px] font-semibold w-5 shrink-0 text-center" style={{ color: ORANGE }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <p className="text-[13px] text-[#3F3A35] leading-[1.45]">{s.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating + reaction controls — two independent selections. Picking a star
          never changes the reaction and vice versa; both are required to submit.
          After submission they stay highlighted but read-only; no re-submit. */}
      <div className="mt-5">
        <p className="text-center text-[15px] font-semibold text-[#2E2A26]">Give Rating</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = selectedStars != null && n <= selectedStars;
            return (
              <button
                key={n}
                type="button"
                disabled={alreadyRated}
                aria-label={`Rate ${n} out of 5`}
                onClick={() => setStars(n)}
                className={`p-0.5 ${alreadyRated ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}`}
              >
                <Star
                  size={34}
                  className={on ? 'text-[#F5B82E]' : 'text-[#D6D3CE]'}
                  fill={on ? '#F7C044' : '#DCD9D4'}
                  strokeWidth={1}
                />
              </button>
            );
          })}
          <span className="ml-3 text-[18px] font-semibold text-[#3F3A35] tabular-nums">
            {selectedStars ?? 0} / 5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-5">
          {reactions.map((cat, i) => {
            const isPicked = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                disabled={alreadyRated}
                onClick={() => setCategory(cat.id)}
                title={cat.description ?? cat.name}
                className={`flex flex-col items-center justify-start gap-2 rounded-[10px] border-[1.5px] bg-[#FCF3E8] px-1 pt-3 pb-2.5 text-center transition-colors ${
                  isPicked ? 'border-[#CB7430]' : 'border-[#F3E3CF]'
                } ${alreadyRated ? 'cursor-default' : 'cursor-pointer hover:border-[#CB7430]/60'}`}
              >
                <img src={ratingIconFor(i)} alt={cat.name} className="w-11 h-11 object-contain" />
                <span className="text-[12px] text-[#3F3A35] leading-tight">{GIVE_RATING_LABELS[i] ?? cat.name}</span>
              </button>
            );
          })}
        </div>

        {alreadyRated ? (
          <p className="mt-3 text-center text-[12px] font-semibold text-emerald-600 inline-flex items-center justify-center gap-1 w-full">
            <Check className="h-3.5 w-3.5" /> Submitted — your rating &amp; reaction are saved.
          </p>
        ) : (
          <>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className="mt-4 w-full rounded-full py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(231,162,79,0.35)]"
              style={{ background: 'linear-gradient(180deg, #EDAA5C 0%, #E39A44 100%)' }}
            >
              {submitting ? 'Submitting…' : 'Submit Rating'}
            </button>
            <p className="text-center text-[11px] text-[#9A7B59] mt-1.5">
              {stars == null || category == null
                ? 'Select a star rating and a reaction to submit.'
                : 'You can submit once — this cannot be changed later.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
