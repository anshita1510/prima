'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthGuard } from '@/lib/auth/AuthGuard';
import Sidebar from '../admin/_components/Sidebar_A';
import DecorationPanel from '../admin/_components/DecorationPanel';

export default function EnhancedTMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/enhanced-tms/dashboard') {
      router.push('/admin');
      return;
    }
  }, [pathname, router]);

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']} requireAuth={true}>
      <div className="flex min-h-screen page-bg">
        <Sidebar />
        <main className="main-content-with-sidebar relative z-0 flex min-h-screen flex-1 min-w-0 flex-col overflow-y-auto bg-[var(--bg-color)] pt-[57px] lg:pt-0">
          <DecorationPanel />
          <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
