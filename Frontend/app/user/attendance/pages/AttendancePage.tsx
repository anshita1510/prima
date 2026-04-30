"use client";

import { useState, useEffect } from 'react';
import { AttendanceStats } from '../component/AttendanceStats';
import { TimingsCard } from '../component/Timingscard';
import { ActionsCard } from '../component/ActionsCard';
import { LogsTabs } from '../component/Logstab';
import { AttendanceLog } from '../component/AttendanceLog';
import { AttendanceCalendar } from '../component/AttendanceCalendar';
import { AttendanceRequests } from '../component/AttendanceRequests';
import { SessionLogsCard } from '../component/SessionLogsCard';
import { useAttendance } from '../hooks/useAttendance';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../../components/ui/toast';

export const AttendancePage = () => {
  const {
    records,
    requests,
    myStats,
    teamStats,
    viewMode,
    setViewMode,
    timeFormat,
    setTimeFormat,
    selectedMonth,
    setSelectedMonth,
    activeTab,
    setActiveTab,
    currentDate,
    loading,
    error,
    todayAttendance,
    refreshData,
  } = useAttendance();

  const { toasts, removeToast } = useToast();

  // Live clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: timeFormat === '12h'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeFormat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary-color)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#f87171' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Error loading attendance data: {error}</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)' }}>
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AttendanceStats myStats={myStats} teamStats={teamStats} />
              <TimingsCard currentTime={currentTime} currentDate={currentDate} />
            </div>
            {todayAttendance?.timeSlots && todayAttendance.timeSlots.length > 0 && (
              <SessionLogsCard timeSlots={todayAttendance.timeSlots} />
            )}
          </div>
          <ActionsCard currentTime={currentTime} currentDate={currentDate} onRefresh={refreshData} />
        </div>

        <div className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
          <LogsTabs activeTab={activeTab} onTabChange={setActiveTab} timeFormat={timeFormat}
            onTimeFormatChange={setTimeFormat} viewMode={viewMode} onViewModeChange={setViewMode} />

          {activeTab === 'log' && (
            <AttendanceLog
              records={records.map(record => ({
                ...record,
                id: typeof record.id === 'string' ? parseInt(record.id, 10) : record.id,
                date: record.date instanceof Date ? record.date.toISOString().split('T')[0] : record.date,
                timeSlots: (record.timeSlots || []).map(slot => ({
                  ...slot,
                  checkIn: (slot as any).checkIn ?? (slot as any).start ?? null,
                  checkOut: (slot as any).checkOut ?? (slot as any).end ?? null,
                })),
                isManuallyEdited: false,
              }))}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          )}

          {activeTab === 'calendar' && (
            <AttendanceCalendar records={records} />
          )}

          {activeTab === 'requests' && (
            <AttendanceRequests requests={requests} />
          )}
        </div>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
