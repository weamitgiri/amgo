import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, User, Mail, Calendar, Clock, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Crumbs } from "@/components/Crumbs";
import { participantService } from "@/api/services/participant.service";
import type { JoinLinkResponse } from "@/api/types/participant";
import { saveParticipantSession } from "@/lib/participant-session";
import { toastError, toastInfo, toastSuccess } from "@/lib/toast";
import mystery from "@/assets/mystery.jpg";

export const Route = createFileRoute("/join/$linkToken")({
  head: () => ({ meta: [{ title: "Join Activity — Zoventro" }] }),
  component: JoinPage,
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatScheduleLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function applyJoinLinkData(
  data: JoinLinkResponse,
  setters: {
    setBookingId: (id: number | null) => void;
    setActivityTitle: (v: string) => void;
    setActivityDescription: (v: string) => void;
    setOrganizerName: (v: string) => void;
    setOrganizerCompany: (v: string) => void;
    setActivitySlug: (v: string) => void;
    setScheduledDate: (v: string) => void;
    setScheduledTime: (v: string) => void;
    setScheduleStart: (v: Date | null) => void;
    setRegistrationOpensAt: (v: string) => void;
    setStep: (s: "pending" | "form") => void;
  }
): "pending" | "form" {
  const start = new Date(data.schedule_start);
  setters.setBookingId(Number(data.booking_id));
  setters.setActivityTitle(data.activity_title || "Activity");
  setters.setActivityDescription(
    data.activity_description ? stripHtml(String(data.activity_description)) : ""
  );
  setters.setOrganizerName(data.organizer_name || "");
  setters.setOrganizerCompany(data.organizer_company || "");
  setters.setActivitySlug(data.activity_slug || "");
  setters.setScheduleStart(Number.isNaN(start.getTime()) ? null : start);
  setters.setRegistrationOpensAt(formatScheduleLabel(data.schedule_start));
  setters.setScheduledDate(
    Number.isNaN(start.getTime())
      ? String(data.scheduled_date)
      : start.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
  );
  setters.setScheduledTime(
    Number.isNaN(start.getTime())
      ? String(data.scheduled_time)
      : start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })
  );

  const nextStep = resolveJoinStep(data);
  setters.setStep(nextStep);
  return nextStep;
}

/** Prefer API flags; fall back to client clock when server still reports pending. */
function resolveJoinStep(data: JoinLinkResponse): "pending" | "form" {
  if (data.is_join) return "form";
  if (data.is_pending) {
    const start = new Date(data.schedule_start);
    if (!Number.isNaN(start.getTime()) && Date.now() >= start.getTime()) {
      return "form";
    }
    return "pending";
  }
  return "pending";
}

