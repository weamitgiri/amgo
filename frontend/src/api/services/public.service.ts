import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import type { ApiActivity, ApiCmsPage, ApiGameDetails, ApiPackage, SiteSettings } from "../types/public";
import type { PaymentMethodsResponse } from "../types/organizer";

export const publicService = {
  getPackages: () =>
    apiClient.get<ApiPackage[]>(API_ENDPOINTS.public.packages, { auth: "none" }),

  getGames: () =>
    apiClient.get<ApiActivity[]>(API_ENDPOINTS.public.games, { auth: "none" }),

  getGameById: (id: number | string) =>
    apiClient.get<ApiGameDetails>(API_ENDPOINTS.public.gameById(id), { auth: "none" }),

  getSettings: () =>
    apiClient.get<SiteSettings>(API_ENDPOINTS.public.settings, { auth: "none" }),

  /**
   * Payment methods the checkout may offer, resolved server-side from the admin
   * toggles and whether Razorpay is actually configured. Pass the order total
   * so COD min/max limits are applied to the result.
   */
  getPaymentMethods: (amount?: number) =>
    apiClient.get<PaymentMethodsResponse>(
      amount != null
        ? `${API_ENDPOINTS.public.paymentMethods}?amount=${encodeURIComponent(amount)}`
        : API_ENDPOINTS.public.paymentMethods,
      { auth: "none" }
    ),

  getCmsPages: () =>
    apiClient.get<ApiCmsPage[]>(API_ENDPOINTS.public.cms, { auth: "none" }),

  getCmsBySlug: (slug: string) =>
    apiClient.get<ApiCmsPage>(API_ENDPOINTS.public.cmsBySlug(slug), { auth: "none" }),
};
