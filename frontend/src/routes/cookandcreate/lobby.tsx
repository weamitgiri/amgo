import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Users, CalendarClock, Info, LogOut, BookOpen, Clock } from 'lucide-react';
import ruleIcon1 from '../../assets/cookandcreate/cook-game-rule-icon/icon1.png';
import ruleIcon2 from '../../assets/cookandcreate/cook-game-rule-icon/icon2.png';
import ruleIcon3 from '../../assets/cookandcreate/cook-game-rule-icon/icon3.png';
import ruleIcon4 from '../../assets/cookandcreate/cook-game-rule-icon/icon4.png';
import ruleIcon5 from '../../assets/cookandcreate/cook-game-rule-icon/icon5.png';
import ruleIcon6 from '../../assets/cookandcreate/cook-game-rule-icon/icon6.png';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { PlayerAvatar } from './-components/PlayerAvatar';
import { CountdownTimer } from './-components/CountdownTimer';
import { CC } from './-components/cc-theme';
import lobbyBg from '../../assets/cookandcreate/game-2-lobby-bg.jpg';
import lobbyLogo from '../../assets/cookandcreate/Cook  and Create Logo.png';
import decorLeft from '../../assets/cookandcreate/decor-left.png';
import decorRight from '../../assets/cookandcreate/decor-right.png';
import { cookAndCreateService } from '@/api/services/cookandcreate.service';
import type { CCGameStateResponse } from '@/api/types/cookandcreate';
import { getParticipantSession } from '@/lib/participant-session';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toastError } from '@/lib/toast';
import { getSocket } from '@/lib/socket';
import { clockOffsetMs } from './-components/clock';

export const Route = createFileRoute('/cookandcreate/lobby')({
  component: LobbyPage,
});

// Fallback only — used before the API responds, or if an admin hasn't set
// any rules yet for this template (Laravel admin: Cook & Create > Templates).
const DEFAULT_RULE_TEXTS = [
  'Play 3 rounds: Ingredients → Steps → Elimination.',
  'Select ingredients and submit one step, actions are time-bound.',
  'All actions are anonymous, observe patterns carefully.',
  'One player is the hidden Impostor trying to mislead the group.',
  'Use clues to identify suspicious actions.',
  'Vote wisely to eliminate the Impostor and win.',
];
// Custom per-rule icons (icon1–6), matching the design (cycled if an admin adds more).
const RULE_PNG_ICONS = [ruleIcon1, ruleIcon2, ruleIcon3, ruleIcon4, ruleIcon5, ruleIcon6];

/* ---------- sub-components ---------- */

function Card({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        backgroundColor: CC.card,
        border: `1px solid ${CC.cardBorder}`,
        boxShadow: CC.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-5 py-3 flex-1"
      style={{
        border: `1px solid ${CC.border}`,
        backgroundColor: CC.primaryPale,
      }}
    >
      <span className="text-xs font-medium" style={{ color: CC.textMuted }}>
        {label}
      </span>
      <span className="text-lg font-bold mt-0.5" style={{ color: CC.text }}>
        {value}
      </span>
    </div>
  );
}

const AVATAR_COLORS = [0, 1, 2, 3, 4, 5];

/* ---------- main page ---------- */

function LobbyPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const [gameState, setGameState] = useState<CCGameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineParticipantIds, setOnlineParticipantIds] = useState<Set<number> | null>(null);
  const [clockOffset, setClockOffset] = useState(0);

  const fetchState = useCallback(async () => {
    if (!session?.groupId || !session.participantId) return;
    try {
      const data = await cookAndCreateService.getGameState(session.groupId, session.participantId);
      setGameState(data);
      setClockOffset(clockOffsetMs(data.schedule, Date.now()));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not load Cook & Create state.');
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

  // The lobby used to be a one-shot fetch with no live connection at all —
  // other players joining, or going online/offline, never showed up without
  // a manual refresh. Join the presence room and poll as a fallback (same
  // pattern as game.tsx) so the player list here actually stays live.
  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    const socket = getSocket();
    const joinPresence = () => {
      socket.emit('join_lobby', { groupId: session.groupId, participantId: session.participantId });
      socket.emit('request_presence', { groupId: session.groupId });
    };
    joinPresence();

    // Re-join the presence room and refetch on every (re)connect — Socket.IO
    // reuses the same client Socket across reconnects, so this effect never
    // re-runs on its own, leaving the reconnected socket out of group_${groupId}.
    // `connect` fires on each successful (re)connect.
    const rejoin = () => {
      joinPresence();
      fetchState();
    };
    socket.on('connect', rejoin);

    const onPresenceUpdated = (payload: { online_participant_ids?: number[] }) => {
      setOnlineParticipantIds(new Set(payload.online_participant_ids ?? []));
    };
    socket.on('presence_updated', onPresenceUpdated);

    const refetch = () => fetchState();
    socket.on('lobby_updated', refetch);

    const interval = setInterval(fetchState, 10000);

    return () => {
      socket.off('connect', rejoin);
      socket.off('presence_updated', onPresenceUpdated);
      socket.off('lobby_updated', refetch);
      clearInterval(interval);
    };
  }, [session?.groupId, session?.participantId, fetchState]);

  useEffect(() => {
    if (gameState && gameState.instance.status !== 'waiting') {
      // First stop after the lobby is the Challenge Brief / role-reveal
      // screen — summary.tsx sends the player on to /game itself.
      navigate({ to: '/cookandcreate/summary' });
    }
  }, [gameState, navigate]);

  const players = gameState?.participants ?? [];
  const groupCapacity = 5;
  const joined = players.length;
  const remaining = Math.max(0, groupCapacity - joined);
  const ruleTexts =
    gameState && gameState.rules.length > 0 ? gameState.rules.map((r) => r.rule_text) : DEFAULT_RULE_TEXTS;
  const durationMin = Math.round((gameState?.schedule.game_duration_secs ?? 1500) / 60);
  const rules: { iconImg: string | null; text: string }[] = ruleTexts.map((text, i) => ({
    iconImg: RULE_PNG_ICONS[i % RULE_PNG_ICONS.length],
    text,
  }));
  // Always show the game duration as the final rule (clock icon), per the design.
  rules.push({ iconImg: null, text: `Game Duration: ${durationMin} Minutes` });

  return (
    <CookCreateLayout breadcrumb="Cook & Create / Lobby">
      <img src={decorLeft} alt="" className="fixed bottom-0 left-0 w-32 md:w-48 opacity-80 pointer-events-none z-0" />
      <img src={decorRight} alt="" className="fixed bottom-0 right-0 w-40 md:w-64 opacity-80 pointer-events-none z-0" />
      <div className="flex flex-col gap-5 relative z-10">
        <CookCreateHeader participantName={session?.name} showGameTimer={false} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 overflow-hidden relative self-start" style={{ padding: 0 }}>
            <div
              className="relative flex flex-col md:flex-row items-center min-h-[300px] md:min-h-0 md:aspect-[1323/573] bg-cover bg-center"
              style={{ backgroundImage: `url(${lobbyBg})` }}
            >
              <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                 <img src={lobbyLogo} alt="Cook & Create Logo" className="w-full max-w-[180px] drop-shadow-2xl" />
              </div>
              <div className="flex-1 p-6 md:pr-8 relative z-10">
                <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                  <h1
                    className="text-2xl md:text-3xl font-bold leading-tight mb-3"
                    style={{ color: CC.text }}
                  >
                    Welcome to<br />
                    Cook &amp; Create
                  </h1>
                  <p
                    className="text-sm leading-relaxed font-medium"
                    style={{ color: CC.textMuted }}
                  >
                    {gameState?.template.description || 'Work together to create the best dish while finding the hidden imposter in your team'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4" style={{ color: CC.text }}>
              <BookOpen size={20} style={{ color: CC.primary }} /> Game Rules
            </h2>
            <div className="flex flex-col gap-3.5">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  {rule.iconImg ? (
                    <img src={rule.iconImg} alt="" className="w-[22px] h-[22px] object-contain shrink-0 mt-0.5" />
                  ) : (
                    <Clock size={20} strokeWidth={1.75} className="shrink-0 mt-0.5" style={{ color: CC.primary }} />
                  )}
                  <span className="text-sm leading-relaxed" style={{ color: CC.textMuted }}>
                    {rule.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} style={{ color: CC.primary }} />
              <h2 className="text-lg font-bold" style={{ color: CC.text }}>
                Your Group &amp; Status
              </h2>
            </div>

            <div className="flex gap-3 mb-6">
              <StatBox label="Group Capacity" value={groupCapacity} />
              <StatBox label="Joined" value={joined} />
              <StatBox label="Remaining" value={remaining} />
            </div>

            <div className="flex items-start gap-4 flex-wrap">
              {players.map((p, i) => (
                <PlayerAvatar
                  key={p.id}
                  name={p.name}
                  colorIndex={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                  size="lg"
                  status={
                    p.isYou || (onlineParticipantIds ? onlineParticipantIds.has(p.id) : p.status === 'online')
                      ? 'ready'
                      : 'waiting'
                  }
                  isYou={p.isYou}
                />
              ))}
              {Array.from({ length: remaining }).map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-1">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 48,
                      height: 48,
                      border: '2px dashed #D0D0D0',
                      backgroundColor: '#F9F9F9',
                    }}
                  >
                    <span className="text-lg" style={{ color: '#BDBDBD' }}>?</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#9E9E9E' }}>
                    Waiting
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock size={20} style={{ color: CC.primary }} />
              <h2 className="text-lg font-bold" style={{ color: CC.text }}>
                Event Status
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: CC.textMuted }}>
              {loading
                ? 'Loading...'
                : remaining > 0
                  ? 'Ensure all the participants have joined and groups are complete'
                  : 'Game starting soon'}
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              <div
                className="flex-1 rounded-xl p-4 flex items-start gap-3"
                style={{ backgroundColor: CC.primaryPale, border: `1px solid ${CC.border}` }}
              >
                <Info size={20} className="shrink-0 mt-0.5" style={{ color: CC.primary }} />
                <p className="text-xs leading-relaxed" style={{ color: CC.textMuted }}>
                  Your group requires exactly {groupCapacity} participants. The game will start automatically once
                  all players have joined at the scheduled time. Please contact your organizer to
                  complete your group.
                </p>
              </div>

              <div
                className="flex flex-col items-center justify-center rounded-xl px-5 py-3 shrink-0"
                style={{ backgroundColor: CC.primaryPale, border: `1px solid ${CC.border}` }}
              >
                <CountdownTimer
                  targetAt={gameState?.schedule.game_starts_at ?? null}
                  clockOffsetMs={clockOffset}
                  variant="large"
                  label="Game Starts in"
                  emptyLabel="--:--"
                />
              </div>
            </div>

            <button
              className="mt-5 w-full py-3.5 rounded-full text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${CC.gold} 0%, ${CC.primary} 100%)`,
                boxShadow: '0 4px 16px rgba(232,136,30,0.3)',
              }}
              onClick={() => navigate({ to: '/' })}
            >
              <LogOut size={18} /> Leave Lobby
            </button>
          </Card>
        </div>
      </div>
    </CookCreateLayout>
  );
}
