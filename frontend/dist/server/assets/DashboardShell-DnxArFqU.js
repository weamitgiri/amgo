import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, LayoutGrid, Users, Layers, Trophy, Settings, ChevronRight, ChevronLeft, LayoutDashboard, User, ChevronDown } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { F as Flogo } from "./Flogo-BFeWNg6Z.js";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { o as organizerService } from "./organizer.service-D9SFzC32.js";
import { g as getSocket } from "./socket-Bwou9MYK.js";
function useOrganizerEventLive() {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ["organizerDashboard"],
    queryFn: () => organizerService.getDashboard(),
    staleTime: 1e3 * 60 * 5,
    retry: false
  });
  const bookingId = dashboardQuery.data?.bookings?.[0]?.booking_id;
  const statsQuery = useQuery({
    queryKey: ["organizerEventStats", bookingId],
    queryFn: () => organizerService.getEventStats(bookingId),
    enabled: !!bookingId,
    staleTime: 1e3 * 10,
    retry: false
  });
  useEffect(() => {
    if (!bookingId) return;
    const socket = getSocket();
    socket.emit("join_organizer_dashboard", { bookingId });
    const onStatsUpdated = (stats) => {
      queryClient.setQueryData(["organizerEventStats", bookingId], stats);
    };
    socket.on("event_stats_updated", onStatsUpdated);
    return () => {
      socket.off("event_stats_updated", onStatsUpdated);
    };
  }, [bookingId, queryClient]);
  return {
    bookingId,
    booking: dashboardQuery.data?.bookings?.[0],
    organizer: dashboardQuery.data?.organizer,
    eventStats: statsQuery.data,
    isLoading: dashboardQuery.isLoading || statsQuery.isLoading,
    isError: dashboardQuery.isError || statsQuery.isError
  };
}
const DOT_CLASS = {
  emerald: "bg-emerald-500",
  primary: "bg-primary",
  orange: "bg-orange-500"
};
function notificationDotClass(dotColor) {
  return DOT_CLASS[dotColor] ?? DOT_CLASS.emerald;
}
function useOrganizerNotifications(bookingId) {
  const queryClient = useQueryClient();
  const queryKey = ["organizerNotifications", bookingId];
  const query = useQuery({
    queryKey,
    queryFn: () => organizerService.getNotifications(bookingId, { limit: 8 }),
    enabled: !!bookingId,
    staleTime: 1e3 * 15
  });
  const [liveItems, setLiveItems] = useState([]);
  const [liveUnread, setLiveUnread] = useState(null);
  useEffect(() => {
    if (!bookingId) return;
    const socket = getSocket();
    const onLive = (payload) => {
      setLiveItems((prev) => {
        const exists = prev.some((n) => n.id === payload.notification.id);
        if (exists) return prev;
        return [payload.notification, ...prev].slice(0, 8);
      });
      setLiveUnread(payload.unread_count);
      queryClient.invalidateQueries({ queryKey });
    };
    socket.on("organizer_notification", onLive);
    return () => {
      socket.off("organizer_notification", onLive);
    };
  }, [bookingId, queryClient, queryKey]);
  useEffect(() => {
    if (query.data?.notifications) {
      setLiveItems([]);
      setLiveUnread(null);
    }
  }, [query.data?.notifications]);
  const apiItems = query.data?.notifications ?? [];
  const mergedIds = new Set(apiItems.map((n) => n.id));
  const extraLive = liveItems.filter((n) => !mergedIds.has(n.id));
  const preview = [...extraLive, ...apiItems].slice(0, 8);
  const unreadCount = liveUnread ?? query.data?.unread_count ?? 0;
  const markAllRead = useCallback(async () => {
    if (!bookingId) return;
    await organizerService.markNotificationsRead(bookingId);
    setLiveUnread(0);
    await queryClient.invalidateQueries({ queryKey });
  }, [bookingId, queryClient, queryKey]);
  return {
    preview,
    unreadCount,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    markAllRead,
    refetch: query.refetch
  };
}
function formatJoinedAt(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const now = /* @__PURE__ */ new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (isToday) return `Joined ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Joined yesterday ${time}`;
  }
  return `Joined ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} ${time}`;
}
function formatRelativeTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.floor((Date.now() - d.getTime()) / 1e3);
  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return formatTimeShort(value);
}
function formatTimeShort(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const now = /* @__PURE__ */ new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (isToday) return time;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${time}`;
  }
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
function OrganizerNotificationBell() {
  const { bookingId } = useOrganizerEventLive();
  const { preview, unreadCount, markAllRead, isLoading } = useOrganizerNotifications(bookingId);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const handleMarkAllRead = async () => {
    await markAllRead();
  };
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        className: "grid h-9 w-9 place-items-center rounded-full hover:bg-muted relative transition-colors",
        "aria-label": "Notifications",
        children: [
          /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }),
          unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-12 z-40 w-80 rounded-2xl bg-white shadow-card border border-border overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border/60", children: [
        /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: "Notifications" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleMarkAllRead,
            disabled: unreadCount === 0,
            className: "text-xs text-primary font-medium disabled:opacity-40",
            children: "Mark all read"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "max-h-80 overflow-y-auto", children: isLoading && preview.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-4 py-6 text-center text-sm text-muted-foreground", children: "Loading…" }) : preview.length === 0 ? /* @__PURE__ */ jsx("li", { className: "px-4 py-6 text-center text-sm text-muted-foreground", children: "No notifications yet. Join activity will appear here live." }) : preview.map((n) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: `flex items-start gap-3 px-4 py-3 hover:bg-muted/40 ${!n.is_read ? "bg-primary/5" : ""}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: `mt-1.5 h-2 w-2 rounded-full shrink-0 ${notificationDotClass(n.dot_color)}` }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm", children: n.message }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: formatRelativeTime(n.created_at) })
            ] })
          ]
        },
        n.id
      )) }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/notifications",
          onClick: () => setOpen(false),
          className: "block text-center text-xs text-primary font-medium py-2.5 border-t border-border/60 hover:bg-muted/30",
          children: "View all"
        }
      )
    ] })
  ] });
}
const NAV = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
  { label: "Participants", to: "/participants", icon: Users },
  { label: "Groups", to: "/groups", icon: Layers },
  { label: "Results", to: "/hr-results", icon: Trophy }
];
function DashboardShell({ crumb, children, userName, userEmail, onLogout }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef(null);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("zv:collapsed") : null;
    if (saved === "1") setCollapsed(true);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("zv:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const sideW = collapsed ? "w-[72px]" : "w-[220px]";
  const NavItem = ({ n, active }) => {
    const cls = `flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl ${collapsed ? "px-2" : "px-3"} py-2.5 text-sm font-medium transition-colors ${active ? "bg-gradient-primary text-white shadow-glow" : "text-foreground/70 hover:bg-muted"}`;
    const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(n.icon, { className: "h-4 w-4 shrink-0" }),
      !collapsed && /* @__PURE__ */ jsx("span", { children: n.label })
    ] });
    return /* @__PURE__ */ jsx(Link, { to: n.to, title: collapsed ? n.label : void 0, className: cls, children: inner });
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[oklch(0.965_0.012_290)]", children: /* @__PURE__ */ jsx("div", { className: "px-4 pb-10 pt-5", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-[1280px] gap-5", children: [
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `${sideW} shrink-0 rounded-2xl bg-white shadow-card flex flex-col transition-[width] duration-200 overflow-hidden`,
        style: { minHeight: "calc(100vh - 60px)" },
        children: [
          /* @__PURE__ */ jsx("div", { className: `${collapsed ? "px-3 py-5 flex justify-center" : "px-5 py-5"} border-b border-border/60`, children: collapsed ? /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-5 w-5 text-white", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M5 6h12L7 18h12", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) }) : /* @__PURE__ */ jsx(Flogo, {}) }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 p-3 space-y-1", children: NAV.map((n) => /* @__PURE__ */ jsx(NavItem, { n, active: path === n.to }, n.label)) }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 border-t border-border/60 space-y-1", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/profile",
                title: collapsed ? "Settings" : void 0,
                className: `flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-xl py-2.5 text-sm font-medium transition-colors ${path === "/profile" ? "bg-accent text-accent-foreground" : "text-foreground/70 hover:bg-muted"}`,
                children: [
                  /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 shrink-0" }),
                  !collapsed && /* @__PURE__ */ jsx("span", { children: "Settings" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                id: "sidebar-collapse-btn",
                onClick: () => setCollapsed((c) => !c),
                title: collapsed ? "Expand sidebar" : "Collapse sidebar",
                className: `w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-xl py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted transition-colors`,
                children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4 shrink-0" }),
                  /* @__PURE__ */ jsx("span", { children: "Collapse" })
                ] })
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 min-w-0 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-card", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-xl bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4 text-primary" }) }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-foreground", children: crumb.split("/").pop()?.trim() || "Dashboard" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(OrganizerNotificationBell, {}),
          /* @__PURE__ */ jsxs("div", { ref: userRef, className: "relative", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                id: "user-menu-btn",
                onClick: () => setUserMenuOpen((v) => !v),
                className: "flex items-center gap-2 rounded-2xl bg-muted/50 hover:bg-muted px-3 py-2 transition-colors",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm", children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-muted-foreground" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "leading-tight text-left hidden sm:block", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: userName }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: userEmail })
                  ] }),
                  /* @__PURE__ */ jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}` })
                ]
              }
            ),
            userMenuOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-14 z-40 w-52 rounded-2xl bg-white shadow-card border border-border overflow-hidden", children: [
              /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-b border-border/60", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: userName }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: userEmail })
              ] }),
              /* @__PURE__ */ jsxs("ul", { className: "p-1.5", children: [
                /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: "/dashboard",
                    onClick: () => setUserMenuOpen(false),
                    className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4 text-primary" }),
                      "Dashboard"
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: "/profile",
                    onClick: () => setUserMenuOpen(false),
                    className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-primary" }),
                      "Settings"
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "p-1.5 border-t border-border/60", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setUserMenuOpen(false);
                    onLogout();
                  },
                  className: "w-full text-left flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("path", { d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" }),
                      /* @__PURE__ */ jsx("polyline", { points: "16 17 21 12 16 7" }),
                      /* @__PURE__ */ jsx("line", { x1: "21", y1: "12", x2: "9", y2: "12" })
                    ] }),
                    "Logout"
                  ]
                }
              ) })
            ] })
          ] })
        ] })
      ] }),
      children,
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(LockIcon, {}),
        " Secure. Reliable. Real-time ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground/70", children: "Your event is safe with us." })
      ] })
    ] })
  ] }) }) });
}
function LockIcon() {
  return /* @__PURE__ */ jsxs("svg", { className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("rect", { x: "4", y: "11", width: "16", height: "10", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M8 11V7a4 4 0 018 0v4" })
  ] });
}
export {
  DashboardShell as D,
  useOrganizerNotifications as a,
  formatRelativeTime as b,
  formatTimeShort as c,
  formatJoinedAt as f,
  notificationDotClass as n,
  useOrganizerEventLive as u
};
