import { Router } from 'express';
import { ProjectController } from '../controller/project/project.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const projectController = new ProjectController();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

// All routes require authentication
router.use(authenticate);

// ─────────────────────────────────────────────────
// Project CRUD routes
// ─────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Website Redesign"
 *               description:
 *                 type: string
 *                 example: "Complete redesign of company website"
 *               code:
 *                 type: string
 *                 example: "PRJ001"
 *               companyId:
 *                 type: integer
 *               departmentId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-15"
 *               budget:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED]
 *                 example: "PLANNING"
 *               teamMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     employeeId:
 *                       type: integer
 *                     role:
 *                       type: string
 *                       enum: [OWNER, MANAGER, MEMBER, VIEWER]
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', projectController.createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects (filtered by user permissions)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: integer
 *         description: Filter by company ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: integer
 *         description: Filter by owner employee ID
 *     responses:
 *       200:
 *         description: List of projects retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/dashboard:
 *   get:
 *     summary: Get project dashboard statistics
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', projectController.getDashboardStats);

/**
 * @swagger
 * /api/projects/employees:
 *   get:
 *     summary: Get available employees for project assignment
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Available employees retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/employees', projectController.getAvailableEmployees);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Project not found
 */
router.get('/:projectId', projectController.getProject);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: number
 *               progressPercentage:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Project not found
 */
router.put('/:projectId', projectController.updateProject);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Delete project (soft delete)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Project not found
 */
router.delete('/:projectId', projectController.deleteProject);

// ─────────────────────────────────────────────────
// Team Member Management routes
// ─────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   get:
 *     summary: Get project team members
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team members retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/:projectId/members', projectController.getProjectTeamMembers);

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   post:
 *     summary: Assign a team member to the project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - role
 *             properties:
 *               employeeId:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [OWNER, MANAGER, MEMBER, VIEWER]
 *     responses:
 *       201:
 *         description: Team member assigned
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/:projectId/members', projectController.assignTeamMember);

/**
 * @swagger
 * /api/projects/{projectId}/members/{employeeId}:
 *   put:
 *     summary: Update team member role
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [OWNER, MANAGER, MEMBER, VIEWER]
 *     responses:
 *       200:
 *         description: Role updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:projectId/members/:employeeId', projectController.updateTeamMemberRole);

/**
 * @swagger
 * /api/projects/{projectId}/members/{employeeId}:
 *   delete:
 *     summary: Remove a team member from the project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team member removed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:projectId/members/:employeeId', projectController.removeTeamMember);

// ─────────────────────────────────────────────────
// Task Management routes
// ─────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, CANCELLED]
 *       - in: query
 *         name: assignedToId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tasks retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/:projectId/tasks', projectController.getProjectTasks);

/**
 * @swagger
 * /api/projects/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               projectId:
 *                 type: integer
 *               assignedToId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, CANCELLED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               dueDate:
 *                 type: string
 *                 format: date
 *               startDate:
 *                 type: string
 *                 format: date
 *               estimatedHours:
 *                 type: integer
 *               milestoneId:
 *                 type: integer
 *               parentTaskId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/tasks', projectController.createTask);

/**
 * @swagger
 * /api/projects/tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.put('/tasks/:taskId', projectController.updateTask);

/**
 * @swagger
 * /api/projects/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/tasks/:taskId', projectController.deleteTask);

// ─────────────────────────────────────────────────
// Permissions route
// ─────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects/{projectId}/permissions:
 *   get:
 *     summary: Check user permissions for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permissions returned
 *       401:
 *         description: Unauthorized
 */
router.get('/:projectId/permissions', projectController.checkPermissions);

export default router;