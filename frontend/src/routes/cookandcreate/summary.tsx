import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, FileText, Info } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { RoleRevealModal } from './-components/RoleRevealModal';
import { cookAndCreateService } from '@/api/services/cookandcreate.service';
import type { CCGameStateResponse } from '@/api/types/cookandcreate';
import { getParticipantSession } from '@/lib/participant-session';
import { toastError } from '@/lib/toast';
import { resolveMediaUrl } from '@/utils/media';
import { portraitForRole } from './-components/portraits';
import gameSummeryBg from '../../assets/cookandcreate/game-summery-bg.png';
import secretBoxImg from '../../assets/cookandcreate/secret-box.png';
import step1Img from '../../assets/cookandcreate/game-flow-step-1.png';
import step2Img from '../../assets/cookandcreate/game-flow-step-2.png';
import step4Img from '../../assets/cookandcreate/game-flow-step-4.png';

export const Route = createFileRoute('/cookandcreate/summary')({
  component: SummaryPage,
});

const ROUNDS = [
  { num: '01', img: step1Img, title: 'Ingredient Selection', desc: 'Choose the best ingredients for your dish.' },
  { num: '02', img: step2Img, title: 'Cooking Steps', desc: 'Submit one step to help create the dish.' },
  { num: '03', img: step4Img, title: 'Elimination', desc: 'Discuss and vote.' },
];

/** Give players time to read their role before nudging them into Round 1,
 * which has already started server-side by the time this screen shows. */
const AUTO_CONTINUE_SECS = 25;

function SummaryPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const [gameState, setGameState] = useState<CCGameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_CONTINUE_SECS);

  const fetchState = useCallback(async () => {
    if (!session?.groupId || !session.participantId) return;
    try {
      const data = await cookAndCreateService.getGameState(session.groupId, session.participantId);
      setGameState(data);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not load the challenge brief.');
    } finally {
      setLoading(false);
    }
  }, [session?.groupId, session?.participantId]);

  useEffect(() => {
    if (!session?.groupId || !session.participantId) {
      navigate({ to: '/' });
      return;
    }
    fetchState();
  }, [session?.groupId, session?.participantId, navigate, fetchState]);

  const goToGame = useCallback(() => navigate({ to: '/cookandcreate/game' }), [navigate]);

  // If the round has already moved past Round 1 by the time this loads (e.g.
  // a refresh well after everyone's read their role), skip straight to the game.
  useEffect(() => {
    if (gameState && gameState.instance.status !== 'waiting' && gameState.instance.status !== 'round1') {
      goToGame();
    }
  }, [gameState, goToGame]);

  useEffect(() => {
    if (!gameState) return;
    if (countdown <= 0) {
      goToGame();
      return;
    }
    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, gameState, goToGame]);

  if (loading || !gameState) {
    return (
      <CookCreateLayout breadcrumb="Cook & Create / Summary">
        <div className="flex items-center justify-center min-h-[50vh] text-[#8B7355]">Loading challenge brief…</div>
      </CookCreateLayout>
    );
  }

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');
  const role: 'chef' | 'show_host' | 'impostor' = gameState.is_impostor
    ? 'impostor'
    : gameState.is_show_host
      ? 'show_host'
      : 'chef';

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Summary">
      <style>{`
        @keyframes gentle-shake {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-2deg); }
          75% { transform: translateY(-2px) rotate(2deg); }
        }
        .animate-shake { animation: gentle-shake 3s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 space-y-4">
        <CookCreateHeader
          participantName={session?.name}
          gameEndsAt={gameState.schedule.game_ends_at}
        />

        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FFEAD1] flex items-center justify-center text-[#E8881E]">
              <FileText size={14} />
            </div>
            <span className="text-xs font-bold text-[#3D2E1F] uppercase tracking-wider">Challenge Brief</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 items-stretch">
          {/* LEFT COLUMN */}
          <div
            className="rounded-[28px] border border-[#F5DCBD] p-6 sm:p-7 shadow-xs flex flex-col justify-between"
            style={{
              backgroundImage: `url(${resolveMediaUrl(gameState.template.background_image) ?? gameSummeryBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="max-w-[260px] sm:max-w-[300px] space-y-3 mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-[#3D2E1F] leading-tight">
                The <span className="text-[#E8881E]">Cook &amp; Create</span>
                <br />
                Challenge
              </h1>
              <div
                className="text-xs sm:text-sm text-[#7A644D] leading-relaxed font-medium"
                dangerouslySetInnerHTML={{
                  __html:
                    gameState.template.description ||
                    'Work together to create the best dish with the given ingredients and steps. One player is secretly trying to spoil the dish. Can you spot the impostor and create a masterpiece together?',
                }}
              />
            </div>

            <div className="relative z-10">
              <h3 className="text-xs font-bold text-[#E8881E] uppercase tracking-wider mb-2.5">Rounds</h3>
              <div className="bg-[#FFF8EE]/95 backdrop-blur-xs rounded-2xl border border-[#F5E6D3] p-4 shadow-xs">
                <div className="grid grid-cols-3 gap-2 items-center">
                  {ROUNDS.map((round, i) => (
                    <div key={round.num} className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-center text-center">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFF3E0] border border-[#F5DEC3] flex items-center justify-center mb-2.5 shadow-inner">
                          <span className="absolute top-0 left-0 w-5 h-5 rounded-full bg-[#E8881E] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                            {round.num}
                          </span>
                          <img src={round.img} alt={round.title} className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-xs" />
                        </div>
                        <h4 className="text-xs font-bold text-[#3D2E1F] leading-tight">{round.title}</h4>
                        <p className="text-[11px] text-[#7A644D] font-medium mt-1 leading-snug max-w-[150px]">{round.desc}</p>
                      </div>
                      {i < ROUNDS.length - 1 && <ChevronRight size={16} className="text-[#E8881E]/40 shrink-0 mx-0.5" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="bg-[#FFF8EE] rounded-[28px] border border-[#F5DCBD] p-6 shadow-xs">
              <h3 className="text-base sm:text-lg font-black text-[#3D2E1F] text-center mb-5 tracking-tight">Key People in the Kitchen</h3>
              <div className="grid grid-cols-5 gap-3 text-center">
                {gameState.participants.map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-[3/4] rounded-2xl bg-[#FFF0DB]/80 border border-[#F5DEC3] overflow-hidden">
                      <img
                        src={portraitForRole(p.role_label, gameState.template)}
                        alt={p.role_label}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center 15%' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#3D2E1F] truncate w-full">
                      {p.role_label}
                      {p.isYou ? ' (You)' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="bg-[#FFF8EE] rounded-[28px] border border-[#F5DCBD] p-6 text-center flex flex-col items-center justify-between shadow-xs">
                <p className="text-sm font-black text-[#E8881E] leading-snug max-w-[180px]">Open the Secret Box to reveal your role.</p>
                <div className="my-3 flex justify-center">
                  <img
                    src={secretBoxImg}
                    alt="Secret Box"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain drop-shadow-lg animate-shake hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => setShowRoleModal(true)}
                  />
                </div>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="w-full py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-xs sm:text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer"
                >
                  Open Secret Box
                </button>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="bg-white rounded-[24px] border border-[#F5DCBD] p-4.5 flex items-start gap-3 shadow-xs">
                  <Info size={18} className="text-[#E8881E] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6E5A44] leading-relaxed font-medium">
                    All actions are anonymous. Think, observe and make the right move!
                  </p>
                </div>

                <div className="bg-white rounded-[24px] border border-[#F5DCBD] p-5 shadow-xs flex flex-col justify-between flex-1">
                  <p className="text-xs text-[#6E5A44] leading-relaxed font-medium mb-4">
                    You can view the Challenge brief only once. Remember the details!
                  </p>
                  <div className="bg-gradient-to-b from-[#FFF3E0] to-[#FFEAD1] rounded-2xl p-5 border border-[#F5CE9E] text-center shadow-xs">
                    <p className="text-xs font-bold text-[#6E5A44] mb-2">Heading to Round 1 in</p>
                    <div className="text-3xl font-black text-[#3D2E1F] font-mono tracking-widest">
                      {mm}:{ss}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={goToGame}
              className="w-full py-3.5 rounded-full text-white font-extrabold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FFB84D 0%, #E8881E 100%)', boxShadow: '0 4px 16px rgba(232,136,30,0.3)' }}
            >
              Continue to Round 1 →
            </button>
          </div>
        </div>
      </div>

      <RoleRevealModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        role={role}
        roleLabel={gameState.my_role_label ?? 'Chef'}
        impostorBiasCardHtml={gameState.impostor_bias_card}
      />
    </CookCreateLayout>
  );
}
