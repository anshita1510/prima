import { Role, Designation } from '@prisma/client';
import { 
  ALL_PERMISSIONS, 
  PermissionRule, 
  ROLE_HIERARCHY, 
  DESIGNATION_HIERARCHY 
} from '../../config/permissions.config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserContext {
  id: number;
  employeeId?: number;
  role: Role;
  designation?: string;
  isActive: boolean;
  companyId?: number;
  departmentId?: number;
}

export interface ResourceContext {
  projectId?: number;
  taskId?: number;
  resourceOwnerId?: number;
  projectManagerIds?: number[];
  projectMemberIds?: number[];
}

export class AuthorizationUtil {
  /**
   * Check if user has permission for a specific action
   */
  static async hasPermission(
    action: string, 
    user: UserContext, 
    resource?: ResourceContext
  ): Promise<boolean> {
    const permissionRule = ALL_PERMISSIONS[action];
    
    if (!permissionRule) {
      console.warn(`Permission rule not found for action: ${action}`);
      return false;
    }

    // Check role-based permissions
    if (permissionRule.roles && this.hasRolePermission(user.role, permissionRule.roles)) {
      return true;
    }

    // Check designation-based permissions
    if (permissionRule.designations && user.designation) {
      const userDesignation = user.designation as Designation;
      if (this.hasDesignationPermission(userDesignation, permissionRule.designations)) {
        return true;
      }
    }

    // Check custom conditions
    if (permissionRule.customConditions) {
      if (!resource) {
        // If no resource context, only check non-resource-specific conditions
        const nonResourceConditions = permissionRule.customConditions.filter(condition => 
          ['isActiveUser', 'hasCompanyAccess'].includes(condition)
        );
        if (nonResourceConditions.length > 0) {
          return await this.checkCustomConditions(nonResourceConditions, user, {});
        }
      } else {
        return await this.checkCustomConditions(
          permissionRule.customConditions, 
          user, 
          resource
        );
      }
    }

    return false;
  }

  /**
   * Check role-based permissions with hierarchy
   */
  private static hasRolePermission(userRole: Role, allowedRoles: Role[]): boolean {
    // Direct role match
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Hierarchy check - higher roles inherit lower role permissions
    const userRoleLevel = ROLE_HIERARCHY[userRole];
    return allowedRoles.some(role => {
      const requiredLevel = ROLE_HIERARCHY[role];
      return userRoleLevel >= requiredLevel;
    });
  }

  /**
   * Check designation-based permissions with hierarchy
   */
  private static hasDesignationPermission(
    userDesignation: Designation, 
    allowedDesignations: Designation[]
  ): boolean {
    // Direct designation match
    if (allowedDesignations.includes(userDesignation)) {
      return true;
    }

    // Hierarchy check
    const userDesignationLevel = DESIGNATION_HIERARCHY[userDesignation];
    return allowedDesignations.some(designation => {
      const requiredLevel = DESIGNATION_HIERARCHY[designation];
      return userDesignationLevel >= requiredLevel;
    });
  }

  /**
   * Check custom conditions
   */
  private static async checkCustomConditions(
    conditions: string[], 
    user: UserContext, 
    resource: ResourceContext
  ): Promise<boolean> {
    for (const condition of conditions) {
      const hasCondition = await this.evaluateCondition(condition, user, resource);
      if (hasCondition) {
        return true;
      }
    }
    return false;
  }

  /**
   * Evaluate individual custom conditions
   */
  private static async evaluateCondition(
    condition: string, 
    user: UserContext, 
    resource: ResourceContext
  ): Promise<boolean> {
    switch (condition) {
      case 'isActiveUser':
        return user.isActive;

      case 'hasCompanyAccess':
        // User must have company access and company must be active
        if (!user.companyId) return false;
        if (!resource || !resource.projectId) return true; // Skip if no project context
        return await this.hasCompanyAccess(user.companyId, resource.projectId);

      case 'isProjectOwner':
        if (!resource.projectId || !user.employeeId) return false;
        return await this.isProjectOwner(resource.projectId, user.employeeId);

      case 'isProjectManager':
        if (!resource.projectId || !user.employeeId) return false;
        return await this.isProjectManager(resource.projectId, user.employeeId);

      case 'isProjectMember':
        if (!resource.projectId || !user.employeeId) return false;
        return await this.isProjectMember(resource.projectId, user.employeeId);

      case 'isTaskAssignee':
        if (!resource.taskId || !user.employeeId) return false;
        return await this.isTaskAssignee(resource.taskId, user.employeeId);

      case 'isTaskCreator':
        if (!resource.taskId || !user.employeeId) return false;
        return await this.isTaskCreator(resource.taskId, user.employeeId);

      default:
        console.warn(`Unknown condition: ${condition}`);
        return false;
    }
  }

