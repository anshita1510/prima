'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import Sidebar from './_components/Sidebarr';
import Banner from './_components/Banner';
import PlatformPerformanceCard from './_components/PlatformPerformanceCard';
import { useAuth } from '../hooks/useAuth';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Shield, TrendingUp, AlertCircle, Building, User,
  UserPlus, Settings, FolderOpen, Activity, RefreshCw,
  CheckCircle, Lock, FileText, Briefcase, CreditCard, MessageSquare, Layout, Zap, Globe, type LucideIcon,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────
const userGrowthData = [
  { month: 'Jan', users: 4 }, { month: 'Feb', users: 7 }, { month: 'Mar', users: 10 },
  { month: 'Apr', users: 8 }, { month: 'May', users: 14 }, { month: 'Jun', users: 18 },
  { month: 'Jul', users: 22 }, { month: 'Aug', users: 20 },
];
const roleDistData = [
  { name: 'Employees', value: 60, color: '#22c55e' },
  { name: 'Managers', value: 20, color: '#7c3aed' },
  { name: 'HRs', value: 15, color: '#a78bfa' },
  { name: 'Super Admins', value: 5, color: '#f59e0b' },
];

const tooltipStyle = {
  backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
  borderRadius: 8, color: 'var(--text-color)', fontSize: 12,
};

// ── Types ──────────────────────────────────────────────────────────
interface StatCard {
  label: string; value: string | number; sub: string;
  icon: LucideIcon; accent: string; trend: string; trendUp: boolean;
  health?: number;
}

type ActivityType = 'admin_created' | 'user_created' | 'system_update' | 'security_alert' | 'company_created';
interface RecentActivity {
  id: string; type: ActivityType; title: string;
  description: string; timestamp: string; user: string; initials: string;
}

const iconMap: Record<ActivityType, LucideIcon> = {
  admin_created: Shield, user_created: UserPlus, company_created: Building,
  system_update: CheckCircle, security_alert: Lock,
};
const iconBg: Record<ActivityType, string> = {
  admin_created: 'rgba(124,58,237,0.15)', user_created: 'rgba(34,197,94,0.12)',
  company_created: 'rgba(59,130,246,0.12)', system_update: 'rgba(34,197,94,0.12)',
  security_alert: 'rgba(245,158,11,0.12)',
};
const iconColor: Record<ActivityType, string> = {
  admin_created: '#a78bfa', user_created: '#4ade80',
  company_created: '#60a5fa', system_update: '#4ade80', security_alert: '#fbbf24',
};

// ── Static data ────────────────────────────────────────────────────
const defaultActivity: RecentActivity[] = [
  { id: '1', type: 'admin_created', title: 'New Admin Created', description: 'Added admin for engineering team', user: 'Anita B.', initials: 'AB', timestamp: '2h ago' },
  { id: '2', type: 'user_created', title: 'User Registered', description: 'New employee onboarded', user: 'HR Admin', initials: 'HR', timestamp: '5h ago' },
  { id: '3', type: 'system_update', title: 'System Update', description: 'Security patches applied', user: 'System', initials: 'SY', timestamp: '1d ago' },
  { id: '4', type: 'security_alert', title: 'Security Scan Complete', description: 'No vulnerabilities detected', user: 'System', initials: 'SY', timestamp: '2d ago' },
  { id: '5', type: 'company_created', 'title': 'Company Added', description: 'TechCorp onboarded to platform', user: 'Anita B.', initials: 'AB', timestamp: '3d ago' },
];

const recentCompanies = [
  { id: 1, name: 'TechFlow Solutions', plan: 'Enterprise', status: 'Active', mrr: '$1,200', date: 'Oct 24' },
  { id: 2, name: 'Stark Industries', plan: 'Pro', status: 'Pending Approval', mrr: '$400', date: 'Oct 23' },
  { id: 3, name: 'Wayne Enterprises', plan: 'Enterprise', status: 'Suspended', mrr: '$0', date: 'Oct 21' },
  { id: 4, name: 'Acme Corp', plan: 'Trial', status: 'Trial', mrr: '$0', date: 'Oct 20' },
  { id: 5, name: 'Globex Inc', plan: 'Pro', status: 'Active', mrr: '$400', date: 'Oct 19' },
];

// Integration stats moved to Analytics route

// ── Shared styles ──────────────────────────────────────────────────
const card = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease' } as const;

