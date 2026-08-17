import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { l as lobbyLogo } from "./Cook  and Create Logo-D7X4g-oO.js";
function formatRemaining(endsAt, clockOffsetMs) {
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return "--:--";
  const secs = Math.max(0, Math.round((end - (Date.now() + clockOffsetMs)) / 1e3));
  const mins = Math.floor(secs / 60);
  return `${String(mins).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}
function CookCreateHeader({
  showGameTimer = true,
  gameEndsAt = null,
  clockOffsetMs = 0,
  participantName = "Participant"
}) {
  const initials = participantName.trim().slice(0, 2).toUpperCase() || "P";
  const [remaining, setRemaining] = useState(
    () => gameEndsAt ? formatRemaining(gameEndsAt, clockOffsetMs) : "--:--"
  );
  useEffect(() => {
    if (!showGameTimer || !gameEndsAt) return;
    setRemaining(formatRemaining(gameEndsAt, clockOffsetMs));
    const id = setInterval(() => setRemaining(formatRemaining(gameEndsAt, clockOffsetMs)), 1e3);
    return () => clearInterval(id);
  }, [showGameTimer, gameEndsAt, clockOffsetMs]);
  return /* @__PURE__ */ jsxs("div", { className: "w-full bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#F0E4D4] shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("img", { src: lobbyLogo, alt: "Cook & Create", className: "w-9 h-9 object-contain" }),
      /* @__PURE__ */ jsx("span", { className: "text-lg font-extrabold text-[#3D2E1F]", children: "Cook & Create" })
    ] }),
    showGameTimer && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-[#FFF3E0] border border-[#E8881E]/15 rounded-xl px-4 py-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#8B7355] uppercase tracking-wider", children: "Game Time Remaining" }),
      /* @__PURE__ */ jsx("span", { className: "text-base font-extrabold text-[#3D2E1F] font-mono", children: remaining })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-[#FF8A65] text-white font-bold text-xs flex items-center justify-center shadow-sm", children: initials }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[#3D2E1F]", children: participantName })
    ] })
  ] });
}
export {
  CookCreateHeader as C
};
