export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none">
          <path d="M5 6h12L7 18h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`font-bold text-lg tracking-tight ${light ? "text-white" : "text-gradient-primary"}`}>
          Zoventro
        </div>
        <div className={`text-[10px] ${light ? "text-white/60" : "text-muted-foreground"}`}>
          Interactive Team Experiences
        </div>
      </div>
    </div>
  );
}
