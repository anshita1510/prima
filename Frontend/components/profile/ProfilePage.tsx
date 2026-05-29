"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  CalendarDays,
  Key,
  Globe,
  Github,
  Monitor,
  ExternalLink,
  MoreHorizontal,
  BookOpen,
  MessageSquare,
  Layers,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004";

interface ApiUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  designation: string;
  role: string;
  status: string;
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  authProvider: string;
  companyId?: number;
  createdAt?: string;
}

interface ProfilePageProps {
  role: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
}

/* ─── Toggle ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? "bg-indigo-500" : "bg-[var(--card-border)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── InfoRow ─── */
function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--card-border)] last:border-0">
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
          <Icon size={15} className="text-[var(--text-muted)]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[var(--text-color)] truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ─── SectionCard ─── */
function SectionCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[var(--card-bg)] shadow-sm ${className}`}
      style={{ borderColor: "var(--card-border)" }}
    >
      {title && (
        <div className="px-5 pt-4 pb-3 border-b border-[var(--card-border)]">
          <h3 className="text-sm font-semibold text-[var(--text-color)]">{title}</h3>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ─── MoreRow ─── */
function MoreRow({
  icon: Icon,
  label,
  description,
  action,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[var(--card-border)] last:border-0">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          danger ? "bg-red-50 dark:bg-red-900/20" : "bg-[var(--bg-subtle)]"
        }`}
      >
        <Icon size={15} className={danger ? "text-red-500" : "text-[var(--text-muted)]"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red-500" : "text-[var(--text-color)]"}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const AUTH_PROVIDER_META: Record<string, { label: string; Icon: React.ElementType }> = {
  LOCAL: { label: "Email & Password", Icon: Key },
  GOOGLE: { label: "Google OAuth", Icon: Globe },
  GITHUB: { label: "GitHub OAuth", Icon: Github },
  MICROSOFT: { label: "Microsoft OAuth", Icon: Monitor },
};

function loadPref(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v === null ? fallback : v === "true";
}

