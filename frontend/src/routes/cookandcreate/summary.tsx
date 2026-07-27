import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ChevronRight, FileText, Eye, Info } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { RoleRevealModal } from './-components/RoleRevealModal';
import gameSummeryBg from '../../assets/cookandcreate/game-summery-bg.png';
import chef1 from '../../assets/cookandcreate/chef-1 1.png';
import chef2 from '../../assets/cookandcreate/chef-2 1.png';
import chef3 from '../../assets/cookandcreate/chef-3 1.png';
import showHost from '../../assets/cookandcreate/show-hos 1.png';
import chef4 from '../../assets/cookandcreate/chef-4 1.png';
import secretBoxImg from '../../assets/cookandcreate/secret-box.png';
import step1Img from '../../assets/cookandcreate/game-flow-step-1.png';
import step2Img from '../../assets/cookandcreate/game-flow-step-2.png';
import step4Img from '../../assets/cookandcreate/game-flow-step-4.png';

export const Route = createFileRoute('/cookandcreate/summary')({
  component: SummaryPage,
});

const rounds = [
  {
    num: '01',
    img: step1Img,
    title: 'Ingredient Selection',
    desc: 'Choose the best ingredients for your dish.',
  },
  {
    num: '02',
    img: step2Img,
    title: 'Cooking Steps',
    desc: 'Submit one step to help create the dish.',
  },
  {
    num: '03',
    img: step4Img,
    title: 'Elimination',
    desc: 'Discuss and vote',
  },
];

const chefs = [
  { label: 'Chef 1', img: chef1 },
  { label: 'Chef 2', img: chef2 },
  { label: 'Chef 3', img: chef3 },
  { label: 'Show Host', img: showHost },
  { label: 'Chef 4', img: chef4 },
];

