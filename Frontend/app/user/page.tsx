'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  CheckSquare,
  Clock,
  TrendingUp,
  Calendar,
  FolderOpen,
  Target,
  Activity,
  PlayCircle,
  MessageSquare,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react';
import { authService } from '@/app/services/authService';
import {
  userDashboardService,
  type EmployeeDashboardPayload,
} from '@/app/services/userDashboard.service';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from 'recharts';

const CHART_TOOLTIP = {
  contentStyle: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 10,
    color: 'var(--text-color)',
  },
};

const BAR_BLUE = '#3b82f6';
const GREEN = '#10b981';
const RED = '#ef4444';
const SLATE = '#94a3b8';

function getActivityIcon(type: EmployeeDashboardPayload['recentActivity'][0]['type']) {
  switch (type) {
    case 'task_completed':
      return <CheckSquare className="h-4 w-4 text-emerald-500" />;
    case 'task_started':
      return <PlayCircle className="h-4 w-4 text-blue-500" />;
    case 'time_logged':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'comment_added':
      return <MessageSquare className="h-4 w-4 text-violet-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

const emptyPayload: EmployeeDashboardPayload = {
  summary: {
    myTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    hoursThisWeek: 0,
    completionRate: 0,
  },
  weeklyAttendance: [
    { day: 'Mon', hours: 0, status: '—' },
    { day: 'Tue', hours: 0, status: '—' },
    { day: 'Wed', hours: 0, status: '—' },
    { day: 'Thu', hours: 0, status: '—' },
    { day: 'Fri', hours: 0, status: '—' },
    { day: 'Sat', hours: 0, status: 'Weekend' },
    { day: 'Sun', hours: 0, status: 'Weekend' },
  ],
  taskDistribution: [
    { name: 'Completed', value: 0, color: GREEN },
    { name: 'In Progress', value: 0, color: BAR_BLUE },
    { name: 'Overdue', value: 0, color: RED },
  ],
  monthlyProgress: [],
  productivityTrend: [],
  recentActivity: [],
};

export default function UserDashboard() {
  const [data, setData] = useState<EmployeeDashboardPayload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; firstName?: string; lastName?: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await authService.getCurrentUser();
      if (me.success && me.user) setUser(me.user);
      else setUser(authService.getStoredUser());
    } catch {
      setUser(authService.getStoredUser());
    }
    const res = await userDashboardService.fetchEmployeeDashboard();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setData(emptyPayload);
      setError(res.message || 'Could not load live metrics');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    'Employee';

  const { summary, weeklyAttendance, taskDistribution, monthlyProgress, productivityTrend, recentActivity } = data;
  const completionRate = summary.completionRate;

  return (
    <>
      <header
        className="mb-6 border-b pb-4"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Welcome back, {displayName}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      {error ? (
        <div
          className="mb-6 rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(239,68,68,0.35)',
            backgroundColor: 'rgba(239,68,68,0.08)',
            color: '#b91c1c',
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 opacity-70" style={{ color: 'var(--text-muted)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: BAR_BLUE }}>
                {loading ? '—' : summary.myTasks}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {summary.inProgressTasks} in progress
              </p>
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 opacity-70" style={{ color: 'var(--text-muted)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{loading ? '—' : summary.completedTasks}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Tasks finished
              </p>
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-70" style={{ color: 'var(--text-muted)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--PRIMAry-color)' }}>
                {loading ? '—' : `${completionRate.toFixed(1)}%`}
              </div>
              <Progress value={Math.min(100, completionRate)} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
              <Clock className="h-4 w-4 opacity-70" style={{ color: 'var(--text-muted)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{loading ? '—' : summary.hoursThisWeek}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Time logged
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />
                Weekly Attendance
              </CardTitle>
              <CardDescription>Your work hours this week</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendance} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barFillEmp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BAR_BLUE} stopOpacity={1} />
                      <stop offset="100%" stopColor={BAR_BLUE} stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 12]} />
                  <Tooltip
                    {...CHART_TOOLTIP}
                    formatter={(v: number | undefined) => [`${v ?? 0} h`, 'Hours']}
                  />
                  <Bar dataKey="hours" fill="url(#barFillEmp)" radius={[10, 10, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />
                Task Distribution
              </CardTitle>
              <CardDescription>Current task status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      taskDistribution.some((d) => d.value > 0)
                        ? taskDistribution.filter((d) => d.value > 0)
                        : [{ name: 'No tasks', value: 1, color: '#e2e8f0' }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={96}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      taskDistribution.some((d) => d.value > 0)
                        ? `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        : 'No data'
                    }
                  >
                    {(taskDistribution.some((d) => d.value > 0) ? taskDistribution : [{ name: 'No tasks', value: 1, color: '#e2e8f0' }]).map(
                      (entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card-bg)" strokeWidth={1} />
                      )
                    )}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />
                Monthly Progress
              </CardTitle>
              <CardDescription>Tasks completed vs assigned (rolling weeks)</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProgress.length ? monthlyProgress : [{ week: '—', completed: 0, assigned: 0 }]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Legend />
                  <Bar dataKey="assigned" name="Assigned" fill={SLATE} radius={[8, 8, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="completed" name="Completed" fill={GREEN} radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />
                Productivity Trend
              </CardTitle>
              <CardDescription>Tasks completed vs hours logged by month</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={productivityTrend.length ? productivityTrend : [{ month: '—', tasks: 0, hours: 0 }]}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="tasks"
                    name="Tasks"
                    stroke={BAR_BLUE}
                    fill={BAR_BLUE}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Line yAxisId="right" type="monotone" dataKey="hours" name="Hours" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />
                Quick Actions
              </CardTitle>
              <CardDescription>Shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/user/tasks">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  View My Tasks
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/user/projects">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  My Projects
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/user/attendance">
                  <Clock className="mr-2 h-4 w-4" />
                  Attendance
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/user/leave-management">
                  <Calendar className="mr-2 h-4 w-4" />
                  Leave
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" style={{ color: 'var(--PRIMAry-color)' }} />
                Recent activity
              </CardTitle>
              <CardDescription>From your completed work</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No recent completions yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((a) => (
                    <li
                      key={a.id}
                      className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-[var(--bg-subtle)]"
                      style={{ borderColor: 'var(--card-border)' }}
                    >
                      <div className="mt-0.5">{getActivityIcon(a.type)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                          {a.title}
                        </p>
                        <p className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>
                          {a.description}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {a.user} · {a.timestamp}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
