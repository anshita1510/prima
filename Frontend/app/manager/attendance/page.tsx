"use client";

import React from 'react';
import Sidebar from '../_components/sidebar_m';
import { AttendancePage } from '../../user/attendance/pages/AttendancePage';

export default function ManagerAttendancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content with proper offset for sidebar - 64px (16 * 4) on desktop */}
      <div className="lg:ml-16 min-h-screen pt-16 lg:pt-0">
        {/* Page Header */}
        <div className="bg-white px-4 sm:px-6 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your attendance and work hours</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              MANAGER
            </span>
          </div>
        </div>
        
        {/* Attendance Content - Same as Employee */}
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <AttendancePage />
        </div>
      </div>
    </div>
  );
}
