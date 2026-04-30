'use client';

import { useCallback, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Download,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
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

const ANALYTICS_PERIODS = ['This Month', 'Last Month', 'Last Quarter'] as const;

const teamRows = [
  { name: 'Meenu Rani', dept: 'Engineering', tasksPct: 0.92, tasksLabel: '46/50', goalsPct: 0.88, goalsLabel: '7/8', rating: 4.8, attendance: 96, trendUp: true },
  { name: 'Raman Kumar', dept: 'Engineering', tasksPct: 0.78, tasksLabel: '39/50', goalsPct: 0.62, goalsLabel: '5/8', rating: 4.2, attendance: 91, trendUp: true },
  { name: 'Priya Sharma', dept: 'Quality Assurance', tasksPct: 0.85, tasksLabel: '34/40', goalsPct: 0.75, goalsLabel: '6/8', rating: 4.5, attendance: 94, trendUp: false },
  { name: 'Arjun Patel', dept: 'Engineering', tasksPct: 0.7, tasksLabel: '28/40', goalsPct: 0.5, goalsLabel: '4/8', rating: 3.9, attendance: 88, trendUp: false },
  { name: 'Sneha Reddy', dept: 'Design', tasksPct: 0.88, tasksLabel: '22/25', goalsPct: 0.8, goalsLabel: '4/5', rating: 4.6, attendance: 92, trendUp: true },
];

const productivityByEmployee = [
  { name: 'Meenu', score: 92 },
  { name: 'Raman', score: 78 },
  { name: 'Priya', score: 85 },
  { name: 'Arjun', score: 70 },
  { name: 'Sneha', score: 88 },
];

const ratingTrend = [
  { month: 'Dec', rating: 4.0 },
  { month: 'Jan', rating: 4.1 },
  { month: 'Feb', rating: 4.15 },
  { month: 'Mar', rating: 4.25 },
  { month: 'Apr', rating: 4.3 },
];

const scatterData = teamRows.map((r) => ({
  name: r.name.split(' ')[0],
  attendance: r.attendance,
  productivity: Math.round(r.tasksPct * 100),
}));

const goalDonut = [
  { name: 'Completed', value: 75, fill: 'var(--PRIMAry-color)' },
  { name: 'In progress', value: 18, fill: 'var(--accent-color)' },
  { name: 'Not started', value: 7, fill: 'var(--PRIMAry-subtle)' },
];

const activeGoals = [
  { title: 'Website launch', desc: 'Milestone Q2 — marketing alignment', pct: 0.72, bar: 'var(--accent-color)', due: 'May 15, 2026', icon: Target },
  { title: 'Reduce ticket resolution time', desc: 'Support SLA under 4h median', pct: 0.45, bar: 'var(--PRIMAry-color)', due: 'Apr 28, 2026', icon: TrendingUp },
  { title: 'Security training rollout', desc: '100% completion by department', pct: 0.6, bar: 'var(--signal-positive)', due: 'May 2, 2026', icon: ClipboardList },
  { title: 'Hiring pipeline refresh', desc: 'Open roles + interview scorecards', pct: 0.3, bar: 'var(--toggle-icon)', due: 'Jun 1, 2026', icon: Calendar },
];

const aiInsights = [
  { text: 'Meenu Rani is the top performer this month based on tasks and peer ratings.', dot: 'var(--PRIMAry-color)' },
  { text: 'QA team productivity improved by 12% compared to the previous cycle.', dot: 'var(--signal-positive)' },
  { text: 'Two employees are below goal pace; consider scheduling check-ins.', dot: 'var(--toggle-icon)' },
];

function MiniTrend({ up }: { up: boolean }) {
  const data = up
    ? [
        { i: 0, v: 3 },
        { i: 1, v: 4 },
        { i: 2, v: 3.5 },
        { i: 3, v: 5 },
        { i: 4, v: 4.8 },
      ]
    : [
        { i: 0, v: 5 },
        { i: 1, v: 4.5 },
        { i: 2, v: 4 },
        { i: 3, v: 3.5 },
        { i: 4, v: 3.2 },
      ];
  const stroke = up ? 'var(--signal-positive)' : 'var(--signal-negative)';
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  const filled = Math.min(5, Math.round(value));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const on = i < filled;
        return (
          <Star
            key={i}
            className="h-3.5 w-3.5 shrink-0"
            style={{
              color: on ? 'var(--toggle-icon)' : 'var(--card-border)',
              fill: on ? 'var(--toggle-icon)' : 'transparent',
            }}
          />
        );
      })}
    </div>
  );
}