/* ─── Main Component ─── */
export default function ProfilePage({ role }: ProfilePageProps) {
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* password form */
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* notification prefs */
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);

  useEffect(() => {
    setNotifEmail(loadPref("pref_notif_email", true));
    setNotifPush(loadPref("pref_notif_push", true));
    setNotifDigest(loadPref("pref_notif_digest", false));
    setNotifAnnouncements(loadPref("pref_notif_announcements", true));
  }, []);

  const savePref = (key: string, value: boolean) => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      /* ignore */
    }
  };

  /* ── fetch user from API ── */
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        /* fall back to localStorage user */
        const stored = localStorage.getItem("user");
        if (stored) setApiUser(JSON.parse(stored) as ApiUser);
        else setFetchError("Not authenticated");
        return;
      }
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const u: ApiUser = data.user ?? data;
      setApiUser(u);
      /* keep localStorage in sync */
      localStorage.setItem("user", JSON.stringify(u));
    } catch (err: unknown) {
      /* fallback to localStorage */
      const stored = localStorage.getItem("user");
      if (stored) {
        setApiUser(JSON.parse(stored) as ApiUser);
      } else {
        setFetchError(err instanceof Error ? err.message : "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /* ── change password ── */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 6) {
      setPwMsg({ type: "err", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "err", text: "Passwords do not match." });
      return;
    }
    if (!apiUser?.id) {
      setPwMsg({ type: "err", text: "User ID not found. Try refreshing." });
      return;
    }
    setPwLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/${apiUser.id}/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed");
      setPwMsg({ type: "ok", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
      setShowPwForm(false);
    } catch (err: unknown) {
      setPwMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Failed to update password.",
      });
    } finally {
      setPwLoading(false);
    }
  };

  /* ── logout ── */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  };

  /* ── derived display values ── */
  const displayName = useMemo(() => {
    if (!apiUser) return "User";
    return (
      [apiUser.firstName, apiUser.lastName].filter(Boolean).join(" ").trim() ||
      apiUser.name ||
      "User"
    );
  }, [apiUser]);

  const initials = useMemo(() => {
    if (!apiUser) return "?";
    const raw =
      [apiUser.firstName, apiUser.lastName].filter(Boolean).join(" ") ||
      apiUser.name ||
      "";
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    return parts.length
      ? parts
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";
  }, [apiUser]);

  const roleLabel = useMemo(() => {
    const r = apiUser?.role ?? role;
    return r ? r.replace(/_/g, " ") : "USER";
  }, [apiUser, role]);

  const authProvider = apiUser?.authProvider ?? "LOCAL";
  const providerMeta = AUTH_PROVIDER_META[authProvider] ?? AUTH_PROVIDER_META.LOCAL;
  const isVerified = apiUser?.isVerified ?? false;
  const isActive = apiUser?.isActive ?? false;
  const memberSince = apiUser?.createdAt
    ? new Date(apiUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (fetchError && !apiUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <p className="text-sm text-[var(--text-muted)]">{fetchError}</p>
          <button
            onClick={fetchUser}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ─── Role-specific "More" section ─── */
  const roleSpecificMore = () => {
    if (role === "SUPER_ADMIN") {
      return (
        <SectionCard title="Platform">
          <MoreRow
            icon={Layers}
            label="Platform Settings"
            description="Manage global platform configuration"
            action={<ChevronRight size={16} className="text-[var(--text-muted)]" />}
          />
          <MoreRow
            icon={Building2}
            label="Company Management"
            description="Oversee all registered companies"
            action={<ChevronRight size={16} className="text-[var(--text-muted)]" />}
          />
        </SectionCard>
      );
    }
    if (role === "ADMIN") {
      return (
        <SectionCard title="Team">
          <MoreRow
            icon={User}
            label="Team Settings"
            description="Configure team defaults and policies"
            action={<ChevronRight size={16} className="text-[var(--text-muted)]" />}
          />
        </SectionCard>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ── Profile Header ── */}
        <div
          className="relative overflow-hidden rounded-2xl border bg-[var(--card-bg)] shadow-sm"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="px-6 py-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-400 text-xl font-bold text-white shadow-md">
                {initials}
              </div>

              {/* Name + Role */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-[var(--text-color)] truncate">{displayName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {roleLabel}
                  </span>
                  {apiUser?.designation && (
                    <span className="text-sm text-[var(--text-muted)]">{apiUser.designation}</span>
                  )}
                </div>
              </div>

              {/* Badges + Refresh */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <AlertCircle size={12} /> Unverified
                  </span>
                )}
                {isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                )}
                <button
                  title="Refresh profile"
                  onClick={fetchUser}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* Email chip */}
            {apiUser?.email && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <Mail size={13} />
                <span>{apiUser.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start gap-1">
            <TabsTrigger value="overview">
              <User size={14} className="mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield size={14} className="mr-1.5" /> Security
            </TabsTrigger>
            <TabsTrigger value="more">
              <MoreHorizontal size={14} className="mr-1.5" /> More
            </TabsTrigger>
          </TabsList>

          {/* ──────── Overview ──────── */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <SectionCard title="Personal Information">
              <InfoRow label="Full Name" value={displayName} icon={User} />
              <InfoRow label="Email Address" value={apiUser?.email ?? "—"} icon={Mail} />
              <InfoRow label="Phone Number" value={apiUser?.phone ?? "—"} icon={Phone} />
            </SectionCard>

            <SectionCard title="Work Information">
              <InfoRow label="Designation" value={apiUser?.designation ?? "—"} icon={Briefcase} />
              <InfoRow label="Role" value={roleLabel} icon={User} />
              <InfoRow
                label="Status"
                value={
                  apiUser?.status
                    ? apiUser.status.charAt(0).toUpperCase() + apiUser.status.slice(1).toLowerCase()
                    : "—"
                }
                icon={CheckCircle2}
              />
              {apiUser?.companyId != null && (
                <InfoRow label="Company ID" value={String(apiUser.companyId)} icon={Building2} />
              )}
            </SectionCard>
          </TabsContent>

          {/* ──────── Security ──────── */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <SectionCard title="Authentication">
              {/* Auth Provider */}
              <div className="flex items-center gap-3 py-3 border-b border-[var(--card-border)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
                  <providerMeta.Icon size={15} className="text-[var(--text-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Sign-in Method</p>
                  <p className="text-sm font-medium text-[var(--text-color)]">{providerMeta.label}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </div>

              {/* Verification */}
              <div className="flex items-center gap-3 py-3 border-b border-[var(--card-border)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
                  <CheckCircle2 size={15} className="text-[var(--text-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Email Verification</p>
                  <p className="text-sm font-medium text-[var(--text-color)]">
                    {isVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isVerified
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {isVerified ? "Verified" : "Pending"}
                </span>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
                  <CalendarDays size={15} className="text-[var(--text-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Member Since</p>
                  <p className="text-sm font-medium text-[var(--text-color)]">{memberSince}</p>
                </div>
              </div>
            </SectionCard>

            {/* Change Password — only for LOCAL auth */}
            {authProvider === "LOCAL" && (
              <SectionCard title="Password">
                {pwMsg && (
                  <div
                    className={`mb-4 rounded-lg px-4 py-2.5 text-sm font-medium ${
                      pwMsg.type === "ok"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {pwMsg.text}
                  </div>
                )}

                {!showPwForm ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--text-muted)]">
                      Keep your account secure with a strong password.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setShowPwForm(true); setPwMsg(null); }}
                      className="ml-4 shrink-0 inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-color)] hover:bg-[var(--card-border)] transition-colors"
                    >
                      <Key size={14} /> Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    {/* New Password */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg-subtle)] px-3 py-2 pr-10 text-sm text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        >
                          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          required
                          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg-subtle)] px-3 py-2 pr-10 text-sm text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        >
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={pwLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                      >
                        {pwLoading && <Loader2 size={14} className="animate-spin" />}
                        {pwLoading ? "Saving…" : "Save Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowPwForm(false); setNewPassword(""); setConfirmPassword(""); setPwMsg(null); }}
                        className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </SectionCard>
            )}

            {/* Account Status */}
            <SectionCard title="Account Status">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-subtle)] p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Active</p>
                  <p className={`text-sm font-semibold ${isActive ? "text-green-600 dark:text-green-400" : "text-[var(--text-muted)]"}`}>
                    {isActive ? "Yes" : "No"}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-subtle)] p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Email Verified</p>
                  <p className={`text-sm font-semibold ${isVerified ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {isVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* ──────── More ──────── */}
          <TabsContent value="more" className="space-y-4 mt-4">

            {/* Notification Preferences */}
            <SectionCard title="Notification Preferences">
              <MoreRow
                icon={Bell}
                label="Email Notifications"
                description="Receive important updates via email"
                action={
                  <Toggle
                    checked={notifEmail}
                    onChange={(v) => { setNotifEmail(v); savePref("pref_notif_email", v); }}
                  />
                }
              />
              <MoreRow
                icon={Bell}
                label="Push Notifications"
                description="In-app alerts and reminders"
                action={
                  <Toggle
                    checked={notifPush}
                    onChange={(v) => { setNotifPush(v); savePref("pref_notif_push", v); }}
                  />
                }
              />
              <MoreRow
                icon={Mail}
                label="Weekly Digest"
                description="A weekly summary of your activity"
                action={
                  <Toggle
                    checked={notifDigest}
                    onChange={(v) => { setNotifDigest(v); savePref("pref_notif_digest", v); }}
                  />
                }
              />
              <MoreRow
                icon={Briefcase}
                label="Announcement Alerts"
                description="Company-wide announcements"
                action={
                  <Toggle
                    checked={notifAnnouncements}
                    onChange={(v) => { setNotifAnnouncements(v); savePref("pref_notif_announcements", v); }}
                  />
                }
              />
            </SectionCard>

            {/* Appearance */}
            <SectionCard title="Appearance">
              <MoreRow
                icon={Palette}
                label="Theme"
                description="Toggle light / dark mode using the theme button in the sidebar"
                action={<ChevronRight size={16} className="text-[var(--text-muted)]" />}
              />
              <MoreRow
                icon={Monitor}
                label="Display Preferences"
                description="Customise your dashboard layout"
                action={<ChevronRight size={16} className="text-[var(--text-muted)]" />}
              />
            </SectionCard>

            {/* Role-specific extras */}
            {roleSpecificMore()}

            {/* Help & Support */}
            <SectionCard title="Help &amp; Support">
              <MoreRow
                icon={BookOpen}
                label="Documentation"
                description="Browse guides and feature docs"
                action={
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    Open <ExternalLink size={12} />
                  </span>
                }
              />
              <MoreRow
                icon={MessageSquare}
                label="Contact Support"
                description="Reach out to the PRIMA support team"
                action={
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    Open <ExternalLink size={12} />
                  </span>
                }
              />
              <MoreRow
                icon={HelpCircle}
                label="FAQs"
                description="Frequently asked questions"
                action={
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    Open <ExternalLink size={12} />
                  </span>
                }
              />
            </SectionCard>

            {/* Account */}
            <SectionCard title="Account">
              <MoreRow
                icon={User}
                label="Account ID"
                description={`#${apiUser?.id ?? "—"}  ·  ${providerMeta.label}`}
              />
              <MoreRow
                icon={CalendarDays}
                label="Member Since"
                description={memberSince}
              />
              <MoreRow
                icon={LogOut}
                label="Sign Out"
                description="Sign out of your PRIMA account"
                danger
                action={
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                }
              />
            </SectionCard>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
