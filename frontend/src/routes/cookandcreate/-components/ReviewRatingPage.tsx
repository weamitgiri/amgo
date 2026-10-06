import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { CookCreateLayout } from './CookCreateLayout';
import type { CCAwardEntry, CCRatingCategory, CCTemplate } from '@/api/types/cookandcreate';
import { clearParticipantSession } from '@/lib/participant-session';
import { disconnectSocket } from '@/lib/socket';
import { portraitForRole } from './portraits';
import { dishImageFor } from './dishImages';
import imposterImg from '../../../assets/cookandcreate/imposter 1.png';
import logoImg from '../../../assets/cookandcreate/Cook  and Create Logo.png';

interface ReviewRatingPageProps {
  dishName: string;
  groupWon: boolean | null;
  impostor: { name: string; roleLabel: string } | null;
  mostVoted: { name: string; roleLabel: string } | null;
  /** This group's own received reactions, per category slug. */
  reactionCounts: Record<string, number>;
  ratingCategories: CCRatingCategory[];
  awardEntries: CCAwardEntry[];
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

/** A few warm confetti specks around the plate, as in the design. Purely decorative. */
const CONFETTI = [
  { left: '18%', top: '10%', color: '#E8913A', rot: 20 },
  { left: '30%', top: '4%', color: '#7FB24A', rot: -15 },
  { left: '44%', top: '9%', color: '#F2C14E', rot: 35 },
  { left: '57%', top: '3%', color: '#E2614B', rot: 10 },
  { left: '70%', top: '11%', color: '#7FB24A', rot: -30 },
  { left: '82%', top: '6%', color: '#E8913A', rot: 45 },
  { left: '10%', top: '30%', color: '#F2C14E', rot: -20 },
  { left: '88%', top: '28%', color: '#E2614B', rot: 25 },
];

export function ReviewRatingPage({
  dishName,
  groupWon,
  impostor,
  mostVoted,
  reactionCounts,
  ratingCategories,
  awardEntries,
  myGroupId,
  template,
  doubleDownOutcome,
  participantName,
  gameEndsAt,
  clockOffsetMs,
}: ReviewRatingPageProps) {
  const navigate = useNavigate();

  const exitToHome = () => {
    disconnectSocket();
    clearParticipantSession();
    navigate({ to: '/' });
  };

  // Reactions this dish received. When there are none yet we still render the
  // cards (greyed) so the section always looks like the design.
  const withCounts = ratingCategories
    .map((c) => ({ ...c, count: reactionCounts[c.slug] ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  const hasReactions = withCounts.length > 0;
  const reactionCards = hasReactions
    ? withCounts.slice(0, 5)
    : ratingCategories.slice(0, 5).map((c) => ({ ...c, count: 0 }));

  // Fun Awards: which group leads each category (real, from the board). Cards
  // with no winner yet render greyed so the grid always fills.
  const winnerBySlug: Record<string, string> = {};
  for (const g of awardEntries) {
    for (const a of g.awards) {
      if (!winnerBySlug[a.slug]) winnerBySlug[a.slug] = g.group_id === myGroupId ? 'Your team' : g.group_name;
    }
  }
  const funAwards = ratingCategories.slice(0, 6).map((c) => ({
    ...c,
    winner: winnerBySlug[c.slug] ?? null,
  }));

  // Every team's dish and awards — other kitchens first, yours last.
  const kitchens = [...awardEntries].sort(
    (a, b) => Number(a.group_id === myGroupId) - Number(b.group_id === myGroupId)
  );

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
          {/* LEFT */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* Recipe Reveal + Ratings & Reaction */}
            <div className="rounded-[16px] border border-[#F5DFC0] p-5 sm:p-6" style={CARD_STYLE}>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
                {/* Recipe Reveal — dish name + a plate illustration (keyed to the group) */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold" style={{ color: HEADING }}>Recipe Reveal</h3>
                  <p className="text-[13px] text-[#4A4540] mt-5">Your group cooked up...</p>
                  <p className="text-[15px] font-semibold mt-1" style={{ color: ORANGE }}>{dishName}</p>
                  <div className="relative mt-4 rounded-xl border border-[#F1E4D3] bg-[#FAF4ED] px-4 pt-8 pb-4">
                    {CONFETTI.map((c, i) => (
                      <span
                        key={i}
                        aria-hidden
                        className="absolute w-1.5 h-1.5 rounded-[1px]"
                        style={{ left: c.left, top: c.top, background: c.color, transform: `rotate(${c.rot}deg)` }}
                      />
                    ))}
                    <img
                      src={dishImageFor(myGroupId)}
                      alt={dishName}
                      className="relative mx-auto w-full max-w-[260px] max-h-[170px] object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Ratings & Reaction */}
                <div className="text-center flex flex-col">
                  <h3 className="text-lg font-semibold" style={{ color: HEADING }}>Ratings &amp; Reaction</h3>
                  <p className="text-[13px] text-[#4A4540] leading-relaxed mt-5 max-w-[230px] mx-auto">
                    The verdict is in. Other teams have tasted your creation.
                  </p>

                  {/* Average rating (no star data yet → shown disabled) */}
                  <p className="text-[13px] text-[#4A4540] mt-4">Average Rating Received Dish</p>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={30} className="text-[#E3D7C7]" fill="#EFE6DA" strokeWidth={1.25} />
                    ))}
                    <span className="ml-2 text-lg font-semibold text-[#B8A898]">
                      —<span className="text-xs font-normal">/5</span>
                    </span>
                  </div>

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
                        <span className="text-[26px] leading-none">{r.emoji}</span>
                        <span className="text-[10px] text-[#3F3A35] leading-tight text-center mt-1.5 min-h-[25px] flex items-center">
                          {r.name}
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
              <div className="rounded-[16px] border border-[#F4D1A5] p-5 sm:p-6" style={PEACH_STYLE}>
                <h3 className="text-lg font-semibold text-center" style={{ color: HEADING }}>
                  The Impostor has been unmarked
                </h3>
                <p className="text-center text-[13px] font-medium mt-1" style={{ color: ORANGE }}>
                  {groupWon === true
                    ? '🎉 You caught the impostor!'
                    : groupWon === false
                      ? '😈 The impostor escaped'
                      : 'Game complete'}
                </p>

                {mostVoted && (
                  <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                    <div className="text-center">
                      <p className="text-[15px] font-semibold leading-snug" style={{ color: ORANGE }}>
                        The group has spoken.
                        <br />
                        The most suspected player is
                      </p>
                      <p className="text-[15px] font-semibold text-[#3F2B20] mt-0.5">{mostVoted.name}</p>
                      <span className="text-3xl leading-none block mt-4" aria-hidden>
                        😈
                      </span>
                    </div>
                    <div className="flex items-end">
                      <img
                        src={imposterImg}
                        alt="Suspected"
                        className="relative z-10 -mr-5 w-[84px] h-[100px] object-contain drop-shadow"
                      />
                      <div className="text-center">
                        <div className="w-[80px] h-[100px] rounded-[10px] border border-[#F1DCC0] bg-[#FFF6EA]/80 overflow-hidden">
                          <img
                            src={portraitForRole(mostVoted.roleLabel, template)}
                            alt={mostVoted.name}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: 'center 12%' }}
                          />
                        </div>
                        <p className="text-xs font-medium mt-1" style={{ color: ORANGE }}>{mostVoted.name}</p>
                        <p className="text-[11px] text-[#3F3A35]">{mostVoted.roleLabel}</p>
                      </div>
                    </div>
                  </div>
                )}

