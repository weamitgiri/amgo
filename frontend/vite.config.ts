
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    // `vite preview` (used in production) rejects unknown Host headers by default.
    // Allow the live domains so requests proxied in by nginx are served.
    preview: {
      allowedHosts: ["zoventro.com", "www.zoventro.com"],
    },
    server: {
      allowedHosts: ["zoventro.com", "www.zoventro.com"],
      proxy: {
        "/v1": {
          target: process.env.VITE_API_PROXY_TARGET || "http://localhost:6001",
          changeOrigin: true,
        },
      },
    },
  },
});
