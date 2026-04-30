"use client";

import { ManagerRoute } from '@/lib/auth/ProtectedRoute';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagerRoute>
      {children}
    </ManagerRoute>
  );
}
