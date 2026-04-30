'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Hourglass,
  Plus,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';

const cardStyle = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '14px',
  boxShadow: 'var(--shadow-sm)',
} as const;

const tooltipStyle = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '8px',
  color: 'var(--text-color)',
  fontSize: 12,
} as const;

const TABS = [
  { id: 'all' as const, label: 'All timesheets' },
  { id: 'pending' as const, label: 'Pending approval', count: 8 },
  { id: 'approved' as const, label: 'Approved', count: 28 },
  { id: 'rejected' as const, label: 'Rejected', count: 2 },
];

type RowStatus = 'Approved' | 'Pending' | 'Rejected';

type TimesheetRow = {
  id: string;
  member: string;
  initials: string;
  date: string;
  project: string;
  projectDot: string;
  task: string;
  hours: string;
  status: RowStatus;
  submitted: string;
};

const TABLE_ROWS: TimesheetRow[] = [
  { id: '1', member: 'Meenu Rani', initials: 'MR', date: 'Apr 28, 2026', project: 'Website redesign', projectDot: 'var(--PRIMAry-color)', task: 'UI polish & QA fixes', hours: '8h 30m', status: 'Approved', submitted: 'Apr 28, 6:12 PM' },
  { id: '2', member: 'Raman Kumar', initials: 'RK', date: 'Apr 28, 2026', project: 'Mobile app', projectDot: 'var(--accent-color)', task: 'API integration', hours: '7h 45m', status: 'Pending', submitted: 'Apr 28, 5:40 PM' },
  { id: '3', member: 'Priya Sharma', initials: 'PS', date: 'Apr 27, 2026', project: 'Website redesign', projectDot: 'var(--PRIMAry-color)', task: 'Content review', hours: '6h 00m', status: 'Approved', submitted: 'Apr 27, 8:02 PM' },
  { id: '4', member: 'Arjun Patel', initials: 'AP', date: 'Apr 27, 2026', project: 'Internal tools', projectDot: 'var(--signal-positive)', task: 'Dashboard widgets', hours: '8h 15m', status: 'Rejected', submitted: 'Apr 27, 4:55 PM' },
  { id: '5', member: 'Sneha Reddy', initials: 'SR', date: 'Apr 26, 2026', project: 'Mobile app', projectDot: 'var(--accent-color)', task: 'Push notifications', hours: '7h 00m', status: 'Pending', submitted: 'Apr 26, 7:18 PM' },
];

const hoursTrend = [
  { day: 'Apr 1', hours: 36 },
  { day: 'Apr 4', hours: 42 },
  { day: 'Apr 8', hours: 38 },
  { day: 'Apr 12', hours: 45 },
  { day: 'Apr 16', hours: 40 },
  { day: 'Apr 20', hours: 48 },
  { day: 'Apr 24', hours: 52 },
  { day: 'Apr 28', hours: 44 },
];

const projectDonut = [
  { name: 'Website redesign', hours: 420, fill: 'var(--PRIMAry-color)' },
  { name: 'Mobile app', hours: 310, fill: 'var(--accent-color)' },
  { name: 'Internal tools', hours: 198, fill: 'var(--signal-positive)' },
  { name: 'Support & ops', hours: 156, fill: 'var(--toggle-icon)' },
  { name: 'Other', hours: 164.5, fill: 'var(--PRIMAry-subtle)' },
];

const topMembers = [
  { rank: 1, name: 'Meenu Rani', initials: 'MR', role: 'Senior engineer', hours: 168, max: 168 },
  { rank: 2, name: 'Raman Kumar', initials: 'RK', role: 'Engineer', hours: 152, max: 168 },
  { rank: 3, name: 'Priya Sharma', initials: 'PS', role: 'QA lead', hours: 141, max: 168 },
  { rank: 4, name: 'Sneha Reddy', initials: 'SR', role: 'Designer', hours: 128, max: 168 },
  { rank: 5, name: 'Arjun Patel', initials: 'AP', role: 'Engineer', hours: 112, max: 168 },
];

const pendingList = [
  { name: 'Raman Kumar', initials: 'RK', range: 'Apr 21 – Apr 27, 2026', hours: '38h 15m' },
  { name: 'Sneha Reddy', initials: 'SR', range: 'Apr 22 – Apr 28, 2026', hours: '32h 00m' },
  { name: 'Vikram Singh', initials: 'VS', range: 'Apr 24 – Apr 28, 2026', hours: '28h 30m' },
];

