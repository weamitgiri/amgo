import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { redirect, createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Toaster as Toaster$1 } from "sonner";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const ENV = {
  // API Configuration
  // Use the Vite proxy in development to avoid browser CORS preflights.
  API_BASE_URL: "http://localhost:6001",
  API_TIMEOUT: parseInt("30000"),
  STORAGE_BASE_URL: "http://localhost/p/public/storage",
  // Authentication
  AUTH_TOKEN_KEY: "auth_token",
  REFRESH_TOKEN_KEY: "refresh_token",
  // Feature Flags
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_REPORTING: false,
  // Application Settings
  APP_NAME: "zgame",
  APP_VERSION: "1.0.0",
  ENVIRONMENT: "development",
  // Derived flags
  isDevelopment: false,
  isProduction: true
};
class ApiClient {
  baseUrl;
  timeout;
  abortControllers = /* @__PURE__ */ new Map();
  constructor(baseUrl = ENV.API_BASE_URL, timeout = ENV.API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }
  /**
   * Get authorization header with current token
   */
  getAuthHeader() {
    const token = this.getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }
  /**
   * Get stored authentication token
   */
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ENV.AUTH_TOKEN_KEY);
  }
  /**
   * Set authentication token
   */
  setToken(token) {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem(ENV.AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ENV.AUTH_TOKEN_KEY);
    }
  }
  /**
   * Perform HTTP request with timeout and error handling
   */
  async request(endpoint, options = {}) {
    const { auth = "organizer", timeout, ...fetchOptions } = options;
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = this.baseUrl ? `${this.baseUrl}${normalizedEndpoint}` : normalizedEndpoint;
    const requestId = `${url}-${Date.now()}`;
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout || this.timeout);
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        mode: fetchOptions.mode || "cors",
        credentials: fetchOptions.credentials || "include",
        referrerPolicy: fetchOptions.referrerPolicy || "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...auth !== "none" ? this.getAuthHeader() : {},
          ...fetchOptions.headers || {}
        },
        signal: abortController.signal
      });
      const body = await response.json().catch(() => ({}));
      const isEnvelope = body !== null && typeof body === "object" && "success" in body && "data" in body;
      if (!response.ok || isEnvelope && body.success === false) {
        const envelope = isEnvelope ? body : null;
        const error = new Error(
          envelope?.message || `HTTP Error ${response.status}`
        );
        throw Object.assign(error, {
          status: response.status,
          data: envelope?.error ?? body
        });
      }
      if (isEnvelope) {
        return body.data;
      }
      return body;
    } catch (error) {
      if (error instanceof TypeError) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes("fetch")) {
          console.error(
            `Network Error: Unable to connect to API at ${url}. Make sure your backend is running. Error: ${error.message}`
          );
        }
      }
      console.error(`API Error [${normalizedEndpoint}]:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
    }
  }
  /**
   * GET request
   */
  async get(endpoint, config) {
    return this.request(endpoint, {
      ...config,
      method: "GET"
    });
  }
  /**
   * POST request
   */
  async post(endpoint, data, config) {
    return this.request(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : void 0
    });
  }
  /**
   * PUT request
   */
  async put(endpoint, data, config) {
    return this.request(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : void 0
    });
  }
  /**
   * PATCH request
   */
  async patch(endpoint, data, config) {
    return this.request(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : void 0
    });
  }
  /**
   * DELETE request
   */
  async delete(endpoint, config) {
    return this.request(endpoint, {
      ...config,
      method: "DELETE"
    });
  }
  /**
   * Cancel all pending requests
   */
  cancelAll() {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }
}
const apiClient = new ApiClient();
const authApi = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.get("/auth/me"),
  refreshToken: (refreshToken) => apiClient.post("/auth/refresh", { refreshToken })
};
function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ENV.AUTH_TOKEN_KEY);
}
function isOrganizerAuthenticated() {
  return !!getAuthToken();
}
function restoreAuthToken() {
  const token = getAuthToken();
  if (token) {
    apiClient.setToken(token);
  }
}
async function requireOrganizerAuth(context) {
  if (typeof window === "undefined") return;
  const token = getAuthToken();
  if (token) return;
  const refresh = localStorage.getItem(ENV.REFRESH_TOKEN_KEY);
  if (refresh) {
    try {
      const resp = await authApi.refreshToken(refresh);
      apiClient.setToken(resp.token);
      localStorage.setItem(ENV.REFRESH_TOKEN_KEY, resp.refreshToken);
      return;
    } catch (e) {
    }
  }
  const pathname = context?.location?.pathname || "/dashboard";
  throw redirect({
    to: "/login",
    search: { redirect: pathname }
  });
}
const appCss = "/assets/styles-DsHOya86.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$g = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "riamit" },
      { name: "description", content: "riamit" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "riamit" },
      { property: "og:description", content: "riamit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "riamit" },
      { name: "twitter:description", content: "riamit" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2ce01284-8639-46e7-9132-06e0601ab597/id-preview-7e4802c7--4d65f549-c6b0-4538-8266-e79231d81535.lovable.app-1779016574040.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2ce01284-8639-46e7-9132-06e0601ab597/id-preview-7e4802c7--4d65f549-c6b0-4538-8266-e79231d81535.lovable.app-1779016574040.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$g.useRouteContext();
  useEffect(() => {
    restoreAuthToken();
  }, []);
  return /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { position: "bottom-right" })
  ] });
}
const $$splitComponentImporter$f = () => import("./terms-uhd8ALOM.js");
const Route$f = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: "Terms & Conditions — Zoventro"
    }, {
      name: "description",
      content: "The terms that govern your access and use of our platform."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./results-BjPOlpTK.js");
const Route$e = createFileRoute("/results")({
  head: () => ({
    meta: [{
      title: "Mystery Quest — Results"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./profile-DuxnpyU7.js");
const Route$d = createFileRoute("/profile")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({
    meta: [{
      title: "Edit Profile — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./privacy-C2j_953U.js");
const Route$c = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy — Zoventro"
    }, {
      name: "description",
      content: "How we collect, use, and protect your information while you use our platform."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./payments-DIZ4ihYb.js");
const Route$b = createFileRoute("/payments")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({
    meta: [{
      title: "Payment History — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./participants-DntZTYav.js");
const Route$a = createFileRoute("/participants")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({
    meta: [{
      title: "Participants — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./notifications-BrmtWmDZ.js");
const Route$9 = createFileRoute("/notifications")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({
    meta: [{
      title: "Notifications — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./login-I34aoS8R.js");
const Route$8 = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : void 0
  }),
  head: () => ({
    meta: [{
      title: "Login — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./lobby-CtDbD6c6.js");
const Route$7 = createFileRoute("/lobby")({
  validateSearch: (search) => ({
    invite_url: typeof search.invite_url === "string" ? search.invite_url : void 0,
    game: typeof search.game === "string" ? search.game : void 0
  }),
  head: () => ({
    meta: [{
      title: "Lobby — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./hr-results-CyN_doCo.js");
const Route$6 = createFileRoute("/hr-results")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({
    meta: [{
      title: "Results — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./groups-Bt6k8CId.js");
const Route$5 = createFileRoute("/groups")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({
    meta: [{
      title: "Groups — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./game-CWLHT7Io.js");
const Route$4 = createFileRoute("/game")({
  validateSearch: (search) => ({
    game: typeof search.game === "string" ? search.game : void 0
  }),
  head: () => ({
    meta: [{
      title: "Mystery Quest — Case Summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./dashboard-D0jeTrOk.js");
const Route$3 = createFileRoute("/dashboard")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({
    meta: [{
      title: "Organizer Dashboard — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./create-AJxVP_Uj.js");
const Route$2 = createFileRoute("/create")({
  validateSearch: (search) => ({
    activity: typeof search.activity === "string" ? search.activity : void 0
  }),
  head: () => ({
    meta: [{
      title: "Create Your Session — Zoventro"
    }, {
      name: "description",
      content: "Set up your account, choose a package, and start your team engagement experience in minutes."
    }, {
      property: "og:title",
      content: "Create Your Session — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-Bt4FS9AS.js");
const Route$1 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Zoventro — Interactive Team Engagement Platform"
    }, {
      name: "description",
      content: "Turn team activities into interactive experiences. Built for HR, designed for real engagement. Setup in minutes, no IT required."
    }, {
      property: "og:title",
      content: "Zoventro — Interactive Team Engagement"
    }, {
      property: "og:description",
      content: "Boost engagement, collaboration and energy without complicated setups."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./join._linkToken-DO4yrlt6.js");
const Route = createFileRoute("/join/$linkToken")({
  head: () => ({
    meta: [{
      title: "Join Activity — Zoventro"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TermsRoute = Route$f.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$g
});
const ResultsRoute = Route$e.update({
  id: "/results",
  path: "/results",
  getParentRoute: () => Route$g
});
const ProfileRoute = Route$d.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$g
});
const PrivacyRoute = Route$c.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$g
});
const PaymentsRoute = Route$b.update({
  id: "/payments",
  path: "/payments",
  getParentRoute: () => Route$g
});
const ParticipantsRoute = Route$a.update({
  id: "/participants",
  path: "/participants",
  getParentRoute: () => Route$g
});
const NotificationsRoute = Route$9.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => Route$g
});
const LoginRoute = Route$8.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$g
});
const LobbyRoute = Route$7.update({
  id: "/lobby",
  path: "/lobby",
  getParentRoute: () => Route$g
});
const HrResultsRoute = Route$6.update({
  id: "/hr-results",
  path: "/hr-results",
  getParentRoute: () => Route$g
});
const GroupsRoute = Route$5.update({
  id: "/groups",
  path: "/groups",
  getParentRoute: () => Route$g
});
const GameRoute = Route$4.update({
  id: "/game",
  path: "/game",
  getParentRoute: () => Route$g
});
const DashboardRoute = Route$3.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$g
});
const CreateRoute = Route$2.update({
  id: "/create",
  path: "/create",
  getParentRoute: () => Route$g
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$g
});
const JoinLinkTokenRoute = Route.update({
  id: "/join/$linkToken",
  path: "/join/$linkToken",
  getParentRoute: () => Route$g
});
const rootRouteChildren = {
  IndexRoute,
  CreateRoute,
  DashboardRoute,
  GameRoute,
  GroupsRoute,
  HrResultsRoute,
  LobbyRoute,
  LoginRoute,
  NotificationsRoute,
  ParticipantsRoute,
  PaymentsRoute,
  PrivacyRoute,
  ProfileRoute,
  ResultsRoute,
  TermsRoute,
  JoinLinkTokenRoute
};
const routeTree = Route$g._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  ENV as E,
  Route$8 as R,
  apiClient as a,
  Route$7 as b,
  Route$4 as c,
  Route$2 as d,
  Route as e,
  isOrganizerAuthenticated as i,
  router as r
};
