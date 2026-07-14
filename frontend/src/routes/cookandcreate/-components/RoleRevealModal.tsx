import { X, Lock } from 'lucide-react';

interface RoleRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'chef' | 'impostor';
}

export function RoleRevealModal({ isOpen, onClose, role = 'chef' }: RoleRevealModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[700px] bg-[#FFF8EE] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#3D2E1F]/10 hover:bg-[#3D2E1F]/20 flex items-center justify-center transition-colors z-20 cursor-pointer"
        >
          <X size={18} className="text-[#3D2E1F]" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* LEFT: Chef illustration */}
          <div className="md:w-[45%] p-6 flex items-center justify-center">
            <div className="w-full aspect-square max-w-[260px] rounded-2xl bg-gradient-to-br from-[#FFB84D] via-[#E8881E] to-[#C5630F] flex items-center justify-center shadow-lg shadow-[#E8881E]/20">
              <span className="text-[96px] select-none drop-shadow-lg">👨‍🍳</span>
            </div>
          </div>

          {/* RIGHT: Role details */}
          <div className="md:w-[55%] p-6 md:pl-2 md:pr-8 space-y-5 overflow-y-auto max-h-[80vh]">
            {/* Role label */}
            <div>
              <span className="text-xs font-bold text-[#E8881E] uppercase tracking-widest">
                Your Role
              </span>
              <h2 className="text-3xl font-extrabold text-[#3D2E1F] mt-1 tracking-tight">
                CHEF 1
              </h2>
              <p className="text-sm text-[#8B7355] mt-2 leading-relaxed">
                You are the Chef. You are part of the cooking team. Work together to create the best dish.
              </p>
            </div>

            {/* Your Goal */}
            <div>
              <h3 className="text-sm font-bold text-[#C5630F] flex items-center gap-1.5 mb-2">
                ⚙️ Your Goal
              </h3>
              <ul className="space-y-1.5">
                {[
                  'Choose useful ingredients',
                  'Add logical cooking steps',
                  'Help identify the impostor',
                ].map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#3D2E1F] flex items-start gap-2"
                  >
                    <span className="text-[#E8881E] mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What you know */}
            <div>
              <h3 className="text-sm font-bold text-[#C5630F] flex items-center gap-1.5 mb-2">
                💡 WHAT YOU KNOW
              </h3>
              <ul className="space-y-1.5">
                {[
                  'One player is secretly sabotaging the dish',
                  'Not all choices will make sense',
                  'Patterns across rounds reveal the truth',
                ].map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#3D2E1F] flex items-start gap-2"
                  >
                    <span className="text-[#E8881E] mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Keep in mind */}
            <div>
              <h3 className="text-sm font-bold text-[#C5630F] flex items-center gap-1.5 mb-2">
                📍 KEEP IN MIND
              </h3>
              <p className="text-sm text-[#3D2E1F] leading-relaxed">
                Think before you vote. One wrong decision can save the impostor.
              </p>
            </div>

            {/* Secret notice */}
            <div className="bg-[#FFECCC] rounded-xl px-4 py-3 flex items-center gap-2.5 border border-[#FFB84D]/30">
              <Lock size={16} className="text-[#E8881E] shrink-0" />
              <p className="text-xs font-semibold text-[#3D2E1F]">
                🔒 Keep your role secret
              </p>
            </div>
          </div>
        </div>

        {/* Bottom button */}
        <div className="px-6 pb-6 pt-2">
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
