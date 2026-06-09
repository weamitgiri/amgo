import { createFileRoute, Link } from "@tanstack/react-router";
import { type ComponentType, useState } from "react";
import {
  Users, HandHeart, Target, Zap, MonitorPlay, ShieldCheck,
  Clock, Link2, Lock, Sparkles, Check, Crown,
  Gamepad2, Award,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PillButton } from "@/components/PillButton";
import { useGames, usePackages } from "@/hooks/usePublicContent";
import type { ApiActivity, ApiPackage } from "@/api/types/public";
import { resolveMediaUrl } from "@/utils/media";
import hero from "@/assets/hero-bg-home.jpg";
import mystery from "@/assets/mystery.jpg";
import cook from "@/assets/cook.jpg";
import cta from "@/assets/cta.jpg";
import calculator from "@/assets/cost-cal-bg 1.png";
import step1 from "@/assets/step-1.png";
import step2 from "@/assets/step-2.png";
import step3 from "@/assets/step-3.png";
import step4 from "@/assets/step-4.png";

const FALLBACK_IMAGES = [mystery, cook];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zoventro — Interactive Team Engagement Platform" },
      { name: "description", content: "Turn team activities into interactive experiences. Built for HR, designed for real engagement. Setup in minutes, no IT required." },
      { property: "og:title", content: "Zoventro — Interactive Team Engagement" },
      { property: "og:description", content: "Boost engagement, collaboration and energy without complicated setups." },
    ],
  }),
  component: Home,
});

type FeatureCard = {
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  title: string;
  desc: string;
  featured?: boolean;
};

const FEATURES: FeatureCard[] = [
  { icon: HandHeart, color: "text-info", bg: "bg-info/15", title: "Drive Real Participation, Not Just Attendance", desc: "Move beyond passive sessions where people just show up. Every participant actively contributes, interacts, and plays a role." },
  { icon: Users, color: "text-primary", bg: "bg-primary/15", title: "Turn Employees Into Active Contributors", desc: "Encourage real collaboration, not just observation. Participants think, respond, and engage with each other continuously." },
  { icon: Target, color: "text-success", bg: "bg-success/15", title: "Structured Activities With Clear Outcomes", desc: "Each activity is built with defined roles, rules, and objectives. Outcomes are clear, measurable, and aligned with team goals." },
  { icon: Zap, color: "text-pink", bg: "bg-pink/15", title: "Setup in Minutes, No Training Needed", desc: "Get started quickly without lengthy onboarding. The platform is intuitive and easy for both organizers and participants." },
  { icon: MonitorPlay, color: "text-warning", bg: "bg-warning/15", title: "No IT Required, Just Open and Play", desc: "Zoventro runs entirely in the browser. No app installations, no infrastructure, no IT tickets — just open and participate." },
  { icon: MonitorPlay, color: "text-warning", bg: "bg-warning/15", title: "Secure and Time-Bound Access", desc: "Each package generates unique access credentials per participant. All access expiresautomatically after 5 days." },
];

type StepCard = {
  n: string;
  image: string;
  title: string;
  desc: string;
  meta: string;
  metaIcon: ComponentType<{ className?: string }>;
};

const STEPS: StepCard[] = [
  { n: "01", image: step1, title: "Register & Choose a Package", desc: "The HR or Organizer registers using their official company email ID, selects the appropriate package, and completes payment.", meta: "Takes 2 minutes", metaIcon: Clock },
  { n: "02", image: step2, title: "Receive a unique join link", desc: "A secure, shareable access link is generated instantly after activation. Send it to participants via email or WhatsApp.", meta: "Instant setup", metaIcon: Link2 },
  { n: "03", image: step3, title: "Share Link & Start the Game", desc: "Participants open the link, enter their details, and verify via OTP. They join instantly, no login, no app download.", meta: "No passwords needed", metaIcon: Lock },
  { n: "04", image: step4, title: "Start Game & Track Live", desc: "Teams are auto-grouped and ready to play with assigned roles. Track participation, groups, and results in real-time.", meta: "Zero manual effort", metaIcon: Sparkles },
];

function formatPrice(price: number | string): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `₹${n.toLocaleString("en-IN")}`;
}

function perUserLabel(price: number | string, maxUsers: number): string | null {
  if (!maxUsers) return null;
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `₹${Math.round(n / maxUsers)}/user`;
}

