import { U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { S as Subscribable, t as shallowEqualObjects, j as hashKey, i as getDefaultState, m as notifyManager, z as useQueryClient, n as noop, u as shouldThrowError, y as useNavigate, k as isOrganizerAuthenticated, e as apiClient } from "./router-DZhViOq_.js";
import { u as useQuery } from "./useQuery-CFSAAbqg.js";
import { D as DashboardShell } from "./DashboardShell-C_BG6hYI.js";
import { o as organizerService } from "./organizer.service-C7lkqR-i.js";
import { t as toastError, b as toastSuccess } from "./toast-s3ZTemWF.js";
import { A as ArrowRight } from "./arrow-right-h3or2hTG.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Logo-COJrqD4D.js";
import "./socket-BGH0xJ8N.js";
import "fs";
import "url";
import "./worker-entry-DAWxcb8x.js";
import "node:events";
import "http";
import "https";
import "./users-DLcloTUO.js";
import "./trophy-CKK5oUV7.js";
import "./chevron-right-B_AJoG7h.js";
import "./user-C3Lc9pkP.js";
import "./config-CafHMDrA.js";
var MutationObserver = class extends Subscribable {
  #client;
  #currentResult = void 0;
  #currentMutation;
  #mutateOptions;
  constructor(client, options) {
    super();
    this.#client = client;
    this.setOptions(options);
    this.bindMethods();
    this.#updateResult();
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    this.options = this.#client.defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: this.#currentMutation,
        observer: this
      });
    }
    if (prevOptions?.mutationKey && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (this.#currentMutation?.state.status === "pending") {
      this.#currentMutation.setOptions(this.options);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#currentMutation?.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    this.#updateResult();
    this.#notify(action);
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  reset() {
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = void 0;
    this.#updateResult();
    this.#notify();
  }
  mutate(variables, options) {
    this.#mutateOptions = options;
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = this.#client.getMutationCache().build(this.#client, this.options);
    this.#currentMutation.addObserver(this);
    return this.#currentMutation.execute(variables);
  }
  #updateResult() {
    const state = this.#currentMutation?.state ?? getDefaultState();
    this.#currentResult = {
      ...state,
      isPending: state.status === "pending",
      isSuccess: state.status === "success",
      isError: state.status === "error",
      isIdle: state.status === "idle",
      mutate: this.mutate,
      reset: this.reset
    };
  }
  #notify(action) {
    notifyManager.batch(() => {
      if (this.#mutateOptions && this.hasListeners()) {
        const variables = this.#currentResult.variables;
        const onMutateResult = this.#currentResult.context;
        const context = {
          client: this.#client,
          meta: this.options.meta,
          mutationKey: this.options.mutationKey
        };
        if (action?.type === "success") {
          try {
            this.#mutateOptions.onSuccess?.(
              action.data,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              action.data,
              null,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        } else if (action?.type === "error") {
          try {
            this.#mutateOptions.onError?.(
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              void 0,
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        }
      }
      this.listeners.forEach((listener) => {
        listener(this.#currentResult);
      });
    });
  }
};
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [companyName, setCompanyName] = reactExports.useState("");
  const [companyWebsite, setCompanyWebsite] = reactExports.useState("");
  const [designation, setDesignation] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [gstNumber, setGstNumber] = reactExports.useState("");
  const [billingAddress, setBillingAddress] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [state, setState] = reactExports.useState("");
  const [pinCode, setPinCode] = reactExports.useState("");
  reactExports.useEffect(() => {
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
  reactExports.useEffect(() => {
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
  const organizerName = data?.organizer?.name ?? "Organizer";
  const organizerEmail = data?.organizer?.email ?? "";
  const hasBilling = !!data?.billing?.billing_id;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DashboardShell, { crumb: "Organizer Dashboard / Edit Profile", userName: organizerName, userEmail: organizerEmail, onLogout: () => {
    apiClient.setToken(null);
    navigate({
      to: "/login",
      search: {
        redirect: "/profile"
      }
    });
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Edit Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Update your organizer details, billing information, and account preferences." })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl bg-white p-8 shadow-card text-center text-sm text-muted-foreground", children: "Loading profile…" }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl bg-white p-8 shadow-card text-center text-sm text-destructive", children: "Unable to load profile. Please try again or re-login." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Organizer Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Update your name and organization information. Email cannot be changed here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "Full Name", value: name, onChange: setName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "Official Email ID", type: "email", value: email, onChange: () => {
          }, readOnly: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "Company / Organization Name", value: companyName, onChange: setCompanyName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "Company Website", value: companyWebsite, onChange: setCompanyWebsite }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "Designation", value: designation, onChange: setDesignation }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "Phone Number", value: phone, onChange: setPhone })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: saveProfileMutation.isPending || !name.trim() || !companyName.trim(), onClick: () => saveProfileMutation.mutate(), className: "mt-5 group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow text-sm font-medium disabled:opacity-50", children: [
          saveProfileMutation.isPending ? "Saving…" : "Save Changes",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Billing Details" }),
        !hasBilling ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Billing details will appear after you complete your first booking payment." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "From your latest booking (ID: ",
            data?.billing?.booking_id,
            ")."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "GST Number", value: gstNumber, onChange: setGstNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "Billing Address", value: billingAddress, onChange: setBillingAddress }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "City", value: city, onChange: setCity }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "State", value: state, onChange: setState }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BField, { label: "PIN Code", value: pinCode, onChange: setPinCode })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: saveBillingMutation.isPending || !billingAddress.trim() || !city.trim() || !state.trim() || !pinCode.trim(), onClick: () => saveBillingMutation.mutate(), className: "mt-5 group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white pl-5 pr-1.5 py-1.5 shadow-glow text-sm font-medium disabled:opacity-50", children: [
            saveBillingMutation.isPending ? "Updating…" : "Change and Update",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Payment Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "We do not store or save any payment details." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Delete Data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "You can delete all your data and remove your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toastError("Please contact support to delete your account."), className: "mt-4 rounded-full border border-primary/50 text-primary px-5 py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors", children: "Delete Data & Account" })
    ] })
  ] });
}
function BField({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, readOnly, onChange: (e) => onChange(e.target.value), className: `mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${readOnly ? "bg-muted/40 cursor-not-allowed text-muted-foreground" : ""}` })
  ] });
}
export {
  ProfilePage as component
};
