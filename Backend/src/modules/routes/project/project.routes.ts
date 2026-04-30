import { Router } from 'express';
import { projectController } from '../../controller/project/project.controller';
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { authorizeRoles } from '../../../middlewares/role.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Project Management Routes (Admin and Manager only)
router.post('/', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.createProject
);

router.put('/:projectId', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.updateProject
);

router.get('/:projectId', 
  projectController.getProject
);

router.get('/', 
  projectController.getAllProjects
);

router.delete('/:projectId', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.deleteProject
);

// Team Member Management Routes (Admin and Manager only)
router.post('/:projectId/members', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.assignTeamMember
);

router.delete('/:projectId/members/:employeeId', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.removeTeamMember
);

router.put('/:projectId/members/:employeeId/role', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.updateTeamMemberRole
);

router.get('/:projectId/members', 
  projectController.getProjectTeamMembers
);

// Task Management Routes
router.post('/:projectId/tasks', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.createTask
);

router.put('/tasks/:taskId', 
  projectController.updateTask
);

router.get('/:projectId/tasks', 
  projectController.getProjectTasks
);

router.delete('/tasks/:taskId', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.deleteTask
);

// Dashboard and Analytics Routes
router.get('/dashboard/stats', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.getDashboardStats
);

// Utility Routes
router.get('/utils/available-employees', 
  authorizeRoles(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), 
  projectController.getAvailableEmployees
);

// Permission Check Routes
router.get('/permissions/:projectId', 
  projectController.checkPermissions
);

router.get('/permissions', 
  projectController.checkPermissions
);

export default router;