"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { authService } from "@/app/services/authService";
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
} from "lucide-react";

interface ProfilePageProps {
  role: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color,#6366f1)] focus-visible:ring-offset-2 ${
        checked ? "bg-[var(--primary-color,#6366f1)]" : "bg-[var(--card-border)]"
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

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
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

function SectionCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border bg-[var(--card-bg)] shadow-sm ${className}`}
      style={{ borderColor: "var(--card-border)" }}
    >
      {title && (
        <div className="px-5 pt-5 pb-3 border-b border-[var(--card-border)]">
          <h3 className="text-sm font-semibold text-[var(--text-color)]">{title}</h3>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

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
        <p className={`text-sm font-medium ${danger ? "text-red-500" : "text-[var(--text-color)]"}`}>{label}</p>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const AUTH_PROVIDER_LABELS: Record<string, { label: string; Icon: React.ElementType }> = {
  LOCAL: { label: "Email & Password", Icon: Key },
  GOOGLE: { label: "Google", Icon: Globe },
  GITHUB: { label: "GitHub", Icon: Github },
  MICROSOFT: { label: "Microsoft", Icon: Monitor },
};

function loadPref(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  return stored === null ? fallback : stored === "true";
}

export default function ProfilePage({ role }: ProfilePageProps) {
  const { user } = useAuth();

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
    try { localStorage.setItem(key, String(value)); } catch { /* ignore */ }
  };

  const displayName = useMemo(() => {
    if (!user) return "User";
    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || (user as any).name || "User";
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "?";
    const raw = [user.firstName, user.lastName].filter(Boolean).join(" ") || (user as any).name || "";
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return parts.map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  }, [user]);

  const roleLabel = useMemo(() => {
    const r = user?.role ?? role;
    return r ? r.replace(/_/g, " ") : "USER";
  }, [user, role]);

  const authProvider = (user as any)?.authProvider ?? "LOCAL";
  const providerInfo = AUTH_PROVIDER_LABELS[authProvider] ?? AUTH_PROVIDER_LABELS.LOCAL;
  const isVerified = (user as any)?.isVerified ?? false;
  const isActive = user?.isActive ?? false;
  const memberSince = (user as any)?.createdAt
    ? new Date((user as any).createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

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

        {/* Profile Header */}
        <div
          className="relative overflow-hidden rounded-2xl border bg-[var(--card-bg)] shadow-sm"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="h-24 bg-gradient-to-r from-[var(--primary-color,#6366f1)] to-indigo-400 opacity-80" />
          <div className="px-6 pb-6">
            <div className="flex flex-wrap items-end gap-4 -mt-10">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-[var(--card-bg)] bg-gradient-to-br from-[var(--primary-color,#6366f1)] to-indigo-400 text-2xl font-bold text-white shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0 pt-3">
                <h1 className="text-xl font-bold text-[var(--text-color)] truncate">{displayName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {roleLabel}
                  </span>
                  {user?.designation && (
                    <span className="text-sm text-[var(--text-muted)]">{user.designation}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-3">
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
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
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

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <SectionCard title="Personal Information">
              <InfoRow label="Full Name" value={displayName} icon={User} />
              <InfoRow label="Email Address" value={user?.email ?? "—"} icon={Mail} />
              <InfoRow label="Phone Number" value={user?.phone ?? "—"} icon={Phone} />
            </SectionCard>

            <SectionCard title="Work Information">
              <InfoRow label="Designation" value={user?.designation ?? "—"} icon={Briefcase} />
              <InfoRow label="Role" value={roleLabel} icon={User} />
              <InfoRow
                label="Status"
                value={user?.status ? user.status.charAt(0) + user.status.slice(1).toLowerCase() : "—"}
                icon={CheckCircle2}
              />
              {(user as any)?.companyId && (
                <InfoRow label="Company ID" value={String((user as any).companyId)} icon={Building2} />
              )}
            </SectionCard>
          </TabsContent>

          {/* ── Security ── */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <SectionCard title="Authentication">
              <div className="flex items-center gap-3 py-3 border-b border-[var(--card-border)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)]">
                  <providerInfo.Icon size={15} className="text-[var(--text-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Sign-in Method</p>
                  <p className="text-sm font-medium text-[var(--text-color)]">{providerInfo.label}</p>
                </div>
                <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Active
                </span>
              </div>

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
                {isVerified ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Pending
                  </span>
                )}
              </div>

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

            {authProvider === "LOCAL" && (
              <SectionCard title="Password">
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Keep your account secure by using a strong, unique password.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-color)] transition-colors hover:bg-[var(--card-border)]"
                >
                  <Key size={14} />
                  Change Password
                </button>
              </SectionCard>
            )}

            <SectionCard title="Account Status">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-subtle)] p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Active</p>
                  <p className={`text-sm font-semibold ${isActive ? "text-green-600 dark:text-green-400" : "text-[var(--text-muted)]"}`}>
                    {isActive ? "Yes" : "No"}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-subtle)] p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Verified</p>
                  <p className={`text-sm font-semibold ${isVerified ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {isVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── More ── */}
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
                description="Switch between light and dark mode using the theme toggle"
                action={<ChevronRight size={16} className="text-[var(--text-muted)]" />}
              />
              <MoreRow
                icon={Monitor}
                label="Display Preferences"
                description="Customize your dashboard layout"
                action={<ChevronRight size={16} className="text-[var(--text-muted)]" />}
              />
            </SectionCard>

            {/* Role-specific section */}
            {roleSpecificMore()}

            {/* Help & Support */}
            <SectionCard title="Help &amp; Support">
              <MoreRow
                icon={BookOpen}
                label="Documentation"
                description="Browse guides and feature docs"
                action={
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-color)]"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                }
              />
              <MoreRow
                icon={MessageSquare}
                label="Contact Support"
                description="Reach out to the PRIMA support team"
                action={
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-color)]"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                }
              />
              <MoreRow
                icon={HelpCircle}
                label="FAQs"
                description="Frequently asked questions"
                action={
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-color)]"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                }
              />
            </SectionCard>

            {/* Account */}
            <SectionCard title="Account">
              <MoreRow
                icon={User}
                label="Account Details"
                description={`ID: ${user?.id ?? "—"}  ·  ${providerInfo.label}`}
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
                    onClick={() => authService.logout()}
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
