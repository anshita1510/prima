import { Router } from 'express';
import { DashboardController } from '../controller/dashboard/dashboard.controller';
import { authenticateToken, authorize } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (SuperAdmin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalAdmins:
 *                       type: number
 *                     totalManagers:
 *                       type: number
 *                     totalEmployees:
 *                       type: number
 *                     totalCompanies:
 *                       type: number
 *                     totalProjects:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *                     pendingApprovals:
 *                       type: number
 *                     systemHealth:
 *                       type: number
 *       403:
 *         description: Access denied - SuperAdmin required
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateToken, authorize(Role.SUPER_ADMIN), dashboardController.getDashboardStats);
router.post('/seed', authenticateToken, authorize(Role.SUPER_ADMIN), dashboardController.seedDatabase);

/**
 * @swagger
 * /api/dashboard/admin-stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin-stats', authenticateToken, authorize(Role.ADMIN), dashboardController.getAdminDashboardStats);

/**
 * @swagger
 * /api/dashboard/debug:
 *   get:
 *     summary: Debug database contents (SuperAdmin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
/**
 * @swagger
 * /api/dashboard/test:
 *   get:
 *     summary: Test dashboard without authentication
 *     tags: [Dashboard]
 */
router.get('/test', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const totalUsers = await prisma.user.count();
    const totalCompanies = await prisma.company.count();

    res.json({
      success: true,
      message: 'Dashboard test endpoint',
      counts: {
        totalUsers,
        totalCompanies
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/debug', authenticateToken, authorize(Role.SUPER_ADMIN), dashboardController.debugDatabaseContents);

/**
 * @swagger
 * /api/dashboard/activity:
 *   get:
 *     summary: Get recent system activity (SuperAdmin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent system activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       user:
 *                         type: string
 *       403:
 *         description: Access denied - SuperAdmin required
 *       401:
 *         description: Unauthorized
 */
router.get('/activity', authenticateToken, authorize(Role.SUPER_ADMIN), dashboardController.getRecentActivity);

export default router;