'use client';

import React, { useState, useEffect } from 'react';

import Sidebar from '../_components/Sidebarr';
import PlatformPerformanceCard from '../_components/PlatformPerformanceCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Users, Building, Activity, RefreshCw, Shield, Link2, ServerCrash
} from 'lucide-react';
import { analyticsService, AnalyticsData, TimePeriod } from '@/app/services/analytics.service';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];



export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, offset]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshKey(prev => prev + 1);
      const response = await analyticsService.getAnalyticsData(selectedPeriod, offset);
      if (response.success) {
        setAnalyticsData(response.analytics);
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatPeriodLabel = (period: string) => {
    return period; // Backend handles all formatting now (e.g. 'Monday', 'W1', 'Jan')
  };

  const getPeriodDisplayName = () => {
    switch (selectedPeriod) {
      case 'weekly': return 'Week';
      case 'monthly': return 'Month';
      case 'yearly': return 'Year';
      default: return 'Month';
    }
  };

  const getOffsetLabel = () => {
    if (offset === 0) return 'Current';
    const now = new Date();

    if (selectedPeriod === 'weekly') {
      const day = now.getDay();
      const diffStart = now.getDate() - day + (day === 0 ? -6 : 1) - (offset * 7);
      const startDate = new Date(new Date().setDate(diffStart));
      const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return `${startDate.toLocaleDateString('en-US', formatOpts)} - ${endDate.toLocaleDateString('en-US', formatOpts)}`;
    } else if (selectedPeriod === 'monthly') {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (selectedPeriod === 'yearly') {
      return (now.getFullYear() - offset).toString();
    }
    return `-${offset}`;
  };

  // Theming & Styles Custom CSS Variables mapped per Antygravity layout
  const cardStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    boxShadow: 'var(--shadow-sm)'
  };

  const tooltipStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '8px',
    color: 'var(--text-color)',
    boxShadow: 'var(--shadow-sm)'
  };

  if (loading && !analyticsData) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="p-5 md:p-6 flex items-center justify-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-color)' }}></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="p-5 md:p-6 pr-16 space-y-6">

          {/* Header: Title row */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-color)]">Platform Security &amp; Analytics</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Zero-trust aggregated metrics. No PII or raw payloads are exposed.
            </p>
          </div>

          {/* Controls bar: Period | Pagination | Refresh — always ends before the floating theme toggle */}
          <div
            className="flex flex-wrap items-center gap-3"
            style={{ maxWidth: 'calc(100% - 60px)' }}
          >
            {/* Left: Period Toggle */}
            <div
              className="flex items-center gap-1 rounded-xl p-1"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <button onClick={() => { setSelectedPeriod('weekly'); setOffset(0); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedPeriod === 'weekly' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}>Week</button>
              <button onClick={() => { setSelectedPeriod('monthly'); setOffset(0); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedPeriod === 'monthly' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}>Month</button>
              <button onClick={() => { setSelectedPeriod('yearly'); setOffset(0); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedPeriod === 'yearly' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}>Year</button>
            </div>

            {/* Center: Pagination */}
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
              <button
                onClick={() => setOffset(Math.max(0, offset + 1))}
                className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[#3b82f6] hover:text-white transition-all"
                title={`Previous ${getPeriodDisplayName()}`}
              >
                &larr; Prev
              </button>
              <div className="px-3 py-1.5 text-xs font-medium text-[var(--text-color)] min-w-[80px] text-center border-x border-[var(--card-border)] whitespace-nowrap">
                {getOffsetLabel()}
              </div>
              <button
                onClick={() => setOffset(Math.max(0, offset - 1))}
                disabled={offset === 0}
                className="px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[#3b82f6] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title={`Next ${getPeriodDisplayName()}`}
              >
                Next &rarr;
              </button>
            </div>

            {/* Right: Refresh */}
            <button
              onClick={() => { setLoading(true); window.location.reload(); }}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
              title="Refresh data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 flex justify-between items-center">
              <p className="text-sm font-medium">❌ {error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  window.location.reload();
                }}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* KPI Cards Row */}
          {analyticsData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: `Total Companies (${getPeriodDisplayName()})`, value: analyticsData.currentTotals.totalCompanies.toLocaleString(), sub: 'Isolated tenants', icon: Building, color: '#10b981', trendData: analyticsData.companyRegistrations.map(r => ({ period: formatPeriodLabel(r.period), val: r.total })) },
                { label: `Platform Users (${getPeriodDisplayName()})`, value: analyticsData.currentTotals.totalUsers.toLocaleString(), sub: `Active global users`, icon: Users, color: '#3b82f6', trendData: analyticsData.userRegistrations.map(r => ({ period: formatPeriodLabel(r.period), val: r.total })) },
                { label: `Admin Workforce (${getPeriodDisplayName()})`, value: analyticsData.currentTotals.totalAdmins.toLocaleString(), sub: 'Managing ecosystem', icon: Shield, color: '#8b5cf6', trendData: analyticsData.userRegistrations.map(r => ({ period: formatPeriodLabel(r.period), val: r.admins })) },
                { label: `System Activity (${getPeriodDisplayName()})`, value: analyticsData.activityTrends.reduce((sum, item) => sum + item.activity, 0).toLocaleString(), sub: 'Recorded updates', icon: Link2, color: '#f59e0b', trendData: analyticsData.activityTrends.map(r => ({ period: formatPeriodLabel(r.period), val: r.activity })) }
              ].map((kpi, i) => (
                <div key={i} className="rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative"
                  style={{ ...cardStyle, borderBottom: `3px solid ${kpi.color}` }}>

                  {/* Top Text Content */}
                  <div className="p-5 pb-0 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{kpi.label}</span>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                        <kpi.icon size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black tracking-tight text-[var(--text-color)] leading-none">{kpi.value}</h4>
                      <p className="text-[11px] font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</p>
                    </div>
                  </div>

                  {/* Full-Width Bottom Graph */}
                  <div className="w-full h-24 mt-4 relative z-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpi.trendData} margin={{ top: 5, right: 15, left: 15, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={kpi.color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Tooltip
                          contentStyle={tooltipStyle}
                          cursor={{ stroke: kpi.color, strokeDasharray: '4 4' }}
                          formatter={(val: any) => [Number(val || 0).toFixed(0), kpi.label.split(' ')[0]]}
                          labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
                        />
                        <XAxis
                          dataKey="period"
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dy={5}
                          interval="preserveStartEnd"
                          minTickGap={10}
                        />
                        <Area
                          type="monotone"
                          dataKey="val"
                          stroke={kpi.color}
                          fill={`url(#grad-${i})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: kpi.color, stroke: 'var(--bg-color)', strokeWidth: 2 }}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Core Growth Charts & Activity */}
          {analyticsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* User Registrations Bar Chart */}
              <div className="p-5 rounded-2xl" style={cardStyle}>
                <div className="mb-4">
                  <h3 className="text-[var(--text-color)] font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" style={{ color: '#3b82f6' }} /> User Expansion Trends ({getPeriodDisplayName()})
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Historical backend registrations over time</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.userRegistrations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                    <XAxis dataKey="period" tickFormatter={formatPeriodLabel} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={10} />
                    <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--text-muted)', opacity: 0.1 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                    <Bar dataKey="admins" fill="#3B82F6" name="Admins" maxBarSize={40} radius={[4, 4, 0, 0]} animationDuration={1500} />
                    <Bar dataKey="managers" fill="#10B981" name="Managers" maxBarSize={40} radius={[4, 4, 0, 0]} animationDuration={1500} />
                    <Bar dataKey="employees" fill="#F59E0B" name="Employees" maxBarSize={40} radius={[4, 4, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* System Activity Area Chart */}
              <div className="p-5 rounded-2xl" style={cardStyle}>
                <div className="mb-4">
                  <h3 className="text-[var(--text-color)] font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4" style={{ color: '#8b5cf6' }} /> Platform Activity Logs ({getPeriodDisplayName()})
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Aggregated database operation spikes</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.activityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                    <XAxis dataKey="period" tickFormatter={formatPeriodLabel} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={10} />
                    <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--text-muted)', strokeDasharray: '4 4' }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="activity" stroke="#8b5cf6" strokeWidth={3} fill="url(#activityGradient)" name="Global Actions" dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8b5cf6' }} animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}