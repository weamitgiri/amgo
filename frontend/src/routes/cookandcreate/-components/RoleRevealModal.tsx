import { X, Lock, Target, Lightbulb, Brain } from 'lucide-react';
import chef1Img from '../../../assets/cookandcreate/chef-1 1.png';
import showHostImg from '../../../assets/cookandcreate/show-hos 1.png';
import imposterImg from '../../../assets/cookandcreate/imposter 1.png';

interface RoleRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'chef' | 'show_host' | 'impostor';
  roleLabel: string;
  impostorBiasCardHtml?: string | null;
}

const ROLE_COPY: Record<
  'chef' | 'show_host' | 'impostor',
  { blurb: string; goals: string[]; know: string[]; keepInMind: string; image: string }
> = {
  chef: {
    blurb: 'You are part of the cooking team. Work together to create the best dish.',
    goals: ['Choose useful ingredients', 'Add logical cooking steps', 'Help identify the impostor'],
    know: [
      'One player is secretly sabotaging the dish',
      'Not all choices will make sense',
      'Patterns across rounds reveal the truth',
    ],
    keepInMind: 'Think before you vote. One wrong decision can save the impostor.',
    image: chef1Img,
  },
  show_host: {
    blurb: 'You lead the kitchen — same team as everyone else, plus the final say on the dish name.',
    goals: ['Choose useful ingredients', 'Add logical cooking steps', 'Name the team’s dish once steps are finalized'],
    know: [
      'One player is secretly sabotaging the dish',
      'You alone can submit the final dish name',
      'Patterns across rounds reveal the truth',
    ],
    keepInMind: 'Everything a Chef watches for, plus: only you can name the dish.',
    image: showHostImg,
  },
  impostor: {
    blurb: 'You are secretly trying to spoil the dish and mislead the team — without getting caught.',
    goals: ['Blend in with the group', 'Nudge bad choices without being obvious', 'Avoid getting voted out'],
    know: ['Everyone else is genuinely trying to cook well', 'Your choices need to look plausible'],
    keepInMind: 'Deflect, don’t deny too hard. Stay calm under questioning.',
    image: imposterImg,
  },
};

export function RoleRevealModal({ isOpen, onClose, role, roleLabel, impostorBiasCardHtml }: RoleRevealModalProps) {
  if (!isOpen) return null;
  const copy = ROLE_COPY[role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[820px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-[#C06A15] hover:bg-[#A85A10] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md z-20 cursor-pointer"
        >
          <X size={22} className="text-white" strokeWidth={2.5} />
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
          {/* LEFT: portrait illustration */}
          <div className="md:w-[42%] flex items-stretch">
            <div className="w-full rounded-2xl bg-[#FFF8EE] border border-[#F5E2C8] overflow-hidden flex items-end justify-center p-3 shadow-inner">
              <img src={copy.image} alt={roleLabel} className="w-full object-contain drop-shadow-md" />
            </div>
          </div>

          {/* RIGHT: Role details */}
          <div className="md:w-[58%] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-sm font-bold text-[#E8881E] tracking-wide">Your Role</span>
              <h2 className="text-4xl font-black text-[#3D2E1F] tracking-tight uppercase">{roleLabel}</h2>
              <p className="text-sm text-[#6E5A44] leading-relaxed pt-1">{copy.blurb}</p>

              <hr className="!my-4 border-t border-[#F0D5B5]" />

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#E8881E] flex items-center gap-2">
                  <Target size={18} className="text-[#E8881E]" />
                  Your Goal
                </h3>
                <ul className="space-y-1.5 pl-6">
                  {copy.goals.map((item) => (
                    <li key={item} className="text-sm text-[#3D2E1F] flex items-center gap-2 font-medium">
                      <span className="text-[#3D2E1F] font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="!my-4 border-t border-[#F0D5B5]" />

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#E8881E] flex items-center gap-2">
                  <Lightbulb size={18} className="text-[#E8881E]" />
                  WHAT YOU KNOW
                </h3>
                <ul className="space-y-1.5 pl-6">
                  {copy.know.map((item) => (
                    <li key={item} className="text-sm text-[#3D2E1F] flex items-center gap-2 font-medium">
                      <span className="text-[#3D2E1F] font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="!my-4 border-t border-[#F0D5B5]" />

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#E8881E] flex items-center gap-2">
                  <Brain size={18} className="text-[#E8881E]" />
                  KEEP IN MIND
                </h3>
                <p className="text-sm text-[#3D2E1F] leading-relaxed pl-6 font-medium">{copy.keepInMind}</p>
              </div>

              {/* Impostor bias card — only ever rendered for the impostor themselves */}
              {role === 'impostor' && impostorBiasCardHtml && (
                <>
                  <hr className="!my-4 border-t border-[#F0D5B5]" />
                  <div className="!mt-3 bg-[#3D2E1F] rounded-xl px-4 py-3 text-white">
                    <h3 className="text-sm font-extrabold text-[#FFC98A] mb-1.5">Your Bias Card</h3>
                    <div
                      className="text-xs leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-1"
                      dangerouslySetInnerHTML={{ __html: impostorBiasCardHtml }}
                    />
                  </div>
                </>
              )}

              {/* Secret badge */}
              <div className="!mt-5 bg-[#FFEAD1] rounded-xl px-4 py-3 flex items-center gap-2.5 border border-[#F5CE9E]">
                <Lock size={16} className="text-[#6E5A44] shrink-0" />
                <span className="text-sm font-bold text-[#3D2E1F]">Keep your role secret</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom button */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={onClose}
            className="px-20 py-3.5 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-base transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#E8881E]/30 cursor-pointer"
          >
            Okay Continue
          </button>
        </div>
      </div>
    </div>
  );
}
