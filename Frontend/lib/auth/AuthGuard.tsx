"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthContext';
import { AlertCircle, ShieldAlert, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export function AuthGuard({ children, allowedRoles, requireAuth = true }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    const verifyAuth = async () => {
      // Public routes that don't require authentication
      const publicRoutes = [
        '/login', 
        '/Forget_pass', 
        '/set-password', 
        '/otp_check',
        '/set_pass'
      ];
      
      // If on a public route, don't check auth
      if (publicRoutes.some(route => pathname.startsWith(route))) {
        console.log('📖 [AuthGuard] Public route, skipping auth check');
        setIsChecking(false);
        return;
      }

      // Wait for initial loading
      if (isLoading) {
        console.log('⏳ [AuthGuard] Waiting for auth initialization...');
        return;
      }

      // If auth is not required, allow access
      if (!requireAuth) {
        console.log('🔓 [AuthGuard] Auth not required');
        setIsChecking(false);
        return;
      }

      // Check if user is authenticated (from localStorage)
      if (!isAuthenticated) {
        console.log('🔒 [AuthGuard] Not authenticated, redirecting to login');
        setIsChecking(false); // Set to false before redirect
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/login?returnUrl=${returnUrl}`);
        return;
      }

      console.log('✅ [AuthGuard] User authenticated from localStorage');

      // Check role-based access
      if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
          console.log('🚫 [AuthGuard] Insufficient permissions');
          setDenialReason(`This page requires ${allowedRoles.join(' or ')} role. You have ${user?.role || 'no'} role.`);
          setAccessDenied(true);
          setIsChecking(false);
          return;
        }
      }

      console.log('✅ [AuthGuard] Access granted');
      setIsChecking(false);
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, user, pathname, allowedRoles, requireAuth, router]);

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Lock className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 font-medium">Verifying authentication...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (accessDenied) {
    const roleRoutes: Record<string, string> = {
      SUPER_ADMIN: '/superAdmin',
      ADMIN: '/admin',
      MANAGER: '/manager',
      EMPLOYEE: '/user'
    };
    
    const userDashboard = user ? roleRoutes[user.role] : '/login';

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">{denialReason}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm text-red-800 font-medium">Insufficient Permissions</p>
                <p className="text-xs text-red-700 mt-1">
                  You don't have the required permissions to access this page. Please contact your administrator if you believe this is an error.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(userDashboard)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}
