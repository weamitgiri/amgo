import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { Users, Search, Filter, Download } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { u as useOrganizerEventLive, D as DashboardShell, f as formatJoinedAt } from "./DashboardShell-DnxArFqU.js";
import { i as isOrganizerAuthenticated, a as apiClient } from "./router-qdPwl0jo.js";
import { a as avatarTone } from "./avatar-tones-B0t4V5dV.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./organizer.service-D9SFzC32.js";
import "./config-qISbZfHI.js";
import "./socket-Bwou9MYK.js";
import "socket.io-client";
import "sonner";
const PAGE_SIZE = 20;
function initials(name) {
  return name.trim().split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}
function ParticipantsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
          redirect: "/participants"
        }
      });
    }
  }, [navigate]);
  const allParticipants = eventStats?.participants ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allParticipants;
    return allParticipants.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.group_name ?? "").toLowerCase().includes(q));
  }, [allParticipants, search]);
  useEffect(() => {
    setPage(1);
  }, [search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const exportCsv = () => {
    const rows = [["Name", "Email", "Group", "Joined At"], ...filtered.map((p) => [p.name, p.email, p.group_name ?? "", p.joined_at ?? ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsx(DashboardShell, { crumb: "Organizer Dashboard / Participants", userName: organizer?.name ?? "Organizer", userEmail: organizer?.email ?? "", onLogout: () => {
    apiClient.setToken(null);
    navigate({
      to: "/login",
      search: {
        redirect: "/participants"
      }
    });
  }, children: /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "inline-flex items-center gap-2 text-2xl font-bold tracking-tight", children: [
          /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }) }),
          "Participants"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
          "Ensure all the participants have joined and groups are complete.",
          eventStats && /* @__PURE__ */ jsxs("span", { className: "ml-1 font-medium text-foreground", children: [
            "(",
            eventStats.event_progress.participants_joined,
            " / ",
            eventStats.event_progress.max_participants,
            " joined)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search participants…", className: "rounded-full border border-border pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" })
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
    isLoading ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-sm text-muted-foreground", children: "Loading participants…" }) : isError ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-sm text-destructive", children: "Unable to load participants." }) : pageItems.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-sm text-muted-foreground", children: search ? "No participants match your search." : "No verified participants yet." }) : /* @__PURE__ */ jsx("div", { className: "mt-6 max-h-[520px] overflow-y-auto divide-y divide-border/60 pr-1", children: pageItems.map((p, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 py-3.5", children: [
      /* @__PURE__ */ jsx("div", { className: `grid h-10 w-10 place-items-center rounded-full text-xs font-semibold ${avatarTone(index)}`, children: initials(p.name) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium", children: p.name }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground truncate", children: p.email })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground whitespace-nowrap", children: formatJoinedAt(p.joined_at) }),
      /* @__PURE__ */ jsx("span", { className: "rounded-full bg-purple-100 text-primary text-xs px-2.5 py-0.5 font-medium whitespace-nowrap", children: p.group_name ?? "—" })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: filtered.length === 0 ? "No participants" : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} participants` }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", disabled: currentPage <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), className: "rounded-md border border-border px-3 py-1.5 disabled:opacity-40", children: "Previous" }),
        /* @__PURE__ */ jsx("button", { type: "button", disabled: currentPage >= totalPages, onClick: () => setPage((p) => Math.min(totalPages, p + 1)), className: "rounded-md border border-border px-3 py-1.5 disabled:opacity-40", children: "Next" })
      ] })
    ] })
  ] }) });
}
export {
  ParticipantsPage as component
};
