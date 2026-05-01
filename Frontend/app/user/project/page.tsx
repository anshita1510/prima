import React from 'react';

export default function UserProjectPlaceholderPage() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8">
      <h1 className="text-xl font-semibold text-[var(--text-color)]">Projects</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Use My Projects from the sidebar for the full list.</p>
    </div>
  );
}
