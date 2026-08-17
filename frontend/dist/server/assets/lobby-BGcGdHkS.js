import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Award, Target, Gamepad2, HelpCircle, Clock, Star, Lightbulb, Hand, Search, Timer, Users, User, Info, LogOut } from "lucide-react";
import { L as Logo } from "./Logo-B423IJ3f.js";
import { p as participantService } from "./participant.service-CRAKZY7j.js";
import { g as getSocket, d as disconnectSocket } from "./socket-Bwou9MYK.js";
import { g as getParticipantSession, s as saveParticipantSession, c as clearParticipantSession } from "./participant-session-CZEpXMRe.js";
import { r as resolveMediaUrl } from "./media-DMImknnw.js";
import { a as isCookAndCreateSlug, r as resolveGameRoute } from "./common-CBq9_QVG.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { b as Route } from "./router-BvkvNwFV.js";
import "./config-OQZNPa_v.js";
import "socket.io-client";
import "clsx";
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
  const slugCandidate = gameSlug ?? session?.gameSlug ?? lobby?.activity?.slug;
  useEffect(() => {
    if (isCookAndCreateSlug(slugCandidate)) {
      navigate({
        to: "/cookandcreate/lobby",
        search: {
          invite_url: inviteUrl ?? "",
          game: slugCandidate ?? ""
        }
      });
    }
  }, [slugCandidate, inviteUrl, navigate]);
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
      setCountdown((s2) => s2 !== null && s2 > 0 ? s2 - 1 : 0);
    }, 1e3);
    return () => clearInterval(t);
  }, [countdown]);
  const slug = gameSlug ?? session?.gameSlug ?? lobby?.activity.slug ?? "detective-mystery";
  useEffect(() => {
    if (!lobby) return;
    if (lobby.lobby_phase === "ready" || lobby.lobby_phase === "lobby_timer" && countdown === 0) {
      const target = resolveGameRoute(slug);
      navigate({
        to: target.to,
        search: target.search
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
  const cover = resolveMediaUrl(lobby.activity.cover_image) ?? mystery;
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
  const toMin = (secs) => Math.max(1, Math.round(secs / 60));
  const s = lobby.settings;
  const derivedRules = lobby.rules.length > 0 ? lobby.rules.map((r) => r.rule_text) : [/* @__PURE__ */ jsxs(Fragment, { children: [
    "The Investigator has ",
    /* @__PURE__ */ jsx("b", { children: s.max_questions }),
    " questions to examine any participant and establish the truth."
  ] }), /* @__PURE__ */ jsxs(Fragment, { children: [
    "Each participant gets ",
    toMin(s.question_response_secs),
    " minutes to answer."
  ] }), /* @__PURE__ */ jsxs(Fragment, { children: [
    "No answer in time will cost ",
    /* @__PURE__ */ jsx("span", { className: "text-amber-400 font-semibold", children: "-10 points" }),
    "."
  ] }), /* @__PURE__ */ jsxs(Fragment, { children: [
    "Clue Rooms open after ",
    toMin(s.clue_room_unlock_secs),
    " minutes."
  ] }), ...s.lie_detector_enabled ? [/* @__PURE__ */ jsxs(Fragment, { children: [
    "Use the Lie Detector round wisely to uncover suspicious answers. (",
    toMin(s.lie_detector_timer_secs),
    " minute round)"
  ] })] : [], /* @__PURE__ */ jsx(Fragment, { children: "Find the culprit before time runs out!" }), /* @__PURE__ */ jsxs(Fragment, { children: [
    "Game Duration: ",
    toMin(s.game_duration_secs),
    " Minutes"
  ] })];
  const leaveLobby = () => {
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
  };
  const timerLabel = lobby.lobby_phase === "lobby_timer" ? "Session Starts in" : lobby.lobby_phase === "before_start" ? "Starts at" : "Joined";
  const timerValue = lobby.lobby_phase === "lobby_timer" ? `${mm}:${ss}` : lobby.lobby_phase === "before_start" && lobby.scheduled_start_label ? lobby.scheduled_start_label.split(",").pop()?.trim() ?? "—" : `${lobby.member_count}/${lobby.group_capacity}`;
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0a0715] text-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between rounded-2xl border border-white/5 bg-[#100b20]/80 px-5 py-3.5 backdrop-blur", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Logo, {}),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-bold tracking-wide", children: lobby.activity.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-xs font-bold", children: initials(session?.name ?? "You") }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-white/90", children: session?.name ?? "Participant" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mt-6 grid gap-5 lg:grid-cols-[1fr_2fr_1.15fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "grid place-items-center rounded-3xl p-6 min-h-[380px]", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto grid h-48 w-48 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-900 shadow-[0_0_50px_-10px_rgba(168,85,247,0.6)] ring-2 ring-white/20", children: iconUrl ? /* @__PURE__ */ jsx("img", { src: iconUrl, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(ActivityIcon, { className: "h-24 w-24 text-white" }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 text-3xl font-black tracking-wide", children: titleLine1 }),
        /* @__PURE__ */ jsx("div", { className: "-mt-1 text-xl font-semibold tracking-[0.2em] text-purple-300", children: titleLine2 }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-white/50", children: lobby.group_name })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative min-h-[380px] overflow-hidden rounded-3xl border border-white/10", children: [
        /* @__PURE__ */ jsx("img", { src: cover || investigation, alt: "", className: "absolute inset-0 h-full w-full object-cover" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" }),
        /* @__PURE__ */ jsx("div", { className: "relative p-6", children: /* @__PURE__ */ jsxs("div", { className: "inline-block max-w-[80%] rounded-2xl bg-black/45 px-5 py-3.5 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
            "Case: ",
            caseTitle
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-sm text-white/75", children: caseTagline })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-h-[380px] overflow-y-auto rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1d1440] to-[#140e2b] p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-4 text-xl font-bold", children: "Rules" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-3.5 text-sm", children: derivedRules.map((rule, i) => /* @__PURE__ */ jsx(Rule, { icon: RULE_ICONS[i % RULE_ICONS.length], children: rule }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1c1440] to-[#140e2b] p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/20", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-purple-300" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: "Your Group & Status" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-black/20", children: [
          /* @__PURE__ */ jsx(StatCell, { label: "Group Capacity", value: String(lobby.group_capacity) }),
          /* @__PURE__ */ jsx(StatCell, { label: "Joined", value: String(lobby.member_count) }),
          /* @__PURE__ */ jsx(StatCell, { label: "Remaining", value: String(lobby.remaining_slots) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-7 flex flex-wrap items-start gap-6", children: slots.map((member, index) => member ? /* @__PURE__ */ jsxs("div", { className: "w-[92px] text-center", children: [
          /* @__PURE__ */ jsx("div", { className: `mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${AVATAR_GRADS[index % AVATAR_GRADS.length]} text-base font-bold ring-2 ring-white/15`, children: member.is_you ? initials(member.name) : member.name.slice(0, 2).toUpperCase() }),
          /* @__PURE__ */ jsx("div", { className: "mt-2.5 truncate text-sm font-medium", children: member.is_you ? `${member.name} (You)` : member.name }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs capitalize text-emerald-400", children: [
            "(",
            member.status,
            ")"
          ] })
        ] }, member.id) : /* @__PURE__ */ jsxs("div", { className: "w-[92px] text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/5 ring-2 ring-white/10", children: /* @__PURE__ */ jsx(User, { className: "h-7 w-7 text-white/40" }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-2.5 text-xs leading-tight text-white/55", children: "Waiting for..." })
        ] }, `empty-${index}`)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1c1440] to-[#140e2b] p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/20", children: /* @__PURE__ */ jsx(Gamepad2, { className: "h-5 w-5 text-purple-300" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: "Session Status" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-white/55", children: "Ensure all the participants have joined and groups are complete" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid items-stretch gap-4 md:grid-cols-[1fr_auto]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4", children: [
            /* @__PURE__ */ jsx(Info, { className: "mt-0.5 h-4 w-4 shrink-0 text-purple-300" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs leading-relaxed text-white/75", children: [
              lobby.lobby_phase === "before_start" && /* @__PURE__ */ jsxs(Fragment, { children: [
                "Your group requires exactly ",
                lobby.group_capacity,
                " participants. Scheduled start:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: lobby.scheduled_start_label }),
                ". The session will start automatically once all participants have joined at the scheduled time. Please contact your organiser to complete your group."
              ] }),
              lobby.lobby_phase === "waiting_members" && /* @__PURE__ */ jsxs(Fragment, { children: [
                "Your group requires exactly ",
                lobby.group_capacity,
                " participants. Share the invite link so",
                " ",
                lobby.remaining_slots,
                " more participant",
                lobby.remaining_slots === 1 ? "" : "s",
                " can join before entry closes. Please contact your organiser to complete your group."
              ] }),
              lobby.lobby_phase === "lobby_timer" && /* @__PURE__ */ jsxs(Fragment, { children: [
                "Your group requires exactly ",
                lobby.group_capacity,
                " participants. The session will start automatically once all participants have joined. The timer shows the time remaining until the entry window closes."
              ] }),
              lobby.lobby_phase === "ready" && /* @__PURE__ */ jsx(Fragment, { children: "All participants have joined. Launching the game now…" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid min-w-[150px] place-items-center rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#2a1a4d] to-[#1a1033] p-5 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-white/70", children: timerLabel }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-4xl font-black tabular-nums", children: timerValue })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: leaveLobby, className: "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#e879f9] py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(168,85,247,0.7)] transition-opacity hover:opacity-90", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
          " Leave Lobby"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-8 text-center text-xs text-white/45", children: [
      "Powered by ",
      /* @__PURE__ */ jsx("span", { className: "text-white/80", children: "Zoventro" }),
      " · © 2026 zoventro.com All Rights Reserved"
    ] })
  ] }) });
}
const RULE_ICONS = [HelpCircle, Clock, Star, Lightbulb, Hand, Search, Timer];
function Rule({
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-500/15", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-purple-300" }) }),
    /* @__PURE__ */ jsx("span", { className: "text-white/85", children })
  ] });
}
function StatCell({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-white/55", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 text-2xl font-bold", children: value })
  ] });
}
export {
  LobbyPage as component
};
