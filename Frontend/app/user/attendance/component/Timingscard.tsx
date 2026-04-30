"use client";

import { Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { attendanceService } from '../../../services/attendanceService';
import api from '../../../../lib/axios';

interface TimingsCardProps {
  currentTime: string;
  currentDate: string;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STANDARD_WORK_HOURS = 9;
const WORK_START_HOUR = 9.5;
const WORK_END_HOUR = 18.5;

export const TimingsCard = ({ currentTime, currentDate }: TimingsCardProps) => {
  const { currentUser } = useAttendance();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [workProgress, setWorkProgress] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  useEffect(() => { fetchTodayAttendance(); }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => { if (todayAttendance?.timeSlots) updateProgress(); }, 60000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  useEffect(() => { if (todayAttendance?.timeSlots) updateProgress(); }, [todayAttendance]);

  const fetchTodayAttendance = async () => {
    if (!currentUser?.employeeId) return;
    try {
      const res = await api.get('/api/attendance/my-today');
      if (res.data.success && res.data.data) setTodayAttendance(res.data.data);
    } catch { }
  };

  const updateProgress = () => {
    if (!todayAttendance?.timeSlots) return;
    const completed = attendanceService.calculateTotalWorkingHours(todayAttendance.timeSlots);
    const current = attendanceService.calculateCurrentSessionTime(todayAttendance.timeSlots);
    const total = completed + current / 60;
    setTotalWorkTime(completed);
    setCurrentSessionTime(current);
    setWorkProgress(Math.min((total / STANDARD_WORK_HOURS) * 100, 100));
  };

  const getCurrentTimeProgress = () => {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (h < WORK_START_HOUR) return 0;
    if (h > WORK_END_HOUR) return 100;
    return ((h - WORK_START_HOUR) / (WORK_END_HOUR - WORK_START_HOUR)) * 100;
  };

  const isCheckedIn = todayAttendance?.timeSlots?.some((s: any) => s.checkIn && !s.checkOut);
  const timeProgressPercent = getCurrentTimeProgress();

  return (
    <div className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Timings</h2>

      {/* Day selector */}
      <div className="flex gap-2 mb-6">
        {DAYS.map((day, i) => (
          <button key={i}
            className="w-8 h-8 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: i === todayIndex ? '#14b8a6' : 'var(--bg-subtle)',
              color: i === todayIndex ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
            }}>
            {day}
          </button>
        ))}
      </div>

      {/* Time display */}
      <div className="mb-4">
        <div className="text-sm mb-3 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
          <span>Today (9:30 AM - 6:30 PM)</span>
          {isCheckedIn && <span className="text-xs font-medium animate-pulse" style={{ color: '#22c55e' }}>● Active</span>}
        </div>

        {/* Progress bar */}
        <div className="relative h-6 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
          {workProgress > 0 && (
            <div className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${Math.min(workProgress, 100)}%`, backgroundColor: isCheckedIn ? '#22c55e' : '#14b8a6' }} />
          )}
          <div className="absolute top-0 w-0.5 h-full z-10" style={{ left: `${timeProgressPercent}%`, backgroundColor: 'var(--text-color)' }} />
        </div>

        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          <span>Progress: {attendanceService.formatWorkingHours(totalWorkTime + currentSessionTime / 60)} / {STANDARD_WORK_HOURS}h</span>
          <span>{Math.round(workProgress)}%</span>
        </div>

        {todayAttendance?.timeSlots?.length > 0 && (
          <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center justify-between">
              <span>Sessions: {todayAttendance.timeSlots.length}</span>
              {currentSessionTime > 0 && <span style={{ color: '#22c55e' }}>Current: {attendanceService.formatDuration(currentSessionTime)}</span>}
            </div>
            {todayAttendance.overtime > 0 && (
              <div className="font-medium" style={{ color: '#f59e0b' }}>Overtime: {attendanceService.formatWorkingHours(todayAttendance.overtime)}</div>
            )}
          </div>
        )}
      </div>

      {/* Current time */}
      <div className="text-center">
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>{currentTime}</div>
        <div className="text-sm flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Calendar className="w-3 h-3" /> {currentDate}
        </div>
      </div>
    </div>
  );
};
