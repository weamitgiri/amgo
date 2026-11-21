import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { KeyRound, Search, Copy, Check, Download } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { organizerService } from "@/api/services/organizer.service";
import { useOrganizerEventLive } from "@/hooks/useOrganizerEventLive";
import { formatJoinedAt } from "@/lib/format-datetime";
import { toastError, toastSuccess } from "@/lib/toast";

export const Route = createFileRoute("/login-codes")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Login Codes — Zoventro" }] }),
  component: LoginCodesPage,
});

const PAGE_SIZE = 5;
type FilterKey = "all" | "used" | "unused";

function LoginCodesPage() {
  const navigate = useNavigate();
  const { booking, organizer, eventStats } = useOrganizerEventLive();
  const bookingId = booking?.booking_id ?? null;
  // Once the event has ended, login codes are no longer shown (and are deleted on
  // retention) — same gate the dashboard uses to hide the code download.
  const isEventCompleted = (eventStats?.event_status?.is_completed ?? false) || booking?.is_completed === 1;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/login-codes" } });
    }
  }, [navigate]);

  const codesQuery = useQuery({
    queryKey: ["organizerLoginCodes", bookingId],
    queryFn: () => organizerService.getLoginCodes(bookingId as number),
    enabled: !!bookingId && !isEventCompleted,
    staleTime: 1000 * 10,
    // Near-real-time: a short poll so a code flips to "Joined" soon after an
    // employee enters it, even without a socket push on this page.
    refetchInterval: 1000 * 8,
  });

  const all = codesQuery.data?.codes ?? [];
  const usedCount = all.filter((c) => c.participant_name).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((c) => {
      if (filter === "used" && !c.participant_name) return false;
      if (filter === "unused" && c.participant_name) return false;
      if (!q) return true;
      return c.code.toLowerCase().includes(q) || (c.participant_name ?? "").toLowerCase().includes(q);
    });
  }, [all, search, filter]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
      toastSuccess("Code copied");
    } catch {
      toastError("Unable to copy code");
    }
  };

  const downloadExcel = async () => {
    if (!bookingId) return;
    setDownloading(true);
    try {
      await organizerService.downloadLoginCodes(bookingId);
      toastSuccess("Login codes downloaded");
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Unable to download login codes");
    } finally {
      setDownloading(false);
    }
  };

  const filterBtn = (key: FilterKey, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(key)}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        filter === key ? "bg-primary text-primary-foreground" : "border border-border text-foreground/70 hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );

  return (
    <DashboardShell
      crumb="Organizer Dashboard / Login Codes"
      userName={organizer?.name ?? "Organizer"}
      userEmail={organizer?.email ?? ""}
      onLogout={() => {
        apiClient.setToken(null);
        navigate({ to: "/login", search: { redirect: "/login-codes" } });
      }}
    >
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-4 w-4" />
              </span>
              Login Codes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share one code with each employee. They join with their name and a code.
              {all.length > 0 && (
                <span className="ml-1 font-medium text-foreground">
                  ({usedCount} / {all.length} used)
                </span>
              )}
            </p>
          </div>
          {!isEventCompleted && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code or name…"
                  className="rounded-full border border-border pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {filterBtn("all", "All")}
              {filterBtn("used", "Joined")}
              {filterBtn("unused", "Not used")}
              <button
                type="button"
                onClick={downloadExcel}
                disabled={!bookingId || all.length === 0 || downloading}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-white px-4 py-2 text-xs font-medium shadow-glow disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" /> {downloading ? "Downloading…" : "Excel"}
              </button>
            </div>
          )}
        </div>

        {isEventCompleted ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            The event has ended — login codes have been removed.
          </p>
        ) : !bookingId ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">No active session yet.</p>
        ) : codesQuery.isLoading ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">Loading login codes…</p>
        ) : codesQuery.isError ? (
          <p className="mt-8 text-center text-sm text-destructive">Unable to load login codes.</p>
        ) : pageItems.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {search || filter !== "all" ? "No codes match your search." : "No login codes yet."}
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border/60">
                  <th className="py-2.5 pr-3 w-10">#</th>
                  <th className="py-2.5 pr-3">Login Code</th>
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="py-2.5 pr-3">Joined By</th>
                  <th className="py-2.5 pr-3">Joined At</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row, i) => {
                  const used = !!row.participant_name;
                  return (
                    <tr key={row.code} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-3 text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-mono font-semibold tracking-widest">{row.code}</span>
                          <button
                            type="button"
                            onClick={() => copyCode(row.code)}
                            title="Copy code"
                            className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                          >
                            {copied === row.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            used ? "bg-emerald-100 text-emerald-700" : "bg-muted text-foreground/60"
                          }`}
                        >
                          {used ? "Joined" : "Not used"}
                        </span>
                      </td>
                      <td className="py-3 pr-3">{row.participant_name || "—"}</td>
                      <td className="py-3 pr-3 text-muted-foreground whitespace-nowrap">
                        {row.joined_at ? formatJoinedAt(row.joined_at) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isEventCompleted && (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length === 0
              ? "No codes"
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  currentPage * PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length} codes`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
        )}
      </section>
    </DashboardShell>
  );
}
