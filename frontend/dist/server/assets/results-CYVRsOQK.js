import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { FileText, UserX, Download, Star, Trophy, X, Ghost, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { L as Logo } from "./Logo-B423IJ3f.js";
import { p as participantService } from "./participant.service-CRAKZY7j.js";
import { g as getParticipantSession } from "./participant-session-CZEpXMRe.js";
import { r as resolveMediaUrl } from "./media-DMImknnw.js";
import { t as toastError, a as toastSuccess } from "./toast-B5Q8Bvxc.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import "./router-BvkvNwFV.js";
import "@tanstack/react-query";
import "sonner";
import "./config-OQZNPa_v.js";
const ROLE_LABELS = {
  investigator: "Investigator",
  culprit: "Hidden Culprit",
  suspect: "Key Suspect",
  witness: "Witness",
  participant: "Participant"
};
const ROLE_TEXT = {
  investigator: "text-purple-300",
  culprit: "text-rose-400",
  suspect: "text-amber-300",
  witness: "text-emerald-400",
  participant: "text-sky-400"
};
const ROLE_BADGES = {
  investigator: "bg-purple-500/15 text-purple-300 border-purple-400/40",
  culprit: "bg-rose-500/15 text-rose-300 border-rose-400/40",
  suspect: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  witness: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  participant: "bg-sky-500/15 text-sky-300 border-sky-400/40"
};
const ROLE_GRADS = {
  investigator: "from-violet-600 to-purple-900",
  culprit: "from-fuchsia-700 to-rose-900",
  suspect: "from-amber-700 to-red-900",
  witness: "from-emerald-800 to-zinc-900",
  participant: "from-slate-700 to-zinc-900"
};
const STATUS_META = {
  winner: {
    label: "Winner",
    className: "bg-amber-400/15 text-amber-300 border-amber-400/40",
    Icon: Trophy
  },
  correct: {
    label: "Identified the killer",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
    Icon: Check
  },
  loser: {
    label: "Wrong guess",
    className: "bg-rose-500/15 text-rose-300 border-rose-400/40",
    Icon: X
  },
  killer_wins: {
    label: "The killer escaped!",
    className: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/40",
    Icon: Ghost
  }
};
function StatusBadge({
  status,
  roleType
}) {
  if (!status) return null;
  const meta = status === "loser" && roleType === "culprit" ? {
    ...STATUS_META.loser,
    label: "Caught!"
  } : STATUS_META[status];
  if (!meta) return null;
  const {
    Icon
  } = meta;
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${meta.className}`, children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
    meta.label
  ] });
}
function splitCharacterName(rawName) {
  const match = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) return {
    displayName: match[1].trim(),
    title: match[2].trim()
  };
  return {
    displayName: rawName.trim(),
    title: null
  };
}
function PlayerAvatar({
  player,
  className = "h-9 w-9"
}) {
  const image = resolveMediaUrl(player.role_image ?? null);
  return /* @__PURE__ */ jsx("div", { className: `${className} rounded-full overflow-hidden shrink-0 border border-white/10`, children: image ? /* @__PURE__ */ jsx("img", { src: image, alt: "", className: "h-full w-full object-cover object-top" }) : /* @__PURE__ */ jsx("div", { className: `h-full w-full bg-gradient-to-br ${ROLE_GRADS[player.role_type] ?? "from-slate-700 to-zinc-900"} grid place-items-center text-[10px] font-bold text-white`, children: player.pseudonym.slice(0, 2).toUpperCase() }) });
}
function ResultsPage() {
  const session = getParticipantSession();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  useEffect(() => {
    if (!session?.groupId) return;
    const saved = sessionStorage.getItem(`results_rating_${session.groupId}`);
    if (saved) setRating(Number(saved) || 0);
  }, [session?.groupId]);
  useEffect(() => {
    if (!session?.groupId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let timer;
    const fetchResults = () => {
      participantService.getGameResults(session.groupId, session.participantId).then((data) => {
        if (cancelled) return;
        setResults(data);
        if (!data.is_finished) {
          timer = window.setTimeout(fetchResults, 5e3);
        }
      }).catch(() => {
        if (!cancelled) timer = window.setTimeout(fetchResults, 5e3);
      }).finally(() => {
        if (!cancelled) setLoading(false);
      });
    };
    fetchResults();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [session?.groupId, session?.participantId]);
  const players = useMemo(() => {
    const list = results?.players?.length ? results.players : [...results?.winners ?? [], ...results?.losers ?? []];
    return [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [results]);
  if (!session?.groupId) {
    return /* @__PURE__ */ jsx(Shell, { children: /* @__PURE__ */ jsxs("div", { className: "mt-16 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "No active game session" }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-4 inline-block text-primary text-sm", children: "Go home" })
    ] }) });
  }
  if (loading) {
    return /* @__PURE__ */ jsx(Shell, { name: session.name, children: /* @__PURE__ */ jsx("p", { className: "mt-16 text-center text-white/60 animate-pulse", children: "Loading results…" }) });
  }
  if (!results || !results.is_finished) {
    return /* @__PURE__ */ jsx(Shell, { name: session.name, children: /* @__PURE__ */ jsxs("div", { className: "mt-16 mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto h-14 w-14 rounded-full bg-purple-500/20 grid place-items-center animate-pulse", children: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-purple-300" }) }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-bold", children: "Waiting for the other players…" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/70", children: "The results will appear as soon as every player has submitted their final accusation or the session time runs out. This page refreshes automatically." })
    ] }) });
  }
  const culprit = results.culprit ?? null;
  const culpritName = culprit?.character_name ? splitCharacterName(culprit.character_name) : null;
  const culpritImage = resolveMediaUrl(culprit?.role_image ?? null);
  const fullStory = results.full_story ?? [];
  const rolesRevealed = [...players].sort((a, b) => Number(b.is_you ?? false) - Number(a.is_you ?? false));
  const handleRate = (stars) => {
    setRating(stars);
    sessionStorage.setItem(`results_rating_${session.groupId}`, String(stars));
    toastSuccess("Thanks for rating your experience!");
  };
  const handleDownloadPdf = () => {
    if (!results.pdf_available || !session.participantId) {
      toastError("The results PDF is no longer available.");
      return;
    }
    window.open(participantService.getResultsPdfUrl(session.groupId, session.participantId), "_blank");
  };
  return /* @__PURE__ */ jsxs(Shell, { name: session.name, children: [
    results.is_incomplete && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-5 py-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(UserX, { className: "h-5 w-5 text-rose-300 shrink-0" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold text-rose-200", children: "Game Incomplete" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-200/80", children: "The Investigator left the game, so the session ended early. All roles are revealed below." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-[#241243] to-[#170d31] px-5 py-4 flex items-center justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-full bg-purple-500/25 border border-purple-400/30 grid place-items-center", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-purple-200" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-wide", children: "Results & Role Revealed" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 print:hidden", children: results.pdf_available && /* @__PURE__ */ jsxs("button", { onClick: handleDownloadPdf, className: "rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Download Results PDF" })
      ] }) })
    ] }),
    results.pdf_available && results.pdf_expires_at && /* @__PURE__ */ jsx("p", { className: "mt-2 text-[11px] text-white/50", children: "The results PDF is available for 1 hour after the game ends, then it is permanently deleted along with all participant data." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr] items-start", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-8 py-6 flex-wrap", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center sm:text-right", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black text-amber-100", children: results.is_incomplete ? "The Case Was Never Solved" : results.killer_wins ? "The Killer Escaped!" : "The Truth is Out!" }),
            results.killer_wins && !results.is_incomplete && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-fuchsia-300 font-semibold", children: "Nobody identified the Hidden Culprit — the killer wins this round." }),
            culprit && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-white/75 mt-2", children: "The hidden Culprit was" }),
              /* @__PURE__ */ jsx("div", { className: "text-rose-400 text-4xl font-bold mt-1", children: culpritName?.displayName ?? culprit.pseudonym }),
              culpritName?.title && /* @__PURE__ */ jsxs("div", { className: "text-rose-300 text-lg mt-1", children: [
                "(",
                culpritName.title,
                ")!"
              ] }),
              typeof results.correct_guess_count === "number" && typeof results.total_guessers === "number" && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-white/50 mt-2", children: [
                results.correct_guess_count,
                " of ",
                results.total_guessers,
                " players identified them correctly"
              ] })
            ] })
          ] }),
          culprit && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -top-4 -right-5 h-16 w-16 opacity-60", style: {
              backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1.5px, transparent 1.5px)",
              backgroundSize: "10px 10px"
            } }),
            /* @__PURE__ */ jsx("div", { className: "relative h-32 w-32 rounded-full overflow-hidden ring-2 ring-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.35)]", children: culpritImage ? /* @__PURE__ */ jsx("img", { src: culpritImage, alt: "", className: "h-full w-full object-cover object-top" }) : /* @__PURE__ */ jsx("div", { className: `h-full w-full bg-gradient-to-br ${ROLE_GRADS.culprit}` }) })
          ] })
        ] }),
        fullStory.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#231240] to-[#160d2c] p-6 md:p-7", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-pink-400", children: "The Full Story" }),
            results.tagline && /* @__PURE__ */ jsx("div", { className: "rotate-[-1deg] bg-amber-100/95 text-zinc-900 text-xs font-bold px-4 py-2 rounded-sm shadow-elevated", children: results.tagline })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 space-y-6", children: fullStory.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4 items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "w-24 h-20 md:w-28 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40", children: /* @__PURE__ */ jsx("img", { src: resolveMediaUrl(item.image) ?? mystery, alt: "", className: "h-full w-full object-cover" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-white", children: item.title }),
              item.text && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[13px] leading-relaxed text-white/75", children: item.text })
            ] })
          ] }, item.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#231240] to-[#160d2c] p-6 md:p-7", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl", "aria-hidden": true, children: "🎉" }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-black text-amber-300", children: "Fun Over" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-white/80 mt-1", children: "Here are the final results!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center print:hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-amber-300", children: "Rate Your Experience" }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 flex items-center justify-center gap-1.5", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleRate(star), "aria-label": `Rate ${star} stars`, children: /* @__PURE__ */ jsx(Star, { className: `h-9 w-9 transition-colors ${star <= rating ? "text-amber-400 fill-amber-400" : "text-white/25 fill-white/25"}` }) }, star)) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: players.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 py-3.5 border-b border-white/10 last:border-b-0", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 grid place-items-center shrink-0", children: (p.status === "winner" || p.status === "killer_wins") && !results.is_incomplete ? /* @__PURE__ */ jsx(Trophy, { className: "h-6 w-6 text-amber-400" }) : /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-white", children: i + 1 }) }),
          /* @__PURE__ */ jsx(PlayerAvatar, { player: p }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "font-medium text-white truncate", children: [
              p.pseudonym,
              p.is_you && /* @__PURE__ */ jsx("span", { className: "text-white/60 font-normal", children: " (You)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsx("span", { className: `text-xs ${ROLE_TEXT[p.role_type] ?? "text-white/70"}`, children: ROLE_LABELS[p.role_type] ?? p.role_type }),
              !results.is_incomplete && /* @__PURE__ */ jsx(StatusBadge, { status: p.status, roleType: p.role_type })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "w-16 text-right font-semibold text-amber-300 whitespace-nowrap", children: [
            p.score ?? 0,
            " pts"
          ] })
        ] }, p.session_id)) }),
        /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-6 block text-center w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] py-3.5 text-sm font-bold text-white shadow-glow hover:opacity-90 transition-opacity print:hidden", children: "Exit to Lobby" })
      ] })
    ] }),
    rolesRevealed.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-10 pb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-center text-lg font-bold text-white", children: "Roles Revealed" }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 flex flex-wrap justify-center gap-4", children: rolesRevealed.map((p) => {
        const character = p.character_name ? splitCharacterName(p.character_name) : null;
        return /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 rounded-2xl border px-4 py-3 min-w-[210px] ${p.is_you ? "border-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5"}`, children: [
          /* @__PURE__ */ jsx(PlayerAvatar, { player: p, className: "h-12 w-12" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold text-white truncate", children: [
              p.pseudonym,
              p.is_you && /* @__PURE__ */ jsx("span", { className: "text-white/60 font-normal", children: " (You)" })
            ] }),
            character?.title && /* @__PURE__ */ jsx("div", { className: "text-xs text-white/70 truncate", children: character.title }),
            /* @__PURE__ */ jsx("span", { className: `mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGES[p.role_type] ?? "bg-white/10 text-white/70 border-white/20"}`, children: ROLE_LABELS[p.role_type] ?? p.role_type })
          ] })
        ] }, p.session_id);
      }) })
    ] })
  ] });
}
function Shell({
  children,
  name
}) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0d0820] text-white p-4 md:p-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Logo, {}),
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Mystery Quest" })
      ] }),
      name && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold", children: (name[0] ?? "P").toUpperCase() }),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: name })
      ] })
    ] }),
    children
  ] });
}
export {
  ResultsPage as component
};
