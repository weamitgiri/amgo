import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users, HandHeart, Target, Zap, MonitorPlay, ShieldCheck, Clock, Link2, Lock, Sparkles, Award, Gamepad2, Check, ArrowRight } from "lucide-react";
import { u as useGames, a as usePackages, H as Header, F as Footer } from "./Footer-B4j7Jc8J.js";
import { P as PillButton } from "./PillButton-CcmGnRVV.js";
import { r as resolveMediaUrl } from "./media-DMImknnw.js";
import { h as heroBg } from "./hero-bg-home-LTKDrSLZ.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./router-BvkvNwFV.js";
import "sonner";
import "./config-OQZNPa_v.js";
const cook = "/assets/cook-BJuR3xCY.jpg";
const cta = "/assets/fram-contact-CNah08KI.png";
const calculator = "/assets/cost-cal-bg%201-CYQp8yfM.png";
const step1 = "/assets/step-1-CcTfCL0y.png";
const step2 = "/assets/step-2-6tYu7guB.png";
const step3 = "/assets/step-3-lQZ7nf0g.png";
const step4 = "/assets/step-4-BXhoy-8e.png";
const FALLBACK_IMAGES = [mystery, cook];
const FEATURES = [{
  icon: Users,
  color: "text-[#0EA5E9]",
  bg: "bg-[#0EA5E9]/10",
  title: "Drive Real Participation, Not Just Attendance",
  desc: "Move beyond passive sessions where people just show up. Every participant actively contributes, interacts, and plays a role. Designed to keep energy high and involvement consistent throughout."
}, {
  icon: HandHeart,
  color: "text-[#8B5CF6]",
  bg: "bg-[#8B5CF6]/10",
  title: "Turn Employees Into Active Contributors",
  desc: "Encourage real collaboration, not just observation. Participants think, respond, and engage with each other continuously. Every individual becomes part of the experience, not just a spectator."
}, {
  icon: Target,
  color: "text-[#10B981]",
  bg: "bg-[#10B981]/10",
  title: "Structured Activities With Clear Outcomes",
  desc: "Each activity is built with defined roles, rules, and objectives. No confusion, no randomness, just guided, meaningful interaction. Outcomes are clear, measurable, and aligned with team goals."
}, {
  icon: Zap,
  color: "text-[#F43F5E]",
  bg: "bg-[#F43F5E]/10",
  title: "Setup in Minutes, No Training Needed",
  desc: "Get started quickly without lengthy onboarding or instructions. The platform is intuitive and easy for both organizers and participants. Register, select your activity package, and distribute access credentials. The platform handles everything else automatically."
}, {
  icon: MonitorPlay,
  color: "text-[#F59E0B]",
  bg: "bg-[#F59E0B]/10",
  title: "No IT Required, Just Open and Play",
  desc: "Zoventro runs entirely in the browser. No app installations, no infrastructure, no IT tickets — just open and participate."
}, {
  icon: ShieldCheck,
  color: "text-white",
  bg: "bg-white/20",
  title: "Secure and Time-Bound Access",
  desc: "Each package generates unique access credentials per participant. All access expires automatically after 5 days. No data is retained beyond the activity window.",
  featured: false
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
    /* @__PURE__ */ jsx("section", { className: "relative px-4 pt-6", children: /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#100720]", children: [
      /* @__PURE__ */ jsx("img", { src: heroBg, alt: "", width: 1536, height: 1024, className: "absolute inset-0 h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[#170B2F]/90 via-[#170B2F]/40 to-transparent" }),
      /* @__PURE__ */ jsx(Header, { floating: true }),
      /* @__PURE__ */ jsxs("div", { className: "relative px-6 md:px-14 pt-44 pb-32 max-w-3xl", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-[52px] md:text-[64px] font-extrabold text-white leading-[1.1] tracking-tight", children: [
          "Turn Teams Activities ",
          /* @__PURE__ */ jsx("br", { className: "hidden md:block" }),
          "Into Interactive ",
          /* @__PURE__ */ jsx("br", { className: "hidden md:block" }),
          "Experiences"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-white/80 text-base md:text-lg whitespace-nowrap", children: "Boost engagement, collaboration, and energy, without complicated setups." }),
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
        return /* @__PURE__ */ jsxs("div", { className: `rounded-[2rem] p-8 text-center shadow-card border transition-all duration-300 group ${featured ? "bg-gradient-primary text-white border-transparent shadow-elevated hover:-translate-y-1 hover:shadow-glow" : "bg-card text-foreground border-border hover:bg-gradient-primary hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-glow"}`, children: [
          /* @__PURE__ */ jsx("div", { className: `mx-auto h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${featured ? "border border-white/20 bg-white/10" : `${f.bg} group-hover:border group-hover:border-white/20 group-hover:bg-white/10`}`, children: /* @__PURE__ */ jsx(f.icon, { className: `h-7 w-7 transition-colors duration-300 ${featured ? "text-white" : `${f.color} group-hover:text-white`}` }) }),
          /* @__PURE__ */ jsx("h3", { className: `mt-6 font-bold text-[20px] leading-tight transition-colors duration-300 ${featured ? "text-white" : "text-foreground group-hover:text-white"}`, children: f.title }),
          /* @__PURE__ */ jsx("p", { className: `mt-3.5 text-[13px] leading-relaxed transition-colors duration-300 ${featured ? "text-white/90" : "text-muted-foreground group-hover:text-white/90"}`, children: f.desc })
        ] }, f.title);
      }) })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "activities", className: "px-4 mt-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1320px] rounded-[3rem] bg-gradient-soft p-10 md:p-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold", children: "Explore Interactive Experiences" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground", children: "Designed to engage people, spark thinking, and create memorable moments." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 grid md:grid-cols-2 gap-8", children: gamesLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CardSkeleton, {}),
        /* @__PURE__ */ jsx(CardSkeleton, {})
      ] }) : gamesError || !games?.length ? /* @__PURE__ */ jsx("p", { className: "md:col-span-2 text-center text-sm text-muted-foreground py-8", children: gamesError ? "Unable to load activities. Please try again later." : "No activities available yet." }) : games.map((game, index) => /* @__PURE__ */ jsx(ActivityCard, { game, fallbackImage: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length], accent: index % 2 === 1 ? "warm" : "purple" }, game.id)) })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { id: "pricing", className: "px-4 mt-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1320px] text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold", children: "Choose Your Package" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground max-w-2xl mx-auto", children: "Packages are non-refundable once activated, as access is delivered digitally and instantly upon payment." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1320px] mt-12 grid gap-8 md:grid-cols-3", children: packagesLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
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
      /* @__PURE__ */ jsx("img", { src: cta, alt: "", width: 1536, height: 768, loading: "lazy", className: "absolute h-full w-full object-cover" }),
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
  const descriptionHtml = (game.description ?? "").replace(/<ul[^>]*>/gi, '<ul class="list-disc pl-5 space-y-1.5 text-[13px] md:text-sm text-white/90 mt-3 mb-4">').replace(/<li[^>]*>/gi, "<li>").replace(/<\/li>/gi, "</li>");
  const textLines = descriptionText.split(/\r?\n|\.|•|-/).map((line) => line.trim()).filter(Boolean);
  const summary = !hasHtml ? textLines[0] ?? "An interactive team experience." : "";
  const bullets = !hasHtml && textLines.length > 1 ? textLines.slice(1) : [];
  const Icon = ACTIVITY_ICON_MAP[game.slug] ?? Gamepad2;
  const closingMatch = hasHtml ? (game.description ?? "").match(/<\/ul>\s*(?:<br\s*\/?>)*\s*([^<]+)\s*$/i) : null;
  const closingText = closingMatch ? closingMatch[1].trim() : null;
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-[2.5rem] min-h-[480px] shadow-elevated group flex flex-col justify-between", children: [
    /* @__PURE__ */ jsx("img", { src: image, alt: game.title, loading: "lazy", className: "absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" }),
    /* @__PURE__ */ jsx("div", { className: `absolute inset-0 ${accent === "warm" ? "bg-gradient-to-b from-orange-950/95 via-orange-950/70 to-orange-900/30" : "bg-gradient-to-b from-[#0F0826]/95 via-[#0F0826]/70 to-[#0F0826]/30"}` }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col p-8 md:p-10 text-white h-full z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-6 md:gap-8 items-start", children: [
        iconImage ? /* @__PURE__ */ jsx("img", { src: iconImage, alt: `${game.title} badge`, className: "w-28 h-28 md:w-[140px] md:h-[140px] object-contain drop-shadow-2xl shrink-0" }) : /* @__PURE__ */ jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shadow-md backdrop-blur-sm shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "h-10 w-10 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-3xl md:text-[36px] font-bold tracking-tight leading-tight", children: game.title }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 flex-1", children: hasHtml ? /* @__PURE__ */ jsx("div", { className: "text-[14px] md:text-[15px] text-white/90 leading-relaxed prose prose-invert max-w-none prose-li:text-white/90 prose-ul:my-2", dangerouslySetInnerHTML: {
            __html: descriptionHtml
          } }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[14px] md:text-[15px] text-white/90 leading-relaxed", children: summary }),
            bullets.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-4 list-disc pl-5 space-y-2 text-[14px] md:text-[15px] text-white/90", children: bullets.map((bullet, index) => /* @__PURE__ */ jsx("li", { children: bullet }, index)) }),
            closingText && /* @__PURE__ */ jsx("p", { className: "mt-5 text-[14px] md:text-[15px] text-white/90 leading-relaxed", children: closingText })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 pt-6 flex justify-center mt-auto", children: /* @__PURE__ */ jsx(Link, { to: "/create", search: {
        activity: game.slug
      }, className: "inline-flex items-center justify-center rounded-full border border-white/80 px-10 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black backdrop-blur-sm", children: "Explore Activity" }) })
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
  return /* @__PURE__ */ jsxs("div", { className: `relative rounded-[2.5rem] p-8 lg:p-10 shadow-card bg-card border transition-all duration-300 ${popular ? "border-transparent shadow-elevated ring-1 ring-primary/20" : "border-border hover:border-primary/20 hover:shadow-elevated"}`, children: [
    popular && /* @__PURE__ */ jsx("div", { className: "absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-gradient-blue text-white text-[11px] font-medium tracking-wide px-4 py-1.5 shadow-sm", children: "Most Popular" }),
    /* @__PURE__ */ jsx("h3", { className: "font-bold text-[26px] text-foreground", children: plan.name }),
    bestFor && /* @__PURE__ */ jsxs("p", { className: "mt-2 text-[14px] text-muted-foreground leading-relaxed", children: [
      "Best for: ",
      bestFor
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-7 flex items-start justify-between min-h-[52px]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-[44px] font-extrabold text-foreground tracking-tight leading-none", children: formatPrice(plan.price) }),
        perUser && /* @__PURE__ */ jsx("p", { className: "text-[13px] text-muted-foreground font-medium mt-1.5", children: perUser })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground mt-3 font-medium", children: [
        "One Time",
        /* @__PURE__ */ jsx("br", {}),
        "Payment"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 pt-7 border-t border-border/80", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[14px] font-medium mb-4 text-foreground/80", children: "This plan includes:" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: features.map((inc) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-[14px]", children: [
        /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 mt-0.5 shrink-0 text-success", strokeWidth: 2.5 }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground/90 leading-snug", children: inc })
      ] }, inc)) })
    ] }),
    /* @__PURE__ */ jsxs(Link, { to: "/create", search: {
      activity: void 0
    }, className: `mt-10 w-full inline-flex items-center justify-between rounded-full pl-6 pr-1.5 py-1.5 text-[15px] font-medium border transition-all duration-300 group cursor-pointer ${popular ? "border-transparent bg-gradient-blue text-white hover:opacity-90 hover:shadow-md" : "border-border bg-white text-foreground hover:bg-gradient-blue hover:text-white hover:border-transparent hover:shadow-md"}`, children: [
      "Pay & Activate",
      /* @__PURE__ */ jsx("span", { className: `grid h-9 w-9 place-items-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 ${popular ? "bg-white text-[#8B5CF6]" : "bg-purple-100 text-[#8B5CF6] group-hover:bg-white"}`, children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4", strokeWidth: 2.5 }) })
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
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-6 items-stretch mt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-sm border border-border/40 flex flex-col justify-between gap-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-foreground mb-4", children: "See your cost per employee" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-purple-50/50 rounded-xl p-3 text-center border border-purple-100 flex flex-col justify-center", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-lg md:text-xl font-bold text-primary", children: [
                  "₹",
                  data.costPerEmployee
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 leading-tight", children: [
                  "Cost per",
                  /* @__PURE__ */ jsx("br", {}),
                  "employee"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-purple-50/50 rounded-xl p-3 text-center border border-purple-100 flex flex-col justify-center", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-lg md:text-xl font-bold text-primary", children: [
                  "₹",
                  data.totalCost.toLocaleString("en-IN")
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 leading-tight", children: [
                  "Total package",
                  /* @__PURE__ */ jsx("br", {}),
                  "cost"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-purple-50/50 rounded-xl p-3 text-center border border-purple-100 flex flex-col justify-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg md:text-xl font-bold text-primary", children: data.groups }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 leading-tight", children: [
                  "Groups",
                  /* @__PURE__ */ jsx("br", {}),
                  "auto-formed"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-purple-50/50 rounded-xl p-4 border border-purple-100 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block", children: "Recommended:" }),
              /* @__PURE__ */ jsx("span", { className: "inline-flex bg-gradient-primary text-white font-semibold px-3 py-1 rounded-full text-xs shadow-sm mt-1.5", children: data.name })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground max-w-[120px] leading-relaxed text-right", children: "Zoventro is up to 5x more cost-effective" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-sm border border-border/40 flex flex-col sm:flex-row items-center justify-center gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-28 h-28 rounded-full relative flex items-center justify-center shrink-0 shadow-sm", style: {
            background: `conic-gradient(
                  #8B5CF6 0% 15%, 
                  #10B981 15% 45%, 
                  #EC4899 45% 80%, 
                  #F59E0B 80% 100%
                )`
          }, children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-white absolute flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center leading-tight", children: "Cost" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-1 gap-y-3 gap-x-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#8B5CF6] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "Zoventro" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground mt-1 font-medium", children: [
                  "₹",
                  data.totalCost.toLocaleString("en-IN")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#10B981] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "Facilitator-led" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1 font-medium", children: "₹23,000" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#EC4899] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "Team Lunch" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1 font-medium", children: "₹35,000" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full bg-[#F59E0B] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground leading-none", children: "DIY Activities" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1 font-medium", children: "₹17,000" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  Home as component
};
