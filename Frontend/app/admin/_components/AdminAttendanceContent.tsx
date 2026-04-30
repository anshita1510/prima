'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  BarChart3,
  UserCheck,
  Timer,
  Edit,
  Eye,
  FileText,
  Download,
  RefreshCw,
  CheckSquare,
  X
} from 'lucide-react';
import { authService } from '@/app/services/authService';
import { attendanceService, AttendanceRecord, AttendanceStats } from '@/app/services/attendanceService';

interface RegularizationRequest {
  id: string;
  requestType: string;
  reason: string;
  status: string;
  submittedAt: string;
  proposedCheckIn?: string;
  proposedCheckOut?: string;
  employee: {
    id: number;
    name: string;
    employeeCode: string;
    designation: string;
  };
  attendance: {
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: string;
  };
}

export default function AdminAttendanceContent() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Dashboard data
  const [stats, setStats] = useState<AttendanceStats>({
    totalEmployees: 24,
    present: 22,
    absent: 2,
    late: 3,
    earlyDeparture: 1,
    totalWorkHours: 176,
    totalOvertime: 12
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RegularizationRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Personal attendance
  const [personalAttendance, setPersonalAttendance] = useState<any>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [canCheckOut, setCanCheckOut] = useState(false);
  const [workingHours, setWorkingHours] = useState<number>(0);
  const [isWorkingDay, setIsWorkingDay] = useState<boolean>(true);

  // Working hours configuration
  const WORK_START_TIME = '09:30';
  const WORK_END_TIME = '18:30';
  const STANDARD_WORK_HOURS = 9; // 9:30 AM to 6:30 PM = 9 hours

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: true 
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );
      
      // Check if it's a working day (Monday to Friday)
      const dayOfWeek = now.getDay();
      setIsWorkingDay(dayOfWeek >= 1 && dayOfWeek <= 5);
      
      // Auto-calculate working hours if checked out at 6:30 PM
      if (personalAttendance?.checkIn && !personalAttendance?.checkOut) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Auto checkout at 6:30 PM
        if (currentHour === 18 && currentMinute === 30) {
          handleAutoCheckOut();
        }
        
        // Calculate current working hours
        const checkInTime = new Date(personalAttendance.checkIn);
        const diffMs = now.getTime() - checkInTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        setWorkingHours(Math.max(0, diffHours));
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [personalAttendance]);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
    if (currentUser) {
      loadDashboardData();
      loadPersonalAttendance();
    }
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real attendance data
      const [employeeAttendanceResult, dashboardStatsResult] = await Promise.all([
        attendanceService.getAllEmployeeAttendance(selectedDate),
        attendanceService.getAttendanceDashboardStats(selectedDate)
      ]);
      
      if (employeeAttendanceResult.success) {
        setAttendanceRecords(employeeAttendanceResult.data);
      }
      
      if (dashboardStatsResult.success) {
        setStats(dashboardStatsResult.data);
      }

      // Mock pending requests (replace with real API call when available)
      setPendingRequests([
        {
          id: '1',
          requestType: 'MISSED_PUNCH',
          reason: 'Forgot to check out yesterday',
          status: 'PENDING',
          submittedAt: '2024-12-18T10:00:00Z',
          proposedCheckOut: '2024-12-17T18:00:00Z',
          employee: {
            id: 3,
            name: 'Mike Johnson',
            employeeCode: 'EMP003',
            designation: 'Developer'
          },
          attendance: {
            date: '2024-12-17',
            checkIn: '2024-12-17T09:15:00Z',
            status: 'PARTIAL'
          }
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalAttendance = async () => {
    if (!user) {
      return;
    }
    
    try {
      const result = await attendanceService.getTodayAttendance();
      
      if (result.success && result.data) {
        const attendance = result.data;
        setPersonalAttendance(attendance);
        setCanCheckIn(!attendance.checkIn);
        setCanCheckOut(attendance.checkIn && !attendance.checkOut);
        
        // Calculate working hours if checked in
        if (attendance.checkIn && !attendance.checkOut) {
          const checkInTime = new Date(attendance.checkIn);
          const now = new Date();
          const diffMs = now.getTime() - checkInTime.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          setWorkingHours(Math.max(0, diffHours));
        } else if (attendance.workHours) {
          setWorkingHours(attendance.workHours);
        }
      } else {
        // No attendance record for today
        setPersonalAttendance(null);
        setCanCheckIn(isWorkingDay);
        setCanCheckOut(false);
        setWorkingHours(0);
      }
    } catch (error) {
      console.error('Error loading personal attendance:', error);
      // Fallback to localStorage for offline functionality
      const today = new Date().toISOString().split('T')[0];
      const storedAttendance = localStorage.getItem(`attendance_${user.id}_${today}`);
      
      if (storedAttendance) {
        const attendance = JSON.parse(storedAttendance);
        setPersonalAttendance(attendance);
        setCanCheckIn(!attendance.checkIn);
        setCanCheckOut(attendance.checkIn && !attendance.checkOut);
        
        if (attendance.checkIn && !attendance.checkOut) {
          const checkInTime = new Date(attendance.checkIn);
          const now = new Date();
          const diffMs = now.getTime() - checkInTime.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          setWorkingHours(Math.max(0, diffHours));
        } else if (attendance.workHours) {
          setWorkingHours(attendance.workHours);
        }
      } else {
        setPersonalAttendance(null);
        setCanCheckIn(isWorkingDay);
        setCanCheckOut(false);
        setWorkingHours(0);
      }
    }
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string) => {
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours);
  };

  const calculateOvertime = (workHours: number) => {
    return Math.max(0, workHours - STANDARD_WORK_HOURS);
  };

  const getAttendanceStatus = (checkIn: string, checkOut?: string) => {
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
  };

  const handleCheckIn = async () => {
    if (!user || !isWorkingDay) return;
    
    try {
      setLoading(true);
      
      const result = await attendanceService.checkIn();
      
      if (result.success) {
        const attendance = result.data;
        setPersonalAttendance(attendance);
        setCanCheckIn(false);
        setCanCheckOut(true);
        
        // Show success message
        const checkInTime = new Date(attendance.checkIn);
        const checkInTimeFormatted = checkInTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        alert(`✅ Check-in successful at ${checkInTimeFormatted}!`);
        
        // Reload dashboard data
        loadDashboardData();
      } else {
        alert(`❌ Check-in failed: ${result.message}`);
      }
      
    } catch (error: any) {
      console.error('Check-in error:', error);
      alert(`❌ Check-in failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !personalAttendance?.checkIn) return;
    
    try {
      setLoading(true);
      
      const result = await attendanceService.checkOut();
      
      if (result.success) {
        const attendance = result.data;
        setPersonalAttendance(attendance);
        setCanCheckOut(false);
        setWorkingHours(attendance.workHours || 0);
        
        // Show success message with summary
        const checkOutTime = new Date(attendance.checkOut);
        const checkOutTimeFormatted = checkOutTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        const workHours = attendance.workHours || 0;
        const overtime = attendance.overtime || 0;
        
        alert(`✅ Check-out successful at ${checkOutTimeFormatted}!\nWork Hours: ${workHours.toFixed(2)}h${overtime > 0 ? `\nOvertime: ${overtime.toFixed(2)}h` : ''}`);
        
        // Reload dashboard data
        loadDashboardData();
      } else {
        alert(`❌ Check-out failed: ${result.message}`);
      }
      
    } catch (error: any) {
      console.error('Check-out error:', error);
      alert(`❌ Check-out failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCheckOut = async () => {
    if (!personalAttendance?.checkIn || personalAttendance?.checkOut) return;
    
    const now = new Date();
    now.setHours(18, 30, 0, 0); // Set to exactly 6:30 PM
    const checkOutTime = now.toISOString();
    const today = now.toISOString().split('T')[0];
    
    const workHours = calculateWorkingHours(personalAttendance.checkIn, checkOutTime);
    const overtime = calculateOvertime(workHours);
    const status = getAttendanceStatus(personalAttendance.checkIn, checkOutTime);
    
    const updatedAttendance = {
      ...personalAttendance,
      checkOut: checkOutTime,
      workHours: Math.round(workHours * 100) / 100,
      overtime: Math.round(overtime * 100) / 100,
      status: status,
      autoCheckOut: true
    };
    
    localStorage.setItem(`attendance_${user.id}_${today}`, JSON.stringify(updatedAttendance));
    setPersonalAttendance(updatedAttendance);
    setCanCheckOut(false);
    setWorkingHours(workHours);
    
    alert(`Auto check-out at 6:30 PM!\nWork Hours: ${workHours.toFixed(2)}h${overtime > 0 ? `\nOvertime: ${overtime.toFixed(2)}h` : ''}`);
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Mock approval
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      alert('Request approved successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Mock rejection
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      alert('Request rejected successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-800';
      case 'EARLY_DEPARTURE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage team attendance</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{currentTime}</div>
          <div className="text-sm text-gray-500">{currentDate}</div>
        </div>
      </div>

      {/* Personal Attendance Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            My Attendance Today
            <Badge variant="outline" className="ml-2 text-xs">
              Admin + Employee
            </Badge>
          </CardTitle>
          <CardDescription>
            Your personal check-in/check-out status as an admin employee • Working Hours: {WORK_START_TIME} - {WORK_END_TIME}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {personalAttendance ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(personalAttendance.status)}>
                      {personalAttendance.status.replace('_', ' ')}
                    </Badge>
                    {personalAttendance.checkIn && (
                      <span className="text-sm text-gray-600">
                        In: {formatTime(personalAttendance.checkIn)}
                      </span>
                    )}
                    {personalAttendance.checkOut && (
                      <span className="text-sm text-gray-600">
                        Out: {formatTime(personalAttendance.checkOut)}
                      </span>
                    )}
                    {personalAttendance.autoCheckOut && (
                      <Badge variant="outline" className="text-xs">
                        Auto Check-out
                      </Badge>
                    )}
                  </div>
                  
                  {/* Real-time working hours display */}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      {personalAttendance.workHours ? (
                        <>
                          Work Hours: {personalAttendance.workHours.toFixed(2)}h
                          {personalAttendance.overtime > 0 && (
                            <span className="text-orange-600 ml-2">
                              Overtime: {personalAttendance.overtime.toFixed(2)}h
                            </span>
                          )}
                        </>
                      ) : personalAttendance.checkIn && !personalAttendance.checkOut ? (
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-600">
                            Current Hours: {workingHours.toFixed(2)}h
                          </span>
                          {workingHours > STANDARD_WORK_HOURS && (
                            <span className="text-orange-600">
                              (Overtime: {(workingHours - STANDARD_WORK_HOURS).toFixed(2)}h)
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                    
                    {/* Progress bar for working hours */}
                    {personalAttendance.checkIn && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            workingHours >= STANDARD_WORK_HOURS ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ 
                            width: `${Math.min((workingHours / STANDARD_WORK_HOURS) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                  {isWorkingDay ? 'No attendance record for today' : 'Today is not a working day'}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCheckIn} 
                disabled={!canCheckIn || loading || !isWorkingDay}
                className="bg-green-600 hover:bg-green-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Check In
              </Button>
              <Button 
                onClick={handleCheckOut} 
                disabled={!canCheckOut || loading}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            </div>
          </div>
          
          {/* Working day notice */}
          {!isWorkingDay && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              Today is a weekend. Check-in is not available.
            </div>
          )}
          
          {/* Auto check-out notice */}
          {personalAttendance?.checkIn && !personalAttendance?.checkOut && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Auto check-out will occur at 6:30 PM if you haven't checked out manually.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active team members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalEmployees > 0 ? Math.round((stats.present / stats.totalEmployees) * 100) : 0}% attendance
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.present > 0 ? Math.round((stats.late / stats.present) * 100) : 0}% of present
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Attendance</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Date Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button onClick={loadDashboardData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common attendance management tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Manual Correction
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Audit Trail
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest attendance updates from your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{record.employee.name}</p>
                        <p className="text-xs text-gray-500">
                          {record.employee.designation} • {record.department.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {record.checkIn && `In: ${formatTime(record.checkIn)}`}
                        {record.checkOut && ` Out: ${formatTime(record.checkOut)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          {/* Employee Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Attendance</CardTitle>
              <CardDescription>
                Detailed attendance records for {formatDate(selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Employee</th>
                      <th className="text-left p-2">Department</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Check In</th>
                      <th className="text-left p-2">Check Out</th>
                      <th className="text-left p-2">Work Hours</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{record.employee.name}</div>
                            <div className="text-sm text-gray-500">{record.employee.employeeCode}</div>
                          </div>
                        </td>
                        <td className="p-2">{record.department.name}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {record.checkIn ? formatTime(record.checkIn) : '-'}
                        </td>
                        <td className="p-2">
                          {record.checkOut ? formatTime(record.checkOut) : '-'}
                        </td>
                        <td className="p-2">
                          {record.workHours ? `${record.workHours}h` : '-'}
                          {record.overtime && record.overtime > 0 && (
                            <div className="text-xs text-orange-600">+{record.overtime}h OT</div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Regularization Requests</CardTitle>
              <CardDescription>
                Requests requiring your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{request.employee.name}</span>
                          <Badge className={getRequestStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge variant="outline">{request.requestType}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Date: {formatDate(request.attendance.date)}</div>
                          <div>Reason: {request.reason}</div>
                          {request.proposedCheckIn && (
                            <div>Proposed Check In: {formatTime(request.proposedCheckIn)}</div>
                          )}
                          {request.proposedCheckOut && (
                            <div>Proposed Check Out: {formatTime(request.proposedCheckOut)}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id, 'Rejected by admin')}
                          disabled={loading}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending requests
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>
                Generate and export attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Daily Reports</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Today's Attendance
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export Daily Report
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Monthly Reports</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Monthly Summary
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Attendance Trends
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Admin Dual Role: Manager + Employee
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                As an admin, you have dual functionality: <strong>personal attendance tracking</strong> (check-in/check-out, working hours) 
                and <strong>administrative oversight</strong> (employee management, request approvals, policy configuration, audit trails). 
                Your personal attendance is tracked just like any employee, while you maintain full administrative access to manage the entire system.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                View Audit Trail
              </Button>
              <Button size="sm" variant="outline">
                Configure Policies
              </Button>
              <Button size="sm" variant="outline">
                My Attendance History
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}