// ── Page ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(defaultActivity);
  const [isSeeding, setIsSeeding] = useState(false);

  const { user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/activity')
      ]);

      const statsData = statsRes.data;
      const activityData = activityRes.data;

      if (statsData.success) {
        setDashboardData(statsData.stats);

        // Auto seed if data is lacking (e.g., less than 5 users total)
        if (statsData.stats.totalUsers <= 5 && !isSeeding) {
          handleSeedData();
        }
      }

      if (activityData.success && activityData.activities.length > 0) {
        setRecentActivities(activityData.activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else if (!user && !loading) {
      setLoading(false);
    }
  }, [user]);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      const res = await api.post('/api/dashboard/seed');
      if (res.status === 200) {
        setTimeout(() => {
          window.location.reload();
        }, 4000); // Give backend time to seed
      }
    } catch (e) {
      console.error('Seed failed:', e);
      setIsSeeding(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const statCards: StatCard[] = dashboardData ? [
    { label: 'Total Users', value: dashboardData.totalUsers, sub: `${dashboardData.activeUsers} active users`, icon: Users, accent: '#7c3aed', trend: '↑ Live', trendUp: true },
    { label: 'Total Admins', value: dashboardData.totalAdmins, sub: 'Administrative roles', icon: Shield, accent: '#3b82f6', trend: '↑ Live', trendUp: true },
    { label: 'System Health', value: `${dashboardData.systemHealth}%`, sub: 'All systems nominal', icon: TrendingUp, accent: '#22c55e', trend: 'Optimal', trendUp: true, health: dashboardData.systemHealth },
    { label: 'Total Companies', value: dashboardData.totalCompanies, sub: 'Active organizations', icon: Building, accent: '#7c3aed', trend: '↑ Live', trendUp: true },
    { label: 'Pending Registrations', value: dashboardData.pendingApprovals, sub: 'Awaiting approval', icon: AlertCircle, accent: '#ef4444', trend: `${dashboardData.pendingApprovals} pending`, trendUp: dashboardData.pendingApprovals === 0 },
    { label: 'Recent Users', value: dashboardData.recentRegistrations, sub: 'Registered in last 7 days', icon: Users, accent: '#22c55e', trend: '↑ Live', trendUp: true },
  ] : [
    { label: 'Total Users', value: '-', sub: 'Loading...', icon: Users, accent: '#7c3aed', trend: '-', trendUp: true },
    { label: 'Total Admins', value: '-', sub: 'Loading...', icon: Shield, accent: '#3b82f6', trend: '-', trendUp: true },
    { label: 'System Health', value: '-', sub: 'Loading...', icon: TrendingUp, accent: '#22c55e', trend: '-', trendUp: true, health: 0 },
    { label: 'Total Companies', value: '-', sub: 'Loading...', icon: Building, accent: '#7c3aed', trend: '-', trendUp: true },
    { label: 'Pending Registrations', value: '-', sub: 'Loading...', icon: AlertCircle, accent: '#ef4444', trend: '-', trendUp: false },
    { label: 'Recent Users', value: '-', sub: 'Loading...', icon: Users, accent: '#22c55e', trend: '-', trendUp: true },
  ];

  const dynamicRoleDistData = dashboardData ? [
    { name: 'Employees', value: dashboardData.totalEmployees > 0 ? dashboardData.totalEmployees : 60, color: '#22c55e' },
    { name: 'Managers', value: dashboardData.totalManagers > 0 ? dashboardData.totalManagers : 20, color: '#7c3aed' },
    { name: 'Admins', value: dashboardData.totalAdmins > 0 ? dashboardData.totalAdmins : 5, color: '#a78bfa' },
  ] : roleDistData;

  const totalRoles = dashboardData ? dashboardData.totalUsers : 48;
  const growthData = dashboardData?.userGrowthData || userGrowthData;
  const companiesList = dashboardData?.recentCompanies || recentCompanies;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Banner onRefresh={handleRefresh} isRefreshing={loading || isSeeding} user={user} />
        <div className="p-5 md:p-6 space-y-6">

          {/* Business Growth */}
          <PlatformPerformanceCard performanceData={dashboardData?.performanceData} />

          {/* Seeding Notification */}
          {isSeeding && (
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'rgba(124,58,237,0.1)', border: '1px solid #a78bfa' }}>
              <div className="flex items-center gap-3">
                <RefreshCw className="animate-spin" size={20} color="#7c3aed" />
                <div>
                  <p className="font-semibold text-[color:var(--text-color)] text-sm">Generating Analytics Data...</p>
                  <p className="text-xs text-[color:var(--text-muted)] mt-0.5">Please wait while the platform populates historical data patterns.</p>
                </div>
              </div>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {statCards.map(c => (
              <div key={c.label}
                className="relative p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default group overflow-hidden"
                style={{ ...card, borderBottom: `3px solid ${c.accent}`, boxShadow: 'var(--shadow-sm)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
              >
                {/* Subtle hover gradient backdrop */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `linear-gradient(145deg, transparent 40%, ${c.accent} 100%)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${c.accent}18` }}>
                      <c.icon size={15} style={{ color: c.accent }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-[var(--text-color)] mb-1">{loading ? '...' : c.value}</p>
                  {c.health !== undefined ? (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${c.health}%`, backgroundColor: c.accent }} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.sub}</p>
                  )}
                  <div className="mt-2">
                    <span className="text-xs font-semibold" style={{ color: c.trendUp ? '#22c55e' : '#ef4444' }}>
                      {c.trend}
                    </span>
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>vs last month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth */}
            <div className="p-5 rounded-2xl" style={card}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">User Growth</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Monthly registrations — Jan to Aug</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ugFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3}
                    fill="url(#ugFill)" dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#a855f7', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Role Distribution */}
            <div className="p-5 rounded-2xl" style={card}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <p className="text-[var(--text-color)] font-medium mb-0.5">Role Distribution</p>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Users by role</p>
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={dynamicRoleDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      dataKey="value" stroke="none" paddingAngle={2}>
                      {dynamicRoleDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number | string | undefined) => { const num = Number(v) || 0; return [`${totalRoles > 0 ? Math.round((num / totalRoles) * 100) : 0}%`]; }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-semibold text-[var(--text-color)]">{loading ? '...' : totalRoles}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Users</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {dynamicRoleDistData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-color)' }}>
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-[var(--text-color)] flex-1 truncate">{d.name}</span>
                    <span className="text-xs font-semibold" style={{ color: d.color }}>{totalRoles > 0 ? Math.round((d.value as number / totalRoles) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity (Full Width) */}
          <div className="grid grid-cols-1 gap-4">

            {/* Recent Activity */}
            <div className="p-5 rounded-2xl" style={card}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[var(--text-color)] font-medium">Recent Activity</p>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>Live</span>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Last system events</p>
              <div className="space-y-2">
                {recentActivities.map(a => {
                  const Icon = iconMap[a.type as ActivityType] || Activity;
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-color)' }}>
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: iconBg[a.type as ActivityType] || 'rgba(124,58,237,0.15)' }}>
                        <Icon size={13} style={{ color: iconColor[a.type as ActivityType] || '#a78bfa' }} />
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
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="p-5 rounded-2xl" style={card}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[var(--text-color)] font-medium">Company Registrations</p>
              <Link href="/superAdmin/analytics" className="text-xs transition-colors"
                style={{ color: '#7c3aed' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7c3aed')}>
                View all →
              </Link>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Manage and track tenant onboarding.</p>
            <div className="overflow-x-auto">
              {companiesList.length === 0 ? (
                <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  <p className="text-sm">No companies registered yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                      {['Company Name', 'Plan', 'Status', 'Registered', 'Action'].map(h => (
                        <th key={h} className="pb-3 text-left font-medium text-xs uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {companiesList.map((row: any, i: number) => (
                      <tr key={row.id} style={{ borderBottom: i < companiesList.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                        <td className="py-3 font-medium text-[var(--text-color)]">{row.name}</td>
                        <td className="py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{row.plan}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold"
                            style={{
                              backgroundColor:
                                row.status === 'Active' ? 'rgba(34,197,94,0.1)' :
                                  row.status === 'Pending Approval' ? 'rgba(245,158,11,0.1)' :
                                    row.status === 'Trial' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                              color:
                                row.status === 'Active' ? '#22c55e' :
                                  row.status === 'Pending Approval' ? '#f59e0b' :
                                    row.status === 'Trial' ? '#3b82f6' : '#ef4444'
                            }}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 text-[var(--text-muted)] text-xs">{row.date}</td>
                        <td className="py-3">
                          {row.status === 'Pending Approval' ? (
                            <div className="flex items-center gap-2">
                              <button className="text-xs font-medium px-3 py-1 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">Approve</button>
                              <button className="text-xs font-medium px-3 py-1 rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-white transition-colors">Reject</button>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No action required</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
