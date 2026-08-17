import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { Users, CalendarClock, AlertTriangle } from "lucide-react";
import { c as cookAndCreateService, C as CookCreateLayout, d as decorLeft, a as decorRight } from "./cookandcreate.service-Du5PpCKA.js";
import { C as CookCreateHeader } from "./CookCreateHeader-BUnxok9H.js";
import { useState, useEffect, useMemo, useCallback } from "react";
import { l as lobbyLogo } from "./Cook  and Create Logo-D7X4g-oO.js";
import { g as getParticipantSession } from "./participant-session-CZEpXMRe.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import { g as getSocket } from "./socket-Bwou9MYK.js";
import { c as clockOffsetMs } from "./clock-Bllaa3En.js";
import "./router-BvkvNwFV.js";
import "@tanstack/react-query";
import "sonner";
import "./config-OQZNPa_v.js";
import "socket.io-client";
const AVATAR_COLORS$1 = [
  "#E91E63",
  "#2196F3",
  "#3F51B5",
  "#9C27B0",
  "#009688",
  "#FF9800",
  "#4CAF50",
  "#F44336"
];
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 48
};
const FONT_SIZE_MAP = {
  sm: "11px",
  md: "14px",
  lg: "16px"
};
function PlayerAvatar({
  name,
  colorIndex = 0,
  size = "md",
  status,
  isYou = false
}) {
  const color = AVATAR_COLORS$1[colorIndex % AVATAR_COLORS$1.length];
  const px = SIZE_MAP[size];
  const initials = getInitials(name);
  const statusConfig = status ? {
    ready: { color: "#4CAF50", label: "Ready" },
    available: { color: "#4CAF50", label: "Available" },
    submitting: { color: "#FF9800", label: "Submitting" },
    waiting: { color: "#9E9E9E", label: "Waiting for..." }
  }[status] : null;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex items-center justify-center rounded-full text-white font-semibold shrink-0",
        style: {
          width: px,
          height: px,
          backgroundColor: color,
          fontSize: FONT_SIZE_MAP[size]
        },
        children: initials
      }
    ),
    /* @__PURE__ */ jsxs(
      "span",
      {
        className: "text-xs font-medium text-center leading-tight max-w-[80px] truncate",
        style: { color: "#3D2E1F" },
        children: [
          name,
          isYou && /* @__PURE__ */ jsx("span", { className: "text-[#8B7355]", children: " (You)" })
        ]
      }
    ),
    statusConfig && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      status === "waiting" ? /* @__PURE__ */ jsx(
        "div",
        {
          className: "rounded-full border",
          style: {
            width: 8,
            height: 8,
            borderColor: "#9E9E9E"
          }
        }
      ) : /* @__PURE__ */ jsx(
        "div",
        {
          className: "rounded-full",
          style: {
            width: 8,
            height: 8,
            backgroundColor: statusConfig.color
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "text-[10px]",
          style: { color: statusConfig.color },
          children: statusConfig.label
        }
      )
    ] })
  ] });
}
function remainingSeconds(targetAt, clockOffsetMs2) {
  const target = new Date(targetAt).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.round((target - (Date.now() + clockOffsetMs2)) / 1e3));
}
function CountdownTimer({
  targetAt,
  clockOffsetMs: clockOffsetMs2 = 0,
  variant = "badge",
  label,
  emptyLabel = "--:--"
}) {
  const [totalSeconds, setTotalSeconds] = useState(
    () => targetAt ? remainingSeconds(targetAt, clockOffsetMs2) : 0
  );
  useEffect(() => {
    if (!targetAt) return;
    setTotalSeconds(remainingSeconds(targetAt, clockOffsetMs2));
    const id = setInterval(() => setTotalSeconds(remainingSeconds(targetAt, clockOffsetMs2)), 1e3);
    return () => clearInterval(id);
  }, [targetAt, clockOffsetMs2]);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = targetAt ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : emptyLabel;
  if (variant === "large") {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      label && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", style: { color: "#8B7355" }, children: label }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl px-8 py-4 text-center", style: { backgroundColor: "#FFF3E0" }, children: /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold tracking-wider font-mono", style: { color: "#E8881E" }, children: display }) })
    ] });
  }
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold font-mono",
      style: { backgroundColor: "#FFF3E0", color: "#E8881E" },
      children: display
    }
  );
}
const CC = {
  card: "#FFFFFF",
  cardBorder: "#F0E4D4",
  primary: "#E8881E",
  primaryLight: "#FFF3E0",
  primaryPale: "#FFFAF4",
  text: "#3D2E1F",
  textMuted: "#8B7355",
  textOrange: "#C5630F",
  border: "#F0E4D4",
  gold: "#FFB84D",
  shadow: "0 2px 12px rgba(0,0,0,0.06)"
};
const lobbyBg = "/assets/game-2-lobby-bg-CMMGoBJy.jpg";
const DEFAULT_RULES = [{
  emoji: "🎮",
  text: "Play 3 rounds: Ingredients → Steps → Elimination."
}, {
  emoji: "✏️",
  text: "Select ingredients and submit one step, actions are time-bound."
}, {
  emoji: "👁️",
  text: "All actions are anonymous, observe patterns carefully."
}, {
  emoji: "🕵️",
  text: "One player is the hidden Impostor trying to mislead the group."
}, {
  emoji: "🔍",
  text: "Use clues to identify suspicious actions."
}, {
  emoji: "🗳️",
  text: "Vote wisely to eliminate the Impostor and win."
}];
const RULE_EMOJIS = ["🎮", "✏️", "👁️", "🕵️", "🔍", "🗳️", "⏱️", "💡"];
function Card({
  children,
  className = "",
  style
}) {
  return /* @__PURE__ */ jsx("div", { className: `rounded-2xl ${className}`, style: {
    backgroundColor: CC.card,
    border: `1px solid ${CC.cardBorder}`,
    boxShadow: CC.shadow,
    ...style
  }, children });
}
function StatBox({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center rounded-xl px-5 py-3 flex-1", style: {
    border: `1px solid ${CC.border}`,
    backgroundColor: CC.primaryPale
  }, children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", style: {
      color: CC.textMuted
    }, children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-lg font-bold mt-0.5", style: {
      color: CC.text
    }, children: value })
  ] });
}
const AVATAR_COLORS = [0, 1, 2, 3, 4, 5];
function LobbyPage() {
  const navigate = useNavigate();
  const session = useMemo(() => getParticipantSession(), []);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineParticipantIds, setOnlineParticipantIds] = useState(null);
  const [clockOffset, setClockOffset] = useState(0);
  const fetchState = useCallback(async () => {
    if (!session?.groupId || !session.participantId) return;
    try {
      const data = await cookAndCreateService.getGameState(session.groupId, session.participantId);
      setGameState(data);
      setClockOffset(clockOffsetMs(data.schedule, Date.now()));
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not load Cook & Create state.");
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
  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    const socket = getSocket();
    socket.emit("join_lobby", {
      groupId: session.groupId,
      participantId: session.participantId
    });
    socket.emit("request_presence", {
      groupId: session.groupId
    });
    const onPresenceUpdated = (payload) => {
      setOnlineParticipantIds(new Set(payload.online_participant_ids ?? []));
    };
    socket.on("presence_updated", onPresenceUpdated);
    const refetch = () => fetchState();
    socket.on("lobby_updated", refetch);
    const interval = setInterval(fetchState, 1e4);
    return () => {
      socket.off("presence_updated", onPresenceUpdated);
      socket.off("lobby_updated", refetch);
      clearInterval(interval);
    };
  }, [session?.groupId, session?.participantId, fetchState]);
  useEffect(() => {
    if (gameState && gameState.instance.status !== "waiting") {
      navigate({
        to: "/cookandcreate/summary"
      });
    }
  }, [gameState, navigate]);
  const players = gameState?.participants ?? [];
  const groupCapacity = 5;
  const joined = players.length;
  const remaining = Math.max(0, groupCapacity - joined);
  const rules = gameState && gameState.rules.length > 0 ? gameState.rules.map((r, i) => ({
    emoji: RULE_EMOJIS[i % RULE_EMOJIS.length],
    text: r.rule_text
  })) : DEFAULT_RULES;
  return /* @__PURE__ */ jsxs(CookCreateLayout, { breadcrumb: "Cook & Create / Lobby", children: [
    /* @__PURE__ */ jsx("img", { src: decorLeft, alt: "", className: "fixed bottom-0 left-0 w-32 md:w-48 opacity-80 pointer-events-none z-0" }),
    /* @__PURE__ */ jsx("img", { src: decorRight, alt: "", className: "fixed bottom-0 right-0 w-40 md:w-64 opacity-80 pointer-events-none z-0" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 relative z-10", children: [
      /* @__PURE__ */ jsx(CookCreateHeader, { participantName: session?.name, gameEndsAt: gameState?.schedule.game_ends_at ?? null, clockOffsetMs: clockOffset }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-5", children: [
        /* @__PURE__ */ jsx(Card, { className: "lg:col-span-3 overflow-hidden relative", style: {
          padding: 0
        }, children: /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col md:flex-row items-center min-h-[410px] bg-center", style: {
          backgroundImage: `url(${lobbyBg})`
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center p-6 relative z-10", children: /* @__PURE__ */ jsx("img", { src: lobbyLogo, alt: "Cook & Create Logo", className: "w-full max-w-[180px] drop-shadow-2xl" }) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 p-6 md:pr-8 relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg", children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-2xl md:text-3xl font-bold leading-tight mb-3", style: {
              color: CC.text
            }, children: [
              "Welcome to",
              /* @__PURE__ */ jsx("br", {}),
              "Cook & Create"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed font-medium", style: {
              color: CC.textMuted
            }, children: gameState?.template.description || "Work together to create the best dish while finding the hidden imposter in your team" })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2 p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold mb-4", style: {
            color: CC.text
          }, children: "📖 Game Rules" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: rules.map((rule, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg shrink-0 mt-0.5", children: rule.emoji }),
            /* @__PURE__ */ jsx("span", { className: "text-sm leading-relaxed", style: {
              color: CC.textMuted
            }, children: rule.text })
          ] }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(Users, { size: 20, style: {
              color: CC.primary
            } }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", style: {
              color: CC.text
            }, children: "Your Group & Status" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-6", children: [
            /* @__PURE__ */ jsx(StatBox, { label: "Group Capacity", value: groupCapacity }),
            /* @__PURE__ */ jsx(StatBox, { label: "Joined", value: joined }),
            /* @__PURE__ */ jsx(StatBox, { label: "Remaining", value: remaining })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 flex-wrap", children: [
            players.map((p, i) => /* @__PURE__ */ jsx(PlayerAvatar, { name: p.name, colorIndex: AVATAR_COLORS[i % AVATAR_COLORS.length], size: "lg", status: p.isYou || (onlineParticipantIds ? onlineParticipantIds.has(p.id) : p.status === "online") ? "ready" : "waiting", isYou: p.isYou }, p.id)),
            Array.from({
              length: remaining
            }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center rounded-full", style: {
                width: 48,
                height: 48,
                border: "2px dashed #D0D0D0",
                backgroundColor: "#F9F9F9"
              }, children: /* @__PURE__ */ jsx("span", { className: "text-lg", style: {
                color: "#BDBDBD"
              }, children: "?" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", style: {
                color: "#9E9E9E"
              }, children: "Waiting" })
            ] }, `empty-${i}`))
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx(CalendarClock, { size: 20, style: {
              color: CC.primary
            } }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", style: {
              color: CC.text
            }, children: "Event Status" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mb-4", style: {
            color: CC.textMuted
          }, children: loading ? "Loading..." : remaining > 0 ? "Waiting for all participants to join" : "Game starting soon" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 rounded-xl p-4 flex items-start gap-3", style: {
              backgroundColor: CC.primaryLight,
              border: `1px solid ${CC.gold}`
            }, children: [
              /* @__PURE__ */ jsx(AlertTriangle, { size: 20, className: "shrink-0 mt-0.5", style: {
                color: CC.primary
              } }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs leading-relaxed", style: {
                color: CC.textOrange
              }, children: [
                "Your group requires exactly ",
                groupCapacity,
                " participants. The game will start automatically once all players have joined at the scheduled time. Please contact your organizer to complete your group."
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center", children: /* @__PURE__ */ jsx(CountdownTimer, { targetAt: gameState?.schedule.game_starts_at ?? null, clockOffsetMs: clockOffset, variant: "large", label: "Game Starts in", emptyLabel: "--:--" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "w-full py-4 rounded-full text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer", style: {
        background: `linear-gradient(135deg, ${CC.gold} 0%, ${CC.primary} 100%)`,
        boxShadow: "0 4px 16px rgba(232,136,30,0.3)"
      }, onClick: () => navigate({
        to: "/"
      }), children: "🚪 Leave Lobby" })
    ] })
  ] });
}
export {
  LobbyPage as component
};
