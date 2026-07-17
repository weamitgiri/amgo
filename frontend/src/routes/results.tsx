/**
 * Results page displaying the real game outcome for the participant's group:
 * culprit reveal with the full story, final leaderboard with ratings, the
 * "Roles Revealed" cards, and the 1-hour results PDF download.
 * Polls until every non-culprit role has submitted their accusation, and shows
 * a distinct "Game Incomplete" state when the Investigator left mid-game.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Trophy, Download, Printer, UserX, Star, Check, X, Ghost } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { participantService } from "@/api/services/participant.service";
import type { GameResultsResponse, ResultPlayer, ResultPlayerStatus } from "@/api/types/participant";
import { getParticipantSession } from "@/lib/participant-session";
import { resolveMediaUrl } from "@/utils/media";
import { toastError, toastSuccess } from "@/lib/toast";
import mystery from "@/assets/mystery.jpg";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Mystery Quest — Results" }] }),
  component: ResultsPage,
});

const ROLE_LABELS: Record<string, string> = {
  investigator: "Investigator",
  culprit: "Hidden Culprit",
  suspect: "Key Suspect",
  witness: "Witness",
  participant: "Participant",
};

const ROLE_TEXT: Record<string, string> = {
  investigator: "text-purple-300",
  culprit: "text-rose-400",
  suspect: "text-amber-300",
  witness: "text-emerald-400",
  participant: "text-sky-400",
};

const ROLE_BADGES: Record<string, string> = {
  investigator: "bg-purple-500/15 text-purple-300 border-purple-400/40",
  culprit: "bg-rose-500/15 text-rose-300 border-rose-400/40",
  suspect: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  witness: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  participant: "bg-sky-500/15 text-sky-300 border-sky-400/40",
};

const ROLE_GRADS: Record<string, string> = {
  investigator: "from-violet-600 to-purple-900",
  culprit: "from-fuchsia-700 to-rose-900",
  suspect: "from-amber-700 to-red-900",
  witness: "from-emerald-800 to-zinc-900",
  participant: "from-slate-700 to-zinc-900",
};

/** Spec §4 — the four verdict display states on the results screen. */
const STATUS_META: Record<
  ResultPlayerStatus,
  { label: string; className: string; Icon: typeof Trophy }
> = {
  winner: { label: "Winner", className: "bg-amber-400/15 text-amber-300 border-amber-400/40", Icon: Trophy },
  correct: {
    label: "Identified the killer",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
    Icon: Check,
  },
  loser: { label: "Wrong guess", className: "bg-rose-500/15 text-rose-300 border-rose-400/40", Icon: X },
  killer_wins: {
    label: "The killer escaped!",
    className: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/40",
    Icon: Ghost,
  },
};

