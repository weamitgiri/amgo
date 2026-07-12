import { jsxs, jsx } from "react/jsx-runtime";
import { ArrowRight } from "lucide-react";
function PillButton({
  children,
  variant = "primary",
  withArrow = true,
  className = "",
  ...props
}) {
  const base = "group inline-flex items-center gap-2 rounded-full text-sm font-medium transition-all";
  const styles = {
    light: "bg-white text-foreground pl-5 pr-1.5 py-1.5 shadow-card hover:shadow-elevated",
    outline: "border border-foreground/30 text-foreground px-5 py-2.5 hover:bg-foreground hover:text-background",
    "outline-light": "border border-white/40 text-white px-5 py-2.5 hover:bg-white hover:text-foreground",
    primary: "bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow hover:shadow-elevated"
  };
  return /* @__PURE__ */ jsxs("button", { className: `${base} ${styles[variant]} ${className}`, ...props, children: [
    children,
    withArrow && (variant === "light" || variant === "primary") && /* @__PURE__ */ jsx("span", { className: `grid h-8 w-8 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 ${variant === "light" ? "bg-gradient-primary text-white" : "bg-white/20 text-white"}`, children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }) })
  ] });
}
export {
  PillButton as P
};
