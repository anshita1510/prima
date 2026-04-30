import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface TimeSlot {
  checkIn: string;
  checkOut?: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  overtime?: number;
  timeSlots?: TimeSlot[];
  isManuallyEdited: boolean;
  editReason?: string;
  employee: {
    id: number;
    name: string;
    employeeCode: string;
    designation: string;
  };
  department: {
    name: string;
  };
}

export interface AttendanceStats {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  earlyDeparture: number;
  totalWorkHours: number;
  totalOvertime: number;
}

export const attendanceService = {
  // Personal Attendance
  async checkIn(location?: { latitude: number; longitude: number; address?: string }) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user.employeeId || user.id; // Fallback to user.id if employeeId not available
      
      const response = await api.post('/api/attendance/checkin', {
        employeeId,
        location,
        deviceType: 'web'
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Check-in error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Check-in failed'
      };
    }
  },

  async checkOut(location?: { latitude: number; longitude: number; address?: string }) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user.employeeId || user.id;
      
      const response = await api.post('/api/attendance/checkout', {
        employeeId,
        location,
        deviceType: 'web'
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Check-out error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Check-out failed'
      };
    }
  },

  async getTodayAttendance() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user.employeeId || user.id;
      
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/api/attendance/personal/${employeeId}?startDate=${today}&endDate=${today}`);
      
      const attendanceRecords = response.data.data;
      return {
        success: true,
        data: attendanceRecords.length > 0 ? attendanceRecords[0] : null
      };
    } catch (error: any) {
      console.error('Get today attendance error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance',
        data: null
      };
    }
  },

  async getPersonalAttendanceHistory(startDate?: string, endDate?: string) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user.employeeId || user.id;
      
      let url = `/api/attendance/personal/${employeeId}`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Get attendance history error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance history',
        data: []
      };
    }
  },

  // Admin Functions
  async getAllEmployeeAttendance(date?: string, departmentId?: number) {
    try {
      let url = '/api/attendance/employees';
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (departmentId) params.append('departmentId', departmentId.toString());
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Get all employee attendance error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch employee attendance',
        data: []
      };
    }
  },

  async getAttendanceDashboardStats(date?: string, departmentId?: number) {
    try {
      let url = '/api/attendance/dashboard-stats';
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (departmentId) params.append('departmentId', departmentId.toString());
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('❌ Get dashboard stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard stats',
        data: {
          totalEmployees: 0,
          present: 0,
          absent: 0,
          late: 0,
          earlyDeparture: 0,
          totalWorkHours: 0,
          totalOvertime: 0
        }
      };
    }
  },

  // Utility functions
  calculateWorkingHours(checkIn: string, checkOut: string): number {
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, Math.round(diffHours * 100) / 100);
  },

  calculateTotalWorkingHours(timeSlots: TimeSlot[]): number {
    if (!timeSlots || timeSlots.length === 0) return 0;
    
    let totalMinutes = 0;
    timeSlots.forEach(slot => {
      if (slot.checkIn && slot.checkOut) {
        const checkInTime = new Date(slot.checkIn);
        const checkOutTime = new Date(slot.checkOut);
        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        totalMinutes += diffMinutes;
      }
    });
    
    return Math.round((totalMinutes / 60) * 100) / 100;
  },

  calculateCurrentSessionTime(timeSlots: TimeSlot[]): number {
    if (!timeSlots || timeSlots.length === 0) return 0;
    
    // Find the last open slot (checked in but not checked out)
    const openSlot = timeSlots.find(slot => slot.checkIn && !slot.checkOut);
    if (!openSlot) return 0;
    
    const checkInTime = new Date(openSlot.checkIn);
    const now = new Date();
    const diffMs = now.getTime() - checkInTime.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    return Math.max(0, Math.round(diffMinutes * 100) / 100);
  },

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  },

  formatWorkingHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours % 1) * 60);
    
    if (wholeHours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  },

  calculateOvertime(workHours: number, standardHours: number = 9): number {
    return Math.max(0, Math.round((workHours - standardHours) * 100) / 100);
  },

  getAttendanceStatus(checkIn: string, checkOut?: string): string {
    const checkInTime = new Date(checkIn);
    const checkInHour = checkInTime.getHours();
    const checkInMinute = checkInTime.getMinutes();
    
    // Check if late (after 9:30 AM)
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30);
    
    if (!checkOut) {
      return isLate ? 'LATE' : 'PRESENT';
    }
    
    const checkOutTime = new Date(checkOut);
    const checkOutHour = checkOutTime.getHours();
    const checkOutMinute = checkOutTime.getMinutes();
    
    // Check if early departure (before 6:30 PM)
    const isEarlyDeparture = checkOutHour < 18 || (checkOutHour === 18 && checkOutMinute < 30);
    
    if (isLate && isEarlyDeparture) {
      return 'PARTIAL';
    } else if (isLate) {
      return 'LATE';
    } else if (isEarlyDeparture) {
      return 'EARLY_DEPARTURE';
    } else {
      return 'PRESENT';
    }
  },

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};