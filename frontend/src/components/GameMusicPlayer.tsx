import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";
import { publicService } from "@/api/services/public.service";
import { getParticipantSession } from "@/lib/participant-session";
import { resolveMediaUrl } from "@/utils/media";

/**
 * Background music for the game a participant is playing (admin Music Manager).
 *
 * Mounted once at the root so the track keeps playing across the in-game pages
 * (lobby → brief → game) and stops as soon as the player leaves them (results,
 * rating, any other page). Plays only the activity's active track; when there
 * is none, renders nothing and plays nothing. If the browser blocks autoplay,
 * the music starts on the player's next tap/click/key press — the gesture is
 * only observed, never prevented, so game controls behave exactly as before.
 */

/** In-game pages of Mystery Quest and Cook & Create that play the activity's music. */
const MUSIC_ROUTES = ["/lobby", "/game", "/cookandcreate/lobby", "/cookandcreate/summary", "/cookandcreate/game"];
const GESTURE_EVENTS = ["pointerdown", "keydown", "touchend"] as const;
const MUTED_KEY = "zoventro_game_music_muted";
const VOLUME = 0.35;

function isMusicRoute(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return MUSIC_ROUTES.some((route) => path === route || path.endsWith(route));
}

export function GameMusicPlayer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inGame = isMusicRoute(pathname);

  const [src, setSrc] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRef = useRef<(() => void) | null>(null);
  const mutedRef = useRef(false);

  // Restore the player's mute choice (client only — no storage during SSR).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MUTED_KEY) === "1";
      mutedRef.current = saved;
      setMuted(saved);
    } catch {
      /* storage unavailable: default to unmuted */
    }
  }, []);

  // Which track (if any) belongs to the participant's game. Re-checked on every
  // in-game page change; the same track keeps playing without a restart.
  useEffect(() => {
    if (!inGame) {
      setSrc(null);
      return;
    }
    const groupId = getParticipantSession()?.groupId;
    if (!groupId) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    publicService
      .getGroupMusic(groupId)
      .then((track) => {
        if (cancelled) return;
        setSrc(track ? resolveMediaUrl(track.file_path) : null);
        setTitle(track?.title ?? "");
      })
      .catch(() => {
        // Music is optional: a failed lookup just means no music.
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [inGame, pathname]);

  // One audio element per track; torn down (stopped) when the track or the page changes.
  useEffect(() => {
    if (!src) {
      setBlocked(false);
      return;
    }
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;
    let disposed = false;

    const removeGestureListeners = () => {
      GESTURE_EVENTS.forEach((type) => document.removeEventListener(type, onGesture, true));
    };
    const tryPlay = () => {
      if (disposed || mutedRef.current || document.hidden) return;
      audio
        .play()
        .then(() => {
          if (disposed) return;
          setBlocked(false);
          removeGestureListeners();
        })
        .catch((err: unknown) => {
          if (disposed) return;
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            // Autoplay blocked: start on the next user interaction.
            setBlocked(true);
            GESTURE_EVENTS.forEach((type) =>
              document.addEventListener(type, onGesture, { capture: true, passive: true }),
            );
          }
          // Any other error (missing or unplayable file): stay silent.
        });
    };
    function onGesture(event: Event) {
      // The music button handles its own click (mute/unmute).
      if (event.target instanceof Element && event.target.closest("[data-game-music-toggle]")) return;
      removeGestureListeners();
      tryPlay();
    }
    const onVisibility = () => {
      if (document.hidden) audio.pause();
      else tryPlay();
    };

    document.addEventListener("visibilitychange", onVisibility);
    playRef.current = tryPlay;
    tryPlay();

    return () => {
      disposed = true;
      removeGestureListeners();
      document.removeEventListener("visibilitychange", onVisibility);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (audioRef.current === audio) audioRef.current = null;
      if (playRef.current === tryPlay) playRef.current = null;
    };
  }, [src]);

  const toggleMuted = () => {
    // Autoplay was blocked: this click is the interaction that starts the music.
    if (blocked && !muted) {
      playRef.current?.();
      return;
    }
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    try {
      localStorage.setItem(MUTED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) audioRef.current?.pause();
    else playRef.current?.();
  };

  if (!src) return null;

  const label = muted
    ? "Play background music"
    : blocked
      ? "Tap anywhere to start the background music"
      : "Mute background music";

  return (
    <button
      type="button"
      data-game-music-toggle
      onClick={toggleMuted}
      aria-label={label}
      aria-pressed={!muted}
      title={title ? `${label} — ${title}` : label}
      className={`fixed bottom-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur transition hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
        blocked && !muted ? "animate-pulse" : ""
      }`}
    >
      {muted || blocked ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
    </button>
  );
}
