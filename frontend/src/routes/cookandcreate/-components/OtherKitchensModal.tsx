import { useState } from 'react';
import type { CCOtherDish, CCRatingCategory } from '@/api/types/cookandcreate';
import { dishImageFor } from './dishImages';

interface OtherKitchensModalProps {
  isOpen: boolean;
  otherDishes: CCOtherDish[];
  ratingCategories: CCRatingCategory[];
  onRate: (ratedGroupId: number, categoryId: number) => void;
  onContinue: () => void;
}

const ORANGE = '#CB7430';
const HEADING = '#53301B';

/**
 * Shown right after Round 3 finishes, before the results/reveal screen. The
 * player reviews the other kitchens' dishes one at a time — each dish shows its
 * final recipe (kept steps) and the award categories to nominate. Nominating a
 * dish drops it from the pool server-side, so the next dish takes its place.
 * When no other team has finished yet the list is blank.
 */
export function OtherKitchensModal({
  isOpen,
  otherDishes,
  ratingCategories,
  onRate,
  onContinue,
}: OtherKitchensModalProps) {
  // Highlights the award just picked until the next dish replaces this one.
  const [picked, setPicked] = useState<{ groupId: number; categoryId: number } | null>(null);

  if (!isOpen) return null;

  const dish = otherDishes[0] ?? null;

  // The reaction this dish has drawn most so far (real nomination counts).
  const topNomination = dish
    ? Object.entries(dish.nomination_counts)
        .filter(([, c]) => c > 0)
        .sort((a, b) => b[1] - a[1])[0]
    : undefined;
  const topCategory = topNomination ? ratingCategories.find((c) => c.slug === topNomination[0]) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — reviewing is the step here, so it deliberately doesn't dismiss. */}
      <div className="absolute inset-0 bg-[#2E2A26]/45 backdrop-blur-[2px]" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-[20px] border border-[#F9EAD4] shadow-[0_20px_60px_rgba(80,50,20,0.25)] p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'linear-gradient(180deg, #FFFEFD 0%, #FDF5E9 100%)' }}
      >
        <h2 className="text-xl font-semibold text-center" style={{ color: HEADING }}>
          What Other Kitchens Cooked Up
        </h2>
        <p className="text-[13px] text-center text-[#6F625A] mt-1 mb-5">Nominate one award per dish you review.</p>

        {!dish ? (
          <div className="rounded-xl border border-[#F1E4D6] bg-[#FFFDF9] px-4 py-10 text-center">
            <p className="text-sm text-[#6F625A]">
              No other finished dishes to review yet — you can continue to your results.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dish header */}
            <div className="flex items-center gap-3 rounded-xl border border-[#F1E4D6] bg-[#FFFDF9] p-2.5">
              <div className="w-16 h-16 rounded-lg bg-[#FAF4ED] overflow-hidden shrink-0">
                <img src={dishImageFor(dish.group_id)} alt={dish.dish_name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6F625A]">{dish.group_name}</p>
                <p className="text-base font-semibold text-[#2E2A26] leading-tight truncate">{dish.dish_name}</p>
                {topCategory ? (
                  <p className="text-[13px] text-[#3F3A35] mt-1">
                    {topCategory.emoji} {topNomination![1]} Voted {topCategory.name}
                  </p>
                ) : (
                  <p className="text-[13px] text-[#A99E92] mt-1">No nominations yet</p>
                )}
              </div>
            </div>

            {/* The dish's final recipe (its kept steps) */}
            <div className="rounded-xl border border-[#F1E4D6] bg-[#FEFAF6] px-4 pt-3.5 pb-1">
              <h3 className="text-[15px] font-semibold pb-2.5 border-b border-[#EFE4D6]" style={{ color: ORANGE }}>
                Game Step
              </h3>
              {dish.steps.length === 0 ? (
                <p className="text-[13px] text-[#A99E92] py-3">No steps recorded for this dish.</p>
              ) : (
                <div className="divide-y divide-[#EFE4D6]">
                  {dish.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5">
                      <span className="text-[15px] font-semibold w-4 shrink-0 leading-snug" style={{ color: ORANGE }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <p className="text-[13px] text-[#3F3A35] leading-snug">{s.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Award nomination — picking one submits and moves to the next dish. */}
            <div>
              <p className="text-center text-[15px] font-semibold text-[#2E2A26]">Give Rating</p>
              <p className="text-center text-xs text-[#6F625A] mt-0.5 mb-3">Pick the award this dish deserves</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ratingCategories.map((cat) => {
                  const isPicked = picked?.groupId === dish.group_id && picked.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setPicked({ groupId: dish.group_id, categoryId: cat.id });
                        onRate(dish.group_id, cat.id);
                      }}
                      title={cat.description ?? cat.name}
                      className={`flex flex-col items-center justify-start gap-1.5 rounded-lg border px-1 pt-2.5 pb-2 text-center transition-colors cursor-pointer ${
                        isPicked
                          ? 'border-[#CB7430] bg-[#FFF6EA] shadow-[0_0_0_0.5px_#CB7430]'
                          : 'border-[#EADCCB] bg-[#FCF5EC] hover:border-[#CB7430]/60'
                      }`}
                    >
                      <span className="text-[26px] leading-none">{cat.emoji}</span>
                      <span className="text-[11px] text-[#3F3A35] leading-tight">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onContinue}
          className="mt-5 w-full h-12 rounded-full text-white text-base font-medium transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_12px_rgba(243,158,59,0.35)] cursor-pointer"
          style={{ background: 'linear-gradient(90deg, #F39E3B 0%, #F9A548 50%, #F39E3B 100%)' }}
        >
          {dish ? 'Skip to Results' : 'Continue to Results'}
        </button>
      </div>
    </div>
  );
}
