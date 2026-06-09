import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, type FormEvent, type ChangeEvent, type ComponentType, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Crumbs } from "@/components/Crumbs";
import { Footer } from "@/components/Footer";
import { PillButton } from "@/components/PillButton";
import { toastSuccess, toastWarning, toastError } from "@/lib/toast";
import { organizerService } from "@/api/services/organizer.service";
import { mapApiFieldErrors, parseApiError } from "@/api/errors";
import {
  normalizeWebsite,
  validateOtpCode,
  validateRegistrationForm,
  type RegistrationFieldErrors,
} from "@/utils/organizer";
import {
  buildJoinUrl,
  calculateBillingTotals,
  formatDisplayDate,
  formatDisplayTime,
  formatPrice,
  normalizeScheduledTime,
  perUserLabel,
  validateBillingForm,
  validateSessionSetup,
  type BillingFieldErrors,
  type SetupFieldErrors,
} from "@/utils/booking";
import type {
  BookingConsents,
  RegistrationFormData,
  SessionSetup,
} from "@/api/types/organizer";
import type { ApiActivity, ApiPackage } from "@/api/types/public";
import { useGames, useGameDetails, usePackages } from "@/hooks/usePublicContent";
import { resolveMediaUrl } from "@/utils/media";
import { isOrganizerAuthenticated } from "@/lib/auth";
import { Check, Mail, User, Copy, MessageCircle, Share2, CheckCircle2, X, Loader2 } from "lucide-react";
import mystery from "@/assets/mystery.jpg";
import cook from "@/assets/cook.jpg";
import hero from "@/assets/hero.jpg";

const FALLBACK_IMAGES = [mystery, cook];

const INDIAN_STATES = [
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Dadra and Nagar Haveli and Daman and Diu", label: "Dadra and Nagar Haveli and Daman and Diu" },
  { value: "Delhi", label: "Delhi" },
  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  { value: "Ladakh", label: "Ladakh" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Puducherry", label: "Puducherry" },
];

/**
 * Create route for organizer registration, session setup, and payment activation.
 * Includes step-by-step form progression with proper loading states and toast messaging.
 */
export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>) => ({
    activity: typeof search.activity === "string" ? search.activity : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create Your Session — Zoventro" },
      { name: "description", content: "Set up your account, choose a package, and start your team engagement experience in minutes." },
      { property: "og:title", content: "Create Your Session — Zoventro" },
    ],
  }),
  component: CreatePage,
});

const STEPS = ["Details", "Verify", "Setup", "Payment"];

const emptyRegistration = (): RegistrationFormData => ({
  name: "",
  email: "",
  company_name: "",
  company_website: "",
  organizer_id: null,
});

const emptySessionSetup = (): SessionSetup => ({
  activityId: null,
  activityTitle: "",
  gameId: null,
  gameTitle: "",
  package: null,
  scheduledDate: "",
  scheduledTime: "",
});

