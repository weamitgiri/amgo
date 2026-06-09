import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { organizerService } from "@/api/services/organizer.service";
import type { OrganizerProfileResponse } from "@/api/types/organizer";
import { toastError, toastSuccess } from "@/lib/toast";

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

export const Route = createFileRoute("/profile")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Edit Profile — Zoventro" }] }),
  component: ProfilePage,
});

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
      navigate({ to: "/login", search: { redirect: "/profile" } });
    }
  }, [navigate]);

  const { data, isLoading, isError } = useQuery<OrganizerProfileResponse, Error>({
    queryKey: ["organizerProfile"],
    queryFn: () => organizerService.getProfile(),
    retry: false,
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
    mutationFn: () =>
      organizerService.updateProfile({
        name: name.trim(),
        company_name: companyName.trim(),
        company_website: companyWebsite.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
      }),
    onSuccess: () => {
      toastSuccess("Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["organizerDashboard"] });
    },
    onError: (err: Error) => {
      toastError(err.message || "Failed to update profile.");
    },
  });

  const saveBillingMutation = useMutation({
    mutationFn: () =>
      organizerService.updateBilling({
        gst_number: gstNumber.trim(),
        billing_address: billingAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pin_code: pinCode.trim(),
      }),
    onSuccess: () => {
      toastSuccess("Billing details updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
    },
    onError: (err: Error) => {
      toastError(err.message || "Failed to update billing details.");
    },
  });

  const organizerName = data?.organizer?.name ?? "Organizer";
  const organizerEmail = data?.organizer?.email ?? "";
  const hasBilling = !!data?.billing?.billing_id;

  return (
    <DashboardShell
      crumb="Organizer Dashboard / Edit Profile"
      userName={organizerName}
      userEmail={organizerEmail}
      onLogout={() => {
        apiClient.setToken(null);
        navigate({ to: "/login", search: { redirect: "/profile" } });
      }}
    >
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your organizer details, billing information, and account preferences.
        </p>
      </section>

      {isLoading ? (
        <section className="rounded-2xl bg-white p-8 shadow-card text-center text-sm text-muted-foreground">
          Loading profile…
        </section>
      ) : isError ? (
        <section className="rounded-2xl bg-white p-8 shadow-card text-center text-sm text-destructive">
          Unable to load profile. Please try again or re-login.
        </section>
      ) : (
        <>
          <section className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-bold">Organizer Details</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Update your name and organization information. Email cannot be changed here.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <BField label="Full Name" value={name} onChange={setName} />
              <BField label="Official Email ID" type="email" value={email} onChange={() => {}} readOnly />
              <BField label="Company / Organization Name" value={companyName} onChange={setCompanyName} />
              <BField label="Company Website" value={companyWebsite} onChange={setCompanyWebsite} />
              <BField label="Designation" value={designation} onChange={setDesignation} />
              <BField label="Phone Number" value={phone} onChange={setPhone} />
            </div>
            <button
              type="button"
              disabled={saveProfileMutation.isPending || !name.trim() || !companyName.trim()}
              onClick={() => saveProfileMutation.mutate()}
              className="mt-5 group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow text-sm font-medium disabled:opacity-50"
            >
              {saveProfileMutation.isPending ? "Saving…" : "Save Changes"}
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-bold">Billing Details</h2>
            {!hasBilling ? (
              <p className="text-xs text-muted-foreground mt-2">
                Billing details will appear after you complete your first booking payment.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mt-1">
                  From your latest booking (ID: {data?.billing?.booking_id}).
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <BField label="GST Number" value={gstNumber} onChange={setGstNumber} />
                  <BField label="Billing Address" value={billingAddress} onChange={setBillingAddress} />
                  <BField label="City" value={city} onChange={setCity} />
                  <BField label="State" value={state} onChange={setState} options={INDIAN_STATES} />
                  <BField label="PIN Code" value={pinCode} onChange={setPinCode} />
                </div>
                <button
                  type="button"
                  disabled={
                    saveBillingMutation.isPending ||
                    !billingAddress.trim() ||
                    !city.trim() ||
                    !state.trim() ||
                    !pinCode.trim()
                  }
                  onClick={() => saveBillingMutation.mutate()}
                  className="mt-5 group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow text-sm font-medium disabled:opacity-50"
                >
                  {saveBillingMutation.isPending ? "Updating…" : "Change and Update"}
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </>
            )}
          </section>
        </>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-bold">Payment Details</h2>
        <p className="text-xs text-muted-foreground mt-1">We do not store or save any payment details.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-bold">Delete Data</h2>
        <p className="text-xs text-muted-foreground mt-1">You can delete all your data and remove your account</p>
        <button
          type="button"
          onClick={() => toastError("Please contact support to delete your account.")}
          className="mt-4 rounded-full border border-primary/50 text-primary px-5 py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
        >
          Delete Data &amp; Account
        </button>
      </section>
    </DashboardShell>
  );
}

function BField({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  options?: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="" disabled>
            Select {label}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
            readOnly ? "bg-muted/40 cursor-not-allowed text-muted-foreground" : ""
          }`}
        />
      )}
    </label>
  );
}
