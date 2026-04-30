"use client";

import { LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { useToast } from '../../../hooks/useToast';
import { attendanceService, TimeSlot } from '../../../services/attendanceService';
import api from '../../../../lib/axios';
import { SessionLogsCard } from './SessionLogsCard';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success';
  disabled?: boolean;
}

const ActionButton = ({ icon, label, onClick, variant = 'default', disabled = false }: ActionButtonProps) => {
  const style =
    disabled ? { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', cursor: 'not-allowed' }
      : variant === 'primary' ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', cursor: 'pointer' }
        : variant === 'success' ? { background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', cursor: 'pointer' }
          : { backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)', cursor: 'pointer' };

  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 text-sm py-2.5 px-4 rounded-xl w-full font-medium transition-all"
      style={{ border: 'none', ...style }}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

interface ActionsCardProps {
  currentTime: string;
  currentDate: string;
  onRefresh?: () => void;
}

export const ActionsCard = ({ currentTime, currentDate, onRefresh }: ActionsCardProps) => {
  const { currentUser, refreshData, todayAttendance } = useAttendance();
  const { success, error } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);

  useEffect(() => {
    if (todayAttendance) {
      const hasOpenSlot = (todayAttendance.timeSlots || []).some((s: any) => s.checkIn && !s.checkOut);
      setIsCheckedIn(hasOpenSlot);
      updateTimeCalculations(todayAttendance.timeSlots || []);
    } else {
      setIsCheckedIn(false);
      setTotalWorkTime(0);
      setCurrentSessionTime(0);
    }
  }, [todayAttendance]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (todayAttendance?.timeSlots) updateTimeCalculations(todayAttendance.timeSlots);
    }, 60000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  const updateTimeCalculations = (timeSlots: TimeSlot[]) => {
    setTotalWorkTime(attendanceService.calculateTotalWorkingHours(timeSlots));
    setCurrentSessionTime(attendanceService.calculateCurrentSessionTime(timeSlots));
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const res = await api.post('/api/attendance/my-check-in', { location: 'Office', deviceType: 'web' });
      if (res.data.success) {
        success(res.data.message || 'Checked in!');
        await refreshData();
        onRefresh?.();
      } else error(res.data.message || 'Check-in failed');
    } catch (err: any) { error(err.response?.data?.message || 'Check-in failed'); }
    finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const res = await api.post('/api/attendance/my-check-out', { location: 'Office', deviceType: 'web' });
      if (res.data.success) {
        success(res.data.message || 'Checked out!');
        await refreshData();
        onRefresh?.();
      } else error(res.data.message || 'Check-out failed');
    } catch (err: any) { error(err.response?.data?.message || 'Check-out failed'); }
    finally { setLoading(false); }
  };

  const getTotalDisplayTime = () =>
    isCheckedIn ? totalWorkTime + currentSessionTime / 60 : totalWorkTime;

  return (
    <div className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Actions</h2>

      {/* Clock */}
      <div className="mb-6 text-center p-4 rounded-xl"
        style={{ backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--card-border)' }}>
        <div className="text-3xl font-mono font-bold tracking-wider" style={{ color: 'var(--text-color)' }}>{currentTime}</div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{currentDate}</div>
      </div>

      {/* Status */}
      {todayAttendance && (
        <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="font-medium" style={{ color: 'var(--text-color)' }}>Today's Status:</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: isCheckedIn ? 'rgba(34,197,94,0.12)' : 'var(--bg-subtle)',
                color: isCheckedIn ? '#22c55e' : 'var(--text-muted)',
              }}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>

          <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium" style={{ color: 'var(--primary-color)' }}>Total Work Time</div>
              {isCheckedIn && <div className="text-xs font-medium animate-pulse" style={{ color: '#22c55e' }}>● Live</div>}
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
              {attendanceService.formatWorkingHours(getTotalDisplayTime())}
            </div>
            <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
              {totalWorkTime > 0 && <div>Completed: {attendanceService.formatWorkingHours(totalWorkTime)}</div>}
              {isCheckedIn && currentSessionTime > 0 && (
                <div style={{ color: '#22c55e' }}>Current session: {attendanceService.formatDuration(currentSessionTime)}</div>
              )}
              {todayAttendance.overtime > 0 && (
                <div className="font-medium" style={{ color: '#f59e0b' }}>Overtime: {attendanceService.formatWorkingHours(todayAttendance.overtime)}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-2 mt-4">
        {!isCheckedIn ? (
          <ActionButton icon={<LogIn className="w-4 h-4" />} label={loading ? 'Checking in...' : 'Check In'} onClick={handleCheckIn} variant="primary" disabled={loading} />
        ) : (
          <ActionButton icon={<LogOut className="w-4 h-4" />} label={loading ? 'Checking out...' : 'Check Out'} onClick={handleCheckOut} variant="success" disabled={loading} />
        )}
      </div>
    </div>
  );
};
