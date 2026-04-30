'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import {
  Calendar,
  Download,
  FileText,
  Megaphone,
  Moon,
  MoreVertical,
  Pin,
  Plus,
  Search,
  Send,
  Settings2,
  SlidersHorizontal,
  Sun,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme/ThemeContext';

const cardStyle = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '14px',
  boxShadow: 'var(--shadow-sm)',
} as const;

const TABS = ['All', 'Important', 'Team Updates', 'HR', 'Events', 'Scheduled'] as const;
type Tab = (typeof TABS)[number];

type AnnouncementRow = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  timeLabel: string;
  tab: Tab;
  tags: { label: string; tone: 'primary' | 'accent' | 'urgent' }[];
  read: number;
  total: number;
  status: 'Active' | 'Scheduled';
  icon: 'calendar' | 'doc' | 'megaphone';
};

const MOCK: AnnouncementRow[] = [
  {
    id: '1',
    title: 'Q2 town hall — save the date',
    excerpt: 'Join leadership for product roadmap highlights and Q&A in the main auditorium…',
    author: 'You',
    timeLabel: 'Today at 9:30 AM',
    tab: 'Important',
    tags: [{ label: 'Important', tone: 'primary' }],
    read: 32,
    total: 38,
    status: 'Active',
    icon: 'calendar',
  },
  {
    id: '2',
    title: 'Updated remote-work policy',
    excerpt: 'Please review the refreshed guidelines effective next Monday. Managers should acknowledge…',
    author: 'You',
    timeLabel: 'Yesterday at 4:12 PM',
    tab: 'HR',
    tags: [{ label: 'Team update', tone: 'accent' }],
    read: 28,
    total: 38,
    status: 'Active',
    icon: 'doc',
  },
  {
    id: '3',
    title: 'Security drill this Thursday',
    excerpt: 'Short VPN interruption expected between 2–2:15 PM local. No action needed unless…',
    author: 'You',
    timeLabel: 'Mon at 11:00 AM',
    tab: 'Important',
    tags: [{ label: 'Urgent', tone: 'urgent' }],
    read: 35,
    total: 38,
    status: 'Active',
    icon: 'megaphone',
  },
  {
    id: '4',
    title: 'Team lunch — RSVP',
    excerpt: 'Celebrating milestone delivery. Dietary preferences captured in the linked form…',
    author: 'You',
    timeLabel: 'Sun at 6:45 PM',
    tab: 'Events',
    tags: [{ label: 'Team update', tone: 'accent' }],
    read: 19,
    total: 38,
    status: 'Active',
    icon: 'calendar',
  },
  {
    id: '5',
    title: 'New hire onboarding kit',
    excerpt: 'Checklist and templates for buddy assignments are now in the shared drive…',
    author: 'You',
    timeLabel: 'Fri at 2:20 PM',
    tab: 'Team Updates',
    tags: [{ label: 'Team update', tone: 'accent' }],
    read: 24,
    total: 38,
    status: 'Active',
    icon: 'doc',
  },
  {
    id: '6',
    title: 'Benefits enrollment window opens Monday',
    excerpt: 'Reminder: changes take effect next quarter. HR desk hours extended…',
    author: 'You',
    timeLabel: 'Scheduled for Mon 8:00 AM',
    tab: 'HR',
    tags: [{ label: 'Important', tone: 'primary' }],
    read: 0,
    total: 38,
    status: 'Scheduled',
    icon: 'doc',
  },
  {
    id: '7',
    title: 'Office closure — regional holiday',
    excerpt: 'Offices in Region B will be closed; remote coverage as usual…',
    author: 'You',
    timeLabel: 'Scheduled for Wed 7:00 AM',
    tab: 'Events',
    tags: [{ label: 'Team update', tone: 'accent' }],
    read: 0,
    total: 38,
    status: 'Scheduled',
    icon: 'calendar',
  },
];

