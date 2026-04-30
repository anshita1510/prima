import { Role, Designation } from '@prisma/client';

// Centralized Permission Configuration
export interface PermissionRule {
  roles?: Role[];
  designations?: Designation[];
  customConditions?: string[];
}

export interface PermissionConfig {
  [action: string]: PermissionRule;
}

// Project Management Permissions Configuration
export const PROJECT_PERMISSIONS: PermissionConfig = {
  // Project Creation Permissions - Enhanced with more granular control
  'project:create': {
    roles: [Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER, Designation.TECH_LEAD],
    customConditions: ['isActiveUser', 'hasCompanyAccess']
  },
  
  // Project Management Permissions
  'project:update': {
    roles: [Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER, Designation.TECH_LEAD],
    customConditions: ['isProjectOwner', 'isProjectManager', 'hasCompanyAccess']
  },
  
  'project:delete': {
    roles: [Role.ADMIN],
    designations: [Designation.MANAGER],
    customConditions: ['isProjectOwner', 'hasCompanyAccess']
  },
  
  'project:view': {
    roles: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
    designations: [Designation.MANAGER, Designation.TECH_LEAD, Designation.SENIOR_ENGINEER, Designation.SOFTWARE_ENGINEER],
    customConditions: ['isProjectMember', 'isActiveUser', 'hasCompanyAccess']
  },
  
  // Team Assignment Permissions - Enhanced
  'project:assign_members': {
    roles: [Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER, Designation.TECH_LEAD],
    customConditions: ['isProjectOwner', 'isProjectManager', 'hasCompanyAccess']
  },
  
  'project:remove_members': {
    roles: [Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER, Designation.TECH_LEAD],
    customConditions: ['isProjectOwner', 'isProjectManager', 'hasCompanyAccess']
  },
  
  // Project Status Management
  'project:change_status': {
    roles: [Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER, Designation.TECH_LEAD],
    customConditions: ['isProjectOwner', 'isProjectManager']
  },
  
  // Budget Management
  'project:manage_budget': {
    roles: [Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER],
    customConditions: ['isProjectOwner']
  },
  
  // Task Management Permissions
  'task:create': {
    roles: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
    designations: [Designation.MANAGER, Designation.TECH_LEAD, Designation.SENIOR_ENGINEER],
    customConditions: ['isProjectMember']
  },
  
  'task:update': {
    roles: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
    designations: [Designation.MANAGER, Designation.TECH_LEAD, Designation.SENIOR_ENGINEER, Designation.SOFTWARE_ENGINEER],
    customConditions: ['isTaskAssignee', 'isProjectMember']
  },
  
  'task:delete': {
    roles: [Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER, Designation.TECH_LEAD],
    customConditions: ['isTaskCreator', 'isProjectManager']
  }
};

// System-wide Permission Configuration
export const SYSTEM_PERMISSIONS: PermissionConfig = {
  'system:admin_access': {
    roles: [Role.SUPER_ADMIN, Role.ADMIN]
  },
  
  'system:manager_access': {
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER],
    designations: [Designation.MANAGER, Designation.TECH_LEAD]
  },
  
  'system:employee_access': {
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
    customConditions: ['isActiveUser']
  }
};

// Combined Permissions
export const ALL_PERMISSIONS = {
  ...PROJECT_PERMISSIONS,
  ...SYSTEM_PERMISSIONS
};

// Permission Groups for easier management
export const PERMISSION_GROUPS = {
  PROJECT_CREATORS: ['project:create'],
  PROJECT_MANAGERS: ['project:create', 'project:update', 'project:assign_members', 'project:remove_members'],
  PROJECT_MEMBERS: ['project:view', 'task:create', 'task:update'],
  SYSTEM_ADMINS: ['system:admin_access'],
  MANAGERS: ['system:manager_access'],
  EMPLOYEES: ['system:employee_access']
};

// Role Hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [Role.EMPLOYEE]: 1,
  [Role.MANAGER]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPER_ADMIN]: 4
};

// Designation Hierarchy
export const DESIGNATION_HIERARCHY = {
  [Designation.INTERN]: 1,
  [Designation.SOFTWARE_ENGINEER]: 2,
  [Designation.SENIOR_ENGINEER]: 3,
  [Designation.TECH_LEAD]: 4,
  [Designation.MANAGER]: 5,
  [Designation.HR]: 4,
  [Designation.DIRECTOR]: 6
};