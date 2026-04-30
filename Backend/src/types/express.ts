import { Role, Designation } from '@prisma/client';

/**
 * Authenticated User interface
 * This extends Passport's Express.User
 */
export interface AuthUser {
  id: number;
  role: Role;
  email: string;
  employeeId?: number;
  companyId?: number;
  designation?: Designation | null;
  isActive?: boolean;
  departmentId?: number;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

/**
 * Type guard for safe runtime checking
 */
export function isAuthUser(user: any): user is AuthUser {
  return (
    user &&
    typeof user.id === 'number' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string'
  );
}

export {};
  