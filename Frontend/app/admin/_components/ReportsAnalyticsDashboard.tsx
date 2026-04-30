'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Calendar,
  Clock,
  Download,
  PenLine,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const PERIODS = ['Today', 'This Month', 'Last 3 Months', 'Custom'] as const;
type Period = (typeof PERIODS)[number];

const attendanceWeeks = [
  { week: 'W1', present: 38, absent: 4 },
  { week: 'W2', present: 41, absent: 2 },
  { week: 'W3', present: 39, absent: 5 },
  { week: 'W4', present: 44, absent: 1 },
  { week: 'W5', present: 40, absent: 3 },
];

const leaveByType = [
  { name: 'Paid Leave', value: 18 },
  { name: 'Sick Leave', value: 12 },
  { name: 'Casual Leave', value: 8 },
];

const productivityTrend = [
  { month: 'Nov', completed: 180, assigned: 220 },
  { month: 'Dec', completed: 195, assigned: 235 },
  { month: 'Jan', completed: 210, assigned: 248 },
  { month: 'Feb', completed: 220, assigned: 260 },
  { month: 'Mar', completed: 235, assigned: 275 },
  { month: 'Apr', completed: 247, assigned: 283 },
];

const topPerformers = [
  { name: 'Alex Morgan', role: 'Senior Engineer', pct: 95, initials: 'AM', key: 'a' },
  { name: 'Jordan Lee', role: 'Designer', pct: 91, initials: 'JL', key: 'b' },
  { name: 'Sam Rivera', role: 'PM', pct: 89, initials: 'SR', key: 'c' },
  { name: 'Casey Kim', role: 'Analyst', pct: 87, initials: 'CK', key: 'd' },
];

const leaveSummaryRows = [
  { label: 'Paid Leave', days: 18, pct: '47%', dot: 'var(--PRIMAry-color)' },
  { label: 'Sick Leave', days: 12, pct: '32%', dot: 'var(--accent-color)' },
  { label: 'Casual Leave', days: 8, pct: '21%', dot: 'var(--PRIMAry-hover)' },
];

const exportRows = [
  { title: 'Attendance report', sub: 'Daily / weekly rollups', fmt: 'CSV' as const },
  { title: 'Leave report', sub: 'Balances & approvals', fmt: 'CSV' as const },
  { title: 'Timesheet export', sub: 'Hours by project', fmt: 'CSV' as const },
  { title: 'Performance snapshot', sub: 'Goals & ratings', fmt: 'PDF' as const },
];