function statusPill(status: RowStatus): { bg: string; color: string; label: string } {
  if (status === 'Approved') {
    return {
      bg: 'color-mix(in srgb, var(--signal-positive) 14%, var(--card-bg))',
      color: 'var(--signal-positive)',
      label: 'Approved',
    };
  }
  if (status === 'Pending') {
    return {
      bg: 'color-mix(in srgb, var(--toggle-icon) 16%, var(--card-bg))',
      color: 'var(--toggle-icon)',
      label: 'Pending',
    };
  }
  return {
    bg: 'color-mix(in srgb, var(--signal-negative) 14%, var(--card-bg))',
    color: 'var(--signal-negative)',
    label: 'Rejected',
  };
}

export default function TimesheetsDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');

  const filteredRows = useMemo(() => {
    return TABLE_ROWS.filter((row) => {
      if (tab === 'pending' && row.status !== 'Pending') return false;
      if (tab === 'approved' && row.status !== 'Approved') return false;
      if (tab === 'rejected' && row.status !== 'Rejected') return false;
      const q = search.trim().toLowerCase();
      if (q && !`${row.member} ${row.project} ${row.task}`.toLowerCase().includes(q)) return false;
      if (projectFilter !== 'all' && row.project !== projectFilter) return false;
      if (memberFilter !== 'all' && row.member !== memberFilter) return false;
      return true;
    });
  }, [tab, search, projectFilter, memberFilter]);

  const projectOptions = useMemo(() => {
    const s = new Set(TABLE_ROWS.map((r) => r.project));
    return Array.from(s);
  }, []);

  const memberOptions = useMemo(() => {
    const s = new Set(TABLE_ROWS.map((r) => r.member));
    return Array.from(s);
  }, []);

  const donutTotal = useMemo(() => projectDonut.reduce((a, p) => a + p.hours, 0), []);

  const exportCsv = useCallback(() => {
    const lines = [
      'Member,Date,Project,Task,Hours,Status,Submitted',
      ...filteredRows.map((r) =>
        [r.member, r.date, r.project, r.task, r.hours, r.status, r.submitted].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRows]);

  const selectStyle = {
    borderColor: 'var(--card-border)',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-color)',
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Admin Panel <span style={{ color: 'var(--card-border-hover)' }}>·</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>Timesheets</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-[1.65rem]" style={{ color: 'var(--text-color)' }}>
            Timesheets
          </h1>
          <p className="mt-1 max-w-2xl text-sm md:text-[15px]" style={{ color: 'var(--text-muted)' }}>
            Review and approve team work hours.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', cursor: 'pointer' }}
          >
            <Calendar className="h-4 w-4 shrink-0" style={{ color: 'var(--PRIMAry-color)' }} />
            Apr 1 – Apr 30, 2026
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', cursor: 'pointer' }}
            aria-label="Filters"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', cursor: 'pointer' }}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--gradient-PRIMAry)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          >
            <Plus className="h-4 w-4" />
            New timesheet
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="p-4 sm:p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                Total logged hours
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl" style={{ color: 'var(--text-color)' }}>
                1,248h 30m
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--signal-positive)' }}>
                <TrendingUp className="h-3.5 w-3.5" />
                12% vs last month
              </p>
            </div>
            <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}>
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                Approved hours
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl" style={{ color: 'var(--text-color)' }}>
                1,102h 45m
              </p>
              <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                88.3% of total
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
                <div className="h-full rounded-full" style={{ width: '88.3%', backgroundColor: 'var(--signal-positive)' }} />
              </div>
            </div>
            <div
              className="rounded-xl p-2.5"
              style={{ backgroundColor: 'color-mix(in srgb, var(--signal-positive) 14%, var(--card-bg))', color: 'var(--signal-positive)' }}
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                Pending approval
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl" style={{ color: 'var(--text-color)' }}>
                145h 45m
              </p>
              <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                11.7% of total
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
                <div className="h-full rounded-full" style={{ width: '11.7%', backgroundColor: 'var(--toggle-icon)' }} />
              </div>
            </div>
            <div
              className="rounded-xl p-2.5"
              style={{ backgroundColor: 'color-mix(in srgb, var(--toggle-icon) 16%, var(--card-bg))', color: 'var(--toggle-icon)' }}
            >
              <Hourglass className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5" style={cardStyle}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                Total members
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl" style={{ color: 'var(--text-color)' }}>
                24
              </p>
              <p className="mt-1 text-xs font-medium" style={{ color: 'var(--accent-color)' }}>
                Active this month
              </p>
            </div>
            <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-color)' }}>
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: tab === t.id ? 'var(--PRIMAry-subtle)' : 'transparent',
              color: tab === t.id ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
              border: tab === t.id ? '1px solid var(--PRIMAry-color)' : '1px solid transparent',
            }}
          >
            {t.label}
            {'count' in t ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div
          className="relative flex min-w-[200px] flex-1 items-center rounded-xl border px-3 py-2"
          style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--input-bg)' }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, project…"
            className="ml-2 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-color)' }}
          />
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="min-w-[160px] rounded-xl border px-3 py-2 text-sm outline-none"
          style={selectStyle}
        >
          <option value="all">All projects</option>
          {projectOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="min-w-[160px] rounded-xl border px-3 py-2 text-sm outline-none"
          style={selectStyle}
        >
          <option value="all">All members</option>
          {memberOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Middle: table + hours overview */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)]">
        <div className="overflow-hidden p-4 sm:p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Team timesheets
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Latest entries for the selected range
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
                  <th className="pb-2 pr-3">Member</th>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Project</th>
                  <th className="pb-2 pr-3">Task / activity</th>
                  <th className="pb-2 pr-3">Hours</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Submitted on</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const pill = statusPill(row.status);
                  return (
                    <tr key={row.id} className="border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: 'var(--gradient-PRIMAry)' }}
                          >
                            {row.initials}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--text-color)' }}>
                            {row.member}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {row.date}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.projectDot }} />
                          <span style={{ color: 'var(--text-color)' }}>{row.project}</span>
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate py-3 pr-3" style={{ color: 'var(--text-muted)' }}>
                        {row.task}
                      </td>
                      <td className="py-3 pr-3 font-medium tabular-nums" style={{ color: 'var(--text-color)' }}>
                        {row.hours}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: pill.bg, color: pill.color }}>
                          {pill.label}
                        </span>
                      </td>
                      <td className="py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {row.submitted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 ? (
            <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No timesheets match your filters.
            </p>
          ) : null}
          <button type="button" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--PRIMAry-color)' }}>
            View all timesheets
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Hours overview
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Averages for April 2026
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Daily average
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                41h 36m
              </p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Longest day
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                Apr 24, 2026
              </p>
              <p className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                52h logged org-wide
              </p>
            </div>
          </div>
          <div className="mt-4 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hoursTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timesheetHoursFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--PRIMAry-color)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--PRIMAry-color)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="hours" stroke="var(--PRIMAry-color)" strokeWidth={2} fill="url(#timesheetHoursFill)" fillOpacity={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="p-4 sm:p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Project-wise hours
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Share of total logged time
          </p>
          <div className="relative mx-auto mt-4 h-[220px] max-w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectDonut} dataKey="hours" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={1}>
                  {projectDonut.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(1)}h`, 'Hours']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold tabular-nums leading-tight" style={{ color: 'var(--text-color)' }}>
                1,248h
              </span>
              <span className="text-lg font-bold tabular-nums leading-tight" style={{ color: 'var(--text-color)' }}>
                30m
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Total hours
              </span>
            </div>
          </div>
          <ul className="mx-auto mt-2 max-w-xs space-y-2 text-xs">
            {projectDonut.map((p) => {
              const pct = ((p.hours / donutTotal) * 100).toFixed(1);
              return (
                <li key={p.name} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.fill }} />
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums font-semibold" style={{ color: 'var(--text-color)' }}>
                    {p.hours.toFixed(0)}h
                    <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                      {' '}
                      ({pct}%)
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 sm:p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Top members by hours
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            April 2026
          </p>
          <ul className="mt-4 space-y-4">
            {topMembers.map((m) => (
              <li key={m.rank} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {m.rank}
                </span>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: 'var(--gradient-PRIMAry)' }}
                >
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                    {m.name}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {m.role}
                  </p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(m.hours / m.max) * 100}%`, background: 'var(--gradient-PRIMAry)' }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: 'var(--PRIMAry-color)' }}>
                  {m.hours}h
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 sm:p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Pending approvals
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                8
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Timesheets
              </p>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-xl font-bold tabular-nums leading-tight" style={{ color: 'var(--toggle-icon)' }}>
                145h 45m
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Pending
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {pendingList.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5"
                style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--input-bg)' }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'var(--gradient-PRIMAry)' }}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      {p.name}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {p.range}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    {p.hours}
                  </p>
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: 'color-mix(in srgb, var(--toggle-icon) 18%, transparent)', color: 'var(--toggle-icon)' }}>
                    Pending
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: 'var(--gradient-PRIMAry)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
          >
            Review pending timesheets
          </button>
        </div>
      </div>
    </div>
  );
}
