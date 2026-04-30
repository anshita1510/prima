"use client";

import React from 'react';
import { AttendancePage } from '../../user/attendance/pages/AttendancePage';

export default function AdminAttendancePage() {
  return (
    <>
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
          My Attendance
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Track your attendance and work hours
        </p>
        <span
          className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}
        >
          ADMIN
        </span>
      </div>
      <div className="">
        <AttendancePage />
      </div>
    </>
  );
}
