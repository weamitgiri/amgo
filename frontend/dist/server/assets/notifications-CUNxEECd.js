import { U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { y as useNavigate, k as isOrganizerAuthenticated, e as apiClient } from "./router-DZhViOq_.js";
import { u as useQuery } from "./useQuery-CFSAAbqg.js";
import { u as useOrganizerEventLive, c as useOrganizerNotifications, D as DashboardShell, B as Bell, n as notificationDotClass, a as formatRelativeTime } from "./DashboardShell-C_BG6hYI.js";
import { o as organizerService } from "./organizer.service-C7lkqR-i.js";
import { g as getSocket } from "./socket-BGH0xJ8N.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Logo-COJrqD4D.js";
import "./users-DLcloTUO.js";
import "./trophy-CKK5oUV7.js";
import "./chevron-right-B_AJoG7h.js";
import "./user-C3Lc9pkP.js";
import "./config-CafHMDrA.js";
import "fs";
import "url";
import "./worker-entry-DAWxcb8x.js";
import "node:events";
import "http";
import "https";
function NotificationsPage() {
  const navigate = useNavigate();
  const {
    bookingId,
    organizer
  } = useOrganizerEventLive();
  const {
    markAllRead
  } = useOrganizerNotifications(bookingId);
  reactExports.useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect: "/notifications"
        }
      });
    }
  }, [navigate]);
  const query = useQuery({
    queryKey: ["organizerNotificationsAll", bookingId],
    queryFn: () => organizerService.getNotifications(bookingId, {
      limit: 100,
      offset: 0
    }),
    enabled: !!bookingId
  });
  const [liveExtras, setLiveExtras] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!bookingId) return;
    const socket = getSocket();
    const onLive = (payload) => {
      setLiveExtras((prev) => {
        if (prev.some((n) => n.id === payload.notification.id)) return prev;
        if (query.data?.notifications.some((n) => n.id === payload.notification.id)) return prev;
        return [payload.notification, ...prev];
      });
    };
    socket.on("organizer_notification", onLive);
    return () => socket.off("organizer_notification", onLive);
  }, [bookingId, query.data?.notifications]);
  const items = [...liveExtras.filter((n) => !query.data?.notifications.some((existing) => existing.id === n.id)), ...query.data?.notifications ?? []];
  const total = query.data?.total ?? items.length;
  const handleLogout = () => {
    apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    }
    navigate({
      to: "/login"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardShell, { crumb: "Dashboard / Notifications", userName: organizer?.name ?? "Organizer", userEmail: organizer?.email ?? "", onLogout: handleLogout, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white shadow-card border border-border/60 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold", children: "All Notifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Live updates when participants join groups" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => markAllRead(), className: "text-sm text-primary font-medium hover:underline", children: "Mark all read" })
    ] }),
    query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-6 py-12 text-center text-sm text-muted-foreground", children: "Loading notifications…" }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-6 py-12 text-center text-sm text-muted-foreground", children: "No notifications yet. When someone joins a group, you will see it here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border/60", children: items.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `flex items-start gap-4 px-6 py-4 ${!n.is_read ? "bg-primary/[0.03]" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${notificationDotClass(n.dot_color)}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: n.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatRelativeTime(n.created_at) })
      ] })
    ] }, n.id)) }),
    total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "px-6 py-3 text-center text-xs text-muted-foreground border-t border-border/60", children: [
      total,
      " notification",
      total === 1 ? "" : "s",
      " total"
    ] })
  ] }) });
}
export {
  NotificationsPage as component
};
