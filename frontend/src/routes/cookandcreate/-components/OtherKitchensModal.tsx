import type { CCOtherDish, CCRatingCategory } from '@/api/types/cookandcreate';
import { dishImageFor } from './dishImages';

interface OtherKitchensModalProps {
  isOpen: boolean;
  otherDishes: CCOtherDish[];
  ratingCategories: CCRatingCategory[];
  onRate: (ratedGroupId: number, categoryId: number) => void;
  onContinue: () => void;
}

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[560px] max-h-[92vh] overflow-y-auto bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl p-6 md:p-7 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl sm:text-2xl font-black text-[#3D2E1F] text-center">What Other Kitchens Cooked Up</h2>
        <p className="text-xs text-center text-[#8B7355] mt-1 mb-5">Nominate one award per dish you review.</p>

        {!dish ? (
          <div className="bg-[#FFEAD1]/60 border border-[#F5CE9E]/60 rounded-2xl px-4 py-10 text-center">
            <p className="text-sm text-[#8B7355]">
              No other finished dishes to review yet — you can continue to your results.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dish header */}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#F0DECA] p-3 shadow-xs">
              <img
                src={dishImageFor(dish.group_id)}
                alt={dish.dish_name}
                className="w-20 h-20 rounded-xl object-cover border border-[#F0E4D4] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] text-[#8B7355] font-medium">{dish.group_name}</p>
                <p className="text-[17px] font-black text-[#3D2E1F] leading-tight truncate">{dish.dish_name}</p>
                {topCategory ? (
                  <p className="text-xs font-bold text-[#E8881E] mt-1">
                    {topCategory.emoji} {topNomination![1]} Voted {topCategory.name}
                  </p>
                ) : (
                  <p className="text-xs text-[#B8A898] mt-1">No nominations yet</p>
                )}
              </div>
            </div>

            {/* The dish's final recipe (its kept steps) */}
            <div className="bg-white rounded-2xl border border-[#F0DECA] p-4 shadow-xs">
              <h3 className="text-sm font-black text-[#E8881E] mb-1">Game Step</h3>
              {dish.steps.length === 0 ? (
                <p className="text-xs text-[#B8A898] py-2">No steps recorded for this dish.</p>
              ) : (
                <div className="divide-y divide-[#F5E9DA]">
                  {dish.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <span className="text-sm font-black text-[#E8881E] w-4 shrink-0">{String.fromCharCode(65 + i)}</span>
                      <p className="text-xs text-[#3D2E1F] leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Award nomination — picking one submits and moves to the next dish. */}
            <div>
              <p className="text-center text-xs font-black text-[#5C432E] mb-2">Nominate an award for this dish</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ratingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onRate(dish.group_id, cat.id)}
                    title={cat.description ?? cat.name}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#F0DECA] bg-white hover:border-[#E8881E] hover:bg-[#FFF3E0] px-2 py-2.5 text-center transition-colors cursor-pointer"
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-[10px] font-bold text-[#5C432E] leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onContinue}
          className="mt-5 w-full py-3.5 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer"
        >
          {dish ? 'Skip to Results' : 'Continue to Results'}
        </button>
      </div>
    </div>
  );
}
