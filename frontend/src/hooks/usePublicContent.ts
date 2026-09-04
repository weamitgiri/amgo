import { useQuery } from "@tanstack/react-query";
import { publicService } from "@/api/services/public.service";

export const publicQueryKeys = {
  packages: ["public", "packages"] as const,
  games: ["public", "games"] as const,
  settings: ["public", "settings"] as const,
  cms: ["public", "cms"] as const,
  paymentMethods: ["public", "payment-methods"] as const,
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

/**
 * Payment methods available for a given order total.
 *
 * Keyed by amount because COD limits are amount-dependent — a package above the
 * COD ceiling must not reuse a cached "COD available" answer from a cheaper
 * one. Kept short-lived so an admin toggling a method off takes effect quickly
 * rather than being masked by a long cache.
 */
export function usePaymentMethods(amount?: number) {
  return useQuery({
    queryKey: [...publicQueryKeys.paymentMethods, amount ?? null] as const,
    queryFn: () => publicService.getPaymentMethods(amount),
    staleTime: 60 * 1000,
  });
}

export function useCmsPages() {
  return useQuery({
    queryKey: publicQueryKeys.cms,
    queryFn: () => publicService.getCmsPages(),
    staleTime: 10 * 60 * 1000,
  });
}
