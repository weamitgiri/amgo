import { CountdownTimer } from './CountdownTimer';

interface CookCreateHeaderProps {
  showGameTimer?: boolean;
  timerMinutes?: number;
  timerSeconds?: number;
}

export function CookCreateHeader({
  showGameTimer = false,
  timerMinutes = 25,
  timerSeconds = 0,
}: CookCreateHeaderProps) {
  return (
    <div
      className="w-full rounded-2xl px-6 py-4 flex items-center justify-between"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #F0E4D4',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🍳</span>
        <span
          className="text-lg font-bold"
          style={{ color: '#3D2E1F' }}
        >
          Cook &amp; Create
        </span>
      </div>

      {/* Center: Game Timer (optional) */}
      {showGameTimer && (
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ color: '#8B7355' }}
          >
            Game Time Remaining
          </span>
          <CountdownTimer
            initialMinutes={timerMinutes}
            initialSeconds={timerSeconds}
            variant="badge"
          />
        </div>
      )}

      {/* Right: User Avatar */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-medium"
          style={{ color: '#3D2E1F' }}
        >
          Sneha Kapoor
        </span>
        <div
          className="flex items-center justify-center rounded-full text-white font-semibold text-sm"
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #E91E63 0%, #FF5722 100%)',
          }}
        >
          SK
        </div>
      </div>
    </div>
  );
}
