import { a6 as useRouter, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { L as Link, e as apiClient } from "./router-DZhViOq_.js";
import { c as createLucideIcon, L as Logo } from "./Logo-COJrqD4D.js";
import { A as ArrowRight } from "./arrow-right-h3or2hTG.js";
import { u as useQuery } from "./useQuery-CFSAAbqg.js";
import { A as API_ENDPOINTS } from "./config-CafHMDrA.js";
function useLocation(opts) {
  const router = useRouter();
  {
    const location = router.stores.location.get();
    return location;
  }
}
const __iconNode$4 = [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
];
const ArrowUp = createLucideIcon("arrow-up", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", key: "1jg4f8" }
  ]
];
const Facebook = createLucideIcon("facebook", __iconNode$3);
const __iconNode$2 = [
  ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "2e1cvw" }],
  ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" }],
  ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }]
];
const Instagram = createLucideIcon("instagram", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
      key: "c2jq9f"
    }
  ],
  ["rect", { width: "4", height: "12", x: "2", y: "9", key: "mk3on5" }],
  ["circle", { cx: "4", cy: "4", r: "2", key: "bt5ra8" }]
];
const Linkedin = createLucideIcon("linkedin", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
      key: "1sd12s"
    }
  ]
];
const MessageCircle = createLucideIcon("message-circle", __iconNode);
const NAV = [
  { label: "Overview", to: "/" },
  { label: "Activities", to: "/#activities" },
  { label: "How It Works", to: "/#how" },
  { label: "Pricing", to: "/#pricing" },
  { label: "Contact", to: "/#contact" }
];
function Header({ floating = false }) {
  const location = useLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: floating ? "absolute top-6 left-0 right-0 z-30 px-4" : "sticky top-4 z-30 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between gap-4 rounded-full border px-3 py-2 pl-4 backdrop-blur-xl ${floating ? "border-white/10 bg-white/5" : "border-border bg-card/80 shadow-card"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { light: floating }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden md:flex items-center gap-7", children: NAV.map((item) => {
      const active = item.to === location.pathname;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: item.to,
          className: `text-sm transition-colors relative ${floating ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"} ${active ? floating ? "text-white" : "text-foreground font-medium" : ""}`,
          children: [
            item.label,
            active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute -bottom-2 left-0 right-0 h-[2px] rounded-full ${floating ? "bg-white" : "bg-primary"}` })
          ]
        },
        item.label
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "group flex items-center gap-2 rounded-full bg-white pl-5 pr-1.5 py-1.5 text-sm font-medium text-foreground shadow-sm", children: [
      "Login",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-white transition-transform group-hover:translate-x-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" }) })
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
    { label: "Blog", to: "#" },
    { label: "Contact", to: "/#contact" },
    { label: "FAQs", to: "#" },
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { id: "contact", className: "bg-card mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-10 md:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground leading-relaxed whitespace-pre-line", children: tagline })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "PAGES" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm text-foreground/80", children: pages.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: item.to.startsWith("/") && !item.to.includes("#") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: item.to, className: "hover:text-primary transition-colors", children: item.label }) : /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: item.to, className: "hover:text-primary transition-colors", children: item.label }) }, item.label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "LEGAL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm text-foreground/80", children: (legalPages.length > 0 ? legalPages : null)?.map((item) => {
          const route = CMS_LEGAL_ROUTES[item.slug];
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: route ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: route, className: "hover:text-primary transition-colors", children: item.title }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/80", children: item.title }) }, item.slug);
        }) ?? fallbackLegal.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: item.to, className: "hover:text-primary transition-colors", children: item.label }) }, item.label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "CONTACT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm text-foreground/80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: phone }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${email}`, className: "hover:text-primary transition-colors", children: email }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold tracking-widest text-primary mb-3", children: "FOLLOW US" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: socialLinks.length > 0 ? socialLinks.map(({ url, Icon, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": label,
            className: "grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" })
          },
          label
        )) : [Instagram, MessageCircle, Facebook, Linkedin].map((Icon, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/40",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" })
          },
          i
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        siteName,
        ". All Rights Reserved"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "max-w-md text-center", children: [
        siteName,
        " is a digital team engagement platform. All activities are organized and managed by the designated HR contact or event organizer of the respective organization."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          className: "grid h-10 w-10 place-items-center rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors",
          "aria-label": "Scroll to top",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" })
        }
      )
    ] })
  ] }) });
}
export {
  Footer as F,
  Header as H,
  MessageCircle as M,
  useGames as a,
  usePackages as b,
  useGameDetails as u
};
