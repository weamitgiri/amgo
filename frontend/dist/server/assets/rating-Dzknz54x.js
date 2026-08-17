import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useCallback, useEffect } from "react";
import { C as CookCreateLayout, c as cookAndCreateService } from "./cookandcreate.service-Du5PpCKA.js";
import { c as clearParticipantSession, g as getParticipantSession } from "./participant-session-CZEpXMRe.js";
import { d as disconnectSocket } from "./socket-Bwou9MYK.js";
import { p as portraitForRole } from "./portraits-DA5ZYneF.js";
import { i as imposterImg } from "./imposter 1-D-6p4Qax.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import "./router-BvkvNwFV.js";
import "@tanstack/react-query";
import "sonner";
import "./config-OQZNPa_v.js";
import "socket.io-client";
import "./media-DMImknnw.js";
const dish1 = "/assets/dish-1%201-DdczALhk.png";
const dish2 = "/assets/dish-2%201-C2oz4FL7.png";
const dish3 = "/assets/dish-3%201-DFQhJp9e.png";
const dish4 = "/assets/dish-4%201-BvHb9BQC.png";
const dish5 = "/assets/dish-5%201-DmB7nt0Q.png";
const dish6 = "/assets/dish-6%201-1XcQ1fXZ.png";
const dish7 = "/assets/dish-7%201-afmE2iqM.png";
const dish8 = "/assets/dish-8%201-B4GUIWjC.png";
const DISH_IMAGES = [dish1, dish2, dish3, dish4, dish5, dish6, dish7, dish8];
function dishImageFor(groupId) {
  const n = DISH_IMAGES.length;
  return DISH_IMAGES[(groupId % n + n) % n];
}
function ReviewRatingPage({
  dishName,
  groupWon,
  impostor,
  mostVoted,
  reactionCounts,
  ratingCategories,
  awardEntries,
  myGroupId,
  template,
  doubleDownOutcome
}) {
  const navigate = useNavigate();
  const myEntry = awardEntries.find((g) => g.group_id === myGroupId);
  const exitToHome = () => {
    disconnectSocket();
    clearParticipantSession();
    navigate({ to: "/" });
  };
  const reactions = ratingCategories.map((c) => ({ ...c, count: reactionCounts[c.slug] ?? 0 })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  return /* @__PURE__ */ jsx(CookCreateLayout, { breadcrumb: "Cook & Create / Results", children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full bg-white rounded-2xl px-6 py-3.5 flex items-center justify-between border border-[#F0E4D4] shadow-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xl font-black text-[#3D2E1F]", children: "Cook & Create" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: exitToHome,
          className: "px-5 py-2 rounded-full bg-[#E8881E] hover:bg-[#D47815] text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer",
          children: "Exit to Home"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-[#FFFDF9] rounded-2xl border border-[#F0DECA] p-6 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[17px] font-black text-[#5C432E] mb-1", children: "Recipe Reveal" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-[#8B7355] mb-2 mt-3", children: "Your group cooked up..." }),
        /* @__PURE__ */ jsx("p", { className: "text-base font-black text-[#E8881E] mb-4", children: dishName }),
        /* @__PURE__ */ jsx("div", { className: "rounded-xl overflow-hidden border border-[#F0E4D4] shadow-sm bg-[#FAF6F0]", children: /* @__PURE__ */ jsx("img", { src: dishImageFor(myGroupId), alt: dishName, className: "w-full h-48 object-cover" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[17px] font-black text-[#5C432E] mb-1", children: "Ratings & Reaction" }),
        /* @__PURE__ */ jsx("p", { className: "text-[12px] text-[#8B7355] mb-4 mt-3", children: "The verdict is in. Other teams have tasted your creation." }),
        reactions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#B8A898] py-6", children: "No reactions yet — other teams are still tasting your dish." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-[#8B7355] mb-1", children: "Reactions received" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-black text-[#E8881E] mb-4", children: totalReactions }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2", children: reactions.map((r) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex flex-col items-center bg-white rounded-xl border border-[#F0DECA] px-3 py-2 min-w-[72px]",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: r.emoji }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-[#8B7355] leading-tight text-center mt-1", children: r.name }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-[#E8881E]", children: r.count })
              ]
            },
            r.id
          )) })
        ] }),
        doubleDownOutcome && /* @__PURE__ */ jsx(
          "div",
          {
            className: `mx-auto mt-4 max-w-[280px] rounded-xl px-3 py-2 border ${doubleDownOutcome.penaltyApplied ? "bg-[#FDECEC] border-[#F5C6C6]" : "bg-[#EAF7EE] border-[#BEE6C9]"}`,
            children: /* @__PURE__ */ jsxs("p", { className: `font-black text-xs ${doubleDownOutcome.penaltyApplied ? "text-[#C0392B]" : "text-[#1E8449]"}`, children: [
              "⚡ Double Down —",
              " ",
              doubleDownOutcome.penaltyApplied ? "Wrong guess: -50 points" : "Correct guess: no penalty!"
            ] })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5 items-start", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#F8DEBC] rounded-2xl border border-[#F0D0A5] p-6 shadow-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[17px] font-black text-[#5C432E] text-center mb-1", children: "The Impostor has been unmarked" }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-sm font-bold text-[#E8881E] mb-5", children: groupWon === true ? "🎉 You caught the impostor!" : groupWon === false ? "😈 The impostor escaped" : "Game complete" }),
        mostVoted && /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: imposterImg, alt: "Suspected", className: "w-16 h-20 object-contain drop-shadow" }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: portraitForRole(mostVoted.roleLabel, template),
                alt: mostVoted.name,
                className: "w-20 h-24 rounded-2xl object-cover border-2 border-[#E8881E] shadow-sm",
                style: { objectPosition: "center 15%" }
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-[#E8881E] mt-1", children: mostVoted.name }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[#8B7355]", children: mostVoted.roleLabel })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-1 text-center text-sm text-[#5C432E]", children: [
          mostVoted && /* @__PURE__ */ jsxs("p", { children: [
            "The group's most suspected player is ",
            /* @__PURE__ */ jsx("span", { className: "font-black text-[#3D2E1F]", children: mostVoted.name })
          ] }),
          impostor && /* @__PURE__ */ jsxs("p", { children: [
            "The impostor was ",
            /* @__PURE__ */ jsx("span", { className: "font-black text-[#E8881E]", children: impostor.name })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#F8DEBC] rounded-2xl border border-[#F0D0A5] p-6 shadow-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[17px] font-black text-[#5C432E] text-center mb-4", children: "🏆 Fun Awards" }),
        !myEntry || myEntry.awards.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#5C432E] text-center py-6", children: "No awards yet — nominations are still coming in." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5", children: myEntry.awards.map((a) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl px-3 py-3 text-center border border-[#F0DECA]", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl leading-none mb-1", children: a.emoji }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-black text-[#3D2E1F] leading-tight", children: a.category_name })
        ] }, a.category_id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-[#F0E4D4] p-6 shadow-sm", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-[17px] font-black text-[#5C432E] text-center mb-5", children: "🏆 Final Results" }),
      awardEntries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#5C432E] text-center", children: "Awards will appear here as more teams finish and cast their nominations." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: awardEntries.map((g) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-[#FFFDF9] rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-[#F0DECA]",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-[#8B7355]", children: [
                g.group_name,
                g.group_id === myGroupId ? " (You)" : ""
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-[#3D2E1F] truncate", children: g.dish_name })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-end gap-1 shrink-0", children: g.awards.length === 0 ? /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#B8A898]", children: "No awards yet" }) : g.awards.map((a) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-[10px] bg-[#FFEAD1] border border-[#F5CE9E] rounded-full px-2 py-0.5",
                children: a.emoji
              },
              a.category_id
            )) })
          ]
        },
        g.group_id
      )) })
    ] })
  ] }) });
}
function OtherKitchensModal({
  isOpen,
  otherDishes,
  ratingCategories,
  onRate,
  onContinue
}) {
  if (!isOpen) return null;
  const dish = otherDishes[0] ?? null;
  const topNomination = dish ? Object.entries(dish.nomination_counts).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1])[0] : void 0;
  const topCategory = topNomination ? ratingCategories.find((c) => c.slug === topNomination[0]) : void 0;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-xs" }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-[560px] max-h-[92vh] overflow-y-auto bg-[#FFF5E6] rounded-[28px] border border-[#F5D8B6] shadow-2xl p-6 md:p-7 animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-black text-[#3D2E1F] text-center", children: "What Other Kitchens Cooked Up" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-center text-[#8B7355] mt-1 mb-5", children: "Nominate one award per dish you review." }),
      !dish ? /* @__PURE__ */ jsx("div", { className: "bg-[#FFEAD1]/60 border border-[#F5CE9E]/60 rounded-2xl px-4 py-10 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-[#8B7355]", children: "No other finished dishes to review yet — you can continue to your results." }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-white rounded-2xl border border-[#F0DECA] p-3 shadow-xs", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: dishImageFor(dish.group_id),
              alt: dish.dish_name,
              className: "w-20 h-20 rounded-xl object-cover border border-[#F0E4D4] shrink-0"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#8B7355] font-medium", children: dish.group_name }),
            /* @__PURE__ */ jsx("p", { className: "text-[17px] font-black text-[#3D2E1F] leading-tight truncate", children: dish.dish_name }),
            topCategory ? /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-[#E8881E] mt-1", children: [
              topCategory.emoji,
              " ",
              topNomination[1],
              " Voted ",
              topCategory.name
            ] }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-[#B8A898] mt-1", children: "No nominations yet" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-[#F0DECA] p-4 shadow-xs", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-[#E8881E] mb-1", children: "Game Step" }),
          dish.steps.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-[#B8A898] py-2", children: "No steps recorded for this dish." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-[#F5E9DA]", children: dish.steps.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 py-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-[#E8881E] w-4 shrink-0", children: String.fromCharCode(65 + i) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-[#3D2E1F] leading-relaxed", children: s.text })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-center text-xs font-black text-[#5C432E] mb-2", children: "Nominate an award for this dish" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: ratingCategories.map((cat) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => onRate(dish.group_id, cat.id),
              title: cat.description ?? cat.name,
              className: "flex flex-col items-center justify-center gap-1 rounded-xl border border-[#F0DECA] bg-white hover:border-[#E8881E] hover:bg-[#FFF3E0] px-2 py-2.5 text-center transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: cat.emoji }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-[#5C432E] leading-tight", children: cat.name })
              ]
            },
            cat.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onContinue,
          className: "mt-5 w-full py-3.5 rounded-2xl bg-[#E8881E] hover:bg-[#D47815] text-white font-extrabold text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#E8881E]/30 cursor-pointer",
          children: dish ? "Skip to Results" : "Continue to Results"
        }
      )
    ] })
  ] });
}
function RatingPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const [gameState, setGameState] = useState(null);
  const [otherDishes, setOtherDishes] = useState([]);
  const [awards, setAwards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedOthers, setReviewedOthers] = useState(false);
  const groupId = session?.groupId;
  const participantId = session?.participantId;
  const loadAll = useCallback(async () => {
    if (!groupId || !participantId) return;
    try {
      const [state, dishes, board] = await Promise.all([cookAndCreateService.getGameState(groupId, participantId), cookAndCreateService.getOtherDishes(groupId, participantId).catch(() => ({
        dishes: []
      })), cookAndCreateService.getAwards(groupId).catch(() => null)]);
      setGameState(state);
      setOtherDishes(dishes.dishes);
      setAwards(board);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not load results.");
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
    loadAll();
  }, [groupId, participantId, navigate, loadAll]);
  useEffect(() => {
    if (gameState && gameState.instance.status !== "completed") {
      navigate({
        to: "/cookandcreate/game"
      });
    }
  }, [gameState, navigate]);
  const handleRate = useCallback(async (ratedGroupId, categoryId) => {
    if (!gameState || !participantId) return;
    try {
      await cookAndCreateService.submitRating({
        instance_id: gameState.instance.id,
        participant_id: participantId,
        rated_group_id: ratedGroupId,
        category_id: categoryId
      });
      const [dishes, board] = await Promise.all([cookAndCreateService.getOtherDishes(groupId, participantId).catch(() => ({
        dishes: []
      })), cookAndCreateService.getAwards(groupId).catch(() => null)]);
      setOtherDishes(dishes.dishes);
      setAwards(board);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not submit that rating.");
    }
  }, [gameState, participantId, groupId]);
  if (loading || !gameState) {
    return /* @__PURE__ */ jsx(CookCreateLayout, { breadcrumb: "Cook & Create / Results", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[50vh] text-[#8B7355]", children: "Loading results…" }) });
  }
  if (!reviewedOthers) {
    return /* @__PURE__ */ jsx(CookCreateLayout, { breadcrumb: "Cook & Create / Results", children: /* @__PURE__ */ jsx(OtherKitchensModal, { isOpen: true, otherDishes, ratingCategories: gameState.rating_categories, onRate: handleRate, onContinue: () => setReviewedOthers(true) }) });
  }
  const myId = participantId ? Number(participantId) : null;
  const impostor = gameState.participants.find((p) => p.id === awards?.my_group.impostor_participant_id);
  const mostVoted = gameState.participants.find((p) => p.id === awards?.my_group.most_voted_participant_id);
  const iAmDoubleDown = myId != null && myId === awards?.my_group.double_down_participant_id;
  const doubleDownOutcome = iAmDoubleDown && awards?.my_group.double_down_used ? {
    penaltyApplied: awards.my_group.double_down_penalty_applied
  } : null;
  return /* @__PURE__ */ jsx(ReviewRatingPage, { dishName: gameState.instance.dish_name || awards?.my_group.dish_name || "Your dish", groupWon: awards?.my_group.group_won ?? gameState.instance.group_won, impostor: impostor ? {
    name: impostor.isYou ? "You" : impostor.name,
    roleLabel: impostor.role_label
  } : null, mostVoted: mostVoted ? {
    name: mostVoted.isYou ? "You" : mostVoted.name,
    roleLabel: mostVoted.role_label
  } : null, reactionCounts: awards?.my_group.reaction_counts ?? {}, ratingCategories: gameState.rating_categories, awardEntries: awards?.groups ?? [], myGroupId: gameState.instance.group_id, template: gameState.template, doubleDownOutcome });
}
export {
  RatingPage as component
};
