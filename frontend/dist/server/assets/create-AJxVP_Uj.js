import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { H as Header, F as Footer, u as useGames, a as usePackages, b as useGameDetails } from "./Footer-0Cr9NLpb.js";
import { P as PillButton } from "./PillButton-BYYJPueu.js";
import { c as cn, b as buttonVariants, B as Button } from "./button-BmLZMIt9.js";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, CheckCircle2, Copy, Check, User, Mail, Loader2, Calendar as Calendar$1, X } from "lucide-react";
import { getDefaultClassNames, DayPicker } from "react-day-picker";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { a as toastSuccess, t as toastError, b as toastWarning } from "./toast-B5Q8Bvxc.js";
import { o as organizerService } from "./organizer.service-D9SFzC32.js";
import { a as validateRequired, h as hero, b as validateRegistrationForm, n as normalizeWebsite, p as parseApiError, m as mapApiFieldErrors, v as validateOtpCode } from "./hero-BLrNWk51.js";
import { r as resolveMediaUrl } from "./media-BmyD47-a.js";
import { d as Route, i as isOrganizerAuthenticated } from "./router-qdPwl0jo.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./config-qISbZfHI.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "sonner";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsx("div", { "data-slot": "calendar", ref: rootRef, className: cn(className2), ...props2 });
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsx(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx(ChevronRightIcon, { className: cn("size-4", className2), ...props2 });
          }
          return /* @__PURE__ */ jsx(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx("td", { ...props2, children: /* @__PURE__ */ jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
function formatPrice(price) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(num)) return String(price);
  return `₹${num.toLocaleString("en-IN")}`;
}
function perUserLabel(price, maxUsers) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (!maxUsers || Number.isNaN(num)) return null;
  const perUser = Math.round(num / maxUsers);
  return `₹${perUser.toLocaleString("en-IN")}/user`;
}
function normalizeScheduledTime(time) {
  if (!time) return time;
  return time.length === 5 ? `${time}:00` : time;
}
function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const MAX_SCHEDULE_DAYS_AHEAD = 5;
function getSelectableScheduleDateBounds() {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_SCHEDULE_DAYS_AHEAD);
  return {
    minDate: formatDateInputValue(today),
    maxDate: formatDateInputValue(maxDate)
  };
}
function formatDisplayDate(isoDate) {
  const d = /* @__PURE__ */ new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function formatDisplayTime(time) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}
