import { io, type Socket } from "socket.io-client";

// The realtime server (apis/, Socket.IO on :6001) is a SEPARATE service, so its
// URL must be supplied at build time via VITE_SOCKET_URL — e.g.
// https://realtime.yourdomain.com (or the same origin if it's reverse-proxied).
//
// Previously this fell back to "http://localhost:6001" in BOTH dev and prod
// (the ternary was a no-op), so any production build without VITE_SOCKET_URL
// baked in tried to reach the user's own machine over plain http:// — which
// never connects, and is blocked as mixed content on an https:// page. Now:
//   • an explicit VITE_SOCKET_URL always wins (empty string is treated as unset);
//   • dev falls back to localhost:6001;
//   • prod falls back to the current page origin (correct wss/https + host when
//     the socket server is reverse-proxied on the same domain) and warns loudly.
const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();

const SOCKET_URL =
  configuredUrl && configuredUrl.length > 0
    ? configuredUrl
    : import.meta.env.DEV
      ? "http://localhost:6001"
      : typeof window !== "undefined"
        ? window.location.origin
        : "";

if (!configuredUrl && !import.meta.env.DEV && typeof window !== "undefined") {
  console.warn(
    `[socket] VITE_SOCKET_URL is not set for this production build; falling back to same-origin (${SOCKET_URL}). ` +
      "Set VITE_SOCKET_URL to the realtime server URL if it is not reverse-proxied on this domain."
  );
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
