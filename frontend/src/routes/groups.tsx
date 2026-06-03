import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Filter, Download, MoreHorizontal, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { useOrganizerEventLive } from "@/hooks/useOrganizerEventLive";
import { formatTimeShort } from "@/lib/format-datetime";
import { MEMBER_AVATAR_COLORS } from "@/lib/avatar-tones";
import type { BookingGroup } from "@/api/types/organizer";

export const Route = createFileRoute("/groups")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Groups — Zoventro" }] }),
  component: GroupsPage,
});

const statusTone = (s: BookingGroup["status"]) =>
  s === "Complete"
    ? "bg-emerald-100 text-emerald-700"
    : s === "In Progress"
      ? "bg-orange-100 text-orange-700"
      : "bg-muted text-foreground/60";

function GroupsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { organizer, eventStats, isLoading, isError } = useOrganizerEventLive();

  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/groups" } });
    }
  }, [navigate]);

  const allGroups = eventStats?.groups ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allGroups;
    return allGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.team_lead ?? "").toLowerCase().includes(q) ||
        g.status.toLowerCase().includes(q)
    );
  }, [allGroups, search]);

  const exportCsv = () => {
    const rows = [
      ["Group", "Team Lead", "Members", "Status", "Last Updated"],
      ...filtered.map((g) => [
        g.name,
        g.team_lead ?? "",
        `${g.member_count}/${g.capacity}`,
        g.status,
        g.last_updated ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "groups.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const completeCount = filtered.filter((g) => g.status === "Complete").length;

  return (
    <DashboardShell
      crumb="Organizer Dashboard / Groups"
      userName={organizer?.name ?? "Organizer"}
      userEmail={organizer?.email ?? ""}
      onLogout={() => {
        apiClient.setToken(null);
        navigate({ to: "/login", search: { redirect: "/groups" } });
      }}
    >
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </span>
              Groups
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all teams formed for the event. Track completion and members in real time.
              {eventStats && (
                <span className="ml-1 font-medium text-foreground">
                  ({completeCount} / {eventStats.event_progress.max_groups} complete)
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
                placeholder="Search groups…"
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
          <p className="mt-8 text-center text-sm text-muted-foreground">Loading groups…</p>
        ) : isError ? (
          <p className="mt-8 text-center text-sm text-destructive">Unable to load groups.</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {search ? "No groups match your search." : "No groups formed yet. Groups appear when participants verify and join."}
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-semibold">Group</th>
                  <th className="py-3 px-4 font-semibold">Team Lead</th>
                  <th className="py-3 px-4 font-semibold">Members</th>
                  <th className="py-3 px-4 font-semibold">Avatars</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Last Updated</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold">{r.name}</td>
                    <td className="py-3 px-4">{r.team_lead ?? "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {r.member_count} / {r.capacity}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex -space-x-1.5">
                        {r.members.length > 0
                          ? r.members.map((m, i) => (
                              <span
                                key={m.id}
                                title={m.name}
                                className={`grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[9px] font-bold text-foreground/80 ${MEMBER_AVATAR_COLORS[i % MEMBER_AVATAR_COLORS.length]}`}
                              >
                                {m.initials}
                              </span>
                            ))
                          : MEMBER_AVATAR_COLORS.slice(0, 1).map((c, i) => (
                              <span key={i} className={`h-6 w-6 rounded-full border-2 border-white ${c}`} />
                            ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {formatTimeShort(r.last_updated)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted ml-auto"
                        aria-label={`Actions for ${r.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length === 0
              ? "No groups"
              : `Showing ${filtered.length} of ${eventStats?.event_progress.max_groups ?? filtered.length} allowed groups`}
          </span>
        </div>
      </section>
    </DashboardShell>
  );
}
