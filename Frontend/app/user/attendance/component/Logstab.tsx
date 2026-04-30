"use client";

import { Switch } from '@/components/ui/switch';
import { List, Calendar } from 'lucide-react';

type TabType = 'log' | 'calendar' | 'requests';
type ViewMode = 'list' | 'calendar';

interface LogsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  timeFormat: '12h' | '24h';
  onTimeFormatChange: (format: '12h' | '24h') => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const TABS: { id: TabType; label: string }[] = [
  { id: 'log', label: 'Attendance Log' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'requests', label: 'Attendance Requests' },
];

export const LogsTabs = ({ activeTab, onTabChange, timeFormat, onTimeFormatChange, viewMode, onViewModeChange }: LogsTabsProps) => {
  return (
    <div className="p-6" style={{ borderBottom: '1px solid var(--card-border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>Logs & Requests</h2>
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: activeTab === tab.id ? 'var(--text-color)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Switch checked={timeFormat === '24h'} onCheckedChange={(c: boolean) => onTimeFormatChange(c ? '24h' : '12h')} />
            <span>24 hour format</span>
          </div>

          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
            {(['list', 'calendar'] as ViewMode[]).map(mode => (
              <button key={mode} onClick={() => onViewModeChange(mode)}
                className="p-2 transition-colors"
                style={{
                  background: viewMode === mode ? 'var(--primary-color)' : 'var(--card-bg)',
                  color: viewMode === mode ? '#fff' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer',
                }}>
                {mode === 'list' ? <List className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
