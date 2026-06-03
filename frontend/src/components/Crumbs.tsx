import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; to?: string };

export function Crumbs({
  items,
  className = "",
  tone = "light",
}: {
  items: Crumb[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const base =
    tone === "dark"
      ? "text-white/60"
      : "text-muted-foreground";
  const link =
    tone === "dark"
      ? "hover:text-white text-white/70"
      : "hover:text-foreground";
  const current =
    tone === "dark" ? "text-white font-medium" : "text-foreground font-medium";

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs ${base} ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="inline-flex items-center gap-1.5">
              {i === 0 && <Home className="h-3.5 w-3.5 opacity-70" />}
              {it.to && !isLast ? (
                <Link to={it.to} className={`transition-colors ${link}`}>
                  {it.label}
                </Link>
              ) : (
                <span className={isLast ? current : ""}>{it.label}</span>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
