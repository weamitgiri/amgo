import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Trophy, AlertCircle, Download, Clock } from "lucide-react";
import { u as useOrganizerEventLive, D as DashboardShell } from "./DashboardShell-DnxArFqU.js";
import { i as isOrganizerAuthenticated, a as apiClient, E as ENV } from "./router-qdPwl0jo.js";
import { o as organizerService } from "./organizer.service-D9SFzC32.js";
import { t as toastError } from "./toast-B5Q8Bvxc.js";
import "./Flogo-BFeWNg6Z.js";
import "./socket-Bwou9MYK.js";
import "socket.io-client";
import "sonner";
import "./config-qISbZfHI.js";
function HrResultsPage() {
  const navigate = useNavigate();
  const {
    organizer
  } = useOrganizerEventLive();
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect: "/hr-results"
        }
      });
    }
  }, [navigate]);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["organizerResults"],
    queryFn: () => organizerService.getResults(),
    refetchInterval: 3e4
  });
  const results = data?.results ?? [];
  const downloadPdf = async (r) => {
    try {
      const token = apiClient.getToken();
      const res = await fetch(`${ENV.API_BASE_URL}/v1/results/${r.group_id}/pdf`, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
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
  return /* @__PURE__ */ jsx(DashboardShell, { crumb: "Organizer Dashboard / Results", userName: organizer?.name ?? "Organizer", userEmail: organizer?.email ?? "", onLogout: () => {
    apiClient.setToken(null);
    navigate({
      to: "/login",
      search: {
        redirect: "/hr-results"
      }
    });
  }, children: /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500", children: /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Results" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Download game result PDFs. Each PDF is available for 1 hour after the game ends, then it is permanently deleted along with all participant data." })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("p", { className: "mt-8 text-sm text-muted-foreground animate-pulse", children: "Loading results…" }) : results.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-8 w-8 mx-auto text-muted-foreground/50" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium", children: "No completed games yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Results appear here as soon as a group finishes its game." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "mt-6 overflow-x-auto rounded-2xl border border-border/60", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted/40 border-b border-border/60", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-semibold text-muted-foreground", children: "Group" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-semibold text-muted-foreground", children: "Activity" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-semibold text-muted-foreground", children: "Completed" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-semibold text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-right font-semibold text-muted-foreground", children: "Results PDF" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: results.map((r) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40 last:border-0 hover:bg-muted/20", children: [
        /* @__PURE__ */ jsx("td", { className: "px-5 py-4 font-medium", children: r.group_name }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-muted-foreground", children: r.activity_name }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-muted-foreground", children: r.completed_at ? new Date(r.completed_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short"
        }) : "—" }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: r.status === "incomplete" ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-xs font-semibold", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3" }),
          " Incomplete"
        ] }) : /* @__PURE__ */ jsx("span", { className: "rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold", children: "Completed" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-right", children: r.pdf_available ? /* @__PURE__ */ jsxs("button", { onClick: () => downloadPdf(r), className: "inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-4 py-1.5 text-xs font-semibold shadow-glow hover:opacity-90", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
          " Download PDF"
        ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
          " Expired (auto-deleted)"
        ] }) })
      ] }, r.group_id)) })
    ] }) })
  ] }) });
}
export {
  HrResultsPage as component
};
