import { useNavigate } from '@tanstack/react-router';
import { CookCreateLayout } from './CookCreateLayout';
import type { CCAwardEntry, CCRatingCategory, CCTemplate } from '@/api/types/cookandcreate';
import { clearParticipantSession } from '@/lib/participant-session';
import { disconnectSocket } from '@/lib/socket';
import { dishImageFor } from './dishImages';
import { portraitForRole } from './portraits';
import imposterImg from '../../../assets/cookandcreate/imposter 1.png';

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
}

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
}: ReviewRatingPageProps) {
  const navigate = useNavigate();
  const myEntry = awardEntries.find((g) => g.group_id === myGroupId);

  const exitToHome = () => {
    disconnectSocket();
    clearParticipantSession();
    navigate({ to: '/' });
  };

  // Reactions this dish received (real nomination counts), highest first.
  const reactions = ratingCategories
    .map((c) => ({ ...c, count: reactionCounts[c.slug] ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Results">
      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="w-full bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#F0E4D4] shadow-sm">
          <span className="text-xl font-black text-[#3D2E1F]">Cook &amp; Create</span>
          <button
            onClick={exitToHome}
            className="px-5 py-2 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            Exit to Home
          </button>
        </div>

        {/* Recipe Reveal + Ratings & Reaction */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#F0DECA] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recipe Reveal */}
            <div className="text-center">
              <h3 className="text-[17px] font-black text-[#5C432E] mb-1">Recipe Reveal</h3>
              <p className="text-[11px] font-medium text-[#8B7355] mb-2 mt-3">Your group cooked up...</p>
              <p className="text-base font-black text-[#E8881E] mb-4">{dishName}</p>
              <div className="rounded-xl overflow-hidden border border-[#F0E4D4] shadow-sm bg-[#FAF6F0]">
                <img src={dishImageFor(myGroupId)} alt={dishName} className="w-full h-48 object-cover" />
              </div>
            </div>

            {/* Ratings & Reaction */}
            <div className="text-center">
              <h3 className="text-[17px] font-black text-[#5C432E] mb-1">Ratings &amp; Reaction</h3>
              <p className="text-[12px] text-[#8B7355] mb-4 mt-3">
                The verdict is in. Other teams have tasted your creation.
              </p>

              {reactions.length === 0 ? (
                <p className="text-xs text-[#B8A898] py-6">
                  No reactions yet — other teams are still tasting your dish.
                </p>
              ) : (
                <>
                  <p className="text-[11px] font-bold text-[#8B7355] mb-1">Reactions received</p>
                  <p className="text-3xl font-black text-[#E8881E] mb-4">{totalReactions}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {reactions.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-col items-center bg-white rounded-xl border border-[#F0DECA] px-3 py-2 min-w-[72px]"
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <span className="text-[9px] font-bold text-[#8B7355] leading-tight text-center mt-1">{r.name}</span>
                        <span className="text-sm font-black text-[#E8881E]">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {doubleDownOutcome && (
                <div
                  className={`mx-auto mt-4 max-w-[280px] rounded-xl px-3 py-2 border ${
                    doubleDownOutcome.penaltyApplied
                      ? 'bg-[#FDECEC] border-[#F5C6C6]'
                      : 'bg-[#EAF7EE] border-[#BEE6C9]'
                  }`}
                >
                  <p className={`font-black text-xs ${doubleDownOutcome.penaltyApplied ? 'text-[#C0392B]' : 'text-[#1E8449]'}`}>
                    ⚡ Double Down —{' '}
                    {doubleDownOutcome.penaltyApplied ? 'Wrong guess: -50 points' : 'Correct guess: no penalty!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Impostor reveal + Fun Awards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* The Impostor has been unmarked */}
          <div className="bg-[#F8DEBC] rounded-2xl border border-[#F0D0A5] p-6 shadow-sm">
            <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-1">The Impostor has been unmarked</h3>
            <p className="text-center text-sm font-bold text-[#E8881E] mb-5">
              {groupWon === true
                ? '🎉 You caught the impostor!'
                : groupWon === false
                  ? '😈 The impostor escaped'
                  : 'Game complete'}
            </p>

            {mostVoted && (
              <div className="flex items-end justify-center gap-3">
                <img src={imposterImg} alt="Suspected" className="w-16 h-20 object-contain drop-shadow" />
                <div className="text-center">
                  <img
                    src={portraitForRole(mostVoted.roleLabel, template)}
                    alt={mostVoted.name}
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-[#E8881E] shadow-sm"
                    style={{ objectPosition: 'center 15%' }}
                  />
                  <p className="text-xs font-black text-[#E8881E] mt-1">{mostVoted.name}</p>
                  <p className="text-[10px] text-[#8B7355]">{mostVoted.roleLabel}</p>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-1 text-center text-sm text-[#5C432E]">
              {mostVoted && (
                <p>
                  The group's most suspected player is <span className="font-black text-[#3D2E1F]">{mostVoted.name}</span>
                </p>
              )}
              {impostor && (
                <p>
                  The impostor was <span className="font-black text-[#E8881E]">{impostor.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fun Awards — the real award categories this dish won */}
          <div className="bg-[#F8DEBC] rounded-2xl border border-[#F0D0A5] p-6 shadow-sm">
            <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-4">🏆 Fun Awards</h3>
            {!myEntry || myEntry.awards.length === 0 ? (
              <p className="text-xs text-[#5C432E] text-center py-6">No awards yet — nominations are still coming in.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {myEntry.awards.map((a) => (
                  <div key={a.category_id} className="bg-white rounded-xl px-3 py-3 text-center border border-[#F0DECA]">
                    <p className="text-2xl leading-none mb-1">{a.emoji}</p>
                    <p className="text-[11px] font-black text-[#3D2E1F] leading-tight">{a.category_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Final results — every team's dish and awards */}
        <div className="bg-white rounded-2xl border border-[#F0E4D4] p-6 shadow-sm">
          <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-5">🏆 Final Results</h3>
          {awardEntries.length === 0 ? (
            <p className="text-xs text-[#5C432E] text-center">
              Awards will appear here as more teams finish and cast their nominations.
            </p>
          ) : (
            <div className="space-y-2.5">
              {awardEntries.map((g) => (
                <div
                  key={g.group_id}
                  className="bg-[#FFFDF9] rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-[#F0DECA]"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#8B7355]">
                      {g.group_name}
                      {g.group_id === myGroupId ? ' (You)' : ''}
                    </p>
                    <p className="text-sm font-black text-[#3D2E1F] truncate">{g.dish_name}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1 shrink-0">
                    {g.awards.length === 0 ? (
                      <span className="text-[10px] text-[#B8A898]">No awards yet</span>
                    ) : (
                      g.awards.map((a) => (
                        <span
                          key={a.category_id}
                          className="text-[10px] bg-[#FFEAD1] border border-[#F5CE9E] rounded-full px-2 py-0.5"
                        >
                          {a.emoji}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CookCreateLayout>
  );
}
