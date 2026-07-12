import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { D as DashboardShell } from "./DashboardShell-DnxArFqU.js";
import { i as isOrganizerAuthenticated, a as apiClient } from "./router-qdPwl0jo.js";
import { o as organizerService } from "./organizer.service-D9SFzC32.js";
import { t as toastError, a as toastSuccess } from "./toast-B5Q8Bvxc.js";
import "./Flogo-BFeWNg6Z.js";
import "./socket-Bwou9MYK.js";
import "socket.io-client";
import "sonner";
import "./config-qISbZfHI.js";
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
function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect: "/profile"
        }
      });
    }
  }, [navigate]);
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["organizerProfile"],
    queryFn: () => organizerService.getProfile(),
    retry: false
  });
  useEffect(() => {
    if (!data?.organizer) return;
    const o = data.organizer;
    setName(o.name ?? "");
    setEmail(o.email ?? "");
    setCompanyName(o.company_name ?? "");
    setCompanyWebsite(o.company_website ?? "");
    setDesignation(o.designation ?? "");
    setPhone(o.phone ?? "");
    const b = data.billing;
    if (b) {
      setGstNumber(b.gst_number ?? "");
      setBillingAddress(b.billing_address ?? "");
      setCity(b.city ?? "");
      setState(b.state ?? "");
      setPinCode(b.pin_code ?? "");
    }
  }, [data]);
  const saveProfileMutation = useMutation({
    mutationFn: () => organizerService.updateProfile({
      name: name.trim(),
      company_name: companyName.trim(),
      company_website: companyWebsite.trim(),
      designation: designation.trim(),
      phone: phone.trim()
    }),
    onSuccess: () => {
      toastSuccess("Profile updated successfully.");
      queryClient.invalidateQueries({
        queryKey: ["organizerProfile"]
      });
      queryClient.invalidateQueries({
        queryKey: ["organizerDashboard"]
      });
    },
    onError: (err) => {
      toastError(err.message || "Failed to update profile.");
    }
  });
  const saveBillingMutation = useMutation({
    mutationFn: () => organizerService.updateBilling({
      gst_number: gstNumber.trim(),
      billing_address: billingAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      pin_code: pinCode.trim()
    }),
    onSuccess: () => {
      toastSuccess("Billing details updated successfully.");
      queryClient.invalidateQueries({
        queryKey: ["organizerProfile"]
      });
    },
    onError: (err) => {
      toastError(err.message || "Failed to update billing details.");
    }
  });
  const deactivateMutation = useMutation({
    mutationFn: () => organizerService.deleteAccount(),
    onSuccess: () => {
      toastSuccess("Your account has been deactivated.");
      apiClient.setToken(null);
      navigate({
        to: "/login",
        search: {
          redirect: "/dashboard"
        }
      });
    },
    onError: (err) => {
      toastError(err.message || "Failed to deactivate account.");
    }
  });
  const organizerName = data?.organizer?.name ?? "Organizer";
  const organizerEmail = data?.organizer?.email ?? "";
  const hasBilling = !!data?.billing?.billing_id;
  return /* @__PURE__ */ jsxs(DashboardShell, { crumb: "Organizer Dashboard / Edit Profile", userName: organizerName, userEmail: organizerEmail, onLogout: () => {
    apiClient.setToken(null);
    navigate({
      to: "/login",
      search: {
        redirect: "/profile"
      }
    });
  }, children: [
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Edit Profile" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Update your organizer details, billing information, and account preferences." })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("section", { className: "rounded-2xl bg-white p-8 shadow-card text-center text-sm text-muted-foreground", children: "Loading profile…" }) : isError ? /* @__PURE__ */ jsx("section", { className: "rounded-2xl bg-white p-8 shadow-card text-center text-sm text-destructive", children: "Unable to load profile. Please try again or re-login." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Organizer Details" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Update your name and organization information. Email cannot be changed here." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(BField, { label: "Full Name", value: name, onChange: setName }),
          /* @__PURE__ */ jsx(BField, { label: "Official Email ID", type: "email", value: email, onChange: () => {
          }, readOnly: true }),
          /* @__PURE__ */ jsx(BField, { label: "Company / Organization Name", value: companyName, onChange: setCompanyName }),
          /* @__PURE__ */ jsx(BField, { label: "Company Website", value: companyWebsite, onChange: setCompanyWebsite })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", disabled: saveProfileMutation.isPending || !name.trim() || !companyName.trim(), onClick: () => saveProfileMutation.mutate(), className: "mt-5 group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow text-sm font-medium disabled:opacity-50", children: [
          saveProfileMutation.isPending ? "Saving…" : "Save Changes",
          /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Billing Details" }),
        !hasBilling ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Billing details will appear after you complete your first booking payment." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "From your latest booking (ID: ",
            data?.billing?.booking_id,
            ")."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(BField, { label: "GST Number", value: gstNumber, onChange: setGstNumber }),
            /* @__PURE__ */ jsx(BField, { label: "Billing Address", value: billingAddress, onChange: setBillingAddress }),
            /* @__PURE__ */ jsx(BField, { label: "City", value: city, onChange: setCity }),
            /* @__PURE__ */ jsx(BField, { label: "State", value: state, onChange: setState, options: INDIAN_STATES }),
            /* @__PURE__ */ jsx(BField, { label: "PIN Code", value: pinCode, onChange: setPinCode })
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "button", disabled: saveBillingMutation.isPending || !billingAddress.trim() || !city.trim() || !state.trim() || !pinCode.trim(), onClick: () => saveBillingMutation.mutate(), className: "mt-5 group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow text-sm font-medium disabled:opacity-50", children: [
            saveBillingMutation.isPending ? "Updating…" : "Change and Update",
            /* @__PURE__ */ jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Payment Details" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "We do not store or save any payment details." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Deactivate Account" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Deactivating your account will permanently disable your login access and stop all communications from Zoventro. Billing and invoice records will be retained as required under the GST Act. This action is permanent and cannot be undone." }),
      /* @__PURE__ */ jsx("button", { type: "button", disabled: deactivateMutation.isPending, onClick: () => {
        const confirmed = window.confirm("Are you sure you want to deactivate your account?\n\n• Your login access will be permanently disabled.\n• Billing and GST invoice records are retained for 7 years as required by law.\n• This cannot be undone from the app — contact support to reactivate.");
        if (confirmed) deactivateMutation.mutate();
      }, className: "mt-4 rounded-full border border-destructive/50 text-destructive px-5 py-2 text-sm font-medium hover:bg-destructive hover:text-white transition-colors disabled:opacity-50", children: deactivateMutation.isPending ? "Deactivating…" : "Deactivate Account" })
    ] })
  ] });
}
function BField({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
  options
}) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: label }),
    options ? /* @__PURE__ */ jsxs("select", { value, onChange: (e) => onChange(e.target.value), className: "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary", children: [
      /* @__PURE__ */ jsxs("option", { value: "", disabled: true, children: [
        "Select ",
        label
      ] }),
      options.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
    ] }) : /* @__PURE__ */ jsx("input", { type, value, readOnly, onChange: (e) => onChange(e.target.value), className: `mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${readOnly ? "bg-muted/40 cursor-not-allowed text-muted-foreground" : ""}` })
  ] });
}
export {
  ProfilePage as component
};