function buildJoinUrl(invitationLink) {
  if (typeof window === "undefined") {
    return `/join/${invitationLink}`;
  }
  return `${window.location.origin}/join/${invitationLink}`;
}
function validateSessionSetup(data) {
  const errors = {};
  if (!data.activityId) errors.activity = "Please select an activity";
  if (!data.gameId) errors.game = "No game variant available for this activity";
  if (!data.package) errors.package = "Please choose a package";
  if (!data.scheduledDate) errors.scheduledDate = "Date is required";
  if (!data.scheduledTime) errors.scheduledTime = "Start time is required";
  if (data.scheduledDate) {
    const { minDate, maxDate } = getSelectableScheduleDateBounds();
    if (data.scheduledDate < minDate || data.scheduledDate > maxDate) {
      errors.scheduledDate = `Please select a date from today through the next ${MAX_SCHEDULE_DAYS_AHEAD} days`;
    }
  }
  return errors;
}
function validateBillingForm(data) {
  const errors = {};
  const addressCheck = validateRequired(data.billing_address);
  if (!addressCheck.isValid) errors.billing_address = addressCheck.error;
  const cityCheck = validateRequired(data.city);
  if (!cityCheck.isValid) errors.city = cityCheck.error;
  const stateCheck = validateRequired(data.state);
  if (!stateCheck.isValid) errors.state = stateCheck.error;
  if (!data.pin_code.trim()) {
    errors.pin_code = "PIN code is required";
  } else if (!/^\d{6}$/.test(data.pin_code.trim())) {
    errors.pin_code = "PIN code must be 6 digits";
  }
  if (!data.payment_method) {
    errors.payment_method = "Please select a payment method";
  }
  if (!data.gst_number.trim()) {
    errors.gst_number = "GST number is required";
  } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gst_number.trim())) {
    errors.gst_number = "Please enter a valid GST number";
  }
  const allConsentsAccepted = Object.values(data.consents).every(Boolean);
  if (!allConsentsAccepted) {
    errors.consents = "Please accept all required declarations";
  }
  return errors;
}
function calculateBillingTotals(price) {
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  const safePrice = Number.isNaN(priceNum) ? 0 : priceNum;
  const gst = parseFloat((safePrice * 0.18).toFixed(2));
  const total = parseFloat((safePrice + gst).toFixed(2));
  return { priceNum: safePrice, gst, total };
}
const mystery = "/assets/people-1-nqDTH5c7.jpg";
const cook = "/assets/people-2-QTz3eykc.jpg";
const FALLBACK_IMAGES = [mystery, cook];
const INDIAN_STATES = [{
  value: "Andhra Pradesh",
  label: "Andhra Pradesh"
}, {
  value: "Arunachal Pradesh",
  label: "Arunachal Pradesh"
}, {
  value: "Assam",
  label: "Assam"
}, {
  value: "Bihar",
  label: "Bihar"
}, {
  value: "Chhattisgarh",
  label: "Chhattisgarh"
}, {
  value: "Goa",
  label: "Goa"
}, {
  value: "Gujarat",
  label: "Gujarat"
}, {
  value: "Haryana",
  label: "Haryana"
}, {
  value: "Himachal Pradesh",
  label: "Himachal Pradesh"
}, {
  value: "Jharkhand",
  label: "Jharkhand"
}, {
  value: "Karnataka",
  label: "Karnataka"
}, {
  value: "Kerala",
  label: "Kerala"
}, {
  value: "Madhya Pradesh",
  label: "Madhya Pradesh"
}, {
  value: "Maharashtra",
  label: "Maharashtra"
}, {
  value: "Manipur",
  label: "Manipur"
}, {
  value: "Meghalaya",
  label: "Meghalaya"
}, {
  value: "Mizoram",
  label: "Mizoram"
}, {
  value: "Nagaland",
  label: "Nagaland"
}, {
  value: "Odisha",
  label: "Odisha"
}, {
  value: "Punjab",
  label: "Punjab"
}, {
  value: "Rajasthan",
  label: "Rajasthan"
}, {
  value: "Sikkim",
  label: "Sikkim"
}, {
  value: "Tamil Nadu",
  label: "Tamil Nadu"
}, {
  value: "Telangana",
  label: "Telangana"
}, {
  value: "Tripura",
  label: "Tripura"
}, {
  value: "Uttar Pradesh",
  label: "Uttar Pradesh"
}, {
  value: "Uttarakhand",
  label: "Uttarakhand"
}, {
  value: "West Bengal",
  label: "West Bengal"
}, {
  value: "Andaman and Nicobar Islands",
  label: "Andaman and Nicobar Islands"
}, {
  value: "Chandigarh",
  label: "Chandigarh"
}, {
  value: "Dadra and Nagar Haveli and Daman and Diu",
  label: "Dadra and Nagar Haveli and Daman and Diu"
}, {
  value: "Delhi",
  label: "Delhi"
}, {
  value: "Jammu and Kashmir",
  label: "Jammu and Kashmir"
}, {
  value: "Ladakh",
  label: "Ladakh"
}, {
  value: "Lakshadweep",
  label: "Lakshadweep"
}, {
  value: "Puducherry",
  label: "Puducherry"
}];
const STEPS = ["Details", "Verify", "Setup", "Payment"];
const emptyRegistration = () => ({
  name: "",
  email: "",
  company_name: "",
  company_website: "",
  organizer_id: null
});
const emptySessionSetup = () => ({
  activityId: null,
  activityTitle: "",
  gameId: null,
  gameTitle: "",
  package: null,
  scheduledDate: "",
  scheduledTime: ""
});
function CreatePage() {
  const {
    activity: activitySlug
  } = Route.useSearch();
  const authenticated = isOrganizerAuthenticated();
  const [step, setStep] = useState(() => authenticated ? 2 : 0);
  const [done, setDone] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [invitationLink, setInvitationLink] = useState(null);
  const [session, setSession] = useState(emptySessionSetup);
  const [registration, setRegistration] = useState(emptyRegistration);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  useNavigate();
  useEffect(() => {
    if (!authenticated) return;
    setIsAuthLoading(true);
    organizerService.getDashboard().then((result) => {
      if (result.organizer) {
        setRegistration((prev) => ({
          ...prev,
          organizer_id: result.organizer.id,
          name: result.organizer.name ?? prev.name,
          email: result.organizer.email ?? prev.email,
          company_name: result.organizer.company_name ?? prev.company_name
        }));
        setStep(2);
      }
    }).catch(() => {
    }).finally(() => {
      setIsAuthLoading(false);
    });
  }, [authenticated]);
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
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4e3);
    return () => clearInterval(timer);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen pb-10", children: [
    /* @__PURE__ */ jsx("div", { className: "pt-6", children: /* @__PURE__ */ jsx(Header, {}) }),
    /* @__PURE__ */ jsxs("section", { className: "px-4 mt-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl text-center", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-5xl font-bold", children: [
          "Create Your Session &",
          /* @__PURE__ */ jsx("br", {}),
          "Activate Your Activity"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-muted-foreground max-w-xl mx-auto", children: "Set up your account, choose a package, and start your team experience in minutes." })
      ] }),
      done ? /* @__PURE__ */ jsx(SuccessCard, { invitationLink, onReset: () => {
        setDone(false);
        setStep(authenticated ? 2 : 0);
        setBookingId(null);
        setInvitationLink(null);
        setSession(emptySessionSetup());
        if (!authenticated) {
          setRegistration(emptyRegistration());
        }
      } }) : /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl mt-12 grid lg:grid-cols-2 gap-8 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl overflow-hidden shadow-elevated min-h-[520px] bg-gradient-soft relative w-full", children: [
          SLIDES.map((slide, index) => /* @__PURE__ */ jsx("img", { src: slide.url, alt: slide.alt, className: `absolute inset-0 h-full w-full object-cover min-h-[520px] transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "opacity-0"}` }, slide.url)),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-10", children: SLIDES.map((_, index) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setActiveSlide(index), className: `h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === activeSlide ? "bg-primary scale-110 shadow-sm" : "bg-gray-300 hover:bg-gray-400"}`, "aria-label": `Go to slide ${index + 1}` }, index)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-card shadow-elevated p-8 md:p-10", children: [
          /* @__PURE__ */ jsx(Stepper, { step }),
          authenticated && isAuthLoading && /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-border bg-muted/50 p-4 mt-6 text-sm text-muted-foreground", children: "Loading your organizer profile so you can continue with another game selection..." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
            step === 0 && /* @__PURE__ */ jsx(DetailsStep, { registration, setRegistration, onNext: () => setStep(1) }),
            step === 1 && /* @__PURE__ */ jsx(VerifyStep, { email: registration.email, onBack: () => setStep(0), onVerified: (organizerId) => {
              setRegistration((prev) => ({
                ...prev,
                organizer_id: organizerId
              }));
              setStep(2);
            } }),
            step === 2 && /* @__PURE__ */ jsx(SetupStep, { organizerId: registration.organizer_id, initialActivitySlug: activitySlug, session, setSession, onNext: (id) => {
              setBookingId(id);
              setStep(3);
            } }),
            step === 3 && /* @__PURE__ */ jsx(PaymentStep, { bookingId, session, registration, onComplete: (link) => {
              setInvitationLink(link);
              setDone(true);
            } })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function Stepper({
  step
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: STEPS.map((label, i) => {
    const active = i === step;
    const complete = i < step;
    return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center last:flex-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: `grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-colors ${complete ? "bg-primary/20 text-primary" : active ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`, children: complete ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5" }) : String(i + 1).padStart(2, "0") }),
        /* @__PURE__ */ jsx("span", { className: `text-xs ${active ? "text-primary font-semibold" : "text-muted-foreground"}`, children: label })
      ] }),
      i < STEPS.length - 1 && /* @__PURE__ */ jsx("div", { className: `flex-1 h-[2px] mx-2 mb-6 rounded ${i < step ? "bg-primary" : "bg-border"}` })
    ] }, label);
  }) });
}
function Field({
  label,
  hint,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: label }),
    hint && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: hint }),
    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 relative", children: [
      /* @__PURE__ */ jsx("input", { value, onChange, type, placeholder, "aria-invalid": !!error, className: `w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? "border-destructive" : "border-input"}` }),
      Icon && /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: error })
  ] });
}
function DetailsStep({
  registration,
  setRegistration,
  onNext
}) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (field, value) => {
    setRegistration((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: void 0
      }));
    }
  };
  const handleSubmit = async (e) => {
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
        company_website: normalizeWebsite(registration.company_website)
      });
      setRegistration((prev) => ({
        ...prev,
        organizer_id: Number(data.organizer_id)
      }));
      toastSuccess("OTP sent to your email. Please verify to continue.");
      onNext();
    } catch (err) {
      const {
        message,
        fieldErrors
      } = parseApiError(err);
      setErrors(mapApiFieldErrors(fieldErrors));
      toastError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Organizer Details" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Provide basic details to set up your team engagement activity." }),
    /* @__PURE__ */ jsx(Field, { label: "Full Name", hint: "Primary Contact Person", icon: User, placeholder: "Enter your full name", value: registration.name, onChange: (e) => update("name", e.target.value), error: errors.name }),
    /* @__PURE__ */ jsx(Field, { label: "Official Email ID", hint: "An OTP will be sent to this email for verification", icon: Mail, type: "email", placeholder: "Enter your work email", value: registration.email, onChange: (e) => update("email", e.target.value), error: errors.email }),
    /* @__PURE__ */ jsx(Field, { label: "Company / Organization Name", placeholder: "Enter Company Name", value: registration.company_name, onChange: (e) => update("company_name", e.target.value), error: errors.company_name }),
    /* @__PURE__ */ jsx(Field, { label: "Company Website", placeholder: "https://yourcompany.com", value: registration.company_website, onChange: (e) => update("company_website", e.target.value), error: errors.company_website }),
    /* @__PURE__ */ jsx(PillButton, { type: "submit", variant: "primary", disabled: isSubmitting, children: isSubmitting ? "Submitting..." : "Submit & Verify Email" }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground pt-2", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-primary font-semibold", children: "Login" })
    ] })
  ] });
}
function VerifyStep({
  email,
  onBack,
  onVerified
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputs = useRef([]);
  const otpValue = otp.join("");
  const handleSubmit = async (e) => {
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
        otp: otpValue
      });
      toastSuccess("Email verified successfully.");
      onVerified(Number(data.organizer_id));
    } catch (err2) {
      const {
        message
      } = parseApiError(err2);
      setOtpError(message);
      toastError(message);
    } finally {
      setIsVerifying(false);
    }
  };
  const handleResend = async () => {
    setIsResending(true);
    try {
      await organizerService.resendOtp({
        email: email.trim()
      });
      toastSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      toastError(parseApiError(err).message);
    } finally {
      setIsResending(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Verify Your Email" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Enter the OTP sent to your email to continue." })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
      "We have sent a 6 digit code to",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-primary", children: email })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2.5", children: otp.map((d, i) => /* @__PURE__ */ jsx("input", { ref: (el) => {
      otpInputs.current[i] = el;
    }, value: d, onChange: (e) => {
      const value = e.target.value.replace(/\D/g, "").slice(-1);
      const next = [...otp];
      next[i] = value;
      setOtp(next);
      if (otpError) setOtpError(null);
      if (value && i < otpInputs.current.length - 1) {
        otpInputs.current[i + 1]?.focus();
      }
    }, onKeyDown: (e) => {
      if (e.key === "Backspace" && !otp[i] && i > 0) {
        otpInputs.current[i - 1]?.focus();
      }
    }, onPaste: (e) => {
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
    }, inputMode: "numeric", maxLength: 1, "aria-label": `OTP digit ${i + 1}`, className: `h-14 w-14 rounded-lg border-2 text-center text-xl font-bold text-primary focus:border-primary focus:outline-none ${otpError ? "border-destructive" : "border-input"}` }, i)) }),
    otpError && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: otpError }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Didn't receive code?",
      " ",
      /* @__PURE__ */ jsx("button", { type: "button", disabled: isResending, onClick: handleResend, className: "text-primary font-semibold disabled:opacity-50", children: isResending ? "Sending..." : "Resend" }),
      " ",
      "·",
      " ",
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onBack, className: "text-primary font-semibold", children: "Change details" })
    ] }),
    /* @__PURE__ */ jsx(PillButton, { type: "submit", variant: "primary", disabled: isVerifying, children: isVerifying ? "Verifying..." : "Verify & Continue" })
  ] });
}
function SetupStep({
  organizerId,
  initialActivitySlug,
  session,
  setSession,
  onNext
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const {
    data: games,
    isLoading: gamesLoading
  } = useGames();
  const {
    data: packages,
    isLoading: packagesLoading
  } = usePackages();
  const {
    data: gameDetails,
    isLoading: gameDetailsLoading
  } = useGameDetails(session.activityId);
  const [dateOpen, setDateOpen] = useState(false);
  const {
    minDate: todayStr,
    maxDate: maxDateStr
  } = getSelectableScheduleDateBounds();
  const selectedScheduleDate = session.scheduledDate ? /* @__PURE__ */ new Date(`${session.scheduledDate}T00:00:00`) : void 0;
  const disabledScheduleDays = {
    before: /* @__PURE__ */ new Date(`${todayStr}T00:00:00`),
    after: /* @__PURE__ */ new Date(`${maxDateStr}T00:00:00`)
  };
  const isAllowedScheduleDate = (value) => {
    if (!value) return false;
    return value >= todayStr && value <= maxDateStr;
  };
  const selectActivity = (activity) => {
    setSession((prev) => ({
      ...prev,
      activityId: activity.id,
      activityTitle: activity.title,
      gameId: null,
      gameTitle: ""
    }));
    setErrors((prev) => ({
      ...prev,
      activity: void 0,
      game: void 0
    }));
  };
  useEffect(() => {
    if (!games?.length || session.activityId) return;
    const match = initialActivitySlug ? games.find((g) => g.slug === initialActivitySlug) : games[0];
    if (match) selectActivity(match);
  }, [games, initialActivitySlug, session.activityId]);
  useEffect(() => {
    if (!gameDetails?.sub_games?.length) return;
    const first = gameDetails.sub_games[0];
    setSession((prev) => ({
      ...prev,
      gameId: first.id,
      gameTitle: first.title
    }));
  }, [gameDetails, setSession]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validateSessionSetup({
      activityId: session.activityId,
      gameId: session.gameId,
      package: session.package,
      scheduledDate: session.scheduledDate,
      scheduledTime: session.scheduledTime
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
        scheduled_time: normalizeScheduledTime(session.scheduledTime)
      });
      toastSuccess("Session setup saved.");
      onNext(data.booking_id);
    } catch (err) {
      const {
        message,
        fieldErrors
      } = parseApiError(err);
      setErrors(mapApiFieldErrors(fieldErrors));
      toastError(message);
    } finally {
      setIsSaving(false);
    }
  };
  const activityImage = (game, index) => resolveMediaUrl(game.cover_image) ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Choose Your Activity, Package & Schedule" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Select your activity, team size, and schedule your experience." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold", children: "Choose your Activity" }),
      gamesLoading ? /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
        " Loading activities..."
      ] }) : games?.length ? /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-2 gap-3", children: games.map((activity, index) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => selectActivity(activity), className: `flex items-center justify-between gap-3 rounded-xl border-2 p-2 pl-4 transition ${session.activityId === activity.id ? "border-primary bg-primary/5" : "border-border"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: `h-4 w-4 shrink-0 rounded-full border-2 ${session.activityId === activity.id ? "border-primary" : "border-muted-foreground"} grid place-items-center`, children: session.activityId === activity.id && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium truncate", children: activity.title })
        ] }),
        /* @__PURE__ */ jsx("img", { src: activityImage(activity, index), alt: activity.title, className: "h-10 w-12 rounded-md object-cover shrink-0" })
      ] }, activity.id)) }) : /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-destructive", children: "No activities available right now." }),
      errors.activity && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: errors.activity }),
      gameDetailsLoading && session.activityId && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Loading game variant..." }),
      errors.game && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: errors.game })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold", children: "Choose your Package" }),
        session.package && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setOpen(true), className: "rounded-full bg-purple-100 text-primary px-4 py-1 text-xs font-medium", children: "Change Package" })
      ] }),
      session.package ? /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-xl border-2 border-primary p-4 grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold", children: session.package.name }),
          session.package.short_description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: session.package.short_description }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-lg font-bold", children: [
            formatPrice(session.package.price),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "One Time Payment" })
          ] }),
          perUserLabel(session.package.price, session.package.max_users) && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: perUserLabel(session.package.price, session.package.max_users) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold mb-1", children: "This plan includes:" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: (session.package.features ?? []).map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-1.5 text-xs", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-success mt-0.5 shrink-0" }),
            f
          ] }, f)) })
        ] })
      ] }) : /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setOpen(true), disabled: packagesLoading, className: "mt-2 w-full rounded-xl border border-input p-2 flex justify-center disabled:opacity-50", children: /* @__PURE__ */ jsx("span", { className: "rounded-full bg-purple-100 text-primary px-5 py-1.5 text-sm font-medium", children: packagesLoading ? "Loading packages..." : "Choose Package" }) }),
      errors.package && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: errors.package })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-purple-50 p-4 text-xs text-foreground/80 space-y-1.5", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: "Schedule Your Session" }),
      /* @__PURE__ */ jsx("p", { children: "• Session access is valid for 5 days from the moment of payment activation." }),
      /* @__PURE__ */ jsx("p", { children: "• Share the session link with participants 10 minutes before scheduled start time." }),
      /* @__PURE__ */ jsx("p", { children: "• You can update your session date and time once from your HR Dashboard." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", htmlFor: "session-date", children: "Schedule Date" }),
        /* @__PURE__ */ jsxs(Popover, { open: dateOpen, onOpenChange: setDateOpen, children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { id: "session-date", type: "button", variant: "outline", className: `mt-1.5 w-full justify-between px-4 py-2.5 text-sm font-normal ${errors.scheduledDate ? "border-destructive" : "border-input"}`, children: [
            /* @__PURE__ */ jsx("span", { children: session.scheduledDate ? formatDisplayDate(session.scheduledDate) : "Select schedule date" }),
            /* @__PURE__ */ jsx(Calendar$1, { className: "h-4 w-4 text-muted-foreground" })
          ] }) }),
          /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: selectedScheduleDate, disabled: disabledScheduleDays, defaultMonth: selectedScheduleDate ?? /* @__PURE__ */ new Date(`${todayStr}T00:00:00`), onSelect: (date) => {
            if (!date) {
              setSession((prev) => ({
                ...prev,
                scheduledDate: ""
              }));
              setErrors((prev) => ({
                ...prev,
                scheduledDate: void 0
              }));
              return;
            }
            const nextValue = formatDateInputValue(date);
            if (isAllowedScheduleDate(nextValue)) {
              setSession((prev) => ({
                ...prev,
                scheduledDate: nextValue
              }));
              setErrors((prev) => ({
                ...prev,
                scheduledDate: void 0
              }));
              setDateOpen(false);
              return;
            }
            setErrors((prev) => ({
              ...prev,
              scheduledDate: "Please select a date from today through the next 5 days"
            }));
          } }) })
        ] }),
        errors.scheduledDate && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: errors.scheduledDate }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Available dates: today through the next 5 days. Disabled dates are greyed out in the calendar." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", htmlFor: "session-time", children: "Start Time" }),
        /* @__PURE__ */ jsx("input", { id: "session-time", type: "time", value: session.scheduledTime, onChange: (e) => {
          setSession((prev) => ({
            ...prev,
            scheduledTime: e.target.value
          }));
          setErrors((prev) => ({
            ...prev,
            scheduledTime: void 0
          }));
        }, className: `mt-1.5 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.scheduledTime ? "border-destructive" : "border-input"}` }),
        errors.scheduledTime && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: errors.scheduledTime })
      ] })
    ] }),
    /* @__PURE__ */ jsx(PillButton, { type: "submit", variant: "primary", disabled: isSaving || !session.package || !session.scheduledDate || !session.scheduledTime || !session.gameId, children: isSaving ? "Saving..." : "Continue to Payment" }),
    open && /* @__PURE__ */ jsx(PackageModal, { packages: packages ?? [], current: session.package, onClose: () => setOpen(false), onConfirm: (p) => {
      setSession((prev) => ({
        ...prev,
        package: p
      }));
      setErrors((prev) => ({
        ...prev,
        package: void 0
      }));
      setOpen(false);
    } })
  ] });
}
function PackageModal({
  packages,
  current,
  onClose,
  onConfirm
}) {
  const [sel, setSel] = useState(current ?? packages[0] ?? null);
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/50 p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-3xl shadow-elevated w-full max-w-5xl max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-6 border-b border-border", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: "Choose your Package" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "h-9 w-9 grid place-items-center rounded-full hover:bg-muted", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: packages.map((p) => {
      const active = sel?.id === p.id;
      const features = Array.isArray(p.features) ? p.features : [];
      return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSel(p), className: `text-left rounded-2xl border-2 p-5 transition ${active ? "border-primary shadow-glow" : "border-border"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold", children: p.name }),
          /* @__PURE__ */ jsx("span", { className: `h-5 w-5 rounded-full border-2 grid place-items-center ${active ? "border-primary" : "border-muted-foreground"}`, children: active && /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-primary" }) })
        ] }),
        p.short_description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2 min-h-[32px]", children: p.short_description }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-xl font-bold", children: [
          formatPrice(p.price),
          " ",
          perUserLabel(p.price, p.max_users) && /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-muted-foreground", children: perUserLabel(p.price, p.max_users) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-muted-foreground", children: " One Time Payment" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold mt-4", children: "This plan includes:" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1.5", children: features.map((f) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-xs", children: [
          /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-success mt-0.5 shrink-0" }),
          f
        ] }, f)) })
      ] }, p.id);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3 p-6 border-t border-border", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-full border border-border px-6 py-2.5 text-sm", children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { type: "button", disabled: !sel, onClick: () => sel && onConfirm(sel), className: "rounded-full bg-gradient-primary text-white px-8 py-2.5 text-sm font-medium shadow-glow disabled:opacity-50", children: "Confirm" })
    ] })
  ] }) });
}
const PAYMENT_METHODS = [{
  id: "upi",
  label: "UPI"
}, {
  id: "paytm",
  label: "Paytm"
}, {
  id: "card",
  label: "Debit/Credit Card"
}, {
  id: "netbanking",
  label: "Net Banking"
}];
const CONSENT_ITEMS = [{
  key: "authorization",
  text: "I confirm I am an authorized representative of my organization and have approval to create this session on its behalf."
}, {
  key: "participant_consent",
  text: "I confirm that all participants have been informed about this session and have consented to participate."
}, {
  key: "terms_accepted",
  text: "I have read and agree to the Terms & Conditions and Privacy Policy."
}, {
  key: "non_refundable_accepted",
  text: "I understand this is a non-refundable digital service after activation, except in cases of verified technical failure on Zoventro's platform as outlined in the Refund Policy."
}, {
  key: "validity_accepted",
  text: "I understand the session must be used within 5 days of activation, after which all access will expire automatically."
}];
function PaymentStep({
  bookingId,
  session,
  registration,
  onComplete
}) {
  const [isPaying, setIsPaying] = useState(false);
  const [errors, setErrors] = useState({});
  const [gstNumber, setGstNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [consents, setConsents] = useState({
    authorization: false,
    participant_consent: false,
    terms_accepted: false,
    non_refundable_accepted: false,
    validity_accepted: false
  });
  const price = session.package?.price ?? 0;
  const {
    priceNum,
    gst,
    total
  } = calculateBillingTotals(price);
  const fmt = formatPrice;
  const toggleConsent = (key) => {
    setConsents((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    if (errors.consents) setErrors((prev) => ({
      ...prev,
      consents: void 0
    }));
  };
  const handleSubmit = async (e) => {
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
      consents
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
        gst_number: gstNumber.trim(),
        billing_address: billingAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pin_code: pinCode.trim(),
        payment_method: paymentMethod,
        consents
      });
      toastSuccess("Payment completed successfully.");
      onComplete(data.invitation_link);
    } catch (err) {
      const {
        message,
        fieldErrors
      } = parseApiError(err);
      setErrors(mapApiFieldErrors(fieldErrors));
      toastError(message);
    } finally {
      setIsPaying(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Review & Activate Your Team Activity" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Complete payment to generate your access link and start your activity." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold mb-2", children: "Organizer Details" }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border p-4 grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Full Name" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: registration.name || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Official Email ID" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: registration.email || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Company / Organization Name" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: registration.company_name || "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Company Website  (http://exmpale.com/)" }),
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: registration.company_website || "—" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Section, { title: "Activity & Package", children: [
      /* @__PURE__ */ jsx(Row, { k: "Selected Activity", v: session.activityTitle || "—" }),
      /* @__PURE__ */ jsx(Row, { k: "Selected Package", v: session.package ? `${session.package.name} @ ${formatPrice(session.package.price)}` : "—" })
    ] }),
    /* @__PURE__ */ jsxs(Section, { title: "Schedule", children: [
      /* @__PURE__ */ jsx(Row, { k: "Date", v: session.scheduledDate ? formatDisplayDate(session.scheduledDate) : "—" }),
      /* @__PURE__ */ jsx(Row, { k: "Start Time", v: session.scheduledTime ? formatDisplayTime(normalizeScheduledTime(session.scheduledTime)) : "—" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Billing Details (GST Invoice) (Ex.29ABCDE1234F1Z5)" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "A GST invoice will be automatically generated and sent to your registered email after successful payment" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3", children: [
        /* @__PURE__ */ jsx(BField, { label: "GST Number *", placeholder: "Enter GST Number (Ex.29ABCDE1234F1Z5)", value: gstNumber, onChange: (value) => setGstNumber(value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15)), error: errors.gst_number }),
        /* @__PURE__ */ jsx(BField, { label: "Billing Address", placeholder: "Enter Billing Address", value: billingAddress, onChange: setBillingAddress, error: errors.billing_address }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(BField, { label: "City", placeholder: "Enter City", value: city, onChange: setCity, error: errors.city }),
          /* @__PURE__ */ jsx(BField, { label: "State", placeholder: "Select State", value: state, onChange: setState, error: errors.state, options: INDIAN_STATES })
        ] }),
        /* @__PURE__ */ jsx(BField, { label: "PIN Code", placeholder: "Enter PIN Code", value: pinCode, onChange: (value) => setPinCode(value.replace(/\D/g, "").slice(0, 6)), error: errors.pin_code })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border p-4 space-y-2", children: [
      /* @__PURE__ */ jsx(Row, { k: "Package Price", v: fmt(priceNum) }),
      /* @__PURE__ */ jsx(Row, { k: "GST (18%)", v: fmt(gst) }),
      /* @__PURE__ */ jsx(Row, { k: "Additional Charges", v: "₹0" }),
      /* @__PURE__ */ jsx("div", { className: "border-t border-border pt-2.5 mt-2.5", children: /* @__PURE__ */ jsx(Row, { k: "Total Payable", v: fmt(total), bold: true }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold mb-2", children: "Select payment Method" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer ${paymentMethod === m.id ? "border-primary bg-primary/5" : "border-input"}`, children: [
        /* @__PURE__ */ jsx("input", { type: "radio", name: "pay", checked: paymentMethod === m.id, onChange: () => {
          setPaymentMethod(m.id);
          setErrors((prev) => ({
            ...prev,
            payment_method: void 0
          }));
        }, className: "accent-primary" }),
        m.label
      ] }, m.id)) }),
      errors.payment_method && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: errors.payment_method })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-purple-50 p-4 space-y-2 text-xs", children: [
      CONSENT_ITEMS.map(({
        key,
        text
      }) => /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: consents[key], onChange: () => toggleConsent(key), className: "mt-0.5 accent-primary" }),
        /* @__PURE__ */ jsx("span", { children: text })
      ] }, key)),
      errors.consents && /* @__PURE__ */ jsx("p", { className: "text-destructive", children: errors.consents })
    ] }),
    /* @__PURE__ */ jsx(PillButton, { type: "submit", variant: "primary", disabled: isPaying || !bookingId, children: isPaying ? "Processing..." : "Pay & Activate Event" })
  ] });
}
function BField({
  label,
  placeholder,
  value,
  onChange,
  error,
  options
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium", children: label }),
    options ? /* @__PURE__ */ jsxs("select", { value, onChange: (e) => onChange(e.target.value), className: `mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? "border-destructive" : "border-input"}`, children: [
      /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: placeholder }),
      options.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
    ] }) : /* @__PURE__ */ jsx("input", { type: "text", placeholder, value, onChange: (e) => onChange(e.target.value), className: `mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? "border-destructive" : "border-input"}` }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-destructive", children: error })
  ] });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold mb-2", children: title }),
    /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border p-4 space-y-2", children })
  ] });
}
function Row({
  k,
  v,
  bold
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsx("span", { className: bold ? "font-bold text-base" : "font-medium", children: v })
  ] });
}
function SuccessCard({
  invitationLink,
  onReset
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
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl mt-12 rounded-3xl bg-card shadow-elevated p-10 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto h-16 w-16 rounded-full bg-success/15 grid place-items-center", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-9 w-9 text-success" }) }),
    /* @__PURE__ */ jsx("h2", { className: "mt-5 text-3xl font-bold", children: "Your Team Activity is Ready!" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "Congratulations! Your activity has been successfully activated." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-2xl border border-border p-5 text-left", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Event Access Link" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Share this link with participants 10 minutes before the start time" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 rounded-lg border border-input bg-muted px-4 py-2.5 text-sm font-mono truncate", children: joinUrl ?? "Link will appear after activation" }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: copyLink, disabled: !joinUrl, className: "inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-white px-4 py-2.5 text-sm font-medium disabled:opacity-50", children: [
          /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
          " Copy"
        ] })
      ] })
    ] }),
    !authed && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Log in with your registered email to manage this event from the dashboard." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-3 justify-center", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "rounded-full border border-border px-6 py-2.5 text-sm", children: "Go to Home Page" }),
      authed ? /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "rounded-full bg-gradient-primary text-white px-6 py-2.5 text-sm font-semibold shadow-glow", children: "Go to Dashboard" }) : /* @__PURE__ */ jsx(Link, { to: "/login", search: {
        redirect: "/dashboard"
      }, className: "rounded-full bg-gradient-primary text-white px-6 py-2.5 text-sm font-semibold shadow-glow", children: "Login to Dashboard" })
    ] })
  ] });
}
export {
  CreatePage as component
};
