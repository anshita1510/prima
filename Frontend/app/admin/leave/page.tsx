'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function AdminLeavePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/leave-management');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="text-center">
        <RefreshCw className="h-10 w-10 animate-spin mx-auto" style={{ color: 'var(--primary-color)' }} />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting to Leave Management...</p>
      </div>
    </div>
  );
}
