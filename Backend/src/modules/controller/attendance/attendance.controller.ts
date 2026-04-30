import { Request, Response } from 'express';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceStatus, RegularizationType } from '@prisma/client';

class AttendanceController {
  // Personal Attendance Endpoints
  async checkIn(req: Request, res: Response) {
    try {
      // Get employeeId from authenticated user or request body
      const employeeId = req.user?.employeeId || req.body.employeeId;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required. This user does not have an employee record.'
        });
      }

      const location = req.body.location || 'Office';
      const deviceInfo = {
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || '',
        deviceType: req.body.deviceType || 'web'
      };

      console.log('📥 Check-in request:', { employeeId, location, deviceInfo });

      const attendance = await attendanceService.checkIn({
        employeeId,
        location,
        deviceInfo
      }, req);

      res.status(200).json({
        success: true,
        message: 'Check-in successful',
        data: attendance
      });
    } catch (error: any) {
      console.error('❌ Check-in error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Check-in failed'
      });
    }
  }

  async checkOut(req: Request, res: Response) {
    try {
      // Get employeeId from authenticated user or request body
      const employeeId = req.user?.employeeId || req.body.employeeId;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required. This user does not have an employee record.'
        });
      }

      const location = req.body.location || 'Office';
      const deviceInfo = {
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || '',
        deviceType: req.body.deviceType || 'web'
      };

      console.log('📤 Check-out request:', { employeeId, location, deviceInfo });

      const attendance = await attendanceService.checkOut({
        employeeId,
        location,
        deviceInfo
      }, req);

      res.status(200).json({
        success: true,
        message: 'Check-out successful',
        data: attendance
      });
    } catch (error: any) {
      console.error('❌ Check-out error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Check-out failed'
      });
    }
  }

  async getPersonalAttendanceHistory(req: Request, res: Response) {
    try {
      // Get employeeId from params (for admin/manager) or from authenticated user
      const employeeIdParam = req.params.employeeId;
      const employeeId = employeeIdParam 
        ? parseInt(employeeIdParam) 
        : req.user?.employeeId;

      if (!employeeId) {
        // If user doesn't have an employeeId (e.g., super admin), return empty data instead of error
        console.log('⚠️ User has no employeeId, returning empty attendance data');
        
        const isToday = req.path.includes('/my-today') || req.path.includes('/today');
        
        if (isToday) {
          return res.status(200).json({
            success: true,
            data: null,
            message: 'No employee record found for this user'
          });
        } else {
          return res.status(200).json({
            success: true,
            data: [],
            message: 'No employee record found for this user'
          });
        }
      }

      const { startDate, endDate } = req.query;

      // Check if this is a request for today's attendance only
      const isToday = req.path.includes('/my-today') || req.path.includes('/today');
      
      let history;
      if (isToday) {
        // Get only today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        history = await attendanceService.getPersonalAttendanceHistory(
          employeeId,
          today,
          tomorrow
        );
        
        // Return single record or null
        const todayRecord = history.length > 0 ? history[0] : null;
        return res.status(200).json({
          success: true,
          data: todayRecord
        });
      } else {
        // Get full history
        history = await attendanceService.getPersonalAttendanceHistory(
          employeeId,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );
      }

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('❌ Get attendance history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance history'
      });
    }
  }

  async submitRegularizationRequest(req: Request, res: Response) {
    try {
      const {
        employeeId,
        attendanceId,
        requestType,
        reason,
        proposedCheckIn,
        proposedCheckOut,
        proposedStatus
      } = req.body;

      const request = await attendanceService.submitRegularizationRequest({
        employeeId,
        attendanceId,
        requestType: requestType as RegularizationType,
        reason,
        proposedCheckIn: proposedCheckIn ? new Date(proposedCheckIn) : undefined,
        proposedCheckOut: proposedCheckOut ? new Date(proposedCheckOut) : undefined,
        proposedStatus: proposedStatus ? proposedStatus as AttendanceStatus : undefined
      }, req);

      res.status(201).json({
        success: true,
        message: 'Regularization request submitted successfully',
        data: request
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit regularization request'
      });
    }
  }

  // Employee Management Endpoints
  async getAllEmployeeAttendance(req: Request, res: Response) {
    try {
      const { date, departmentId } = req.query;

      const attendance = await attendanceService.getAllEmployeeAttendance(
        date ? new Date(date as string) : undefined,
        departmentId ? parseInt(departmentId as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: attendance
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee attendance'
      });
    }
  }

  async performManualAttendanceCorrection(req: Request, res: Response) {
    try {
      const {
        attendanceId,
        checkIn,
        checkOut,
        status,
        reason,
        correctedBy
      } = req.body;

      const correctedAttendance = await attendanceService.performManualAttendanceCorrection({
        attendanceId,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        status: status ? status as AttendanceStatus : undefined,
        reason,
        correctedBy
      }, req);

      res.status(200).json({
        success: true,
        message: 'Attendance corrected successfully',
        data: correctedAttendance
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to correct attendance'
      });
    }
  }

  async getPendingRegularizationRequests(req: Request, res: Response) {
    try {
      const { approverId } = req.query;

      const requests = await attendanceService.getPendingRegularizationRequests(
        approverId ? parseInt(approverId as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch pending requests'
      });
    }
  }

  async approveRegularizationRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { approverId } = req.body;

      const approvedRequest = await attendanceService.approveRegularizationRequest(
        requestId,
        approverId,
        req
      );

      res.status(200).json({
        success: true,
        message: 'Regularization request approved successfully',
        data: approvedRequest
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to approve request'
      });
    }
  }

  async rejectRegularizationRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { approverId, rejectionReason } = req.body;

      const rejectedRequest = await attendanceService.rejectRegularizationRequest(
        requestId,
        approverId,
        rejectionReason,
        req
      );

      res.status(200).json({
        success: true,
        message: 'Regularization request rejected successfully',
        data: rejectedRequest
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject request'
      });
    }
  }

  // Reporting Endpoints
  async generateDailyAttendanceReport(req: Request, res: Response) {
    try {
      const { date, departmentId } = req.query;

      const report = await attendanceService.generateDailyAttendanceReport(
        date ? new Date(date as string) : new Date(),
        departmentId ? parseInt(departmentId as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate daily report'
      });
    }
  }

  async generateMonthlyAttendanceReport(req: Request, res: Response) {
    try {
      const { year, month, departmentId } = req.query;

      const report = await attendanceService.generateMonthlyAttendanceReport(
        parseInt(year as string),
        parseInt(month as string),
        departmentId ? parseInt(departmentId as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate monthly report'
      });
    }
  }

  // Audit Endpoints
  async getAuditTrail(req: Request, res: Response) {
    try {
      const { attendanceId, employeeId, startDate, endDate } = req.query;

      const auditTrail = await attendanceService.getAuditTrail(
        attendanceId ? parseInt(attendanceId as string) : undefined,
        employeeId ? parseInt(employeeId as string) : undefined,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: auditTrail
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch audit trail'
      });
    }
  }

  // Dashboard Statistics
  async getAttendanceDashboardStats(req: Request, res: Response) {
    try {
      // Check if user has employeeId for personal stats
      const employeeId = req.user?.employeeId;
      
      if (!employeeId && (req.path.includes('/my-stats') || req.path.includes('/my-team-stats'))) {
        // Return empty stats for users without employee records
        console.log('⚠️ User has no employeeId, returning empty stats');
        return res.status(200).json({
          success: true,
          data: {
            summary: {
              totalEmployees: 0,
              present: 0,
              absent: 0,
              halfDay: 0,
              leave: 0,
              presentPercentage: 0
            },
            pendingRequests: 0,
            recentActivity: []
          },
          message: 'No employee record found for this user'
        });
      }

      const { date, departmentId } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();

      const dailyReport = await attendanceService.generateDailyAttendanceReport(
        targetDate,
        departmentId ? parseInt(departmentId as string) : undefined
      );

      const pendingRequests = await attendanceService.getPendingRegularizationRequests();

      const stats = {
        date: targetDate,
        summary: dailyReport.summary,
        pendingRequests: pendingRequests.length,
        recentActivity: dailyReport.attendances
          .slice(0, 10)
          .map(attendance => ({
            id: attendance.id,
            employeeName: attendance.employee.name,
            action: attendance.checkOut ? 'Checked Out' : 'Checked In',
            time: attendance.checkOut || attendance.checkIn,
            status: attendance.status
          }))
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('❌ Get attendance dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard stats'
      });
    }
  }
}

export { AttendanceController };
export const attendanceController = new AttendanceController();