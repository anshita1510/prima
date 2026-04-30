'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, showBackButton = true, children }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    router.back();
  };

  const getModuleName = () => {
    if (pathname.startsWith('/enhanced-tms')) {
      return 'Enhanced TMS';
    } else if (pathname.startsWith('/admin')) {
      return 'Admin Panel';
    }
    return 'PRIMA';
  };

  return (
    <div className="px-6 py-4" style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={handleBack}
              className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <div className="pl-4" style={{ borderLeft: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--primary-color)' }}>
                {getModuleName()}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>{title}</h1>
            </div>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
            )}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}