export default function PerformanceDashboard() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<(typeof ANALYTICS_PERIODS)[number]>('This Month');

  const exportReport = useCallback(() => {
    const lines = [
      'Employee,Department,Tasks %,Goals %,Rating,Attendance',
      ...teamRows.map((r) =>
        [r.name, r.dept, String(Math.round(r.tasksPct * 100)), String(Math.round(r.goalsPct * 100)), String(r.rating), String(r.attendance)].join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Admin Panel <span style={{ color: 'var(--card-border-hover)' }}>·</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>Performance</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-[1.65rem]" style={{ color: 'var(--text-color)' }}>
            Performance dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm md:text-[15px]" style={{ color: 'var(--text-muted)' }}>
            Track team goals, productivity, and employee growth.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
            }}
          >
            <Calendar className="h-4 w-4 shrink-0" style={{ color: 'var(--PRIMAry-color)' }} />
            Apr 1 – Apr 30, 2026
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Review cycle
          </button>
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              cursor: 'pointer',
            }}
          >
            <Download className="h-4 w-4" />
            Export report
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
            Add goal
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="p-4" style={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Team productivity
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            82%
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--signal-positive)' }}>
            <TrendingUp className="h-3.5 w-3.5" />+8% vs last month
          </p>
        </div>
        <div className="p-4" style={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Goals completed
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            18 / 24
          </p>
          <p className="mt-1 text-xs font-medium" style={{ color: 'var(--signal-positive)' }}>
            75% completion rate
          </p>
        </div>
        <div className="p-4" style={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Top performer
          </p>
          <p className="mt-1 truncate text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Meenu Rani
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            4.8/5 · Engineering
          </p>
        </div>
        <div className="p-4" style={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Average rating
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            4.3 / 5
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--signal-positive)' }}>
            <TrendingUp className="h-3.5 w-3.5" />
            +0.3 vs last month
          </p>
        </div>
        <div className="p-4" style={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Pending reviews
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            5
          </p>
          <p className="mt-1 text-xs font-medium" style={{ color: 'var(--toggle-icon)' }}>
            Needs your review
          </p>
        </div>
        <div className="p-4" style={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            Low performance alerts
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
            2
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--signal-negative)' }}>
            <TrendingDown className="h-3.5 w-3.5" />
            Needs attention
          </p>
        </div>
      </div>

      {/* Middle: table + analytics */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="overflow-hidden p-4 sm:p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Team performance overview
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Snapshot for the selected period
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
                  <th className="pb-2 pr-3">Member</th>
                  <th className="pb-2 pr-3">Department</th>
                  <th className="pb-2 pr-3">Tasks done</th>
                  <th className="pb-2 pr-3">Goals</th>
                  <th className="pb-2 pr-3">Avg rating</th>
                  <th className="pb-2 pr-3">Attendance</th>
                  <th className="pb-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {teamRows.map((row) => (
                  <tr key={row.name} className="border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
                    <td className="py-3 pr-3 font-medium" style={{ color: 'var(--text-color)' }}>
                      {row.name}
                    </td>
                    <td className="py-3 pr-3" style={{ color: 'var(--text-muted)' }}>
                      {row.dept}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 min-w-[72px] flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.tasksPct * 100}%`, backgroundColor: 'var(--accent-color)' }}
                          />
                        </div>
                        <span className="shrink-0 text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          {row.tasksLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 min-w-[72px] flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
                          <div className="flex h-full overflow-hidden rounded-full">
                            <div
                              className="h-full"
                              style={{
                                width: `${row.goalsPct * 100}%`,
                                background: `linear-gradient(90deg, var(--signal-positive) 0%, var(--toggle-icon) 100%)`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="shrink-0 text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                          {row.goalsLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <StarRow value={row.rating} />
                    </td>
                    <td className="py-3 pr-3 tabular-nums font-medium" style={{ color: 'var(--text-color)' }}>
                      {row.attendance}%
                    </td>
                    <td className="py-3">
                      <MiniTrend up={row.trendUp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--PRIMAry-color)' }}
          >
            View all team members
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5" style={cardStyle}>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Performance analytics
            </h2>
            <select
              value={analyticsPeriod}
              onChange={(e) => setAnalyticsPeriod(e.target.value as (typeof ANALYTICS_PERIODS)[number])}
              className="rounded-xl border px-3 py-2 text-xs font-semibold outline-none"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
              }}
            >
              {ANALYTICS_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Productivity overview
              </p>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityByEmployee} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={28}>
                      {productivityByEmployee.map((_, i) => (
                        <Cell key={i} fill="var(--PRIMAry-color)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Average rating trend
              </p>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[3.5, 4.5]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="var(--PRIMAry-color)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--PRIMAry-color)', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Attendance vs productivity
              </p>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[80, 100]} />
                    <YAxis type="number" dataKey="productivity" name="Productivity" unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[60, 100]} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Team" data={scatterData} fill="var(--PRIMAry-color)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Goal completion %
              </p>
              <div className="relative mx-auto h-[160px] max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={goalDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={2}>
                      {goalDonut.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2 text-center">
                  <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    75%
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Completed
                  </span>
                </div>
              </div>
              <ul className="mt-1 flex flex-wrap justify-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {goalDonut.map((g) => (
                  <li key={g.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.fill }} />
                    {g.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="p-4 sm:p-5" style={cardStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
            Active goals
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            In flight across teams
          </p>
          <ul className="mt-4 space-y-4">
            {activeGoals.map((g) => {
              const GoalIcon = g.icon;
              return (
              <li key={g.title} className="flex gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}
                >
                  <GoalIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text-color)' }}>
                    {g.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {g.desc}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <div className="h-full rounded-full" style={{ width: `${g.pct * 100}%`, backgroundColor: g.bar }} />
                  </div>
                  <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Due {g.due}
                  </p>
                </div>
              </li>
            );
            })}
          </ul>
        </div>

        <div className="flex flex-col items-center p-6 text-center sm:p-8" style={cardStyle}>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}
          >
            <ClipboardList className="h-8 w-8" />
          </div>
          <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
            5 employees awaiting review
          </p>
          <p className="mt-2 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
            Complete reviews before <span className="font-medium" style={{ color: 'var(--text-color)' }}>Apr 30, 2026</span>.
          </p>
          <div className="mt-6 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
              style={{ borderColor: 'var(--PRIMAry-color)', color: 'var(--PRIMAry-color)', backgroundColor: 'var(--card-bg)', cursor: 'pointer' }}
            >
              Review now
            </button>
            <button
              type="button"
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
              style={{
                borderColor: 'var(--card-border)',
                color: 'var(--text-color)',
                backgroundColor: 'var(--bg-subtle)',
                cursor: 'pointer',
              }}
            >
              Schedule 1:1
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5" style={cardStyle}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" style={{ color: 'var(--PRIMAry-color)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              AI insights
            </h2>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Generated from recent activity
          </p>
          <ul className="mt-4 space-y-3">
            {aiInsights.map((ins, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug" style={{ color: 'var(--text-color)' }}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ins.dot }} />
                {ins.text}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Updated just now
          </p>
          <button type="button" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--PRIMAry-color)' }}>
            View detailed insights
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
