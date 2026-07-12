import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { Users, Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { u as useOrganizerEventLive, D as DashboardShell, c as formatTimeShort } from "./DashboardShell-DnxArFqU.js";
import { i as isOrganizerAuthenticated, a as apiClient } from "./router-qdPwl0jo.js";
import { M as MEMBER_AVATAR_COLORS } from "./avatar-tones-B0t4V5dV.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./organizer.service-D9SFzC32.js";
import "./config-qISbZfHI.js";
import "./socket-Bwou9MYK.js";
import "socket.io-client";
import "sonner";
const statusTone = (s) => s === "Complete" ? "bg-emerald-100 text-emerald-700" : s === "In Progress" ? "bg-orange-100 text-orange-700" : "bg-muted text-foreground/60";
function GroupsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const {
    organizer,
    eventStats,
    isLoading,
    isError
  } = useOrganizerEventLive();
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect: "/groups"
        }
      });
    }
  }, [navigate]);
  const allGroups = eventStats?.groups ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allGroups;
    return allGroups.filter((g) => g.name.toLowerCase().includes(q) || (g.team_lead ?? "").toLowerCase().includes(q) || g.status.toLowerCase().includes(q));
  }, [allGroups, search]);
  const exportCsv = () => {
    const rows = [["Group", "Team Lead", "Members", "Status", "Last Updated"], ...filtered.map((g) => [g.name, g.team_lead ?? "", `${g.member_count}/${g.capacity}`, g.status, g.last_updated ?? ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "groups.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const completeCount = filtered.filter((g) => g.status === "Complete").length;
  return /* @__PURE__ */ jsx(DashboardShell, { crumb: "Organizer Dashboard / Groups", userName: organizer?.name ?? "Organizer", userEmail: organizer?.email ?? "", onLogout: () => {
    apiClient.setToken(null);
    navigate({
      to: "/login",
      search: {
        redirect: "/groups"
      }
    });
  }, children: /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "inline-flex items-center gap-2 text-2xl font-bold tracking-tight", children: [
          /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }) }),
          "Groups"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
          "Manage all teams formed for the event. Track completion and members in real time.",
          eventStats && /* @__PURE__ */ jsxs("span", { className: "ml-1 font-medium text-foreground", children: [
            "(",
            completeCount,
            " / ",
            eventStats.event_progress.max_groups,
            " complete)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search groups…", className: "rounded-full border border-border pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-3.5 w-3.5" }),
          " Filter"
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: exportCsv, disabled: filtered.length === 0, className: "inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-white px-4 py-2 text-xs font-medium shadow-glow disabled:opacity-50", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
          " Export"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-sm text-muted-foreground", children: "Loading groups…" }) : isError ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-sm text-destructive", children: "Unable to load groups." }) : filtered.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-sm text-muted-foreground", children: search ? "No groups match your search." : "No groups formed yet. Groups appear when participants verify and join." }) : /* @__PURE__ */ jsx("div", { className: "mt-6 overflow-x-auto rounded-2xl border border-border max-h-[520px] overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground sticky top-0 z-10", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-semibold", children: "Group" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-semibold", children: "Team Lead" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-semibold", children: "Members" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-semibold", children: "Avatars" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-semibold", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-semibold", children: "Last Updated" }),
        /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-semibold text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: filtered.map((r) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/60 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-semibold", children: r.name }),
        /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: r.team_lead ?? "—" }),
        /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-muted-foreground", children: [
          r.member_count,
          " / ",
          r.capacity
        ] }),
        /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: /* @__PURE__ */ jsx("div", { className: "flex -space-x-1.5", children: r.members.length > 0 ? r.members.map((m, i) => /* @__PURE__ */ jsx("span", { title: m.name, className: `grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[9px] font-bold text-foreground/80 ${MEMBER_AVATAR_COLORS[i % MEMBER_AVATAR_COLORS.length]}`, children: m.initials }, m.id)) : MEMBER_AVATAR_COLORS.slice(0, 1).map((c, i) => /* @__PURE__ */ jsx("span", { className: `h-6 w-6 rounded-full border-2 border-white ${c}` }, i)) }) }),
        /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: /* @__PURE__ */ jsx("span", { className: `inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone(r.status)}`, children: r.status }) }),
        /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-muted-foreground whitespace-nowrap", children: formatTimeShort(r.last_updated) }),
        /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-right", children: /* @__PURE__ */ jsx("button", { type: "button", className: "grid h-8 w-8 place-items-center rounded-full hover:bg-muted ml-auto", "aria-label": `Actions for ${r.name}`, children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 flex items-center justify-between text-xs text-muted-foreground", children: /* @__PURE__ */ jsx("span", { children: filtered.length === 0 ? "No groups" : `Showing ${filtered.length} of ${eventStats?.event_progress.max_groups ?? filtered.length} allowed groups` }) })
  ] }) });
}
export {
  GroupsPage as component
};
