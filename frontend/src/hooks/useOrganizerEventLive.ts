import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { organizerService } from "@/api/services/organizer.service";
import type { OrganizerDashboardResponse, OrganizerEventStats } from "@/api/types/organizer";
import { getSocket } from "@/lib/socket";

export function useOrganizerEventLive() {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery<OrganizerDashboardResponse, Error>({
    queryKey: ["organizerDashboard"],
    queryFn: () => organizerService.getDashboard(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const bookingId = dashboardQuery.data?.bookings?.[0]?.booking_id;

  const statsQuery = useQuery<OrganizerEventStats, Error>({
    queryKey: ["organizerEventStats", bookingId],
    queryFn: () => organizerService.getEventStats(bookingId as number),
    enabled: !!bookingId,
    staleTime: 1000 * 10,
    retry: false,
  });

  useEffect(() => {
    if (!bookingId) return;

    const socket = getSocket();
    socket.emit("join_organizer_dashboard", { bookingId });

    const onStatsUpdated = (stats: OrganizerEventStats) => {
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
    isError: dashboardQuery.isError || statsQuery.isError,
  };
}
