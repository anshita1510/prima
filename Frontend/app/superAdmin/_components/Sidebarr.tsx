"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  Menu,
  X,
  LayoutGrid,
  BarChart2,
  Crown,
  Building2,
  Users,
  LogOut,
} from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

type MatchMode = "exact" | "prefix";

type NavItem = {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  match?: MatchMode;
};

type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutGrid,
        href: "/superAdmin",
        match: "exact",
      },
      {
        id: "analytics",
        name: "View Analytics",
        icon: BarChart2,
        href: "/superAdmin/analytics",
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        id: "create-ceo",
        name: "Create CEO",
        icon: Crown,
        href: "/superAdmin/createCeo",
      },
      {
        id: "manage-companies",
        name: "Manage Companies",
        icon: Building2,
        href: "/superAdmin/manageCompanies",
      },
      {
        id: "manage-users",
        name: "Manage Users",
        icon: Users,
        href: "/superAdmin/manageUsers",
      },
    ],
  },
];

function isNavActive(pathname: string, item: NavItem): boolean {
  const mode = item.match ?? "prefix";
  if (mode === "exact") return pathname === item.href;
  if (pathname === item.href) return true;
  return pathname.startsWith(`${item.href}/`);
}

const SIDEBAR_WIDTH_STORAGE_KEY = "prima-sidebar-width-px";
const SIDEBAR_WIDTH_MIN = 200;
const SIDEBAR_WIDTH_MAX = 440;
function readSidebarWidthFromCss(): number {
  if (typeof window === "undefined") return 240;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--sidebar-width")
    .trim();
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 240;
}

function clampSidebarWidth(px: number): number {
  return Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, Math.round(px)));
}

function persistSidebarWidth(px: number) {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(clampSidebarWidth(px)));
  } catch {
    /* ignore */
  }
}

export default function SuperAdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const [storedUser, setStoredUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!user) setStoredUser(authService.getStoredUser() as Record<string, unknown> | null);
  }, [user]);

  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
      if (saved == null) return;
      const parsed = parseInt(saved, 10);
      if (Number.isNaN(parsed)) return;
      document.documentElement.style.setProperty(
        "--sidebar-width",
        `${clampSidebarWidth(parsed)}px`
      );
    } catch {
      /* ignore */
    }
  }, []);

  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      dragCleanupRef.current?.();
      dragCleanupRef.current = null;
      document.documentElement.classList.remove("sidebar-is-resizing");
    },
    []
  );

  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragCleanupRef.current?.();

    const startWidth = readSidebarWidthFromCss();
    dragStateRef.current = { startX: e.clientX, startWidth };
    document.documentElement.classList.add("sidebar-is-resizing");

    const move = (ev: MouseEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;
      const delta = ev.clientX - drag.startX;
      const next = clampSidebarWidth(drag.startWidth + delta);
      document.documentElement.style.setProperty("--sidebar-width", `${next}px`);
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.documentElement.classList.remove("sidebar-is-resizing");
      dragStateRef.current = null;
      dragCleanupRef.current = null;
      try {
        persistSidebarWidth(readSidebarWidthFromCss());
      } catch {
        /* ignore */
      }
    };

    dragCleanupRef.current = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.documentElement.classList.remove("sidebar-is-resizing");
      dragStateRef.current = null;
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }, []);

  const resetSidebarWidth = useCallback(() => {
    dragCleanupRef.current?.();
    dragCleanupRef.current = null;
    dragStateRef.current = null;
    document.documentElement.classList.remove("sidebar-is-resizing");
    document.documentElement.style.removeProperty("--sidebar-width");
    try {
      localStorage.removeItem(SIDEBAR_WIDTH_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const displayUser = user ?? storedUser;

  const displayName = useMemo(() => {
    if (!displayUser) return "User";
    const u = displayUser as { name?: string; firstName?: string; lastName?: string };
    if (u.name) return u.name;
    return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || "User";
  }, [displayUser]);

  const roleLabel = useMemo(() => {
    const r = (displayUser as { role?: string } | null)?.role;
    return typeof r === "string" && r.length > 0 ? r.replace(/_/g, " ") : "USER";
  }, [displayUser]);

  const initials = useMemo(() => {
    if (!displayUser) return "P";
    const u = displayUser as { name?: string; firstName?: string; lastName?: string };
    const raw = u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`;
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "P";
    return parts
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [displayUser]);

  const linkBody = (item: NavItem, active: boolean) => (
    <>
      {active && (
        <span
          className="sidebar-app__indicator pointer-events-none absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full"
          aria-hidden
        />
      )}
      <item.icon size={16} strokeWidth={active ? 2 : 1.75} className="relative z-[1] shrink-0" />
      <span className="sidebar-app__link-text relative z-[1] min-w-0 flex-1 truncate">{item.name}</span>
    </>
  );

  return (
    <>
      <div className="sidebar-app fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="sidebar-app__logo-box flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-lg">
            <Image
              src="/prima-logo.svg"
              alt="PRIMA"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
              unoptimized
            />
          </div>
          <span className="text-sm font-bold tracking-[0.2em] text-[var(--sidebar-text)]">PRIMA</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--sidebar-text)]"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          style={{ backgroundColor: "var(--sidebar-overlay-scrim)" }}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar-app relative flex h-screen min-h-0 flex-shrink-0 flex-col border-r transition-[transform,opacity] duration-300 ease-out
          ${mobileOpen ? "fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] max-w-[100vw] shadow-2xl" : "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[var(--sidebar-width)]"}`}
      >
        <div className="sidebar-app__header flex h-[73px] shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="sidebar-app__logo-box flex h-10 w-10 shrink-0 items-center justify-center overflow-visible rounded-xl">
              <Image
                src="/prima-logo.svg"
                alt="PRIMA"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
                unoptimized
              />
            </div>
            <span className="truncate text-sm font-bold tracking-[0.16em] text-[var(--sidebar-text)]">
              PRIMA
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1.5 text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--sidebar-text)] lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-0 overflow-y-auto overflow-x-hidden px-2 py-3">
          {NAV_SECTIONS.map((section, si) => (
            <div
              key={section.title}
              className={si > 0 ? "sidebar-app__section-divider mt-5 border-t pt-5" : ""}
            >
              <p className="sidebar-app__heading mb-2 px-3 uppercase">{section.title}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isNavActive(pathname, item);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        data-active={active ? "true" : "false"}
                        className="sidebar-app__link relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors duration-150"
                      >
                        {linkBody(item, active)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-app__footer mt-auto shrink-0 border-t px-3 py-4">
          <div className="sidebar-app__user-card mb-3 flex items-center gap-3 rounded-xl border p-2.5">
            <div className="sidebar-app__avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--sidebar-text)]">{displayName}</p>
              <span className="sidebar-app__role mt-1 inline-block max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => authService.logout()}
            className="sidebar-app__logout flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors"
          >
            <LogOut size={16} className="sidebar-app__logout-icon shrink-0" strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-valuemin={SIDEBAR_WIDTH_MIN}
          aria-valuemax={SIDEBAR_WIDTH_MAX}
          aria-label="Resize sidebar"
          title="Drag to resize. Double-click to reset width."
          className="sidebar-app__resize-handle absolute right-0 top-0 z-[60] hidden h-full w-2 shrink-0 cursor-col-resize touch-none select-none lg:block"
          onMouseDown={startSidebarResize}
          onDoubleClick={(ev) => {
            ev.preventDefault();
            resetSidebarWidth();
          }}
        />
      </aside>
    </>
  );
}
