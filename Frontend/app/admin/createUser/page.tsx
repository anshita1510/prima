'use client';

import React, { useCallback, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import AdminCreateUserWrapper from '../_components/AdminCreateUserWrapper';
import UserList from '../_components/UserList';
import UserManagementCreateWorkspace from '../_components/UserManagementCreateWorkspace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { userService, User } from '@/app/services/userService';
import { cn } from '@/lib/utils';

function downloadUsersCsv(users: User[]) {
  const headers = ['email', 'firstName', 'lastName', 'phone', 'role', 'status', 'designation'] as const;
  type CsvKey = (typeof headers)[number];
  const escape = (cell: string) => {
    const s = String(cell ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const row = (u: User) =>
    headers.map((h: CsvKey) => escape(String(u[h] ?? ''))).join(',');
  const csv = [headers.join(','), ...users.map(row)].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type UserMgmtTab = 'overview' | 'directory';

export default function CreateUserPage() {
  const [tab, setTab] = useState<UserMgmtTab>('overview');
  const [statsRefresh, setStatsRefresh] = useState(0);

  const bumpStats = useCallback(() => {
    setStatsRefresh((n) => n + 1);
  }, []);

  const handleExportCsv = useCallback(async () => {
    if (tab !== 'directory') {
      setTab('directory');
      return;
    }
    const res = await userService.getUsers();
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      downloadUsersCsv(res.data as User[]);
    }
  }, [tab]);

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as UserMgmtTab)}
      className="flex min-h-0 w-full flex-1 flex-col"
    >
      <div className="user-mgmt-console flex min-h-0 w-full flex-1 flex-col gap-6">
        <header className="um-page-header">
          <div className="min-w-0">
            <h1 className="um-page-title gradient-text">User management</h1>
            <p className="um-page-subtitle">
              Create accounts, send invites, and review activity across your workspace.
            </p>
          </div>
          <div className="um-header-actions">
            <button type="button" className="um-btn-header-outline" onClick={handleExportCsv}>
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Export CSV
            </button>
            <button type="button" className="um-btn-header-solid" onClick={() => setTab('overview')}>
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Invite user
            </button>
          </div>
        </header>

        <TabsList className={cn('um-subtabs !h-auto !justify-start !bg-[var(--bg-subtle)] p-1')}>
          <TabsTrigger value="overview" className="rounded-md px-4 py-2 text-sm font-semibold">
            Overview
          </TabsTrigger>
          <TabsTrigger value="directory" className="rounded-md px-4 py-2 text-sm font-semibold">
            Directory
          </TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <TabsContent value="overview" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <UserManagementCreateWorkspace
              refreshKey={statsRefresh}
              onViewAllUsers={() => setTab('directory')}
            >
              <AdminCreateUserWrapper layoutVariant="console" onUserCreated={bumpStats} />
            </UserManagementCreateWorkspace>
          </TabsContent>
          <TabsContent value="directory" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <UserList fullWidth />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
