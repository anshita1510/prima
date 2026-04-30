"use client";

const NAV_ITEMS = [
  { id: 'attendance', label: 'ATTENDANCE', active: true },
  { id: 'leave', label: 'LEAVE', active: false },
  { id: 'performance', label: 'PERFORMANCE', active: false },
  { id: 'expenses', label: 'EXPENSES & TRAVEL', active: false },
  { id: 'helpdesk', label: 'HELPDESK', active: false },
  { id: 'apps', label: 'APPS', active: false },
];

export const TopNavigation = () => {
  return (
    <nav style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className="relative py-4 text-sm font-medium transition-colors"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: item.active ? 'var(--primary-color)' : 'var(--text-muted)',
              }}>
              {item.label}
              {item.active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--primary-color)' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
