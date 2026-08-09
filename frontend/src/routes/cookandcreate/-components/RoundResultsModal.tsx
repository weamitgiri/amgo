import { X, AlertTriangle } from 'lucide-react';

export type CCTopIngredient = {
  id: number;
  name: string;
  image_url: string | null;
  is_absurd: boolean;
};

interface RoundResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topIngredients: CCTopIngredient[];
}

export function RoundResultsModal({ isOpen, onClose, topIngredients }: RoundResultsModalProps) {
  if (!isOpen) return null;

  const absurdOnes = topIngredients.filter((i) => i.is_absurd);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#FFF8EE] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-extrabold text-[#3D2E1F] flex items-center gap-2">
            <span className="text-2xl">🧺</span>
            Round 1: Results
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#3D2E1F]/10 hover:bg-[#3D2E1F]/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} className="text-[#3D2E1F]" />
          </button>
        </div>

        {/* Description */}
        <p className="px-6 text-sm text-[#8B7355] leading-relaxed">
          Here are the top {topIngredients.length || 4} ingredients selected by the group:
        </p>

        {/* Ingredients row */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {topIngredients.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-2 bg-white rounded-xl p-3 border border-[#F0E4D4] shadow-sm min-w-[80px]"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-3xl select-none">🥘</span>
                )}
                <span className="text-xs font-semibold text-[#3D2E1F]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        {absurdOnes.length > 0 && (
          <div className="mx-6 mb-5">
            <div className="bg-[#FFF3E0] border border-[#E8881E]/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-[#E8881E] shrink-0 mt-0.5" />
              <p className="text-sm text-[#3D2E1F] leading-relaxed">
                <span className="font-bold">⚠️ {absurdOnes.map((a) => a.name).join(' and ')}</span> also received votes.
                Interesting choices from someone in your group.
              </p>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] text-white font-bold text-base transition-colors shadow-md shadow-[#E8881E]/25 cursor-pointer active:scale-[0.98]"
          >
            Okay Continue
          </button>
        </div>
      </div>
    </div>
  );
}
