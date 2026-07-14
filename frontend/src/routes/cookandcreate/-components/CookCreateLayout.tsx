import type { ReactNode } from 'react';

interface CookCreateLayoutProps {
  children: ReactNode;
  breadcrumb: string;
}

export function CookCreateLayout({ children, breadcrumb }: CookCreateLayoutProps) {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#FFF8F0' }}
    >
      {/* Breadcrumb */}
      <div className="px-6 pt-4 pb-2">
        <span
          className="text-sm"
          style={{ color: '#8B7355' }}
        >
          {breadcrumb}
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        {children}
      </div>

      {/* Bottom-left wheat decoration */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-30"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wheat stalk 1 */}
          <path
            d="M30 200 Q45 150 60 120"
            stroke="#D4A44C"
            strokeWidth="3"
            fill="none"
          />
          <ellipse cx="55" cy="110" rx="8" ry="16" fill="#E8B94A" transform="rotate(-20 55 110)" />
          <ellipse cx="48" cy="130" rx="7" ry="14" fill="#D4A44C" transform="rotate(15 48 130)" />
          <ellipse cx="60" cy="135" rx="7" ry="14" fill="#E8B94A" transform="rotate(-25 60 135)" />
          <ellipse cx="42" cy="150" rx="6" ry="12" fill="#D4A44C" transform="rotate(20 42 150)" />
          <ellipse cx="58" cy="155" rx="6" ry="12" fill="#E8B94A" transform="rotate(-15 58 155)" />

          {/* Wheat stalk 2 */}
          <path
            d="M70 200 Q80 160 95 130"
            stroke="#C8963C"
            strokeWidth="2.5"
            fill="none"
          />
          <ellipse cx="92" cy="122" rx="7" ry="14" fill="#D4A44C" transform="rotate(-15 92 122)" />
          <ellipse cx="85" cy="140" rx="6" ry="12" fill="#C8963C" transform="rotate(20 85 140)" />
          <ellipse cx="95" cy="148" rx="6" ry="12" fill="#D4A44C" transform="rotate(-20 95 148)" />

          {/* Leaf accents */}
          <path
            d="M15 190 Q30 175 20 160"
            stroke="#D4A44C"
            strokeWidth="2"
            fill="none"
          />
          <ellipse cx="18" cy="165" rx="10" ry="5" fill="#E8B94A" transform="rotate(-40 18 165)" opacity="0.7" />
        </svg>
      </div>

      {/* Bottom-right wheat decoration */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-48 h-48">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'scaleX(-1)' }}
        >
          {/* Mirrored wheat stalks */}
          <path
            d="M30 200 Q45 150 60 120"
            stroke="#D4A44C"
            strokeWidth="3"
            fill="none"
          />
          <ellipse cx="55" cy="110" rx="8" ry="16" fill="#E8B94A" transform="rotate(-20 55 110)" />
          <ellipse cx="48" cy="130" rx="7" ry="14" fill="#D4A44C" transform="rotate(15 48 130)" />
          <ellipse cx="60" cy="135" rx="7" ry="14" fill="#E8B94A" transform="rotate(-25 60 135)" />
          <ellipse cx="42" cy="150" rx="6" ry="12" fill="#D4A44C" transform="rotate(20 42 150)" />
          <ellipse cx="58" cy="155" rx="6" ry="12" fill="#E8B94A" transform="rotate(-15 58 155)" />

          <path
            d="M70 200 Q80 160 95 130"
            stroke="#C8963C"
            strokeWidth="2.5"
            fill="none"
          />
          <ellipse cx="92" cy="122" rx="7" ry="14" fill="#D4A44C" transform="rotate(-15 92 122)" />
          <ellipse cx="85" cy="140" rx="6" ry="12" fill="#C8963C" transform="rotate(20 85 140)" />
          <ellipse cx="95" cy="148" rx="6" ry="12" fill="#D4A44C" transform="rotate(-20 95 148)" />

          <path
            d="M15 190 Q30 175 20 160"
            stroke="#D4A44C"
            strokeWidth="2"
            fill="none"
          />
          <ellipse cx="18" cy="165" rx="10" ry="5" fill="#E8B94A" transform="rotate(-40 18 165)" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
}
