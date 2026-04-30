'use client';

import { useState, useEffect } from 'react';
import PageHeader from './_components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import api from '../../lib/axios';
import {
  CheckSquare, Clock, Users, TrendingUp, AlertCircle,
  Calendar, FolderOpen, Target, Activity, UserPlus,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

const cardStyle = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all 0.2s ease'
} as const;

const tooltipStyle = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '8px',
  color: 'var(--text-color)',
  fontSize: 12,
};

const STAT_CARDS = (stats: any, completionRate: number) => [
  { label: 'Total Employees', value: stats.totalEmployees || 0, sub: 'Active team members', icon: Users, accent: '#3b82f6' },
  { label: 'Total Tasks', value: stats.totalTasks || 0, sub: `${stats.completedTasks || 0} completed`, icon: CheckSquare, accent: '#22c55e' },
  { label: 'Completion Rate', value: `${completionRate.toFixed(1)}%`, sub: 'Task completion', icon: TrendingUp, accent: '#a78bfa', progress: completionRate },
  { label: 'Pending Leaves', value: stats.pendingLeaves || 0, sub: 'Require approval', icon: AlertCircle, accent: '#ef4444' },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalEmployees: 0, activeProjects: 0,
    totalTasks: 0, completedTasks: 0,
    overdueTasks: 0, pendingLeaves: 0,
    attendanceTrendData: [],
    departmentPerformanceData: [],
    projectProgressData: [],
    employeeProductivityData: [],
    leaveStatisticsData: [],
    recentActivity: []
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else if (!user && !loading) {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/dashboard/admin-stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  const taskStatusData = [
    { name: 'Completed', value: stats.completedTasks || 0, color: '#22c55e' },
    { name: 'In Progress', value: Math.max(0, (stats.totalTasks || 0) - (stats.completedTasks || 0) - (stats.overdueTasks || 0)), color: '#3b82f6' },
    { name: 'Pending', value: 15, color: '#f59e0b' },
    { name: 'Overdue', value: stats.overdueTasks || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const quickActions = [
    { label: 'Create New User', icon: UserPlus, href: '/admin/createUser', color: '#3b82f6' },
    { label: 'Manage Projects', icon: FolderOpen, href: '/admin/projects', color: '#a78bfa' },
    { label: 'View Attendance', icon: Clock, href: '/admin/attendance', color: '#22c55e' },
    { label: 'Manage Leaves', icon: Calendar, href: '/admin/leave-management', color: '#f59e0b' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Admin dashboard overview" showBackButton={false} />

        <div className="p-5 md:p-6 space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {STAT_CARDS(stats, completionRate).map(({ label, value, sub, icon: Icon, accent, progress }) => (
              <div key={label} className="relative p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default group overflow-hidden"
                style={{ ...cardStyle, borderBottom: `3px solid ${accent}` }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `linear-gradient(145deg, transparent 40%, ${accent} 100%)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${accent}18` }}>
                      <Icon size={15} style={{ color: accent }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-[var(--text-color)] mb-1">{loading ? '...' : value}</p>
                  {progress !== undefined ? (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: accent }} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">Attendance Trends</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Monthly attendance statistics</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.attendanceTrendData || []}>
                  <defs>
                    <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 11 }} />
                  <Area type="monotone" dataKey="present" stackId="1" stroke="#22c55e" strokeWidth={3} fill="url(#presentFill)" dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="late" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">Task Status Distribution</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Current task breakdown</p>
              <div className="relative">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" stroke="none" paddingAngle={2}>
                      {taskStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-4">
                  <span className="text-2xl font-semibold text-[var(--text-color)]">{loading ? '...' : stats.totalTasks}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Tasks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">Department Performance</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Performance metrics by department</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={stats.departmentPerformanceData || []}>
                  <PolarGrid stroke="var(--card-border)" />
                  <PolarAngleAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Radar name="Productivity" dataKey="productivity" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.5} strokeWidth={2} />
                  <Radar name="Quality" dataKey="quality" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} strokeWidth={2} />
                  <Radar name="Efficiency" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">Project Progress</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Active projects completion status</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.projectProgressData || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis dataKey="project" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-subtle)' }} />
                  <Bar dataKey="progress" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">Employee Productivity</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Average hours and tasks per week</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.employeeProductivityData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 11 }} />
                  <Line type="monotone" dataKey="avgHours" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="avgTasks" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">Leave Statistics</p>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Leave types distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.leaveStatisticsData || []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" stroke="none" paddingAngle={2}>
                    {(stats.leaveStatisticsData || []).map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {(stats.leaveStatisticsData || []).map((d: any) => (
                  <div key={d.type} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-color)' }}>
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-[var(--text-color)] flex-1 truncate">{d.type}</span>
                    <span className="text-xs font-semibold" style={{ color: d.color }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Quick Actions */}
            <div className="p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} style={{ color: 'var(--primary-color)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Quick Actions</p>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Common administrative tasks</p>
              <div className="space-y-2">
                {quickActions.map(({ label, icon: Icon, href, color }) => (
                  <a key={label} href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                    style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-color)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}18`)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 p-5 rounded-2xl" style={cardStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <Activity size={16} style={{ color: 'var(--primary-color)' }} />
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>Recent Activity</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>Live</span>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Latest administrative actions</p>
              <div className="space-y-3">
                {(stats.recentActivity || []).map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: `${a.color}18` }}>
                      <Activity size={13} style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-color)] leading-tight">{a.title}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{a.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.timestamp}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
    </>
  );
}
