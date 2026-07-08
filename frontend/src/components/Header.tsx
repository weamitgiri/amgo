import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
        <div className={`flex items-center justify-between gap-4 rounded-full border px-3 py-2 pl-4 backdrop-blur-xl ${floating ? "border-white/10 bg-white/5" : "border-border bg-card/80 shadow-card"}`}>
          <Link to="/">
            <Flogo light={floating} />
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((item) => {
              const active = item.to === location.pathname;
              return (
                <a
                  key={item.label}
                  href={item.to as string}
                  className={`text-sm transition-colors relative ${
                    floating ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"
                  } ${active ? (floating ? "text-white" : "text-foreground font-medium") : ""}`}
                >
                  {item.label}
                  {active && (
                    <span className={`absolute -bottom-2 left-0 right-0 h-[2px] rounded-full ${floating ? "bg-white" : "bg-primary"}`} />
                  )}
                </a>
              );
            })}
          </nav>
          <Link to="/login" className="group flex items-center gap-2 rounded-full bg-white pl-5 pr-1.5 py-1.5 text-sm font-medium text-foreground shadow-sm">
            Login
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
