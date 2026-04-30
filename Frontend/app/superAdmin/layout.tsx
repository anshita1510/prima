"use client";

import { SuperAdminRoute } from '@/lib/auth/ProtectedRoute';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminRoute>
      <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
        {children}
      </div>
    </SuperAdminRoute>
  );
}
