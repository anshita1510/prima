"use client";

import { EmployeeRoute } from '@/lib/auth/ProtectedRoute';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeRoute>
      {children}
    </EmployeeRoute>
  );
}