function JoinPage() {
  const navigate = useNavigate();
  const { linkToken } = Route.useParams();
  const [step, setStep] = useState<"loading" | "invalid" | "pending" | "form" | "otp" | "done">("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [activityTitle, setActivityTitle] = useState("Mystery Quest");
  const [activityDescription, setActivityDescription] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerCompany, setOrganizerCompany] = useState("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [registrationOpensAt, setRegistrationOpensAt] = useState("");
  const [activitySlug, setActivitySlug] = useState("");
  const [scheduleStart, setScheduleStart] = useState<Date | null>(null);
  const [linkError, setLinkError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joinedInfo, setJoinedInfo] = useState<{ group_id: number; group_name: string; name: string } | null>(null);

  const joinLinkSetters = {
    setBookingId,
    setActivityTitle,
    setActivityDescription,
    setOrganizerName,
    setOrganizerCompany,
    setActivitySlug,
    setScheduledDate,
    setScheduledTime,
    setScheduleStart,
    setRegistrationOpensAt,
    setStep,
  };

  const loadJoinLink = (token: string, silent = false) => {
    if (!silent) setStep("loading");

    return participantService
      .getJoinLink(token)
      .then((data) => applyJoinLinkData(data, joinLinkSetters))
      .catch((error) => {
        const status = (error as { status?: number })?.status;
        if (status === 404) {
          setLinkError(
            "We could not find an activity for this join link. Please check the link or contact the organizer."
          );
        } else {
          const message =
            error instanceof Error ? error.message : "Invitation link has expired or is invalid.";
          setLinkError(message);
        }
        setStep("invalid");
        return null;
      });
  };

  const handleRefreshStatus = async () => {
    if (!linkToken || isRefreshing) return;

    setIsRefreshing(true);
    try {
      const data = await participantService.getJoinLink(linkToken);
      const nextStep = applyJoinLinkData(data, joinLinkSetters);

      if (nextStep === "form") {
        toastSuccess("Registration is now open. You can join below.");
      } else {
        toastInfo(`Still waiting. Registration opens at ${formatScheduleLabel(data.schedule_start)}.`);
      }
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (status === 404) {
        setLinkError(
          "We could not find an activity for this join link. Please check the link or contact the organizer."
        );
      } else {
        const message =
          error instanceof Error ? error.message : "Unable to refresh status. Please try again.";
        toastError(message);
        setLinkError(message);
      }
      setStep("invalid");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!linkToken) {
      setLinkError("Invitation link is missing or invalid.");
      setStep("invalid");
      return;
    }
    loadJoinLink(linkToken);
  }, [linkToken]);

  useEffect(() => {
    if (step !== "pending" || !linkToken) return;

    const interval = setInterval(() => {
      participantService
        .getJoinLink(linkToken)
        .then((data) => {
          const nextStep = applyJoinLinkData(data, joinLinkSetters);
          if (nextStep === "form") {
            toastSuccess("Registration is now open. You can join below.");
          }
        })
        .catch(() => {
          /* keep showing pending until window ends */
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [step, linkToken]);

  const canSendOtp = name.trim().length > 0 && email.includes("@");
  const otpCode = otpValues.join("");

  const handleSendOtp = () => {
    if (!bookingId) {
      toastError("Session is not ready. Please refresh the page and try again.");
      return;
    }
    if (!name.trim()) {
      toastError("Name is required.");
      return;
    }
    if (!email.includes("@")) {
      toastError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    participantService
      .join({ booking_id: bookingId, name: name.trim(), email: email.trim() })
      .then((data) => {
        toastSuccess("Verification code sent to your email.");
        if (import.meta.env.DEV && data && "dev_otp" in data && data.dev_otp) {
          toastInfo(`Dev mode: use OTP ${data.dev_otp}`);
        }
        setStep("otp");
      })
      .catch((error) => {
        toastError(error?.message || "Unable to send verification code.");
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleVerifyOtp = () => {
    if (!bookingId) return;
    if (otpCode.length !== 6) {
      toastError("Please enter the 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    participantService
      .verifyOtp({
        booking_id: bookingId,
        email: email.trim(),
        otp: otpCode,
      })
      .then(async (response) => {
        setJoinedInfo({
          group_id: response.group_id,
          group_name: response.group_name,
          name: response.name,
        });
        const slug = activitySlug || "detective-mystery";
        saveParticipantSession({
          groupId: response.group_id,
          participantId: response.participant_id,
          name: response.name,
          joinToken: response.join_token,
          inviteUrl: linkToken,
          gameSlug: slug,
        });
        setStep("done");
        toastSuccess("Verified successfully. Entering the lobby...");
        setTimeout(
          () =>
            navigate({
              to: "/lobby",
              search: { invite_url: linkToken, game: slug },
            }),
          1200
        );
      })
      .catch((error) => {
        toastError(error?.message || "OTP verification failed.");
      })
      .finally(() => setIsSubmitting(false));
  };

  const updateOtpValue = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);
  };

  return (
    <div className="min-h-screen bg-gradient-hero text-white relative overflow-hidden">
      {/* glow blobs */}
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-purple-500/30 blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl" />

      <header className="relative px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Crumbs
          tone="dark"
          items={[
            { label: "Home", to: "/" },
            { label: "Join Activity" },
            {
              label:
                step === "loading"
                  ? "Validating Link"
                  : step === "invalid"
                  ? "Activity Not Found"
                  : step === "form"
                  ? "Details"
                  : step === "otp"
                  ? "Verify OTP"
                  : "Verified",
            },
          ]}
        />
        <Logo />
      </header>

      <main className="relative px-4 pb-16">
        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2">
          {/* LEFT — quest info */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-elevated">
            <img
              src={mystery}
              alt="Mystery Quest"
              className="w-full h-56 object-cover rounded-2xl ring-1 ring-white/10"
            />
            <h1 className="mt-6 text-3xl font-bold leading-tight">
              {activityTitle}
            </h1>
            <p className="mt-3 text-sm text-white/70">
              {activityDescription ||
                "A story-driven team challenge where employees collaborate, question, and compete to solve the case."}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/85">
              <li>• Role-based gameplay (Investigator, Culprit, Witness, and more)</li>
              <li>• Real-time questioning and deduction</li>
              <li>• Time-bound challenges to maintain urgency</li>
              <li>• Built for communication and strategic thinking</li>
            </ul>
            <p className="mt-5 text-sm text-white/70">
              Builds stronger communication, sharper thinking, and real team collaboration in a high-energy environment.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-white/95 text-foreground p-4">
              <Meta icon={User} label="Organizer" v1={organizerName || "—"} v2={organizerCompany || ""} />
              <Meta icon={Calendar} label="Date" v1={scheduledDate || "TBA"} v2="" />
              <Meta icon={Clock} label="Start Time" v1={scheduledTime || "TBA"} v2="" />
            </div>
          </div>

          {/* RIGHT — form / otp */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-elevated min-h-[560px] flex flex-col">
            {step === "loading" && <LoadingStep />}
            {step === "invalid" && <ActivityNotFoundStep message={linkError} />}
            {step === "pending" && (
              <PendingStep
                activityTitle={activityTitle}
                activityDescription={activityDescription}
                scheduledDate={scheduledDate}
                scheduledTime={scheduledTime}
                registrationOpensAt={registrationOpensAt}
                isRefreshing={isRefreshing}
                onRefresh={handleRefreshStatus}
              />
            )}
            {step === "form" && (
              <FormStep
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                onNext={handleSendOtp}
                canProceed={canSendOtp}
                isSubmitting={isSubmitting}
                activityTitle={activityTitle}
              />
            )}
            {step === "otp" && (
              <OtpStep
                email={email}
                values={otpValues}
                onUpdate={updateOtpValue}
                onBack={() => setStep("form")}
                onVerify={handleVerifyOtp}
                onResend={handleSendOtp}
                isSubmitting={isSubmitting}
              />
            )}
            {step === "done" && (
              <DoneStep
                name={joinedInfo?.name ?? name}
                linkToken={linkToken}
                activitySlug={activitySlug}
              />
            )}

            <div className="mt-auto pt-6 flex items-center gap-2 text-[11px] text-white/55">
              <Lock className="h-3.5 w-3.5" />
              Secure. Your details are protected & will be deleted after the event.
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-white/55">
          Powered by <span className="text-white">Zoventro</span> · © 2026 zoventro.com All Rights Reserved
        </p>
      </main>
    </div>
  );
}

function LoadingStep() {
  return (
    <div className="flex-1 grid place-items-center text-center">
      <div>
        <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-white/10 animate-pulse">
          <ArrowRight className="h-8 w-8 text-white/70" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Validating your invitation...</h2>
        <p className="mt-3 text-sm text-white/70 max-w-sm mx-auto">
          Checking the invite link. If the link is valid, you can enter your details and join the game.
        </p>
      </div>
    </div>
  );
}

function ActivityNotFoundStep({ message }: { message: string }) {
  return (
    <div className="flex-1 grid place-items-center text-center">
      <div>
        <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-red-500/20">
          <Lock className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Activity not found</h2>
        <p className="mt-3 text-sm text-white/70 max-w-sm mx-auto">{message || "This activity could not be found. Please check your join link or contact the organizer."}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function PendingStep({
  activityTitle,
  activityDescription,
  scheduledDate,
  scheduledTime,
  registrationOpensAt,
  isRefreshing,
  onRefresh,
}: {
  activityTitle: string;
  activityDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  registrationOpensAt: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <>
      <div className="text-xs uppercase tracking-widest text-white/60">You're invited to</div>
      <h2 className="mt-1 text-3xl font-bold">{activityTitle}</h2>
      {activityDescription ? (
        <p className="mt-2 text-sm text-white/70">{activityDescription}</p>
      ) : null}

      <div className="mt-8 rounded-3xl bg-white/10 p-6 text-left text-white/85">
        <div className="text-sm font-semibold text-white">Event Schedule</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Meta icon={Calendar} label="Date" v1={scheduledDate || "TBA"} v2="" />
          <Meta icon={Clock} label="Start Time" v1={scheduledTime || "TBA"} v2="" />
        </div>
        <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/80">
          This activity has not started yet. Registration will open at{" "}
          <span className="font-semibold text-white">{registrationOpensAt}</span>.
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`mt-8 self-start inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition ${
          isRefreshing
            ? "bg-white/5 cursor-wait opacity-70"
            : "bg-white/10 hover:bg-white/15"
        }`}
      >
        {isRefreshing ? "Checking…" : "Refresh Status"}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
          <ArrowRight className={`h-4 w-4 ${isRefreshing ? "animate-pulse" : ""}`} />
        </span>
      </button>
    </>
  );
}

function FormStep({
  name,
  setName,
  email,
  setEmail,
  onNext,
  canProceed,
  isSubmitting,
  activityTitle,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  onNext: () => void;
  canProceed: boolean;
  isSubmitting: boolean;
  activityTitle: string;
}) {
  return (
    <>
      <div className="text-xs uppercase tracking-widest text-white/60">You're invited to</div>
      <h2 className="mt-1 text-3xl font-bold">{activityTitle}</h2>
      <p className="mt-2 text-sm text-white/70">
        A story-driven team challenge where employees collaborate, question, and compete to solve the case.
      </p>

      <h3 className="mt-7 text-lg font-bold">Join the Game</h3>
      <p className="text-xs text-white/60">Enter your details to join the event and receive your verification code.</p>

      <div className="mt-5 space-y-4">
        <Field icon={User} label="Full Name" placeholder="Enter your full name" value={name} onChange={setName} />
        <Field
          icon={Mail}
          label="Email Address"
          hint="An OTP will be sent to this email for verification"
          placeholder="Enter your email address"
          value={email}
          onChange={setEmail}
          type="email"
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={`mt-6 self-start inline-flex items-center gap-2 rounded-full pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow transition ${
          canProceed && !isSubmitting
            ? "bg-gradient-primary text-white hover:opacity-90"
            : "bg-white/15 text-white/60 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "Sending…" : "Send Verification Code"}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20"><ArrowRight className="h-4 w-4" /></span>
      </button>
    </>
  );
}

function OtpStep({
  email,
  values,
  onUpdate,
  onBack,
  onVerify,
  onResend,
  isSubmitting,
}: {
  email: string;
  values: string[];
  onUpdate: (index: number, value: string) => void;
  onBack: () => void;
  onVerify: () => void;
  onResend: () => void;
  isSubmitting: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const filled = values.every(Boolean);

  return (
    <>
      <button
        onClick={onBack}
        className="self-start inline-flex items-center gap-2 text-xs text-white/80 bg-white/10 rounded-full px-3 py-1.5 hover:bg-white/15"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Go Back
      </button>

      <h2 className="mt-6 text-3xl font-bold">Verify Your Email</h2>
      <p className="mt-2 text-sm text-white/70">Enter the OTP sent to your email to continue.</p>

      <p className="mt-6 text-xs text-white/65">
        We have sent a 6-digit code to your email{' '}
        <span className="text-white font-medium">{email || 'you@company.com'}</span>
      </p>

      <div className="mt-4 flex gap-2.5">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            value={value}
            onChange={(e) => {
              const nextValue = e.target.value.replace(/\D/g, "").slice(-1);
              onUpdate(index, nextValue);
              if (nextValue && index < values.length - 1) {
                refs.current[index + 1]?.focus();
              }
              if (!nextValue && index > 0) {
                refs.current[index - 1]?.focus();
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="h-14 w-14 rounded-3xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-white outline-none transition focus:border-primary focus:bg-white/10"
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-white/55">
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={isSubmitting}
          className="text-primary font-medium disabled:opacity-50"
        >
          Resend
        </button>
      </p>

      <button
        type="button"
        onClick={onVerify}
        disabled={!filled || isSubmitting}
        className={`mt-6 self-start inline-flex items-center gap-2 rounded-full pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow transition ${
          filled && !isSubmitting
            ? "bg-gradient-primary text-white hover:opacity-90"
            : "bg-white/15 text-white/60 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? 'Verifying…' : 'Verify & Proceed'}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20"><ArrowRight className="h-4 w-4" /></span>
      </button>
    </>
  );
}

function DoneStep({
  name,
  linkToken,
  activitySlug,
}: {
  name: string;
  linkToken: string;
  activitySlug: string;
}) {
  return (
    <div className="flex-1 grid place-items-center text-center">
      <div>
        <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-gradient-primary shadow-glow">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Welcome{name ? `, ${name.split(' ')[0]}` : ''}!</h2>
        <p className="mt-2 text-sm text-white/70 max-w-xs mx-auto">
          You're verified and assigned to your group. Sit tight — the mystery begins shortly.
        </p>
        <Link
          to="/lobby"
          search={{
            invite_url: linkToken,
            game: activitySlug || "detective-mystery",
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow"
        >
          Enter Lobby
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20"><ArrowRight className="h-4 w-4" /></span>
        </Link>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, hint, placeholder, value, onChange, type = "text",
}: { icon: any; label: string; hint?: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="block text-[11px] text-white/55 mt-0.5">{hint}</span>}
      <div className="mt-2 relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-white/5 border border-white/15 pl-4 pr-11 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <Icon className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
      </div>
    </label>
  );
}

function Meta({ icon: Icon, label, v1, v2 }: { icon: any; label: string; v1: string; v2: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{v1}</div>
      <div className="text-[11px] text-muted-foreground">{v2}</div>
    </div>
  );
}
