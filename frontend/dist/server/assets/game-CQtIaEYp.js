import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Check, X, AlertTriangle, Zap, Utensils, Lock, Send } from "lucide-react";
import { c as cookAndCreateService, C as CookCreateLayout } from "./cookandcreate.service-Du5PpCKA.js";
import { C as CookCreateHeader } from "./CookCreateHeader-BUnxok9H.js";
import { s as step1Img, a as step2Img, b as step4Img } from "./game-flow-step-4-bfvJ_dgk.js";
import { r as resolveMediaUrl } from "./media-DMImknnw.js";
import { p as portraitForRole } from "./portraits-DA5ZYneF.js";
import { c as clockOffsetMs } from "./clock-Bllaa3En.js";
import { g as getParticipantSession } from "./participant-session-CZEpXMRe.js";
import { g as getSocket } from "./socket-Bwou9MYK.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import "./router-BvkvNwFV.js";
import "@tanstack/react-query";
import "sonner";
import "./config-OQZNPa_v.js";
import "./Cook  and Create Logo-D7X4g-oO.js";
import "socket.io-client";
const STEPS = [
  { num: "01", img: step1Img, label: "Ingredients" },
  { num: "02", img: step2Img, label: "Steps" },
  { num: "03", img: step4Img, label: "Elimination" }
];
function RoundProgress({ currentRound }) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: STEPS.map((step, i) => {
    const isActive = i + 1 === currentRound;
    const isPast = i + 1 < currentRound;
    const activeColor = isActive || isPast ? "#E8881E" : "#A08C78";
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        isPast ? /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded-full bg-[#36B37E] text-white flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Check, { size: 12, strokeWidth: 3 }) }) : /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0",
            style: { backgroundColor: activeColor },
            children: step.num
          }
        ),
        /* @__PURE__ */ jsx("img", { src: step.img, alt: step.label, className: "w-7 h-7 object-contain" }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-xs font-bold",
            style: { color: activeColor },
            children: step.label
          }
        )
      ] }),
      i < STEPS.length - 1 && /* @__PURE__ */ jsx("span", { className: "text-[#D4A44C] opacity-60 text-xs px-0.5", children: "→" })
    ] }, step.num);
  }) });
}
const AVATAR_COLORS$1 = ["#E8881E", "#E5A023", "#36B37E", "#00B8D9", "#6554C0"];
function initials$1(name) {
  return name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}
function PlayersSidebar({ players, myRoleLabel, myRoleEmoji = "🍳" }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-3 space-y-3", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-[#3D2E1F] px-2 pt-1", children: "Players" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: players.map((player, i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-[#F5E6D3] shadow-xs ${player.isYou ? "ring-2 ring-[#E8881E]" : ""}`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0",
              style: { backgroundColor: AVATAR_COLORS$1[i % AVATAR_COLORS$1.length] },
              children: initials$1(player.name)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-[#3D2E1F] block truncate", children: [
              player.name,
              player.isYou ? " (You)" : ""
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `w-1.5 h-1.5 rounded-full ${!player.online ? "bg-[#B8A898]" : player.submitted ? "bg-[#36B37E]" : "bg-[#E8881E] animate-pulse"}`
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `text-[10px] font-medium ${!player.online ? "text-[#B8A898]" : player.submitted ? "text-[#36B37E]" : "text-[#E8881E]"}`,
                  children: !player.online ? "Offline" : player.submitted ? "Submitted" : "Available"
                }
              )
            ] })
          ] })
        ] })
      },
      player.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF3E0] rounded-xl p-3 border border-[#F5DCBD] flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-white border border-[#F5E6D3] flex items-center justify-center shrink-0 text-xl", children: myRoleEmoji }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-[#8B7355] block", children: "Your Role" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-[#3D2E1F] block", children: myRoleLabel }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#8B7355] block leading-tight", children: "Work with your team to win." })
      ] })
    ] })
  ] });
}
const AVATAR_COLORS = ["#E8881E", "#E5A023", "#36B37E", "#00B8D9", "#6554C0"];
function initials(name) {
  return name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}
