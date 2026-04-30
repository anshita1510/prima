import React from 'react'
import Sidebar from '../_components/sidebar_u'

export default function page() {
  return (
    <div>
        <div className="flex min-h-screen">
    {/* Sidebar */}
    <Sidebar></Sidebar>

    {/* Main Content */}
    <main className="flex-1 p-6">
      welcome dashboard
    </main>

  </div>
    </div>
  )
}
