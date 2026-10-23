import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";
import { GameMusicPlayer } from "@/components/GameMusicPlayer";
import { requireOrganizerAuth, restoreAuthToken } from "@/lib/auth";
import { AUTH_CHANGED_EVENT } from "@/api/client";
import { ENV } from "@/config/environment";
import { disconnectSocket } from "@/lib/socket";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
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
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2ce01284-8639-46e7-9132-06e0601ab597/id-preview-7e4802c7--4d65f549-c6b0-4538-8266-e79231d81535.lovable.app-1779016574040.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const router = useRouter();

  useEffect(() => {
    restoreAuthToken();
  }, []);

  // One organizer per browser: whenever the stored token changes (logout, a
  // different login, a session the API rejected) drop the cached queries and the
  // organizer socket so nothing from the previous user is ever rendered.
  useEffect(() => {
    const onAuthChanged = () => {
      queryClient.clear();
      disconnectSocket();
      // Re-run route guards: a private page with no token redirects to login.
      router.invalidate();
    };
    // Another tab logged out or in as someone else. Mounted queries keep their
    // old data after clear(), so a tab showing a private page reloads.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== ENV.AUTH_TOKEN_KEY) return;
      queryClient.clear();
      const onPrivatePage = router.state.matches.some(
        (m) => router.looseRoutesById[m.routeId]?.options.beforeLoad === requireOrganizerAuth
      );
      if (onPrivatePage) window.location.reload();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <GameMusicPlayer />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
