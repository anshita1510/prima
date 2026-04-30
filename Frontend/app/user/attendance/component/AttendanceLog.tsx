"use client";

import { Check, AlertCircle, MoreHorizontal, CheckCircle } from 'lucide-react';
import { TimelineBar } from './TimelineBar';
import { attendanceService } from '../../../services/attendanceService';

type BackendTimeSlot = { checkIn: string; checkOut?: string };

interface BackendAttendanceRecord {
  id: number;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  overtime?: number;
  timeSlots?: BackendTimeSlot[];
  isManuallyEdited: boolean;
  editReason?: string;
}

interface AttendanceLogProps {
  records: BackendAttendanceRecord[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MONTHS = ['30 DAYS', 'DEC', 'NOV', 'OCT', 'SEP', 'AUG', 'JUL'];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PRESENT: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: 'PRESENT' },
  LATE: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'LATE' },
  ABSENT: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'ABSENT' },
  HALF_DAY: { bg: 'rgba(234,179,8,0.12)', color: '#eab308', label: 'HALF DAY' },
  EARLY_DEPARTURE: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', label: 'EARLY OUT' },
  PARTIAL: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', label: 'PARTIAL' },
};

const getStatusBadge = (status: string) => {
  const s = STATUS_STYLES[status.toUpperCase()] || { bg: 'var(--bg-subtle)', color: 'var(--text-muted)', label: status };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
  );
};

const getArrivalStatus = (record: BackendAttendanceRecord) => {
  if (!record.checkIn) return null;
  const t = new Date(record.checkIn);
  const isLate = t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 30);
  if (isLate) {
    const late = (t.getHours() - 9) * 60 + (t.getMinutes() - 30);
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: '#f59e0b' }}>
        <AlertCircle className="w-4 h-4" />
        <span>{Math.floor(late / 60)}:{(late % 60).toString().padStart(2, '0')} late</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: '#22c55e' }}>
      <Check className="w-4 h-4" /><span>On Time</span>
    </div>
  );
};

const getLogIcon = (status: string) => {
  if (status === 'PRESENT') return <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />;
  if (status === 'LATE') return <AlertCircle className="w-5 h-5" style={{ color: '#f59e0b' }} />;
  if (status === 'ABSENT') return <AlertCircle className="w-5 h-5" style={{ color: '#f87171' }} />;
  return <MoreHorizontal className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />;
};

export const AttendanceLog = ({ records, selectedMonth, onMonthChange }: AttendanceLogProps) => {
  return (
    <div className="overflow-hidden">
      {/* Month filter */}
      <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>Last 30 Days</h3>
        <div className="flex items-center gap-2">
          {MONTHS.map(m => (
            <button key={m} onClick={() => onMonthChange(m)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: selectedMonth === m ? 'var(--primary-color)' : 'var(--bg-subtle)',
                color: selectedMonth === m ? '#fff' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
              }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[140px_1fr_150px_120px_140px_60px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
        style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
        <div>Date</div><div>Attendance Visual</div><div>Work Hours</div>
        <div>Sessions</div><div>Arrival</div><div>Log</div>
      </div>

      {/* Records */}
      <div style={{ borderTop: '1px solid var(--card-border)' }}>
        {records.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No attendance records found</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Records will appear here once you start checking in</div>
          </div>
        ) : (
          records.map((record, idx) => (
            <div key={`${record.id || 'no-id'}-${record.date}-${idx}`}
              className="grid grid-cols-[140px_1fr_150px_120px_140px_60px] gap-4 px-6 py-4 items-center transition-colors"
              style={{ borderBottom: '1px solid var(--card-border)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{formatDate(record.date)}</span>
                {getStatusBadge(record.status)}
              </div>
              <div className="py-2">
                {record.timeSlots?.length ? <TimelineBar slots={record.timeSlots} /> : (
                  <div className="text-sm text-center py-2" style={{ color: 'var(--text-muted)' }}>No time entries</div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {record.workHours != null ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#14b8a6' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{attendanceService.formatWorkingHours(record.workHours)}</span>
                    </div>
                    {record.overtime && record.overtime > 0 && (
                      <div className="text-xs" style={{ color: '#f59e0b' }}>+{attendanceService.formatWorkingHours(record.overtime)} OT</div>
                    )}
                  </>
                ) : <span className="text-sm" style={{ color: 'var(--text-muted)' }}>-</span>}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-color)' }}>
                {record.timeSlots?.length ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{record.timeSlots.length} session{record.timeSlots.length !== 1 ? 's' : ''}</span>
                    {record.timeSlots.some(s => !s.checkOut) && <span className="text-xs" style={{ color: '#22c55e' }}>● Active</span>}
                  </div>
                ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
              </div>
              <div>{getArrivalStatus(record)}</div>
              <div className="flex justify-center">{getLogIcon(record.status)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
