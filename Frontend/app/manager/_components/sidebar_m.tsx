"use client"
import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    // No need to manually redirect - authService.logout() handles it
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/manager', active: true },
    { icon: Users, label: 'Team Management', href: '/manager/team' },
    { icon: Calendar, label: 'Attendance', href: '/manager/attendance' },
    { icon: FileText, label: 'Leave Management', href: '/manager/leave-management' },
    { icon: Settings, label: 'Settings', href: '/manager/settings' },
  ];

  return (
    <div className={`h-full bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-900">PRIMA</h2>
              <p className="text-sm text-gray-500">Manager Portal</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              item.active 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">Manager User</p>
            <p className="text-sm text-gray-500">manager@company.com</p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;