function ActivityFeed({ currentRound, items }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-4 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-[#3D2E1F]", children: "Recent Activity" }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-[#E8881E] mt-1 block", children: [
        "Round ",
        currentRound
      ] })
    ] }),
    /* @__PURE__ */ jsx("hr", { className: "border-t border-[#F0D5B5]" }),
    items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#9C826B] py-2", children: "Nothing yet — activity will appear here as your team plays." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3.5 pt-1 max-h-[420px] overflow-y-auto", children: items.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5",
          style: { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] },
          children: initials(item.name)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#3D2E1F] leading-tight", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-[#E8881E]", children: item.name }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-[#6E5A44]", children: item.text })
        ] }),
        item.time && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#9C826B] mt-1 block", children: item.time })
      ] })
    ] }, item.id)) })
  ] });
}
function RoundResultsModal({ isOpen, onClose, topIngredients, absurdVoted }) {
  if (!isOpen) return null;
  const absurdNames = absurdVoted.map((a) => a.name);
  const absurdLabel = absurdNames.length > 1 ? `${absurdNames.slice(0, -1).join(", ")} and ${absurdNames[absurdNames.length - 1]}` : absurdNames[0];
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-[420px] bg-[#FFF8EE] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 pt-6 pb-4", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-extrabold text-[#3D2E1F] flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🧺" }),
          "Round 1: Results"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "w-8 h-8 rounded-full bg-[#3D2E1F]/10 hover:bg-[#3D2E1F]/20 flex items-center justify-center transition-colors cursor-pointer",
            children: /* @__PURE__ */ jsx(X, { size: 16, className: "text-[#3D2E1F]" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "px-6 text-sm text-[#8B7355] leading-relaxed", children: [
        "Here are the top ",
        topIngredients.length || 4,
        " ingredients selected by the group:"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-6 py-5", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-3 flex-wrap", children: topIngredients.map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex flex-col items-center gap-2 bg-white rounded-xl p-3 border border-[#F0E4D4] shadow-sm min-w-[80px]",
          children: [
            item.image_url ? /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(item.image_url) ?? item.image_url, alt: item.name, className: "w-10 h-10 object-contain" }) : /* @__PURE__ */ jsx("span", { className: "text-3xl select-none", children: "🥘" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-[#3D2E1F]", children: item.name })
          ]
        },
        item.id
      )) }) }),
      absurdVoted.length > 0 && /* @__PURE__ */ jsx("div", { className: "mx-6 mb-5", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF3E0] border border-[#E8881E]/20 rounded-xl p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 18, className: "text-[#E8881E] shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#3D2E1F] leading-relaxed", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: absurdLabel }),
          " also received votes.",
          /* @__PURE__ */ jsx("br", {}),
          "Interesting choices from someone in your group."
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "px-6 pb-6", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "w-full py-3.5 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] text-white font-bold text-base transition-colors shadow-md shadow-[#E8881E]/25 cursor-pointer active:scale-[0.98]",
          children: "Okay Continue"
        }
      ) })
    ] })
  ] });
}
function CookingStepReviewModal({
  isOpen,
  steps,
  removeStepId,
  onSelectRemove,
  onSubmit,
  submitted,
  submitting,
  timerLabel,
  resultMode = false,
  onContinue
}) {
  if (!isOpen) return null;
  const locked = resultMode || submitted || submitting;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-xs" }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-[700px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-[#FFF3E0] border border-[#F5E2C8] flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src: step2Img, alt: "Cooking", className: "w-6 h-6 object-contain" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-black text-[#3D2E1F]", children: resultMode ? "Round 2: Review the Steps & Result" : "Round 2: Review the Steps & Vote" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 mb-6 flex-wrap", children: [
        resultMode ? /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-[#6E5A44] max-w-[420px] leading-relaxed", children: [
          "Voting is done. Here's what your team decided — the step marked",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-black text-[#D32F2F]", children: "Remove" }),
          " was voted out, everything else stays."
        ] }) : /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-[#6E5A44] max-w-[340px] leading-relaxed", children: [
          "Review the steps your team submitted and pick the ",
          /* @__PURE__ */ jsx("span", { className: "font-black text-[#D32F2F]", children: "one" }),
          " ",
          "step to remove. Everything else stays."
        ] }),
        !resultMode && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-white/70 border border-[#F5E2C8] rounded-xl px-4 py-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold text-[#8B7355]", children: [
            "Vote before the timer",
            /* @__PURE__ */ jsx("br", {}),
            "runs out"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-black text-[#3D2E1F] font-mono tracking-wider", children: timerLabel })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#FFEAD1]/50 rounded-2xl border border-[#F5CE9E]/60 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_80px_80px] px-5 py-3 border-b border-[#F5CE9E]/60", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold text-[#E8881E]", children: "Step" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold text-[#36B37E] text-center", children: "Keep" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold text-[#D32F2F] text-center", children: "Remove" })
        ] }),
        steps.map((step, i) => {
          const removed = resultMode ? step.status === "removed" : removeStepId === step.id;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `grid grid-cols-[1fr_80px_80px] px-5 py-3.5 items-center ${i < steps.length - 1 ? "border-b border-[#F5CE9E]/40" : ""}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 pr-4", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base font-black text-[#E8881E] shrink-0 mt-0.5", children: step.letter }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-[#3D2E1F] leading-relaxed font-medium", children: step.text })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    "aria-label": removed ? "Not kept" : "Kept",
                    className: `w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${removed ? "border-[#D4C5B3] bg-white" : "bg-[#36B37E] border-[#36B37E]"}`,
                    children: !removed && /* @__PURE__ */ jsx(Check, { size: 14, className: "text-white", strokeWidth: 3 })
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    disabled: locked,
                    onClick: () => onSelectRemove(step.id),
                    "aria-pressed": removed,
                    className: `w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${locked ? "cursor-not-allowed" : "cursor-pointer"} ${removed ? "bg-[#D32F2F] border-[#D32F2F]" : `border-[#D4C5B3] bg-white ${locked ? "" : "hover:border-[#D32F2F]"}`}`,
                    children: removed && /* @__PURE__ */ jsx(Check, { size: 14, className: "text-white", strokeWidth: 3 })
                  }
                ) })
              ]
            },
            step.id
          );
        })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-[#6E5A44] font-medium mt-6 mb-4", children: "Your votes are anonymous. Focus on logic, not assumptions." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: resultMode ? onContinue : onSubmit,
          disabled: resultMode ? false : locked || removeStepId === null,
          className: "w-full py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer",
          children: resultMode ? "Continue" : submitted ? "Waiting for your teammates to vote…" : submitting ? "Submitting…" : removeStepId === null ? "Select 1 step to remove" : "Continue"
        }
      )
    ] })
  ] });
}
function NameDishModal({ isOpen, onSubmit, topIngredients, canSubmit, waitingLabel }) {
  const [dishName, setDishName] = useState("");
  if (!isOpen) return null;
  const handleSubmit = () => {
    if (dishName.trim()) {
      onSubmit(dishName.trim());
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-xs" }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-[580px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-8 md:p-10 animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-black text-[#3D2E1F] text-center italic", children: "Give a Name to your Dish" }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center my-5", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-[#FFF3E0] border border-[#F5E2C8] flex items-center justify-center", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: step2Img,
          alt: "Cooking pot",
          className: "w-10 h-10 object-contain drop-shadow-md"
        }
      ) }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 flex-wrap mb-6", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-[#E8881E] leading-tight text-center", children: [
          "Your top 4 Final",
          /* @__PURE__ */ jsx("br", {}),
          "Ingredients"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: topIngredients.map((item) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex flex-col items-center gap-1.5 bg-white rounded-xl px-3 py-2 border border-[#F5E6D3] shadow-xs",
            children: [
              item.image_url ? /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(item.image_url) ?? step2Img, alt: item.name, className: "object-contain drop-shadow-xs" }) : /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🥘" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#3D2E1F]", children: item.name })
            ]
          },
          item.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-[#3D2E1F] text-center leading-snug mb-6", children: [
        "Check the final steps in Recent Activity and",
        /* @__PURE__ */ jsx("br", {}),
        "Name your Team Dish."
      ] }),
      canSubmit ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold text-[#3D2E1F] mb-2", children: "Name your Dish" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: dishName,
                onChange: (e) => setDishName(e.target.value.slice(0, 40)),
                placeholder: "Example: Creamy hub paneer pasta",
                className: "w-full rounded-xl border border-[#E0D4C4] focus:border-[#E8881E] focus:ring-2 focus:ring-[#E8881E]/20 outline-none px-4 py-3 text-sm text-[#3D2E1F] placeholder:text-[#B8A898] bg-white pr-14"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8B7355]", children: [
              dishName.length,
              "/40"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSubmit,
            disabled: !dishName.trim(),
            className: "w-full py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer",
            children: "Submit"
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "bg-[#FFEAD1] border border-[#F5CE9E] rounded-xl p-5 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#3D2E1F]", children: waitingLabel || "Waiting for the Show Host to name the dish…" }) })
    ] })
  ] });
}
function DoubleDownModal({ isOpen, onAccept, onDecline, submitting }) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-xs" }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-[480px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto w-16 h-16 rounded-full bg-[#E8881E] flex items-center justify-center shadow-md mb-4", children: /* @__PURE__ */ jsx(Zap, { size: 30, className: "text-white", strokeWidth: 2.5 }) }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[#E8881E] tracking-wide", children: "Secret Power" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-black text-[#3D2E1F] tracking-tight mt-1", children: "Double Down Moment" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#6E5A44] leading-relaxed mt-3", children: [
        "You've been secretly chosen to ",
        /* @__PURE__ */ jsx("span", { className: "font-bold text-[#3D2E1F]", children: "double your vote's weight" }),
        " ",
        "in this round's impostor vote. Use it if you're confident — but if your vote turns out to be wrong, you'll lose points."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 bg-[#FDECEC] border border-[#F5C6C6] rounded-xl px-4 py-3 flex items-center gap-2.5 text-left", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 18, className: "text-[#C0392B] shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#8C2F26]", children: "Wrong guess costs you 50 points." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onDecline,
            disabled: submitting,
            className: "flex-1 py-3 rounded-full bg-white border border-[#F5DCBD] hover:bg-[#FFF3E0] text-[#3D2E1F] font-extrabold text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
            children: "Decline"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onAccept,
            disabled: submitting,
            className: "flex-1 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
            children: "Use Double Down"
          }
        )
      ] })
    ] })
  ] });
}
function secondsRemaining(startedAt, durationSecs) {
  if (!startedAt) return durationSecs;
  const startedMs = new Date(startedAt.replace(" ", "T")).getTime();
  if (Number.isNaN(startedMs)) return durationSecs;
  const elapsed = Math.floor((Date.now() - startedMs) / 1e3);
  return Math.max(0, durationSecs - elapsed);
}
const ROLE_EMOJI = {
  chef: "🍳",
  show_host: "🎬",
  impostor: "🎭"
};
function GamePage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const groupId = session?.groupId;
  const participantId = session?.participantId;
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRound1Results, setShowRound1Results] = useState(false);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState(/* @__PURE__ */ new Set());
  const [stepText, setStepText] = useState("");
  const [chatText, setChatText] = useState("");
  const [selectedVoteId, setSelectedVoteId] = useState(null);
  const [removeStepId, setRemoveStepId] = useState(null);
  const [reviewResultSeen, setReviewResultSeen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [onlineParticipantIds, setOnlineParticipantIds] = useState(null);
  const [clockOffset, setClockOffset] = useState(0);
  const [, setClockTick] = useState(0);
  const fetchState = useCallback(async () => {
    if (!groupId || !participantId) return;
    try {
      const data = await cookAndCreateService.getGameState(groupId, participantId);
      setGameState(data);
      setClockOffset(clockOffsetMs(data.schedule, Date.now()));
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not load game state.");
    } finally {
      setLoading(false);
    }
  }, [groupId, participantId]);
  useEffect(() => {
    if (!groupId || !participantId) {
      navigate({
        to: "/"
      });
      return;
    }
    fetchState();
  }, [groupId, participantId, navigate, fetchState]);
  useEffect(() => {
    const id = setInterval(() => setClockTick((t) => t + 1), 1e3);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!gameState?.instance.id || !groupId || !participantId) return;
    const socket = getSocket();
    socket.emit("join_lobby", {
      groupId,
      participantId
    });
    socket.emit("join_cc_instance", {
      instanceId: gameState.instance.id
    });
    socket.emit("request_presence", {
      groupId
    });
  }, [gameState?.instance.id, groupId, participantId]);
  useEffect(() => {
    if (!groupId) return;
    const socket = getSocket();
    const onPresenceUpdated = (payload) => {
      setOnlineParticipantIds(new Set(payload.online_participant_ids ?? []));
    };
    socket.on("presence_updated", onPresenceUpdated);
    return () => {
      socket.off("presence_updated", onPresenceUpdated);
    };
  }, [groupId]);
  useEffect(() => {
    if (gameState?.instance.status === "completed") {
      navigate({
        to: "/cookandcreate/rating"
      });
    }
  }, [gameState?.instance.status, navigate]);
  useEffect(() => {
    if (!groupId || !participantId) return;
    const socket = getSocket();
    const refetch = () => fetchState();
    const onRound1Complete = () => {
      setShowRound1Results(true);
      refetch();
    };
    socket.on("cc_round1_started", refetch);
    socket.on("cc_round1_vote_submitted", refetch);
    socket.on("cc_round1_complete", onRound1Complete);
    socket.on("cc_round2_step_submitted", refetch);
    socket.on("cc_round2_turn_changed", refetch);
    socket.on("cc_round2_review_started", refetch);
    socket.on("cc_round2_step_vote_submitted", refetch);
    socket.on("cc_round2_review_complete", refetch);
    socket.on("cc_dish_name_submitted", refetch);
    socket.on("cc_round3_discussion_started", refetch);
    socket.on("cc_round3_message_new", refetch);
    socket.on("cc_round3_voting_started", refetch);
    socket.on("cc_round3_impostor_vote_submitted", refetch);
    socket.on("cc_round3_complete", refetch);
    socket.on("cc_double_down_offer", refetch);
    return () => {
      socket.off("cc_round1_started", refetch);
      socket.off("cc_round1_vote_submitted", refetch);
      socket.off("cc_round1_complete", onRound1Complete);
      socket.off("cc_round2_step_submitted", refetch);
      socket.off("cc_round2_turn_changed", refetch);
      socket.off("cc_round2_review_started", refetch);
      socket.off("cc_round2_step_vote_submitted", refetch);
      socket.off("cc_round2_review_complete", refetch);
      socket.off("cc_dish_name_submitted", refetch);
      socket.off("cc_round3_discussion_started", refetch);
      socket.off("cc_round3_message_new", refetch);
      socket.off("cc_round3_voting_started", refetch);
      socket.off("cc_round3_impostor_vote_submitted", refetch);
      socket.off("cc_round3_complete", refetch);
      socket.off("cc_double_down_offer", refetch);
    };
  }, [groupId, participantId, fetchState]);
  useEffect(() => {
    if (!groupId || !participantId) return;
    const interval = setInterval(fetchState, 1e4);
    return () => clearInterval(interval);
  }, [groupId, participantId, fetchState]);
  if (loading || !gameState) {
    return /* @__PURE__ */ jsx(CookCreateLayout, { breadcrumb: "Cook & Create / Game", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[50vh] text-[#8B7355]", children: "Loading game…" }) });
  }
  const {
    instance,
    template,
    participants,
    submitted_participant_ids: submittedIds
  } = gameState;
  const myId = participantId ? Number(participantId) : null;
  const currentRound = instance.status === "round1" ? 1 : instance.status === "round2" ? 2 : 3;
  const sidebarPlayers = participants.map((p) => ({
    id: p.id,
    name: p.name,
    isYou: p.isYou,
    // Live socket presence wins once it's arrived; the HTTP snapshot's
    // `status` (also real presence — see getCCGameState) covers the gap
    // before the first `presence_updated` event lands.
    online: p.isYou || (onlineParticipantIds ? onlineParticipantIds.has(p.id) : p.status === "online"),
    submitted: submittedIds.includes(p.id)
  }));
  const myRoleEmoji = gameState.my_role ? ROLE_EMOJI[gameState.my_role] ?? "🍳" : "🍳";
  const submit = async (fn) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fn();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "That didn’t go through — please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const toggleIngredient = (id) => {
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < template.round1_votes_per_player) {
        next.add(id);
      }
      return next;
    });
  };
  const handleConfirmVote = () => submit(async () => {
    if (!myId) return;
    await cookAndCreateService.submitRound1Votes({
      instance_id: instance.id,
      participant_id: myId,
      ingredient_ids: Array.from(selectedIngredientIds)
    });
    await fetchState();
  });
  const handleSubmitStep = () => submit(async () => {
    if (!myId || !stepText.trim()) return;
    await cookAndCreateService.submitRound2Step({
      instance_id: instance.id,
      participant_id: myId,
      step_text: stepText.trim()
    });
    await fetchState();
  });
  const handleSubmitStepVotes = () => submit(async () => {
    if (!myId || removeStepId === null) return;
    for (const step of gameState.cooking_steps) {
      await cookAndCreateService.submitRound2StepVote({
        instance_id: instance.id,
        participant_id: myId,
        step_id: step.id,
        vote: step.id === removeStepId ? "remove" : "keep"
      });
    }
    await fetchState();
  });
  const handleDishNameSubmit = (dishName) => submit(async () => {
    if (!myId) return;
    await cookAndCreateService.submitDishName({
      instance_id: instance.id,
      participant_id: myId,
      dish_name: dishName
    });
    await fetchState();
  });
  const handleSendChat = () => submit(async () => {
    if (!myId || !chatText.trim()) return;
    await cookAndCreateService.submitRound3Message({
      instance_id: instance.id,
      participant_id: myId,
      message: chatText.trim()
    });
    setChatText("");
    await fetchState();
  });
  const handleSubmitVote = () => submit(async () => {
    if (!myId || !selectedVoteId) return;
    await cookAndCreateService.submitRound3ImpostorVote({
      instance_id: instance.id,
      participant_id: myId,
      voted_for_participant_id: selectedVoteId
    });
    await fetchState();
  });
  const handleDoubleDownRespond = (accept) => submit(async () => {
    if (!myId) return;
    await cookAndCreateService.respondToDoubleDown({
      instance_id: instance.id,
      participant_id: myId,
      accept
    });
    await fetchState();
  });
  const getRoundLabel = () => {
    if (currentRound === 1) return "Ingredient Market";
    if (currentRound === 2) return instance.round2_phase === "review" ? "Review & Vote" : "Cooking Steps";
    return instance.status === "round3_voting" ? "Elimination Vote" : "Discussion";
  };
  const roundTimer = (() => {
    if (currentRound === 1) return secondsRemaining(instance.round1_started_at, template.round1_timer_secs);
    if (currentRound === 2) {
      if (instance.round2_phase === "review") {
        return secondsRemaining(instance.round2_review_started_at ?? instance.round2_started_at, template.round2_review_timer_secs);
      }
      return secondsRemaining(instance.round2_turn_started_at ?? instance.round2_started_at, template.round2_submit_timer_secs);
    }
    if (instance.status === "round3_voting") {
      return secondsRemaining(instance.round3_voting_started_at, template.round3_voting_timer_secs);
    }
    return secondsRemaining(instance.round3_discussion_started_at, template.round3_discussion_timer_secs);
  })();
  const timerMm = String(Math.floor(roundTimer / 60)).padStart(2, "0");
  const timerSs = String(roundTimer % 60).padStart(2, "0");
  const activityItems = (() => {
    if (currentRound === 1) {
      return [{
        id: "r1",
        name: "Round 1",
        text: `${submittedIds.length}/${participants.length} players have voted.`,
        time: "",
        type: "info"
      }];
    }
    if (currentRound === 2 && instance.round2_phase === "submit") {
      const turn = gameState.round2_turn;
      if (!turn) return [];
      const textByLetter = new Map(gameState.cooking_steps.map((s) => [s.letter, s.text]));
      return turn.steps.map((s) => ({
        id: `turn-${s.letter}`,
        name: `Step ${s.letter}`,
        text: s.status === "submitted" ? textByLetter.get(s.letter) ?? "Submitted" : s.status === "current" ? "Currently submitting…" : s.status === "missed" ? "Missed their turn" : "Awaiting turn",
        time: s.status === "current" ? `${timerMm}:${timerSs}` : "",
        type: s.status === "submitted" ? "submitted" : s.status === "current" ? "submitting" : s.status === "missed" ? "missed" : "info"
      }));
    }
    if (currentRound === 2 && instance.round2_phase === "review") {
      return gameState.cooking_steps.map((s) => ({
        id: `step-${s.id}`,
        name: `Step ${s.letter}`,
        text: s.status === "submitted" ? `${s.keep_votes} keep / ${s.remove_votes} remove so far.` : s.status === "kept" ? "Kept in the final recipe." : "Removed from the final recipe.",
        time: "",
        type: "info"
      }));
    }
    if (instance.status === "round3_discussion") {
      return gameState.chat_messages.filter((m) => !m.is_impostor_private).map((m) => ({
        id: `msg-${m.id}`,
        name: m.is_you ? "You" : m.participant_name,
        text: m.message,
        time: "",
        type: "submitted"
      }));
    }
    if (instance.status === "round3_voting") {
      return [{
        id: "r3v",
        name: "Round 3",
        text: `${submittedIds.length}/${participants.length} players have voted.`,
        time: "",
        type: "info"
      }];
    }
    return [];
  })();
  const topIngredientsForNameDish = gameState.selected_ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    image_url: i.image_url
  }));
  const absurdVotedIngredients = gameState.all_ingredients.filter((i) => i.is_absurd && (gameState.ingredient_vote_counts[i.id] ?? 0) > 0);
  const doubleDownOpen = gameState.my_double_down?.offered === true && gameState.my_double_down.status === "offered";
  const canNameDish = !template.show_host_role_enabled || gameState.is_show_host;
  const reviewResolved = gameState.cooking_steps.length > 0 && gameState.cooking_steps.every((s) => s.status !== "submitted");
  const myStepVoteEntries = Object.entries(gameState.my_step_votes);
  const reviewSubmitted = myStepVoteEntries.length > 0;
  const submittedRemoveId = myStepVoteEntries.find(([, v]) => v === "remove")?.[0];
  const effectiveRemoveStepId = reviewSubmitted ? submittedRemoveId != null ? Number(submittedRemoveId) : null : removeStepId;
  const myMessagesSent = gameState.chat_messages.filter((m) => m.is_you && !m.is_impostor_private).length;
  const messagesRemaining = Math.max(0, template.round3_max_messages_per_player - myMessagesSent);
  return /* @__PURE__ */ jsx(CookCreateLayout, { breadcrumb: "", children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-4", children: [
    /* @__PURE__ */ jsx(CookCreateHeader, { participantName: session?.name, gameEndsAt: gameState.schedule.game_ends_at, clockOffsetMs: clockOffset }),
    /* @__PURE__ */ jsx("div", { className: "bg-[#FFF3E0] border border-[#F5DCBD] rounded-2xl px-5 py-3 shadow-xs", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-[#E8881E] flex items-center justify-center shadow-xs", children: /* @__PURE__ */ jsx(Utensils, { size: 16, className: "text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-extrabold text-[#3D2E1F] leading-tight", children: "Cook & Create" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-bold text-[#E8881E]", children: [
            "Round ",
            currentRound,
            ": ",
            getRoundLabel()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 bg-white/70 border border-[#F5E2C8] rounded-xl px-4 py-1.5", children: /* @__PURE__ */ jsxs("span", { className: "text-base font-black text-[#3D2E1F] font-mono", children: [
        timerMm,
        ":",
        timerSs
      ] }) }),
      /* @__PURE__ */ jsx(RoundProgress, { currentRound })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-4 items-start", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(PlayersSidebar, { players: sidebarPlayers, myRoleLabel: gameState.my_role_label ?? "Chef", myRoleEmoji }) }),
      /* @__PURE__ */ jsx("div", { children: currentRound === 1 ? /* @__PURE__ */ jsx(Round1Content, { ingredients: gameState.all_ingredients, votesPerPlayer: template.round1_votes_per_player, selectedIngredientIds, toggleIngredient, onConfirmVote: handleConfirmVote, alreadyVoted: gameState.my_ingredient_votes.length > 0, submitting }) : currentRound === 2 ? /* @__PURE__ */ jsx(Round2Content, { stepText, setStepText, maxChars: template.round2_step_max_chars, mySubmittedStep: gameState.my_cooking_step, onSubmitStep: handleSubmitStep, submitting, selectedIngredients: gameState.selected_ingredients, allSubmitted: reviewResolved, phase: instance.round2_phase, turn: gameState.round2_turn, turnTimerLabel: `${timerMm}:${timerSs}` }) : /* @__PURE__ */ jsx(Round3Content, { status: instance.status, participants, myId, selectedVoteId, onSelectPlayer: setSelectedVoteId, onSubmitVote: handleSubmitVote, myVoted: gameState.my_impostor_vote != null, chatMessages: gameState.chat_messages, chatText, setChatText, onSendChat: handleSendChat, messagesRemaining, isImpostor: gameState.is_impostor, impostorBiasCard: gameState.impostor_bias_card, submitting, template }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(ActivityFeed, { currentRound, items: activityItems }) })
    ] }),
    /* @__PURE__ */ jsx(RoundResultsModal, { isOpen: showRound1Results, onClose: () => setShowRound1Results(false), topIngredients: gameState.selected_ingredients, absurdVoted: absurdVotedIngredients }),
    /* @__PURE__ */ jsx(CookingStepReviewModal, { isOpen: currentRound === 2 && instance.round2_phase === "review" && !reviewResolved, steps: gameState.cooking_steps, removeStepId: effectiveRemoveStepId, onSelectRemove: setRemoveStepId, onSubmit: handleSubmitStepVotes, submitted: reviewSubmitted, submitting, timerLabel: `${timerMm}:${timerSs}` }),
    /* @__PURE__ */ jsx(CookingStepReviewModal, { isOpen: currentRound === 2 && instance.round2_phase === "review" && reviewResolved && !reviewResultSeen && !instance.dish_name, steps: gameState.cooking_steps, removeStepId: null, onSelectRemove: () => void 0, onSubmit: () => void 0, submitted: true, submitting: false, timerLabel: `${timerMm}:${timerSs}`, resultMode: true, onContinue: () => setReviewResultSeen(true) }),
    /* @__PURE__ */ jsx(NameDishModal, { isOpen: currentRound === 2 && instance.round2_phase === "review" && reviewResolved && reviewResultSeen && !instance.dish_name, onSubmit: handleDishNameSubmit, topIngredients: topIngredientsForNameDish, canSubmit: canNameDish, waitingLabel: template.show_host_role_enabled ? "Waiting for the Show Host to name the dish…" : "Waiting for a teammate to name the dish…" }),
    /* @__PURE__ */ jsx(DoubleDownModal, { isOpen: doubleDownOpen, onAccept: () => handleDoubleDownRespond(true), onDecline: () => handleDoubleDownRespond(false), submitting })
  ] }) });
}
function Round1Content({
  ingredients,
  votesPerPlayer,
  selectedIngredientIds,
  toggleIngredient,
  onConfirmVote,
  alreadyVoted,
  submitting
}) {
  if (alreadyVoted) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl block", children: "✅" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#36B37E]", children: "Your votes are in!" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-[#8B7355]", children: "Waiting for the rest of your team to vote…" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 text-center space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-[#3D2E1F]", children: "Round 1 of 3 – Ingredients Market" }),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-[#3D2E1F] mt-0.5", children: "Vote for Ingredients" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#8B7355] mt-1 font-medium", children: [
        "Select ",
        votesPerPlayer,
        " ingredients you think should go into our recipe."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-3", children: ingredients.map((item) => {
      const isSelected = selectedIngredientIds.has(item.id);
      const disabled = selectedIngredientIds.size >= votesPerPlayer && !isSelected;
      return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleIngredient(item.id), disabled, className: `relative flex flex-col items-center justify-between p-3 rounded-2xl bg-white border-2 transition-all duration-150 ease-out cursor-pointer min-h-[125px] w-full shadow-xs ${isSelected ? "border-[#E8881E] ring-2 ring-[#E8881E]/20 bg-[#FFFDF9]" : "border-[#F5E6D3] hover:border-[#E8881E]/50"} ${!disabled ? "hover:scale-[1.03]" : ""} ${disabled && !isSelected ? "opacity-40 cursor-not-allowed" : ""}`, children: [
        isSelected && /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E8881E] flex items-center justify-center shadow-xs z-10", children: /* @__PURE__ */ jsx(Check, { size: 12, className: "text-white", strokeWidth: 3 }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center w-full my-1", children: item.image_url ? /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(item.image_url) ?? item.image_url, alt: item.name, className: "max-w-[65px] max-h-[65px] object-contain drop-shadow-sm" }) : /* @__PURE__ */ jsx("span", { className: "text-3xl", children: "🥘" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#3D2E1F] text-center leading-tight", children: item.name })
      ] }, item.id);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "pt-2 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-start text-xs font-bold text-[#3D2E1F]", children: [
        "Selected ",
        /* @__PURE__ */ jsxs("span", { className: "text-[#E8881E] mx-1", children: [
          selectedIngredientIds.size,
          "/",
          votesPerPlayer
        ] }),
        " ingredients"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("button", { onClick: onConfirmVote, disabled: selectedIngredientIds.size !== votesPerPlayer || submitting, className: "px-12 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer", children: "Confirm Vote" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#8B7355] font-medium", children: "Your actions are anonymous, observe patterns carefully." })
    ] })
  ] });
}
function Round2Content({
  stepText,
  setStepText,
  maxChars,
  mySubmittedStep,
  onSubmitStep,
  submitting,
  selectedIngredients,
  allSubmitted,
  phase,
  turn,
  turnTimerLabel
}) {
  const isMyTurn = turn?.is_my_turn ?? false;
  const currentLetter = turn?.current_index != null ? String.fromCharCode(65 + turn.current_index) : null;
  const myLetter = turn?.my_turn_index != null ? String.fromCharCode(65 + turn.my_turn_index) : null;
  const myTurnHasPassed = turn?.current_index != null && turn.my_turn_index != null && turn.current_index > turn.my_turn_index;
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 space-y-5", children: [
    /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-[#3D2E1F]", children: "Round 2 of 3 — Cooking Step Submission" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-[#8B7355] uppercase tracking-wider", children: [
        "Your top ",
        selectedIngredients.length || 4,
        " Final",
        /* @__PURE__ */ jsx("br", {}),
        "Ingredients"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 flex-wrap", children: selectedIngredients.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1.5 bg-white rounded-xl px-3 py-2 border border-[#F5E6D3] shadow-xs", children: [
        item.image_url ? /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(item.image_url) ?? item.image_url, alt: item.name, className: "w-8 h-8 object-contain drop-shadow-xs" }) : /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🥘" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#3D2E1F]", children: item.name })
      ] }, item.id)) })
    ] }),
    /* @__PURE__ */ jsx("hr", { className: "border-t border-[#F0D5B5]" }),
    phase === "review" ? /* @__PURE__ */ jsx("div", { className: "text-center space-y-6 py-4", children: /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-lg font-black text-[#3D2E1F] leading-snug", children: allSubmitted ? "Steps reviewed — waiting on the dish name…" : "Review the steps in the popup and vote to keep or remove each one." }) }) : isMyTurn && !mySubmittedStep ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFEAD1] border border-[#F5CE9E] text-xs font-extrabold text-[#E8881E]", children: [
          "✋ It's your Turn",
          myLetter ? ` — Step ${myLetter}` : ""
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-[#8B7355]", children: [
          "Time left ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-black text-[#3D2E1F]", children: turnTimerLabel })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-[#3D2E1F] font-medium", children: "Submit one cooking step using the selected ingredients." }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-[#3D2E1F] mb-1.5", children: [
          "Enter your step (max ",
          maxChars,
          " characters)"
        ] }),
        /* @__PURE__ */ jsx("textarea", { value: stepText, onChange: (e) => setStepText(e.target.value.slice(0, maxChars)), placeholder: "Write your step here... Example: Chop the vegetables into small pieces.", rows: 4, className: "w-full rounded-xl border border-[#F5E2C8] focus:border-[#E8881E] focus:ring-2 focus:ring-[#E8881E]/20 outline-none p-3.5 text-xs text-[#3D2E1F] placeholder:text-[#8B7355]/60 bg-white resize-none" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#8B7355]", children: "Tip: A good step is clear, simple and moves the recipe forward." }),
          /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-mono font-bold text-[#8B7355]", children: [
            stepText.length,
            "/",
            maxChars
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("button", { onClick: onSubmitStep, disabled: !stepText.trim() || submitting, className: "px-10 py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#E8881E]/25 cursor-pointer", children: "Submit Step" }) })
    ] }) : mySubmittedStep ? /* @__PURE__ */ jsxs("div", { className: "bg-[#F0FFF0] border border-[#4CAF50]/30 rounded-xl p-5 text-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl block mb-1", children: "✅" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-[#36B37E]", children: [
        "Your step has been submitted",
        myLetter ? ` as Step ${myLetter}` : "",
        "!"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#8B7355] mt-0.5", children: currentLetter ? `Step ${currentLetter} is being written now…` : "Waiting for the other players…" })
    ] }) : myTurnHasPassed ? /* @__PURE__ */ jsxs("div", { className: "bg-[#FDECEC] border border-[#F5C6C6] rounded-xl p-5 text-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl block mb-1", children: "⌛" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-[#C0392B]", children: "Your turn ran out." }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#8B7355] mt-0.5", children: currentLetter ? `Step ${currentLetter} is being written now…` : "Waiting for the other players…" })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF3E0] border border-[#F5CE9E] rounded-xl p-5 text-center space-y-1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl block mb-1", children: "⏳" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-[#E8881E]", children: currentLetter ? `Step ${currentLetter} is being written…` : "Waiting for the round to start…" }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#8B7355]", children: myLetter ? `You're up on Step ${myLetter}. Get your step ready!` : "Your turn is coming up." }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-mono font-black text-[#3D2E1F] pt-1", children: turnTimerLabel })
    ] })
  ] });
}
function Round3Content({
  status,
  participants,
  myId,
  selectedVoteId,
  onSelectPlayer,
  onSubmitVote,
  myVoted,
  chatMessages,
  chatText,
  setChatText,
  onSendChat,
  messagesRemaining,
  isImpostor,
  impostorBiasCard,
  submitting,
  template
}) {
  if (status === "round3_discussion") {
    return /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-2xl border border-[#F5E2C8] p-6 space-y-4 flex flex-col h-[520px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-[#3D2E1F]", children: "Round 3 of 3 — The Kitchen Talks" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#8B7355] mt-1", children: [
          '"Someone in this kitchen was never really cooking." Say what you think — ',
          messagesRemaining,
          " message",
          messagesRemaining === 1 ? "" : "s",
          " left."
        ] })
      ] }),
      isImpostor && impostorBiasCard && /* @__PURE__ */ jsxs("div", { className: "bg-[#3D2E1F] rounded-xl px-4 py-3 text-white flex items-start gap-2", children: [
        /* @__PURE__ */ jsx(Lock, { size: 14, className: "shrink-0 mt-0.5 text-[#FFC98A]" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-1", dangerouslySetInnerHTML: {
          __html: impostorBiasCard
        } })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto space-y-2.5 bg-white/60 rounded-xl border border-[#F5E6D3] p-4", children: chatMessages.filter((m) => !m.is_impostor_private).length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#9C826B] text-center py-6", children: "No messages yet — be the first to say something." }) : chatMessages.filter((m) => !m.is_impostor_private).map((m) => /* @__PURE__ */ jsx("div", { className: `flex ${m.is_you ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxs("div", { className: `max-w-[75%] rounded-2xl px-3.5 py-2 text-xs ${m.is_you ? "bg-[#E8881E] text-white" : "bg-white border border-[#F5E6D3] text-[#3D2E1F]"}`, children: [
        !m.is_you && /* @__PURE__ */ jsx("p", { className: "font-bold text-[10px] mb-0.5 opacity-70", children: m.participant_name }),
        m.message
      ] }) }, m.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("input", { value: chatText, onChange: (e) => setChatText(e.target.value.slice(0, 200)), onKeyDown: (e) => e.key === "Enter" && messagesRemaining > 0 && chatText.trim() && onSendChat(), disabled: messagesRemaining === 0 || submitting, placeholder: messagesRemaining === 0 ? "You're out of messages" : "Say something…", className: "flex-1 rounded-full border border-[#F5E2C8] focus:border-[#E8881E] outline-none px-4 py-2.5 text-xs bg-white disabled:opacity-50" }),
        /* @__PURE__ */ jsx("button", { onClick: onSendChat, disabled: !chatText.trim() || messagesRemaining === 0 || submitting, className: "w-10 h-10 rounded-full bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-40 flex items-center justify-center text-white shrink-0 cursor-pointer", children: /* @__PURE__ */ jsx(Send, { size: 16 }) })
      ] })
    ] });
  }
  const votable = participants.filter((p) => p.id !== myId);
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-2xl border-2 border-[#E8881E]/30 p-6 text-center space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-black text-[#3D2E1F]", children: "Round 3 of 3 – Imposter Voting" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[#E8881E] mt-2 leading-relaxed max-w-[400px] mx-auto", children: "Vote to eliminate one player. Who do you think is not contributing well to the dish & is the impostor?" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-[#6E5A44] mt-2 font-medium", children: "Vote wisely, one wrong vote can save the impostor." })
    ] }),
    myVoted ? /* @__PURE__ */ jsxs("div", { className: "bg-[#F0FFF0] border border-[#4CAF50]/30 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl block mb-1", children: "✅" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-[#36B37E]", children: "Your vote has been submitted!" }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#8B7355] mt-0.5", children: "Waiting for other players to finish voting..." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-3 flex-wrap py-2", children: votable.map((player) => {
        const isSelected = selectedVoteId === player.id;
        return /* @__PURE__ */ jsxs("button", { onClick: () => onSelectPlayer(player.id), className: "relative flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105", children: [
          isSelected && /* @__PURE__ */ jsx("div", { className: "absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E8881E] flex items-center justify-center shadow-md z-10", children: /* @__PURE__ */ jsx(Check, { size: 14, className: "text-white", strokeWidth: 3 }) }),
          /* @__PURE__ */ jsx("div", { className: `w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-white border-2 overflow-hidden transition-all ${isSelected ? "border-[#E8881E] ring-2 ring-[#E8881E]/30 shadow-lg" : "border-[#F5E2C8] shadow-xs"}`, children: /* @__PURE__ */ jsx("img", { src: portraitForRole(player.role_label, template), alt: player.role_label, className: "w-full h-full object-cover", style: {
            objectPosition: "center 15%"
          } }) }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-[#6E5A44]", children: player.name }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-[#8B7355]", children: player.role_label })
        ] }, player.id);
      }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-[#6E5A44] font-medium", children: "Your vote is anonymous." }),
      /* @__PURE__ */ jsx("button", { onClick: onSubmitVote, disabled: !selectedVoteId || submitting, className: "w-full max-w-md mx-auto py-4 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer block", children: "Submit Vote" })
    ] })
  ] });
}
export {
  GamePage as component
};
