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
import investigation from "@/assets/investigation-photos.png";

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
    if (!lobby) return;
    if (
      lobby.lobby_phase === "ready" ||
      (lobby.lobby_phase === "lobby_timer" && countdown === 0)
    ) {
      navigate({ to: "/game", search: { game: slug } });
    }
  }, [lobby, countdown, navigate, slug]);

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

  // Rules: prefer admin-authored rules, otherwise derive a full list from the
  // activity settings. Either way each row gets an icon from RULE_ICONS by order.
  const toMin = (secs: number) => Math.max(1, Math.round(secs / 60));
  const s = lobby.settings;
  const derivedRules: React.ReactNode[] =
    lobby.rules.length > 0
      ? lobby.rules.map((r) => r.rule_text)
      : [
          <>The Investigator has <b>{s.max_questions}</b> questions to examine any participant and establish the truth.</>,
          <>Each participant gets {toMin(s.question_response_secs)} minutes to answer.</>,
          <>No answer in time will cost <span className="text-amber-400 font-semibold">-10 points</span>.</>,
          <>Clue Rooms open after {toMin(s.clue_room_unlock_secs)} minutes.</>,
          ...(s.lie_detector_enabled
            ? [<>Use the Lie Detector round wisely to uncover suspicious answers. ({toMin(s.lie_detector_timer_secs)} minute round)</>]
            : []),
          <>Find the culprit before time runs out!</>,
          <>Game Duration: {toMin(s.game_duration_secs)} Minutes</>,
        ];

  const leaveLobby = () => {
    disconnectSocket();
    clearParticipantSession();
    const token = inviteUrl ?? session?.inviteUrl;
    if (token) {
      navigate({ to: "/join/$linkToken", params: { linkToken: token } });
    } else {
      navigate({ to: "/" });
    }
  };

  const timerLabel =
    lobby.lobby_phase === "lobby_timer"
      ? "Session Starts in"
      : lobby.lobby_phase === "before_start"
        ? "Starts at"
        : "Joined";
  const timerValue =
    lobby.lobby_phase === "lobby_timer"
      ? `${mm}:${ss}`
      : lobby.lobby_phase === "before_start" && lobby.scheduled_start_label
        ? lobby.scheduled_start_label.split(",").pop()?.trim() ?? "—"
        : `${lobby.member_count}/${lobby.group_capacity}`;

  return (
    <div className="min-h-screen bg-[#0a0715] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
        {/* Header */}
        <header className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#100b20]/80 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-bold tracking-wide">{lobby.activity.title}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-xs font-bold">
              {initials(session?.name ?? "You")}
            </div>
            <span className="text-sm text-white/90">{session?.name ?? "Participant"}</span>
          </div>
        </header>

        {/* Top row: badge / case / rules */}
        <main className="mt-6 grid gap-5 lg:grid-cols-[1fr_2fr_1.15fr]">
          <div className="grid place-items-center rounded-3xl p-6 min-h-[380px]">
            <div className="text-center">
              <div className="mx-auto grid h-48 w-48 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-900 shadow-[0_0_50px_-10px_rgba(168,85,247,0.6)] ring-2 ring-white/20">
                {iconUrl ? (
                  <img src={iconUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ActivityIcon className="h-24 w-24 text-white" />
                )}
              </div>
              <div className="mt-5 text-3xl font-black tracking-wide">{titleLine1}</div>
              <div className="-mt-1 text-xl font-semibold tracking-[0.2em] text-purple-300">{titleLine2}</div>
              <p className="mt-3 text-xs text-white/50">{lobby.group_name}</p>
            </div>
          </div>

          <div className="relative min-h-[380px] overflow-hidden rounded-3xl border border-white/10">
            <img src={cover || investigation} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
            <div className="relative p-6">
              <div className="inline-block max-w-[80%] rounded-2xl bg-black/45 px-5 py-3.5 backdrop-blur-sm">
                <div className="text-xl font-bold">Case: {caseTitle}</div>
                <div className="mt-0.5 text-sm text-white/75">{caseTagline}</div>
              </div>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1d1440] to-[#140e2b] p-6">
            <h3 className="mb-4 text-xl font-bold">Rules</h3>
            <ul className="space-y-3.5 text-sm">
              {derivedRules.map((rule, i) => (
                <Rule key={i} icon={RULE_ICONS[i % RULE_ICONS.length]}>
                  {rule}
                </Rule>
              ))}
            </ul>
          </div>
        </main>

        {/* Bottom row: group / session status */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1c1440] to-[#140e2b] p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold">Your Group &amp; Status</h3>
            </div>

            <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <StatCell label="Group Capacity" value={String(lobby.group_capacity)} />
              <StatCell label="Joined" value={String(lobby.member_count)} />
              <StatCell label="Remaining" value={String(lobby.remaining_slots)} />
            </div>

            <div className="mt-7 flex flex-wrap items-start gap-6">
              {slots.map((member, index) =>
                member ? (
                  <div key={member.id} className="w-[92px] text-center">
                    <div
                      className={`mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${AVATAR_GRADS[index % AVATAR_GRADS.length]} text-base font-bold ring-2 ring-white/15`}
                    >
                      {member.is_you ? initials(member.name) : member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="mt-2.5 truncate text-sm font-medium">
                      {member.is_you ? `${member.name} (You)` : member.name}
                    </div>
                    <div className="text-xs capitalize text-emerald-400">({member.status})</div>
                  </div>
                ) : (
                  <div key={`empty-${index}`} className="w-[92px] text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/5 ring-2 ring-white/10">
                      <UserIcon className="h-7 w-7 text-white/40" />
                    </div>
                    <div className="mt-2.5 text-xs leading-tight text-white/55">Waiting for participant</div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-purple-500/15 bg-gradient-to-b from-[#1c1440] to-[#140e2b] p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/20">
                <Gamepad2 className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Session Status</h3>
                <p className="text-xs text-white/55">Ensure all the participants have joined and groups are complete</p>
              </div>
            </div>

            <div className="mt-5 grid items-stretch gap-4 md:grid-cols-[1fr_auto]">
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                <p className="text-xs leading-relaxed text-white/75">
                  {lobby.lobby_phase === "before_start" && (
                    <>
                      Your group requires exactly {lobby.group_capacity} participants. Scheduled start:{" "}
                      <span className="font-medium text-white">{lobby.scheduled_start_label}</span>. The session will
                      start automatically once all participants have joined at the scheduled time. Please contact your
                      organiser to complete your group.
                    </>
                  )}
                  {lobby.lobby_phase === "waiting_members" && (
                    <>
                      Your group requires exactly {lobby.group_capacity} participants. Share the invite link so{" "}
                      {lobby.remaining_slots} more participant{lobby.remaining_slots === 1 ? "" : "s"} can join before
                      entry closes. Please contact your organiser to complete your group.
                    </>
                  )}
                  {lobby.lobby_phase === "lobby_timer" && (
                    <>
                      Your group requires exactly {lobby.group_capacity} participants. The session will start
                      automatically once all participants have joined. The timer shows the time remaining until the entry
                      window closes.
                    </>
                  )}
                  {lobby.lobby_phase === "ready" && <>All participants have joined. Launching the game now…</>}
                </p>
              </div>
              <div className="grid min-w-[150px] place-items-center rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#2a1a4d] to-[#1a1033] p-5 text-center">
                <div className="text-xs text-white/70">{timerLabel}</div>
                <div className="mt-1 text-4xl font-black tabular-nums">{timerValue}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={leaveLobby}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#e879f9] py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(168,85,247,0.7)] transition-opacity hover:opacity-90"
            >
              <LogOut className="h-4 w-4" /> Leave Lobby
            </button>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-white/45">
          Powered by <span className="text-white/80">Zoventro</span> · © 2026 zoventro.com All Rights Reserved
        </p>
      </div>
    </div>
  );
}

const RULE_ICONS: LucideIcon[] = [HelpCircle, Clock, Star, Lightbulb, Hand, Search, Timer];

function Rule({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-500/15">
        <Icon className="h-4 w-4 text-purple-300" />
      </span>
      <span className="text-white/85">{children}</span>
    </li>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
