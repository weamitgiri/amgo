import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { HandHeart, Users, Target, Zap, MonitorPlay, Clock, Link2, Lock, Sparkles, Award, Gamepad2, Crown, Check } from "lucide-react";
import { u as useGames, a as usePackages, H as Header, F as Footer } from "./Footer-0Cr9NLpb.js";
import { P as PillButton } from "./PillButton-BYYJPueu.js";
import { r as resolveMediaUrl } from "./media-BmyD47-a.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { c as cook } from "./cook-DvYnZAQe.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./router-qdPwl0jo.js";
import "sonner";
import "./config-qISbZfHI.js";
const hero = "/assets/hero-bg-home-bJSNekVt.jpg";
const cta = "/assets/cta-DGhrox5G.jpg";
const calculator = "/assets/cost-cal-bg%201-CYQp8yfM.png";
const step1 = "/assets/Step-1-CcTfCL0y.png";
const step2 = "/assets/step-2-6tYu7guB.png";
const step3 = "/assets/step-3-lQZ7nf0g.png";
const step4 = "/assets/step-4-BXhoy-8e.png";
const FALLBACK_IMAGES = [mystery, cook];
const FEATURES = [{
  icon: HandHeart,
  color: "text-info",
  bg: "bg-info/15",
  title: "Drive Real Participation, Not Just Attendance",
  desc: "Move beyond passive sessions where people just show up. Every participant actively contributes, interacts, and plays a role."
}, {
  icon: Users,
  color: "text-primary",
  bg: "bg-primary/15",
  title: "Turn Employees Into Active Contributors",
  desc: "Encourage real collaboration, not just observation. Participants think, respond, and engage with each other continuously."
}, {
  icon: Target,
  color: "text-success",
  bg: "bg-success/15",
  title: "Structured Activities With Clear Outcomes",
  desc: "Each activity is built with defined roles, rules, and objectives. Outcomes are clear, measurable, and aligned with team goals."
}, {
  icon: Zap,
  color: "text-pink",
  bg: "bg-pink/15",
  title: "Setup in Minutes, No Training Needed",
  desc: "Get started quickly without lengthy onboarding. The platform is intuitive and easy for both organizers and participants."
}, {
  icon: MonitorPlay,
  color: "text-warning",
  bg: "bg-warning/15",
  title: "No IT Required, Just Open and Play",
  desc: "Zoventro runs entirely in the browser. No app installations, no infrastructure, no IT tickets — just open and participate."
}, {
  icon: MonitorPlay,
  color: "text-warning",
  bg: "bg-warning/15",
  title: "Secure and Time-Bound Access",
  desc: "Each package generates unique access credentials per participant. All access expiresautomatically after 5 days."
}];
const STEPS = [{
  n: "01",
  image: step1,
  title: "Register & Choose a Package",
  desc: "The HR or Organizer registers using their official company email ID, selects the appropriate package, and completes payment.",
  meta: "Takes 2 minutes",
  metaIcon: Clock
}, {
  n: "02",
  image: step2,
  title: "Receive a unique join link",
  desc: "A secure, shareable access link is generated instantly after activation. Send it to participants via email or WhatsApp.",
  meta: "Instant setup",
  metaIcon: Link2
}, {
  n: "03",
  image: step3,
  title: "Share Link & Start the Game",
  desc: "Participants open the link, enter their details, and verify via OTP. They join instantly, no login, no app download.",
  meta: "No passwords needed",
  metaIcon: Lock
}, {
  n: "04",
  image: step4,
  title: "Start Game & Track Live",
  desc: "Teams are auto-grouped and ready to play with assigned roles. Track participation, groups, and results in real-time.",
  meta: "Zero manual effort",
  metaIcon: Sparkles
}];
function formatPrice(price) {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `₹${n.toLocaleString("en-IN")}`;
}
function perUserLabel(price, maxUsers) {
  if (!maxUsers) return null;
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `₹${Math.round(n / maxUsers)}/user`;
}
function Home() {
  const {
    data: games,
    isLoading: gamesLoading,
    isError: gamesError
  } = useGames();
  const {
    data: packages,
    isLoading: packagesLoading,
    isError: packagesError
  } = usePackages();
  const sortedPackages = [...packages ?? []].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const topPackages = sortedPackages.slice(0, 3);
  const bottomPackages = sortedPackages.slice(3);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx("section", { className: "relative px-4 pt-6", children: /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-hero", children: [
      /* @__PURE__ */ jsx("img", { src: hero, alt: "", width: 1536, height: 1024, className: "absolute inset-0 h-full w-full object-cover opacity-70" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-900/40 to-transparent" }),
      /* @__PURE__ */ jsx(Header, { floating: true }),
      /* @__PURE__ */ jsxs("div", { className: "relative px-6 md:px-14 pt-44 pb-24 max-w-2xl", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-5xl md:text-6xl font-bold text-white leading-[1.05]", children: "Turn Teams Activities Into Interactive Experiences" }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-white/80 max-w-md", children: "Boost engagement, collaboration, and energy, without complicated setups." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Link, { to: "/create", search: {
            activity: void 0
          }, children: /* @__PURE__ */ jsx(PillButton, { variant: "light", children: "Get Started Now" }) }),
          /* @__PURE__ */ jsx(PillButton, { variant: "outline-light", withArrow: false, children: "Explore Activities" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "px-4 mt-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold", children: "Built for HR. Designed for Real Team Engagement" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground max-w-2xl mx-auto", children: "Everything you need for structured, engaging team experiences, without operational overhead." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl mt-12 grid gap-5 md:grid-cols-3", children: FEATURES.map((f) => {
        const featured = f.featured;
        return /* @__PURE__ */ jsxs("div", { className: `rounded-2xl p-7 text-center shadow-card border transition-all duration-300 group ${featured ? "bg-gradient-primary text-white border-transparent shadow-elevated hover:-translate-y-1 hover:shadow-glow" : "bg-card text-foreground border-border hover:bg-gradient-primary hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-glow"}`, children: [
          /* @__PURE__ */ jsx("div", { className: `mx-auto h-14 w-14 rounded-full grid place-items-center transition-colors duration-300 ${featured ? "bg-white/20" : `${f.bg} group-hover:bg-white/20`}`, children: /* @__PURE__ */ jsx(f.icon, { className: `h-6 w-6 transition-colors duration-300 ${featured ? "text-white" : `${f.color} group-hover:text-white`}` }) }),
          /* @__PURE__ */ jsx("h3", { className: `mt-5 font-semibold text-lg transition-colors duration-300 ${featured ? "text-white" : "text-foreground group-hover:text-white"}`, children: f.title }),
          /* @__PURE__ */ jsx("p", { className: `mt-3 text-sm leading-relaxed transition-colors duration-300 ${featured ? "text-white/85" : "text-muted-foreground group-hover:text-white/85"}`, children: f.desc })
        ] }, f.title);
      }) })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "activities", className: "px-4 mt-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl rounded-[2rem] bg-gradient-soft p-10 md:p-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold", children: "Explore Interactive Experiences" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground", children: "Designed to engage people, spark thinking, and create memorable moments." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 grid md:grid-cols-2 gap-6", children: gamesLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CardSkeleton, {}),
        /* @__PURE__ */ jsx(CardSkeleton, {})
      ] }) : gamesError || !games?.length ? /* @__PURE__ */ jsx("p", { className: "md:col-span-2 text-center text-sm text-muted-foreground py-8", children: gamesError ? "Unable to load activities. Please try again later." : "No activities available yet." }) : games.map((game, index) => /* @__PURE__ */ jsx(ActivityCard, { game, fallbackImage: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length], accent: index % 2 === 1 ? "warm" : "purple" }, game.id)) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { id: "pricing", className: "px-4 mt-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold", children: "Choose Your Package" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground max-w-2xl mx-auto", children: "Packages are non-refundable once activated, as access is delivered digitally and instantly upon payment." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl mt-10 grid gap-5 md:grid-cols-3", children: packagesLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CardSkeleton, { tall: true }),
        /* @__PURE__ */ jsx(CardSkeleton, { tall: true }),
        /* @__PURE__ */ jsx(CardSkeleton, { tall: true })
      ] }) : packagesError || !sortedPackages.length ? /* @__PURE__ */ jsx("p", { className: "md:col-span-3 text-center text-sm text-muted-foreground py-8", children: packagesError ? "Unable to load packages. Please try again later." : "No packages available yet." }) : topPackages.map((p) => /* @__PURE__ */ jsx(PriceCard, { plan: p }, p.id)) }),
      !packagesLoading && !packagesError && bottomPackages.length > 0 && /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-4xl mt-5 grid gap-5 md:grid-cols-2", children: bottomPackages.map((p) => /* @__PURE__ */ jsx(PriceCard, { plan: p }, p.id)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "px-4 mt-24", children: /* @__PURE__ */ jsx(CostCalculator, {}) }),
    /* @__PURE__ */ jsx("section", { id: "how", className: "px-4 mt-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl rounded-[2rem] bg-gradient-soft p-10 md:p-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold", children: "Simple Setup, Seamless Experience in easy steps" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground", children: "From setup to session, everything is designed to be quick, clear, and effortless." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 grid md:grid-cols-2 gap-5", children: STEPS.map((s) => /* @__PURE__ */ jsxs("div", { className: "rounded-[2.5rem] bg-white p-7 shadow-elevated border border-white/80", children: [
        /* @__PURE__ */ jsx("div", { className: "text-primary text-xs font-semibold tracking-widest border border-primary/30 inline-flex rounded-full px-3 py-1", children: s.n }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-xl md:text-lg", children: s.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl", children: s.desc }),
            /* @__PURE__ */ jsxs("div", { className: "mt-5 inline-flex items-center gap-2 text-xs text-primary", children: [
              /* @__PURE__ */ jsx(s.metaIcon, { className: "h-3.5 w-3.5" }),
              " ",
              s.meta
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative h-40 min-h-[160px] w-full max-w-[240px] rounded-[2rem] bg-purple-100/70 overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: s.image, alt: `Step ${s.n}`, className: "h-full w-full object-contain" }) })
        ] })
      ] }, s.n)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "px-4 mt-20", children: /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] min-h-[340px] grid place-items-center text-center px-6", children: [
      /* @__PURE__ */ jsx("img", { src: cta, alt: "", width: 1536, height: 768, loading: "lazy", className: "absolute inset-0 h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-purple-900/40 to-purple-900/70" }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-xl py-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white", children: "Stop Planning. Start Engaging." }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-white/80", children: "Most team activities take weeks to plan and still fall flat. Zoventro gets your team engaged in minutes — with zero follow-up headaches." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-7 flex flex-wrap gap-3 justify-center", children: [
          /* @__PURE__ */ jsx(Link, { to: "/create", search: {
            activity: void 0
          }, children: /* @__PURE__ */ jsx(PillButton, { variant: "light", children: "Get Started Now" }) }),
          /* @__PURE__ */ jsx(PillButton, { variant: "outline-light", withArrow: false, children: "Contact Us" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function CardSkeleton({
  tall = false
}) {
  return /* @__PURE__ */ jsx("div", { className: `rounded-2xl bg-muted/60 animate-pulse ${tall ? "min-h-[420px]" : "min-h-[280px]"}` });
}
const ACTIVITY_ICON_MAP = {
  "mystery-quest": Target,
  "cook-create": Award
};
function ActivityCard({
  game,
  fallbackImage,
  accent = "purple"
}) {
  const image = resolveMediaUrl(game.cover_image) ?? fallbackImage;
  const iconImage = game.icon ? resolveMediaUrl(game.icon) : void 0;
  const hasHtml = !!game.description && /<[^>]+>/.test(game.description);
  const descriptionText = game.description ?? "An interactive team experience.";
  const descriptionHtml = (game.description ?? "").replace(/<ul[^>]*>/gi, '<ul class="list-disc pl-5 space-y-1 text-sm text-white/90 mt-2 mb-3">').replace(/<li[^>]*>/gi, "<li>").replace(/<\/li>/gi, "</li>");
  const textLines = descriptionText.split(/\r?\n|\.|•|-/).map((line) => line.trim()).filter(Boolean);
  const summary = !hasHtml ? textLines[0] ?? "An interactive team experience." : "";
  const bullets = !hasHtml && textLines.length > 1 ? textLines.slice(1) : [];
  const Icon = ACTIVITY_ICON_MAP[game.slug] ?? Gamepad2;
  const closingMatch = hasHtml ? (game.description ?? "").match(/<\/ul>\s*(?:<br\s*\/?>)*\s*([^<]+)\s*$/i) : null;
  closingMatch ? closingMatch[1].trim() : null;
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-[2rem] min-h-[420px] shadow-elevated group", children: [
    /* @__PURE__ */ jsx("img", { src: image, alt: game.title, width: 1024, height: 768, loading: "lazy", className: "absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" }),
    /* @__PURE__ */ jsx("div", { className: `absolute inset-0 ${accent === "warm" ? "bg-gradient-to-t from-orange-950/80 via-orange-900/50 to-orange-900/20" : "bg-gradient-to-t from-purple-900/85 via-purple-900/50 to-purple-900/20"}` }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex h-full flex-col justify-between p-7 text-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-white/15 border border-white/20 shadow-lg backdrop-blur-lg shrink-0", children: iconImage ? /* @__PURE__ */ jsx("img", { src: iconImage, alt: `${game.title} icon`, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8 text-white" }) }),
        /* @__PURE__ */ jsx("div", { className: "max-w-xl", children: /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold tracking-tight", children: game.title }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 flex-1", children: hasHtml ? /* @__PURE__ */ jsx("div", { className: "text-sm text-white/85 leading-relaxed prose prose-invert max-w-none prose-li:text-white/85 prose-ul:my-2", dangerouslySetInnerHTML: {
        __html: descriptionHtml
      } }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/85 leading-relaxed", children: summary }),
        bullets.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-3 list-disc pl-5 space-y-1 text-sm text-white/85", children: bullets.map((bullet, index) => /* @__PURE__ */ jsx("li", { children: bullet }, index)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-col items-center gap-4", children: /* @__PURE__ */ jsx(Link, { to: "/create", search: {
        activity: game.slug
      }, className: "inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-foreground backdrop-blur-sm w-full max-w-[220px]", children: "Explore Activity" }) })
    ] })
  ] });
}
function PriceCard({
  plan
}) {
  const popular = plan.slug === "growth-pack";
  const features = Array.isArray(plan.features) ? plan.features : [];
  const perUser = perUserLabel(plan.price, plan.max_users);
  const bestFor = plan.short_description?.replace(/^Best for:\s*/i, "") ?? "";
  return /* @__PURE__ */ jsxs("div", { className: `relative rounded-2xl p-7 shadow-card bg-card border transition-all duration-300 ${popular ? "border-primary/40 shadow-elevated" : "border-border hover:border-primary/20 hover:shadow-elevated"}`, children: [
    popular && /* @__PURE__ */ jsxs("div", { className: "absolute -top-3.5 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-primary text-white text-[10px] font-semibold uppercase tracking-wider px-3.5 py-1 shadow-sm", children: [
      /* @__PURE__ */ jsx(Crown, { className: "h-3 w-3 text-warning fill-warning" }),
      " Most Popular"
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg text-foreground", children: plan.name }),
    bestFor && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
      "Best for: ",
      bestFor
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-start justify-between min-h-[48px]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-foreground", children: formatPrice(plan.price) }),
        perUser && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-medium mt-0.5", children: perUser })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground mt-2", children: "One Time Payment" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 pt-5 border-t border-border", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold mb-3 text-foreground/90", children: "This plan includes:" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: features.map((inc) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 mt-0.5 shrink-0 text-success" }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground/80", children: inc })
      ] }, inc)) })
    ] }),
    /* @__PURE__ */ jsxs(Link, { to: "/create", search: {
      activity: void 0
    }, className: "mt-6 w-full inline-flex items-center justify-between rounded-full pl-5 pr-1.5 py-1.5 text-sm font-medium border border-border bg-white text-foreground/80 hover:bg-gradient-primary hover:text-white hover:border-transparent hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2 transition-all duration-300 group cursor-pointer", children: [
      "Pay & Activate",
      /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-white group-hover:text-primary transition-all duration-300", children: "→" })
    ] })
  ] });
}
function CostCalculator() {
  const [count, setCount] = useState(100);
  const getCalculatorData = (count2) => {
    if (count2 <= 5) {
      return {
        name: "Trial Pack",
        totalCost: 499,
        costPerEmployee: Math.round(499 / count2),
        groups: 1
      };
    } else if (count2 <= 50) {
      return {
        name: "Starter Pack",
        totalCost: 2999,
        costPerEmployee: Math.round(2999 / count2),
        groups: 10
      };
    } else if (count2 <= 100) {
      return {
        name: "Growth Pack",
        totalCost: 4999,
        costPerEmployee: Math.round(4999 / count2),
        groups: 20
      };
    } else if (count2 <= 300) {
      return {
        name: "Business Pack",
        totalCost: 8999,
        costPerEmployee: Math.round(8999 / count2),
        groups: 60
      };
    } else {
      return {
        name: "Enterprise Pack",
        totalCost: 19999,
        costPerEmployee: Math.round(19999 / count2),
        groups: 100
      };
    }
  };
  const data = getCalculatorData(count);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl grid lg:grid-cols-12 gap-8 items-stretch", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 rounded-[2rem] bg-card border border-border p-10 shadow-card flex flex-col justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight", children: [
          "See your cost",
          /* @__PURE__ */ jsx("br", {}),
          "per Employee"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-muted-foreground leading-relaxed", children: "Estimate your cost instantly and plan your team engagement session." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center items-center", children: /* @__PURE__ */ jsx("img", { src: calculator, alt: "Cost Calculator Illustration", className: "w-full max-w-[290px] h-auto object-contain rounded-2xl drop-shadow-lg" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 rounded-[2rem] bg-gradient-soft border border-border/60 p-8 md:p-10 shadow-card flex flex-col justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground text-sm tracking-wide uppercase text-muted-foreground", children: "How many employees are you engaging?" }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-primary bg-primary/10 px-4 py-1 rounded-full", children: count })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 relative flex items-center", children: /* @__PURE__ */ jsx("input", { type: "range", min: "1", max: "500", value: count, onChange: (e) => setCount(Number(e.target.value)), className: "w-full h-2 rounded-lg appearance-none cursor-pointer bg-purple-200/50 accent-primary", style: {
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${count / 500 * 100}%, oklch(0.9 0.04 295) ${count / 500 * 100}%, oklch(0.9 0.04 295) 100%)`
        } }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-12 gap-6 items-stretch", children: [
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-7 flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 text-center border border-border/40 shadow-sm flex flex-col justify-center", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-xl md:text-2xl font-bold text-primary", children: [
                "₹",
                data.costPerEmployee
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight", children: [
                "Cost per",
                /* @__PURE__ */ jsx("br", {}),
                "employee"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 text-center border border-border/40 shadow-sm flex flex-col justify-center", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-xl md:text-2xl font-bold text-primary", children: [
                "₹",
                data.totalCost.toLocaleString("en-IN")
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight", children: [
                "Total package",
                /* @__PURE__ */ jsx("br", {}),
                "cost"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 text-center border border-border/40 shadow-sm flex flex-col justify-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xl md:text-2xl font-bold text-primary", children: data.groups }),
              /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight", children: [
                "Groups",
                /* @__PURE__ */ jsx("br", {}),
                "auto-formed"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/40 flex-1 flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Recommended:" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "inline-flex bg-gradient-primary text-white font-semibold px-4 py-1.5 rounded-full text-xs shadow-sm", children: data.name }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-3 leading-relaxed", children: "Zoventro is up to 5x more cost-effective than traditional team activities" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "md:col-span-5 bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/40 flex flex-col justify-between min-h-[220px]", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-xs text-foreground tracking-wide uppercase text-muted-foreground mb-3", children: "Simple Cost Breakdown:" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-primary leading-tight", children: "Zoventro Standard" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-primary/80 mt-0.5", children: [
                "(",
                count,
                " people) = ₹",
                data.totalCost.toLocaleString("en-IN"),
                " | ₹",
                data.costPerEmployee,
                "/person"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-border/30 pt-2.5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-muted-foreground leading-tight", children: "Hired facilitator" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground/80 mt-0.5", children: "= ₹35,000 - ₹40,500 | no reporting" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-border/30 pt-2.5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-muted-foreground leading-tight", children: "Team Lunch" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground/80 mt-0.5", children: "= ₹50,000 | forgotten by next week" })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-full relative flex items-center justify-center shrink-0 shadow-sm transition-all duration-300", style: {
            background: `conic-gradient(
                  #8B5CF6 0% 15%, 
                  #10B981 15% 45%, 
                  #EC4899 45% 80%, 
                  #F59E0B 80% 100%
                )`
          }, children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-card absolute flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "Cost" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#8B5CF6] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "Zoventro" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-medium", children: [
                  "₹",
                  data.totalCost.toLocaleString("en-IN")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#10B981] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "Facilitator-led" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-medium", children: "₹23,000" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#EC4899] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "Team Lunch" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-medium", children: "₹35,000" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#F59E0B] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "DIY Activities" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-medium", children: "₹17,000" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right hidden sm:block", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block", children: "Dynamic Cost comparison" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-primary mt-1 block", children: "Zoventro is up to 80% cheaper!" })
        ] })
      ] })
    ] })
  ] });
}
export {
  Home as component
};
