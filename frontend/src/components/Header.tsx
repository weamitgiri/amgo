import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, LogIn } from "lucide-react";
import { Flogo } from "./Flogo";

const NAV = [
  { label: "Overview", to: "/" as const },
  { label: "Activities", to: "/#activities" },
  { label: "How It Works", to: "/#how" },
  { label: "Pricing", to: "/#pricing" },
  { label: "Contact", to: "/#contact" },
];

export function Header({ floating = false }: { floating?: boolean }) {
  const location = useLocation();
  return (
    <header className={floating ? "absolute top-6 left-0 right-0 z-30 px-4" : "sticky top-4 z-30 px-4"}>
      <div className="mx-auto max-w-6xl">
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[2rem] border px-4 py-3 backdrop-blur-xl ${floating ? "border-white/20 bg-white/10" : "border-border bg-card/80 shadow-card"}`}>
          <div className="flex justify-start">
            <Link to="/">
              <Flogo light={floating} width={230} height={65} />
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-8 justify-center">
            {NAV.map((item) => {
              const active = item.to === location.pathname;
              return (
                <a
                  key={item.label}
                  href={item.to as string}
                  className={`text-sm transition-colors ${
                    floating ? "text-[#B7B7B7] hover:text-white" : "text-foreground/70 hover:text-foreground"
                  } ${active ? (floating ? "text-white font-medium" : "text-foreground font-medium") : ""}`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="flex justify-end">
            <Link to="/login" className="group flex items-center gap-2 rounded-full border border-border bg-white pl-5 pr-1.5 py-1.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors">
              Login
              <span className="grid h-9 w-9 place-items-center rounded-full bg-purple-100 text-[#8B5CF6] transition-transform group-hover:translate-x-0.5">
                <LogIn className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