function StatusBadge({ status, roleType }: { status?: ResultPlayerStatus; roleType: string }) {
  if (!status) return null;
  // A caught culprit's "loser" reads better as "Caught!" than "Wrong guess".
  const meta =
    status === "loser" && roleType === "culprit"
      ? { ...STATUS_META.loser, label: "Caught!" }
      : STATUS_META[status];
  if (!meta) return null;
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${meta.className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

/** "Priya Malhotra (Daughter-in-law)" → { displayName, title } */
function splitCharacterName(rawName: string): { displayName: string; title: string | null } {
  const match = rawName.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) return { displayName: match[1].trim(), title: match[2].trim() };
  return { displayName: rawName.trim(), title: null };
}

function PlayerAvatar({ player, className = "h-9 w-9" }: { player: ResultPlayer; className?: string }) {
  const image = resolveMediaUrl(player.role_image ?? null);
  return (
    <div className={`${className} rounded-full overflow-hidden shrink-0 border border-white/10`}>
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover object-top" />
      ) : (
        <div
          className={`h-full w-full bg-gradient-to-br ${ROLE_GRADS[player.role_type] ?? "from-slate-700 to-zinc-900"} grid place-items-center text-[10px] font-bold text-white`}
        >
          {player.pseudonym.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function ResultsPage() {
  const session = getParticipantSession();
  const [results, setResults] = useState<GameResultsResponse | null>(null);
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
    let timer: number | undefined;

    const fetchResults = () => {
      participantService
        .getGameResults(session.groupId, session.participantId)
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
  }, [session?.groupId, session?.participantId]);

  const players: ResultPlayer[] = useMemo(() => {
    const list = results?.players?.length
      ? results.players
      : [...(results?.winners ?? []), ...(results?.losers ?? [])];
    return [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [results]);

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
      <Shell name={session.name}>
        <p className="mt-16 text-center text-white/60 animate-pulse">Loading results…</p>
      </Shell>
    );
  }

  if (!results || !results.is_finished) {
    return (
      <Shell name={session.name}>
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

  const statusLabel = (p: ResultPlayer) =>
    p.status === "loser" && p.role_type === "culprit"
      ? "Caught!"
      : p.status
        ? STATUS_META[p.status]?.label ?? p.status
        : "—";
  const culprit = results.culprit ?? null;
  const culpritName = culprit?.character_name ? splitCharacterName(culprit.character_name) : null;
  const culpritImage = resolveMediaUrl(culprit?.role_image ?? null);
  const fullStory = results.full_story ?? [];
  const rolesRevealed = [...players].sort((a, b) => Number(b.is_you ?? false) - Number(a.is_you ?? false));

  const handleRate = (stars: number) => {
    setRating(stars);
    sessionStorage.setItem(`results_rating_${session.groupId}`, String(stars));
    toastSuccess("Thanks for rating your experience!");
  };

  const handleExportCSV = () => {
    const headers = ["Rank", "Player", "Role", "Outcome", "Points"];
    const rows = players.map((p, i) => [
      i + 1,
      p.pseudonym,
      ROLE_LABELS[p.role_type] ?? p.role_type,
      statusLabel(p),
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
    <Shell name={session.name}>
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

      {/* Banner */}
      <div className="mt-4 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-[#241243] to-[#170d31] px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-purple-500/25 border border-purple-400/30 grid place-items-center">
            <FileText className="h-5 w-5 text-purple-200" />
          </div>
          <h1 className="text-xl font-bold tracking-wide">Results & Role Revealed</h1>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {results.pdf_available && (
            <button
              onClick={handleDownloadPdf}
              className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Results PDF</span>
            </button>
          )}
         {/*  <button
            onClick={handleExportCSV}
            className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2"
          >
           <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>*/}
          {/*<button
            onClick={() => window.print()}
            className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>*/}
        </div>
      </div>

      {results.pdf_available && results.pdf_expires_at && (
        <p className="mt-2 text-[11px] text-white/50">
          The results PDF is available for 1 hour after the game ends, then it is permanently deleted
          along with all participant data.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr] items-start">
        {/* Left column: culprit reveal + full story */}
        <div>
          <div className="flex items-center justify-center gap-8 py-6 flex-wrap">
            <div className="text-center sm:text-right">
              <h2 className="text-4xl font-black text-amber-100">
                {results.is_incomplete
                  ? "The Case Was Never Solved"
                  : results.killer_wins
                    ? "The Killer Escaped!"
                    : "The Truth is Out!"}
              </h2>
              {results.killer_wins && !results.is_incomplete && (
                <p className="mt-2 text-sm text-fuchsia-300 font-semibold">
                  Nobody identified the Hidden Culprit — the killer wins this round.
                </p>
              )}
              {culprit && (
                <>
                  <p className="text-sm text-white/75 mt-2">The hidden Culprit was</p>
                  <div className="text-rose-400 text-4xl font-bold mt-1">
                    {culpritName?.displayName ?? culprit.pseudonym}
                  </div>
                  {culpritName?.title && (
                    <div className="text-rose-300 text-lg mt-1">({culpritName.title})!</div>
                  )}
                  {typeof results.correct_guess_count === "number" && typeof results.total_guessers === "number" && (
                    <div className="text-[11px] text-white/50 mt-2">
                      {results.correct_guess_count} of {results.total_guessers} players identified them correctly
                    </div>
                  )}
                </>
              )}
            </div>
            {culprit && (
              <div className="relative">
                <div
                  className="absolute -top-4 -right-5 h-16 w-16 opacity-60"
                  style={{
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1.5px, transparent 1.5px)",
                    backgroundSize: "10px 10px",
                  }}
                />
                <div className="relative h-32 w-32 rounded-full overflow-hidden ring-2 ring-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.35)]">
                  {culpritImage ? (
                    <img src={culpritImage} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${ROLE_GRADS.culprit}`} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* The Full Story */}
          {fullStory.length > 0 && (
            <div className="rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#231240] to-[#160d2c] p-6 md:p-7">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-2xl font-bold text-pink-400">The Full Story</h3>
                {results.tagline && (
                  <div className="rotate-[-1deg] bg-amber-100/95 text-zinc-900 text-xs font-bold px-4 py-2 rounded-sm shadow-elevated">
                    {results.tagline}
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-6">
                {fullStory.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-24 h-20 md:w-28 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={resolveMediaUrl(item.image) ?? mystery}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white">{item.title}</div>
                      {item.text && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">{item.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: final results card */}
        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#231240] to-[#160d2c] p-6 md:p-7">
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl" aria-hidden>🎉</span>
            <div className="text-center">
              <div className="text-3xl font-black text-amber-300">Fun Over</div>
              <div className="text-sm text-white/80 mt-1">Here are the final results!</div>
            </div>
          </div>

          <div className="mt-6 text-center print:hidden">
            <div className="text-lg font-bold text-amber-300">Rate Your Experience</div>
            <div className="mt-2 flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => handleRate(star)} aria-label={`Rate ${star} stars`}>
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= rating ? "text-amber-400 fill-amber-400" : "text-white/25 fill-white/25"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {players.map((p, i) => (
              <div
                key={p.session_id}
                className="flex items-center gap-3 py-3.5 border-b border-white/10 last:border-b-0"
              >
                <div className="w-8 grid place-items-center shrink-0">
                  {(p.status === "winner" || p.status === "killer_wins") && !results.is_incomplete ? (
                    <Trophy className="h-6 w-6 text-amber-400" />
                  ) : (
                    <span className="text-xl font-bold text-white">{i + 1}</span>
                  )}
                </div>
                <PlayerAvatar player={p} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">
                    {p.pseudonym}
                    {p.is_you && <span className="text-white/60 font-normal"> (You)</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className={`text-xs ${ROLE_TEXT[p.role_type] ?? "text-white/70"}`}>
                      {ROLE_LABELS[p.role_type] ?? p.role_type}
                    </span>
                    {!results.is_incomplete && <StatusBadge status={p.status} roleType={p.role_type} />}
                  </div>
                </div>
                <span className="w-16 text-right font-semibold text-amber-300 whitespace-nowrap">
                  {p.score ?? 0} pts
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/"
            className="mt-6 block text-center w-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] py-3.5 text-sm font-bold text-white shadow-glow hover:opacity-90 transition-opacity print:hidden"
          >
            Exit to Lobby
          </Link>
        </div>
      </div>

      {/* Roles Revealed */}
      {rolesRevealed.length > 0 && (
        <div className="mt-10 pb-6">
          <h3 className="text-center text-lg font-bold text-white">Roles Revealed</h3>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {rolesRevealed.map((p) => {
              const character = p.character_name ? splitCharacterName(p.character_name) : null;
              return (
                <div
                  key={p.session_id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 min-w-[210px] ${
                    p.is_you ? "border-purple-400/40 bg-purple-500/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <PlayerAvatar player={p} className="h-12 w-12" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {p.pseudonym}
                      {p.is_you && <span className="text-white/60 font-normal"> (You)</span>}
                    </div>
                    {character?.title && (
                      <div className="text-xs text-white/70 truncate">{character.title}</div>
                    )}
                    <span
                      className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        ROLE_BADGES[p.role_type] ?? "bg-white/10 text-white/70 border-white/20"
                      }`}
                    >
                      {ROLE_LABELS[p.role_type] ?? p.role_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children, name }: { children: React.ReactNode; name?: string }) {
  return (
    <div className="min-h-screen bg-[#0d0820] text-white p-4 md:p-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3"><Logo /><span className="font-semibold">Mystery Quest</span></div>
        {name && (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold">
              {(name[0] ?? "P").toUpperCase()}
            </div>
            <span className="text-sm">{name}</span>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
