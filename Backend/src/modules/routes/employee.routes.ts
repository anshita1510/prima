import { Router } from 'express';
import { employeeController } from '../controller/employee.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

// All routes require authentication with company context
router.use(authenticateToken);

// SPECIFIC ROUTES FIRST (before generic routes)

// Get all users (Admin, Super Admin) - MUST be before GET /
/**
 * @swagger
 * /api/employees/users/all:
 *   get:
 *     summary: Get all users (Admin/Super Admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved
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
 *                       email:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Super Admin only
 */
router.get(
  '/users/all',
  authorizeRoles(['SUPER_ADMIN', 'ADMIN']),
  employeeController.getAllUsers
);

// Get manager's team members (Manager) - MUST be before GET /
/**
 * @swagger
 * /api/employees/team/members:
 *   get:
 *     summary: Get manager's team members (Manager only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team members retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager only
 */
router.get(
  '/team/members',
  authorizeRoles(['MANAGER']),
  employeeController.getManagerTeamMembers
);

// Get unassigned employees (Manager) - MUST be before GET /
/**
 * @swagger
 * /api/employees/team/unassigned:
 *   get:
 *     summary: Get unassigned employees (Manager only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unassigned employees retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager only
 */
router.get(
  '/team/unassigned',
  authorizeRoles(['MANAGER']),
  employeeController.getUnassignedEmployees
);

// Get employee statistics (must be before /:employeeId)
/**
 * @swagger
 * /api/employees/{employeeId}/stats:
 *   get:
 *     summary: Get employee statistics
 *     tags: [Employees]
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
 *         description: Employee statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     pendingTasks:
 *                       type: integer
 *                     attendanceRate:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.get(
  '/:employeeId/stats',
  employeeController.getEmployeeStats
);

// GENERIC ROUTES AFTER SPECIFIC ROUTES

// Create new employee (Admin, Super Admin)
/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create new employee (Admin/Super Admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - departmentId
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@company.com"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               departmentId:
 *                 type: string
 *                 example: "dept123"
 *               role:
 *                 type: string
 *                 enum: [EMPLOYEE, MANAGER, ADMIN, SUPER_ADMIN]
 *                 example: "EMPLOYEE"
 *               designation:
 *                 type: string
 *                 example: "Software Engineer"
 *               joiningDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-15"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Super Admin only
 */
router.post(
  '/',
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']),
  employeeController.createEmployee
);

// Get all employees (Admin, Manager, Super Admin)
/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [EMPLOYEE, MANAGER, ADMIN, SUPER_ADMIN]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Employees list retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager/Super Admin only
 */
router.get(
  '/',
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']),
  employeeController.getAllEmployees
);

// Assign employee to manager (Manager)
/**
 * @swagger
 * /api/employees/team/assign/{employeeId}:
 *   post:
 *     summary: Assign employee to manager (Manager only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID to assign
 *     responses:
 *       200:
 *         description: Employee assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager only
 *       404:
 *         description: Employee not found
 */
router.post(
  '/team/assign/:employeeId',
  authorizeRoles(['MANAGER']),
  employeeController.assignEmployeeToManager
);

// Get employee by ID
/**
 * @swagger
 * /api/employees/{employeeId}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
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
 *         description: Employee details retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.get(
  '/:employeeId',
  employeeController.getEmployeeById
);

// Update employee (Admin, Super Admin)
/**
 * @swagger
 * /api/employees/{employeeId}:
 *   put:
 *     summary: Update employee (Admin/Super Admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               designation:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [EMPLOYEE, MANAGER, ADMIN, SUPER_ADMIN]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Super Admin only
 *       404:
 *         description: Employee not found
 */
router.put(
  '/:employeeId',
  authorizeRoles(['SUPER_ADMIN', 'ADMIN']),
  employeeController.updateEmployee
);

// Delete employee (Admin, Super Admin)
/**
 * @swagger
 * /api/employees/{employeeId}:
 *   delete:
 *     summary: Delete employee (Admin/Super Admin only)
 *     tags: [Employees]
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
 *         description: Employee deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Super Admin only
 *       404:
 *         description: Employee not found
 */
router.delete(
  '/:employeeId',
  authorizeRoles(['SUPER_ADMIN', 'ADMIN']),
  employeeController.deleteEmployee
);

export default router;
