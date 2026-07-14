import { createFileRoute } from '@tanstack/react-router';
import { Users, CalendarClock, AlertTriangle } from 'lucide-react';
import { CookCreateLayout } from './-components/CookCreateLayout';
import { CookCreateHeader } from './-components/CookCreateHeader';
import { PlayerAvatar } from './-components/PlayerAvatar';
import { CountdownTimer } from './-components/CountdownTimer';
import { CC } from './-components/cc-theme';

export const Route = createFileRoute('/cookandcreate/lobby')({
  component: LobbyPage,
});

/* ---------- mock data ---------- */
const PLAYERS = [
  { name: 'Mark32', colorIndex: 0, status: 'ready' as const, isYou: true },
  { name: 'John32', colorIndex: 1, status: 'ready' as const },
  { name: 'James45', colorIndex: 2, status: 'ready' as const },
  { name: 'Fred36', colorIndex: 3, status: 'ready' as const },
];

const RULES = [
  { emoji: '🎮', text: 'Play 3 rounds: Ingredients → Steps → Elimination.' },
  { emoji: '✏️', text: 'Select ingredients and submit one step, actions are time-bound.' },
  { emoji: '👁️', text: 'All actions are anonymous, observe patterns carefully.' },
  { emoji: '🕵️', text: 'One player is the hidden Impostor trying to mislead the group.' },
  { emoji: '🔍', text: 'Use clues to identify suspicious actions.' },
  { emoji: '🗳️', text: 'Vote wisely to eliminate the Impostor and win.' },
  { emoji: '⏱️', text: 'Game Duration: 25 Minutes' },
];

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

/* ---------- main page ---------- */

function LobbyPage() {
  return (
    <CookCreateLayout breadcrumb="Cook & Create / Lobby">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <CookCreateHeader />

        {/* Two-column: Hero + Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: Hero Banner (3 cols) */}
          <Card className="lg:col-span-3 overflow-hidden" style={{ padding: 0 }}>
            <div
              className="relative flex flex-col md:flex-row items-center min-h-[260px]"
              style={{
                background: `linear-gradient(135deg, ${CC.primaryLight} 0%, #FFE0B2 100%)`,
              }}
            >
              {/* Cooking scene area */}
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center">
                  {/* Decorative cooking emojis */}
                  <span className="absolute top-2 left-4 text-4xl opacity-80 animate-pulse">🍳</span>
                  <span className="absolute top-6 right-6 text-3xl opacity-70" style={{ animationDelay: '0.5s' }}>🧑‍🍳</span>
                  <span className="absolute bottom-8 left-8 text-3xl opacity-70">🥘</span>
                  <span className="absolute bottom-4 right-4 text-4xl opacity-60">🍲</span>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">👨‍🍳</span>
                  {/* Decorative circles */}
                  <div
                    className="absolute w-28 h-28 rounded-full opacity-20"
                    style={{ backgroundColor: CC.gold, top: '20%', left: '15%' }}
                  />
                  <div
                    className="absolute w-20 h-20 rounded-full opacity-15"
                    style={{ backgroundColor: CC.primary, bottom: '15%', right: '20%' }}
                  />
                </div>
              </div>

              {/* Text side */}
              <div className="flex-1 p-6 md:pr-8">
                <h1
                  className="text-2xl md:text-3xl font-bold leading-tight mb-3"
                  style={{ color: CC.text }}
                >
                  Welcome to<br />
                  <span style={{ color: CC.primary }}>Cook &amp; Create</span>
                </h1>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: CC.textMuted }}
                >
                  Work together to create the best dish while finding the hidden imposter in your team
                </p>
              </div>
            </div>
          </Card>

          {/* Right: Game Rules (2 cols) */}
          <Card className="lg:col-span-2 p-6">
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: CC.text }}
            >
              📖 Game Rules
            </h2>
            <div className="flex flex-col gap-3">
              {RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{rule.emoji}</span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: CC.textMuted }}
                  >
                    {rule.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Two cards side by side: Group & Status + Event Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Your Group & Status */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} style={{ color: CC.primary }} />
              <h2 className="text-lg font-bold" style={{ color: CC.text }}>
                Your Group &amp; Status
              </h2>
            </div>

            {/* Stat boxes */}
            <div className="flex gap-3 mb-6">
              <StatBox label="Group Capacity" value={5} />
              <StatBox label="Joined" value={4} />
              <StatBox label="Remaining" value={1} />
            </div>

            {/* Player avatars */}
            <div className="flex items-start gap-4 flex-wrap">
              {PLAYERS.map((p, i) => (
                <PlayerAvatar
                  key={p.name}
                  name={p.name}
                  colorIndex={p.colorIndex}
                  size="lg"
                  status={p.status}
                  isYou={p.isYou}
                />
              ))}
              {/* Empty waiting slot */}
              <div className="flex flex-col items-center gap-1">
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
                <div className="flex items-center gap-1">
                  <div
                    className="rounded-full border"
                    style={{
                      width: 8,
                      height: 8,
                      borderColor: '#9E9E9E',
                    }}
                  />
                  <span className="text-[10px]" style={{ color: '#9E9E9E' }}>
                    Waiting for participant
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Event Status */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock size={20} style={{ color: CC.primary }} />
              <h2 className="text-lg font-bold" style={{ color: CC.text }}>
                Event Status
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: CC.textMuted }}>
              Waiting for all participants to join
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Warning box */}
              <div
                className="flex-1 rounded-xl p-4 flex items-start gap-3"
                style={{
                  backgroundColor: CC.primaryLight,
                  border: `1px solid ${CC.gold}`,
                }}
              >
                <AlertTriangle
                  size={20}
                  className="shrink-0 mt-0.5"
                  style={{ color: CC.primary }}
                />
                <p className="text-xs leading-relaxed" style={{ color: CC.textOrange }}>
                  Your group requires exactly 5 participants. The game will start automatically once
                  all players have joined at the scheduled time. Please contact your organizer to
                  complete your group.
                </p>
              </div>

              {/* Countdown */}
              <div className="flex flex-col items-center justify-center">
                <CountdownTimer
                  initialMinutes={2}
                  initialSeconds={45}
                  variant="large"
                  label="Game Starts in"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Leave Lobby Button */}
        <button
          className="w-full py-4 rounded-full text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${CC.gold} 0%, ${CC.primary} 100%)`,
            boxShadow: '0 4px 16px rgba(232,136,30,0.3)',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.boxShadow =
              '0 6px 24px rgba(232,136,30,0.4)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.boxShadow =
              '0 4px 16px rgba(232,136,30,0.3)';
          }}
        >
          🚪 Leave Lobby
        </button>
      </div>
    </CookCreateLayout>
  );
}
