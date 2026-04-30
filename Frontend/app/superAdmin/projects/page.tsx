import React from 'react'
import Sidebar from '../_components/Sidebarr'

export default function SuperAdminProjectsPage() {
  return (
    <div>  
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar></Sidebar>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Project Management (Super Admin)</h1>
            <p className="text-gray-600">System-wide project management and oversight</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enhanced Project Management System</h3>
              <p className="text-gray-600 mb-4">
                Access the comprehensive project management system with advanced features, budget tracking, and team management.
              </p>
              <a 
                href="/enhanced-tms/dashboard" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Enhanced TMS Dashboard
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}