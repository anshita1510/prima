"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../../controller/project/project.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const role_middleware_1 = require("../../../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Project Management Routes (Admin and Manager only)
router.post('/', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.createProject);
router.put('/:projectId', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.updateProject);
router.get('/:projectId', project_controller_1.projectController.getProject);
router.get('/', project_controller_1.projectController.getAllProjects);
router.delete('/:projectId', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.deleteProject);
// Team Member Management Routes (Admin and Manager only)
router.post('/:projectId/members', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.assignTeamMember);
router.delete('/:projectId/members/:employeeId', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.removeTeamMember);
router.put('/:projectId/members/:employeeId/role', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.updateTeamMemberRole);
router.get('/:projectId/members', project_controller_1.projectController.getProjectTeamMembers);
// Task Management Routes
router.post('/:projectId/tasks', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.createTask);
router.put('/tasks/:taskId', project_controller_1.projectController.updateTask);
router.get('/:projectId/tasks', project_controller_1.projectController.getProjectTasks);
router.delete('/tasks/:taskId', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.deleteTask);
// Dashboard and Analytics Routes
router.get('/dashboard/stats', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.getDashboardStats);
// Utility Routes
router.get('/utils/available-employees', (0, role_middleware_1.authorizeRoles)(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), project_controller_1.projectController.getAvailableEmployees);
// Permission Check Routes
router.get('/permissions/:projectId', project_controller_1.projectController.checkPermissions);
router.get('/permissions', project_controller_1.projectController.checkPermissions);
exports.default = router;
