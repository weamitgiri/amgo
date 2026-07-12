import { jsx, jsxs } from "react/jsx-runtime";
import { useLocation, Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, MessageCircle, Facebook, Linkedin, ArrowUp } from "lucide-react";
import { F as Flogo } from "./Flogo-BFeWNg6Z.js";
import { useQuery } from "@tanstack/react-query";
import { a as apiClient } from "./router-qdPwl0jo.js";
import { A as API_ENDPOINTS } from "./config-qISbZfHI.js";
const NAV = [
  { label: "Overview", to: "/" },
  { label: "Activities", to: "/#activities" },
  { label: "How It Works", to: "/#how" },
  { label: "Pricing", to: "/#pricing" },
  { label: "Contact", to: "/#contact" }
];
function Header({ floating = false }) {
  const location = useLocation();
  return /* @__PURE__ */ jsx("header", { className: floating ? "absolute top-6 left-0 right-0 z-30 px-4" : "sticky top-4 z-30 px-4", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl", children: /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between gap-4 rounded-full border px-3 py-2 pl-4 backdrop-blur-xl ${floating ? "border-white/10 bg-white/5" : "border-border bg-card/80 shadow-card"}`, children: [
    /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx(Flogo, { light: floating }) }),
    /* @__PURE__ */ jsx("nav", { className: "hidden md:flex items-center gap-7", children: NAV.map((item) => {
      const active = item.to === location.pathname;
      return /* @__PURE__ */ jsxs(
        "a",
        {
          href: item.to,
          className: `text-sm transition-colors relative ${floating ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"} ${active ? floating ? "text-white" : "text-foreground font-medium" : ""}`,
          children: [
            item.label,
            active && /* @__PURE__ */ jsx("span", { className: `absolute -bottom-2 left-0 right-0 h-[2px] rounded-full ${floating ? "bg-white" : "bg-primary"}` })
          ]
        },
        item.label
      );
    }) }),
    /* @__PURE__ */ jsxs(Link, { to: "/login", className: "group flex items-center gap-2 rounded-full bg-white pl-5 pr-1.5 py-1.5 text-sm font-medium text-foreground shadow-sm", children: [
      "Login",
      /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-white transition-transform group-hover:translate-x-0.5", children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" }) })
    ] })
  ] }) }) });
}
const publicService = {
  getPackages: () => apiClient.get(API_ENDPOINTS.public.packages, { auth: "none" }),
  getGames: () => apiClient.get(API_ENDPOINTS.public.games, { auth: "none" }),
  getGameById: (id) => apiClient.get(API_ENDPOINTS.public.gameById(id), { auth: "none" }),
  getSettings: () => apiClient.get(API_ENDPOINTS.public.settings, { auth: "none" }),
  getCmsPages: () => apiClient.get(API_ENDPOINTS.public.cms, { auth: "none" }),
  getCmsBySlug: (slug) => apiClient.get(API_ENDPOINTS.public.cmsBySlug(slug), { auth: "none" })
};
const publicQueryKeys = {
  packages: ["public", "packages"],
  games: ["public", "games"],
  settings: ["public", "settings"],
  cms: ["public", "cms"]
};
function usePackages() {
  return useQuery({
    queryKey: publicQueryKeys.packages,
    queryFn: () => publicService.getPackages(),
    staleTime: 5 * 60 * 1e3
  });
}
function useGames() {
  return useQuery({
    queryKey: publicQueryKeys.games,
    queryFn: () => publicService.getGames(),
    staleTime: 5 * 60 * 1e3
  });
}
function useSiteSettings() {
  return useQuery({
    queryKey: publicQueryKeys.settings,
    queryFn: () => publicService.getSettings(),
    staleTime: 10 * 60 * 1e3
  });
}
function useGameDetails(activityId) {
  return useQuery({
    queryKey: [...publicQueryKeys.games, "detail", activityId],
    queryFn: () => publicService.getGameById(activityId),
    enabled: activityId != null,
    staleTime: 5 * 60 * 1e3
  });
}
function useCmsPages() {
  return useQuery({
    queryKey: publicQueryKeys.cms,
    queryFn: () => publicService.getCmsPages(),
    staleTime: 10 * 60 * 1e3
  });
}
const CMS_LEGAL_ROUTES = {
  "privacy-policy": "/privacy",
  "terms-conditions": "/terms"
};
const LEGAL_SLUGS = ["privacy-policy", "terms-conditions", "refund-policy"];
function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: cmsPages } = useCmsPages();
  const pages = [
    { label: "Home", to: "/" },
    { label: "Pricing", to: "/#pricing" },
    { label: "Contact", to: "/#contact" },
    { label: "Login", to: "/login" }
  ];
  const legalPages = cmsPages?.filter((p) => LEGAL_SLUGS.includes(p.slug)) ?? [];
  const fallbackLegal = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/terms" }
  ];
  const siteName = settings?.website_name || "Zoventro";
  const tagline = settings?.tagline || "Corporate & Event Engagement\nGaming Platform";
  const phone = settings?.contact_number || "+91 9112340092";
  const email = settings?.support_email || "support@zoventro.com";
  const socialLinks = [
    { url: settings?.instagram_url, Icon: Instagram, label: "Instagram" },
    {
      url: settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}` : void 0,
      Icon: MessageCircle,
      label: "WhatsApp"
    },
    { url: settings?.facebook_url, Icon: Facebook, label: "Facebook" },
    { url: settings?.linkedin_url, Icon: Linkedin, label: "LinkedIn" }
  ].filter((item) => item.url);
  return /* @__PURE__ */ jsx("footer", { id: "contact", className: "bg-card mt-16", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-6 py-14", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-1", children: [
        /* @__PURE__ */ jsx(Flogo, {}),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-muted-foreground leading-relaxed whitespace-pre-line", children: tagline })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "PAGES" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-foreground/80", children: pages.map((item) => /* @__PURE__ */ jsx("li", { children: item.to.startsWith("/") && !item.to.includes("#") ? /* @__PURE__ */ jsx(Link, { to: item.to, className: "hover:text-primary transition-colors", children: item.label }) : /* @__PURE__ */ jsx("a", { href: item.to, className: "hover:text-primary transition-colors", children: item.label }) }, item.label)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "LEGAL" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-foreground/80", children: (legalPages.length > 0 ? legalPages : null)?.map((item) => {
          const route = CMS_LEGAL_ROUTES[item.slug];
          return /* @__PURE__ */ jsx("li", { children: route ? /* @__PURE__ */ jsx(Link, { to: route, className: "hover:text-primary transition-colors", children: item.title }) : /* @__PURE__ */ jsx("span", { className: "text-foreground/80", children: item.title }) }, item.slug);
        }) ?? fallbackLegal.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: item.to, className: "hover:text-primary transition-colors", children: item.label }) }, item.label)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "CONTACT" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-foreground/80", children: [
          /* @__PURE__ */ jsx("li", { children: phone }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `mailto:${email}`, className: "hover:text-primary transition-colors", children: email }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "FOLLOW US" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: socialLinks.length > 0 ? socialLinks.map(({ url, Icon, label }) => /* @__PURE__ */ jsx(
          "a",
          {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": label,
            className: "grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors",
            children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
          },
          label
        )) : [Instagram, MessageCircle, Facebook, Linkedin].map((Icon, i) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/40",
            children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
          },
          i
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        siteName,
        ". All Rights Reserved"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "max-w-md text-center", children: [
        siteName,
        " is a digital team engagement platform. All activities are organized and managed by the designated HR contact or event organizer of the respective organization."
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          className: "grid h-10 w-10 place-items-center rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors",
          "aria-label": "Scroll to top",
          children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-4 w-4" })
        }
      )
    ] })
  ] }) });
}
export {
  Footer as F,
  Header as H,
  usePackages as a,
  useGameDetails as b,
  useGames as u
};
