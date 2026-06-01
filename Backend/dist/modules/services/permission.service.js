"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
class PermissionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Check if user can create/manage projects based on role and designation
     */
    canManageProjects(role, designation) {
        // ADMIN and SUPER_ADMIN can always manage projects
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            return true;
        }
        // TECH_LEAD and MANAGER designations can manage projects for their teams
        if (designation === 'TECH_LEAD' || designation === 'MANAGER') {
            return true;
        }
        return false;
    }
    /**
     * Check if user has read-only access to all projects (HR, DIRECTOR)
     */
    hasGlobalReadAccess(role, designation) {
        // ADMIN and SUPER_ADMIN have full access
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            return true;
        }
        // HR and DIRECTOR have read-only access to all projects
        if (designation === 'HR' || designation === 'DIRECTOR') {
            return true;
        }
        return false;
    }
    /**
     * Check project-level permissions
     */
    async checkProjectPermission(projectId, employeeId, requiredPermission) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                user: true,
                ownedProjects: { where: { id: projectId } },
                projectRoles: {
                    where: { projectId, isActive: true },
                    include: { project: true }
                }
            }
        });
        if (!employee)
            return false;
        const { role, designation } = employee.user;
        // Global access check
        if (this.hasGlobalReadAccess(role, designation)) {
            return requiredPermission === 'READ' || this.canManageProjects(role, designation);
        }
        // Project owner always has full access
        if (employee.ownedProjects.length > 0) {
            return true;
        }
        // Check project-level role
        const projectRole = employee.projectRoles[0];
        if (!projectRole)
            return false;
        switch (requiredPermission) {
            case 'READ':
                return ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'].includes(projectRole.role);
            case 'WRITE':
                return ['OWNER', 'MANAGER', 'MEMBER'].includes(projectRole.role);
            case 'ADMIN':
                return ['OWNER', 'MANAGER'].includes(projectRole.role);
            default:
                return false;
        }
    }
    /**
     * Check task-level permissions
     */
    async checkTaskPermission(taskId, employeeId, requiredPermission) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: true,
                assignedTo: true,
                createdBy: true
            }
        });
        if (!task)
            return false;
        // Check project-level permission first
        const hasProjectPermission = await this.checkProjectPermission(task.projectId, employeeId, requiredPermission);
        if (hasProjectPermission)
            return true;
        // Task-specific permissions
        if (requiredPermission === 'READ') {
            // Can read if assigned to task or created the task
            return task.assignedToId === employeeId || task.createdById === employeeId;
        }
        if (requiredPermission === 'WRITE') {
            // Can write if assigned to task or created the task
            return task.assignedToId === employeeId || task.createdById === employeeId;
        }
        return false;
    }
    /**
     * Get user's accessible projects based on role and permissions
     */
    async getAccessibleProjects(employeeId) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                user: true,
                ownedProjects: { select: { id: true } },
                projectRoles: {
                    where: { isActive: true },
                    select: { projectId: true }
                }
            }
        });
        if (!employee) {
            return { canViewAll: false, canManageAll: false, projectIds: [] };
        }
        const { role, designation } = employee.user;
        const canViewAll = this.hasGlobalReadAccess(role, designation);
        const canManageAll = this.canManageProjects(role, designation);
        if (canViewAll) {
            return { canViewAll: true, canManageAll, projectIds: [] };
        }
        // Get specific project IDs user has access to
        const ownedProjectIds = employee.ownedProjects.map(p => p.id);
        const memberProjectIds = employee.projectRoles.map(pr => pr.projectId);
        const projectIds = [...new Set([...ownedProjectIds, ...memberProjectIds])];
        return { canViewAll: false, canManageAll: false, projectIds };
    }
    /**
     * Check if user can assign tasks to specific employee
     */
    async canAssignTaskTo(assignerId, assigneeId, projectId) {
        // Check if assigner has WRITE permission on project
        const canManageProject = await this.checkProjectPermission(projectId, assignerId, 'WRITE');
        if (!canManageProject)
            return false;
        // Check if assignee has access to the project
        const canAssigneeAccess = await this.checkProjectPermission(projectId, assigneeId, 'READ');
        return canAssigneeAccess;
    }
    /**
     * Get notification recipients based on project and task context
     */
    async getNotificationRecipients(projectId, taskId, includeRoles = ['OWNER', 'MANAGER', 'MEMBER']) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: true,
                projectRoles: {
                    where: {
                        isActive: true,
                        role: { in: includeRoles }
                    },
                    include: { employee: true }
                }
            }
        });
        if (!project)
            return [];
        const recipients = new Set();
        // Always include project owner
        recipients.add(project.ownerId);
        // Include project members with specified roles
        project.projectRoles.forEach(pr => {
            recipients.add(pr.employeeId);
        });
        // If task-specific, include task assignee and creator
        if (taskId) {
            const task = await this.prisma.task.findUnique({
                where: { id: taskId },
                select: { assignedToId: true, createdById: true }
            });
            if (task) {
                if (task.assignedToId)
                    recipients.add(task.assignedToId);
                recipients.add(task.createdById);
            }
        }
        return Array.from(recipients);
    }
}
exports.PermissionService = PermissionService;
