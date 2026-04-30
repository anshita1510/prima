'use client';

import PageHeader from './PageHeader';

type AdminModuleShellProps = {
  title: string;
  subtitle: string;
};

/**
 * Shared shell for new admin hub routes — uses theme CSS variables only.
 */
export default function AdminModuleShell({ title, subtitle }: AdminModuleShellProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} showBackButton={false} />
      <div
        className="mt-6 rounded-2xl border p-6 md:p-8"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p className="text-sm leading-relaxed md:text-base" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      </div>
    </>
  );
}
