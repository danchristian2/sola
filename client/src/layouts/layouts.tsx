import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, type ComponentType, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { logout } from "../lib/api/auth";
import { getMySchool } from "../lib/api/schools";
import { useAuth } from "../features/auth/auth-context";
import { DEMO_PERSONAS } from "../data/personas";
import type { Role } from "../types";
import { Logo } from "../components/Logo";
import {
  IconClipboard,
  IconFolder,
  IconHome,
  IconInbox,
  IconLogOut,
  IconMenu,
  IconPlus,
  IconSchool,
  IconSettings,
  IconUsers,
  IconWrench
} from "../components/ui/icons";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  icon: ComponentType<{ className?: string }>;
};

function navFor(role: Role | undefined): NavItem[] {
  switch (role) {
    case "SCHOOL_ADMIN":
      return [
        { to: "/app/school", label: "Home", end: true, icon: IconHome },
        { to: "/app/coordinator", label: "New problems", icon: IconInbox },
        { to: "/app/school/departments", label: "Skills we teach", icon: IconWrench },
        { to: "/app/school/people", label: "People", icon: IconUsers },
        { to: "/app/school/portfolio", label: "Finished work", icon: IconFolder },
        { to: "/app/school/settings", label: "School", icon: IconSettings }
      ];
    case "SCHOOL_COORDINATOR":
      return [
        { to: "/app/coordinator", label: "New problems", end: true, icon: IconInbox },
        { to: "/app/school/departments", label: "Skills we teach", icon: IconWrench },
        { to: "/app/school/people", label: "People", icon: IconUsers },
        { to: "/app/school/portfolio", label: "Finished work", icon: IconFolder }
      ];
    case "TEACHER":
      return [
        { to: "/app/teacher", label: "My projects", end: true, icon: IconClipboard },
        { to: "/app/school/portfolio", label: "Finished work", icon: IconFolder }
      ];
    case "SERVICE_SEEKER":
      return [
        { to: "/app/seeker", label: "My problems", end: true, icon: IconInbox },
        { to: "/app/seeker/new", label: "Post a problem", icon: IconPlus }
      ];
    case "SUPER_ADMIN":
      return [{ to: "/app/admin", label: "Schools", end: true, icon: IconSchool }];
    default:
      return [];
  }
}

function roleLabel(role: Role | undefined) {
  return DEMO_PERSONAS.find((p) => p.role === role)?.title ?? "Guest";
}

function navPrefixes(to: string) {
  if (to === "/app/teacher") return ["/app/teacher", "/app/projects"];
  if (to === "/app/school/portfolio") return ["/app/school/portfolio", "/app/projects"];
  return [to];
}

function activeNavTo(pathname: string, items: NavItem[]) {
  let best: { to: string; len: number } | null = null;
  for (const item of items) {
    for (const prefix of navPrefixes(item.to)) {
      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
        if (!best || prefix.length > best.len) best = { to: item.to, len: prefix.length };
      }
    }
  }
  return best?.to ?? null;
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const location = useLocation();
  const items = navFor(user?.role);
  const current = activeNavTo(location.pathname, items);

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-thin">
      {items.map((item) => {
        const isActive = current === item.to;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-lg border-l-[3px] px-2.5 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? "border-white bg-primary text-primary-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={36} />
            <p className="text-sm font-bold leading-tight">SOLA</p>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/partner" className="hidden text-muted-foreground hover:text-primary sm:inline">
              Schools
            </Link>
            <Link to="/login" className="btn-primary">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

export function AppLayout({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function onSwitch() {
    await logout().catch(() => undefined);
    setUser(null);
    navigate("/login");
  }

  const schoolQuery = useQuery({
    queryKey: ["school", "me"],
    queryFn: getMySchool,
    enabled: Boolean(user?.schoolId)
  });
  const school = schoolQuery.data?.school;

  const brand = (
    <div className="shrink-0 border-b px-3 py-3">
      <div className="flex items-center gap-2.5">
        <Logo size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{school?.name ?? "SOLA"}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {school?.location ?? roleLabel(user?.role)}
          </p>
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="shrink-0 border-t p-2 space-y-0.5">
      <div className="mb-1 rounded-lg bg-muted/50 px-2.5 py-2">
        <p className="truncate text-sm font-medium">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="truncate text-xs text-muted-foreground">{roleLabel(user?.role)}</p>
      </div>
      <button
        type="button"
        onClick={onSwitch}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10"
      >
        <IconLogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden">
      <aside className="hidden h-full min-h-0 w-60 shrink-0 flex-col border-r bg-card lg:flex">
        {brand}
        <SidebarNav />
        {footer}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} type="button" />
          <aside className="relative flex h-full w-60 flex-col border-r bg-card">
            {brand}
            <SidebarNav onNavigate={() => setOpen(false)} />
            {footer}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-2.5 backdrop-blur sm:px-6">
          <button
            className="grid h-10 w-10 place-items-center rounded-md border bg-card lg:hidden"
            onClick={() => setOpen(true)}
            type="button"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight">{title}</h1>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
