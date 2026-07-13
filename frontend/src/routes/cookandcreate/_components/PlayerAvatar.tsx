const AVATAR_COLORS = [
  '#E91E63',
  '#2196F3',
  '#3F51B5',
  '#9C27B0',
  '#009688',
  '#FF9800',
  '#4CAF50',
  '#F44336',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface PlayerAvatarProps {
  name: string;
  colorIndex?: number;
  size?: 'sm' | 'md' | 'lg';
  status?: 'ready' | 'available' | 'submitting' | 'waiting';
  isYou?: boolean;
}

const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

const FONT_SIZE_MAP = {
  sm: '11px',
  md: '14px',
  lg: '16px',
} as const;

export function PlayerAvatar({
  name,
  colorIndex = 0,
  size = 'md',
  status,
  isYou = false,
}: PlayerAvatarProps) {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const px = SIZE_MAP[size];
  const initials = getInitials(name);

  const statusConfig = status
    ? {
        ready: { color: '#4CAF50', label: 'Ready' },
        available: { color: '#4CAF50', label: 'Available' },
        submitting: { color: '#FF9800', label: 'Submitting' },
        waiting: { color: '#9E9E9E', label: 'Waiting for participant' },
      }[status]
    : null;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Avatar circle */}
      <div
        className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
        style={{
          width: px,
          height: px,
          backgroundColor: color,
          fontSize: FONT_SIZE_MAP[size],
        }}
      >
        {initials}
      </div>

      {/* Name */}
      <span
        className="text-xs font-medium text-center leading-tight max-w-[80px] truncate"
        style={{ color: '#3D2E1F' }}
      >
        {name}
        {isYou && (
          <span className="text-[#8B7355]"> (You)</span>
        )}
      </span>

      {/* Status badge */}
      {statusConfig && (
        <div className="flex items-center gap-1">
          {status === 'waiting' ? (
            <div
              className="rounded-full border"
              style={{
                width: 8,
                height: 8,
                borderColor: '#9E9E9E',
              }}
            />
          ) : (
            <div
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: statusConfig.color,
              }}
            />
          )}
          <span
            className="text-[10px]"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>
      )}
    </div>
  );
}
