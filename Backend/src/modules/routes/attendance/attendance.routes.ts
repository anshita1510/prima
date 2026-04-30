// src/routes/attendance.routes.ts
import { Router } from 'express';
import { AttendanceController } from '../../controller/attendance/attendance.controller';
import { validateBody, validateQuery } from '../../../middlewares/validation.middleware';
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { requireAnyRole } from '../../../middlewares/role.middleware';
import { Role } from '@prisma/client';
import { 
  CheckInSchema, 
  CheckOutSchema, 
  MarkAttendanceSchema,
  GetCalendarQuerySchema
} from '../../dto/attendance/attendance.dto';

const router = Router();
const attendanceController = new AttendanceController();

// Apply authentication middleware to all routes (using authenticateToken for employeeId)
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints
 */

// Personal Attendance Routes (All authenticated users)
/**
 * @swagger
 * /api/attendance/my-check-in:
 *   post:
 *     summary: Check in for the day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 example: "Office"
 *               latitude:
 *                 type: number
 *                 example: 28.7041
 *               longitude:
 *                 type: number
 *                 example: 77.1025
 *     responses:
 *       200:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Checked in successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Already checked in
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/my-check-in', 
  (req, res) => attendanceController.checkIn(req, res)
);

/**
 * @swagger
 * /api/attendance/my-check-out:
 *   post:
 *     summary: Check out for the day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 example: "Office"
 *     responses:
 *       200:
 *         description: Check-out successful
 *       400:
 *         description: Not checked in yet
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/my-check-out', 
  (req, res) => attendanceController.checkOut(req, res)
);

/**
 * @swagger
 * /api/attendance/my-stats:
 *   get:
 *     summary: Get personal attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal attendance stats retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my-stats',
  (req, res) => attendanceController.getAttendanceDashboardStats(req, res)
);

/**
 * @swagger
 * /api/attendance/my-logs:
 *   get:
 *     summary: Get personal attendance history/logs
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for logs
 *     responses:
 *       200:
 *         description: Attendance logs retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my-logs',
  (req, res) => attendanceController.getPersonalAttendanceHistory(req, res)
);

/**
 * @swagger
 * /api/attendance/my-team-stats:
 *   get:
 *     summary: Get team attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team attendance stats retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my-team-stats',
  (req, res) => attendanceController.getAttendanceDashboardStats(req, res)
);

/**
 * @swagger
 * /api/attendance/my-today:
 *   get:
 *     summary: Get today's attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's attendance retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my-today',
  (req, res) => attendanceController.getPersonalAttendanceHistory(req, res)
);

/**
 * @swagger
 * /api/attendance/regularization-request:
 *   post:
 *     summary: Submit attendance regularization request
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - reason
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-15"
 *               reason:
 *                 type: string
 *                 example: "Forgot to check in"
 *               checkInTime:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               checkOutTime:
 *                 type: string
 *                 format: time
 *                 example: "18:00"
 *     responses:
 *       201:
 *         description: Regularization request submitted
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/regularization-request', 
  (req, res) => attendanceController.submitRegularizationRequest(req, res)
);

// Admin/Manager Routes - Check-in/Check-out for specific employees
/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     summary: Admin - Check in employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: "emp123"
 *               location:
 *                 type: string
 *                 example: "Office"
 *     responses:
 *       200:
 *         description: Employee checked in
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/check-in', 
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN),
  validateBody(CheckInSchema),
  (req, res) => attendanceController.checkIn(req, res)
);

/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     summary: Admin - Check out employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: "emp123"
 *     responses:
 *       200:
 *         description: Employee checked out
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/check-out', 
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN),
  validateBody(CheckOutSchema),
  (req, res) => attendanceController.checkOut(req, res)
);

// Employee Management Routes (Admin and Manager only)
/**
 * @swagger
 * /api/attendance/employees:
 *   get:
 *     summary: Get all employee attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PRESENT, ABSENT, HALF_DAY, LEAVE]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Employee attendance list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/employees', 
  requireAnyRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
  (req, res) => attendanceController.getAllEmployeeAttendance(req, res)
);

// Dashboard Routes (Admin and Manager only)
/**
 * @swagger
 * /api/attendance/dashboard-stats:
 *   get:
 *     summary: Get attendance dashboard statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/dashboard-stats', 
  requireAnyRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
  (req, res) => attendanceController.getAttendanceDashboardStats(req, res)
);

/**
 * @swagger
 * /api/attendance/stats/{employeeId}:
 *   get:
 *     summary: Get specific employee attendance stats
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee stats retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/stats/:employeeId',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.getAttendanceDashboardStats(req, res)
);

/**
 * @swagger
 * /api/attendance/logs/{employeeId}:
 *   get:
 *     summary: Get specific employee attendance logs
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Employee logs retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/logs/:employeeId',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.getPersonalAttendanceHistory(req, res)
);

/**
 * @swagger
 * /api/attendance/team-stats/{departmentId}:
 *   get:
 *     summary: Get department/team attendance stats
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Team stats retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/team-stats/:departmentId',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.getAttendanceDashboardStats(req, res)
);

/**
 * @swagger
 * /api/attendance/today/{employeeId}:
 *   get:
 *     summary: Get employee's today attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Today's attendance retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/today/:employeeId',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.getPersonalAttendanceHistory(req, res)
);

/**
 * @swagger
 * /api/attendance/history/{employeeId}:
 *   get:
 *     summary: Get employee attendance history
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Attendance history retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/history/:employeeId', 
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.getPersonalAttendanceHistory(req, res)
);

/**
 * @swagger
 * /api/attendance/calendar/{employeeId}:
 *   get:
 *     summary: Get employee monthly attendance calendar
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year
 *     responses:
 *       200:
 *         description: Monthly calendar retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/calendar/:employeeId',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  validateQuery(GetCalendarQuerySchema),
  (req, res) => attendanceController.generateMonthlyAttendanceReport(req, res)
);

// Manual Attendance Correction (Admin only)
/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     summary: Manual attendance correction (Admin only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - date
 *               - status
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: "emp123"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-15"
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, HALF_DAY, LEAVE]
 *                 example: "PRESENT"
 *               checkInTime:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               checkOutTime:
 *                 type: string
 *                 format: time
 *                 example: "18:00"
 *               reason:
 *                 type: string
 *                 example: "Manual correction by admin"
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/mark',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN),
  validateBody(MarkAttendanceSchema),
  (req, res) => attendanceController.performManualAttendanceCorrection(req, res)
);

// Regularization Request Management (Admin and Manager)
/**
 * @swagger
 * /api/attendance/regularization-requests/pending:
 *   get:
 *     summary: Get pending regularization requests
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       reason:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [PENDING, APPROVED, REJECTED]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/regularization-requests/pending',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.getPendingRegularizationRequests(req, res)
);

/**
 * @swagger
 * /api/attendance/regularization-requests/{requestId}/approve:
 *   post:
 *     summary: Approve regularization request
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Regularization request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Approved by manager"
 *     responses:
 *       200:
 *         description: Request approved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 *       404:
 *         description: Request not found
 */