  /**
   * Database queries for custom conditions
   */
  private static async hasCompanyAccess(userCompanyId: number, projectId?: number): Promise<boolean> {
    try {
      if (!projectId) return true; // No project context, allow
      
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { companyId: true }
      });
      
      return project?.companyId === userCompanyId;
    } catch (error) {
      console.error('Error checking company access:', error);
      return false;
    }
  }

  private static async isProjectOwner(projectId: number, employeeId: number): Promise<boolean> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
      });
      return project?.ownerId === employeeId;
    } catch (error) {
      console.error('Error checking project owner:', error);
      return false;
    }
  }

  private static async isProjectManager(projectId: number, employeeId: number): Promise<boolean> {
    try {
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          projectId_employeeId: {
            projectId,
            employeeId
          }
        },
        select: { role: true, isActive: true }
      });
      return projectMember !== null && 
             (projectMember.isActive ?? false) && 
             (projectMember.role === 'MANAGER' || projectMember.role === 'OWNER');
    } catch (error) {
      console.error('Error checking project manager:', error);
      return false;
    }
  }

  private static async isProjectMember(projectId: number, employeeId: number): Promise<boolean> {
    try {
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          projectId_employeeId: {
            projectId,
            employeeId
          }
        },
        select: { isActive: true }
      });
      return projectMember?.isActive ?? false;
    } catch (error) {
      console.error('Error checking project member:', error);
      return false;
    }
  }

  private static async isTaskAssignee(taskId: number, employeeId: number): Promise<boolean> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { assignedToId: true }
      });
      return task?.assignedToId === employeeId;
    } catch (error) {
      console.error('Error checking task assignee:', error);
      return false;
    }
  }

  private static async isTaskCreator(taskId: number, employeeId: number): Promise<boolean> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { createdById: true }
      });
      return task?.createdById === employeeId;
    } catch (error) {
      console.error('Error checking task creator:', error);
      return false;
    }
  }

  /**
   * Get user permissions for a specific resource
   */
  static async getUserPermissions(
    user: UserContext, 
    resource?: ResourceContext
  ): Promise<string[]> {
    const permissions: string[] = [];
    
    for (const [action] of Object.entries(ALL_PERMISSIONS)) {
      if (await this.hasPermission(action, user, resource)) {
        permissions.push(action);
      }
    }
    
    return permissions;
  }

  /**
   * Check multiple permissions at once
   */
  static async hasAnyPermission(
    actions: string[], 
    user: UserContext, 
    resource?: ResourceContext
  ): Promise<boolean> {
    for (const action of actions) {
      if (await this.hasPermission(action, user, resource)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all specified permissions
   */
  static async hasAllPermissions(
    actions: string[], 
    user: UserContext, 
    resource?: ResourceContext
  ): Promise<boolean> {
    for (const action of actions) {
      if (!(await this.hasPermission(action, user, resource))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate project creation permissions
   */
  static async canCreateProject(user: UserContext): Promise<boolean> {
    return await this.hasPermission('project:create', user);
  }

  /**
   * Get assignable users for a project (active users only)
   */
  static async getAssignableUsers(companyId: number, departmentId?: number): Promise<any[]> {
    try {
      const whereClause: any = {
        companyId,
        isActive: true,
        user: {
          isActive: true
        }
      };

      if (departmentId) {
        whereClause.departmentId = departmentId;
      }

      const employees = await prisma.employee.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          employeeCode: true,
          designation: true,
          department: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return employees.filter(emp => emp.user.isActive);
    } catch (error) {
      console.error('Error getting assignable users:', error);
      return [];
    }
  }
}