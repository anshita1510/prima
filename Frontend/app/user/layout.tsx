"use client";

import { EmployeeRoute } from '@/lib/auth/ProtectedRoute';
import UserPrimaSidebar from './_components/UserSidebarA';
import DecorationPanel from '../admin/_components/DecorationPanel';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeRoute>
      <div className="flex min-h-screen page-bg">
        <UserPrimaSidebar />
        <main className="main-content-with-sidebar relative z-0 flex min-h-screen flex-1 min-w-0 flex-col overflow-y-auto bg-[var(--bg-color)] pt-[57px] lg:pt-0">
          <DecorationPanel />
          <div className="relative z-10 flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </EmployeeRoute>
  );
}
