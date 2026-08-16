import { useState } from 'react';
import step2Img from '../../../assets/cookandcreate/game-flow-step-2.png';
import { resolveMediaUrl } from "@/utils/media";
export type CCNameDishIngredient = {
  id: number;
  name: string;
  image_url: string | null;
};

interface NameDishModalProps {
  isOpen: boolean;
  onSubmit: (dishName: string) => void;
  topIngredients: CCNameDishIngredient[];
  canSubmit: boolean;
  waitingLabel?: string | null;
}

export function NameDishModal({ isOpen, onSubmit, topIngredients, canSubmit, waitingLabel }: NameDishModalProps) {
  const [dishName, setDishName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (dishName.trim()) {
      onSubmit(dishName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[580px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-8 md:p-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-black text-[#3D2E1F] text-center italic">
          Give a Name to your Dish
        </h2>

        {/* Cooking pot icon */}
        <div className="flex justify-center my-5">
          <div className="w-16 h-16 rounded-full bg-[#FFF3E0] border border-[#F5E2C8] flex items-center justify-center">
            <img
              src={step2Img}
              alt="Cooking pot"
              className="w-10 h-10 object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Top 4 ingredients */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
          <p className="text-xs font-bold text-[#E8881E] leading-tight text-center">
            Your top 4 Final
            <br />
            Ingredients
          </p>
          <div className="flex items-center gap-3">
            {topIngredients.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-1.5 bg-white rounded-xl px-3 py-2 border border-[#F5E6D3] shadow-xs"
              >
                {item.image_url ? (
                  <img src={resolveMediaUrl(item.image_url) ?? step2Img} alt={item.name} className="object-contain drop-shadow-xs" />
                ) : (
                  <span className="text-xl">🥘</span>
                )}
                <span className="text-xs font-bold text-[#3D2E1F]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instruction text */}
        <p className="text-sm font-black text-[#3D2E1F] text-center leading-snug mb-6">
          Check the final steps in Recent Activity and
          <br />
          Name your Team Dish.
        </p>

        {canSubmit ? (
          <>
            {/* Name input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#3D2E1F] mb-2">
                Name your Dish
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value.slice(0, 40))}
                  placeholder="Example: Creamy hub paneer pasta"
                  className="w-full rounded-xl border border-[#E0D4C4] focus:border-[#E8881E] focus:ring-2 focus:ring-[#E8881E]/20 outline-none px-4 py-3 text-sm text-[#3D2E1F] placeholder:text-[#B8A898] bg-white pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8B7355]">
                  {dishName.length}/40
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!dishName.trim()}
              className="w-full py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer"
            >
              Submit
            </button>
          </>
        ) : (
          <div className="bg-[#FFEAD1] border border-[#F5CE9E] rounded-xl p-5 text-center">
            <p className="text-sm font-bold text-[#3D2E1F]">
              {waitingLabel || 'Waiting for the Show Host to name the dish…'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
