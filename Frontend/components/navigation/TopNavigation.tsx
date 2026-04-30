'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/app/services/authService';
import { formatRole } from '@/app/utils/roleFormatter';
import {
  Clock,
  Calendar,
  TrendingUp,
  CreditCard,
  HelpCircle,
  Grid3X3,
  ChevronDown,
  CheckSquare,
  FolderOpen,
  BarChart3,
  Users,
  Settings,
  Bell
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  designation: string;
}

interface TopNavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  roles: string[];
  children: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    href: string;
    description?: string;
    roles: string[];
  }[];
}

const topNavigationConfig: TopNavItem[] = [
  {
    id: 'attendance',
    label: 'ATTENDANCE',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'attendance-dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        href: '/attendance/dashboard',
        description: 'View attendance analytics and insights',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'my-attendance',
        label: 'My Attendance',
        icon: Clock,
        href: '/attendance/my-attendance',
        description: 'Track your daily attendance',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'team-attendance',
        label: 'Team Attendance',
        icon: Users,
        href: '/attendance/team',
        description: 'Monitor team attendance records',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'attendance-reports',
        label: 'Reports',
        icon: BarChart3,
        href: '/attendance/reports',
        description: 'Generate attendance reports',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      }
    ]
  },
  {
    id: 'leave',
    label: 'LEAVE',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-leaves',
        label: 'My Leaves',
        icon: Calendar,
        href: '/leave/my-leaves',
        description: 'Manage your leave requests',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'leave-requests',
        label: 'Leave Requests',
        icon: CheckSquare,
        href: '/leave/requests',
        description: 'Approve or reject leave requests',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'leave-calendar',
        label: 'Leave Calendar',
        icon: Calendar,
        href: '/leave/calendar',
        description: 'View team leave calendar',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'leave-policies',
        label: 'Leave Policies',
        icon: Settings,
        href: '/leave/policies',
        description: 'Configure leave policies',
        roles: ['SUPER_ADMIN', 'ADMIN']
      }
    ]
  },
  {
    id: 'performance',
    label: 'PERFORMANCE',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-performance',
        label: 'My Performance',
        icon: TrendingUp,
        href: '/performance/my-performance',
        description: 'View your performance metrics',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'team-performance',
        label: 'Team Performance',
        icon: Users,
        href: '/performance/team',
        description: 'Monitor team performance',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'performance-reviews',
        label: 'Performance Reviews',
        icon: CheckSquare,
        href: '/performance/reviews',
        description: 'Conduct performance reviews',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'goals',
        label: 'Goals & Objectives',
        icon: CheckSquare,
        href: '/performance/goals',
        description: 'Set and track goals',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      }
    ]
  },
  {
    id: 'expenses-travel',
    label: 'EXPENSES & TRAVEL',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-expenses',
        label: 'My Expenses',
        icon: CreditCard,
        href: '/expenses/my-expenses',
        description: 'Submit and track expenses',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'expense-approvals',
        label: 'Expense Approvals',
        icon: CheckSquare,
        href: '/expenses/approvals',
        description: 'Approve expense claims',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'travel-requests',
        label: 'Travel Requests',
        icon: Calendar,
        href: '/expenses/travel',
        description: 'Manage travel requests',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'expense-reports',
        label: 'Expense Reports',
        icon: BarChart3,
        href: '/expenses/reports',
        description: 'View expense analytics',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      }
    ]
  },
  {
    id: 'helpdesk',
    label: 'HELPDESK',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-tickets',
        label: 'My Tickets',
        icon: HelpCircle,
        href: '/helpdesk/my-tickets',
        description: 'View your support tickets',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'all-tickets',
        label: 'All Tickets',
        icon: Grid3X3,
        href: '/helpdesk/all-tickets',
        description: 'Manage all support tickets',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'knowledge-base',
        label: 'Knowledge Base',
        icon: HelpCircle,
        href: '/helpdesk/knowledge-base',
        description: 'Browse help articles',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      }
    ]
  },
  {
    id: 'apps',
    label: 'APPS',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'task-management',
        label: 'Task Management',
        icon: CheckSquare,
        href: '/enhanced-tms',
        description: 'Manage projects and tasks',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'my-tasks',
        label: 'My Tasks',
        icon: CheckSquare,
        href: '/user/tasks',
        description: 'View your assigned tasks',
        roles: ['EMPLOYEE']
      },
      {
        id: 'projects',
        label: 'Projects',
        icon: FolderOpen,
        href: '/enhanced-tms/projects',
        description: 'Manage project portfolio',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'calendar-app',
        label: 'Calendar',
        icon: Calendar,
        href: '/apps/calendar',
        description: 'Schedule and events',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'reports-app',
        label: 'Reports',
        icon: BarChart3,
        href: '/apps/reports',
        description: 'Analytics and insights',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      }
    ]
  }
];

export default function TopNavigation() {
  const [user, setUser] = useState<User | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasAccess = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setActiveDropdown(null);
  };

  const toggleDropdown = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm" ref={dropdownRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">PRIMA</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            {topNavigationConfig.map((item) => {
              if (!hasAccess(item.roles)) return null;

              const isDropdownActive = activeDropdown === item.id;
              const hasActiveChild = item.children.some(child => 
                hasAccess(child.roles) && isActive(child.href)
              );

              return (
                <div key={item.id} className="relative">
                  <button
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      hasActiveChild || isDropdownActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleDropdown(item.id)}
                  >
                    {item.label}
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                      isDropdownActive ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownActive && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        {item.children.map((child) => {
                          if (!hasAccess(child.roles)) return null;

                          const isChildActive = isActive(child.href);

                          return (
                            <button
                              key={child.id}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                isChildActive ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                              }`}
                              onClick={() => handleNavigation(child.href)}
                            >
                              <div className="flex items-start space-x-3">
                                <child.icon className={`w-5 h-5 mt-0.5 ${
                                  isChildActive ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                                <div className="flex-1">
                                  <div className={`font-medium ${
                                    isChildActive ? 'text-blue-600' : 'text-gray-900'
                                  }`}>
                                    {child.label}
                                  </div>
                                  {child.description && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {child.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{formatRole(user.role)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}