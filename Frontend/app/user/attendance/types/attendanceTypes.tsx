export type AttendanceStatus = 
  | 'present' 
  | 'absent' 
  | 'late' 
  | 'half-day' 
  | 'weekly-off' 
  | 'holiday' 
  | 'on-leave';

export type ArrivalStatus = 'on-time' | 'late' | 'early' | 'no-entry';

export interface TimeSlot {
  checkOut: any;
  endTime: any;
  startTime: any;
  checkIn: any;
  start: string; // HH:mm format
  end: string;
  type: 'work' | 'break' | 'overtime';
}

export interface AttendanceRecord {
  id: string;
  date: Date;
  status: AttendanceStatus;
  timeSlots: TimeSlot[];
  effectiveHours: string;
  grossHours: string;
  arrivalStatus: ArrivalStatus;
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
}

export interface AttendanceStats {
  avgHoursPerDay: string;
  onTimeArrivalPercent: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  stats: AttendanceStats;
}

export interface AttendanceRequest {
  id: string;
  type: 'regularization' | 'work-from-home' | 'on-duty' | 'partial-day';
  date: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
}

export type ViewMode = 'list' | 'calendar';
export type TimeFormat = '12h' | '24h';
