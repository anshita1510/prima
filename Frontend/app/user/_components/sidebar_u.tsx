"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth.services';
import { useAuth } from '../../hooks/useAuth';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  CalendarOff, 
  UserCheck, 
  Briefcase,
  ChevronRight,
  LogOut,
  Target,
  CheckSquare,
  ArrowLeft
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/user' }, 
  { id: 'attendance', name: 'Attendance', icon: UserCheck, href: '/user/attendance' },    
  { id: 'leave', name: 'Leave Management', icon: CalendarOff, href: '/user/leave-management' },       
  { id: 'projects', name: 'Projects', icon: Briefcase, href: '/user/projects' },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare, href: '/user/tasks' },            
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user, getUserInitials, getRoleDisplay, refreshUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    authService.logout();
    // No need to manually redirect - authService.logout() handles it
  };

  const goBack = () => {
    router.back();
  };

  const sidebarWidth = isHovered ? 'w-64' : 'w-16';

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white fixed top-0 left-0 right-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="p-2 hover:bg-blue-600/80 rounded-md transition-colors mr-2">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-white">T</div>
          <span className="font-semibold text-lg tracking-tight">PRIMA</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 hover:bg-blue-600/80 rounded-md transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed top-0 left-0 h-full z-50 ${sidebarWidth} bg-gradient-to-b from-blue-600 to-purple-700 text-white transform transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-screen border-r border-blue-800/30 shadow-2xl lg:shadow-none">

          {/* LOGO */}
          <div className={`p-4 flex items-center ${isHovered ? 'justify-between' : 'justify-center'} border-b border-blue-600/50 transition-all duration-300`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-blue-700 rounded-xl flex items-center justify-center shadow-lg font-bold">
                <Target size={20} />
              </div>
              {isHovered && (
                <span className="font-bold text-lg tracking-tight uppercase animate-fade-in">PRIMA</span>
              )}
            </div>
            {isHovered && (
              <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 hover:bg-blue-600 rounded-full">
                <X size={16} />
              </button>
            )}
          </div>

          {/* NAV LINKS */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`w-full group flex items-center ${isHovered ? 'justify-start px-3' : 'justify-center px-2'} py-3 rounded-xl transition-all duration-300 
          ${isActive ? 'bg-white text-blue-800 shadow-lg' : 'hover:bg-blue-600/80 text-white'}
        `}
                  title={!isHovered ? item.name : undefined}
                >
                  <item.icon
                    size={20}
                    className={`${isActive ? 'text-blue-700' : 'text-blue-300'} transition-colors duration-200`}
                  />
                  
                  {isHovered && (
                    <>
                      <span className="ml-3 font-semibold text-sm tracking-wide animate-fade-in">
                        {item.name}
                      </span>
                      <ChevronRight
                        size={14}
                        className={`ml-auto transition-all duration-200 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                      />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* USER & LOGOUT */}
          <div className={`p-2 border-t border-blue-600/50 space-y-2 bg-blue-800/20 mt-auto transition-all duration-300`}>
            <div className={`flex items-center gap-3 p-2 rounded-xl bg-blue-800/40 ${isHovered ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-blue-500/50 flex items-center justify-center text-blue-900 font-bold text-xs uppercase">
                {getUserInitials()}
              </div>
              {isHovered && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-xs font-bold truncate">{user?.name || "Loading..."}</p>
                  <p className="text-[8px] text-blue-300 font-bold uppercase tracking-widest">{getRoleDisplay()}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2 text-red-100 hover:bg-red-500/20 hover:text-white rounded-xl transition-all duration-200 font-semibold text-sm ${isHovered ? 'justify-start' : 'justify-center'}`}
              title={!isHovered ? 'Logout' : undefined}
            >
              <LogOut size={16} />
              {isHovered && <span className="animate-fade-in">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </>
  );
}
