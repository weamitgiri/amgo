import { useRouterState, Link } from "@tanstack/react-router";
import { LayoutGrid, Users, Layers, Trophy, Settings, LayoutDashboard, ChevronLeft, ChevronRight, ChevronDown, User } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { OrganizerNotificationBell } from "./OrganizerNotificationBell";

const NAV = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
  { label: "Participants", to: "/participants", icon: Users },
  { label: "Groups", to: "/groups", icon: Layers },
  { label: "Results", to: "#", icon: Trophy },
] as const;

export function DashboardShell({ crumb, children, userName, userEmail, onLogout }: { crumb: string; children: ReactNode; userName: string; userEmail: string; onLogout: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("zv:collapsed") : null;
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("zv:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const sideW = collapsed ? "w-[72px]" : "w-[220px]";

  const NavItem = ({ n, active }: { n: typeof NAV[number]; active: boolean }) => {
    const cls = `flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl ${collapsed ? "px-2" : "px-3"} py-2.5 text-sm font-medium transition-colors ${
      active ? "bg-gradient-primary text-white shadow-glow" : "text-foreground/70 hover:bg-muted"
    }`;
    const inner = (
      <>
        <n.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{n.label}</span>}
      </>
    );
    return n.to === "#" ? (
      <a href="#" title={collapsed ? n.label : undefined} className={cls}>{inner}</a>
    ) : (
      <Link to={n.to} title={collapsed ? n.label : undefined} className={cls}>{inner}</Link>
    );
  };

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.012_290)]">
      <div className="px-4 pb-10 pt-5">
        <div className="mx-auto flex max-w-[1280px] gap-5">
          {/* Sidebar */}
          <aside
            className={`${sideW} shrink-0 rounded-2xl bg-white shadow-card flex flex-col transition-[width] duration-200 overflow-hidden`}
            style={{ minHeight: "calc(100vh - 60px)" }}
          >
            {/* Logo / Icon area */}
            <div className={`${collapsed ? "px-3 py-5 flex justify-center" : "px-5 py-5"} border-b border-border/60`}>
              {collapsed ? (
                <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
                    <path d="M5 6h12L7 18h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : <Logo />}
            </div>

            {/* Main Nav */}
            <nav className="flex-1 p-3 space-y-1">
              {NAV.map((n) => <NavItem key={n.label} n={n} active={path === n.to} />)}
            </nav>

            {/* Bottom: Settings & Collapse */}
            <div className="p-3 border-t border-border/60 space-y-1">
              <Link
                to="/profile"
                title={collapsed ? "Settings" : undefined}
                className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  path === "/profile" ? "bg-accent text-accent-foreground" : "text-foreground/70 hover:bg-muted"
                }`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>

              {/* Collapse / Expand toggle */}
              <button
                id="sidebar-collapse-btn"
                onClick={() => setCollapsed((c) => !c)}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} rounded-xl py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted transition-colors`}
              >
                {collapsed
                  ? <ChevronRight className="h-4 w-4 shrink-0" />
                  : <>
                      <ChevronLeft className="h-4 w-4 shrink-0" />
                      <span>Collapse</span>
                    </>
                }
              </button>
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Top header bar */}
            <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-card">
              {/* Left: page title derived from crumb */}
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 grid place-items-center">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-sm text-foreground">
                  {crumb.split("/").pop()?.trim() || "Dashboard"}
                </span>
              </div>

              {/* Right: Bell + User */}
              <div className="flex items-center gap-3">
                <OrganizerNotificationBell />

                {/* User dropdown */}
                <div ref={userRef} className="relative">
                  <button
                    id="user-menu-btn"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-2xl bg-muted/50 hover:bg-muted px-3 py-2 transition-colors"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="leading-tight text-left hidden sm:block">
                      <div className="text-sm font-semibold text-foreground">{userName}</div>
                      <div className="text-[11px] text-muted-foreground">{userEmail}</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-14 z-40 w-52 rounded-2xl bg-white shadow-card border border-border overflow-hidden">
                      <div className="px-4 py-3 border-b border-border/60">
                        <div className="text-sm font-semibold">{userName}</div>
                        <div className="text-xs text-muted-foreground">{userEmail}</div>
                      </div>
                      <ul className="p-1.5">
                        <li>
                          <Link
                            to="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
                          >
                            <LayoutGrid className="h-4 w-4 text-primary" />
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
                          >
                            <Settings className="h-4 w-4 text-primary" />
                            Settings
                          </Link>
                        </li>
                      </ul>
                      <div className="p-1.5 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => { setUserMenuOpen(false); onLogout(); }}
                          className="w-full text-left flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {children}

            <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
              <LockIcon /> Secure. Reliable. Real-time <span className="text-foreground/70">Your event is safe with us.</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}