function Home() {
  const { data: games, isLoading: gamesLoading, isError: gamesError } = useGames();
  const { data: packages, isLoading: packagesLoading, isError: packagesError } = usePackages();

  const sortedPackages = [...(packages ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const topPackages = sortedPackages.slice(0, 3);
  const bottomPackages = sortedPackages.slice(3);
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative px-4 pt-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-hero">
          <img src={hero} alt="" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-900/40 to-transparent" />
          <Header floating />
          <div className="relative px-6 md:px-14 pt-44 pb-24 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.05]">
              Turn Teams Activities Into Interactive Experiences
            </h1>
            <p className="mt-5 text-white/80 max-w-md">
              Boost engagement, collaboration, and energy, without complicated setups.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/create" search={{ activity: undefined }}><PillButton variant="light">Get Started Now</PillButton></Link>
              <PillButton variant="outline-light" withArrow={false}>Explore Activities</PillButton>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 mt-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Built for HR. Designed for Real Team Engagement</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Everything you need for structured, engaging team experiences, without operational overhead.</p>
        </div>
        <div className="mx-auto max-w-6xl mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => {
            const featured = f.featured;
            return (
              <div
                key={f.title}
                className={`rounded-2xl p-7 text-center shadow-card border transition-all duration-300 group ${
                  featured 
                    ? "bg-gradient-primary text-white border-transparent shadow-elevated hover:-translate-y-1 hover:shadow-glow" 
                    : "bg-card text-foreground border-border hover:bg-gradient-primary hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-glow"
                }`}
              >
                <div className={`mx-auto h-14 w-14 rounded-full grid place-items-center transition-colors duration-300 ${
                  featured 
                    ? "bg-white/20" 
                    : `${f.bg} group-hover:bg-white/20`
                }`}>
                  <f.icon className={`h-6 w-6 transition-colors duration-300 ${
                    featured 
                      ? "text-white" 
                      : `${f.color} group-hover:text-white`
                  }`} />
                </div>
                
                <h3 className={`mt-5 font-semibold text-lg transition-colors duration-300 ${
                  featured 
                    ? "text-white" 
                    : "text-foreground group-hover:text-white"
                }`}>
                  {f.title}
                </h3>
                
                <p className={`mt-3 text-sm leading-relaxed transition-colors duration-300 ${
                  featured 
                    ? "text-white/85" 
                    : "text-muted-foreground group-hover:text-white/85"
                }`}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ACTIVITIES */}
      {/* ACTIVITIES */}
      <section id="activities" className="px-4 mt-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-soft p-10 md:p-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Explore Interactive Experiences</h2>
            <p className="mt-3 text-muted-foreground">Designed to engage people, spark thinking, and create memorable moments.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {gamesLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : gamesError || !games?.length ? (
              <p className="md:col-span-2 text-center text-sm text-muted-foreground py-8">
                {gamesError
                  ? "Unable to load activities. Please try again later."
                  : "No activities available yet."}
              </p>
            ) : (
              games.map((game, index) => (
                <ActivityCard
                  key={game.id}
                  game={game}
                  fallbackImage={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                  accent={index % 2 === 1 ? "warm" : "purple"}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-4 mt-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Choose Your Package</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Packages are non-refundable once activated, as access is delivered digitally and instantly upon payment.</p>
        </div>
        <div className="mx-auto max-w-6xl mt-10 grid gap-5 md:grid-cols-3">
          {packagesLoading ? (
            <>
              <CardSkeleton tall />
              <CardSkeleton tall />
              <CardSkeleton tall />
            </>
          ) : packagesError || !sortedPackages.length ? (
            <p className="md:col-span-3 text-center text-sm text-muted-foreground py-8">
              {packagesError
                ? "Unable to load packages. Please try again later."
                : "No packages available yet."}
            </p>
          ) : (
            topPackages.map((p) => <PriceCard key={p.id} plan={p} />)
          )}
        </div>
        {!packagesLoading && !packagesError && bottomPackages.length > 0 && (
          <div className="mx-auto max-w-4xl mt-5 grid gap-5 md:grid-cols-2">
            {bottomPackages.map((p) => (
              <PriceCard key={p.id} plan={p} />
            ))}
          </div>
        )}
      </section>

      {/* COST CALCULATOR */}
      <section className="px-4 mt-24">
        <CostCalculator />
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-4 mt-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-soft p-10 md:p-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Simple Setup, Seamless Experience in easy steps</h2>
            <p className="mt-3 text-muted-foreground">From setup to session, everything is designed to be quick, clear, and effortless.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[2.5rem] bg-white p-7 shadow-elevated border border-white/80">
                <div className="text-primary text-xs font-semibold tracking-widest border border-primary/30 inline-flex rounded-full px-3 py-1">{s.n}</div>
                <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl md:text-lg">{s.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl">{s.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-xs text-primary">
                      <s.metaIcon className="h-3.5 w-3.5" /> {s.meta}
                    </div>
                  </div>
                  <div className="relative h-40 min-h-[160px] w-full max-w-[240px] rounded-[2rem] bg-purple-100/70 overflow-hidden">
                    <img
                      src={s.image}
                      alt={`Step ${s.n}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 mt-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] min-h-[340px] grid place-items-center text-center px-6">
          <img src={cta} alt="" width={1536} height={768} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-purple-900/70" />
          <div className="relative max-w-xl py-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Stop Planning. Start Engaging.</h2>
            <p className="mt-4 text-white/80">Most team activities take weeks to plan and still fall flat. Zoventro gets your team engaged in minutes — with zero follow-up headaches.</p>
            <div className="mt-7 flex flex-wrap gap-3 justify-center">
              <Link to="/create" search={{ activity: undefined }}><PillButton variant="light">Get Started Now</PillButton></Link>
              <PillButton variant="outline-light" withArrow={false}>Contact Us</PillButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function CardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`rounded-2xl bg-muted/60 animate-pulse ${tall ? "min-h-[420px]" : "min-h-[280px]"}`}
    />
  );
}

const ACTIVITY_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  "mystery-quest": Target,
  "cook-create": Award,
};

function ActivityCard({
  game,
  fallbackImage,
  accent = "purple",
}: {
  game: ApiActivity;
  fallbackImage: string;
  accent?: "purple" | "warm";
}) {
  const image = resolveMediaUrl(game.cover_image) ?? fallbackImage;
  const iconImage = game.icon ? resolveMediaUrl(game.icon) : undefined;
  const hasHtml = !!game.description && /<[^>]+>/.test(game.description);
  const descriptionText = game.description ?? "An interactive team experience.";

  // Fix: replace the ENTIRE <ul ...> opening tag (including any attributes like role="list")
  // so stray attributes don't leak as visible text.
  const descriptionHtml = (game.description ?? "")
    .replace(/<ul[^>]*>/gi, '<ul class="list-disc pl-5 space-y-1 text-sm text-white/90 mt-2 mb-3">')
    .replace(/<li[^>]*>/gi, "<li>")
    .replace(/<\/li>/gi, "</li>");

  // For plain-text descriptions, split into summary + bullets + closing
  const textLines = descriptionText
    .split(/\r?\n|\.|•|-/)
    .map((line) => line.trim())
    .filter(Boolean);
  const summary = !hasHtml ? textLines[0] ?? "An interactive team experience." : "";
  const bullets = !hasHtml && textLines.length > 1 ? textLines.slice(1) : [];
  const Icon = ACTIVITY_ICON_MAP[game.slug] ?? Gamepad2;

  // Extract the last paragraph as a closing statement (if it looks like one)
  // by checking if the HTML has a <p> after the </ul>
  const closingMatch = hasHtml
    ? (game.description ?? "").match(/<\/ul>\s*(?:<br\s*\/?>)*\s*([^<]+)\s*$/i)
    : null;
  const closingText = closingMatch ? closingMatch[1].trim() : null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] min-h-[420px] shadow-elevated group">
      <img
        src={image}
        alt={game.title}
        width={1024}
        height={768}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div
        className={`absolute inset-0 ${accent === "warm" ? "bg-gradient-to-t from-orange-950/80 via-orange-900/50 to-orange-900/20" : "bg-gradient-to-t from-purple-900/85 via-purple-900/50 to-purple-900/20"}`}
      />
      <div className="relative flex h-full flex-col justify-between p-7 text-white">
        {/* Top: icon + title */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-white/15 border border-white/20 shadow-lg backdrop-blur-lg shrink-0">
            {iconImage ? (
              <img src={iconImage} alt={`${game.title} icon`} className="h-full w-full object-cover" />
            ) : (
              <Icon className="h-8 w-8 text-white" />
            )}
          </div>
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold tracking-tight">{game.title}</h3>
          </div>
        </div>

        {/* Middle: description + bullets */}
        <div className="mt-4 flex-1">
          {hasHtml ? (
            <div
              className="text-sm text-white/85 leading-relaxed prose prose-invert max-w-none prose-li:text-white/85 prose-ul:my-2"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : (
            <>
              <p className="text-sm text-white/85 leading-relaxed">{summary}</p>
              {bullets.length > 0 && (
                <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-white/85">
                  {bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Bottom: closing text + centered button */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <Link
            to="/create"
            search={{ activity: game.slug }}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-foreground backdrop-blur-sm w-full max-w-[220px]"
          >
            Explore Activity
          </Link>
        </div>
      </div>
    </div>
  );
}



function PriceCard({ plan }: { plan: ApiPackage }) {
  const popular = plan.slug === "growth-pack";
  const features = Array.isArray(plan.features) ? plan.features : [];
  const perUser = perUserLabel(plan.price, plan.max_users);
  const bestFor = plan.short_description?.replace(/^Best for:\s*/i, "") ?? "";

  return (
    <div
      className={`relative rounded-2xl p-7 shadow-card bg-card border transition-all duration-300 ${
        popular ? "border-primary/40 shadow-elevated" : "border-border hover:border-primary/20 hover:shadow-elevated"
      }`}
    >
      {popular && (
        <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-primary text-white text-[10px] font-semibold uppercase tracking-wider px-3.5 py-1 shadow-sm">
          <Crown className="h-3 w-3 text-warning fill-warning" /> Most Popular
        </div>
      )}
      <h3 className="font-semibold text-lg text-foreground">{plan.name}</h3>
      {bestFor && (
        <p className="mt-1 text-xs text-muted-foreground">Best for: {bestFor}</p>
      )}

      <div className="mt-5 flex items-start justify-between min-h-[48px]">
        <div>
          <span className="text-3xl font-bold text-foreground">{formatPrice(plan.price)}</span>
          {perUser && (
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{perUser}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-2">One Time Payment</span>
      </div>

      <div className="mt-5 pt-5 border-t border-border">
        <p className="text-xs font-semibold mb-3 text-foreground/90">This plan includes:</p>
        <ul className="space-y-2.5">
          {features.map((inc) => (
            <li key={inc} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />
              <span className="text-foreground/80">{inc}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/create"
        search={{ activity: undefined }}
        className="mt-6 w-full inline-flex items-center justify-between rounded-full pl-5 pr-1.5 py-1.5 text-sm font-medium border border-border bg-white text-foreground/80 hover:bg-gradient-primary hover:text-white hover:border-transparent hover:outline hover:outline-2 hover:outline-primary hover:outline-offset-2 transition-all duration-300 group cursor-pointer"
      >
        Pay &amp; Activate
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-white group-hover:text-primary transition-all duration-300">
          →
        </span>
      </Link>
    </div>
  );
}

function CostCalculator() {
  const [count, setCount] = useState(100);

  // Helper to resolve pricing dynamics
  const getCalculatorData = (count: number) => {
    if (count <= 5) {
      return { name: "Trial Pack", totalCost: 499, costPerEmployee: Math.round(499 / count), groups: 1 };
    } else if (count <= 50) {
      return { name: "Starter Pack", totalCost: 2999, costPerEmployee: Math.round(2999 / count), groups: 10 };
    } else if (count <= 100) {
      return { name: "Growth Pack", totalCost: 4999, costPerEmployee: Math.round(4999 / count), groups: 20 };
    } else if (count <= 300) {
      return { name: "Business Pack", totalCost: 8999, costPerEmployee: Math.round(8999 / count), groups: 60 };
    } else {
      return { name: "Enterprise Pack", totalCost: 19999, costPerEmployee: Math.round(19999 / count), groups: 100 };
    }
  };

  const data = getCalculatorData(count);

  return (
    <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-8 items-stretch">
      {/* LEFT COLUMN - Whitespace Card with illustration */}
      <div className="lg:col-span-5 rounded-[2rem] bg-card border border-border p-10 shadow-card flex flex-col justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            See your cost<br />per Employee
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Estimate your cost instantly and plan your team engagement session.
          </p>
        </div>
        <div className="mt-8 flex justify-center items-center">
          <img
            src={calculator}
            alt="Cost Calculator Illustration"
            className="w-full max-w-[290px] h-auto object-contain rounded-2xl drop-shadow-lg"
          />
        </div>
      </div>

      {/* RIGHT COLUMN - Soft purple-blue gradient calculator interface */}
      <div className="lg:col-span-7 rounded-[2rem] bg-gradient-soft border border-border/60 p-8 md:p-10 shadow-card flex flex-col justify-between gap-6">
        {/* Top: Slider and employee count display */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground text-sm tracking-wide uppercase text-muted-foreground">
              How many employees are you engaging?
            </span>
            <span className="text-2xl font-bold text-primary bg-primary/10 px-4 py-1 rounded-full">
              {count}
            </span>
          </div>
          <div className="mt-5 relative flex items-center">
            <input
              type="range"
              min="1"
              max="500"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-purple-200/50 accent-primary"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                  (count / 500) * 100
                }%, oklch(0.9 0.04 295) ${(count / 500) * 100}%, oklch(0.9 0.04 295) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Middle part: Row metrics and Simple Cost Breakdown split */}
        <div className="grid md:grid-cols-12 gap-6 items-stretch">
          {/* Metrics + Recommended (Col span 7) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Row of 3 metrics cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-2xl p-4 text-center border border-border/40 shadow-sm flex flex-col justify-center">
                <span className="text-xl md:text-2xl font-bold text-primary">₹{data.costPerEmployee}</span>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">
                  Cost per<br />employee
                </span>
              </div>
              <div className="bg-card rounded-2xl p-4 text-center border border-border/40 shadow-sm flex flex-col justify-center">
                <span className="text-xl md:text-2xl font-bold text-primary">₹{data.totalCost.toLocaleString("en-IN")}</span>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">
                  Total package<br />cost
                </span>
              </div>
              <div className="bg-card rounded-2xl p-4 text-center border border-border/40 shadow-sm flex flex-col justify-center">
                <span className="text-xl md:text-2xl font-bold text-primary">{data.groups}</span>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5 leading-tight">
                  Groups<br />auto-formed
                </span>
              </div>
            </div>

            {/* Recommended package card */}
            <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/40 flex-1 flex flex-col justify-center">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Recommended:
              </span>
              <div className="mt-2 flex items-center">
                <span className="inline-flex bg-gradient-primary text-white font-semibold px-4 py-1.5 rounded-full text-xs shadow-sm">
                  {data.name}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                Zoventro is up to 5x more cost-effective than traditional team activities
              </p>
            </div>
          </div>

          {/* Simple Cost Breakdown Card (Col span 5) */}
          <div className="md:col-span-5 bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/40 flex flex-col justify-between min-h-[220px]">
            <div>
              <h4 className="font-bold text-xs text-foreground tracking-wide uppercase text-muted-foreground mb-3">
                Simple Cost Breakdown:
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-primary leading-tight">
                    Zoventro Standard
                  </p>
                  <p className="text-[11px] text-primary/80 mt-0.5">
                    ({count} people) = ₹{data.totalCost.toLocaleString("en-IN")} | ₹{data.costPerEmployee}/person
                  </p>
                </div>
                
                <div className="border-t border-border/30 pt-2.5">
                  <p className="text-xs font-semibold text-muted-foreground leading-tight">
                    Hired facilitator
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    = ₹35,000 - ₹40,500 | no reporting
                  </p>
                </div>

                <div className="border-t border-border/30 pt-2.5">
                  <p className="text-xs font-semibold text-muted-foreground leading-tight">
                    Team Lunch
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    = ₹50,000 | forgotten by next week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom part: Donut chart card */}
        <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Donut chart drawing using conic-gradient */}
            <div
              className="w-24 h-24 rounded-full relative flex items-center justify-center shrink-0 shadow-sm transition-all duration-300"
              style={{
                background: `conic-gradient(
                  #8B5CF6 0% 15%, 
                  #10B981 15% 45%, 
                  #EC4899 45% 80%, 
                  #F59E0B 80% 100%
                )`,
              }}
            >
              {/* Inner hole */}
              <div className="w-16 h-16 rounded-full bg-card absolute flex items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cost
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B5CF6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">Zoventro</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">₹{data.totalCost.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">Facilitator-led</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">₹23,000</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EC4899] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">Team Lunch</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">₹35,000</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">DIY Activities</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">₹17,000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Dynamic Cost comparison
            </span>
            <span className="text-xs font-bold text-primary mt-1 block">
              Zoventro is up to 80% cheaper!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
