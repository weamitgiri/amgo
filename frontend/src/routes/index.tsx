import { createFileRoute, Link } from "@tanstack/react-router";
import { type ComponentType, useState } from "react";
import {
  Users, HandHeart, Target, Zap, MonitorPlay, ShieldCheck,
  Clock, Link2, Lock, Sparkles, Check, Crown,
  Gamepad2, Award, ArrowRight,
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
import cta from "@/assets/fram-contact.png";
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
  { icon: Users, color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10", title: "Drive Real Participation, Not Just Attendance", desc: "Move beyond passive sessions where people just show up. Every participant actively contributes, interacts, and plays a role. Designed to keep energy high and involvement consistent throughout." },
  { icon: HandHeart, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", title: "Turn Employees Into Active Contributors", desc: "Encourage real collaboration, not just observation. Participants think, respond, and engage with each other continuously. Every individual becomes part of the experience, not just a spectator." },
  { icon: Target, color: "text-[#10B981]", bg: "bg-[#10B981]/10", title: "Structured Activities With Clear Outcomes", desc: "Each activity is built with defined roles, rules, and objectives. No confusion, no randomness, just guided, meaningful interaction. Outcomes are clear, measurable, and aligned with team goals." },
  { icon: Zap, color: "text-[#F43F5E]", bg: "bg-[#F43F5E]/10", title: "Setup in Minutes, No Training Needed", desc: "Get started quickly without lengthy onboarding or instructions. The platform is intuitive and easy for both organizers and participants. Register, select your activity package, and distribute access credentials. The platform handles everything else automatically." },
  { icon: MonitorPlay, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", title: "No IT Required, Just Open and Play", desc: "Zoventro runs entirely in the browser. No app installations, no infrastructure, no IT tickets — just open and participate." },
  { icon: ShieldCheck, color: "text-white", bg: "bg-white/20", title: "Secure and Time-Bound Access", desc: "Each package generates unique access credentials per participant. All access expires automatically after 5 days. No data is retained beyond the activity window.", featured: false },
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
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#100720]">
          <img src={hero} alt="" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#170B2F]/90 via-[#170B2F]/40 to-transparent" />
          <Header floating />
          <div className="relative px-6 md:px-14 pt-44 pb-32 max-w-3xl">
            <h1 className="text-[52px] md:text-[64px] font-extrabold text-white leading-[1.1] tracking-tight">
              Turn Teams Activities <br className="hidden md:block" />
              Into Interactive <br className="hidden md:block" />
              Experiences
            </h1>
            <p className="mt-6 text-white/80 text-base md:text-lg whitespace-nowrap">
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
                className={`rounded-[2rem] p-8 text-center shadow-card border transition-all duration-300 group ${
                  featured 
                    ? "bg-gradient-primary text-white border-transparent shadow-elevated hover:-translate-y-1 hover:shadow-glow" 
                    : "bg-card text-foreground border-border hover:bg-gradient-primary hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-glow"
                }`}
              >
                <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  featured 
                    ? "border border-white/20 bg-white/10" 
                    : `${f.bg} group-hover:border group-hover:border-white/20 group-hover:bg-white/10`
                }`}>
                  <f.icon className={`h-7 w-7 transition-colors duration-300 ${
                    featured 
                      ? "text-white" 
                      : `${f.color} group-hover:text-white`
                  }`} />
                </div>
                
                <h3 className={`mt-6 font-bold text-[20px] leading-tight transition-colors duration-300 ${
                  featured 
                    ? "text-white" 
                    : "text-foreground group-hover:text-white"
                }`}>
                  {f.title}
                </h3>
                
                <p className={`mt-3.5 text-[13px] leading-relaxed transition-colors duration-300 ${
                  featured 
                    ? "text-white/90" 
                    : "text-muted-foreground group-hover:text-white/90"
                }`}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ACTIVITIES */}
      <section id="activities" className="px-4 mt-24">
        <div className="mx-auto max-w-[1320px] rounded-[3rem] bg-gradient-soft p-10 md:p-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Explore Interactive Experiences</h2>
            <p className="mt-3 text-muted-foreground">Designed to engage people, spark thinking, and create memorable moments.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
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
        <div className="mx-auto max-w-[1320px] text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Choose Your Package</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Packages are non-refundable once activated, as access is delivered digitally and instantly upon payment.</p>
        </div>
        <div className="mx-auto max-w-[1320px] mt-12 grid gap-8 md:grid-cols-3">
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
        <div className="relative mx-auto max-w-6xl overflow-hidden bg-[#0d0820] rounded-[2rem] min-h-[340px] grid place-items-center text-center px-6">
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
    .replace(/<ul[^>]*>/gi, '<ul class="list-disc pl-5 space-y-1.5 text-[13px] md:text-sm text-white/90 mt-3 mb-4">')
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
    <div className="relative overflow-hidden rounded-[2.5rem] min-h-[480px] shadow-elevated group flex flex-col justify-between">
      <img
        src={image}
        alt={game.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div
        className={`absolute inset-0 ${
          accent === "warm" 
            ? "bg-gradient-to-b from-orange-950/95 via-orange-950/70 to-orange-900/30" 
            : "bg-gradient-to-b from-[#0F0826]/95 via-[#0F0826]/70 to-[#0F0826]/30"
        }`}
      />
      
      <div className="relative flex flex-col p-8 md:p-10 text-white h-full z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Badge */}
          {iconImage ? (
            <img
              src={iconImage}
              alt={`${game.title} badge`}
              className="w-28 h-28 md:w-[140px] md:h-[140px] object-contain drop-shadow-2xl shrink-0"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shadow-md backdrop-blur-sm shrink-0">
              <Icon className="h-10 w-10 text-white" />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-3xl md:text-[36px] font-bold tracking-tight leading-tight">{game.title}</h3>
            
            <div className="mt-4 flex-1">
              {hasHtml ? (
                <div
                  className="text-[14px] md:text-[15px] text-white/90 leading-relaxed prose prose-invert max-w-none prose-li:text-white/90 prose-ul:my-2"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <>
                  <p className="text-[14px] md:text-[15px] text-white/90 leading-relaxed">{summary}</p>
                  {bullets.length > 0 && (
                    <ul className="mt-4 list-disc pl-5 space-y-2 text-[14px] md:text-[15px] text-white/90">
                      {bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {closingText && (
                    <p className="mt-5 text-[14px] md:text-[15px] text-white/90 leading-relaxed">{closingText}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 flex justify-center mt-auto">
          <Link
            to="/create"
            search={{ activity: game.slug }}
            className="inline-flex items-center justify-center rounded-full border border-white/80 px-10 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black backdrop-blur-sm"
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
      className={`relative rounded-[2.5rem] p-8 lg:p-10 shadow-card bg-card border transition-all duration-300 ${
        popular ? "border-transparent shadow-elevated ring-1 ring-primary/20" : "border-border hover:border-primary/20 hover:shadow-elevated"
      }`}
    >
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-gradient-blue text-white text-[11px] font-medium tracking-wide px-4 py-1.5 shadow-sm">
          Most Popular
        </div>
      )}
      <h3 className="font-bold text-[26px] text-foreground">{plan.name}</h3>
      {bestFor && (
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">Best for: {bestFor}</p>
      )}

      <div className="mt-7 flex items-start justify-between min-h-[52px]">
        <div>
          <span className="text-[44px] font-extrabold text-foreground tracking-tight leading-none">{formatPrice(plan.price)}</span>
          {perUser && (
            <p className="text-[13px] text-muted-foreground font-medium mt-1.5">{perUser}</p>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground mt-3 font-medium">One Time<br/>Payment</span>
      </div>

      <div className="mt-8 pt-7 border-t border-border/80">
        <p className="text-[14px] font-medium mb-4 text-foreground/80">This plan includes:</p>
        <ul className="space-y-4">
          {features.map((inc) => (
            <li key={inc} className="flex items-start gap-3 text-[14px]">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" strokeWidth={2.5} />
              <span className="text-foreground/90 leading-snug">{inc}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/create"
        search={{ activity: undefined }}
        className={`mt-10 w-full inline-flex items-center justify-between rounded-full pl-6 pr-1.5 py-1.5 text-[15px] font-medium border transition-all duration-300 group cursor-pointer ${
          popular 
            ? "border-transparent bg-gradient-blue text-white hover:opacity-90 hover:shadow-md" 
            : "border-border bg-white text-foreground hover:bg-gradient-blue hover:text-white hover:border-transparent hover:shadow-md"
        }`}
      >
        Pay &amp; Activate
        <span className={`grid h-9 w-9 place-items-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 ${
          popular
            ? "bg-white text-[#8B5CF6]"
            : "bg-purple-100 text-[#8B5CF6] group-hover:bg-white"
        }`}>
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
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

        {/* Bottom part: Metrics and Donut chart side-by-side */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch mt-2">
          {/* Metrics + Recommended */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 flex flex-col justify-between gap-5">
            <div>
              <h4 className="font-bold text-sm text-foreground mb-4">See your cost per employee</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50/50 rounded-xl p-3 text-center border border-purple-100 flex flex-col justify-center">
                  <span className="text-lg md:text-xl font-bold text-primary">₹{data.costPerEmployee}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 leading-tight">
                    Cost per<br />employee
                  </span>
                </div>
                <div className="bg-purple-50/50 rounded-xl p-3 text-center border border-purple-100 flex flex-col justify-center">
                  <span className="text-lg md:text-xl font-bold text-primary">₹{data.totalCost.toLocaleString("en-IN")}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 leading-tight">
                    Total package<br />cost
                  </span>
                </div>
                <div className="bg-purple-50/50 rounded-xl p-3 text-center border border-purple-100 flex flex-col justify-center">
                  <span className="text-lg md:text-xl font-bold text-primary">{data.groups}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 leading-tight">
                    Groups<br />auto-formed
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Recommended:
                </span>
                <span className="inline-flex bg-gradient-primary text-white font-semibold px-3 py-1 rounded-full text-xs shadow-sm mt-1.5">
                  {data.name}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground max-w-[120px] leading-relaxed text-right">
                Zoventro is up to 5x more cost-effective
              </p>
            </div>
          </div>

          {/* Donut chart card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Donut chart */}
            <div
              className="w-28 h-28 rounded-full relative flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background: `conic-gradient(
                  #8B5CF6 0% 15%, 
                  #10B981 15% 45%, 
                  #EC4899 45% 80%, 
                  #F59E0B 80% 100%
                )`,
              }}
            >
              <div className="w-16 h-16 rounded-full bg-white absolute flex items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center leading-tight">
                  Cost
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-y-3 gap-x-4">
              <div className="flex items-start gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#8B5CF6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">Zoventro</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">₹{data.totalCost.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">Facilitator-led</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">₹23,000</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#EC4899] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">Team Lunch</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">₹35,000</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-none">DIY Activities</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">₹17,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
