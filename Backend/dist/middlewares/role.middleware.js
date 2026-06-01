"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyRole = exports.requireRole = exports.authorizeRoles = exports.authorize = void 0;
/**
 * Main Authorization Middleware
 * Supports:
 *  - Role based access
 *  - Designation based access
 *  - OR logic between them
 */
const authorize = (options) => {
    return (req, res, next) => {
        const user = req.user;
        console.log('🔐 AUTH CHECK ------------------------');
        console.log('Path:', req.originalUrl);
        console.log('Raw user object:', JSON.stringify(user, null, 2));
        console.log('options.roles:', options.roles);
        console.log('options.designations:', options.designations);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const userRole = user.role?.toUpperCase();
        const userDesignation = user.designation?.toUpperCase();
        console.log('userRole (after toUpperCase):', userRole);
        console.log('userDesignation (after toUpperCase):', userDesignation);
        console.log('roleAllowed check:', options.roles?.includes(userRole));
        console.log('designationAllowed check:', options.designations?.includes(userDesignation));
        const roleAllowed = options.roles ? options.roles.includes(userRole) : false;
        const designationAllowed = options.designations && userDesignation ? options.designations.includes(userDesignation) : false;
        if (!roleAllowed && !designationAllowed) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
        }
        return next();
    };
};
exports.authorize = authorize;
/**
 * Backward compatible role-only middleware
 */
const authorizeRoles = (allowedRoles) => {
    return (0, exports.authorize)({ roles: allowedRoles });
};
exports.authorizeRoles = authorizeRoles;
/**
 * Require single role
 */
const requireRole = (role) => {
    return (0, exports.authorize)({ roles: [role] });
};
exports.requireRole = requireRole;
/**
 * Require any role
 */
const requireAnyRole = (...roles) => {
    return (0, exports.authorize)({ roles });
};
exports.requireAnyRole = requireAnyRole;
