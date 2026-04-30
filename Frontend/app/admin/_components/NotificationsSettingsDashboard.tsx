'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  Calendar,
  Check,
  ClipboardList,
  ExternalLink,
  Info,
  ListChecks,
  Mail,
  MessageSquare,
  Moon,
  RotateCcw,
  Shield,
  Smartphone,
  Sun,
  User,
} from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';

const cardStyle = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '14px',
  boxShadow: 'var(--shadow-sm)',
} as const;

type Channels = { email: boolean; inApp: boolean; sms: boolean };

type PrefItem = {
  id: string;
  title: string;
  description: string;
  icon: typeof Bell;
};

type PrefSection = { id: string; heading: string; items: PrefItem[] };

const SECTIONS: PrefSection[] = [
  {
    id: 'general',
    heading: 'General notifications',
    items: [
      {
        id: 'account',
        title: 'Account updates',
        description: 'Important updates related to your account.',
        icon: User,
      },
      {
        id: 'security',
        title: 'Security alerts',
        description: 'Login alerts, password changes, and similar events.',
        icon: Shield,
      },
      {
        id: 'system',
        title: 'System announcements',
        description: 'Platform updates and scheduled maintenance.',
        icon: Info,
      },
    ],
  },
  {
    id: 'team',
    heading: 'Team & collaboration',
    items: [
      {
        id: 'mentions',
        title: 'Team mentions',
        description: 'When someone mentions you in a task or comment.',
        icon: MessageSquare,
      },
      {
        id: 'assignments',
        title: 'Task assignments',
        description: 'When tasks are assigned to you.',
        icon: ClipboardList,
      },
      {
        id: 'task_updates',
        title: 'Task updates',
        description: 'When tasks you follow are updated.',
        icon: ListChecks,
      },
      {
        id: 'project_updates',
        title: 'Project updates',
        description: 'Important updates in projects you are part of.',
        icon: Briefcase,
      },
    ],
  },
  {
    id: 'attendance',
    heading: 'Attendance & leaves',
    items: [
      {
        id: 'leave_requests',
        title: 'Leave requests',
        description: 'When leave requests are submitted or updated.',
        icon: Calendar,
      },
      {
        id: 'leave_approvals',
        title: 'Leave approvals',
        description: 'When your leave is approved or rejected.',
        icon: Bell,
      },
      {
        id: 'attendance_alerts',
        title: 'Attendance alerts',
        description: 'Check-in reminders and attendance alerts.',
        icon: Bell,
      },
    ],
  },
];

function defaultPrefs(): Record<string, Channels> {
  const map: Record<string, Channels> = {};
  SECTIONS.forEach((s) => {
    s.items.forEach((it) => {
      map[it.id] = { email: true, inApp: true, sms: it.id === 'security' || it.id === 'leave_approvals' };
    });
  });
  return map;
}

type QuietMeta = {
  quietEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  digest: string;
};

const defaultMeta: QuietMeta = {
  quietEnabled: true,
  quietStart: '22:00',
  quietEnd: '07:00',
  digest: 'daily',
};

const TIME_OPTIONS = (() => {
  const opts: { v: string; l: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const labelH = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const mm = m === 0 ? '00' : '30';
      const v = `${String(h).padStart(2, '0')}:${mm}`;
      opts.push({ v, l: `${labelH}:${mm} ${ampm}` });
    }
  }
  return opts;
})();

const DIGEST_OPTIONS = [
  { v: 'off', l: 'Off' },
  { v: 'daily', l: 'Daily' },
  { v: 'weekly', l: 'Weekly' },
];

