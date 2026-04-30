import { Router } from 'express';
import { getAnalyticsData, getDetailedAnalytics } from '../controller/analytics/analytics.controller';
import { authenticateToken, authorize } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/analytics/data:
 *   get:
 *     summary: Get analytics data for charts (SuperAdmin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *         description: Time period for analytics data
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                     userRegistrations:
 *                       type: array
 *                     companyRegistrations:
 *                       type: array
 *                     roleDistribution:
 *                       type: array
 *                     activityTrends:
 *                       type: array
 *       403:
 *         description: Access denied - SuperAdmin required
 *       401:
 *         description: Unauthorized
 */
router.get('/data', authenticateToken, authorize(Role.SUPER_ADMIN), getAnalyticsData);

/**
 * @swagger
 * /api/analytics/detailed:
 *   get:
 *     summary: Get detailed analytics for a specific metric (SuperAdmin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *           enum: [users, companies, roles]
 *         description: Metric to get detailed analytics for
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *         description: Time period for analytics data
 *     responses:
 *       200:
 *         description: Detailed analytics data
 *       403:
 *         description: Access denied - SuperAdmin required
 *       401:
 *         description: Unauthorized
 */
router.get('/detailed', authenticateToken, authorize(Role.SUPER_ADMIN), getDetailedAnalytics);

export default router;