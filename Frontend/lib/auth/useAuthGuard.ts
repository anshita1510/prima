"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

interface UseAuthGuardOptions {
  allowedRoles?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

interface UseAuthGuardReturn {
  isAuthorized: boolean;
  isLoading: boolean;
  user: any;
  hasPermission: (roles: string[]) => boolean;
}

/**
 * Custom hook for authentication and authorization checks
 * 
 * Usage:
 * const { isAuthorized, isLoading, user, hasPermission } = useAuthGuard({
 *   allowedRoles: ['ADMIN', 'MANAGER'],
 *   redirectTo: '/login'
 * });
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const {
    allowedRoles,
    redirectTo = '/login',
    requireAuth = true
  } = options;

  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      // If auth is not required, allow access
      if (!requireAuth) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Wait for initial loading
      if (isLoading) {
        return;
      }

      // Check authentication
      if (!isAuthenticated) {
        setIsAuthorized(false);
        setIsChecking(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
        return;
      }

      // Verify token
      const isValid = await checkAuth();
      if (!isValid) {
        setIsAuthorized(false);
        setIsChecking(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
        return;
      }

      // Check role-based access
      if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    verifyAccess();
  }, [isAuthenticated, isLoading, user, allowedRoles, requireAuth, redirectTo, router, checkAuth]);

  const hasPermission = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    isAuthorized,
    isLoading: isLoading || isChecking,
    user,
    hasPermission
  };
}