export default function ReportsAnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('This Month');
  const leaveTotal = useMemo(() => leaveByType.reduce((s, d) => s + d.value, 0), []);

  return (
    <div className="space-y-6">
      {/* Breadcrumb-style + title */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
          Admin Panel <span style={{ color: 'var(--card-border-hover)' }}>·</span>{' '}
          <span style={{ color: 'var(--text-muted)' }}>Reports & Analytics</span>
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-[1.65rem]" style={{ color: 'var(--text-color)' }}>
          Reports & Analytics
        </h1>
        <p className="mt-1 max-w-3xl text-sm md:text-[15px]" style={{ color: 'var(--text-muted)' }}>
          Attendance summaries, productivity reports, and exports.
        </p>
      </div>

      {/* Period + export */}
      <div
        className="flex flex-col gap-4 rounded-[14px] border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ ...cardStyle, boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                period === p ? 'ring-1' : ''
              )}
              style={{
                backgroundColor: period === p ? 'var(--PRIMAry-subtle)' : 'var(--bg-subtle)',
                color: period === p ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
                border: `1px solid ${period === p ? 'var(--PRIMAry-color)' : 'var(--card-border)'}`,
                boxShadow: period === p ? 'none' : undefined,
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)', backgroundColor: 'var(--input-bg)' }}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Apr 1 – Apr 20, 2026
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white"
            style={{
              background: 'var(--gradient-PRIMAry)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export all
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total hours worked"
          value="1,842"
          trend="+8.3% vs last month"
          trendUp
          icon={<Clock className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />}
        />
        <KpiCard
          label="Attendance rate"
          value="94.2%"
          trend="+2.1% vs last month"
          trendUp
          icon={<UserRound className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />}
        />
        <KpiCard
          label="Leaves taken"
          value="38"
          trend="+5 vs last month"
          trendUp={false}
          icon={<Calendar className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />}
        />
        <KpiCard
          label="Pending approvals"
          value="7"
          trend="Same as last week"
          neutral
          icon={<PenLine className="h-5 w-5" style={{ color: 'var(--PRIMAry-hover)' }} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="p-5 lg:col-span-3" style={cardStyle}>
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                Attendance overview
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Daily present vs absent — April 2026
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}
            >
              Monthly
            </span>
          </div>
          <div className="h-[240px] w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceWeeks} barGap={6} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                <Bar dataKey="present" name="Present" fill="var(--PRIMAry-color)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="absent" name="Absent" fill="var(--input-bg)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 lg:col-span-2" style={cardStyle}>
          <div className="mb-2">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Leave breakdown
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              By leave type — this month
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={78}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {leaveByType.map((_, i) => (
                      <Cell
                        key={leaveByType[i].name}
                        fill={
                          i === 0 ? 'var(--PRIMAry-color)' : i === 1 ? 'var(--accent-color)' : 'var(--PRIMAry-hover)'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div
                className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center text-center"
                style={{ marginTop: -4 }}
              >
                <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                  {leaveTotal}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Total leaves
                </span>
              </div>
            </div>
            <ul className="w-full max-w-[200px] space-y-2.5 text-xs sm:max-w-none">
              {leaveByType.map((row, i) => (
                <li key={row.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          i === 0 ? 'var(--PRIMAry-color)' : i === 1 ? 'var(--accent-color)' : 'var(--PRIMAry-hover)',
                      }}
                    />
                    {row.name}
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Productivity */}
      <div className="p-5" style={cardStyle}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
          Task productivity trend
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Completed vs assigned — rolling 6 months
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
          <div className="h-[260px] min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="var(--PRIMAry-color)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--PRIMAry-color)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="assigned"
                  name="Assigned"
                  stroke="var(--accent-color)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ fill: 'var(--accent-color)', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-row gap-3 lg:flex-col lg:justify-center">
            <MiniStat label="Completed" value="247" accent="var(--PRIMAry-color)" />
            <MiniStat label="Assigned" value="283" accent="var(--accent-color)" />
            <MiniStat label="Rate" value="87%" accent="var(--PRIMAry-color)" />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Top performers
          </h2>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            By completion & quality signals
          </p>
          <ul className="space-y-3">
            {topPerformers.map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: 'var(--gradient-PRIMAry)' }}
                  >
                    {row.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      {row.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                      {row.role}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: 'var(--PRIMAry-color)' }}>
                  {row.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Leave summary
          </h2>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            Days and share of total
          </p>
          <ul className="space-y-2.5">
            {leaveSummaryRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.dot }} />
                  {row.label}
                </span>
                <span style={{ color: 'var(--text-color)' }}>
                  <span className="font-semibold tabular-nums">{row.days}</span>
                  <span style={{ color: 'var(--text-muted)' }}> d · </span>
                  <span className="font-medium">{row.pct}</span>
                </span>
              </li>
            ))}
          </ul>
          <div
            className="mt-4 rounded-xl border px-3 py-2.5 text-center text-xs font-semibold"
            style={{
              borderColor: 'var(--PRIMAry-subtle)',
              backgroundColor: 'var(--PRIMAry-subtle)',
              color: 'var(--PRIMAry-color)',
            }}
          >
            On leave today: 0 employees
          </div>
        </div>

        <div className="p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Quick export
          </h2>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            Download common reports
          </p>
          <ul className="space-y-3">
            {exportRows.map((row) => (
              <li
                key={row.title}
                className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5"
                style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                    {row.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {row.sub}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: 'var(--text-color)', cursor: 'pointer', border: 'none' }}
                >
                  <Download className="h-3 w-3" />
                  {row.fmt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  trend,
  trendUp,
  neutral,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  neutral?: boolean;
  icon: ReactNode;
}) {
  const trendColor = neutral
    ? 'var(--text-muted)'
    : trendUp
      ? 'var(--signal-positive)'
      : 'var(--signal-negative)';

  return (
    <div className="p-5" style={cardStyle}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--PRIMAry-subtle)' }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--text-color)' }}>
        {value}
      </p>
      <p className="mt-2 text-xs font-medium" style={{ color: trendColor }}>
        {trend}
      </p>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="min-w-[100px] flex-1 rounded-xl border px-4 py-3 text-center lg:flex-none lg:min-w-[120px]"
      style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}
    >
      <p className="text-lg font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}
