/**
 * Organizer Results tab — lists every completed/incomplete game across the
 * organizer's bookings with the downloadable results PDF. Per the FSD, the PDF
 * stays available for exactly 1 hour after a game ends, after which it (and all
 * participant data) is permanently deleted.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Trophy, Download, Clock, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { organizerService } from "@/api/services/organizer.service";
import { useOrganizerEventLive } from "@/hooks/useOrganizerEventLive";
import { toastError } from "@/lib/toast";
import { ENV } from "@/config/environment";
import type { OrganizerGameResult } from "@/api/types/organizer";

export const Route = createFileRoute("/hr-results")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Results — Zoventro" }] }),
  component: HrResultsPage,
});

function HrResultsPage() {
  const navigate = useNavigate();
  const { organizer } = useOrganizerEventLive();

  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/hr-results" } });
    }
  }, [navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["organizerResults"],
    queryFn: () => organizerService.getResults(),
    refetchInterval: 30_000,
  });

  const results = data?.results ?? [];

  const downloadPdf = async (r: OrganizerGameResult) => {
    try {
      const token = apiClient.getToken();
      const res = await fetch(`${ENV.API_BASE_URL}/v1/results/${r.group_id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("The results PDF is no longer available.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mystery-quest-results-${r.group_name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Download failed.");
    }
  };

  return (
    <DashboardShell
      crumb="Organizer Dashboard / Results"
      userName={organizer?.name ?? "Organizer"}
      userEmail={organizer?.email ?? ""}
      onLogout={() => {
        apiClient.setToken(null);
        navigate({ to: "/login", search: { redirect: "/hr-results" } });
      }}
    >
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Results</h1>
            <p className="text-sm text-muted-foreground">
              Download game result PDFs. Each PDF is available for 1 hour after the game ends,
              then it is permanently deleted along with all participant data.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground animate-pulse">Loading results…</p>
        ) : results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
            <Trophy className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No completed games yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Results appear here as soon as a group finishes its game.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border/60">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Group</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Activity</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Completed</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Results PDF</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.group_id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-4 font-medium">{r.group_name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.activity_name}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {r.completed_at ? new Date(r.completed_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {r.status === "incomplete" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-xs font-semibold">
                          <AlertCircle className="h-3 w-3" /> Incomplete
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold">
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.pdf_available ? (
                        <button
                          onClick={() => downloadPdf(r)}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-4 py-1.5 text-xs font-semibold shadow-glow hover:opacity-90"
                        >
                          <Download className="h-3.5 w-3.5" /> Download PDF
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> Expired (auto-deleted)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
