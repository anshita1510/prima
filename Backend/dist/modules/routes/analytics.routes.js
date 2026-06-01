"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controller/analytics/analytics.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
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
router.get('/data', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), analytics_controller_1.getAnalyticsData);
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
router.get('/detailed', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN), analytics_controller_1.getDetailedAnalytics);
exports.default = router;
