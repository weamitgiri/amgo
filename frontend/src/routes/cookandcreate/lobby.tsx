import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Users, CalendarClock, Info, LogOut, BookOpen, Clock } from 'lucide-react';
import ruleIcon from '../../assets/cookandcreate/cook-game-rule-icon/icon.png';
import ruleIcon1 from '../../assets/cookandcreate/cook-game-rule-icon/icon1.png';
import ruleIcon2 from '../../assets/cookandcreate/cook-game-rule-icon/icon2.png';
import ruleIcon3 from '../../assets/cookandcreate/cook-game-rule-icon/icon3.png';
import ruleIcon4 from '../../assets/cookandcreate/cook-game-rule-icon/icon4.png';
import ruleIcon5 from '../../assets/cookandcreate/cook-game-rule-icon/icon5.png';
import ruleIcon6 from '../../assets/cookandcreate/cook-game-rule-icon/icon6.png';
import gameIcon from '../../assets/cookandcreate/cook-game-rule-icon/game.png';
import gameW from '../../assets/cookandcreate/cook-game-rule-icon/game-w.png';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { PlayerAvatar } from './-components/PlayerAvatar';
import { CountdownTimer } from './-components/CountdownTimer';
import { CC } from './-components/cc-theme';
import lobbyBg from '../../assets/cookandcreate/game-2-lobby-bg.jpg';
import lobbyLogo from '../../assets/cookandcreate/Cook  and Create Logo.png';
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
const RULE_PNG_ICONS = [ruleIcon,ruleIcon1, ruleIcon2, ruleIcon3, ruleIcon4, ruleIcon5, ruleIcon6];

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

function StatBox({ label, value, last }: { label: string; value: string | number; last?: boolean }) {
  return (
    <div
      className="flex-1 px-5 py-3.5"
      style={last ? undefined : { borderRight: `1px solid ${CC.border}` }}
    >
      <span className="block text-sm font-medium" style={{ color: CC.textMuted }}>
        {label}
      </span>
      <span className="block text-lg font-bold mt-1" style={{ color: CC.text }}>
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
    <CookCreateLayout maxWidthClass="max-w-[1360px]">
      {/* Corner leaf decorations are rendered once by CookCreateLayout — no
          duplicate set here (two overlapping copies looked broken). */}
      <div className="flex flex-col gap-5 relative z-10">
        <CookCreateHeader participantName={session?.name} showGameTimer={false} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <Card className="lg:col-span-2 overflow-hidden relative" style={{ padding: 0 }}>
            <div
              className="relative flex flex-col md:flex-row items-center min-h-[300px] lg:h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${lobbyBg})` }}
            >
              <div className="flex items-center justify-center p-6 relative z-10 md:basis-[38%] md:shrink-0">
                 <img src={lobbyLogo} alt="Cook & Create Logo" className="w-full max-w-[190px] drop-shadow-2xl ml-[156px] mb-[69px]" />
              </div>
              <div className="flex-1 p-6 md:pl-2 md:pr-8 relative z-10">
                <div
                  className="backdrop-md rounded-2xl p-6 border border-white/50 shadow-lg ml-[22px]"
                  style={{ backgroundColor: 'rgba(254, 198, 107, 0.5)',width: '303px'}}
                >
                  <h1
                    className="text-2xl md:text-3xl font-bold leading-tight mb-3"
                    style={{ color: '#2e2e2e' }}
                  >
                    Welcome to<br />
                    Cook &amp; Create
                  </h1>
                  <p
                    className="text-sm leading-relaxed font-medium"
                    style={{ color: '#2e2e2e' }}
                  >
                    {/*{gameState?.template.description || 'Work together to create the best dish while finding the hidden imposter in your team.'}*/}
                    {'Work together to create the best dish while finding the hidden imposter in your team.' || 'Work together to create the best dish while finding the hidden imposter in your team.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-1 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4" style={{ color: CC.text }}>
              {/*<BookOpen size={20} style={{ color: CC.primary }} /> Game Rules*/} Game Rules
            </h2>
            <div className="flex flex-col gap-2.5">
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
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 40, height: 40, backgroundColor: '#F8F3E3' }}
              >
                <Users size={20} style={{ color: CC.primary }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: CC.text }}>
                Your Group &amp; Status
              </h2>
            </div>

            <div
              className="flex rounded-xl mb-6 overflow-hidden"
              style={{ border: `1px solid ${CC.border}`, backgroundColor: '#FEFDFB' }}
            >
              <StatBox label="Group Capacity" value={groupCapacity} />
              <StatBox label="Joined" value={joined} />
              <StatBox label="Remaining" value={remaining} last />
            </div>

            <div className="flex items-start gap-18 flex-wrap">
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
            <div className="flex items-start gap-3 mb-4">
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 40, height: 40, backgroundColor: '#F8F3E3' }}
              >
                 
                <img src={gameIcon} alt="" className="w-[22px] h-[22px] object-contain shrink-0 mt-0.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: CC.text }}>
                  Event Status
                </h2>
                <p className="text-sm" style={{ color: CC.textMuted }}>
                  {loading
                    ? 'Loading...'
                    : remaining > 0
                      ? 'Ensure all the participants have joined and groups are complete'
                      : 'Game starting soon'}
                </p>
              </div>
            </div>

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
                style={{ backgroundColor: '#FAE5C9', border: '1px solid #F2DCBA' }}
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
                background: '#f39e3a',
                boxShadow: '0 4px 16px rgba(243,158,58,0.35)',
              }}
              onClick={() => navigate({ to: '/' })}
            >
              <img src={gameW} alt="" className="w-[22px] h-[22px] object-contain shrink-0 mt-0.5" /> Leave Lobby
            </button>
          </Card>
        </div>
      </div>
    </CookCreateLayout>
  );
}
