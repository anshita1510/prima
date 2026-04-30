'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/app/services/authService';
import { formatRole } from '@/app/utils/roleFormatter';
import {
  Home,
  User,
  Inbox,
  Users,
  DollarSign,
  Building,
  MessageCircle,
  Calendar,
  Clock,
  TrendingUp,
  CreditCard,
  HelpCircle,
  Grid3X3,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  CheckSquare,
  BarChart3,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  designation: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  roles: string[];
  children?: NavigationItem[];
  badge?: number;
}

const getRoleBasedHomeRoute = (role: string): string => {
  const roleRoutes: Record<string, string> = {
    SUPER_ADMIN: "/superAdmin",
    ADMIN: "/admin",
    MANAGER: "/manager",
    EMPLOYEE: "/user",
  };
  return roleRoutes[role] || "/dashboard";
};

const navigationConfig: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/dashboard', // This will be dynamically updated based on user role
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'me',
    label: 'Me',
    icon: User,
    href: '/profile',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
    href: '/inbox',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    badge: 1
  },
  {
    id: 'my-team',
    label: 'My Team',
    icon: Users,
    href: '/team',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
  },
  {
    id: 'my-finances',
    label: 'My Finances',
    icon: DollarSign,
    href: '/finances',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
  },
  {
    id: 'org',
    label: 'Org',
    icon: Building,
    href: '/organization',
    roles: ['SUPER_ADMIN', 'ADMIN']
  },
  {
    id: 'engage',
    label: 'Engage',
    icon: MessageCircle,
    href: '/engage',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
  },
  // Main navigation sections with nested items
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'attendance-dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        href: '/attendance/dashboard',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'my-attendance',
        label: 'My Attendance',
        icon: Clock,
        href: '/attendance/my-attendance',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'team-attendance',
        label: 'Team Attendance',
        icon: Users,
        href: '/attendance/team',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'attendance-reports',
        label: 'Reports',
        icon: BarChart3,
        href: '/attendance/reports',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      }
    ]
  },
  {
    id: 'leave',
    label: 'Leave',
    icon: Calendar,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-leaves',
        label: 'My Leaves',
        icon: Calendar,
        href: '/leave/my-leaves',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'leave-requests',
        label: 'Leave Requests',
        icon: CheckSquare,
        href: '/leave/requests',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'leave-calendar',
        label: 'Leave Calendar',
        icon: Calendar,
        href: '/leave/calendar',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'leave-policies',
        label: 'Leave Policies',
        icon: Settings,
        href: '/leave/policies',
        roles: ['SUPER_ADMIN', 'ADMIN']
      }
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-performance',
        label: 'My Performance',
        icon: TrendingUp,
        href: '/performance/my-performance',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'team-performance',
        label: 'Team Performance',
        icon: Users,
        href: '/performance/team',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'performance-reviews',
        label: 'Performance Reviews',
        icon: CheckSquare,
        href: '/performance/reviews',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'goals',
        label: 'Goals & Objectives',
        icon: CheckSquare,
        href: '/performance/goals',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      }
    ]
  },
  {
    id: 'expenses-travel',
    label: 'Expenses & Travel',
    icon: CreditCard,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-expenses',
        label: 'My Expenses',
        icon: CreditCard,
        href: '/expenses/my-expenses',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'expense-approvals',
        label: 'Expense Approvals',
        icon: CheckSquare,
        href: '/expenses/approvals',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'travel-requests',
        label: 'Travel Requests',
        icon: Calendar,
        href: '/expenses/travel',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'expense-reports',
        label: 'Expense Reports',
        icon: BarChart3,
        href: '/expenses/reports',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      }
    ]
  },
  {
    id: 'helpdesk',
    label: 'Helpdesk',
    icon: HelpCircle,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'my-tickets',
        label: 'My Tickets',
        icon: HelpCircle,
        href: '/helpdesk/my-tickets',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'all-tickets',
        label: 'All Tickets',
        icon: Grid3X3,
        href: '/helpdesk/all-tickets',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'knowledge-base',
        label: 'Knowledge Base',
        icon: HelpCircle,
        href: '/helpdesk/knowledge-base',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      }
    ]
  },
  {
    id: 'task-management',
    label: 'Task Management',
    icon: CheckSquare,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    children: [
      {
        id: 'projects',
        label: 'Projects',
        icon: FolderOpen,
        href: '/enhanced-tms/projects',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'all-tasks',
        label: 'All Tasks',
        icon: CheckSquare,
        href: '/enhanced-tms/tasks',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'task-calendar',
        label: 'Task Calendar',
        icon: Calendar,
        href: '/enhanced-tms/calendar',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'task-reports',
        label: 'Task Reports',
        icon: BarChart3,
        href: '/enhanced-tms/reports',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      }
    ]
  },
  // Employee-specific task section (only shows assigned tasks)
  {
    id: 'my-tasks',
    label: 'My Tasks',
    icon: CheckSquare,
    href: '/user/tasks',
    roles: ['EMPLOYEE']
  },
  {
    id: 'apps',
    label: 'Apps',
    icon: Grid3X3,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    children: [
      {
        id: 'enhanced-tms',
        label: 'Enhanced TMS',
        icon: CheckSquare,
        href: '/enhanced-tms',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        id: 'calendar-app',
        label: 'Calendar',
        icon: Calendar,
        href: '/apps/calendar',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']
      },
      {
        id: 'reports-app',
        label: 'Reports',
        icon: BarChart3,
        href: '/apps/reports',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      }
    ]
  }
];

export default function NavigationSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigation = (href: string, itemId?: string) => {
    // If this is the home navigation, redirect to role-specific dashboard
    if (itemId === 'home' && user) {
      const roleBasedRoute = getRoleBasedHomeRoute(user.role);
      router.push(roleBasedRoute);
    } else {
      router.push(href);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const hasAccess = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    if (!hasAccess(item.roles)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isItemActive = item.href ? isActive(item.href) : false;

    return (
      <div key={item.id} className="mb-1">
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
            isItemActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          } ${level > 0 ? 'ml-4' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.href) {
              handleNavigation(item.href, item.id);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <div className="text-gray-400">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="w-64 bg-gray-800 text-white h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-gray-400">{formatRole(user.role)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navigationConfig.map((item) => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-2">
          <div
            className="flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            onClick={() => handleNavigation('/notifications')}
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </div>
          <div
            className="flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            onClick={() => handleNavigation('/settings')}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
          <div
            className="flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer text-red-400 hover:bg-red-600 hover:text-white transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
}