"use client";

import { ReactNode } from 'react';
import { AuthGuard } from './AuthGuard';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE')[];
}

/**
 * ProtectedRoute Component
 * Wraps pages that require authentication and role-based access control
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
 *   <YourPageComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  return (
    <AuthGuard allowedRoles={allowedRoles} requireAuth={true}>
      {children}
    </AuthGuard>
  );
}

// Convenience components for specific roles
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{children}</ProtectedRoute>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>{children}</ProtectedRoute>;
}

export function ManagerRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>{children}</ProtectedRoute>;
}

export function EmployeeRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']}>{children}</ProtectedRoute>;
}
