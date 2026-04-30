'use client';

import React from 'react';
import ProjectManagementDashboard from '../_components/ProjectManagementDashboard';

export default function AdminProjectPage() {
  return (
    <>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Project & Task Management</h1>
        <p className="mt-1 text-gray-600">Create and manage projects with dynamic team assignment</p>
        <div className="mt-2 flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            ADMIN
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            MANAGER
          </span>
          <span className="text-sm text-gray-500">Full Access</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <ProjectManagementDashboard />
      </div>
    </>
  );
}
