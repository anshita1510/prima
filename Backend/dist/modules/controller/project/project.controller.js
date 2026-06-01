"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = exports.ProjectController = void 0;
const projectService_1 = require("../../services/projectService");
const createProject_usecase_1 = require("../../usecase/project/createProject.usecase");
const authorization_util_1 = require("../../../shared/utils/authorization.util");
const db_1 = require("../../../config/db");
class ProjectController {
    constructor() {
        // Helper method to extract user context
        this.extractUserContext = (req) => {
            if (!req.user) {
                return null;
            }
            return {
                id: req.user.id,
                employeeId: req.user.employeeId,
                role: req.user.role,
                designation: req.user.designation ?? undefined, // ✅ converts null → undefined
                isActive: req.user.isActive || true,
                companyId: req.user.companyId,
                departmentId: req.user.departmentId
            };
        };
        // Enhanced Project Creation with Authorization
        this.createProject = async (req, res) => {
            try {
                // Extract user context from authenticated request
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                // Check authorization
                const canCreate = await authorization_util_1.AuthorizationUtil.canCreateProject(userContext);
                if (!canCreate) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to create projects',
                        error: 'PERMISSION_DENIED',
                        requiredPermissions: ['project:create'],
                        userRole: userContext.role,
                        userDesignation: userContext.designation
                    });
                }
                // Prepare request data
                const { name, description, code, companyId, departmentId, startDate, endDate, budget, status, teamMembers } = req.body;
                const createProjectRequest = {
                    name,
                    description,
                    code,
                    companyId: userContext.companyId, // Use non-null assertion as it's validated by auth
                    departmentId: userContext.departmentId,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    budget: budget ? parseFloat(budget) : undefined,
                    status: status || 'PLANNING',
                    teamMembers: teamMembers || []
                };
                // Execute use case
                const createProjectUsecase = new createProject_usecase_1.CreateProjectUsecase();
                const result = await createProjectUsecase.execute(createProjectRequest, userContext);
                if (result.success) {
                    res.status(201).json({
                        success: true,
                        message: result.message,
                        data: result.data,
                        meta: {
                            createdBy: userContext.id,
                            createdAt: new Date().toISOString(),
                            permissions: await authorization_util_1.AuthorizationUtil.getUserPermissions(userContext, {
                                projectId: result.data.id
                            })
                        }
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message,
                        errors: result.errors,
                        validationFailed: true
                    });
                }
            }
            catch (error) {
                console.error('Error in createProject controller:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message || 'Unknown error occurred'
                });
            }
        };
        // Enhanced Project Update with Authorization
        this.updateProject = async (req, res) => {
            try {
                const { projectId } = req.params;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                // Check authorization for project update
                const canUpdate = await authorization_util_1.AuthorizationUtil.hasPermission('project:update', userContext, { projectId: parseInt(projectId) });
                if (!canUpdate) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to update this project',
                        error: 'PERMISSION_DENIED'
                    });
                }
                const updateData = req.body;
                // Convert date strings to Date objects
                if (updateData.startDate)
                    updateData.startDate = new Date(updateData.startDate);
                if (updateData.endDate)
                    updateData.endDate = new Date(updateData.endDate);
                if (updateData.budget)
                    updateData.budget = parseFloat(updateData.budget);
                if (updateData.progressPercentage)
                    updateData.progressPercentage = parseInt(updateData.progressPercentage);
                const project = await projectService_1.projectService.updateProject(parseInt(projectId), updateData, req);
                res.status(200).json({
                    success: true,
                    message: 'Project updated successfully',
                    data: project,
                    meta: {
                        updatedBy: userContext.id,
                        updatedAt: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update project'
                });
            }
        };
        this.getProject = async (req, res) => {
            try {
                const { projectId } = req.params;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                // Check view permission
                const canView = await authorization_util_1.AuthorizationUtil.hasPermission('project:view', userContext, { projectId: parseInt(projectId) });
                if (!canView) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to view this project',
                        error: 'PERMISSION_DENIED'
                    });
                }
                const project = await projectService_1.projectService.getProjectById(parseInt(projectId));
                // Get user permissions for this project
                const userPermissions = await authorization_util_1.AuthorizationUtil.getUserPermissions(userContext, { projectId: parseInt(projectId) });
                res.status(200).json({
                    success: true,
                    data: project,
                    meta: {
                        userPermissions,
                        canEdit: userPermissions.includes('project:update'),
                        canDelete: userPermissions.includes('project:delete'),
                        canManageTeam: userPermissions.includes('project:assign_members')
                    }
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: error.message || 'Project not found'
                });
            }
        };
        this.getAllProjects = async (req, res) => {
            try {
                const { companyId, departmentId, ownerId } = req.query;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                const projects = await projectService_1.projectService.getAllProjects(userContext.companyId, departmentId ? parseInt(departmentId) : undefined, ownerId ? parseInt(ownerId) : undefined);
                // Filter projects based on user permissions
                const accessibleProjects = [];
                for (const project of projects) {
                    const canView = await authorization_util_1.AuthorizationUtil.hasPermission('project:view', userContext, { projectId: project.id });
                    if (canView) {
                        accessibleProjects.push(project);
                    }
                }
                res.status(200).json({
                    success: true,
                    data: accessibleProjects,
                    meta: {
                        total: accessibleProjects.length,
                        filtered: projects.length - accessibleProjects.length,
                        userRole: userContext.role
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch projects'
                });
            }
        };
        this.deleteProject = async (req, res) => {
            try {
                const { projectId } = req.params;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                // Check delete permission
                const canDelete = await authorization_util_1.AuthorizationUtil.hasPermission('project:delete', userContext, { projectId: parseInt(projectId) });
                if (!canDelete) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to delete this project',
                        error: 'PERMISSION_DENIED'
                    });
                }
                const project = await projectService_1.projectService.deleteProject(parseInt(projectId), req);
                res.status(200).json({
                    success: true,
                    message: 'Project deleted successfully',
                    data: project,
                    meta: {
                        deletedBy: userContext.id,
                        deletedAt: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to delete project'
                });
            }
        };
        // Team Member Management Endpoints with Authorization
        this.assignTeamMember = async (req, res) => {
            try {
                const { projectId } = req.params;
                const { employeeId, role } = req.body;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                if (!employeeId || !role) {
                    return res.status(400).json({
                        success: false,
                        message: 'Employee ID and role are required'
                    });
                }
                // Check permission to assign team members
                const canAssign = await authorization_util_1.AuthorizationUtil.hasPermission('project:assign_members', userContext, { projectId: parseInt(projectId) });
                if (!canAssign) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to assign team members',
                        error: 'PERMISSION_DENIED'
                    });
                }
                const projectMember = await projectService_1.projectService.assignTeamMember({
                    projectId: parseInt(projectId),
                    employeeId: parseInt(employeeId),
                    role: role
                }, req);
                res.status(201).json({
                    success: true,
                    message: 'Team member assigned successfully',
                    data: projectMember,
                    meta: {
                        assignedBy: userContext.id,
                        assignedAt: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to assign team member'
                });
            }
        };
        this.removeTeamMember = async (req, res) => {
            try {
                const { projectId, employeeId } = req.params;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                // Check permission to remove team members
                const canRemove = await authorization_util_1.AuthorizationUtil.hasPermission('project:remove_members', userContext, { projectId: parseInt(projectId) });
                if (!canRemove) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to remove team members',
                        error: 'PERMISSION_DENIED'
                    });
                }
                const projectMember = await projectService_1.projectService.removeTeamMember(parseInt(projectId), parseInt(employeeId), req);
                res.status(200).json({
                    success: true,
                    message: 'Team member removed successfully',
                    data: projectMember,
                    meta: {
                        removedBy: userContext.id,
                        removedAt: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to remove team member'
                });
            }
        };
        this.updateTeamMemberRole = async (req, res) => {
            try {
                const { projectId, employeeId } = req.params;
                const { role } = req.body;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                if (!role) {
                    return res.status(400).json({
                        success: false,
                        message: 'Role is required'
                    });
                }
                // Check permission to manage team members
                const canManage = await authorization_util_1.AuthorizationUtil.hasPermission('project:assign_members', userContext, { projectId: parseInt(projectId) });
                if (!canManage) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to update team member roles',
                        error: 'PERMISSION_DENIED'
                    });
                }
                const projectMember = await projectService_1.projectService.updateTeamMemberRole(parseInt(projectId), parseInt(employeeId), role, req);
                res.status(200).json({
                    success: true,
                    message: 'Team member role updated successfully',
                    data: projectMember,
                    meta: {
                        updatedBy: userContext.id,
                        updatedAt: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update team member role'
                });
            }
        };
        this.getProjectTeamMembers = async (req, res) => {
            try {
                const { projectId } = req.params;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                // Check view permission
                const canView = await authorization_util_1.AuthorizationUtil.hasPermission('project:view', userContext, { projectId: parseInt(projectId) });
                if (!canView) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to view team members',
                        error: 'PERMISSION_DENIED'
                    });
                }
                const teamMembers = await projectService_1.projectService.getProjectTeamMembers(parseInt(projectId));
                res.status(200).json({
                    success: true,
                    data: teamMembers
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch team members'
                });
            }
        };
        // Task Management Endpoints (keeping existing functionality)
        this.createTask = async (req, res) => {
            try {
                const { title, description, code, projectId, assignedToId, createdById, status, priority, dueDate, startDate, estimatedHours, milestoneId, parentTaskId } = req.body;
                const userContext = req.user;
                if (!userContext) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                // ✅ FIX: Get createdById from body OR employeeId from user context
                const finalCreatedById = createdById
                    ? parseInt(createdById.toString())
                    : userContext.employeeId;
                console.log('📝 createTask called');
                console.log('title:', title);
                console.log('projectId:', projectId);
                console.log('userContext.employeeId:', userContext.employeeId);
                console.log('finalCreatedById:', finalCreatedById);
                if (!title) {
                    return res.status(400).json({ success: false, message: 'Task title is required' });
                }
                if (!projectId) {
                    return res.status(400).json({ success: false, message: 'Project ID is required' });
                }
                // ✅ FIX: If employeeId is missing, fetch it from DB
                let resolvedCreatedById = finalCreatedById;
                if (!resolvedCreatedById) {
                    console.log('⚠️ employeeId missing from token, fetching from DB...');
                    const employee = await db_1.prisma.employee.findUnique({
                        where: { userId: userContext.id },
                        select: { id: true }
                    });
                    if (!employee) {
                        return res.status(400).json({
                            success: false,
                            message: 'Employee record not found for authenticated user',
                            code: 'NO_EMPLOYEE_RECORD'
                        });
                    }
                    resolvedCreatedById = employee.id;
                    console.log('✅ Resolved employeeId from DB:', resolvedCreatedById);
                }
                if (!resolvedCreatedById) {
                    return res.status(400).json({
                        success: false,
                        message: 'Unable to determine creator ID',
                        code: 'INVALID_CREATOR'
                    });
                }
                const task = await projectService_1.projectService.createTask({
                    title,
                    description,
                    code,
                    projectId: parseInt(projectId),
                    assignedToId: assignedToId ? parseInt(assignedToId) : undefined,
                    createdById: userContext.employeeId, // Always use authenticatd employeeId
                    status: status,
                    priority: priority,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
                    milestoneId: milestoneId ? parseInt(milestoneId) : undefined,
                    parentTaskId: parentTaskId ? parseInt(parentTaskId) : undefined
                }, req);
                return res.status(201).json({
                    success: true,
                    message: 'Task created successfully',
                    data: task
                });
            }
            catch (error) {
                console.error('❌ Error creating task:', error);
                console.error('Error code:', error.code);
                console.error('Error meta:', error.meta);
                if (error.code === 'P2003') {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid project, employee, or milestone reference',
                        details: error.meta
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to create task'
                });
            }
        };
        this.updateTask = async (req, res) => {
            try {
                const { taskId } = req.params;
                const updateData = req.body;
                // Convert data types
                if (updateData.assignedToId)
                    updateData.assignedToId = parseInt(updateData.assignedToId);
                if (updateData.dueDate)
                    updateData.dueDate = new Date(updateData.dueDate);
                if (updateData.startDate)
                    updateData.startDate = new Date(updateData.startDate);
                if (updateData.estimatedHours)
                    updateData.estimatedHours = parseInt(updateData.estimatedHours);
                if (updateData.actualHours)
                    updateData.actualHours = parseInt(updateData.actualHours);
                if (updateData.progressPercentage)
                    updateData.progressPercentage = parseInt(updateData.progressPercentage);
                const task = await projectService_1.projectService.updateTask(parseInt(taskId), updateData, req);
                res.status(200).json({
                    success: true,
                    message: 'Task updated successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update task'
                });
            }
        };
        this.getProjectTasks = async (req, res) => {
            try {
                const { projectId } = req.params;
                const { status, assignedToId } = req.query;
                const tasks = await projectService_1.projectService.getProjectTasks(parseInt(projectId), status, assignedToId ? parseInt(assignedToId) : undefined);
                res.status(200).json({
                    success: true,
                    data: tasks
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch tasks'
                });
            }
        };
        this.deleteTask = async (req, res) => {
            try {
                const { taskId } = req.params;
                const task = await projectService_1.projectService.deleteTask(parseInt(taskId), req);
                res.status(200).json({
                    success: true,
                    message: 'Task deleted successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to delete task'
                });
            }
        };
        // Dashboard and Analytics Endpoints
        this.getDashboardStats = async (req, res) => {
            try {
                const { companyId, departmentId } = req.query;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                const stats = await projectService_1.projectService.getProjectDashboardStats(userContext.companyId, departmentId ? parseInt(departmentId) : undefined);
                res.status(200).json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch dashboard stats'
                });
            }
        };
        // Utility Endpoints
        this.getAvailableEmployees = async (req, res) => {
            try {
                const { companyId, departmentId } = req.query;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                const finalCompanyId = companyId ? parseInt(companyId) : userContext.companyId;
                if (!finalCompanyId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Company ID is required'
                    });
                }
                const employees = await authorization_util_1.AuthorizationUtil.getAssignableUsers(userContext.companyId, departmentId ? parseInt(departmentId) : undefined);
                res.status(200).json({
                    success: true,
                    data: employees
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to fetch available employees'
                });
            }
        };
        // Permission Check Endpoint
        this.checkPermissions = async (req, res) => {
            try {
                const { projectId } = req.params;
                const userContext = this.extractUserContext(req);
                if (!userContext) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required',
                        error: 'UNAUTHORIZED'
                    });
                }
                const resourceContext = projectId ? { projectId: parseInt(projectId) } : undefined;
                const permissions = await authorization_util_1.AuthorizationUtil.getUserPermissions(userContext, resourceContext);
                res.status(200).json({
                    success: true,
                    data: {
                        permissions,
                        userRole: userContext.role,
                        userDesignation: userContext.designation,
                        canCreateProject: permissions.includes('project:create'),
                        canUpdateProject: permissions.includes('project:update'),
                        canDeleteProject: permissions.includes('project:delete'),
                        canManageTeam: permissions.includes('project:assign_members')
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to check permissions'
                });
            }
        };
    }
}
exports.ProjectController = ProjectController;
exports.projectController = new ProjectController();
