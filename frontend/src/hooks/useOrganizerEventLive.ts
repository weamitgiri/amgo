import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { organizerService } from "@/api/services/organizer.service";
import type { OrganizerDashboardResponse, OrganizerEventStats } from "@/api/types/organizer";
import { getSocket } from "@/lib/socket";

export function useOrganizerEventLive(selectedBookingId?: number | null) {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery<OrganizerDashboardResponse, Error>({
    queryKey: ["organizerDashboard"],
    queryFn: () => organizerService.getDashboard(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Only paid/activated games are real purchased games. An abandoned unpaid
  // draft (status 'pending_activation') must never appear as a game or become
  // the primary booking — a returning organizer who starts a second purchase
  // and drops it still sees their real games, not the draft.
  const bookings = (dashboardQuery.data?.bookings ?? []).filter(
    (b) => b.booking_status !== "pending_activation"
  );
  // The caller can pick which purchased game is in focus (dashboard game switcher);
  // default to the newest booking so every existing caller keeps its behaviour.
  const selectedBooking =
    (selectedBookingId != null
      ? bookings.find((b) => b.booking_id === selectedBookingId)
      : undefined) ?? bookings[0];
  const bookingId = selectedBooking?.booking_id;

  const statsQuery = useQuery<OrganizerEventStats, Error>({
    queryKey: ["organizerEventStats", bookingId],
    queryFn: () => organizerService.getEventStats(bookingId as number),
    enabled: !!bookingId,
    staleTime: 1000 * 10,
    // Stats are socket-pushed on participant joins, but NOT when a game ends,
    // so poll so the dashboard flips to "Event Completed" once all groups
    // finish without requiring a manual reload.
    refetchInterval: 1000 * 15,
    retry: false,
  });

  useEffect(() => {
    if (!bookingId) return;

    const socket = getSocket();
    const joinDashboard = () => socket.emit("join_organizer_dashboard", { bookingId });
    joinDashboard();

    // Socket.IO reuses the same client Socket across reconnects, so this effect
    // never re-runs on its own and the reconnected socket leaves the
    // organizer_${bookingId} room — silently dropping live event stats AND
    // organizer_notification events (both are broadcast to that room). Re-join on
    // every (re)connect and refetch the stats snapshot to catch anything missed
    // while offline. `connect` fires on each successful (re)connect.
    const rejoin = () => {
      joinDashboard();
      queryClient.invalidateQueries({ queryKey: ["organizerEventStats", bookingId] });
    };
    socket.on("connect", rejoin);

    const onStatsUpdated = (stats: OrganizerEventStats) => {
      queryClient.setQueryData(["organizerEventStats", bookingId], stats);
    };

    socket.on("event_stats_updated", onStatsUpdated);

    return () => {
      socket.off("connect", rejoin);
      socket.off("event_stats_updated", onStatsUpdated);
    };
  }, [bookingId, queryClient]);

  return {
    bookingId,
    booking: selectedBooking,
    bookings,
    organizer: dashboardQuery.data?.organizer,
    eventStats: statsQuery.data,
    isLoading: dashboardQuery.isLoading || statsQuery.isLoading,
    isError: dashboardQuery.isError || statsQuery.isError,
  };
}
