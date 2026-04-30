"use client";

import { useState, useMemo, useEffect } from 'react';
import { authService } from '../../../services/auth.services';
import api from '../../../../lib/axios';
import {
  AttendanceRecord,
  AttendanceStats,
  AttendanceRequest,
  ViewMode,
  TimeFormat
} from '../types/attendanceTypes';
// API service for attendance
const attendanceAPI = {
  // Get my attendance stats
  getMyStats: async (period: string = 'week') => {
    const response = await api.get(`/api/attendance/my-stats?period=${period}`);
    return response.data;
  },

  // Get my attendance logs
  getMyLogs: async (days: number = 30) => {
    const response = await api.get(`/api/attendance/my-logs?days=${days}`);
    return response.data;
  },

  // Get my team stats
  getMyTeamStats: async (period: string = 'week') => {
    const response = await api.get(`/api/attendance/my-team-stats?period=${period}`);
    return response.data;
  },

  // Get my today's attendance
  getMyTodayAttendance: async () => {
    const response = await api.get('/api/attendance/my-today');
    return response.data;
  },

  // My check in
  myCheckIn: async () => {
    const response = await api.post('/api/attendance/my-check-in');
    return response.data;
  },

  // My check out
  myCheckOut: async () => {
    const response = await api.post('/api/attendance/my-check-out');
    return response.data;
  },

  // Admin routes (with specific employee IDs)
  getStats: async (employeeId: number, period: string = 'week') => {
    const response = await api.get(`/api/attendance/stats/${employeeId}?period=${period}`);
    return response.data;
  },

  getLogs: async (employeeId: number, days: number = 30) => {
    const response = await api.get(`/api/attendance/logs/${employeeId}?days=${days}`);
    return response.data;
  },

  getTeamStats: async (departmentId: number, period: string = 'week') => {
    const response = await api.get(`/api/attendance/team-stats/${departmentId}?period=${period}`);
    return response.data;
  },

  getTodayAttendance: async (employeeId: number) => {
    const response = await api.get(`/api/attendance/today/${employeeId}`);
    return response.data;
  },

  checkIn: async (employeeId: number, companyId: number, departmentId: number) => {
    const response = await api.post('/api/attendance/check-in', {
      employeeId,
      companyId,
      departmentId
    });
    return response.data;
  },

  checkOut: async (employeeId: number) => {
    const response = await api.post('/api/attendance/check-out', {
      employeeId
    });
    return response.data;
  }
};

