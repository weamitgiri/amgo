import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, Mail, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Crumbs } from "@/components/Crumbs";
import { Footer } from "@/components/Footer";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";
import { isOrganizerAuthenticated } from "@/lib/auth";
import { isValidEmail } from "@/utils/common";
import { organizerService } from "@/api/services/organizer.service";
import { apiClient } from "@/api/client";
import { mapApiFieldErrors, parseApiError } from "@/api/errors";
import { validateOtpCode } from "@/utils/organizer";
import hero from "@/assets/hero.jpg";
import mystery from "@/assets/mystery.jpg";
import cook from "@/assets/cook.jpg";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Login — Zoventro" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (isOrganizerAuthenticated()) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const SLIDES = [
    { url: hero, alt: "Team Collaborating" },
    { url: mystery, alt: "Mystery Quest Challenge" },
    { url: cook, alt: "Cook & Create Event" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSendOtp = async () => {
    setEmailError(null);

    if (!email.trim()) {
      setEmailError("Email is required");
      toastWarning("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      toastWarning("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    try {
      await organizerService.sendLoginOtp({ email: email.trim() });
      toastSuccess("Verification code sent to your email.");
      setStep("otp");
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      const mapped = mapApiFieldErrors(fieldErrors);
      if (mapped.email) setEmailError(mapped.email);
      toastError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    const otpError = validateOtpCode(otp);
    if (otpError) {
      toastWarning(otpError);
      return;
    }

    setIsVerifying(true);
    try {
      const data = await organizerService.verifyLoginOtp({
        email: email.trim(),
        otp,
      });
      apiClient.setToken(data.token);
      toastSuccess("Logged in successfully.");
      navigate({ to: redirectTo ?? "/dashboard" });
    } catch (err) {
      const { message } = parseApiError(err);
      toastError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await organizerService.resendOtp({ email: email.trim() });
      toastSuccess("A new verification code has been sent.");
    } catch (err) {
      toastError(parseApiError(err).message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.012_290)] flex flex-col">
      <div className="pt-4">
        <Header />
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Crumbs items={[{ label: "Home", to: "/" }, { label: "Login" }]} />
      </div>
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2 rounded-3xl overflow-hidden bg-white shadow-card">
          <div className="relative h-full w-full min-h-[420px] overflow-hidden bg-muted">
            {SLIDES.map((slide, index) => (
              <img
                key={slide.url}
                src={slide.url}
                alt={slide.alt}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  index === activeSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
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
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Login to
              <br />
              <span className="text-gradient-primary">Access Your Organizer Dashboard</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Manage your team activity, track participation, and run seamless team experiences.
            </p>

            {step === "email" ? (
              <EmailStep
                email={email}
                emailError={emailError}
                setEmail={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError(null);
                }}
                isSending={isSending}
                onNext={handleSendOtp}
              />
            ) : (
              <OtpStep
                email={email}
                isVerifying={isVerifying}
                isResending={isResending}
                onBack={() => setStep("email")}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
              />
            )}

            <div className="mt-10 text-xs text-muted-foreground">
              Don't have an account?
              <br />
              Choose Your Package &amp; Register.{" "}
              <Link to="/create" className="text-primary font-medium">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function EmailStep({
  email,
  emailError,
  setEmail,
  isSending,
  onNext,
}: {
  email: string;
  emailError: string | null;
  setEmail: (v: string) => void;
  isSending: boolean;
  onNext: () => Promise<void>;
}) {
  return (
    <div className="mt-8">
      <label className="block text-sm font-semibold">Official Email ID</label>
      <p className="text-xs text-muted-foreground mt-0.5">
        An OTP will be sent to this email for verification
      </p>
      <div className="mt-3 relative">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onNext()}
          type="email"
          placeholder="Enter your work email"
          aria-invalid={!!emailError}
          className={`w-full rounded-xl border bg-background pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
            emailError ? "border-destructive" : "border-border"
          }`}
        />
        <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {emailError && <p className="mt-1.5 text-xs text-destructive">{emailError}</p>}
      <button
        type="button"
        onClick={onNext}
        disabled={isSending || !email.trim()}
        className={`mt-6 group inline-flex items-center gap-2 rounded-full text-white pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow transition ${
          isSending || !email.trim()
            ? "bg-muted-foreground/40 cursor-not-allowed"
            : "bg-gradient-primary hover:opacity-90"
        }`}
      >
        {isSending ? "Sending..." : "Send Verification Code"}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </span>
      </button>
    </div>
  );
}

function OtpStep({
  email,
  onBack,
  onVerify,
  onResend,
  isVerifying,
  isResending,
}: {
  email: string;
  onBack: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying: boolean;
  isResending: boolean;
}) {
  const [vals, setVals] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setAt = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    const n = [...vals];
    n[i] = c;
    setVals(n);
    if (otpError) setOtpError(null);
    if (c && i < 5) refs.current[i + 1]?.focus();
  };

  const otp = vals.join("");
  const filled = vals.every(Boolean);

  const submit = async () => {
    const err = validateOtpCode(otp);
    if (err) {
      setOtpError(err);
      toastWarning(err);
      return;
    }
    await onVerify(otp);
  };

  return (
    <div className="mt-8">
      <label className="block text-sm font-semibold">Verify Your Email</label>
      <p className="text-xs text-muted-foreground mt-0.5">
        Enter the OTP sent to your email to continue.
      </p>
      <p className="text-xs mt-3">
        We have sent a 6-digit code to{" "}
        <span className="text-primary font-medium">{email}</span>
      </p>
      <div className="mt-4 flex gap-2">
        {vals.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={v}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
              if (e.key === "Enter" && filled) submit();
            }}
            inputMode="numeric"
            maxLength={1}
            aria-label={`OTP digit ${i + 1}`}
            className={`h-12 w-12 rounded-xl border text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
              otpError ? "border-destructive" : "border-border"
            }`}
          />
        ))}
      </div>
      {otpError && <p className="mt-1.5 text-xs text-destructive">{otpError}</p>}
      <p className="mt-3 text-xs text-muted-foreground">
        Didn't receive code?{" "}
        <button
          type="button"
          disabled={isResending}
          onClick={onResend}
          className="text-primary font-medium disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend"}
        </button>{" "}
        ·{" "}
        <button type="button" onClick={onBack} className="text-primary font-medium">
          Change Email
        </button>
      </p>
      <button
        type="button"
        onClick={submit}
        disabled={isVerifying || !filled}
        className={`mt-6 group inline-flex items-center gap-2 rounded-full text-white pl-5 pr-1.5 py-2 text-sm font-medium ${
          isVerifying || !filled
            ? "bg-muted-foreground/40 cursor-not-allowed"
            : "bg-gradient-primary shadow-glow hover:opacity-90"
        }`}
      >
        {isVerifying ? "Verifying..." : "Verify & Proceed"}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
          {isVerifying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </span>
      </button>
    </div>
  );
}
