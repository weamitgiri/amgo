import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, User, Mail, Calendar, Clock, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { participantService } from "@/api/services/participant.service";
import type { JoinLinkResponse } from "@/api/types/participant";
import { saveParticipantSession } from "@/lib/participant-session";
import { toastError, toastInfo, toastSuccess } from "@/lib/toast";
import mystery from "@/assets/mystery.jpg";
import cooka from "@/assets/cook.jpg";
import cook from "@/assets/cookandcreate/game-2-lobby-bg-expanded.jpg";
import mqlogo from "@/assets/mqlogo.png";
import cclogo from "@/assets/cookandcreate/Cook  and Create Logo.png";
import heroBg from "@/assets/hero-bg-home.jpg";
import { resolveMediaUrl } from "@/utils/media";
import { resolveLobbyRoute, isCookAndCreateSlug } from "@/utils/common";
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
    setActivityIcon: (v: string | null) => void;
    setActivityCover: (v: string | null) => void;
    setOrganizerName: (v: string) => void;
    setOrganizerCompany: (v: string) => void;
    setActivitySlug: (v: string) => void;
    setScheduledDate: (v: string) => void;
    setScheduledDateDay: (v: string) => void;
    setScheduledTime: (v: string) => void;
    setScheduledTimezone: (v: string) => void;
    setScheduleStart: (v: Date | null) => void;
    setRegistrationOpensAt: (v: string) => void;
    setStep: (s: "pending" | "form") => void;
  }
): "pending" | "form" {
  const start = new Date(data.schedule_start);
  setters.setBookingId(Number(data.booking_id));
  setters.setActivityTitle(data.activity_title || "Activity");
  setters.setActivityDescription(data.activity_description || "");
  setters.setActivityIcon(data.activity_icon || null);
  setters.setActivityCover(data.activity_cover_image || null);
  setters.setOrganizerName(data.organizer_name || "");
  setters.setOrganizerCompany(data.organizer_company || "");
  setters.setActivitySlug(data.activity_slug || "");
  setters.setScheduleStart(Number.isNaN(start.getTime()) ? null : start);
  setters.setRegistrationOpensAt(formatScheduleLabel(data.schedule_start));
  setters.setScheduledDate(
    Number.isNaN(start.getTime())
      ? String(data.scheduled_date)
      : start.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
  );
  setters.setScheduledDateDay(
    Number.isNaN(start.getTime())
      ? ""
      : `(${start.toLocaleDateString(undefined, { weekday: "long" })})`
  );
  setters.setScheduledTime(
    Number.isNaN(start.getTime())
      ? String(data.scheduled_time)
      : start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })
  );
  setters.setScheduledTimezone(
    Number.isNaN(start.getTime())
      ? ""
      : `(${start.toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop()})`
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
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [activityTitle, setActivityTitle] = useState("Mystery Quest");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityIcon, setActivityIcon] = useState<string | null>(null);
  const [activityCover, setActivityCover] = useState<string | null>(null);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerCompany, setOrganizerCompany] = useState("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledDateDay, setScheduledDateDay] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [scheduledTimezone, setScheduledTimezone] = useState<string>("");
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
    setActivityIcon,
    setActivityCover,
    setOrganizerName,
    setOrganizerCompany,
    setActivitySlug,
    setScheduledDate,
    setScheduledDateDay,
    setScheduledTime,
    setScheduledTimezone,
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

  const canSendOtp = name.trim().length > 0 && email.includes("@") && disclaimerAccepted;
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
        const lobby = resolveLobbyRoute(slug);
        setTimeout(
          () =>
            navigate({
              to: lobby.to,
              search: { ...lobby.search, invite_url: linkToken },
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
    <div className="min-h-screen text-white relative overflow-hidden bg-[#0a0715]">
      {/* Background Image */}
      <img src={heroBg} alt="" className="absolute h-full w-full" />
      <div className="absolute bg-gradient-to-br from-[#0a0715]/90 via-[#0a0715]/70 to-[#0a0715]/90" />

      <header className="relative px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        {/*<Logo />*/}
      </header>

      <main className="relative px-4 pb-16">
        <div className="mx-auto max-w-[1240px] grid gap-8 lg:grid-cols-2">
          {/* LEFT — quest info */}
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-elevated flex flex-col min-h-[640px]">
            {/* Background Image & Overlays */}
            <img
              src={activityCover ? (resolveMediaUrl(activityCover) ?? undefined) : (isCookAndCreateSlug(activitySlug) ? cook : mystery)}
              alt={activityTitle}
              className="absolute  h-full w-full"
            />
            <div className="absolute bg-gradient-to-r from-[#0a0715] via-[#0a0715]/70 to-transparent" />
            <div className="absolute inset-0 bg-black/30" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <img
                  src={activityIcon ? (resolveMediaUrl(activityIcon) ?? undefined) : (isCookAndCreateSlug(activitySlug) ? cclogo : mqlogo)}
                  alt="Logo"
                  className="w-40 md:w-48 object-contain drop-shadow-2xl"
                />
                <div className="flex-1 pt-2">
                  <h1 className="text-3xl font-bold leading-tight drop-shadow-md">
                    {isCookAndCreateSlug(activitySlug) ? (
                      <>Ready to cook up<br />some chaos?</>
                    ) : (
                      <>Are you ready to<br />solve the mystery?</>
                    )}
                  </h1>

                  <div className="mt-4 space-y-4 text-[13.5px] text-white/90 leading-relaxed max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-2 [&_li]:marker:text-white/40">
                    {activityDescription ? (
                      <div dangerouslySetInnerHTML={{ __html: activityDescription }} />
                    ) : isCookAndCreateSlug(activitySlug) ? (
                      <>
                        <p>
                          Work together to cook up the best dish — while one hidden impostor secretly tries to sabotage it.
                        </p>
                        <ul className="pl-4 list-disc marker:text-white/40 space-y-2">
                          <li>Vote on ingredients, submit cooking steps, and vote out the impostor</li>
                          <li>Every action is anonymous — watch for suspicious patterns</li>
                          <li>Time-bound rounds to keep the energy up</li>
                          <li>Built for creativity and quick team thinking</li>
                        </ul>
                        <p>
                          A fast, funny team-building challenge that rewards collaboration and sharp observation.
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          A story-driven team challenge where employees collaborate, question, and compete to solve the case.
                        </p>
                        <ul className="pl-4 list-disc marker:text-white/40 space-y-2">
                          <li>Role-based gameplay (Investigator, Culprit, Witness, and more)</li>
                          <li>Real-time questioning and deduction</li>
                          <li>Time-bound challenges to maintain urgency</li>
                          <li>Built for communication and strategic thinking</li>
                        </ul>
                        <p>
                          Builds stronger communication, sharper thinking, and real team collaboration in a high-energy environment.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="mt-auto pt-10">
                <div className="grid grid-cols-3 rounded-[24px] bg-white text-foreground p-5 shadow-2xl">
                  <div className="px-3">
                    <Meta icon={User} label="Organizer" v1={organizerName || "—"} v2={organizerCompany || ""} />
                  </div>
                  <div className="px-5 border-l border-black/10">
                    <Meta icon={Calendar} label="Date" v1={scheduledDate || "TBA"} v2={scheduledDateDay} />
                  </div>
                  <div className="px-5 border-l border-black/10">
                    <Meta icon={Clock} label="Start Time" v1={scheduledTime || "TBA"} v2={scheduledTimezone} />
                  </div>
                </div>
              </div>
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
                scheduledDateDay={scheduledDateDay}
                scheduledTime={scheduledTime}
                scheduledTimezone={scheduledTimezone}
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
                disclaimerAccepted={disclaimerAccepted}
                setDisclaimerAccepted={setDisclaimerAccepted}
                onNext={handleSendOtp}
                canProceed={name.trim().length > 0 && email.includes("@")}
                isSubmitting={isSubmitting}
                activityTitle={activityTitle}
                activityDescription={activityDescription}
                activitySlug={activitySlug}
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
  scheduledDateDay,
  scheduledTime,
  scheduledTimezone,
  registrationOpensAt,
  isRefreshing,
  onRefresh,
}: {
  activityTitle: string;
  activityDescription: string;
  scheduledDate: string;
  scheduledDateDay: string;
  scheduledTime: string;
  scheduledTimezone: string;
  registrationOpensAt: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <>
      <div className="text-[15px] text-white/90 mb-1">You're invited to</div>
      <h2 className="text-3xl font-bold md:text-[40px] tracking-tight">{activityTitle}</h2>
      {activityDescription ? (
        <div className="mt-3 text-[14px] text-white/80 leading-relaxed max-w-none line-clamp-3 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:marker:text-white/40" dangerouslySetInnerHTML={{ __html: activityDescription }} />
      ) : null}

      <div className="mt-8 rounded-3xl bg-white/10 p-6 text-left text-white/85">
        <div className="text-sm font-semibold text-white">Event Schedule</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Meta icon={Calendar} label="Date" v1={scheduledDate || "TBA"} v2={scheduledDateDay} />
          <Meta icon={Clock} label="Start Time" v1={scheduledTime || "TBA"} v2={scheduledTimezone} />
        </div>
        <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/80">
          The game is not scheduled today. Please join at the right date and time. Please contact the organiser.
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
  disclaimerAccepted,
  setDisclaimerAccepted,
  onNext,
  canProceed,
  isSubmitting,
  activityTitle,
  activityDescription,
  activitySlug,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  disclaimerAccepted: boolean;
  setDisclaimerAccepted: (v: boolean) => void;
  onNext: () => void;
  canProceed: boolean;
  isSubmitting: boolean;
  activityTitle: string;
  activityDescription: string;
  activitySlug: string;
}) {
  return (
    <>
      <div className="text-[15px] text-white/90 mb-1">You're invited to</div>
      <h2 className="text-3xl font-bold md:text-[40px] tracking-tight">{activityTitle}</h2>

      {activityDescription ? (
        <div className="mt-3 text-[14px] text-white/80 leading-relaxed max-w-none line-clamp-3 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:marker:text-white/40" dangerouslySetInnerHTML={{ __html: activityDescription }} />
      ) : (
        <p className="mt-3 text-[14px] text-white/80 leading-relaxed">
          {isCookAndCreateSlug(activitySlug)
            ? "Work together to cook up the best dish while spotting the hidden impostor in your kitchen."
            : "A story-driven team challenge where employees collaborate, question, and compete to solve the case."}
        </p>
      )}

      <h3 className="mt-8 text-[22px] font-bold">Join the Game</h3>
      <p className="mt-1 text-[14px] text-white/80">Enter your details to join the event and get assigned to your group.</p>

      <div className="mt-6 space-y-5">
        <Field icon={User} label="Full Name" placeholder="Enter your full name" value={name} onChange={setName} />
        <Field
          icon={Mail}
          label="Work Email"
          hint="An OTP will be sent to this email for verification"
          placeholder="Enter your work email"
          value={email}
          onChange={setEmail}
          type="email"
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={`mt-8 self-start inline-flex items-center justify-between gap-4 rounded-full pl-6 pr-1.5 py-1.5 text-[15px] font-medium shadow-md transition-all border-0 ${
          canProceed && !isSubmitting
            ? "bg-gradient-blue text-white hover:opacity-90"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "Sending…" : "Send Verification Code"}
        <span className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
          canProceed && !isSubmitting ? "bg-white text-[#8B5CF6]" : "bg-white/10 text-white/40"
        }`}>
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
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
        className="self-start inline-flex items-center gap-3 text-[14px] text-white/90 hover:text-white transition-colors"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#3B82F6]">
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
        </span>
        Go Back
      </button>

      <h2 className="mt-8 text-3xl font-bold md:text-[40px] tracking-tight">Verify Your Email</h2>
      <p className="mt-3 text-[14px] text-white/80">Enter the OTP sent to your email to continue.</p>

      <p className="mt-8 text-[14px] text-white/90">
        We have sent a 6 digit code to your email {email || 'you@company.com'}
      </p>

      <div className="mt-5 flex gap-3">
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
            className={`h-[56px] w-[56px] rounded-[14px] border pl-1 pr-1 text-center text-[22px] font-bold text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary ${
              value ? "bg-[#3B82F6]/20 border-[#3B82F6]/40" : "bg-transparent border-white/20"
            }`}
          />
        ))}
      </div>

      <p className="mt-8 text-[14px] text-white/80">
        Didn't receive code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={isSubmitting}
          className="text-[#F43F5E] hover:text-[#E11D48] transition-colors disabled:opacity-50"
        >
          Resend
        </button>
      </p>

      <button
        type="button"
        onClick={onVerify}
        disabled={!filled || isSubmitting}
        className={`mt-8 self-start inline-flex items-center justify-between gap-4 rounded-full pl-6 pr-1.5 py-1.5 text-[15px] font-medium shadow-md transition-all border-0 ${
          filled && !isSubmitting
            ? "bg-gradient-blue text-white hover:opacity-90"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? 'Verifying…' : 'Verify & Proceed'}
        <span className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
          filled && !isSubmitting ? "bg-white text-[#8B5CF6]" : "bg-white/10 text-white/40"
        }`}>
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
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
      <span className="text-[15px] font-bold text-white">{label}</span>
      {hint && <span className="block text-[11px] text-white/60 mt-0.5">{hint}</span>}
      <div className="mt-2 relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-transparent border border-white/30 pl-4 pr-11 py-3.5 text-[15px] text-white placeholder:text-white/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <Icon className="absolute right-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white/70" strokeWidth={2} />
      </div>
    </label>
  );
}

function Meta({ icon: Icon, label, v1, v2 }: { icon: any; label: string; v1: string; v2: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium">
        <Icon className="h-[18px] w-[18px] text-[#8B5CF6]" strokeWidth={2} /> {label}
      </div>
      <div className="mt-1.5 text-[14px] font-bold text-black">{v1}</div>
      <div className="text-[12px] text-muted-foreground mt-0.5">{v2}</div>
    </div>
  );
}
