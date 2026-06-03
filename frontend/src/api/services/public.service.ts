import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import type { ApiActivity, ApiCmsPage, ApiGameDetails, ApiPackage, SiteSettings } from "../types/public";

export const publicService = {
  getPackages: () =>
    apiClient.get<ApiPackage[]>(API_ENDPOINTS.public.packages, { auth: "none" }),

  getGames: () =>
    apiClient.get<ApiActivity[]>(API_ENDPOINTS.public.games, { auth: "none" }),

  getGameById: (id: number | string) =>
    apiClient.get<ApiGameDetails>(API_ENDPOINTS.public.gameById(id), { auth: "none" }),

  getSettings: () =>
    apiClient.get<SiteSettings>(API_ENDPOINTS.public.settings, { auth: "none" }),

  getCmsPages: () =>
    apiClient.get<ApiCmsPage[]>(API_ENDPOINTS.public.cms, { auth: "none" }),

  getCmsBySlug: (slug: string) =>
    apiClient.get<ApiCmsPage>(API_ENDPOINTS.public.cmsBySlug(slug), { auth: "none" }),
};
