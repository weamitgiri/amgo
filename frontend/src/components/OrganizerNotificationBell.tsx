import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useOrganizerEventLive } from "@/hooks/useOrganizerEventLive";
import {
  notificationDotClass,
  useOrganizerNotifications,
} from "@/hooks/useOrganizerNotifications";
import { formatRelativeTime } from "@/lib/format-datetime";

export function OrganizerNotificationBell() {
  const { bookingId } = useOrganizerEventLive();
  const { preview, unreadCount, markAllRead, isLoading } = useOrganizerNotifications(bookingId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted relative transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl bg-white shadow-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="font-semibold text-sm">Notifications</div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-xs text-primary font-medium disabled:opacity-40"
            >
              Mark all read
            </button>
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {isLoading && preview.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</li>
            ) : preview.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet. Join activity will appear here live.
              </li>
            ) : (
              preview.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 ${!n.is_read ? "bg-primary/5" : ""}`}
                >
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${notificationDotClass(n.dot_color)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{n.message}</div>
                    <div className="text-xs text-muted-foreground">{formatRelativeTime(n.created_at)}</div>
                  </div>
                </li>
              ))
            )}
          </ul>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-primary font-medium py-2.5 border-t border-border/60 hover:bg-muted/30"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
