"use client";

import React from 'react';
import { AttendancePage } from './pages/AttendancePage';

export default function UserAttendancePage() {
  return (
    <div className="min-w-0" style={{ backgroundColor: 'var(--bg-color)' }}>
      <main className="min-w-0">
        <div className="px-4 sm:px-6 py-4 sticky top-0 z-10"
          style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>My Attendance</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track your attendance and work hours</p>
          <span className="inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}>
            EMPLOYEE
          </span>
        </div>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <AttendancePage />
        </div>
      </main>
    </div>
  );
}