const sparkTotal = [
  { i: 0, v: 12 },
  { i: 1, v: 14 },
  { i: 2, v: 13 },
  { i: 3, v: 16 },
  { i: 4, v: 15 },
  { i: 5, v: 18 },
];
const sparkActive = [
  { i: 0, v: 2 },
  { i: 1, v: 3 },
  { i: 2, v: 2 },
  { i: 3, v: 4 },
  { i: 4, v: 3 },
  { i: 5, v: 4 },
];
const sparkUnread = [
  { i: 0, v: 11 },
  { i: 1, v: 10 },
  { i: 2, v: 12 },
  { i: 3, v: 9 },
  { i: 4, v: 10 },
  { i: 5, v: 9 },
];
const sparkScheduled = [
  { i: 0, v: 1 },
  { i: 1, v: 2 },
  { i: 2, v: 1 },
  { i: 3, v: 2 },
  { i: 4, v: 2 },
  { i: 5, v: 2 },
];

function MiniSpark({ data }: { data: { i: number; v: number }[] }) {
  return (
    <div className="mt-3 h-10 w-full opacity-90">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="var(--PRIMAry-color)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RowIcon({ kind }: { kind: AnnouncementRow['icon'] }) {
  const wrap = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl';
  if (kind === 'calendar') {
    return (
      <div className={wrap} style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}>
        <Calendar className="h-5 w-5" />
      </div>
    );
  }
  if (kind === 'doc') {
    return (
      <div
        className={wrap}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--signal-positive) 12%, var(--card-bg))',
          color: 'var(--signal-positive)',
        }}
      >
        <FileText className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className={wrap} style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-color)' }}>
      <Megaphone className="h-5 w-5" />
    </div>
  );
}

function TagPill({ label, tone }: { label: string; tone: 'primary' | 'accent' | 'urgent' }) {
  if (tone === 'urgent') {
    return (
      <span
        className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--signal-negative) 14%, transparent)',
          color: 'var(--signal-negative)',
        }}
      >
        {label}
      </span>
    );
  }
  if (tone === 'accent') {
    return (
      <span
        className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
        style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-color)' }}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}
    >
      {label}
    </span>
  );
}

