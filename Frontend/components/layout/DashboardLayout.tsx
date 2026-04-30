'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/app/services/authService';
import NavigationSidebar from '@/components/navigation/NavigationSidebar';
import TopNavigation from '@/components/navigation/TopNavigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  designation: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showTopNav?: boolean;
}

export default function DashboardLayout({ 
  children, 
  showSidebar = true, 
  showTopNav = true
}: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (!storedUser) {
          router.push('/login');
          return;
        }

        // Verify token is still valid
        const currentUser = await authService.getCurrentUser();
        if (!currentUser.success) {
          authService.logout();
          router.push('/login');
          return;
        }

        setUser(storedUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Role-based route protection
  useEffect(() => {
    if (!user || loading) return;

    const protectedRoutes = {
      '/superAdmin': ['SUPER_ADMIN'],
      '/admin': ['SUPER_ADMIN', 'ADMIN'],
      '/manager': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/enhanced-tms': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/user/tasks': ['EMPLOYEE'], // Employee-specific task view
      '/attendance/dashboard': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/attendance/team': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/attendance/reports': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/leave/requests': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/leave/calendar': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/leave/policies': ['SUPER_ADMIN', 'ADMIN'],
      '/performance/team': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/performance/reviews': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/expenses/approvals': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/expenses/reports': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/helpdesk/all-tickets': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      '/apps/reports': ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
    };

    // Check if current path requires specific roles
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        switch (user.role) {
          case 'SUPER_ADMIN':
            router.push('/superAdmin/dashboard');
            break;
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'MANAGER':
            router.push('/manager/dashboard');
            break;
          case 'EMPLOYEE':
            router.push('/user/tasks');
            break;
          default:
            router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, pathname, router, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {showTopNav && <TopNavigation />}
      
      <div className="flex">
        {/* Sidebar Navigation */}
        {showSidebar && <NavigationSidebar />}
        
        {/* Main Content */}
        <main className={`flex-1 ${showSidebar ? 'ml-0' : ''} ${showTopNav ? 'pt-0' : ''}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}