                {impostor && (
                  <p className="mt-5 text-center text-[13px] text-[#53301B]">
                    The impostor was <span className="font-semibold" style={{ color: ORANGE }}>{impostor.name}</span>
                  </p>
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

          {/* RIGHT — every kitchen's dish and the awards it picked up */}
          <div className="rounded-[16px] border border-[#F9EAD4] p-5 sm:p-6 min-w-0" style={{ background: 'linear-gradient(180deg, #FFFEFD 0%, #FDF5E9 100%)' }}>
            <h3 className="text-lg font-semibold text-center" style={{ color: HEADING }}>What Other Kitchens Cooked Up</h3>
            {kitchens.length === 0 ? (
              <p className="text-[13px] text-[#6F625A] text-center mt-5">
                Awards will appear here as more teams finish and cast their nominations.
              </p>
            ) : (
              <div className="space-y-3 mt-5">
                {kitchens.map((g) => (
                  <div
                    key={g.group_id}
                    className="flex items-center gap-3 rounded-xl border border-[#F1E4D6] bg-[#FFFDF9] p-2.5"
                  >
                    <div className="w-16 h-16 rounded-lg bg-[#FAF4ED] overflow-hidden shrink-0">
                      <img src={dishImageFor(g.group_id)} alt={g.dish_name ?? g.group_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#6F625A]">
                        {g.group_name}
                        {g.group_id === myGroupId ? ' (You)' : ''}
                      </p>
                      <p className="text-[15px] font-semibold text-[#2E2A26] truncate">{g.dish_name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {g.awards.length === 0 ? (
                          <span className="text-[11px] text-[#A99E92]">No awards yet</span>
                        ) : (
                          g.awards.map((a) => (
                            <span
                              key={a.category_id}
                              title={a.category_name}
                              className="text-[11px] bg-[#FBEBD6] border border-[#F1D6B4] rounded-full px-2 py-0.5"
                            >
                              {a.emoji}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CookCreateLayout>
  );
}
