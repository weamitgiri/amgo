import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { CountdownTimer } from './-components/CountdownTimer';
import { RoleRevealModal } from './-components/RoleRevealModal';

export const Route = createFileRoute('/cookandcreate/summary')({
  component: SummaryPage,
});

const rounds = [
  {
    num: '01',
    emoji: '🧺',
    title: 'Ingredient Selection',
    desc: 'Choose the best ingredients for your dish.',
  },
  {
    num: '02',
    emoji: '🍳',
    title: 'Cooking Steps',
    desc: 'Submit one step to help create the dish.',
  },
  {
    num: '03',
    emoji: '✅',
    title: 'Elimination',
    desc: 'Discuss and vote',
  },
];

const chefs = [
  { label: 'Chef 1', emoji: '👨‍🍳' },
  { label: 'Chef 2', emoji: '👩‍🍳' },
  { label: 'Chef 3', emoji: '👨‍🍳' },
  { label: 'Show Host', emoji: '👩‍🍳' },
  { label: 'Chef 4', emoji: '👨‍🍳' },
];

function SummaryPage() {
  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Summary">
      <CookCreateHeader showGameTimer timerMinutes={24} timerSeconds={58} />

      {/* Challenge brief label */}
      <div className="px-6 pt-5 pb-3">
        <span className="text-xs font-bold text-[#E8881E] uppercase tracking-widest flex items-center gap-1.5">
          📋 CHALLENGE BRIEF
        </span>
      </div>

      {/* Two column layout */}
      <div className="px-6 pb-8 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
        {/* ===== LEFT COLUMN ===== */}
        <div className="space-y-6">
          {/* Main challenge card */}
          <div className="bg-[#FFF3E0] rounded-2xl p-7 border border-[#E8881E]/10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#3D2E1F] leading-tight">
              The{' '}
              <span className="text-[#E8881E]">Cook & Create</span>{' '}
              Challenge
            </h1>
            <p className="text-sm text-[#8B7355] mt-3 leading-relaxed">
              Work together to create the best dish with the given ingredients
              and steps.
            </p>
            <p className="text-sm text-[#E53935] italic mt-3 font-medium">
              *But there's a twist!*
            </p>
            <p className="text-sm text-[#3D2E1F] mt-2 leading-relaxed">
              One player is secretly trying to spoil the dish and mislead the
              team.
            </p>
            <p className="text-sm text-[#3D2E1F] mt-2 leading-relaxed">
              Can you spot the{' '}
              <em className="font-semibold text-[#C5630F]">saboteur(Impostor)</em>{' '}
              and create a masterpiece together?
            </p>

            {/* Decorative cooking pot */}
            <div className="mt-6 flex justify-center">
              <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-[#FFB84D] via-[#E8881E] to-[#C5630F] flex items-center justify-center shadow-lg shadow-[#E8881E]/20">
                <span className="text-[72px] select-none drop-shadow-lg">🍲</span>
              </div>
            </div>
          </div>

          {/* Rounds section */}
          <div>
            <h3 className="text-sm font-bold text-[#C5630F] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              🏁 Rounds
            </h3>
            <div className="flex items-stretch gap-2">
              {rounds.map((round, i) => (
                <div key={round.num} className="flex items-stretch flex-1">
                  {/* Round card */}
                  <div className="flex-1 bg-white rounded-xl border border-[#F0E4D4] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center text-xs font-extrabold text-[#E8881E]">
                        {round.num}
                      </span>
                      <span className="text-lg">{round.emoji}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#3D2E1F] leading-tight">
                      {round.title}
                    </h4>
                    <p className="text-xs text-[#8B7355] mt-1 leading-relaxed">
                      {round.desc}
                    </p>
                  </div>
                  {/* Arrow connector */}
                  {i < rounds.length - 1 && (
                    <div className="flex items-center px-1">
                      <ChevronRight size={18} className="text-[#E8881E]/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-5">
          {/* Key People card */}
          <div className="bg-white rounded-2xl border border-[#F0E4D4] p-5 shadow-sm">
            <h3 className="text-base font-bold text-[#3D2E1F] text-center mb-4">
              Key People in the Kitchen
            </h3>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {chefs.map((chef) => (
                <div
                  key={chef.label}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFECCC] to-[#FFB84D] flex items-center justify-center shadow-sm">
                    <span className="text-2xl select-none">{chef.emoji}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#3D2E1F]">
                    {chef.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Secret Box card */}
          <div className="border-2 border-dashed border-[#E8881E]/40 bg-[#FFFAF4] rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-[#3D2E1F] mb-4">
              Open the Secret Box to reveal your role.
            </p>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#FFECCC] to-[#FFB84D] flex items-center justify-center shadow-md shadow-[#E8881E]/15">
                <span className="text-[48px] select-none">📦</span>
              </div>
            </div>
            <button
              onClick={() => setShowRoleModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] text-white font-bold text-sm transition-colors shadow-md shadow-[#E8881E]/25 cursor-pointer active:scale-[0.98]"
            >
              🔓 Open Secret Box
            </button>
          </div>

          {/* Two info cards side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-[#F0E4D4] p-4 shadow-sm">
              <p className="text-xs text-[#8B7355] leading-relaxed">
                <span className="font-bold text-[#3D2E1F]">ℹ️</span> All actions are
                anonymous. Think, observe and make the right move!
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#F0E4D4] p-4 shadow-sm">
              <p className="text-xs text-[#8B7355] leading-relaxed">
                You can view the Challenge brief only once. Remember the
                details!
              </p>
            </div>
          </div>

          {/* Countdown card */}
          <div className="bg-gradient-to-br from-[#FFF3E0] to-[#FFECCC] rounded-2xl p-5 border border-[#E8881E]/15 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#3D2E1F] mb-3">
              The Round 1 is starting in
            </p>
            <CountdownTimer
              initialMinutes={4}
              initialSeconds={58}
              variant="large"
              running
            />
          </div>
        </div>
      </div>

      {/* Role Reveal Modal */}
      <RoleRevealModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        role="chef"
      />
    </CookCreateLayout>
  );
}
