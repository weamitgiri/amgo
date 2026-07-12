import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { FileText, UserX, Download, Printer, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { g as getParticipantSession, p as participantService, L as Logo } from "./participant-session-MItZ-Ggq.js";
import { t as toastError, a as toastSuccess } from "./toast-B5Q8Bvxc.js";
import "./router-qdPwl0jo.js";
import "@tanstack/react-query";
import "sonner";
import "./config-qISbZfHI.js";
const ROLE_LABELS = {
  investigator: "Investigator",
  culprit: "Hidden Culprit",
  suspect: "Key Suspect",
  witness: "Witness",
  participant: "Participant"
};
const ROLE_BADGES = {
  investigator: "bg-purple-500/20 text-purple-300",
  culprit: "bg-rose-500/20 text-rose-300",
  suspect: "bg-amber-500/20 text-amber-300",
  witness: "bg-emerald-500/20 text-emerald-300",
  participant: "bg-sky-500/20 text-sky-300"
};
const ROLE_GRADS = {
  investigator: "from-violet-600 to-purple-900",
  culprit: "from-fuchsia-700 to-rose-900",
  suspect: "from-amber-700 to-red-900",
  witness: "from-emerald-800 to-zinc-900",
  participant: "from-slate-700 to-zinc-900"
};
function ResultsPage() {
  const session = getParticipantSession();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!session?.groupId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let timer;
    const fetchResults = () => {
      participantService.getGameResults(session.groupId).then((data) => {
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
  }, [session?.groupId]);
  if (!session?.groupId) {
    return /* @__PURE__ */ jsx(Shell, { children: /* @__PURE__ */ jsxs("div", { className: "mt-16 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "No active game session" }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-4 inline-block text-primary text-sm", children: "Go home" })
    ] }) });
  }
  if (loading) {
    return /* @__PURE__ */ jsx(Shell, { children: /* @__PURE__ */ jsx("p", { className: "mt-16 text-center text-white/60 animate-pulse", children: "Loading results…" }) });
  }
  if (!results || !results.is_finished) {
    return /* @__PURE__ */ jsx(Shell, { children: /* @__PURE__ */ jsxs("div", { className: "mt-16 mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto h-14 w-14 rounded-full bg-purple-500/20 grid place-items-center animate-pulse", children: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-purple-300" }) }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-bold", children: "Waiting for the other players…" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/70", children: "The results will appear as soon as every player has submitted their final accusation or the session time runs out. This page refreshes automatically." })
    ] }) });
  }
  const players = [...results.winners ?? [], ...results.losers ?? []].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const winnerIds = new Set((results.winners ?? []).map((w) => w.session_id));
  const culprit = results.culprit ?? null;
  const handleExportCSV = () => {
    const headers = ["Rank", "Player", "Role", "Outcome", "Points"];
    const rows = players.map((p, i) => [i + 1, p.pseudonym, ROLE_LABELS[p.role_type] ?? p.role_type, winnerIds.has(p.session_id) ? "Winner" : "Loser", p.score ?? 0]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv"
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mystery-quest-results-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toastSuccess("Results exported as CSV");
  };
  const handleDownloadPdf = () => {
    if (!results.pdf_available || !session.participantId) {
      toastError("The results PDF is no longer available.");
      return;
    }
    window.open(participantService.getResultsPdfUrl(session.groupId, session.participantId), "_blank");
  };
  return /* @__PURE__ */ jsxs(Shell, { children: [
    results.is_incomplete && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-5 py-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(UserX, { className: "h-5 w-5 text-rose-300 shrink-0" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold text-rose-200", children: "Game Incomplete" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-rose-200/80", children: "The Investigator left the game, so the session ended early. All roles are revealed below." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 px-5 py-4 flex items-center justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-purple-200" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-wide", children: "Results & Roles Revealed" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        results.pdf_available && /* @__PURE__ */ jsxs("button", { onClick: handleDownloadPdf, className: "rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Download Results PDF" })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: handleExportCSV, className: "rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Export CSV" })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => window.print(), className: "rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 print:hidden", children: [
          /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Print" })
        ] })
      ] })
    ] }),
    results.pdf_available && results.pdf_expires_at && /* @__PURE__ */ jsx("p", { className: "mt-2 text-[11px] text-white/50", children: "The results PDF is available for 1 hour after the game ends, then it is permanently deleted along with all participant data." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black text-rose-300", children: results.is_incomplete ? "The Case Was Never Solved" : "The Truth is Out!" }),
      culprit && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-white/70 mt-1", children: "The Hidden Culprit was" }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 mt-2", children: [
          /* @__PURE__ */ jsx("div", { className: `h-12 w-12 rounded-full bg-gradient-to-br ${ROLE_GRADS.culprit} ring-2 ring-rose-400/40` }),
          /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
            /* @__PURE__ */ jsx("div", { className: "text-rose-300 text-2xl font-black", children: culprit.pseudonym }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-rose-400", children: typeof results.correct_guess_count === "number" && typeof results.total_guessers === "number" ? `${results.correct_guess_count} of ${results.total_guessers} players identified them correctly` : null })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 overflow-x-auto rounded-2xl border border-white/10", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "border-b border-white/10 bg-white/5", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Rank" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Player" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Role" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Outcome" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-right font-semibold text-white/70", children: "Points" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: players.map((p, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/5 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: i === 0 && !results.is_incomplete ? /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5 text-amber-300" }) : /* @__PURE__ */ jsx("span", { className: "h-5 w-5 grid place-items-center text-amber-300 font-bold", children: i + 1 }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: `h-8 w-8 rounded-full bg-gradient-to-br ${ROLE_GRADS[p.role_type] ?? "from-slate-700 to-zinc-900"}` }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: p.pseudonym })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-white/70", children: ROLE_LABELS[p.role_type] ?? p.role_type }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-medium ${ROLE_BADGES[p.role_type] ?? "bg-white/10 text-white/70"}`, children: results.is_incomplete ? "—" : winnerIds.has(p.session_id) ? "Winner" : "Loser" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right font-semibold text-amber-300", children: p.score ?? 0 })
        ] }, p.session_id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-white/5 border-t border-white/10 grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 mb-1", children: results.is_incomplete ? "Status" : "Winners" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-amber-300", children: results.is_incomplete ? "Incomplete" : `${(results.winners ?? []).length}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 mb-1", children: "Total Players" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: players.length })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-white/60 mb-1", children: "Total Points" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: players.reduce((sum, p) => sum + (p.score ?? 0), 0) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 text-center print:hidden", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "inline-block rounded-full bg-gradient-primary px-8 py-3 text-sm font-semibold shadow-glow", children: "Exit Game" }) })
  ] });
}
function Shell({
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0d0820] text-white p-4 md:p-6", children: [
    /* @__PURE__ */ jsx("header", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Logo, {}),
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Mystery Quest" })
    ] }) }),
    children
  ] });
}
export {
  ResultsPage as component
};