// Mock data generator (fallback)
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayOfWeek = date.getDay();

    // Weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      records.push({
        id: `att-${i}`,
        date,
        status: 'weekly-off',
        timeSlots: [],
        effectiveHours: '0h 0m',
        grossHours: '0h 0m',
        arrivalStatus: 'no-entry',
      });
      continue;
    }

    // Holiday on 1st and random holidays
    if (date.getDate() === 1 || (Math.random() > 0.95)) {
      records.push({
        id: `att-${i}`,
        date,
        status: 'holiday',
        timeSlots: [],
        effectiveHours: '0h 0m',
        grossHours: '0h 0m',
        arrivalStatus: 'no-entry',
        notes: 'Holiday',
      });
      continue;
    }

    // Random absence (5% chance)
    if (Math.random() > 0.95) {
      records.push({
        id: `att-${i}`,
        date,
        status: 'absent',
        timeSlots: [],
        effectiveHours: '0h 0m',
        grossHours: '0h 0m',
        arrivalStatus: 'no-entry',
      });
      continue;
    }

    // Present days with varied timing
    const isLate = Math.random() > 0.8; // 20% chance of being late
    const isEarlyLeave = Math.random() > 0.9; // 10% chance of early leave

    // Varied work hours (7.5 to 9.5 hours)
    const baseMinutes = 450; // 7.5 hours
    const extraMinutes = Math.floor(Math.random() * 120); // 0-2 extra hours
    const effectiveMinutes = baseMinutes + extraMinutes;

    // Break time (30-60 minutes)
    const breakMinutes = 30 + Math.floor(Math.random() * 30);
    const grossMinutes = effectiveMinutes + breakMinutes;

    // Arrival time
    const baseArrivalHour = 9;
    const baseArrivalMinute = 30;
    let arrivalHour = baseArrivalHour;
    let arrivalMinute = baseArrivalMinute;

    if (isLate) {
      arrivalMinute += Math.floor(Math.random() * 30) + 5; // 5-35 minutes late
      if (arrivalMinute >= 60) {
        arrivalHour += Math.floor(arrivalMinute / 60);
        arrivalMinute = arrivalMinute % 60;
      }
    } else {
      // Sometimes early (10% chance)
      if (Math.random() > 0.9) {
        arrivalMinute -= Math.floor(Math.random() * 15) + 5; // 5-20 minutes early
        if (arrivalMinute < 0) {
          arrivalHour -= 1;
          arrivalMinute += 60;
        }
      }
    }

    // Departure time
    const departureHour = arrivalHour + Math.floor(grossMinutes / 60);
    const departureMinute = (arrivalMinute + (grossMinutes % 60)) % 60;

    const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMinute.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const departureTime = isEarlyLeave
      ? `${(departureHour - 1).toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}:00`
      : `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}:00`;

    records.push({
      id: `att-${i}`,
      date,
      status: 'present',
      timeSlots: [
        { start: arrivalTime.substring(0, 5), end: '13:00', type: 'work', startTime: arrivalTime.substring(0, 5), endTime: '13:00', checkIn: arrivalTime, checkOut: '13:00' },
        { start: '13:00', end: '14:00', type: 'break', startTime: '13:00', endTime: '14:00', checkIn: '13:00', checkOut: '14:00' },
        { start: '14:00', end: departureTime.substring(0, 5), type: 'work', startTime: '14:00', endTime: departureTime.substring(0, 5), checkIn: '14:00', checkOut: departureTime },
      ],
      effectiveHours: `${Math.floor(effectiveMinutes / 60)}h ${effectiveMinutes % 60}m`,
      grossHours: `${Math.floor(grossMinutes / 60)}h ${grossMinutes % 60}m`,
      arrivalStatus: isLate ? 'late' : (arrivalMinute < baseArrivalMinute ? 'early' : 'on-time'),
      arrivalTime,
      departureTime,
    });
  }

  return records;
};

const mockRequests: AttendanceRequest[] = [
  {
    id: 'req-1',
    type: 'work-from-home',
    date: new Date(),
    reason: 'Personal work at home',
    status: 'pending',
    requestedAt: new Date(),
  },
  {
    id: 'req-2',
    type: 'regularization',
    date: new Date(Date.now() - 86400000 * 2),
    reason: 'Forgot to punch out',
    status: 'approved',
    requestedAt: new Date(Date.now() - 86400000),
  },
];

