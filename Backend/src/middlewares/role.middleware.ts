import { Request, Response, NextFunction } from 'express';
import { Role, Designation } from '@prisma/client';

/**
 * Extend Express Request type
 */
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: Role;
      designation: Designation | null;
      companyId?: number;
      isActive?: boolean;
      employeeId?: number | undefined;
      departmentId?: number | undefined;
    }

    interface Request {
      user?: User;
    }
  }
}

/**
 * Flexible Authorization Options
 */
interface AccessOptions {
  roles?: Role[];
  designations?: Designation[];
}

/**
 * Main Authorization Middleware
 * Supports:
 *  - Role based access
 *  - Designation based access
 *  - OR logic between them
 */

export const authorize = (options: AccessOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    console.log('🔐 AUTH CHECK ------------------------');
    console.log('Path:', req.originalUrl);
    console.log('Raw user object:', JSON.stringify(user, null, 2));
    console.log('options.roles:', options.roles);
    console.log('options.designations:', options.designations);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = user.role?.toUpperCase() as Role;
    const userDesignation = user.designation?.toUpperCase() as Designation;

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
/**
 * Backward compatible role-only middleware
 */
export const authorizeRoles = (allowedRoles: Role[]) => {
  return authorize({ roles: allowedRoles });
};

/**
 * Require single role
 */
export const requireRole = (role: Role) => {
  return authorize({ roles: [role] });
};

/**
 * Require any role
 */
export const requireAnyRole = (...roles: Role[]) => {
  return authorize({ roles });
};