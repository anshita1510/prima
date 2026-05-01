"use client";

import { SuperAdminRoute } from "@/lib/auth/ProtectedRoute";
import DecorationPanel from "@/app/admin/_components/DecorationPanel";
import Sidebar from "./_components/Sidebarr";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminRoute>
      <div className="flex min-h-screen page-bg" style={{ backgroundColor: "var(--bg-color)" }}>
        <Sidebar />
        <main className="main-content-with-sidebar relative z-0 flex min-h-screen flex-1 min-w-0 flex-col overflow-y-auto bg-[var(--bg-color)] pt-[57px] lg:pt-0">
          <DecorationPanel />
          <div className="relative z-10 flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </SuperAdminRoute>
  );
}
