import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Filter, Download, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { useOrganizerEventLive } from "@/hooks/useOrganizerEventLive";
import { formatJoinedAt } from "@/lib/format-datetime";
import { avatarTone } from "@/lib/avatar-tones";
import type { BookingParticipant } from "@/api/types/organizer";

export const Route = createFileRoute("/participants")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Participants — Zoventro" }] }),
  component: ParticipantsPage,
});

const PAGE_SIZE = 20;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ParticipantsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { organizer, eventStats, isLoading, isError } = useOrganizerEventLive();

  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/participants" } });
    }
  }, [navigate]);

  const allParticipants = eventStats?.participants ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allParticipants;
    return allParticipants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.group_name ?? "").toLowerCase().includes(q)
    );
  }, [allParticipants, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Group", "Joined At"],
      ...filtered.map((p) => [
        p.name,
        p.email,
        p.group_name ?? "",
        p.joined_at ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      crumb="Organizer Dashboard / Participants"
      userName={organizer?.name ?? "Organizer"}
      userEmail={organizer?.email ?? ""}
      onLogout={() => {
        apiClient.setToken(null);
        navigate({ to: "/login", search: { redirect: "/participants" } });
      }}
    >
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </span>
              Participants
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ensure all the participants have joined and groups are complete.
              {eventStats && (
                <span className="ml-1 font-medium text-foreground">
                  ({eventStats.event_progress.participants_joined} / {eventStats.event_progress.max_participants} joined)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search participants…"
                className="rounded-full border border-border pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
            >
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-white px-4 py-2 text-xs font-medium shadow-glow disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">Loading participants…</p>
        ) : isError ? (
          <p className="mt-8 text-center text-sm text-destructive">Unable to load participants.</p>
        ) : pageItems.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {search ? "No participants match your search." : "No verified participants yet."}
          </p>
        ) : (
          <div className="mt-6 max-h-[520px] overflow-y-auto divide-y divide-border/60 pr-1">
            {pageItems.map((p: BookingParticipant, index: number) => (
              <div key={p.id} className="flex items-center gap-4 py-3.5">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full text-xs font-semibold ${avatarTone(index)}`}
                >
                  {initials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{formatJoinedAt(p.joined_at)}</div>
                <span className="rounded-full bg-purple-100 text-primary text-xs px-2.5 py-0.5 font-medium whitespace-nowrap">
                  {p.group_name ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length === 0
              ? "No participants"
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} participants`}
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
      </section>
    </DashboardShell>
  );
}
