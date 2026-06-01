"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controller/dashboard/dashboard.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const dashboardController = new dashboard_controller_1.DashboardController();
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
router.get('/stats', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), dashboardController.getDashboardStats);
router.post('/seed', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), dashboardController.seedDatabase);
/**
 * @swagger
 * /api/dashboard/admin-stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin-stats', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.ADMIN), dashboardController.getAdminDashboardStats);
router.get('/employee', auth_middleware_1.authenticateToken, dashboardController.getEmployeeDashboard);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
router.get('/debug', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), dashboardController.debugDatabaseContents);
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
router.get('/activity', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), dashboardController.getRecentActivity);
exports.default = router;
