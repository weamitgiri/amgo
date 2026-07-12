import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Award, Target, Gamepad2, HelpCircle, Clock, Timer, Users, User, Info, LogOut } from "lucide-react";
import { g as getParticipantSession, p as participantService, s as saveParticipantSession, L as Logo, c as clearParticipantSession } from "./participant-session-MItZ-Ggq.js";
import { g as getSocket, d as disconnectSocket } from "./socket-Bwou9MYK.js";
import { r as resolveMediaUrl } from "./media-BmyD47-a.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { b as Route } from "./router-qdPwl0jo.js";
import "./config-qISbZfHI.js";
import "socket.io-client";
import "sonner";
import "@tanstack/react-query";
const investigation = "/assets/investigation-photos-BXM8Y0tz.png";
const AVATAR_GRADS = ["from-pink-500 to-orange-400", "from-cyan-400 to-blue-500", "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-emerald-500 to-teal-600"];
const ACTIVITY_ICONS = {
  "detective-mystery": Target,
  "mystery-quest": Target,
  "cook-create": Award
};
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function initials(name) {
  return name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}
function LobbyPage() {
  const navigate = useNavigate();
  const {
    invite_url: inviteUrl,
    game: gameSlug
  } = Route.useSearch();
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const session = useMemo(() => getParticipantSession(), []);
  const fetchLobby = useCallback(async (groupId, participantId) => {
    const data = await participantService.getLobby(groupId, participantId);
    setLobby(data);
    setCountdown(data.lobby_phase === "lobby_timer" ? data.lobby_countdown_seconds : null);
    return data;
  }, []);
  useEffect(() => {
    if (!session?.groupId) {
      if (inviteUrl) {
        navigate({
          to: "/join/$linkToken",
          params: {
            linkToken: inviteUrl
          }
        });
      } else {
        setLoading(false);
      }
      return;
    }
    if (inviteUrl || gameSlug) {
      saveParticipantSession({
        groupId: session.groupId,
        participantId: session.participantId,
        name: session.name,
        inviteUrl: inviteUrl ?? session.inviteUrl,
        gameSlug: gameSlug ?? session.gameSlug
      });
    }
    setLoading(true);
    fetchLobby(session.groupId, session.participantId).catch((err) => {
      toastError(err instanceof Error ? err.message : "Could not load lobby.");
    }).finally(() => setLoading(false));
  }, [session?.groupId, session?.participantId, inviteUrl, gameSlug, navigate, fetchLobby]);
  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    const socket = getSocket();
    socket.emit("join_lobby", {
      groupId: session.groupId,
      participantId: session.participantId
    });
    const onLobbyUpdated = (payload) => {
      setLobby(payload);
      setCountdown(payload.lobby_phase === "lobby_timer" ? payload.lobby_countdown_seconds : null);
    };
    socket.on("lobby_updated", onLobbyUpdated);
    return () => {
      socket.off("lobby_updated", onLobbyUpdated);
    };
  }, [session?.groupId, session?.participantId]);
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((s) => s !== null && s > 0 ? s - 1 : 0);
    }, 1e3);
    return () => clearInterval(t);
  }, [countdown]);
  const slug = gameSlug ?? session?.gameSlug ?? lobby?.activity.slug ?? "detective-mystery";
  useEffect(() => {
    if (!lobby) return;
    if (lobby.lobby_phase === "ready" || lobby.lobby_phase === "lobby_timer" && countdown === 0) {
      navigate({
        to: "/game",
        search: {
          game: slug
        }
      });
    }
  }, [lobby, countdown, navigate, slug]);
  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    const interval = setInterval(() => {
      fetchLobby(session.groupId, session.participantId).catch(() => void 0);
    }, 15e3);
    return () => clearInterval(interval);
  }, [session?.groupId, session?.participantId, fetchLobby]);
  if (!session?.groupId && !inviteUrl) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-purple-900 text-white grid place-items-center p-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-md", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "No active lobby session" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/70", children: "Join an activity using your invitation link first." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-6 inline-block rounded-full bg-white/10 px-5 py-2 text-sm", children: "Go home" })
    ] }) });
  }
  if (loading || !lobby) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-purple-900 text-white grid place-items-center", children: /* @__PURE__ */ jsx("p", { className: "text-white/70 animate-pulse", children: "Loading lobby…" }) });
  }
  const ActivityIcon = ACTIVITY_ICONS[lobby.activity.slug] ?? Gamepad2;
  resolveMediaUrl(lobby.activity.cover_image) ?? mystery;
  const iconUrl = lobby.activity.icon ? resolveMediaUrl(lobby.activity.icon) : null;
  const titleParts = lobby.activity.title.split(/\s+/);
  const titleLine1 = titleParts[0]?.toUpperCase() ?? "MYSTERY";
  const titleLine2 = titleParts.slice(1).join(" ").toUpperCase() || "QUEST";
  const caseTitle = lobby.game.title ?? lobby.activity.title;
  const caseTagline = lobby.game.tagline?.trim() || stripHtml(lobby.game.case_summary || "").slice(0, 80) || "Uncover the truth. Catch the culprit.";
  const mm = String(Math.floor((countdown ?? 0) / 60)).padStart(2, "0");
  const ss = String((countdown ?? 0) % 60).padStart(2, "0");
  const slots = Array.from({
    length: lobby.group_capacity
  }, (_, i) => lobby.members[i] ?? null);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-purple-900 text-white p-4 md:p-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Logo, {}),
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: lobby.activity.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold", children: initials(session?.name ?? "You") }),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: session?.name ?? "Participant" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mt-4 grid gap-5 lg:grid-cols-[1fr_2fr_1.1fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 grid place-items-center min-h-[360px]", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto h-44 w-44 rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-900 grid place-items-center shadow-glow ring-2 ring-white/20 overflow-hidden", children: iconUrl ? /* @__PURE__ */ jsx("img", { src: iconUrl, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(ActivityIcon, { className: "h-20 w-20 text-white" }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 text-3xl font-black tracking-wide", children: titleLine1 }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-purple-300 -mt-1", children: titleLine2 }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-white/60", children: lobby.group_name })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative min-h-[360px]", children: [
        /* @__PURE__ */ jsx("img", { src: investigation, alt: "", className: "absolute h-full w-full object-cover" }),
        /* @__PURE__ */ jsx("div", { className: "absolute  bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" }),
        /* @__PURE__ */ jsx("div", { className: "relative p-6", children: /* @__PURE__ */ jsxs("div", { className: "inline-block rounded-xl border-2 border-cyan-400/60 bg-purple-900/40 backdrop-blur px-4 py-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold", children: [
            "Case: ",
            caseTitle
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-white/80", children: caseTagline })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 max-h-[360px] overflow-y-auto", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-4", children: "Rules" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-sm", children: lobby.rules.length > 0 ? lobby.rules.map((rule) => /* @__PURE__ */ jsx(Rule, { icon: HelpCircle, children: rule.rule_text }, rule.id)) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Rule, { icon: HelpCircle, children: [
            "You have ",
            lobby.settings.max_questions,
            " questions to find the truth."
          ] }),
          /* @__PURE__ */ jsxs(Rule, { icon: Clock, children: [
            "Each participant gets ",
            Math.round(lobby.settings.question_response_secs / 60),
            " minutes to answer."
          ] }),
          /* @__PURE__ */ jsxs(Rule, { icon: Timer, children: [
            "Game duration: ",
            Math.round(lobby.settings.game_duration_secs / 60),
            " minutes"
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-purple-500/30 grid place-items-center", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-purple-300" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Your Group & Status" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-3 gap-4 text-sm", children: [
          /* @__PURE__ */ jsx(Stat, { label: "Group Capacity", value: String(lobby.group_capacity) }),
          /* @__PURE__ */ jsx(Stat, { label: "Joined", value: String(lobby.member_count) }),
          /* @__PURE__ */ jsx(Stat, { label: "Remaining", value: String(lobby.remaining_slots) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 flex items-end gap-5 flex-wrap", children: slots.map((member, index) => member ? /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: `h-14 w-14 mx-auto rounded-full bg-gradient-to-br ${AVATAR_GRADS[index % AVATAR_GRADS.length]} grid place-items-center font-bold ring-2 ring-white/15 text-sm`, children: member.is_you ? initials(member.name) : member.name.slice(0, 2).toUpperCase() }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs max-w-[88px] truncate", children: member.is_you ? `${member.name} (You)` : member.name }),
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-cyan-300 capitalize", children: [
            "(",
            member.status,
            ")"
          ] })
        ] }, member.id) : /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "h-14 w-14 mx-auto rounded-full bg-white/10 grid place-items-center ring-2 ring-white/10", children: /* @__PURE__ */ jsx(User, { className: "h-6 w-6 text-white/50" }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 text-[11px] text-white/65 max-w-[80px]", children: "Waiting for participant" })
        ] }, `empty-${index}`)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-purple-500/30 grid place-items-center", children: /* @__PURE__ */ jsx(Gamepad2, { className: "h-5 w-5 text-purple-300" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Session Status" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60", children: lobby.status_message })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-4 md:grid-cols-[1fr_auto] items-stretch", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-white/5 border border-white/10 p-4 flex gap-3", children: [
            /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-purple-300 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/80 leading-relaxed", children: [
              lobby.lobby_phase === "before_start" && /* @__PURE__ */ jsxs(Fragment, { children: [
                "Scheduled start: ",
                /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: lobby.scheduled_start_label }),
                ". The game opens after a ",
                Math.round(lobby.settings.lobby_wait_secs / 60),
                "-minute entry window. Participants can join during that window, and the lobby timer counts down to the game start."
              ] }),
              lobby.lobby_phase === "waiting_members" && /* @__PURE__ */ jsxs(Fragment, { children: [
                "The activity has started",
                lobby.scheduled_start_label ? ` (${lobby.scheduled_start_label})` : "",
                ". Share the invite link so ",
                lobby.remaining_slots,
                " more participant",
                lobby.remaining_slots === 1 ? "" : "s",
                " can join before entry closes."
              ] }),
              lobby.lobby_phase === "lobby_timer" && /* @__PURE__ */ jsxs(Fragment, { children: [
                "The game started at the scheduled time",
                lobby.scheduled_start_label ? ` (${lobby.scheduled_start_label})` : "",
                ". The lobby timer shows time remaining until the ",
                Math.round(lobby.settings.lobby_wait_secs / 60),
                "-minute entry window closes."
              ] }),
              lobby.lobby_phase === "ready" && /* @__PURE__ */ jsx(Fragment, { children: "Launching the game now…" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-white/5 border border-white/10 p-5 text-center min-w-[140px]", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-white/70", children: lobby.lobby_phase === "lobby_timer" ? "Game Starts in" : lobby.lobby_phase === "before_start" ? "Starts at" : "Joined" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-3xl font-black tabular-nums", children: lobby.lobby_phase === "lobby_timer" ? `${mm}:${ss}` : lobby.lobby_phase === "before_start" && lobby.scheduled_start_label ? lobby.scheduled_start_label.split(",").pop()?.trim() ?? "—" : `${lobby.member_count}/${lobby.group_capacity}` })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
          disconnectSocket();
          clearParticipantSession();
          const token = inviteUrl ?? session?.inviteUrl;
          if (token) {
            navigate({
              to: "/join/$linkToken",
              params: {
                linkToken: token
              }
            });
          } else {
            navigate({
              to: "/"
            });
          }
        }, className: "mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 text-white py-3 text-sm font-semibold hover:bg-white/10", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
          " Leave Lobby"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-8 text-center text-xs text-white/55", children: [
      "Powered by ",
      /* @__PURE__ */ jsx("span", { className: "text-white", children: "Zoventro" }),
      " · © 2026 zoventro.com All Rights Reserved"
    ] })
  ] });
}
function Rule({
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxs("li", { className: "flex gap-3 items-start", children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-purple-300 mt-0.5 shrink-0" }),
    /* @__PURE__ */ jsx("span", { className: "text-white/85", children })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-white/5 border border-white/10 p-3", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/60", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-2xl font-bold", children: value })
  ] });
}
export {
  LobbyPage as component
};
