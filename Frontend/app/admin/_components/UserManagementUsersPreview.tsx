'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, Phone, Briefcase, Hash, Shield, Calendar } from 'lucide-react';
import { userService, User } from '@/app/services/userService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const PREVIEW_LIMIT = 8;

type Filter = 'all' | 'ACTIVE' | 'PENDING';

type Props = {
  refreshKey?: number;
};

function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--bg-subtle)]/50 px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--PRIMAry-subtle)] text-[var(--PRIMAry-color)]">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-[var(--text-color)]">{value ?? '—'}</div>
      </div>
    </div>
  );
}

export default function UserManagementUsersPreview({ refreshKey = 0 }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await userService.getUsers();
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data as User[]);
    } else {
      setUsers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    if (filter === 'all') return users;
    return users.filter((u) => u.status === filter);
  }, [users, filter]);

  const rows = useMemo(() => filtered.slice(0, PREVIEW_LIMIT), [filtered]);

  const pills: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'PENDING', label: 'Pending' },
  ];

  const openUser = (u: User) => setSelectedUser(u);

  const handleRowKeyDown = (e: React.KeyboardEvent, u: User) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openUser(u);
    }
  };

  return (
    <>
      <div className="um-preview-surface">
        <div className="um-preview-toolbar">
          <div className="um-filter-pills" role="tablist" aria-label="Filter users">
            {pills.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={filter === p.id}
                data-active={filter === p.id}
                className="um-filter-pill"
                onClick={() => setFilter(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="um-table-wrap">
          <table className="um-data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="um-cell-muted" style={{ padding: '2rem 1rem' }}>
                    Loading users…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="um-cell-muted" style={{ padding: '2rem 1rem' }}>
                    No users match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr
                    key={u.id}
                    className="um-user-row--clickable"
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${u.firstName} ${u.lastName}`}
                    onClick={() => openUser(u)}
                    onKeyDown={(e) => handleRowKeyDown(e, u)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="um-cell-muted">{u.email}</div>
                    </td>
                    <td>
                      <span className="um-badge-role">{u.role}</span>
                    </td>
                    <td>
                      <span className="um-status-dot" data-status={u.status}>
                        {u.status}
                      </span>
                    </td>
                    <td className="um-cell-muted">{formatShortDate(u.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="um-preview-footer">
          <span>
            {loading
              ? '…'
              : `Showing ${rows.length} of ${filtered.length}${filter !== 'all' ? ' filtered' : ''} · ${users.length} total`}
          </span>
          <span className="hidden text-[var(--text-muted)] sm:inline">Click a row for details</span>
        </div>
      </div>

      <Dialog open={selectedUser != null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User'}
            </DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Profile summary · User ID {selectedUser?.id ?? '—'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-2 sm:grid-cols-1">
              <DetailItem icon={Mail} label="Email" value={selectedUser.email} />
              <DetailItem icon={Phone} label="Phone" value={selectedUser.phone || '—'} />
              <DetailItem icon={Briefcase} label="Designation" value={selectedUser.designation} />
              <DetailItem icon={Shield} label="Role" value={selectedUser.role.replace(/_/g, ' ')} />
              <DetailItem icon={Shield} label="Account status" value={selectedUser.status} />
              <DetailItem
                icon={Hash}
                label="Employee code"
                value={selectedUser.employeeCode ? (
                  <span className="font-mono text-xs">{selectedUser.employeeCode}</span>
                ) : (
                  '—'
                )}
              />
              <DetailItem
                icon={Calendar}
                label="Created"
                value={formatShortDate(selectedUser.createdAt)}
              />
              <DetailItem
                icon={Calendar}
                label="Last updated"
                value={formatShortDate(selectedUser.updatedAt)}
              />
              <DetailItem
                icon={Shield}
                label="Active"
                value={selectedUser.isActive ? 'Yes' : 'No'}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