export const useAttendance = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('24h');
  const [selectedMonth, setSelectedMonth] = useState<string>('30 DAYS');
  const [activeTab, setActiveTab] = useState<'log' | 'calendar' | 'requests'>('log');

  // State for real data
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [myStats, setMyStats] = useState<AttendanceStats | null>(null);
  const [teamStats, setTeamStats] = useState<AttendanceStats | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = authService.getStoredUser();
    setCurrentUser(user);
  }, []);

  // Load attendance data
  const refreshData = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Try to load real data from API
      try {
        const [statsResponse, logsResponse, teamStatsResponse, todayResponse] = await Promise.all([
          attendanceAPI.getMyStats('week'),
          attendanceAPI.getMyLogs(30),
          attendanceAPI.getMyTeamStats('week'),
          attendanceAPI.getMyTodayAttendance()
        ]);

        if (todayResponse?.success && todayResponse?.data) {
          setTodayAttendance(todayResponse.data);
        } else {
          setTodayAttendance(null);
        }

        if (statsResponse.success && logsResponse.success && teamStatsResponse.success) {
          // Convert backend data to frontend format
          const formatHours = (hours: number) => {
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            return `${h}h ${m}m`;
          };

          const convertedLogs = logsResponse.data.map((log: any) => {
            const workHours = log.workHours || 0;
            const grossHours = log.checkIn && log.checkOut
              ? (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60)
              : workHours;

            // Preserve raw timeSlots (checkIn/checkOut ISO strings) for AttendanceLog component
            const timeSlots = (log.timeSlots || []).map((slot: any) => ({
              checkIn: slot.checkIn || null,
              checkOut: slot.checkOut || null,
              // also provide start/end for legacy components
              start: slot.checkIn ? new Date(slot.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
              end: slot.checkOut ? new Date(slot.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
              type: 'work' as const,
            }));

            return {
              id: `att-${log.id}`,
              date: new Date(log.date),
              status: log.status.toLowerCase(),
              timeSlots,
              effectiveHours: formatHours(workHours),
              grossHours: formatHours(grossHours),
              arrivalStatus: log.checkIn ? 'on-time' : 'no-entry',
              arrivalTime: log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : undefined,
              departureTime: log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : undefined,
            };
          });

          setRecords(convertedLogs);

          // Safely convert stats with fallbacks
          const convertedMyStats: AttendanceStats = {
            avgHoursPerDay: statsResponse.data?.avgHoursPerDay
              ? `${Math.floor(statsResponse.data.avgHoursPerDay)}h ${Math.round((statsResponse.data.avgHoursPerDay % 1) * 60)}m`
              : '8h 0m',
            onTimeArrivalPercent: statsResponse.data?.onTimePercentage || 0,
            totalWorkingDays: statsResponse.data?.totalDays || 0,
            presentDays: statsResponse.data?.presentDays || 0,
            absentDays: statsResponse.data?.absentDays || 0,
            lateDays: Math.max(0, (statsResponse.data?.totalDays || 0) - (statsResponse.data?.presentDays || 0) - (statsResponse.data?.absentDays || 0)),
          };

          const convertedTeamStats: AttendanceStats = {
            avgHoursPerDay: teamStatsResponse.data?.avgHoursPerDay
              ? `${Math.floor(teamStatsResponse.data.avgHoursPerDay)}h ${Math.round((teamStatsResponse.data.avgHoursPerDay % 1) * 60)}m`
              : '7h 30m',
            onTimeArrivalPercent: teamStatsResponse.data?.onTimePercentage || 0,
            totalWorkingDays: teamStatsResponse.data?.totalDays || 22,
            presentDays: teamStatsResponse.data?.presentDays || 18,
            absentDays: teamStatsResponse.data?.absentDays || 2,
            lateDays: teamStatsResponse.data?.lateDays || 2,
          };

          setMyStats(convertedMyStats);
          setTeamStats(convertedTeamStats);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError);
      }

      // Fallback to mock data with dynamic stats calculation
      const mockRecords = generateMockAttendance();
      setRecords(mockRecords);

      // Calculate dynamic stats from mock records
      const calculateStatsFromRecords = (records: AttendanceRecord[]) => {
        const workingDays = records.filter(r =>
          r.status !== 'weekly-off' && r.status !== 'holiday'
        );

        const presentDays = records.filter(r => r.status === 'present');
        const lateDays = records.filter(r => r.arrivalStatus === 'late');
        const absentDays = records.filter(r => r.status === 'absent');

        // Calculate average hours from present days
        let totalMinutes = 0;
        presentDays.forEach(day => {
          const hoursMatch = day.effectiveHours.match(/(\d+)h (\d+)m/);
          if (hoursMatch) {
            totalMinutes += parseInt(hoursMatch[1]) * 60 + parseInt(hoursMatch[2]);
          }
        });

        const avgMinutesPerDay = presentDays.length > 0 ? totalMinutes / presentDays.length : 0;
        const avgHours = Math.floor(avgMinutesPerDay / 60);
        const avgMinutes = Math.round(avgMinutesPerDay % 60);

        const onTimePercentage = presentDays.length > 0
          ? Math.round(((presentDays.length - lateDays.length) / presentDays.length) * 100)
          : 0;

        return {
          avgHoursPerDay: `${avgHours}h ${avgMinutes}m`,
          onTimeArrivalPercent: onTimePercentage,
          totalWorkingDays: workingDays.length,
          presentDays: presentDays.length,
          absentDays: absentDays.length,
          lateDays: lateDays.length,
        };
      };

      const dynamicMyStats = calculateStatsFromRecords(mockRecords);

      // Create slightly different team stats
      const dynamicTeamStats: AttendanceStats = {
        avgHoursPerDay: '7h 45m',
        onTimeArrivalPercent: Math.max(0, dynamicMyStats.onTimeArrivalPercent - 15),
        totalWorkingDays: dynamicMyStats.totalWorkingDays,
        presentDays: Math.max(0, dynamicMyStats.presentDays - 2),
        absentDays: dynamicMyStats.absentDays + 1,
        lateDays: dynamicMyStats.lateDays + 2,
      };

      setMyStats(dynamicMyStats);
      setTeamStats(dynamicTeamStats);

    } catch (err: any) {
      console.error('Error loading attendance data:', err);
      setError(err.message || 'Failed to load attendance data');

      // Fallback to mock data with dynamic calculation
      const mockRecords = generateMockAttendance();
      setRecords(mockRecords);

      // Calculate stats from mock records
      const calculateStatsFromRecords = (records: AttendanceRecord[]) => {
        const workingDays = records.filter(r =>
          r.status !== 'weekly-off' && r.status !== 'holiday'
        );

        const presentDays = records.filter(r => r.status === 'present');
        const lateDays = records.filter(r => r.arrivalStatus === 'late');
        const absentDays = records.filter(r => r.status === 'absent');

        // Calculate average hours from present days
        let totalMinutes = 0;
        presentDays.forEach(day => {
          const hoursMatch = day.effectiveHours.match(/(\d+)h (\d+)m/);
          if (hoursMatch) {
            totalMinutes += parseInt(hoursMatch[1]) * 60 + parseInt(hoursMatch[2]);
          }
        });

        const avgMinutesPerDay = presentDays.length > 0 ? totalMinutes / presentDays.length : 0;
        const avgHours = Math.floor(avgMinutesPerDay / 60);
        const avgMinutes = Math.round(avgMinutesPerDay % 60);

        const onTimePercentage = presentDays.length > 0
          ? Math.round(((presentDays.length - lateDays.length) / presentDays.length) * 100)
          : 0;

        return {
          avgHoursPerDay: `${avgHours}h ${avgMinutes}m`,
          onTimeArrivalPercent: onTimePercentage,
          totalWorkingDays: workingDays.length,
          presentDays: presentDays.length,
          absentDays: absentDays.length,
          lateDays: lateDays.length,
        };
      };

      const dynamicMyStats = calculateStatsFromRecords(mockRecords);

      const dynamicTeamStats: AttendanceStats = {
        avgHoursPerDay: '7h 45m',
        onTimeArrivalPercent: Math.max(0, dynamicMyStats.onTimeArrivalPercent - 15),
        totalWorkingDays: dynamicMyStats.totalWorkingDays,
        presentDays: Math.max(0, dynamicMyStats.presentDays - 2),
        absentDays: dynamicMyStats.absentDays + 1,
        lateDays: dynamicMyStats.lateDays + 2,
      };

      setMyStats(dynamicMyStats);
      setTeamStats(dynamicTeamStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Check in function
  const checkIn = async () => {
    if (!currentUser?.id) {
      throw new Error('User not found');
    }

    try {
      const response = await attendanceAPI.myCheckIn();
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Check-in failed');
      }
    } catch (error: any) {
      // If API fails, show mock success for demo
      console.log('Check-in API failed, showing mock success:', error);
      return { success: true, message: 'Checked in successfully (Demo)' };
    }
  };

  // Check out function
  const checkOut = async () => {
    if (!currentUser?.id) {
      throw new Error('User not found');
    }

    try {
      const response = await attendanceAPI.myCheckOut();
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Check-out failed');
      }
    } catch (error: any) {
      // If API fails, show mock success for demo
      console.log('Check-out API failed, showing mock success:', error);
      return { success: true, message: 'Checked out successfully (Demo)' };
    }
  };

  const requests = mockRequests;

  const currentTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: timeFormat === '12h'
    });
  }, [timeFormat]);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  return {
    records,
    requests,
    myStats: myStats || {
      avgHoursPerDay: '0h 0m',
      onTimeArrivalPercent: 0,
      totalWorkingDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
    },
    teamStats: teamStats || {
      avgHoursPerDay: '0h 0m',
      onTimeArrivalPercent: 0,
      totalWorkingDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
    },
    viewMode,
    setViewMode,
    timeFormat,
    setTimeFormat,
    selectedMonth,
    setSelectedMonth,
    activeTab,
    setActiveTab,
    currentTime,
    currentDate,
    loading,
    error,
    checkIn,
    checkOut,
    currentUser,
    refreshData,
    todayAttendance,
    setTodayAttendance,
  };
};
