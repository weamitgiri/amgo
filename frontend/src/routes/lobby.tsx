import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  HelpCircle, Clock, Star, Lightbulb, Hand, Search, Timer,
  Users, Gamepad2, Info, LogOut, User as UserIcon, Target, Award,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { participantService } from "@/api/services/participant.service";
import type { LobbySessionResponse } from "@/api/types/participant";
import { getSocket, disconnectSocket } from "@/lib/socket";
import {
  clearParticipantSession,
  getParticipantSession,
  saveParticipantSession,
} from "@/lib/participant-session";
import { resolveMediaUrl } from "@/utils/media";
import { toastError } from "@/lib/toast";
import mystery from "@/assets/mystery.jpg";

const AVATAR_GRADS = [
  "from-pink-500 to-orange-400",
  "from-cyan-400 to-blue-500",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
];

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  "detective-mystery": Target,
  "mystery-quest": Target,
  "cook-create": Award,
};

type LobbySearch = {
  invite_url?: string;
  game?: string;
};

export const Route = createFileRoute("/lobby")({
  validateSearch: (search: Record<string, unknown>): LobbySearch => ({
    invite_url: typeof search.invite_url === "string" ? search.invite_url : undefined,
    game: typeof search.game === "string" ? search.game : undefined,
  }),
  head: () => ({ meta: [{ title: "Lobby — Zoventro" }] }),
  component: LobbyPage,
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

function LobbyPage() {
  const navigate = useNavigate();
  const { invite_url: inviteUrl, game: gameSlug } = Route.useSearch();
  const [lobby, setLobby] = useState<LobbySessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const session = useMemo(() => getParticipantSession(), []);

  const fetchLobby = useCallback(async (groupId: string, participantId: string) => {
    const data = await participantService.getLobby(groupId, participantId);
    setLobby(data);
    setCountdown(data.lobby_phase === "lobby_timer" ? data.lobby_countdown_seconds : null);
    return data;
  }, []);

  useEffect(() => {
    if (!session?.groupId) {
      if (inviteUrl) {
        navigate({ to: "/join/$linkToken", params: { linkToken: inviteUrl } });
      } else {
        setLoading(false);
      }
      return;
    }

    if (inviteUrl || gameSlug) {
      saveParticipantSession({
        groupId: session.groupId,
        participantId: session.participantId,
        name: session.name,
        inviteUrl: inviteUrl ?? session.inviteUrl,
        gameSlug: gameSlug ?? session.gameSlug,
      });
    }

    setLoading(true);
    fetchLobby(session.groupId, session.participantId)
      .catch((err) => {
        toastError(err instanceof Error ? err.message : "Could not load lobby.");
      })
      .finally(() => setLoading(false));
  }, [session?.groupId, session?.participantId, inviteUrl, gameSlug, navigate, fetchLobby]);

  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;

    const socket = getSocket();
    socket.emit("join_lobby", {
      groupId: session.groupId,
      participantId: session.participantId,
    });

    const onLobbyUpdated = (payload: LobbySessionResponse) => {
      setLobby(payload);
      setCountdown(payload.lobby_phase === "lobby_timer" ? payload.lobby_countdown_seconds : null);
    };

    socket.on("lobby_updated", onLobbyUpdated);

    return () => {
      socket.off("lobby_updated", onLobbyUpdated);
    };
  }, [session?.groupId, session?.participantId]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((s) => (s !== null && s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const slug = gameSlug ?? session?.gameSlug ?? lobby?.activity.slug ?? "detective-mystery";

  useEffect(() => {
    if (!lobby?.is_group_full) return;
    if (
      lobby.lobby_phase === "ready" ||
      (lobby.lobby_phase === "lobby_timer" && countdown === 0)
    ) {
      navigate({ to: "/game", search: { game: slug } });
    }
  }, [lobby?.lobby_phase, lobby?.is_group_full, countdown, navigate, slug]);

  useEffect(() => {
    if (!session?.groupId || !session.participantId) return;
    const interval = setInterval(() => {
      fetchLobby(session.groupId, session.participantId).catch(() => undefined);
    }, 15000);
    return () => clearInterval(interval);
  }, [session?.groupId, session?.participantId, fetchLobby]);

  if (!session?.groupId && !inviteUrl) {
    return (
      <div className="min-h-screen bg-purple-900 text-white grid place-items-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold">No active lobby session</h1>
          <p className="mt-2 text-sm text-white/70">Join an activity using your invitation link first.</p>
          <Link to="/" className="mt-6 inline-block rounded-full bg-white/10 px-5 py-2 text-sm">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !lobby) {
    return (
      <div className="min-h-screen bg-purple-900 text-white grid place-items-center">
        <p className="text-white/70 animate-pulse">Loading lobby…</p>
      </div>
    );
  }

  const ActivityIcon = ACTIVITY_ICONS[lobby.activity.slug] ?? Gamepad2;
  const cover = resolveMediaUrl(lobby.activity.cover_image) ?? mystery;
  const iconUrl = lobby.activity.icon ? resolveMediaUrl(lobby.activity.icon) : null;
  const titleParts = lobby.activity.title.split(/\s+/);
  const titleLine1 = titleParts[0]?.toUpperCase() ?? "MYSTERY";
  const titleLine2 = titleParts.slice(1).join(" ").toUpperCase() || "QUEST";
  const caseTitle = lobby.game.title ?? lobby.activity.title;
  const caseTagline =
    lobby.game.tagline?.trim() ||
    stripHtml(lobby.game.case_summary || "").slice(0, 80) ||
    "Uncover the truth. Catch the culprit.";

  const mm = String(Math.floor((countdown ?? 0) / 60)).padStart(2, "0");
  const ss = String((countdown ?? 0) % 60).padStart(2, "0");
  const slots = Array.from({ length: lobby.group_capacity }, (_, i) => lobby.members[i] ?? null);

  return (
    <div className="min-h-screen bg-purple-900 text-white p-4 md:p-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold">{lobby.activity.title}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold">
            {initials(session?.name ?? "You")}
          </div>
          <span className="text-sm">{session?.name ?? "Participant"}</span>
        </div>
      </header>

      <main className="mt-4 grid gap-5 lg:grid-cols-[1fr_2fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 grid place-items-center min-h-[360px]">
          <div className="text-center">
            <div className="mx-auto h-44 w-44 rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-900 grid place-items-center shadow-glow ring-2 ring-white/20 overflow-hidden">
              {iconUrl ? (
                <img src={iconUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ActivityIcon className="h-20 w-20 text-white" />
              )}
            </div>
            <div className="mt-5 text-3xl font-black tracking-wide">{titleLine1}</div>
            <div className="text-xl font-semibold text-purple-300 -mt-1">{titleLine2}</div>
            <p className="mt-3 text-xs text-white/60">{lobby.group_name}</p>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative min-h-[360px]">
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" />
          <div className="relative p-6">
            <div className="inline-block rounded-xl border-2 border-cyan-400/60 bg-purple-900/40 backdrop-blur px-4 py-3">
              <div className="text-lg font-bold">Case: {caseTitle}</div>
              <div className="text-xs text-white/80">{caseTagline}</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 max-h-[360px] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Rules</h3>
          <ul className="space-y-3 text-sm">
            {lobby.rules.length > 0 ? (
              lobby.rules.map((rule) => (
                <Rule key={rule.id} icon={HelpCircle}>
                  {rule.rule_text}
                </Rule>
              ))
            ) : (
              <>
                <Rule icon={HelpCircle}>
                  You have {lobby.settings.max_questions} questions to find the truth.
                </Rule>
                <Rule icon={Clock}>
                  Each participant gets {Math.round(lobby.settings.question_response_secs / 60)} minutes to
                  answer.
                </Rule>
                <Rule icon={Timer}>
                  Game duration: {Math.round(lobby.settings.game_duration_secs / 60)} minutes
                </Rule>
              </>
            )}
          </ul>
        </div>
      </main>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/30 grid place-items-center">
              <Users className="h-5 w-5 text-purple-300" />
            </div>
            <h3 className="text-lg font-bold">Your Group & Status</h3>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <Stat label="Group Capacity" value={String(lobby.group_capacity)} />
            <Stat label="Joined" value={String(lobby.member_count)} />
            <Stat label="Remaining" value={String(lobby.remaining_slots)} />
          </div>
          <div className="mt-6 flex items-end gap-5 flex-wrap">
            {slots.map((member, index) =>
              member ? (
                <div key={member.id} className="text-center">
                  <div
                    className={`h-14 w-14 mx-auto rounded-full bg-gradient-to-br ${AVATAR_GRADS[index % AVATAR_GRADS.length]} grid place-items-center font-bold ring-2 ring-white/15 text-sm`}
                  >
                    {initials(member.name)}
                  </div>
                  <div className="mt-2 text-xs max-w-[88px] truncate">
                    {member.name}
                    {member.is_you ? " (You)" : ""}
                  </div>
                  <div className="text-[11px] text-cyan-300 capitalize">({member.status})</div>
                </div>
              ) : (
                <div key={`empty-${index}`} className="text-center">
                  <div className="h-14 w-14 mx-auto rounded-full bg-white/10 grid place-items-center ring-2 ring-white/10">
                    <UserIcon className="h-6 w-6 text-white/50" />
                  </div>
                  <div className="mt-2 text-[11px] text-white/65 max-w-[80px]">Waiting for participant</div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/30 grid place-items-center">
              <Gamepad2 className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Session Status</h3>
              <p className="text-xs text-white/60">{lobby.status_message}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] items-stretch">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex gap-3">
              <Info className="h-4 w-4 text-purple-300 mt-0.5 shrink-0" />
              <p className="text-xs text-white/80 leading-relaxed">
                {lobby.lobby_phase === "before_start" && (
                  <>
                    Scheduled start: <span className="text-white font-medium">{lobby.scheduled_start_label}</span>.
                    After the start time, your group must have all {lobby.group_capacity} members. Then a{" "}
                    {Math.round(lobby.settings.lobby_wait_secs / 60)}-minute lobby timer runs before the game
                    opens.
                  </>
                )}
                {lobby.lobby_phase === "waiting_members" && (
                  <>
                    The activity has started
                    {lobby.scheduled_start_label ? ` (${lobby.scheduled_start_label})` : ""}. Share the invite
                    link so {lobby.remaining_slots} more participant
                    {lobby.remaining_slots === 1 ? "" : "s"} can join. The {Math.round(lobby.settings.lobby_wait_secs / 60)}
                    -minute timer begins only after all {lobby.group_capacity} members are in the group.
                  </>
                )}
                {lobby.lobby_phase === "lobby_timer" && (
                  <>
                    All {lobby.group_capacity} participants have joined. The game started at the scheduled time
                    {lobby.scheduled_start_label ? ` (${lobby.scheduled_start_label})` : ""}. You will be
                    redirected to the game when the {Math.round(lobby.settings.lobby_wait_secs / 60)}-minute
                    lobby timer ends.
                  </>
                )}
                {lobby.lobby_phase === "ready" && <>Launching the game now…</>}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center min-w-[140px]">
              <div className="text-xs text-white/70">
                {lobby.lobby_phase === "lobby_timer"
                  ? "Game Starts in"
                  : lobby.lobby_phase === "before_start"
                    ? "Starts at"
                    : "Joined"}
              </div>
              <div className="mt-1 text-3xl font-black tabular-nums">
                {lobby.lobby_phase === "lobby_timer"
                  ? `${mm}:${ss}`
                  : lobby.lobby_phase === "before_start" && lobby.scheduled_start_label
                    ? lobby.scheduled_start_label.split(",").pop()?.trim() ?? "—"
                    : `${lobby.member_count}/${lobby.group_capacity}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              disconnectSocket();
              clearParticipantSession();
              const token = inviteUrl ?? session?.inviteUrl;
              if (token) {
                navigate({ to: "/join/$linkToken", params: { linkToken: token } });
              } else {
                navigate({ to: "/" });
              }
            }}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 text-white py-3 text-sm font-semibold hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Leave Lobby
          </button>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-white/55">
        Powered by <span className="text-white">Zoventro</span> · © 2026 zoventro.com All Rights Reserved
      </p>
    </div>
  );
}

function Rule({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <Icon className="h-4 w-4 text-purple-300 mt-0.5 shrink-0" />
      <span className="text-white/85">{children}</span>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="text-[11px] text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
