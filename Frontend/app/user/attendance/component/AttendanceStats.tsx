"use client";

import { Info, ChevronDown, User, Users } from 'lucide-react';
import { AttendanceStats as AttendanceStatsType } from '../types/attendanceTypes';

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  avgHours: string;
  onTimePercent: number;
  accent: string;
  accentBg: string;
}

const StatRow = ({ icon, label, avgHours, onTimePercent, accent, accentBg }: StatRowProps) => (
  <div className="flex items-center justify-between py-3 px-4 rounded-xl"
    style={{ backgroundColor: accentBg }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: accent }}>
        {icon}
      </div>
      <span className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>{label}</span>
    </div>
    <div className="flex items-center gap-8 text-sm">
      <div className="text-right">
        <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Avg Hrs / Day</div>
        <div className="font-semibold" style={{ color: 'var(--text-color)' }}>{avgHours}</div>
      </div>
      <div className="text-right">
        <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>On Time Arrival</div>
        <div className="font-semibold" style={{ color: 'var(--text-color)' }}>{onTimePercent}%</div>
      </div>
    </div>
  </div>
);

interface AttendanceStatsProps {
  myStats: AttendanceStatsType;
  teamStats: AttendanceStatsType;
}

export const AttendanceStats = ({ myStats, teamStats }: AttendanceStatsProps) => {
  return (
    <div className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>Attendance Stats</h2>
        <Info className="w-4 h-4 cursor-help" style={{ color: 'var(--text-muted)' }} />
      </div>

      <button className="flex items-center gap-2 text-sm mb-4 transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
        <span>Last Week</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      <div className="space-y-3">
        <StatRow
          icon={<User className="w-4 h-4" />}
          label="Me"
          avgHours={myStats.avgHoursPerDay}
          onTimePercent={myStats.onTimeArrivalPercent}
          accent="#f59e0b"
          accentBg="rgba(245,158,11,0.1)"
        />
        <StatRow
          icon={<Users className="w-4 h-4" />}
          label="My Team"
          avgHours={teamStats.avgHoursPerDay}
          onTimePercent={teamStats.onTimeArrivalPercent}
          accent="#3b82f6"
          accentBg="rgba(59,130,246,0.1)"
        />
      </div>
    </div>
  );
};
