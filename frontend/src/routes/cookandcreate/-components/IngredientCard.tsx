import { Check } from 'lucide-react';

interface IngredientCardProps {
  name: string;
  emoji: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function IngredientCard({
  name,
  emoji,
  isSelected,
  onToggle,
  disabled = false,
}: IngredientCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl
        bg-white border-2 transition-all duration-200 ease-out cursor-pointer
        min-h-[120px] w-full
        ${
          isSelected
            ? 'border-[#E8881E] shadow-md shadow-[#E8881E]/10'
            : 'border-[#F0E4D4] hover:border-[#E8881E]/40'
        }
        ${!disabled ? 'hover:scale-[1.04] hover:shadow-lg hover:shadow-[#E8881E]/8' : ''}
        ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Selected checkmark badge */}
      {isSelected && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E8881E] flex items-center justify-center shadow-sm">
          <Check size={14} className="text-white" strokeWidth={3} />
        </span>
      )}

      {/* Emoji */}
      <span className="text-4xl leading-none select-none">{emoji}</span>

      {/* Name */}
      <span className="text-sm font-semibold text-[#3D2E1F] text-center leading-tight">
        {name}
      </span>
    </button>
  );
}