export default function NotificationsSettingsDashboard() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, Channels>>(defaultPrefs);
  const [baseline, setBaseline] = useState<Record<string, Channels>>(() => defaultPrefs());
  const [quietEnabled, setQuietEnabled] = useState(defaultMeta.quietEnabled);
  const [quietStart, setQuietStart] = useState(defaultMeta.quietStart);
  const [quietEnd, setQuietEnd] = useState(defaultMeta.quietEnd);
  const [digest, setDigest] = useState(defaultMeta.digest);
  const [baselineMeta, setBaselineMeta] = useState<QuietMeta>({ ...defaultMeta });

  const dirty = useMemo(() => {
    const keys = new Set([...Object.keys(prefs), ...Object.keys(baseline)]);
    for (const k of keys) {
      const a = prefs[k];
      const b = baseline[k];
      if (!a || !b) return true;
      if (a.email !== b.email || a.inApp !== b.inApp || a.sms !== b.sms) return true;
    }
    if (
      quietEnabled !== baselineMeta.quietEnabled ||
      quietStart !== baselineMeta.quietStart ||
      quietEnd !== baselineMeta.quietEnd ||
      digest !== baselineMeta.digest
    ) {
      return true;
    }
    return false;
  }, [prefs, baseline, quietEnabled, quietStart, quietEnd, digest, baselineMeta]);

  const toggleChannel = useCallback((id: string, ch: keyof Channels) => {
    setPrefs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [ch]: !prev[id][ch] },
    }));
  }, []);

  const save = useCallback(() => {
    setBaseline(JSON.parse(JSON.stringify(prefs)));
    setBaselineMeta({ quietEnabled, quietStart, quietEnd, digest });
    try {
      localStorage.setItem(
        'PRIMA-notification-prefs',
        JSON.stringify({ prefs, quietEnabled, quietStart, quietEnd, digest })
      );
    } catch {
      /* ignore */
    }
  }, [prefs, quietEnabled, quietStart, quietEnd, digest]);

  const reset = useCallback(() => {
    const d = defaultPrefs();
    setPrefs(d);
    setBaseline(JSON.parse(JSON.stringify(d)));
    setQuietEnabled(defaultMeta.quietEnabled);
    setQuietStart(defaultMeta.quietStart);
    setQuietEnd(defaultMeta.quietEnd);
    setDigest(defaultMeta.digest);
    setBaselineMeta({ ...defaultMeta });
    try {
      localStorage.removeItem('PRIMA-notification-prefs');
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Admin Panel <span style={{ color: 'var(--card-border-hover)' }}>·</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>Notifications</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-[1.65rem]" style={{ color: 'var(--text-color)' }}>
            Notifications
          </h1>
          <p className="mt-1 max-w-2xl text-sm md:text-[15px]" style={{ color: 'var(--text-muted)' }}>
            Configure personal and team alert preferences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: dirty ? 'var(--gradient-PRIMAry)' : 'var(--card-border)',
              border: 'none',
              cursor: dirty ? 'pointer' : 'not-allowed',
              boxShadow: dirty ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Check className="h-4 w-4" />
            Save changes
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to default
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_minmax(280px,320px)]">
        <div className="overflow-hidden p-5 sm:p-6" style={cardStyle}>
          <div
            className="mb-4 hidden grid-cols-[minmax(0,1fr)_88px_88px_88px] gap-2 border-b pb-3 text-[10px] font-bold uppercase tracking-[0.14em] sm:grid"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
          >
            <span />
            <span className="flex items-center justify-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <span className="flex items-center justify-center gap-1">
              <Bell className="h-3.5 w-3.5" />
              In-app
            </span>
            <span className="flex items-center justify-center gap-1">
              <Smartphone className="h-3.5 w-3.5" />
              SMS
            </span>
          </div>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.id}>
                <h2
                  className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {section.heading}
                </h2>
                <div className="space-y-0 divide-y" style={{ borderColor: 'var(--card-border)' }}>
                  {section.items.map((item) => {
                    const row = prefs[item.id] ?? { email: false, inApp: false, sms: false };
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 gap-4 py-4 first:pt-0 sm:grid-cols-[minmax(0,1fr)_88px_88px_88px] sm:items-center sm:gap-2"
                      >
                        <div className="flex gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChannelToggle
                          label="Email"
                          checked={row.email}
                          onChange={() => toggleChannel(item.id, 'email')}
                        />
                        <ChannelToggle
                          label="In-app"
                          checked={row.inApp}
                          onChange={() => toggleChannel(item.id, 'inApp')}
                        />
                        <ChannelToggle label="SMS" checked={row.sms} onChange={() => toggleChannel(item.id, 'sms')} />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="p-5" style={cardStyle}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                  Quiet hours
                </h2>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Disable non-urgent notifications during these hours.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={quietEnabled}
                onClick={() => setQuietEnabled((v) => !v)}
                className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                style={{
                  backgroundColor: quietEnabled ? 'var(--PRIMAry-color)' : 'var(--toggle-bg)',
                }}
              >
                <span
                  className="absolute top-0.5 h-6 w-6 rounded-full shadow transition-transform"
                  style={{
                    left: quietEnabled ? 'calc(100% - 1.625rem)' : '0.125rem',
                    backgroundColor: 'var(--toggle-thumb)',
                  }}
                />
              </button>
            </div>
            <div className={`mt-4 space-y-3 ${quietEnabled ? '' : 'pointer-events-none opacity-50'}`}>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Start time
                </span>
                <select
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)',
                  }}
                >
                  {TIME_OPTIONS.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  End time
                </span>
                <select
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)',
                  }}
                >
                  {TIME_OPTIONS.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Time zone: Asia/Kolkata (IST)
            </p>
          </div>

          <div className="p-5" style={cardStyle}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Email digest
            </h2>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Receive a summary of notifications.
            </p>
            <select
              value={digest}
              onChange={(e) => setDigest(e.target.value)}
              className="mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
              }}
            >
              {DIGEST_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          </div>

          <div
            className="flex gap-3 rounded-xl border p-4"
            style={{
              borderColor: 'var(--PRIMAry-subtle)',
              backgroundColor: 'var(--PRIMAry-subtle)',
            }}
          >
            <Info className="h-5 w-5 shrink-0" style={{ color: 'var(--PRIMAry-color)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-color)' }}>
              Critical notifications like security alerts and leave approvals will always be delivered regardless of your
              preferences.
            </p>
          </div>

          <div className="p-5" style={cardStyle}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Need help?
            </h2>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Learn more about notification settings and best practices.
            </p>
            <a
              href="https://example.com/help/notifications"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ borderColor: 'var(--card-border)', color: 'var(--PRIMAry-color)' }}
            >
              View help center
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChannelToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:flex-col sm:justify-center">
      <span className="text-[10px] font-semibold uppercase tracking-wide sm:hidden" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
        style={{
          borderColor: checked ? 'var(--PRIMAry-color)' : 'var(--card-border)',
          backgroundColor: checked ? 'var(--PRIMAry-subtle)' : 'var(--input-bg)',
          color: checked ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
        }}
        aria-label={label}
      >
        {checked ? <Check className="h-4 w-4 stroke-[3]" /> : null}
      </button>
    </div>
  );
}
