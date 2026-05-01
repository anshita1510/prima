'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = true,
  actions 
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="border-b px-6 py-4"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-[var(--bg-subtle)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{title}</h1>
            {subtitle && (
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