export default function AnnouncementsDashboard() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [audience, setAudience] = useState('all-teams');
  const [priority, setPriority] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all-time');

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filtered = useMemo(() => {
    return MOCK.filter((row) => {
      const matchTab =
        tab === 'All'
          ? true
          : tab === 'Scheduled'
            ? row.status === 'Scheduled'
            : tab === 'Important'
              ? row.tags.some((t) => t.tone === 'primary' || t.tone === 'urgent')
              : row.tab === tab;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.excerpt.toLowerCase().includes(q) ||
        row.tags.some((t) => t.label.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && row.status === 'Active') ||
        (statusFilter === 'scheduled' && row.status === 'Scheduled');
      return matchTab && matchSearch && matchStatus;
    });
  }, [tab, search, statusFilter]);

  const displayTotal = filtered.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = displayTotal === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, displayTotal);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const exportCsv = useCallback(() => {
    const headers = ['id', 'title', 'author', 'status', 'read', 'total'];
    const lines = [headers.join(','), ...MOCK.map((r) =>
      [r.id, `"${r.title.replace(/"/g, '""')}"`, r.author, r.status, r.read, r.total].join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `announcements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Admin Panel <span style={{ color: 'var(--card-border-hover)' }}>·</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>Announcements</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-[1.65rem]" style={{ color: 'var(--text-color)' }}>
            Announcements
          </h1>
          <p className="mt-1 max-w-2xl text-sm md:text-[15px]" style={{ color: 'var(--text-muted)' }}>
            Post updates and notices to your team.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
            }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{
              background: 'var(--gradient-PRIMAry)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus className="h-4 w-4" />
            Create announcement
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

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
              Total announcements
            </span>
            <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--PRIMAry-subtle)' }}>
              <Megaphone className="h-4 w-4" style={{ color: 'var(--PRIMAry-color)' }} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            18
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            All-time posts
          </p>
          <MiniSpark data={sparkTotal} />
        </div>
        <div className="p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
              Active this week
            </span>
            <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <Send className="h-4 w-4" style={{ color: 'var(--accent-color)' }} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            4
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Published in last 7 days
          </p>
          <MiniSpark data={sparkActive} />
        </div>
        <div className="p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
              Unread by team
            </span>
            <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--PRIMAry-subtle)' }}>
              <Users className="h-4 w-4" style={{ color: 'var(--PRIMAry-color)' }} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            9
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Across all audiences
          </p>
          <MiniSpark data={sparkUnread} />
        </div>
        <div className="p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
              Scheduled posts
            </span>
            <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <Calendar className="h-4 w-4" style={{ color: 'var(--accent-color)' }} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            2
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Queued for later
          </p>
          <MiniSpark data={sparkScheduled} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_minmax(260px,300px)]">
        {/* Main column */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={cn('rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors')}
                style={{
                  backgroundColor: tab === t ? 'var(--PRIMAry-subtle)' : 'transparent',
                  color: tab === t ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
                  border: tab === t ? '1px solid var(--PRIMAry-color)' : '1px solid transparent',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              className="relative flex flex-1 items-center rounded-xl border px-3 py-2"
              style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--input-bg)' }}
            >
              <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search announcements…"
                className="ml-2 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-color)' }}
              />
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}
              aria-label="Filter"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <ul className="space-y-3">
            {pageRows.length === 0 && (
              <li className="rounded-xl border px-4 py-10 text-center text-sm" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
                No announcements match your filters.
              </li>
            )}
            {pageRows.map((row) => (
              <li key={row.id} className="p-4" style={cardStyle}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <RowIcon kind={row.icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>
                        {row.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {row.tags.map((t) => (
                          <TagPill key={t.label} label={t.label} tone={t.tone} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {row.excerpt}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      By {row.author} <span style={{ color: 'var(--card-border-hover)' }}>•</span> {row.timeLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 sm:min-w-[140px]">
                    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            row.status === 'Active' ? 'var(--signal-positive)' : 'var(--accent-color)',
                        }}
                      />
                      {row.status}
                    </div>
                    <p className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                        {row.read}
                      </span>{' '}
                      / {row.total} read
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-1.5"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Pin"
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="More"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--card-border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {displayTotal === 0
                ? 'No announcements to show'
                : `Showing ${start} to ${end} of ${displayTotal} announcements`}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className="h-8 min-w-[2rem] rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: safePage === n ? 'var(--PRIMAry-subtle)' : 'var(--bg-subtle)',
                    color: safePage === n ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
                    border: `1px solid ${safePage === n ? 'var(--PRIMAry-color)' : 'var(--card-border)'}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <div className="p-5" style={cardStyle}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Quick actions
            </h2>
            <ul className="mt-3 space-y-2">
              {[
                { label: 'Create announcement', icon: Plus },
                { label: 'Schedule post', icon: Calendar },
                { label: 'Send urgent alert', icon: Megaphone, warn: true },
                { label: 'View analytics', icon: Settings2 },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors"
                    style={{
                      borderColor: 'var(--card-border)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: item.warn ? 'var(--signal-negative)' : 'var(--text-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5" style={cardStyle}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                Filters
              </h2>
              <button
                type="button"
                className="text-xs font-semibold"
                style={{ color: 'var(--PRIMAry-color)' }}
                onClick={() => {
                  setAudience('all-teams');
                  setPriority('all');
                  setStatusFilter('all');
                  setDateRange('all-time');
                  setPage(1);
                }}
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              <FilterSelect
                label="Audience"
                value={audience}
                onChange={setAudience}
                options={[
                  { v: 'all-teams', l: 'All teams' },
                  { v: 'engineering', l: 'Engineering' },
                  { v: 'people-ops', l: 'People ops' },
                ]}
              />
              <FilterSelect
                label="Priority"
                value={priority}
                onChange={setPriority}
                options={[
                  { v: 'all', l: 'All priorities' },
                  { v: 'high', l: 'High' },
                  { v: 'normal', l: 'Normal' },
                ]}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { v: 'all', l: 'All status' },
                  { v: 'active', l: 'Active' },
                  { v: 'scheduled', l: 'Scheduled' },
                ]}
              />
              <FilterSelect
                label="Date range"
                value={dateRange}
                onChange={setDateRange}
                options={[
                  { v: 'all-time', l: 'All time' },
                  { v: '7d', l: 'Last 7 days' },
                  { v: '30d', l: 'Last 30 days' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
        style={{
          borderColor: 'var(--card-border)',
          backgroundColor: 'var(--input-bg)',
          color: 'var(--text-color)',
        }}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}
