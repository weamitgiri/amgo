import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";

type Variant = "light" | "outline" | "primary" | "outline-light";

export function PillButton({
  children,
  variant = "primary",
  withArrow = true,
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; withArrow?: boolean }) {
  const base = "group inline-flex items-center gap-2 rounded-full text-sm font-medium transition-all";
  const styles: Record<Variant, string> = {
    light: "bg-white text-foreground pl-5 pr-1.5 py-1.5 shadow-card hover:shadow-elevated",
    outline: "border border-foreground/30 text-foreground px-5 py-2.5 hover:bg-foreground hover:text-background",
    "outline-light": "border border-white/40 text-white px-5 py-2.5 hover:bg-white hover:text-foreground",
    primary: "bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow hover:shadow-elevated",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
      {withArrow && (variant === "light" || variant === "primary") && (
        <span className={`grid h-8 w-8 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 ${variant === "light" ? "bg-gradient-primary text-white" : "bg-white/20 text-white"}`}>
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
