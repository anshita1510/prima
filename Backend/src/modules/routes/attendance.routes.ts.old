import { Router } from 'express';
import { attendanceController } from '../controller/attendance/attendance.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Personal Attendance Routes (All authenticated users)
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);
router.get('/history/:employeeId', attendanceController.getPersonalAttendanceHistory);
router.post('/regularization-request', attendanceController.submitRegularizationRequest);

// Employee Management Routes (Admin and Manager only)
router.get('/employees', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.getAllEmployeeAttendance
);

router.post('/correction', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.performManualAttendanceCorrection
);

router.get('/requests/pending', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.getPendingRegularizationRequests
);

router.put('/requests/:requestId/approve', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.approveRegularizationRequest
);

router.put('/requests/:requestId/reject', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.rejectRegularizationRequest
);

// Reporting Routes (Admin and Manager only)
router.get('/reports/daily', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.generateDailyAttendanceReport
);

router.get('/reports/monthly', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.generateMonthlyAttendanceReport
);

// Audit Routes (Admin only)
router.get('/audit/trail', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN']), 
  attendanceController.getAuditTrail
);

// Dashboard Routes (Admin and Manager only)
router.get('/dashboard-stats', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.getAttendanceDashboardStats
);

router.get('/dashboard/stats', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  attendanceController.getAttendanceDashboardStats
);

export default router;