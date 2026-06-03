import { c as createLucideIcon } from "./Logo-COJrqD4D.js";
import { L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { A as ArrowRight } from "./arrow-right-h3or2hTG.js";
const __iconNode$1 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
];
const Share2 = createLucideIcon("share-2", __iconNode);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `${base} ${styles[variant]} ${className}`, ...props, children: [
    children,
    withArrow && (variant === "light" || variant === "primary") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-8 w-8 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 ${variant === "light" ? "bg-gradient-primary text-white" : "bg-white/20 text-white"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
  ] });
}
export {
  Check as C,
  PillButton as P,
  Share2 as S
};
