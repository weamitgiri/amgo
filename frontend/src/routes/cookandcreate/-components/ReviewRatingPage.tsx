import { useNavigate } from '@tanstack/react-router';
import { CookCreateLayout } from './CookCreateLayout';
import type { CCAwardEntry, CCOtherDish, CCRatingCategory } from '@/api/types/cookandcreate';
import { clearParticipantSession } from '@/lib/participant-session';
import { disconnectSocket } from '@/lib/socket';

interface ReviewRatingPageProps {
  dishName: string;
  groupWon: boolean | null;
  impostorName: string | null;
  mostVotedName: string | null;
  ratingCategories: CCRatingCategory[];
  otherDishes: CCOtherDish[];
  onRate: (ratedGroupId: number, categoryId: number) => void;
  awardEntries: CCAwardEntry[];
  myGroupId: number;
  myParticipantId: number | null;
}

export function ReviewRatingPage({
  dishName,
  groupWon,
  impostorName,
  mostVotedName,
  ratingCategories,
  otherDishes,
  onRate,
  awardEntries,
  myGroupId,
}: ReviewRatingPageProps) {
  const navigate = useNavigate();
  const myEntry = awardEntries.find((g) => g.group_id === myGroupId);
  const otherEntries = awardEntries.filter((g) => g.group_id !== myGroupId);

  const exitToHome = () => {
    disconnectSocket();
    clearParticipantSession();
    navigate({ to: '/' });
  };

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

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-4">
            {/* Recipe Reveal + Group Outcome */}
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#F0DECA] p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <h3 className="text-[17px] font-black text-[#5C432E] mb-1">Recipe Reveal</h3>
                  <p className="text-[11px] font-medium text-[#8B7355] mb-2 mt-4">Your group cooked up...</p>
                  <p className="text-base font-black text-[#E8881E] mb-4">{dishName}</p>
                  <div className="rounded-xl overflow-hidden border border-[#F0E4D4] shadow-sm bg-[#FAF6F0] p-6 flex items-center justify-center h-44">
                    <span className="text-5xl">🍽️</span>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <h3 className="text-[17px] font-black text-[#5C432E] mb-4">
                    {groupWon === true ? '🎉 You Caught the Impostor!' : groupWon === false ? '😈 The Impostor Escaped' : 'Game Complete'}
                  </h3>
                  <div className="space-y-3 text-sm text-[#5C432E]">
                    {impostorName && (
                      <p>
                        The Impostor was <span className="font-black text-[#E8881E]">{impostorName}</span>
                      </p>
                    )}
                    {mostVotedName && (
                      <p>
                        The group voted out <span className="font-black text-[#3D2E1F]">{mostVotedName}</span>
                      </p>
                    )}
                    {myEntry && myEntry.awards.length > 0 && (
                      <div className="pt-2">
                        <p className="font-bold text-[#E8881E] mb-1.5">Awards your dish won:</p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {myEntry.awards.map((a) => (
                            <span key={a.category_id} className="text-xs bg-[#FFEAD1] border border-[#F5CE9E] rounded-full px-2.5 py-1">
                              {a.emoji} {a.category_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Final awards board */}
            <div className="bg-[#F8DEBC] rounded-2xl border border-[#F0D0A5] p-6 shadow-sm">
              <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-5">🏆 Final Results</h3>
              {awardEntries.length === 0 ? (
                <p className="text-xs text-[#5C432E] text-center">
                  Awards will appear here as more teams finish and cast their nominations.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {awardEntries.map((g) => (
                    <div key={g.group_id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between gap-3">
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
                            <span key={a.category_id} className="text-[10px] bg-[#FFEAD1] border border-[#F5CE9E] rounded-full px-2 py-0.5">
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

          {/* ===== RIGHT COLUMN: rate other kitchens ===== */}
          <div className="space-y-4">
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#F0DECA] p-6 shadow-sm">
              <h3 className="text-[17px] font-black text-[#5C432E] text-center mb-2">What Other Kitchens Cooked Up</h3>
              <p className="text-[11px] text-center text-[#8B7355] mb-5">Nominate one award per dish you review.</p>

              {otherDishes.length === 0 ? (
                <p className="text-xs text-[#8B7355] text-center py-8">
                  No other finished dishes to rate yet — check back once more teams wrap up.
                </p>
              ) : (
                <div className="space-y-5">
                  {otherDishes.map((dish) => (
                    <div key={dish.group_id} className="bg-white rounded-xl border border-[#F0DECA] p-4 shadow-sm">
                      <p className="text-[11px] text-[#8B7355] font-medium mb-0.5">{dish.group_name}</p>
                      <p className="text-[15px] font-black text-[#3D2E1F] mb-3">{dish.dish_name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ratingCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => onRate(dish.group_id, cat.id)}
                            title={cat.description ?? cat.name}
                            className="flex items-center gap-1 rounded-full border border-[#F0DECA] bg-[#FFFDF9] hover:border-[#E8881E] hover:bg-[#FFF3E0] px-2.5 py-1 text-[10px] font-medium text-[#5C432E] transition-colors cursor-pointer"
                          >
                            <span>{cat.emoji}</span>
                            {cat.name}
                            {dish.nomination_counts[cat.slug] ? (
                              <span className="text-[#E8881E] font-bold">{dish.nomination_counts[cat.slug]}</span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {otherEntries.length > 0 && (
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#F0DECA] p-6 shadow-sm">
                <h3 className="text-[15px] font-black text-[#5C432E] text-center mb-3">All Teams</h3>
                <div className="space-y-1.5">
                  {otherEntries.map((g) => (
                    <div key={g.group_id} className="flex items-center justify-between text-xs text-[#5C432E]">
                      <span className="font-medium">{g.group_name}</span>
                      <span className="text-[#8B7355]">{g.dish_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CookCreateLayout>
  );
}
