"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = exports.AttendanceController = void 0;
const attendanceService_1 = require("../../services/attendanceService");
class AttendanceController {
    // Personal Attendance Endpoints
    async checkIn(req, res) {
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
            const attendance = await attendanceService_1.attendanceService.checkIn({
                employeeId,
                location,
                deviceInfo
            }, req);
            res.status(200).json({
                success: true,
                message: 'Check-in successful',
                data: attendance
            });
        }
        catch (error) {
            console.error('❌ Check-in error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Check-in failed'
            });
        }
    }
    async checkOut(req, res) {
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
            const attendance = await attendanceService_1.attendanceService.checkOut({
                employeeId,
                location,
                deviceInfo
            }, req);
            res.status(200).json({
                success: true,
                message: 'Check-out successful',
                data: attendance
            });
        }
        catch (error) {
            console.error('❌ Check-out error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Check-out failed'
            });
        }
    }
    async getPersonalAttendanceHistory(req, res) {
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
                }
                else {
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
                const todayRecord = await attendanceService_1.attendanceService.getTodayAttendanceRecord(employeeId);
                return res.status(200).json({
                    success: true,
                    data: todayRecord
                });
            }
            else {
                // Get full history
                history = await attendanceService_1.attendanceService.getPersonalAttendanceHistory(employeeId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            }
            res.status(200).json({
                success: true,
                data: history
            });
        }
        catch (error) {
            console.error('❌ Get attendance history error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch attendance history'
            });
        }
    }
    async submitRegularizationRequest(req, res) {
        try {
            const { employeeId, attendanceId, requestType, reason, proposedCheckIn, proposedCheckOut, proposedStatus } = req.body;
            const request = await attendanceService_1.attendanceService.submitRegularizationRequest({
                employeeId,
                attendanceId,
                requestType: requestType,
                reason,
                proposedCheckIn: proposedCheckIn ? new Date(proposedCheckIn) : undefined,
                proposedCheckOut: proposedCheckOut ? new Date(proposedCheckOut) : undefined,
                proposedStatus: proposedStatus ? proposedStatus : undefined
            }, req);
            res.status(201).json({
                success: true,
                message: 'Regularization request submitted successfully',
                data: request
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to submit regularization request'
            });
        }
    }
    // Employee Management Endpoints
    async getAllEmployeeAttendance(req, res) {
        try {
            const { date, departmentId } = req.query;
            const attendance = await attendanceService_1.attendanceService.getAllEmployeeAttendance(date ? new Date(date) : undefined, departmentId ? parseInt(departmentId) : undefined);
            res.status(200).json({
                success: true,
                data: attendance
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch employee attendance'
            });
        }
    }
    async performManualAttendanceCorrection(req, res) {
        try {
            const { attendanceId, checkIn, checkOut, status, reason, correctedBy } = req.body;
            const correctedAttendance = await attendanceService_1.attendanceService.performManualAttendanceCorrection({
                attendanceId,
                checkIn: checkIn ? new Date(checkIn) : undefined,
                checkOut: checkOut ? new Date(checkOut) : undefined,
                status: status ? status : undefined,
                reason,
                correctedBy
            }, req);
            res.status(200).json({
                success: true,
                message: 'Attendance corrected successfully',
                data: correctedAttendance
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to correct attendance'
            });
        }
    }
    async getPendingRegularizationRequests(req, res) {
        try {
            const { approverId } = req.query;
            const requests = await attendanceService_1.attendanceService.getPendingRegularizationRequests(approverId ? parseInt(approverId) : undefined);
            res.status(200).json({
                success: true,
                data: requests
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch pending requests'
            });
        }
    }
    async approveRegularizationRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { approverId } = req.body;
            const approvedRequest = await attendanceService_1.attendanceService.approveRegularizationRequest(requestId, approverId, req);
            res.status(200).json({
                success: true,
                message: 'Regularization request approved successfully',
                data: approvedRequest
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to approve request'
            });
        }
    }
    async rejectRegularizationRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { approverId, rejectionReason } = req.body;
            const rejectedRequest = await attendanceService_1.attendanceService.rejectRegularizationRequest(requestId, approverId, rejectionReason, req);
            res.status(200).json({
                success: true,
                message: 'Regularization request rejected successfully',
                data: rejectedRequest
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reject request'
            });
        }
    }
    // Reporting Endpoints
    async generateDailyAttendanceReport(req, res) {
        try {
            const { date, departmentId } = req.query;
            const report = await attendanceService_1.attendanceService.generateDailyAttendanceReport(date ? new Date(date) : new Date(), departmentId ? parseInt(departmentId) : undefined);
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate daily report'
            });
        }
    }
    async generateMonthlyAttendanceReport(req, res) {
        try {
            const { year, month, departmentId } = req.query;
            const report = await attendanceService_1.attendanceService.generateMonthlyAttendanceReport(parseInt(year), parseInt(month), departmentId ? parseInt(departmentId) : undefined);
            res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate monthly report'
            });
        }
    }
    // Audit Endpoints
    async getAuditTrail(req, res) {
        try {
            const { attendanceId, employeeId, startDate, endDate } = req.query;
            const auditTrail = await attendanceService_1.attendanceService.getAuditTrail(attendanceId ? parseInt(attendanceId) : undefined, employeeId ? parseInt(employeeId) : undefined, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            res.status(200).json({
                success: true,
                data: auditTrail
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch audit trail'
            });
        }
    }
    // Dashboard Statistics
    async getAttendanceDashboardStats(req, res) {
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
            const targetDate = date ? new Date(date) : new Date();
            const dailyReport = await attendanceService_1.attendanceService.generateDailyAttendanceReport(targetDate, departmentId ? parseInt(departmentId) : undefined);
            const pendingRequests = await attendanceService_1.attendanceService.getPendingRegularizationRequests();
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
        }
        catch (error) {
            console.error('❌ Get attendance dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch dashboard stats'
            });
        }
    }
}
exports.AttendanceController = AttendanceController;
exports.attendanceController = new AttendanceController();