router.post(
  '/regularization-requests/:requestId/approve',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.approveRegularizationRequest(req, res)
);

/**
 * @swagger
 * /api/attendance/regularization-requests/{requestId}/reject:
 *   post:
 *     summary: Reject regularization request
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Regularization request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Insufficient reason provided"
 *     responses:
 *       200:
 *         description: Request rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 *       404:
 *         description: Request not found
 */
router.post(
  '/regularization-requests/:requestId/reject',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.rejectRegularizationRequest(req, res)
);

// Reporting Routes (Admin and Manager)
/**
 * @swagger
 * /api/attendance/reports/daily:
 *   get:
 *     summary: Generate daily attendance report
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Report date (defaults to today)
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Daily report generated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/reports/daily',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.generateDailyAttendanceReport(req, res)
);

/**
 * @swagger
 * /api/attendance/reports/monthly:
 *   get:
 *     summary: Generate monthly attendance report
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Monthly report generated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.get(
  '/reports/monthly',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER),
  (req, res) => attendanceController.generateMonthlyAttendanceReport(req, res)
);

// Audit Trail (Admin only)
/**
 * @swagger
 * /api/attendance/audit-trail:
 *   get:
 *     summary: Get attendance audit trail (Admin only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CHECK_IN, CHECK_OUT, MANUAL_CORRECTION, REGULARIZATION]
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: Audit trail retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/audit-trail',
  requireAnyRole(Role.ADMIN, Role.SUPER_ADMIN),
  (req, res) => attendanceController.getAuditTrail(req, res)
);

// Auto-checkout Routes (System/Admin only)
/**
 * @swagger
 * /api/attendance/auto-checkout/trigger:
 *   post:
 *     summary: Manually trigger auto-checkout for all employees (Admin only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Auto-checkout triggered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 checkedOutCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/auto-checkout/trigger', 
  requireAnyRole(Role.SUPER_ADMIN, Role.ADMIN), 
  require('../../controller/attendance/autoCheckout.controller').autoCheckoutController.triggerAutoCheckout
);

/**
 * @swagger
 * /api/attendance/auto-checkout/scheduled:
 *   post:
 *     summary: Scheduled auto-checkout (System cron job)
 *     tags: [Attendance]
 *     description: This endpoint is called by the system cron job at 6:30 PM daily
 *     responses:
 *       200:
 *         description: Scheduled auto-checkout completed
 *       500:
 *         description: Auto-checkout failed
 */
router.post(
  '/auto-checkout/scheduled', 
  require('../../controller/attendance/autoCheckout.controller').autoCheckoutController.scheduledAutoCheckout
);

export default router;
