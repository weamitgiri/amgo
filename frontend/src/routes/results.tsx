/**
 * Results page displaying game outcomes, role revelations, and player rankings.
 * Supports both story view (narrative with insights) and table view (detailed rankings).
 * Includes export to CSV and print functionality for results documentation.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Trophy, Star, Download, Printer } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Crumbs } from "@/components/Crumbs";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/lib/toast";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Mystery Quest — Results" }] }),
  component: ResultsPage,
});

const ROLES = [
  { name: "Mark32 (You)", role: "INVESTIGATOR", color: "text-purple-300", grad: "from-violet-600 to-purple-900", pts: 260, badge: "Investigator", badgeBg: "bg-purple-500/20 text-purple-300" },
  { name: "James45", role: "Son-in-law", color: "text-emerald-300", grad: "from-slate-700 to-zinc-900", pts: 210, badge: "Witness", badgeBg: "bg-emerald-500/20 text-emerald-300" },
  { name: "Fred36", role: "Daughter-in-law", color: "text-rose-300", grad: "from-fuchsia-700 to-rose-900", pts: 150, badge: "Hidden Culprit", badgeBg: "bg-rose-500/20 text-rose-300" },
  { name: "Oni86", role: "Servant", color: "text-amber-300", grad: "from-emerald-800 to-zinc-900", pts: 100, badge: "Key Suspect", badgeBg: "bg-amber-500/20 text-amber-300" },
  { name: "John32", role: "Head Farmer", color: "text-sky-300", grad: "from-amber-700 to-red-900", pts: 80, badge: "Participant", badgeBg: "bg-sky-500/20 text-sky-300" },
];

function ResultsPage() {
  const [viewMode, setViewMode] = useState<"story" | "table">("table");

  const handleExportCSV = () => {
    const headers = ["Rank", "Player", "Role", "Badge", "Points"];
    const rows = ROLES.map((r, i) => [i + 1, r.name, r.role, r.badge, r.pts]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mystery-quest-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toastSuccess("Results exported as CSV");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0d0820] text-white p-4 md:p-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3"><Logo /><span className="font-semibold">Mystery Quest</span></div>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm">Game Time Remaining <span className="ml-2 font-bold tabular-nums">24:58</span></div>
          <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold">SK</div><span className="text-sm">Sneha Kapoor</span></div>
        </div>
      </header>

      <div className="mt-4">
        <Crumbs
          tone="dark"
          items={[
            { label: "Home", to: "/" },
            { label: "Lobby", to: "/lobby" },
            { label: "Game", to: "/game" },
            { label: "Results" },
          ]}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center"><FileText className="h-5 w-5 text-purple-200" /></div>
          <h1 className="text-xl font-bold tracking-wide">Results & Role Revealed</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 print:hidden"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setViewMode("story")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "story"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-white/70 hover:text-white"
          }`}
        >
          Story View
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "table"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-white/70 hover:text-white"
          }`}
        >
          Table View
        </button>
      </div>

      {viewMode === "story" ? (
        <StoryView />
      ) : (
        <TableView />
      )}
    </div>
  );
}

function StoryView() {
  return (
    <main className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      {/* Truth */}
      <div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-rose-300">The Truth is Out!</h2>
          <p className="text-xs text-white/70 mt-1">The hidden Culprit was</p>
          <div className="inline-flex items-center gap-3 mt-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-700 to-rose-900 ring-2 ring-rose-400/40" />
            <div>
              <div className="text-rose-300 text-2xl font-black">Priya Malhotra</div>
              <div className="text-[11px] text-rose-400">(Daughter In Law)!</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-rose-300 font-black text-lg">The Full Story</h3>
            <div className="bg-amber-100/95 text-zinc-900 text-[11px] px-3 py-1 rounded-sm rotate-[-1deg]">
              Behind every <span className="text-rose-700 font-bold">mystery</span> lies a human <span className="text-rose-700 font-bold">motive</span>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <Chapter title="The Will Change" body="Three days before the party, Priya accidentally discovered a draft document in Raghav's study while looking for a pen. The document was a revised will, Raghav planned to donate 40% of the entire Malhotra estate to a farmer rehabilitation trust as a compromise to end Kiran Singh's protests. This would reduce her and Vikram's inheritance by crores." />
            <Chapter title="Her Personal Secret" body="Priya had taken a personal loan of ₹1.8 crore from a private lender 8 months ago, without telling Vikram. She had invested it in a side business that failed completely. She was counting on Vikram's inheritance to quietly repay this without Vikram ever finding out. The will change would make repayment impossible and expose her secret entirely." />
            <Chapter title="The Phone Call" body="Was the Trigger When Raghav called Vikram at 11:20 PM, Priya was standing nearby and overheard Raghav telling Vikram about the will change. Raghav was planning to announce it publicly at the party itself, before the night ended. She had minutes to act before everything collapsed." />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-center text-sm font-bold mb-3">Roles Revealed</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ROLES.map((r) => (
              <div key={r.name} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className={`mx-auto h-10 w-10 rounded-full bg-gradient-to-br ${r.grad}`} />
                <div className="mt-2 text-xs font-semibold">{r.name}</div>
                <div className="text-[10px] text-white/60">{r.role}</div>
                <div className={`mt-1 inline-block text-[9px] px-2 py-0.5 rounded-full ${r.badgeBg}`}>{r.badge.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fun Over */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 h-fit">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎉</div>
          <div>
            <h3 className="text-2xl font-black">Fun Over</h3>
            <p className="text-xs text-white/70">Here are the final results!</p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <div className="text-xs text-white/70">Rate Your Experience</div>
          <div className="mt-2 flex items-center justify-center gap-1">
            {[1,2,3,4].map(i => <Star key={i} className="h-6 w-6 text-amber-300 fill-amber-300" />)}
            <Star className="h-6 w-6 text-white/30" />
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {ROLES.map((r, i) => (
            <li key={r.name} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <div className="w-6 text-center font-bold">{i === 0 ? <Trophy className="h-5 w-5 text-amber-300" /> : i + 1}</div>
              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${r.grad}`} />
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.name}</div>
                <div className={`text-[11px] ${r.color}`}>{r.badge}</div>
              </div>
              <div className="text-amber-300 font-bold text-sm">{r.pts} pts</div>
            </li>
          ))}
        </ul>

        <Link to="/lobby" className="mt-5 block text-center w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow">Exit to Lobby</Link>
      </div>
    </main>
  );
}

function TableView() {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-white/70">Rank</th>
            <th className="px-6 py-4 text-left font-semibold text-white/70">Player</th>
            <th className="px-6 py-4 text-left font-semibold text-white/70">Role</th>
            <th className="px-6 py-4 text-left font-semibold text-white/70">Badge</th>
            <th className="px-6 py-4 text-right font-semibold text-white/70">Points</th>
          </tr>
        </thead>
        <tbody>
          {ROLES.map((r, i) => (
            <tr key={r.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {i === 0 ? (
                    <Trophy className="h-5 w-5 text-amber-300" />
                  ) : (
                    <span className="h-5 w-5 grid place-items-center text-amber-300 font-bold">{i + 1}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${r.grad}`} />
                  <span className="font-medium">{r.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-white/70">{r.role}</td>
              <td className="px-6 py-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.badgeBg}`}>
                  {r.badge}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-semibold text-amber-300">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-white/60 mb-1">Winner</p>
          <p className="text-lg font-bold text-amber-300">{ROLES[0].name}</p>
        </div>
        <div>
          <p className="text-xs text-white/60 mb-1">Total Players</p>
          <p className="text-lg font-bold">{ROLES.length}</p>
        </div>
        <div>
          <p className="text-xs text-white/60 mb-1">Total Points</p>
          <p className="text-lg font-bold">{ROLES.reduce((sum, r) => sum + r.pts, 0)}</p>
        </div>
      </div>
    </div>
  );
}

function Chapter({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-14 w-14 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shrink-0" />
      <div>
        <div className="text-sm font-bold">{title}</div>
        <p className="text-xs text-white/75 mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
