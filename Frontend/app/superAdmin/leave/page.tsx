"use client";

import Sidebar from "../_components/Sidebarr";
import LeaveManagement from "../_components/LeaveManagement";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 fixed left-0 top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto">
        <LeaveManagement />
      </main>
    </div>
  );
}
