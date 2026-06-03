import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/api/services/public.service";

export const publicQueryKeys = {
  packages: ["public", "packages"] as const,
  games: ["public", "games"] as const,
  settings: ["public", "settings"] as const,
  cms: ["public", "cms"] as const,
};

export function usePackages() {
  return useQuery({
    queryKey: publicQueryKeys.packages,
    queryFn: () => publicService.getPackages(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGames() {
  return useQuery({
    queryKey: publicQueryKeys.games,
    queryFn: () => publicService.getGames(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: publicQueryKeys.settings,
    queryFn: () => publicService.getSettings(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useGameDetails(activityId: number | null) {
  return useQuery({
    queryKey: [...publicQueryKeys.games, "detail", activityId] as const,
    queryFn: () => publicService.getGameById(activityId!),
    enabled: activityId != null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCmsPages() {
  return useQuery({
    queryKey: publicQueryKeys.cms,
    queryFn: () => publicService.getCmsPages(),
    staleTime: 10 * 60 * 1000,
  });
}
