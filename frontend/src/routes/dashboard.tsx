import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Share2, MessageCircle, Mail, Link2,
  Calendar, Clock, ShieldCheck, Download, Users, Boxes,
  UserMinus, MousePointerClick, Play, Info, CheckCircle2, Layers, X, AlertCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { organizerService } from "@/api/services/organizer.service";
import { toastError, toastSuccess } from "@/lib/toast";
import mystery from "@/assets/mystery.jpg";
import { resolveMediaUrl } from "@/utils/media";
import { formatJoinedAt } from "@/lib/format-datetime";
import { useOrganizerEventLive } from "@/hooks/useOrganizerEventLive";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Organizer Dashboard — Zoventro" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduled, setRescheduled] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const navigate = useNavigate();
  // Early auth check as fallback
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/dashboard" } });
    }
  }, [navigate]);

  const { booking, organizer, eventStats, isLoading, isError } = useOrganizerEventLive();

  const organizerName = organizer?.name ?? "Organizer";
  const organizerEmail = organizer?.email ?? "";
  const bookingImage = resolveMediaUrl(booking?.cover_image) ?? mystery;
  const bookingIcon = booking?.activity_icon ? resolveMediaUrl(booking.activity_icon) : null;
  const bookingId = booking?.booking_id;
    
  const activityName = booking?.activity_name ?? "Mystery Quest";
  const packageName = booking?.package_name ?? "Standard Pack";
  const maxUsers = eventStats?.event_progress?.max_participants ?? booking?.max_users ?? 50;
  const maxGroups = eventStats?.event_progress?.max_groups ?? Math.ceil(maxUsers / 5);
  const participantsJoined = eventStats?.event_progress?.participants_joined ?? booking?.registered_participants ?? 0;
  const groupsFormed = eventStats?.event_progress?.groups_formed ?? 0;
  const remainingToFormGroup = eventStats?.event_progress?.remaining_to_form_group ?? 0;
  const linkClicks = eventStats?.event_progress?.access_link_clicks ?? null;

  // Robust parsing of scheduled date/time from backend response.
  const parseDateTime = (
    dateValue: string | Date | null | undefined,
    timeValue: string | Date | null | undefined
  ): Date | null => {
    if (!dateValue || !timeValue) return null;

    let year: number | null = null;
    let month: number | null = null;
    let day: number | null = null;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (dateValue instanceof Date) {
      year = dateValue.getFullYear();
      month = dateValue.getMonth() + 1;
      day = dateValue.getDate();
    } else if (typeof dateValue === "string") {
      const normalized = dateValue.trim();
      const dateParts = normalized.split(/[-\/]/).map((s) => parseInt(s, 10));
      if (dateParts.length === 3) {
        [year, month, day] = dateParts;
      }
    }

    if (timeValue instanceof Date) {
      hours = timeValue.getHours();
      minutes = timeValue.getMinutes();
      seconds = timeValue.getSeconds();
    } else if (typeof timeValue === "string") {
      const timeParts = timeValue.trim().split(":").map((s) => parseInt(s, 10));
      if (timeParts.length >= 2) {
        [hours, minutes, seconds] = [timeParts[0] ?? 0, timeParts[1] ?? 0, timeParts[2] ?? 0];
      }
    }

    if (year === null || month === null || day === null) return null;

    const result = new Date(year, month - 1, day, hours, minutes, seconds);
    return Number.isNaN(result.getTime()) ? null : result;
  };

  const scheduledDateTime = parseDateTime(booking?.scheduled_date, booking?.scheduled_time);
  const currentScheduleDate = scheduledDateTime
    ? scheduledDateTime.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const currentScheduleTime = scheduledDateTime
    ? scheduledDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const eventStartsMs = scheduledDateTime ? scheduledDateTime.getTime() - now.getTime() : null;
  const eventStartsMin = eventStartsMs !== null ? Math.ceil(eventStartsMs / 60000) : 0;
  const eventStatusLabel = eventStartsMs === null
    ? "Schedule unavailable"
    : eventStartsMs <= 0
      ? Math.abs(eventStartsMs) <= 60000
        ? "Starting now"
        : `Started ${Math.abs(eventStartsMin)} min ago`
      : eventStartsMs < 3600000
        ? (() => {
            const minutes = Math.floor(eventStartsMs / 60000);
            const seconds = Math.floor((eventStartsMs % 60000) / 1000);
            return `Starting in ${minutes}m ${seconds}s`;
          })()
        : eventStartsMs < 86400000
          ? `Starting in ${Math.ceil(eventStartsMs / 3600000)} hr`
          : `Starting in ${Math.ceil(eventStartsMs / 86400000)} days`;

  const rescheduleCutoff = scheduledDateTime
    ? new Date(scheduledDateTime.getTime() - 60 * 60 * 1000)
    : null;
  const rescheduleUntilLabel = rescheduleCutoff
    ? `${rescheduleCutoff.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, ${rescheduleCutoff.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    : "—";
  const scheduledDayLabel = scheduledDateTime && scheduledDateTime.toDateString() === now.toDateString()
    ? "Today"
    : currentScheduleDate;
  const eventStatusText = scheduledDateTime
    ? `Your event is scheduled to begin at ${currentScheduleTime}, ${scheduledDayLabel}.`
    : "Schedule information is unavailable.";

  // min date = today in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split("T")[0];

  const handleReschedule = () => {
    if (!newDate || !newTime || !booking) return;
    // Prepare payload for API: scheduled_date in YYYY-MM-DD, scheduled_time as HH:mm:ss
    const scheduled_date = newDate; // input date is YYYY-MM-DD
    // normalize time: input is HH:MM (local) -> append :00 for seconds
    const scheduled_time = `${newTime}:00`;

    organizerService
      .updateSession({ booking_id: booking.booking_id, scheduled_date, scheduled_time })
      .then(() => {
        toastSuccess("Session rescheduled successfully.");
        setRescheduled(true);
        setRescheduleOpen(false);
        setNewDate("");
        setNewTime("");
        // Refresh dashboard and event stats
        // Note: react-query invalidation via window location refresh for simplicity
        window.location.reload();
      })
      .catch((err) => {
        toastError(err?.message || "Failed to reschedule. Please try again.");
      });
  };



  return (
    <>
    <DashboardShell
      crumb="Organizer Dashboard"
      userName={organizerName}
      userEmail={organizerEmail}
      onLogout={() => {
        apiClient.setToken(null);
        navigate({ to: "/login", search: { redirect: "/dashboard" } });
      }}
    >
      {isLoading ? (
        <div className="rounded-2xl bg-white p-8 shadow-card text-center">
          <p className="text-lg font-semibold">Loading dashboard...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white p-8 shadow-card text-center text-destructive">
          <p className="text-lg font-semibold">Unable to load dashboard data.</p>
          <p className="mt-2 text-sm text-muted-foreground">Please login again or contact support.</p>
        </div>
      ) : (
        <>
          {/* Session Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Session Overview</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your session, track participation, and prepare for the scheduled start.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground">Share Access Link</span>
              <button
                onClick={async () => {
                  const link = booking?.invitation_link ? `${window.location.origin}/join/${booking.invitation_link}` : "";
                  if (!link) return;
                  try {
                    await navigator.clipboard.writeText(link);
                    toastSuccess('Invitation link copied to clipboard');
                    setCopyStatus('Copied!');
                    setTimeout(() => setCopyStatus(''), 1800);
                  } catch (e) {
                    toastError('Unable to copy link');
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors shadow-sm"
              >
                <Link2 className="h-4 w-4 text-primary" />
                {copyStatus || 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Event Overview */}
      <section className="rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="p-6">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr_260px]">
            {/* Left: Activity Image */}
            <div className="relative h-[220px] w-full mt-2">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <img src={bookingImage} alt={activityName} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </div>
              {bookingIcon && (
                <img 
                  src={bookingIcon} 
                  alt={`${activityName} icon`} 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-[80%] max-w-[180px] object-contain drop-shadow-xl z-10" 
                />
              )}
            </div>

            {/* Center: Details */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></svg>
                </div>
                <h2 className="text-xl font-bold">{activityName}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking?.booking_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted/30 text-foreground/70'}`}>{booking?.booking_status ? booking.booking_status.charAt(0).toUpperCase()+booking.booking_status.slice(1) : 'Active'}</span>
                <span className="text-xs text-muted-foreground">Package ID: {booking?.booking_id ?? '—'}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                A story-driven team challenge where employees collaborate, question, and compete to solve the case.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
                <Field label="Package" value={packageName} />
                <Field label="Team Size" value={`Up to ${maxUsers} Participants`} />
                <Field label="Groups" value={<>{maxGroups} Groups <span className="text-xs text-muted-foreground font-normal">({Math.min(5, maxUsers)} per group)</span></>} />
              </div>
            </div>

            {/* Right: Reschedule Panel */}
            <div className="rounded-2xl bg-purple-50/60 border border-purple-100 p-5 flex flex-col">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>Reschedule</span>
                <span className="text-xs font-normal text-muted-foreground">• 1 time allowed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                You can reschedule your event once before starting the game.
              </p>
              {booking?.is_rescheduled || rescheduled ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Rescheduled successfully
                </div>
              ) : (
                <button
                  onClick={() => setRescheduleOpen(true)}
                  className="mt-3 w-full rounded-full border-2 border-primary text-primary bg-white text-sm font-semibold py-2 hover:bg-primary/5 transition-colors"
                >
                  Reschedule Event
                </button>
              )}
              <div className="mt-4 text-xs text-muted-foreground font-medium">Current Schedule</div>
              <div className="mt-1 flex items-center gap-3 text-sm font-medium">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> {currentScheduleDate}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {currentScheduleTime}</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground font-medium">Reschedule untill</div>
              <div className="text-sm font-medium">{rescheduleUntilLabel}</div>
            </div>
          </div>
        </div>

        {/* Bottom Info Strip */}
        <div className="border-t border-border/60 px-6 py-4">
          <div className="grid grid-cols-4 gap-0 text-sm">
            <div className="flex items-start gap-3 pr-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="font-semibold mt-0.5">{currentScheduleDate}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 border-l border-border/60 pl-4 pr-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">Start Time</div>
                <div className="font-semibold mt-0.5">{currentScheduleTime} <span className="text-xs text-muted-foreground font-normal">(IST)</span></div>
              </div>
            </div>
            <div className="flex items-start gap-3 border-l border-border/60 pl-4 pr-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">Access Validity</div>
                <div className="font-semibold mt-0.5">5 Days <span className="text-xs text-muted-foreground font-normal">from activation</span></div>
              </div>
            </div>
            <div className="flex items-start gap-3 border-l border-border/60 pl-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-primary shrink-0 mt-0.5">
                <Download className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">GST Invoice</div>
                <div className="font-semibold mt-0.5">
                  {booking?.booking_id ? (
                    <button
                      onClick={() => navigate({ to: `/payments`, search: { booking: String(booking.booking_id) } })}
                      className="text-primary hover:underline"
                    >
                      download
                    </button>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress + Status */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle icon={Layers} color="text-primary" bg="bg-primary/10">Event Progress</CardTitle>
          <div className="grid grid-cols-2 gap-6 mt-5">
            <Stat icon={Users} label="Participants Joined" value={`${participantsJoined}`} total={`${maxUsers}`} pct={Math.min(100, Math.round((participantsJoined / maxUsers) * 100))} />
            <Stat icon={Boxes} label="Groups Formed" value={`${groupsFormed}`} total={`${maxGroups}`} pct={maxGroups > 0 ? Math.min(100, Math.round((groupsFormed / maxGroups) * 100)) : 0} />
          </div>
          <div className="grid grid-cols-2 gap-6 mt-6 border-t border-border/60 pt-5">
            <Stat2 icon={UserMinus} label="Remaining to form group" value={`${remainingToFormGroup}`} sub={remainingToFormGroup === 1 ? "1 more participant needed" : `${remainingToFormGroup} more participants needed`} />
            <Stat2 icon={MousePointerClick} label="Access Link Clicks" value={linkClicks !== null ? String(linkClicks) : "0"} sub="Updates live when invite link is opened" />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold">Event Status</h3>
          <p className="text-sm text-muted-foreground mt-1">Ensure all the participants have joined and groups are complete.</p>
          <button className="mt-4 w-full rounded-full bg-gradient-primary text-white py-3 font-semibold inline-flex items-center justify-center gap-2 shadow-glow">
            <Play className="h-4 w-4" /> {eventStatusLabel}
          </button>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-purple-50 px-4 py-3 text-sm">
            <Info className="h-4 w-4 text-primary mt-0.5" />
            <span>{eventStatusText}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Minimum 5 players per group required.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Join within 15 minutes of the start time.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Teams form automatically, late joiners may miss participation.</li>
          </ul>
        </Card>
      </div>

      {/* Recent Groups + Participants */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle icon={Layers} color="text-primary" bg="bg-primary/10">Recent Groups</CardTitle>
            <a className="text-sm text-primary font-medium">View All Groups</a>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {eventStats?.recent_groups && eventStats.recent_groups.length > 0 ? (
              eventStats.recent_groups.map((g) => {
                const groupMembers = (eventStats.recent_participants || []).filter(
                  (p) => p.group_id === g.id || p.group_name === g.name
                );
                return (
                  <GroupCard key={g.id} num={g.id} count={g.fill_status} status={g.is_complete ? 'Complete' : 'In Progress'} tone={g.is_complete ? 'success' : 'warning'} members={groupMembers} />
                );
              })
            ) : (
              <div className="col-span-3 text-sm text-muted-foreground">No recent groups to show.</div>
            )}
          </div>
          {maxGroups > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              {groupsFormed} of {maxGroups} groups complete.
              {remainingToFormGroup > 0 ? ` ${remainingToFormGroup} more participant${remainingToFormGroup === 1 ? "" : "s"} needed for the current group.` : ""}
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle icon={Users} color="text-primary" bg="bg-primary/10">Recent Participants</CardTitle>
            <a className="text-sm text-primary font-medium">View All</a>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Ensure all the participants have joined and groups are complete</p>
          <div className="mt-4 max-h-[280px] overflow-y-auto pr-2 divide-y divide-border/60 scrollbar-thin">
            {eventStats?.recent_participants && eventStats.recent_participants.length > 0 ? (
              eventStats.recent_participants.map((p) => {
                const safeName = p.name || "?";
                const initials = safeName.split(" ").map((s: string) => s[0] || "").slice(0, 2).join("").toUpperCase();
                const gradients = ["from-emerald-300 to-emerald-400", "from-rose-300 to-rose-400", "from-cyan-300 to-cyan-400", "from-indigo-300 to-indigo-400", "from-amber-300 to-amber-400", "from-slate-400 to-slate-500"];
                const bgGrad = gradients[safeName.length % 6];
                
                return (
                  <div key={p.email} className="flex items-center gap-4 py-3.5 text-sm shrink-0">
                    <div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white bg-gradient-to-br ${bgGrad} shadow-sm`}>{initials}</div>
                    <div className="flex-1 min-w-0 font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{formatJoinedAt(p.joined_at)}</div>
                    <span className="rounded-full bg-purple-50 border border-purple-100 text-primary text-xs px-3 py-1 font-semibold whitespace-nowrap shadow-sm">{p.group_name ?? "—"}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground">No recent participants.</div>
            )}
          </div>
        </Card>
      </div>
    </>
      )}
    </DashboardShell>

    {/* Reschedule Modal */}
    {rescheduleOpen && (
      <RescheduleModal
        todayStr={todayStr}
        newDate={newDate}
        setNewDate={setNewDate}
        newTime={newTime}
        setNewTime={setNewTime}
        currentScheduleDate={currentScheduleDate}
        currentScheduleTime={currentScheduleTime}
        onClose={() => { setRescheduleOpen(false); setNewDate(""); setNewTime(""); }}
        onConfirm={handleReschedule}
      />
    )}
  </>
  );
}

function IconBtn({ children, onClick, ariaLabel }: { children: React.ReactNode; onClick?: () => void; ariaLabel?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-muted"
    >
      {children}
    </button>
  );
}
function PillIcon({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold mt-0.5">{value}</div>
    </div>
  );
}
function IconField({ icon: Icon, label, value, extra }: any) {
  return (
    <div>
      <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-muted"><Icon className="h-3 w-3" /></span>
        {label}
      </div>
      <div className="font-semibold mt-1">{value} {extra && <span className="text-xs text-muted-foreground font-normal">{extra}</span>}</div>
    </div>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white p-6 shadow-card">{children}</section>;
}
function CardTitle({ icon: Icon, color, bg, children }: any) {
  return (
    <h3 className="inline-flex items-center gap-2 text-lg font-bold">
      <span className={`grid h-7 w-7 place-items-center rounded-lg ${bg} ${color}`}><Icon className="h-4 w-4" /></span>
      {children}
    </h3>
  );
}
function Stat({ icon: Icon, label, value, total, pct }: any) {
  return (
    <div>
      <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className="mt-2 text-2xl font-bold">{value} <span className="text-base text-muted-foreground font-medium">/ {total}</span></div>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
function Stat2({ icon: Icon, label, value, sub }: any) {
  return (
    <div>
      <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
function GroupCard({ num, count, status, tone, members = [] }: any) {
  const gradients = ["from-emerald-300 to-emerald-400", "from-rose-300 to-rose-400", "from-cyan-300 to-cyan-400", "from-indigo-300 to-indigo-400", "from-amber-300 to-amber-400", "from-slate-400 to-slate-500"];
  
  return (
    <div className="rounded-2xl border border-border/80 p-4 flex flex-col justify-between">
      <div>
        <div className="font-bold text-foreground text-[15px]">Group {num}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{count}</div>
      </div>
      <div className="mt-4 flex -space-x-1.5">
        {members.slice(0, 5).map((m: any, i: number) => {
          const safeName = m.name || "?";
          const initials = safeName.split(" ").map((s: string) => s[0] || "").slice(0, 2).join("").toUpperCase();
          const bgGrad = gradients[safeName.length % 6];
          return (
            <div key={i} style={{ zIndex: 5 - i }} className={`relative h-7 w-7 rounded-full border-[1.5px] border-white bg-gradient-to-br ${bgGrad} grid place-items-center text-[9px] font-bold text-white shrink-0 shadow-sm`}>
              {initials}
            </div>
          )
        })}
        {members.length === 0 && (
           <div className="text-[11px] text-muted-foreground">Waiting for participants...</div>
        )}
      </div>
      <div className="mt-5">
        {tone === "success" ? (
          <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-500 border border-emerald-200/60 shadow-sm">Complete</span>
        ) : (
          <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold bg-orange-50 text-orange-500 border border-orange-200/60 shadow-sm">In Progress</span>
        )}
      </div>
    </div>
  );
}

function RescheduleModal({
  todayStr,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  currentScheduleDate,
  currentScheduleTime,
  onClose,
  onConfirm,
}: {
  todayStr: string;
  newDate: string;
  setNewDate: (v: string) => void;
  newTime: string;
  setNewTime: (v: string) => void;
  currentScheduleDate: string;
  currentScheduleTime: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isValid = newDate && newTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-elevated w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
          <div>
            <h3 className="text-lg font-bold text-foreground">Reschedule Event</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select a new date and time for your event</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">1 reschedule allowed.</span> This action cannot be undone. Make sure the new date and time are correct before confirming.
            </p>
          </div>

          {/* Current schedule info */}
          <div className="rounded-xl bg-muted/50 border border-border/40 px-4 py-3">
            <p className="text-xs text-muted-foreground font-medium mb-2">Current Schedule</p>
            <div className="flex items-center gap-4 text-sm font-semibold text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" /> {currentScheduleDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> {currentScheduleTime}
              </span>
            </div>
          </div>

          {/* New date */}
          <div>
            <label htmlFor="reschedule-date" className="text-sm font-semibold text-foreground">
              New Date
            </label>
            <p className="text-xs text-muted-foreground mt-0.5">Past dates are disabled and cannot be selected.</p>
            <div className="mt-2 relative">
              <input
                id="reschedule-date"
                type="date"
                min={todayStr}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer transition-colors"
              />
            </div>
          </div>

          {/* New time */}
          <div>
            <label htmlFor="reschedule-time" className="text-sm font-semibold text-foreground">
              New Start Time
            </label>
            <div className="mt-2 relative">
              <input
                id="reschedule-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer transition-colors"
              />
            </div>
          </div>

          {/* Preview of new schedule */}
          {isValid && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
              <p className="text-xs font-semibold text-primary mb-1.5">New Schedule Preview</p>
              <div className="flex items-center gap-4 text-sm font-semibold text-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {new Date(newDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {(() => {
                    const [h, m] = newTime.split(":");
                    const hour = parseInt(h);
                    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/60 bg-muted/30">
          <button
            onClick={onClose}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid}
            className={`rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isValid
                ? "bg-gradient-primary text-white shadow-glow hover:opacity-90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