function SummaryPage() {
  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Summary">
      {/* Shake animation for Secret Box */}
      <style>{`
        @keyframes gentle-shake {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-2deg); }
          75% { transform: translateY(-2px) rotate(2deg); }
        }
        .animate-shake {
          animation: gentle-shake 3s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <CookCreateHeader showGameTimer timerMinutes={24} timerSeconds={58} />

        {/* Challenge brief label row */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FFEAD1] flex items-center justify-center text-[#E8881E]">
              <FileText size={14} />
            </div>
            <span className="text-xs font-bold text-[#3D2E1F] uppercase tracking-wider">
              CHALLENGE BRIEF
            </span>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-[#B89B72] hover:text-[#E8881E] transition-colors cursor-pointer opacity-40">
            <Eye size={14} />
            View Game Rules
          </button>
        </div>

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 items-stretch">
          {/* ===== LEFT COLUMN ===== */}
          <div
            className="rounded-[28px] border border-[#F5DCBD] p-6 sm:p-7 shadow-xs flex flex-col justify-between"
            style={{
              backgroundImage: `url(${gameSummeryBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Top Text Content - Strictly max-w-[280px] to sit on left with no overlap */}
            <div className="max-w-[260px] sm:max-w-[300px] space-y-3 mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-[#3D2E1F] leading-tight">
                The{' '}
                <span className="text-[#E8881E]">Cook &amp; Create</span>
                <br />
                Challenge
              </h1>
              <p className="text-xs sm:text-sm text-[#7A644D] leading-relaxed font-medium">
                Work together to create the best dish with the given ingredients
                and steps.
              </p>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#E8881E]">
                  But there's a twist!
                </p>
                <p className="text-xs sm:text-sm text-[#7A644D] leading-relaxed font-medium mt-0.5">
                  One player is secretly trying to spoil the dish and mislead the
                  team.
                </p>
              </div>
              <p className="text-xs sm:text-sm text-[#7A644D] leading-relaxed font-medium">
                Can you spot the{' '}
                <span className="font-bold text-[#E8881E]">saboteur(Impostor)</span>{' '}
                and create a masterpiece together?
              </p>
            </div>

            {/* Bottom Section: Rounds */}
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-[#E8881E] uppercase tracking-wider mb-2.5">
                Rounds
              </h3>
              <div className="bg-[#FFF8EE]/95 backdrop-blur-xs rounded-2xl border border-[#F5E6D3] p-4 shadow-xs">
                <div className="grid grid-cols-3 gap-2 items-center">
                  {rounds.map((round, i) => (
                    <div key={round.num} className="flex items-center justify-between">
                      {/* Round card item */}
                      <div className="flex-1 flex flex-col items-center text-center">
                        {/* Circle illustration container */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFF3E0] border border-[#F5DEC3] flex items-center justify-center mb-2.5 shadow-inner">
                          {/* Number badge on top-left */}
                          <span className="absolute top-0 left-0 w-5 h-5 rounded-full bg-[#E8881E] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                            {round.num}
                          </span>
                          {/* Round 3D Icon */}
                          <img
                            src={round.img}
                            alt={round.title}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-xs"
                          />
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-[#3D2E1F] leading-tight">
                          {round.title}
                        </h4>

                        {/* Description */}
                        <p className="text-[11px] text-[#7A644D] font-medium mt-1 leading-snug max-w-[150px]">
                          {round.desc}
                        </p>
                      </div>

                      {/* Arrow connector between columns */}
                      {i < rounds.length - 1 && (
                        <ChevronRight size={16} className="text-[#E8881E]/40 shrink-0 mx-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="flex flex-col justify-between space-y-4">
            {/* Key People in Kitchen */}
            <div className="bg-[#FFF8EE] rounded-[28px] border border-[#F5DCBD] p-6 shadow-xs">
              <h3 className="text-base sm:text-lg font-black text-[#3D2E1F] text-center mb-5 tracking-tight">
                Key People in the Kitchen
              </h3>
              <div className="grid grid-cols-5 gap-3 text-center">
                {chefs.map((chef) => (
                  <div key={chef.label} className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-[3/4] rounded-2xl bg-[#FFF0DB]/80 border border-[#F5DEC3] overflow-hidden shadow-2xs">
                      <img src={chef.img} alt={chef.label} className="w-full h-full object-cover" style={{ objectPosition: 'center 15%' }} />
                    </div>
                    <span className="text-xs font-bold text-[#3D2E1F] truncate w-full">
                      {chef.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Grid: Secret Box + Info & Timer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* Secret Box Card */}
              <div className="bg-[#FFF8EE] rounded-[28px] border border-[#F5DCBD] p-6 text-center flex flex-col items-center justify-between shadow-xs">
                <p className="text-sm font-black text-[#E8881E] leading-snug max-w-[180px]">
                  Open the Secret Box to reveal your role.
                </p>
                <div className="my-3 flex justify-center">
                  <img
                    src={secretBoxImg}
                    alt="Secret Box"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain drop-shadow-lg animate-shake hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="w-full py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-xs sm:text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer"
                >
                  Open Secret Box
                </button>
              </div>

              {/* Right stacked cards */}
              <div className="space-y-4 flex flex-col justify-between">
                {/* Info Card 1 */}
                <div className="bg-white rounded-[24px] border border-[#F5DCBD] p-4.5 flex items-start gap-3 shadow-xs">
                  <div className="w-6 h-6 rounded-full border-2 border-[#E8881E] text-[#E8881E] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    i
                  </div>
                  <p className="text-xs text-[#6E5A44] leading-relaxed font-medium">
                    All actions are anonymous. Think, observe and make the right move!
                  </p>
                </div>

                {/* Info Card 2 + Countdown Timer */}
                <div className="bg-white rounded-[24px] border border-[#F5DCBD] p-5 shadow-xs flex flex-col justify-between flex-1">
                  <p className="text-xs text-[#6E5A44] leading-relaxed font-medium mb-4">
                    You can view the Challenge brief only once. Remember the details!
                  </p>

                  {/* Countdown Card */}
                  <div className="bg-gradient-to-b from-[#FFF3E0] to-[#FFEAD1] rounded-2xl p-5 border border-[#F5CE9E] text-center shadow-xs">
                    <p className="text-xs font-bold text-[#6E5A44] mb-2">
                      The Round 1 is starting in
                    </p>
                    <div className="text-3xl font-black text-[#3D2E1F] font-mono tracking-widest">
                      04:58
                    </div>
                  </div>
                </div>
              </div>
            </div>
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



