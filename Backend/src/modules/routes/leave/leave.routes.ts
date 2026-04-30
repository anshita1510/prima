import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave,
  getMyLeaves,
  getApprovableLeaves,
  getLeaveStatistics,
  getLeaveNotifications,
  markLeaveNotificationsRead,
  checkApprovalPermission
} from "../../controller/leave/leave.controller";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - startDate
 *               - endDate
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CASUAL, SICK, EARNED, UNPAID]
 *                 example: CASUAL
 *               reason:
 *                 type: string
 *                 example: Family function
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-17
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
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
 *                   example: Leave application submitted successfully
 *                 leave:
 *                   $ref: '#/components/schemas/Leave'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.post("/", createLeave);

/**
 * @swagger
 * /api/leaves/my-leaves:
 *   get:
 *     summary: Get current user's leave applications
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's leave applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 leaves:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leave'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized
 */
router.get("/my-leaves", getMyLeaves);

// Statistics route
router.get("/statistics", getLeaveStatistics);

// Approval routes
router.get("/approvable", getApprovableLeaves);
router.get("/:id/can-approve", checkApprovalPermission);

// Notification routes
router.get("/notifications", getLeaveNotifications);
router.post("/notifications/mark-read", markLeaveNotificationsRead);

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get all leave applications (Admin/Manager only)
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all leave applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 leaves:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leave'
 *                 count:
 *                   type: integer
 *                   example: 25
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/", getAllLeaves);

/**
 * @swagger
 * /api/leaves/{id}:
 *   get:
 *     summary: Get leave application by ID
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     responses:
 *       200:
 *         description: Leave application details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 leave:
 *                   $ref: '#/components/schemas/Leave'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Leave not found
 */
router.get("/:id", getLeaveById);

/**
 * @swagger
 * /api/leaves/{id}/status:
 *   patch:
 *     summary: Update leave status (Admin/Manager only)
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Leave status updated successfully
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
 *                   example: Leave status updated successfully
 *                 leave:
 *                   $ref: '#/components/schemas/Leave'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.patch("/:id/status", updateLeaveStatus);

/**
 * @swagger
 * /api/leaves/{id}:
 *   delete:
 *     summary: Delete leave application (Pending leaves only)
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     responses:
 *       200:
 *         description: Leave deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Only pending leaves can be deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Leave not found
 */
router.delete("/:id", deleteLeave);

export default router;
