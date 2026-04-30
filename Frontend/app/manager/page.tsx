'use client';

import React from "react";
import Sidebar from "./_components/sidebar_m";
import Banner from "./_components/Banner";
import { AuthGuard } from "@/lib/auth/AuthGuard";

export default function ManagerDashboard() {
  return (
    <AuthGuard allowedRoles={['MANAGER', 'ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen flex bg-gray-50">
      
      {/* SIDEBAR */}
      <aside
        className="
          hidden lg:block
          fixed top-0 left-0
          h-screen w-64
          bg-white border-r
        "
      >
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="
          flex-1
          ml-0 lg:ml-64
          h-screen
          overflow-y-auto
        "
      >
        <Banner />
        
        {/* Manager Dashboard Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manager Dashboard</h1>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Members</h3>
                <p className="text-3xl font-bold text-emerald-600">12</p>
                <p className="text-sm text-gray-500">Active employees</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Leaves</h3>
                <p className="text-3xl font-bold text-yellow-600">3</p>
                <p className="text-sm text-gray-500">Awaiting approval</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Rate</h3>
                <p className="text-3xl font-bold text-blue-600">94%</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">John Doe requested sick leave</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Approve</button>
                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">Reject</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Jane Smith checked in late</p>
                    <p className="text-sm text-gray-500">1 day ago</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}