import { U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { R as Route, y as useNavigate, k as isOrganizerAuthenticated, L as Link, e as apiClient } from "./router-DZhViOq_.js";
import { H as Header, F as Footer } from "./Footer-CbbUSa63.js";
import { C as Crumbs } from "./Crumbs-knMBxWJ5.js";
import { c as toastWarning, b as toastSuccess, t as toastError } from "./toast-s3ZTemWF.js";
import { L as LoaderCircle, i as isValidEmail, p as parseApiError, m as mapApiFieldErrors, v as validateOtpCode } from "./organizer-D-w9zeZq.js";
import { o as organizerService } from "./organizer.service-C7lkqR-i.js";
import { h as hero, c as cook } from "./cook-8A24jSRJ.js";
import { m as mystery } from "./mystery-wQJEB1WM.js";
import { M as Mail } from "./mail-zUxH5Ck_.js";
import { A as ArrowRight } from "./arrow-right-h3or2hTG.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Logo-COJrqD4D.js";
import "./useQuery-CFSAAbqg.js";
import "./config-CafHMDrA.js";
import "./chevron-right-B_AJoG7h.js";
function LoginPage() {
  const {
    redirect: redirectTo
  } = Route.useSearch();
  const [step, setStep] = reactExports.useState("email");
  const [email, setEmail] = reactExports.useState("");
  const [emailError, setEmailError] = reactExports.useState(null);
  const [isSending, setIsSending] = reactExports.useState(false);
  const [isVerifying, setIsVerifying] = reactExports.useState(false);
  const [isResending, setIsResending] = reactExports.useState(false);
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (isOrganizerAuthenticated()) {
      navigate({
        to: "/dashboard"
      });
    }
  }, [navigate]);
  const SLIDES = [{
    url: hero,
    alt: "Team Collaborating"
  }, {
    url: mystery,
    alt: "Mystery Quest Challenge"
  }, {
    url: cook,
    alt: "Cook & Create Event"
  }];
  reactExports.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4e3);
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
      await organizerService.sendLoginOtp({
        email: email.trim()
      });
      toastSuccess("Verification code sent to your email.");
      setStep("otp");
    } catch (err) {
      const {
        message,
        fieldErrors
      } = parseApiError(err);
      const mapped = mapApiFieldErrors(fieldErrors);
      if (mapped.email) setEmailError(mapped.email);
      toastError(message);
    } finally {
      setIsSending(false);
    }
  };
  const handleVerifyOtp = async (otp) => {
    const otpError = validateOtpCode(otp);
    if (otpError) {
      toastWarning(otpError);
      return;
    }
    setIsVerifying(true);
    try {
      const data = await organizerService.verifyLoginOtp({
        email: email.trim(),
        otp
      });
      apiClient.setToken(data.token);
      toastSuccess("Logged in successfully.");
      navigate({
        to: redirectTo ?? "/dashboard"
      });
    } catch (err) {
      const {
        message
      } = parseApiError(err);
      toastError(message);
    } finally {
      setIsVerifying(false);
    }
  };
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await organizerService.resendOtp({
        email: email.trim()
      });
      toastSuccess("A new verification code has been sent.");
    } catch (err) {
      toastError(parseApiError(err).message);
    } finally {
      setIsResending(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[oklch(0.965_0.012_290)] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crumbs, { items: [{
      label: "Home",
      to: "/"
    }, {
      label: "Login"
    }] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl grid gap-6 lg:grid-cols-2 rounded-3xl overflow-hidden bg-white shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full w-full min-h-[420px] overflow-hidden bg-muted", children: [
        SLIDES.map((slide, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: slide.url, alt: slide.alt, className: `absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "opacity-0"}` }, slide.url)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-10", children: SLIDES.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setActiveSlide(index), className: `h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === activeSlide ? "bg-primary scale-110 shadow-sm" : "bg-gray-300 hover:bg-gray-400"}`, "aria-label": `Go to slide ${index + 1}` }, index)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 sm:p-12 flex flex-col justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold tracking-tight", children: [
          "Login to",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-primary", children: "Access Your Organizer Dashboard" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Manage your team activity, track participation, and run seamless team experiences." }),
        step === "email" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmailStep, { email, emailError, setEmail: (v) => {
          setEmail(v);
          if (emailError) setEmailError(null);
        }, isSending, onNext: handleSendOtp }) : /* @__PURE__ */ jsxRuntimeExports.jsx(OtpStep, { email, isVerifying, isResending, onBack: () => setStep("email"), onVerify: handleVerifyOtp, onResend: handleResendOtp }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 text-xs text-muted-foreground", children: [
          "Don't have an account?",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "Choose Your Package & Register.",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/create", className: "text-primary font-medium", children: "Get Started Now" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function EmailStep({
  email,
  emailError,
  setEmail,
  isSending,
  onNext
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold", children: "Official Email ID" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "An OTP will be sent to this email for verification" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), onKeyDown: (e) => e.key === "Enter" && onNext(), type: "email", placeholder: "Enter your work email", "aria-invalid": !!emailError, className: `w-full rounded-xl border bg-background pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${emailError ? "border-destructive" : "border-border"}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" })
    ] }),
    emailError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs text-destructive", children: emailError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onNext, disabled: isSending || !email.trim(), className: `mt-6 group inline-flex items-center gap-2 rounded-full text-white pl-5 pr-1.5 py-2 text-sm font-medium shadow-glow transition ${isSending || !email.trim() ? "bg-muted-foreground/40 cursor-not-allowed" : "bg-gradient-primary hover:opacity-90"}`, children: [
      isSending ? "Sending..." : "Send Verification Code",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: isSending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
    ] })
  ] });
}
function OtpStep({
  email,
  onBack,
  onVerify,
  onResend,
  isVerifying,
  isResending
}) {
  const [vals, setVals] = reactExports.useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = reactExports.useState(null);
  const refs = reactExports.useRef([]);
  reactExports.useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  const setAt = (i, v) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold", children: "Verify Your Email" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Enter the OTP sent to your email to continue." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-3", children: [
      "We have sent a 6-digit code to",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-medium", children: email })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex gap-2", children: vals.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: (el) => {
      refs.current[i] = el;
    }, value: v, onChange: (e) => setAt(i, e.target.value), onKeyDown: (e) => {
      if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
      if (e.key === "Enter" && filled) submit();
    }, inputMode: "numeric", maxLength: 1, "aria-label": `OTP digit ${i + 1}`, className: `h-12 w-12 rounded-xl border text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${otpError ? "border-destructive" : "border-border"}` }, i)) }),
    otpError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs text-destructive", children: otpError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-muted-foreground", children: [
      "Didn't receive code?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: isResending, onClick: onResend, className: "text-primary font-medium disabled:opacity-50", children: isResending ? "Sending..." : "Resend" }),
      " ",
      "·",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onBack, className: "text-primary font-medium", children: "Change Email" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: submit, disabled: isVerifying || !filled, className: `mt-6 group inline-flex items-center gap-2 rounded-full text-white pl-5 pr-1.5 py-2 text-sm font-medium ${isVerifying || !filled ? "bg-muted-foreground/40 cursor-not-allowed" : "bg-gradient-primary shadow-glow hover:opacity-90"}`, children: [
      isVerifying ? "Verifying..." : "Verify & Proceed",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: isVerifying ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
    ] })
  ] });
}
export {
  LoginPage as component
};
