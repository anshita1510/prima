"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESIGNATION_HIERARCHY = exports.ROLE_HIERARCHY = exports.PERMISSION_GROUPS = exports.ALL_PERMISSIONS = exports.SYSTEM_PERMISSIONS = exports.PROJECT_PERMISSIONS = void 0;
const client_1 = require("@prisma/client");
// Project Management Permissions Configuration
exports.PROJECT_PERMISSIONS = {
    // Project Creation Permissions - Enhanced with more granular control
    'project:create': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD],
        customConditions: ['isActiveUser', 'hasCompanyAccess']
    },
    // Project Management Permissions
    'project:update': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD],
        customConditions: ['isProjectOwner', 'isProjectManager', 'hasCompanyAccess']
    },
    'project:delete': {
        roles: [client_1.Role.ADMIN],
        designations: [client_1.Designation.MANAGER],
        customConditions: ['isProjectOwner', 'hasCompanyAccess']
    },
    'project:view': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.EMPLOYEE],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD, client_1.Designation.SENIOR_ENGINEER, client_1.Designation.SOFTWARE_ENGINEER],
        customConditions: ['isProjectMember', 'isActiveUser', 'hasCompanyAccess']
    },
    // Team Assignment Permissions - Enhanced
    'project:assign_members': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD],
        customConditions: ['isProjectOwner', 'isProjectManager', 'hasCompanyAccess']
    },
    'project:remove_members': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD],
        customConditions: ['isProjectOwner', 'isProjectManager', 'hasCompanyAccess']
    },
    // Project Status Management
    'project:change_status': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD],
        customConditions: ['isProjectOwner', 'isProjectManager']
    },
    // Budget Management
    'project:manage_budget': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER],
        customConditions: ['isProjectOwner']
    },
    // Task Management Permissions
    'task:create': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.EMPLOYEE],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD, client_1.Designation.SENIOR_ENGINEER],
        customConditions: ['isProjectMember']
    },
    'task:update': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.EMPLOYEE],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD, client_1.Designation.SENIOR_ENGINEER, client_1.Designation.SOFTWARE_ENGINEER],
        customConditions: ['isTaskAssignee', 'isProjectMember']
    },
    'task:delete': {
        roles: [client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD],
        customConditions: ['isTaskCreator', 'isProjectManager']
    }
};
// System-wide Permission Configuration
exports.SYSTEM_PERMISSIONS = {
    'system:admin_access': {
        roles: [client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN]
    },
    'system:manager_access': {
        roles: [client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER],
        designations: [client_1.Designation.MANAGER, client_1.Designation.TECH_LEAD]
    },
    'system:employee_access': {
        roles: [client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.EMPLOYEE],
        customConditions: ['isActiveUser']
    }
};
// Combined Permissions
exports.ALL_PERMISSIONS = {
    ...exports.PROJECT_PERMISSIONS,
    ...exports.SYSTEM_PERMISSIONS
};
// Permission Groups for easier management
exports.PERMISSION_GROUPS = {
    PROJECT_CREATORS: ['project:create'],
    PROJECT_MANAGERS: ['project:create', 'project:update', 'project:assign_members', 'project:remove_members'],
    PROJECT_MEMBERS: ['project:view', 'task:create', 'task:update'],
    SYSTEM_ADMINS: ['system:admin_access'],
    MANAGERS: ['system:manager_access'],
    EMPLOYEES: ['system:employee_access']
};
// Role Hierarchy (higher number = more permissions)
exports.ROLE_HIERARCHY = {
    [client_1.Role.EMPLOYEE]: 1,
    [client_1.Role.MANAGER]: 2,
    [client_1.Role.ADMIN]: 3,
    [client_1.Role.SUPER_ADMIN]: 4
};
// Designation Hierarchy
exports.DESIGNATION_HIERARCHY = {
    [client_1.Designation.INTERN]: 1,
    [client_1.Designation.SOFTWARE_ENGINEER]: 2,
    [client_1.Designation.SENIOR_ENGINEER]: 3,
    [client_1.Designation.TECH_LEAD]: 4,
    [client_1.Designation.MANAGER]: 5,
    [client_1.Designation.HR]: 4,
    [client_1.Designation.DIRECTOR]: 6
};
