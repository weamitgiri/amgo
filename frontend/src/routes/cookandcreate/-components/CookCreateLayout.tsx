import type { ReactNode } from 'react';
import decorLeft from '../../../assets/cookandcreate/decor-left.png';
import decorRight from '../../../assets/cookandcreate/decor-right.png';

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
          className="text-sm font-semibold"
          style={{ color: '#8B7355' }}
        >
          {breadcrumb}
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
        {children}
      </div>

      {/* Bottom-left leaf decoration */}
      <img
        src={decorLeft}
        alt=""
        className="pointer-events-none fixed bottom-0 left-0 w-44 md:w-56 opacity-90 z-0 select-none"
      />

      {/* Bottom-right leaf decoration */}
      <img
        src={decorRight}
        alt=""
        className="pointer-events-none fixed bottom-0 right-0 w-52 md:w-64 opacity-90 z-0 select-none"
      />
    </div>
  );
}

