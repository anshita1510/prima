"use client";

import { SuperAdminRoute } from "@/lib/auth/ProtectedRoute";
import Sidebar from "./_components/Sidebarr";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminRoute>
      <div className="page-bg flex min-h-screen" style={{ backgroundColor: "var(--bg-color)" }}>
        <Sidebar />
        <main className="main-content-with-sidebar relative z-0 flex min-h-screen flex-1 min-w-0 flex-col overflow-y-auto bg-[var(--bg-color)] pt-[57px] lg:pt-0">
          {children}
        </main>
      </div>
    </SuperAdminRoute>
  );
}