function CreatePage() {
  const { activity: activitySlug } = Route.useSearch();
  const authenticated = isOrganizerAuthenticated();
  const [step, setStep] = useState(() => (authenticated ? 2 : 0));
  const [done, setDone] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [session, setSession] = useState<SessionSetup>(emptySessionSetup);
  const [registration, setRegistration] = useState<RegistrationFormData>(emptyRegistration);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) return;

    setIsAuthLoading(true);
    organizerService
      .getDashboard()
      .then((result) => {
        if (result.organizer) {
          setRegistration((prev) => ({
            ...prev,
            organizer_id: result.organizer.id,
            name: result.organizer.name ?? prev.name,
            email: result.organizer.email ?? prev.email,
            company_name: result.organizer.company_name ?? prev.company_name,
          }));
          setStep(2);
        }
      })
      .catch(() => {
        // If token is invalid or dashboard fetch fails, continue with the normal flow.
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, [authenticated]);

  const SLIDES = [
    { url: hero, alt: "Team Collaborating" },
    { url: mystery, alt: "Mystery Quest Challenge" },
    { url: cook, alt: "Cook & Create Event" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pb-10">
      <div className="pt-6"><Header /></div>
      {/* <div className="mx-auto max-w-6xl px-4 mt-4">
        <Crumbs items={[{ label: "Home", to: "/" }, { label: "Create Session" }]} />
      </div> */}

      <section className="px-4 mt-12">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Create Your Session &amp;<br />Activate Your Activity</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Set up your account, choose a package, and start your team experience in minutes.</p>
        </div>

        {done ? (
          <SuccessCard
            invitationLink={invitationLink}
            onReset={() => {
              setDone(false);
              setStep(authenticated ? 2 : 0);
              setBookingId(null);
              setInvitationLink(null);
              setSession(emptySessionSetup());
              if (!authenticated) {
                setRegistration(emptyRegistration());
              }
            }}
          />
        ) : (
          <div className="mx-auto max-w-6xl mt-12 grid lg:grid-cols-2 gap-8 items-start">
            <div className="rounded-3xl overflow-hidden shadow-elevated min-h-[520px] bg-gradient-soft relative w-full">
              {SLIDES.map((slide, index) => (
                <img
                  key={slide.url}
                  src={slide.url}
                  alt={slide.alt}
                  className={`absolute inset-0 h-full w-full object-cover min-h-[520px] transition-opacity duration-1000 ${
                    index === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              {/* Carousel dots */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-10">
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      index === activeSlide 
                        ? "bg-primary scale-110 shadow-sm" 
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-card shadow-elevated p-8 md:p-10">
              <Stepper step={step} />
              {authenticated && isAuthLoading && (
                <div className="rounded-2xl border border-border bg-muted/50 p-4 mt-6 text-sm text-muted-foreground">
                  Loading your organizer profile so you can continue with another game selection...
                </div>
              )}
              <div className="mt-8">
                {step === 0 && (
                  <DetailsStep
                    registration={registration}
                    setRegistration={setRegistration}
                    onNext={() => setStep(1)}
                  />
                )}
                {step === 1 && (
                  <VerifyStep
                    email={registration.email}
                    onBack={() => setStep(0)}
                    onVerified={(organizerId) => {
                      setRegistration((prev) => ({ ...prev, organizer_id: organizerId }));
                      setStep(2);
                    }}
                  />
                )}
                {step === 2 && (
                  <SetupStep
                    organizerId={registration.organizer_id}
                    initialActivitySlug={activitySlug}
                    session={session}
                    setSession={setSession}
                    onNext={(id) => {
                      setBookingId(id);
                      setStep(3);
                    }}
                  />
                )}
                {step === 3 && (
                  <PaymentStep
                    bookingId={bookingId}
                    session={session}
                    registration={registration}
                    onComplete={(link) => {
                      setInvitationLink(link);
                      setDone(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, i) => {
        const active = i === step;
        const complete = i < step;
        return (
          <div key={label} className="flex-1 flex items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-colors ${
                complete ? "bg-primary/20 text-primary" : active ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
              }`}>
                {complete ? <Check className="h-5 w-5" /> : String(i + 1).padStart(2, "0")}
              </div>
              <span className={`text-xs ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 mb-6 rounded ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  hint,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      <div className="mt-1.5 relative">
        <input
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            error ? "border-destructive" : "border-input"
          }`}
        />
        {Icon && (
          <Icon className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function DetailsStep({
  registration,
  setRegistration,
  onNext,
}: {
  registration: RegistrationFormData;
  setRegistration: Dispatch<SetStateAction<RegistrationFormData>>;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<RegistrationFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof RegistrationFormData, value: string) => {
    setRegistration((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegistrationFieldErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const clientErrors = validateRegistrationForm(registration);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toastWarning("Please fix the errors below.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await organizerService.register({
        name: registration.name.trim(),
        email: registration.email.trim(),
        company_name: registration.company_name.trim(),
        company_website: normalizeWebsite(registration.company_website),
      });
      setRegistration((prev) => ({
        ...prev,
        organizer_id: Number(data.organizer_id),
      }));
      toastSuccess("OTP sent to your email. Please verify to continue.");
      onNext();
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setErrors(mapApiFieldErrors(fieldErrors) as RegistrationFieldErrors);
      toastError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Organizer Details</h2>
      <p className="text-sm text-muted-foreground">
        Provide basic details to set up your team engagement activity.
      </p>
      <Field
        label="Full Name"
        hint="Primary Contact Person"
        icon={User}
        placeholder="Enter your full name"
        value={registration.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
      />
      <Field
        label="Official Email ID"
        hint="An OTP will be sent to this email for verification"
        icon={Mail}
        type="email"
        placeholder="Enter your work email"
        value={registration.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />
      <Field
        label="Company / Organization Name"
        placeholder="Enter Company Name"
        value={registration.company_name}
        onChange={(e) => update("company_name", e.target.value)}
        error={errors.company_name}
      />
      <Field
        label="Company Website"
        placeholder="https://yourcompany.com"
        value={registration.company_website}
        onChange={(e) => update("company_website", e.target.value)}
        error={errors.company_website}
      />
      <PillButton type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit & Verify Email"}
      </PillButton>
      <p className="text-xs text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-semibold">
          Login
        </Link>
      </p>
    </form>
  );
}

function VerifyStep({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: (organizerId: number) => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);

  const otpValue = otp.join("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validateOtpCode(otpValue);
    if (err) {
      setOtpError(err);
      toastWarning(err);
      return;
    }

    setIsVerifying(true);
    try {
      const data = await organizerService.verifyRegistrationOtp({
        email: email.trim(),
        otp: otpValue,
      });
      toastSuccess("Email verified successfully.");
      onVerified(Number(data.organizer_id));
    } catch (err) {
      const { message } = parseApiError(err);
      setOtpError(message);
      toastError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await organizerService.resendOtp({ email: email.trim() });
      toastSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      toastError(parseApiError(err).message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Verify Your Email</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the OTP sent to your email to continue.
        </p>
      </div>
      <p className="text-sm">
        We have sent a 6 digit code to{" "}
        <span className="font-semibold text-primary">{email}</span>
      </p>
      <div className="flex gap-2.5">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              otpInputs.current[i] = el;
            }}
            value={d}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(-1);
              const next = [...otp];
              next[i] = value;
              setOtp(next);
              if (otpError) setOtpError(null);
              if (value && i < otpInputs.current.length - 1) {
                otpInputs.current[i + 1]?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !otp[i] && i > 0) {
                otpInputs.current[i - 1]?.focus();
              }
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
              if (!pasted) return;
              e.preventDefault();
              const nextOtp = [...otp];
              for (let j = 0; j < pasted.length && i + j < nextOtp.length; j += 1) {
                nextOtp[i + j] = pasted[j];
              }
              setOtp(nextOtp);
              const focusIndex = Math.min(i + pasted.length, otpInputs.current.length - 1);
              otpInputs.current[focusIndex]?.focus();
            }}
            inputMode="numeric"
            maxLength={1}
            aria-label={`OTP digit ${i + 1}`}
            className={`h-14 w-14 rounded-lg border-2 text-center text-xl font-bold text-primary focus:border-primary focus:outline-none ${
              otpError ? "border-destructive" : "border-input"
            }`}
          />
        ))}
      </div>
      {otpError && <p className="text-xs text-destructive">{otpError}</p>}
      <p className="text-sm text-muted-foreground">
        Didn't receive code?{" "}
        <button
          type="button"
          disabled={isResending}
          onClick={handleResend}
          className="text-primary font-semibold disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend"}
        </button>{" "}
        ·{" "}
        <button type="button" onClick={onBack} className="text-primary font-semibold">
          Change details
        </button>
      </p>
      <PillButton type="submit" variant="primary" disabled={isVerifying}>
        {isVerifying ? "Verifying..." : "Verify & Continue"}
      </PillButton>
    </form>
  );
}

function SetupStep({
  organizerId,
  initialActivitySlug,
  session,
  setSession,
  onNext,
}: {
  organizerId: number | null;
  initialActivitySlug?: string;
  session: SessionSetup;
  setSession: Dispatch<SetStateAction<SessionSetup>>;
  onNext: (bookingId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<SetupFieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: games, isLoading: gamesLoading } = useGames();
  const { data: packages, isLoading: packagesLoading } = usePackages();
  const { data: gameDetails, isLoading: gameDetailsLoading } = useGameDetails(session.activityId);

  const todayStr = new Date().toISOString().split("T")[0];

  const selectActivity = (activity: ApiActivity) => {
    setSession((prev) => ({
      ...prev,
      activityId: activity.id,
      activityTitle: activity.title,
      gameId: null,
      gameTitle: "",
    }));
    setErrors((prev) => ({ ...prev, activity: undefined, game: undefined }));
  };

  useEffect(() => {
    if (!games?.length || session.activityId) return;
    const match = initialActivitySlug
      ? games.find((g) => g.slug === initialActivitySlug)
      : games[0];
    if (match) selectActivity(match);
  }, [games, initialActivitySlug, session.activityId]);

  useEffect(() => {
    if (!gameDetails?.sub_games?.length) return;
    const first = gameDetails.sub_games[0];
    setSession((prev) => ({
      ...prev,
      gameId: first.id,
      gameTitle: first.title,
    }));
  }, [gameDetails, setSession]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const clientErrors = validateSessionSetup({
      activityId: session.activityId,
      gameId: session.gameId,
      package: session.package,
      scheduledDate: session.scheduledDate,
      scheduledTime: session.scheduledTime,
    });

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toastWarning("Please fix the errors below.");
      return;
    }

    if (!organizerId || !session.activityId || !session.gameId || !session.package) {
      toastError("Missing booking details. Please go back and verify your email.");
      return;
    }

    setIsSaving(true);
    try {
      const data = await organizerService.createBooking({
        organizer_id: organizerId,
        activity_id: session.activityId,
        game_id: session.gameId,
        package_id: session.package.id,
        scheduled_date: session.scheduledDate,
        scheduled_time: normalizeScheduledTime(session.scheduledTime),
      });
      toastSuccess("Session setup saved.");
      onNext(data.booking_id);
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setErrors(mapApiFieldErrors(fieldErrors) as SetupFieldErrors);
      toastError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const activityImage = (game: ApiActivity, index: number) =>
    resolveMediaUrl(game.cover_image) ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Choose Your Activity, Package &amp; Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your activity, team size, and schedule your experience.
        </p>
      </div>

      <div>
        <label className="text-sm font-semibold">Choose your Activity</label>
        {gamesLoading ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading activities...
          </div>
        ) : games?.length ? (
          <div className="mt-2 grid grid-cols-2 gap-3">
            {games.map((activity, index) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => selectActivity(activity)}
                className={`flex items-center justify-between gap-3 rounded-xl border-2 p-2 pl-4 transition ${
                  session.activityId === activity.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                      session.activityId === activity.id ? "border-primary" : "border-muted-foreground"
                    } grid place-items-center`}
                  >
                    {session.activityId === activity.id && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="text-sm font-medium truncate">{activity.title}</span>
                </div>
                <img
                  src={activityImage(activity, index)}
                  alt={activity.title}
                  className="h-10 w-12 rounded-md object-cover shrink-0"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-destructive">No activities available right now.</p>
        )}
        {errors.activity && <p className="mt-1 text-xs text-destructive">{errors.activity}</p>}
        {gameDetailsLoading && session.activityId && (
          <p className="mt-2 text-xs text-muted-foreground">Loading game variant...</p>
        )}
        {session.gameTitle && (
          <p className="mt-2 text-xs text-muted-foreground">
            Selected variant: <span className="font-medium text-foreground">{session.gameTitle}</span>
          </p>
        )}
        {errors.game && <p className="mt-1 text-xs text-destructive">{errors.game}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Choose your Package</label>
          {session.package && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full bg-purple-100 text-primary px-4 py-1 text-xs font-medium"
            >
              Change Package
            </button>
          )}
        </div>
        {session.package ? (
          <div className="mt-2 rounded-xl border-2 border-primary p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold">{session.package.name}</p>
              {session.package.short_description && (
                <p className="text-xs text-muted-foreground mt-1">{session.package.short_description}</p>
              )}
              <p className="mt-2 text-lg font-bold">
                {formatPrice(session.package.price)}{" "}
                <span className="text-xs font-normal text-muted-foreground">One Time Payment</span>
              </p>
              {perUserLabel(session.package.price, session.package.max_users) && (
                <p className="text-xs text-muted-foreground">
                  {perUserLabel(session.package.price, session.package.max_users)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold mb-1">This plan includes:</p>
              <ul className="space-y-1">
                {(session.package.features ?? []).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs">
                    <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={packagesLoading}
            className="mt-2 w-full rounded-xl border border-input p-2 flex justify-center disabled:opacity-50"
          >
            <span className="rounded-full bg-purple-100 text-primary px-5 py-1.5 text-sm font-medium">
              {packagesLoading ? "Loading packages..." : "Choose Package"}
            </span>
          </button>
        )}
        {errors.package && <p className="mt-1 text-xs text-destructive">{errors.package}</p>}
      </div>

      <div className="rounded-xl bg-purple-50 p-4 text-xs text-foreground/80 space-y-1.5">
        <p className="font-semibold text-foreground">Schedule Your Session</p>
        <p>• Session access is valid for 5 days from the moment of payment activation.</p>
        <p>• Share the session link with participants 10 minutes before scheduled start time.</p>
        <p>• You can update your session date and time once from your HR Dashboard.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium" htmlFor="session-date">
            Date
          </label>
          <input
            id="session-date"
            type="date"
            min={todayStr}
            value={session.scheduledDate}
            onChange={(e) => {
              setSession((prev) => ({ ...prev, scheduledDate: e.target.value }));
              setErrors((prev) => ({ ...prev, scheduledDate: undefined }));
            }}
            className={`mt-1.5 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              errors.scheduledDate ? "border-destructive" : "border-input"
            }`}
          />
          {errors.scheduledDate && (
            <p className="mt-1 text-xs text-destructive">{errors.scheduledDate}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="session-time">
            Start Time
          </label>
          <input
            id="session-time"
            type="time"
            value={session.scheduledTime}
            onChange={(e) => {
              setSession((prev) => ({ ...prev, scheduledTime: e.target.value }));
              setErrors((prev) => ({ ...prev, scheduledTime: undefined }));
            }}
            className={`mt-1.5 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              errors.scheduledTime ? "border-destructive" : "border-input"
            }`}
          />
          {errors.scheduledTime && (
            <p className="mt-1 text-xs text-destructive">{errors.scheduledTime}</p>
          )}
        </div>
      </div>

      <PillButton
        type="submit"
        variant="primary"
        disabled={
          isSaving ||
          !session.package ||
          !session.scheduledDate ||
          !session.scheduledTime ||
          !session.gameId
        }
      >
        {isSaving ? "Saving..." : "Continue to Payment"}
      </PillButton>

      {open && (
        <PackageModal
          packages={packages ?? []}
          current={session.package}
          onClose={() => setOpen(false)}
          onConfirm={(p) => {
            setSession((prev) => ({ ...prev, package: p }));
            setErrors((prev) => ({ ...prev, package: undefined }));
            setOpen(false);
          }}
        />
      )}
    </form>
  );
}

function PackageModal({
  packages,
  current,
  onClose,
  onConfirm,
}: {
  packages: ApiPackage[];
  current: ApiPackage | null;
  onClose: () => void;
  onConfirm: (p: ApiPackage) => void;
}) {
  const [sel, setSel] = useState<ApiPackage | null>(current ?? packages[0] ?? null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-3xl shadow-elevated w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold">Choose your Package</h3>
          <button type="button" onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((p) => {
            const active = sel?.id === p.id;
            const features = Array.isArray(p.features) ? p.features : [];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSel(p)}
                className={`text-left rounded-2xl border-2 p-5 transition ${
                  active ? "border-primary shadow-glow" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-bold">{p.name}</p>
                  <span
                    className={`h-5 w-5 rounded-full border-2 grid place-items-center ${
                      active ? "border-primary" : "border-muted-foreground"
                    }`}
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </span>
                </div>
                {p.short_description && (
                  <p className="text-xs text-muted-foreground mt-2 min-h-[32px]">{p.short_description}</p>
                )}
                <p className="mt-3 text-xl font-bold">
                  {formatPrice(p.price)}{" "}
                  {perUserLabel(p.price, p.max_users) && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {perUserLabel(p.price, p.max_users)}
                    </span>
                  )}
                  <span className="text-xs font-normal text-muted-foreground"> One Time Payment</span>
                </p>
                <p className="text-xs font-semibold mt-4">This plan includes:</p>
                <ul className="mt-2 space-y-1.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between gap-3 p-6 border-t border-border">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-6 py-2.5 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={!sel}
            onClick={() => sel && onConfirm(sel)}
            className="rounded-full bg-gradient-primary text-white px-8 py-2.5 text-sm font-medium shadow-glow disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI" },
  { id: "paytm", label: "Paytm" },
  { id: "card", label: "Debit/Credit Card" },
  { id: "netbanking", label: "Net Banking" },
] as const;

const CONSENT_ITEMS: { key: keyof BookingConsents; text: string }[] = [
  {
    key: "authorization",
    text: "I confirm I am an authorized representative of my organization and have approval to create this session on its behalf.",
  },
  {
    key: "participant_consent",
    text: "I confirm that all participants have been informed about this session and have consented to participate.",
  },
  { key: "terms_accepted", text: "I have read and agree to the Terms & Conditions and Privacy Policy." },
  {
    key: "non_refundable_accepted",
    text: "I understand this is a non-refundable digital service after activation, except in cases of verified technical failure on Zoventro's platform as outlined in the Refund Policy.",
  },
  {
    key: "validity_accepted",
    text: "I understand the session must be used within 5 days of activation, after which all access will expire automatically.",
  },
];

function PaymentStep({
  bookingId,
  session,
  registration,
  onComplete,
}: {
  bookingId: number | null;
  session: SessionSetup;
  registration: RegistrationFormData;
  onComplete: (invitationLink: string) => void;
}) {
  const [isPaying, setIsPaying] = useState(false);
  const [errors, setErrors] = useState<BillingFieldErrors>({});
  const [gstNumber, setGstNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0].id);
  const [consents, setConsents] = useState<BookingConsents>({
    authorization: false,
    participant_consent: false,
    terms_accepted: false,
    non_refundable_accepted: false,
    validity_accepted: false,
  });

  const price = session.package?.price ?? 0;
  const { priceNum, gst, total } = calculateBillingTotals(price);
  const fmt = formatPrice;

  const toggleConsent = (key: keyof BookingConsents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
    if (errors.consents) setErrors((prev) => ({ ...prev, consents: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!bookingId) {
      toastError("Booking not found. Please go back and complete setup.");
      return;
    }

    const clientErrors = validateBillingForm({
      billing_address: billingAddress,
      city,
      state,
      pin_code: pinCode,
      payment_method: paymentMethod,
      gst_number: gstNumber,
      consents,
    });

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toastWarning(clientErrors.consents ?? "Please fix the errors below.");
      return;
    }

    setIsPaying(true);
    try {
      const data = await organizerService.completeBooking({
        booking_id: bookingId,
        gst_number: gstNumber.trim() || undefined,
        billing_address: billingAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pin_code: pinCode.trim(),
        payment_method: paymentMethod,
        consents,
      });
      toastSuccess("Payment completed successfully.");
      onComplete(data.invitation_link);
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setErrors(mapApiFieldErrors(fieldErrors) as BillingFieldErrors);
      toastError(message);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Review &amp; Activate Your Team Activity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete payment to generate your access link and start your activity.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2">Organizer Details</p>
        <div className="rounded-xl border border-border p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Full Name</p>
            <p className="font-medium">{registration.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Official Email ID</p>
            <p className="font-medium">{registration.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Company / Organization Name</p>
            <p className="font-medium">{registration.company_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Company Website</p>
            <p className="font-medium">{registration.company_website || "—"}</p>
          </div>
        </div>
      </div>

      <Section title="Activity & Package">
        <Row k="Selected Activity" v={session.activityTitle || "—"} />
        <Row
          k="Selected Package"
          v={session.package ? `${session.package.name} @ ${formatPrice(session.package.price)}` : "—"}
        />
      </Section>

      <Section title="Schedule">
        <Row
          k="Date"
          v={session.scheduledDate ? formatDisplayDate(session.scheduledDate) : "—"}
        />
        <Row
          k="Start Time"
          v={session.scheduledTime ? formatDisplayTime(normalizeScheduledTime(session.scheduledTime)) : "—"}
        />
      </Section>

      <div>
        <p className="text-sm font-semibold">Billing Details (GST Invoice)</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          A GST invoice will be automatically generated and sent to your registered email after successful payment
        </p>
        <div className="mt-3 space-y-3">
          <BField
            label="GST Number"
            placeholder="Enter GST Number (optional)"
            value={gstNumber}
            onChange={setGstNumber}
            error={errors.gst_number}
          />
          <BField
            label="Billing Address"
            placeholder="Enter Billing Address"
            value={billingAddress}
            onChange={setBillingAddress}
            error={errors.billing_address}
          />
          <div className="grid grid-cols-2 gap-3">
            <BField label="City" placeholder="Enter City" value={city} onChange={setCity} error={errors.city} />
            <BField
              label="State"
              placeholder="Select State"
              value={state}
              onChange={setState}
              error={errors.state}
              options={INDIAN_STATES}
            />
          </div>
          <BField
            label="PIN Code"
            placeholder="Enter PIN Code"
            value={pinCode}
            onChange={setPinCode}
            error={errors.pin_code}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-2">
        <Row k="Package Price" v={fmt(priceNum)} />
        <Row k="GST (18%)" v={fmt(gst)} />
        <Row k="Additional Charges" v="₹0" />
        <div className="border-t border-border pt-2.5 mt-2.5">
          <Row k="Total Payable" v={fmt(total)} bold />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2">Select payment Method</p>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer ${
                paymentMethod === m.id ? "border-primary bg-primary/5" : "border-input"
              }`}
            >
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === m.id}
                onChange={() => {
                  setPaymentMethod(m.id);
                  setErrors((prev) => ({ ...prev, payment_method: undefined }));
                }}
                className="accent-primary"
              />
              {m.label}
            </label>
          ))}
        </div>
        {errors.payment_method && (
          <p className="mt-1 text-xs text-destructive">{errors.payment_method}</p>
        )}
      </div>

      <div className="rounded-xl bg-purple-50 p-4 space-y-2 text-xs">
        {CONSENT_ITEMS.map(({ key, text }) => (
          <label key={key} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={consents[key]}
              onChange={() => toggleConsent(key)}
              className="mt-0.5 accent-primary"
            />
            <span>{text}</span>
          </label>
        ))}
        {errors.consents && <p className="text-destructive">{errors.consents}</p>}
      </div>

      <PillButton type="submit" variant="primary" disabled={isPaying || !bookingId}>
        {isPaying ? "Processing..." : "Pay & Activate Event"}
      </PillButton>
    </form>
  );
}

function BField({
  label,
  placeholder,
  value,
  onChange,
  error,
  options,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options?: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            error ? "border-destructive" : "border-input"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            error ? "border-destructive" : "border-input"
          }`}
        />
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold mb-2">{title}</p>
      <div className="rounded-xl border border-border p-4 space-y-2">{children}</div>
    </div>
  );
}
function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={bold ? "font-bold text-base" : "font-medium"}>{v}</span>
    </div>
  );
}

function SuccessCard({
  invitationLink,
  onReset,
}: {
  invitationLink: string | null;
  onReset: () => void;
}) {
  const joinUrl = invitationLink ? buildJoinUrl(invitationLink) : null;
  const authed = isOrganizerAuthenticated();

  const copyLink = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      toastSuccess("Link copied to clipboard.");
    } catch {
      toastError("Could not copy link.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl mt-12 rounded-3xl bg-card shadow-elevated p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-success/15 grid place-items-center">
        <CheckCircle2 className="h-9 w-9 text-success" />
      </div>
      <h2 className="mt-5 text-3xl font-bold">Your Team Activity is Ready!</h2>
      <p className="mt-2 text-muted-foreground">
        Congratulations! Your activity has been successfully activated.
      </p>

      <div className="mt-8 rounded-2xl border border-border p-5 text-left">
        <p className="text-sm font-semibold">Event Access Link</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Share this link with participants 10 minutes before the start time
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-input bg-muted px-4 py-2.5 text-sm font-mono truncate">
            {joinUrl ?? "Link will appear after activation"}
          </div>
          <button
            type="button"
            onClick={copyLink}
            disabled={!joinUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-white px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[{ i: MessageCircle, l: "WhatsApp" }, { i: Mail, l: "Email" }, { i: Share2, l: "More" }].map(({ i: Icon, l }) => (
            <button key={l} type="button" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:bg-accent">
              <Icon className="h-3.5 w-3.5" /> {l}
            </button>
          ))}
        </div>
      </div>

      {!authed && (
        <p className="mt-4 text-sm text-muted-foreground">
          Log in with your registered email to manage this event from the dashboard.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link to="/" className="rounded-full border border-border px-6 py-2.5 text-sm">
          Go to Home Page
        </Link>
        {authed ? (
          <Link to="/dashboard" className="rounded-full bg-gradient-primary text-white px-6 py-2.5 text-sm font-semibold shadow-glow">
            Go to Dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            search={{ redirect: "/dashboard" }}
            className="rounded-full bg-gradient-primary text-white px-6 py-2.5 text-sm font-semibold shadow-glow"
          >
            Login to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
