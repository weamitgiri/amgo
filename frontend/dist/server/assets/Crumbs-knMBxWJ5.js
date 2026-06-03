import { L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { L as Link } from "./router-DZhViOq_.js";
import { c as createLucideIcon } from "./Logo-COJrqD4D.js";
import { C as ChevronRight } from "./chevron-right-B_AJoG7h.js";
const __iconNode = [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "r6nss1"
    }
  ]
];
const House = createLucideIcon("house", __iconNode);
function Crumbs({
  items,
  className = "",
  tone = "light"
}) {
  const base = tone === "dark" ? "text-white/60" : "text-muted-foreground";
  const link = tone === "dark" ? "hover:text-white text-white/70" : "hover:text-foreground";
  const current = tone === "dark" ? "text-white font-medium" : "text-foreground font-medium";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "nav",
    {
      "aria-label": "Breadcrumb",
      className: `flex items-center gap-1.5 text-xs ${base} ${className}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "flex flex-wrap items-center gap-1.5", children: items.map((it, i) => {
        const isLast = i === items.length - 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "inline-flex items-center gap-1.5", children: [
          i === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-3.5 w-3.5 opacity-70" }),
          it.to && !isLast ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: it.to, className: `transition-colors ${link}`, children: it.label }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isLast ? current : "", children: it.label }),
          !isLast && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 opacity-60" })
        ] }, i);
      }) })
    }
  );
}
export {
  Crumbs as C
};
