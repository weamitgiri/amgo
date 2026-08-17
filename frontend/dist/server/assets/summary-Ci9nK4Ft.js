import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useCallback, useEffect } from "react";
import { X, Target, Lightbulb, Brain, Lock, FileText, ChevronRight, Info } from "lucide-react";
import { c as cookAndCreateService, C as CookCreateLayout } from "./cookandcreate.service-Du5PpCKA.js";
import { C as CookCreateHeader } from "./CookCreateHeader-BUnxok9H.js";
import { s as showHostImg, c as chef1Img, p as portraitForRole } from "./portraits-DA5ZYneF.js";
import { i as imposterImg } from "./imposter 1-D-6p4Qax.js";
import { g as getParticipantSession } from "./participant-session-CZEpXMRe.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import { r as resolveMediaUrl } from "./media-DMImknnw.js";
import { s as step1Img, a as step2Img, b as step4Img } from "./game-flow-step-4-bfvJ_dgk.js";
import "./router-BvkvNwFV.js";
import "@tanstack/react-query";
import "sonner";
import "./config-OQZNPa_v.js";
import "./Cook  and Create Logo-D7X4g-oO.js";
const ROLE_COPY = {
  chef: {
    blurb: "You are part of the cooking team. Work together to create the best dish.",
    goals: ["Choose useful ingredients", "Add logical cooking steps", "Help identify the impostor"],
    know: [
      "One player is secretly sabotaging the dish",
      "Not all choices will make sense",
      "Patterns across rounds reveal the truth"
    ],
    keepInMind: "Think before you vote. One wrong decision can save the impostor.",
    image: chef1Img
  },
  show_host: {
    blurb: "You lead the kitchen — same team as everyone else, plus the final say on the dish name.",
    goals: ["Choose useful ingredients", "Add logical cooking steps", "Name the team’s dish once steps are finalized"],
    know: [
      "One player is secretly sabotaging the dish",
      "You alone can submit the final dish name",
      "Patterns across rounds reveal the truth"
    ],
    keepInMind: "Everything a Chef watches for, plus: only you can name the dish.",
    image: showHostImg
  },
  impostor: {
    blurb: "You are secretly trying to spoil the dish and mislead the team — without getting caught.",
    goals: ["Blend in with the group", "Nudge bad choices without being obvious", "Avoid getting voted out"],
    know: ["Everyone else is genuinely trying to cook well", "Your choices need to look plausible"],
    keepInMind: "Deflect, don’t deny too hard. Stay calm under questioning.",
    image: imposterImg
  }
};
function RoleRevealModal({ isOpen, onClose, role, roleLabel, impostorBiasCardHtml }) {
  if (!isOpen) return null;
  const copy = ROLE_COPY[role];
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-xs", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-[820px] bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "absolute top-5 right-5 w-11 h-11 rounded-full bg-[#C06A15] hover:bg-[#A85A10] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md z-20 cursor-pointer",
          children: /* @__PURE__ */ jsx(X, { size: 22, className: "text-white", strokeWidth: 2.5 })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6 md:gap-8 items-stretch", children: [
        /* @__PURE__ */ jsx("div", { className: "md:w-[42%] flex items-stretch", children: /* @__PURE__ */ jsx("div", { className: "w-full rounded-2xl bg-[#FFF8EE] border border-[#F5E2C8] overflow-hidden flex items-end justify-center p-3 shadow-inner", children: /* @__PURE__ */ jsx("img", { src: copy.image, alt: roleLabel, className: "w-full object-contain drop-shadow-md" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "md:w-[58%] flex flex-col justify-between", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[#E8881E] tracking-wide", children: "Your Role" }),
          /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black text-[#3D2E1F] tracking-tight uppercase", children: roleLabel }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#6E5A44] leading-relaxed pt-1", children: copy.blurb }),
          /* @__PURE__ */ jsx("hr", { className: "!my-4 border-t border-[#F0D5B5]" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-base font-extrabold text-[#E8881E] flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Target, { size: 18, className: "text-[#E8881E]" }),
              "Your Goal"
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-1.5 pl-6", children: copy.goals.map((item) => /* @__PURE__ */ jsxs("li", { className: "text-sm text-[#3D2E1F] flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[#3D2E1F] font-bold", children: "•" }),
              item
            ] }, item)) })
          ] }),
          /* @__PURE__ */ jsx("hr", { className: "!my-4 border-t border-[#F0D5B5]" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-base font-extrabold text-[#E8881E] flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Lightbulb, { size: 18, className: "text-[#E8881E]" }),
              "WHAT YOU KNOW"
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-1.5 pl-6", children: copy.know.map((item) => /* @__PURE__ */ jsxs("li", { className: "text-sm text-[#3D2E1F] flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[#3D2E1F] font-bold", children: "•" }),
              item
            ] }, item)) })
          ] }),
          /* @__PURE__ */ jsx("hr", { className: "!my-4 border-t border-[#F0D5B5]" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-base font-extrabold text-[#E8881E] flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Brain, { size: 18, className: "text-[#E8881E]" }),
              "KEEP IN MIND"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#3D2E1F] leading-relaxed pl-6 font-medium", children: copy.keepInMind })
          ] }),
          role === "impostor" && impostorBiasCardHtml && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("hr", { className: "!my-4 border-t border-[#F0D5B5]" }),
            /* @__PURE__ */ jsxs("div", { className: "!mt-3 bg-[#3D2E1F] rounded-xl px-4 py-3 text-white", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-extrabold text-[#FFC98A] mb-1.5", children: "Your Bias Card" }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "text-xs leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-1",
                  dangerouslySetInnerHTML: { __html: impostorBiasCardHtml }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "!mt-5 bg-[#FFEAD1] rounded-xl px-4 py-3 flex items-center gap-2.5 border border-[#F5CE9E]", children: [
            /* @__PURE__ */ jsx(Lock, { size: 16, className: "text-[#6E5A44] shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-[#3D2E1F]", children: "Keep your role secret" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-7 flex justify-center", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "px-20 py-3.5 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-base transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#E8881E]/30 cursor-pointer",
          children: "Okay Continue"
        }
      ) })
    ] })
  ] });
}
const gameSummeryBg = "/assets/game-summery-bg-CuXGA-n1.png";
const secretBoxImg = "/assets/secret-box-DmlTBfq1.png";
const ROUNDS = [{
  num: "01",
  img: step1Img,
  title: "Ingredient Selection",
  desc: "Choose the best ingredients for your dish."
}, {
  num: "02",
  img: step2Img,
  title: "Cooking Steps",
  desc: "Submit one step to help create the dish."
}, {
  num: "03",
  img: step4Img,
  title: "Elimination",
  desc: "Discuss and vote."
}];
const AUTO_CONTINUE_SECS = 25;
function SummaryPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_CONTINUE_SECS);
  const fetchState = useCallback(async () => {
    if (!session?.groupId || !session.participantId) return;
    try {
      const data = await cookAndCreateService.getGameState(session.groupId, session.participantId);
      setGameState(data);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not load the challenge brief.");
    } finally {
      setLoading(false);
    }
  }, [session?.groupId, session?.participantId]);
  useEffect(() => {
    if (!session?.groupId || !session.participantId) {
      navigate({
        to: "/"
      });
      return;
    }
    fetchState();
  }, [session?.groupId, session?.participantId, navigate, fetchState]);
  const goToGame = useCallback(() => navigate({
    to: "/cookandcreate/game"
  }), [navigate]);
  useEffect(() => {
    if (gameState && gameState.instance.status !== "waiting" && gameState.instance.status !== "round1") {
      goToGame();
    }
  }, [gameState, goToGame]);
  useEffect(() => {
    if (!gameState) return;
    if (countdown <= 0) {
      goToGame();
      return;
    }
    const t = setTimeout(() => setCountdown((s) => s - 1), 1e3);
    return () => clearTimeout(t);
  }, [countdown, gameState, goToGame]);
  if (loading || !gameState) {
    return /* @__PURE__ */ jsx(CookCreateLayout, { breadcrumb: "Cook & Create / Summary", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[50vh] text-[#8B7355]", children: "Loading challenge brief…" }) });
  }
  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");
  const role = gameState.is_impostor ? "impostor" : gameState.is_show_host ? "show_host" : "chef";
  return /* @__PURE__ */ jsxs(CookCreateLayout, { breadcrumb: "Cook & Create / Summary", children: [
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes gentle-shake {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-2deg); }
          75% { transform: translateY(-2px) rotate(2deg); }
        }
        .animate-shake { animation: gentle-shake 3s ease-in-out infinite; }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-4", children: [
      /* @__PURE__ */ jsx(CookCreateHeader, { participantName: session?.name, gameEndsAt: gameState.schedule.game_ends_at }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between px-1 pt-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-md bg-[#FFEAD1] flex items-center justify-center text-[#E8881E]", children: /* @__PURE__ */ jsx(FileText, { size: 14 }) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#3D2E1F] uppercase tracking-wider", children: "Challenge Brief" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 items-stretch", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-[28px] border border-[#F5DCBD] p-6 sm:p-7 shadow-xs flex flex-col justify-between", style: {
          backgroundImage: `url(${resolveMediaUrl(gameState.template.background_image) ?? gameSummeryBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "max-w-[260px] sm:max-w-[300px] space-y-3 mb-8", children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-2xl sm:text-3xl font-black text-[#3D2E1F] leading-tight", children: [
              "The ",
              /* @__PURE__ */ jsx("span", { className: "text-[#E8881E]", children: "Cook & Create" }),
              /* @__PURE__ */ jsx("br", {}),
              "Challenge"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs sm:text-sm text-[#7A644D] leading-relaxed font-medium", dangerouslySetInnerHTML: {
              __html: gameState.template.description || "Work together to create the best dish with the given ingredients and steps. One player is secretly trying to spoil the dish. Can you spot the impostor and create a masterpiece together?"
            } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-[#E8881E] uppercase tracking-wider mb-2.5", children: "Rounds" }),
            /* @__PURE__ */ jsx("div", { className: "bg-[#FFF8EE]/95 backdrop-blur-xs rounded-2xl border border-[#F5E6D3] p-4 shadow-xs", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 items-center", children: ROUNDS.map((round, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center text-center", children: [
                /* @__PURE__ */ jsxs("div", { className: "relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFF3E0] border border-[#F5DEC3] flex items-center justify-center mb-2.5 shadow-inner", children: [
                  /* @__PURE__ */ jsx("span", { className: "absolute top-0 left-0 w-5 h-5 rounded-full bg-[#E8881E] text-white font-bold text-[11px] flex items-center justify-center shadow-xs", children: round.num }),
                  /* @__PURE__ */ jsx("img", { src: round.img, alt: round.title, className: "w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-xs" })
                ] }),
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-[#3D2E1F] leading-tight", children: round.title }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#7A644D] font-medium mt-1 leading-snug max-w-[150px]", children: round.desc })
              ] }),
              i < ROUNDS.length - 1 && /* @__PURE__ */ jsx(ChevronRight, { size: 16, className: "text-[#E8881E]/40 shrink-0 mx-0.5" })
            ] }, round.num)) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-[28px] border border-[#F5DCBD] p-6 shadow-xs", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-lg font-black text-[#3D2E1F] text-center mb-5 tracking-tight", children: "Key People in the Kitchen" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-3 text-center", children: gameState.participants.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-full aspect-[3/4] rounded-2xl bg-[#FFF0DB]/80 border border-[#F5DEC3] overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: portraitForRole(p.role_label, gameState.template), alt: p.role_label, className: "w-full h-full object-cover", style: {
                objectPosition: "center 15%"
              } }) }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-[#3D2E1F] truncate w-full", children: [
                p.role_label,
                p.isYou ? " (You)" : ""
              ] })
            ] }, p.id)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-[#FFF8EE] rounded-[28px] border border-[#F5DCBD] p-6 text-center flex flex-col items-center justify-between shadow-xs", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-[#E8881E] leading-snug max-w-[180px]", children: "Open the Secret Box to reveal your role." }),
              /* @__PURE__ */ jsx("div", { className: "my-3 flex justify-center", children: /* @__PURE__ */ jsx("img", { src: secretBoxImg, alt: "Secret Box", className: "w-36 h-36 sm:w-40 sm:h-40 object-contain drop-shadow-lg animate-shake hover:scale-105 transition-transform cursor-pointer", onClick: () => setShowRoleModal(true) }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => setShowRoleModal(true), className: "w-full py-3 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-xs sm:text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-[#E8881E]/30 cursor-pointer", children: "Open Secret Box" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 flex flex-col justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[24px] border border-[#F5DCBD] p-4.5 flex items-start gap-3 shadow-xs", children: [
                /* @__PURE__ */ jsx(Info, { size: 18, className: "text-[#E8881E] shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-[#6E5A44] leading-relaxed font-medium", children: "All actions are anonymous. Think, observe and make the right move!" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[24px] border border-[#F5DCBD] p-5 shadow-xs flex flex-col justify-between flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-[#6E5A44] leading-relaxed font-medium mb-4", children: "You can view the Challenge brief only once. Remember the details!" }),
                /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-b from-[#FFF3E0] to-[#FFEAD1] rounded-2xl p-5 border border-[#F5CE9E] text-center shadow-xs", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-[#6E5A44] mb-2", children: "Heading to Round 1 in" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-3xl font-black text-[#3D2E1F] font-mono tracking-widest", children: [
                    mm,
                    ":",
                    ss
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: goToGame, className: "w-full py-3.5 rounded-full text-white font-extrabold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer", style: {
            background: "linear-gradient(135deg, #FFB84D 0%, #E8881E 100%)",
            boxShadow: "0 4px 16px rgba(232,136,30,0.3)"
          }, children: "Continue to Round 1 →" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(RoleRevealModal, { isOpen: showRoleModal, onClose: () => setShowRoleModal(false), role, roleLabel: gameState.my_role_label ?? "Chef", impostorBiasCardHtml: gameState.impostor_bias_card })
  ] });
}
export {
  SummaryPage as component
};
