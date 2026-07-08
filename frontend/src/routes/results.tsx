/**
 * Results page displaying the real game outcome for the participant's group:
 * culprit reveal, winner/loser rankings, and the 1-hour results PDF download.
 * Polls until every non-culprit role has submitted their accusation, and shows
 * a distinct "Game Incomplete" state when the Investigator left mid-game.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Trophy, Download, Printer, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { participantService } from "@/api/services/participant.service";
import type { GameResultsResponse } from "@/api/types/participant";
import { getParticipantSession } from "@/lib/participant-session";
import { toastError, toastSuccess } from "@/lib/toast";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Mystery Quest — Results" }] }),
  component: ResultsPage,
});

type ResultPlayer = { session_id: number; pseudonym: string; role_type: string; score: number };

const ROLE_LABELS: Record<string, string> = {
  investigator: "Investigator",
  culprit: "Hidden Culprit",
  suspect: "Key Suspect",
  witness: "Witness",
  participant: "Participant",
};

const ROLE_BADGES: Record<string, string> = {
  investigator: "bg-purple-500/20 text-purple-300",
  culprit: "bg-rose-500/20 text-rose-300",
  suspect: "bg-amber-500/20 text-amber-300",
  witness: "bg-emerald-500/20 text-emerald-300",
  participant: "bg-sky-500/20 text-sky-300",
};

const ROLE_GRADS: Record<string, string> = {
  investigator: "from-violet-600 to-purple-900",
  culprit: "from-fuchsia-700 to-rose-900",
  suspect: "from-amber-700 to-red-900",
  witness: "from-emerald-800 to-zinc-900",
  participant: "from-slate-700 to-zinc-900",
};

function ResultsPage() {
  const session = getParticipantSession();
  const [results, setResults] = useState<GameResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.groupId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let timer: number | undefined;

    const fetchResults = () => {
      participantService
        .getGameResults(session.groupId)
        .then((data) => {
          if (cancelled) return;
          setResults(data);
          if (!data.is_finished) {
            timer = window.setTimeout(fetchResults, 5000);
          }
        })
        .catch(() => {
          if (!cancelled) timer = window.setTimeout(fetchResults, 5000);
        })
        .finally(() => {
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
    return (
      <Shell>
        <div className="mt-16 text-center">
          <h1 className="text-xl font-bold">No active game session</h1>
          <Link to="/" className="mt-4 inline-block text-primary text-sm">Go home</Link>
        </div>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <p className="mt-16 text-center text-white/60 animate-pulse">Loading results…</p>
      </Shell>
    );
  }

  if (!results || !results.is_finished) {
    return (
      <Shell>
        <div className="mt-16 mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-purple-500/20 grid place-items-center animate-pulse">
            <FileText className="h-6 w-6 text-purple-300" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Waiting for the other players…</h1>
          <p className="mt-2 text-sm text-white/70">
            The results will appear as soon as every player has submitted their final accusation
            or the session time runs out. This page refreshes automatically.
          </p>
        </div>
      </Shell>
    );
  }

  const players: ResultPlayer[] = [...(results.winners ?? []), ...(results.losers ?? [])].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );
  const winnerIds = new Set((results.winners ?? []).map((w) => w.session_id));
  const culprit = results.culprit ?? null;

  const handleExportCSV = () => {
    const headers = ["Rank", "Player", "Role", "Outcome", "Points"];
    const rows = players.map((p, i) => [
      i + 1,
      p.pseudonym,
      ROLE_LABELS[p.role_type] ?? p.role_type,
      winnerIds.has(p.session_id) ? "Winner" : "Loser",
      p.score ?? 0,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mystery-quest-results-${new Date().toISOString().split("T")[0]}.csv`;
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

  return (
    <Shell>
      {results.is_incomplete && (
        <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-5 py-4 flex items-center gap-3">
          <UserX className="h-5 w-5 text-rose-300 shrink-0" />
          <div>
            <div className="font-bold text-rose-200">Game Incomplete</div>
            <p className="text-xs text-rose-200/80">
              The Investigator left the game, so the session ended early. All roles are revealed below.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center"><FileText className="h-5 w-5 text-purple-200" /></div>
          <h1 className="text-xl font-bold tracking-wide">Results & Roles Revealed</h1>
        </div>
        <div className="flex items-center gap-2">
          {results.pdf_available && (
            <button
              onClick={handleDownloadPdf}
              className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Results PDF</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 print:hidden"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {results.pdf_available && results.pdf_expires_at && (
        <p className="mt-2 text-[11px] text-white/50">
          The results PDF is available for 1 hour after the game ends, then it is permanently deleted
          along with all participant data.
        </p>
      )}

      {/* Culprit reveal */}
      <div className="mt-8 text-center">
        <h2 className="text-3xl font-black text-rose-300">
          {results.is_incomplete ? "The Case Was Never Solved" : "The Truth is Out!"}
        </h2>
        {culprit && (
          <>
            <p className="text-xs text-white/70 mt-1">The Hidden Culprit was</p>
            <div className="inline-flex items-center gap-3 mt-2">
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${ROLE_GRADS.culprit} ring-2 ring-rose-400/40`} />
              <div className="text-left">
                <div className="text-rose-300 text-2xl font-black">{culprit.pseudonym}</div>
                <div className="text-[11px] text-rose-400">
                  {typeof results.correct_guess_count === "number" && typeof results.total_guessers === "number"
                    ? `${results.correct_guess_count} of ${results.total_guessers} players identified them correctly`
                    : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rankings */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-white/70">Rank</th>
              <th className="px-6 py-4 text-left font-semibold text-white/70">Player</th>
              <th className="px-6 py-4 text-left font-semibold text-white/70">Role</th>
              <th className="px-6 py-4 text-left font-semibold text-white/70">Outcome</th>
              <th className="px-6 py-4 text-right font-semibold text-white/70">Points</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.session_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  {i === 0 && !results.is_incomplete ? (
                    <Trophy className="h-5 w-5 text-amber-300" />
                  ) : (
                    <span className="h-5 w-5 grid place-items-center text-amber-300 font-bold">{i + 1}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${ROLE_GRADS[p.role_type] ?? "from-slate-700 to-zinc-900"}`} />
                    <span className="font-medium">{p.pseudonym}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/70">{ROLE_LABELS[p.role_type] ?? p.role_type}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ROLE_BADGES[p.role_type] ?? "bg-white/10 text-white/70"}`}>
                    {results.is_incomplete ? "—" : winnerIds.has(p.session_id) ? "Winner" : "Loser"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-amber-300">{p.score ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-white/5 border-t border-white/10 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-white/60 mb-1">{results.is_incomplete ? "Status" : "Winners"}</p>
            <p className="text-lg font-bold text-amber-300">
              {results.is_incomplete ? "Incomplete" : `${(results.winners ?? []).length}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Total Players</p>
            <p className="text-lg font-bold">{players.length}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Total Points</p>
            <p className="text-lg font-bold">{players.reduce((sum, p) => sum + (p.score ?? 0), 0)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center print:hidden">
        <Link to="/" className="inline-block rounded-full bg-gradient-primary px-8 py-3 text-sm font-semibold shadow-glow">
          Exit Game
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0820] text-white p-4 md:p-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3"><Logo /><span className="font-semibold">Mystery Quest</span></div>
      </header>
      {children}
    </div>
  );
}
