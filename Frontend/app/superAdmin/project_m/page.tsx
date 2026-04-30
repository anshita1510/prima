import React from 'react'
import Sidebar from '../_components/Sidebarr'

export default function page() {
  return (
    <div className="flex min-h-screen">
    {/* Sidebar */}
    <Sidebar />
    {/* Main Content */}
    <main className="flex-1 p-6">
      welcome projectManage
    </main>
  </div>
  )
}
