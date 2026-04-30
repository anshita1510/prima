'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { userService, User } from '@/app/services/userService';

const PREVIEW_LIMIT = 8;

type Filter = 'all' | 'ACTIVE' | 'PENDING';

type Props = {
  refreshKey?: number;
  onViewAll: () => void;
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

export default function UserManagementUsersPreview({ refreshKey = 0, onViewAll }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

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

  return (
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
        <button type="button" className="um-link-quiet" onClick={onViewAll}>
          View full directory
        </button>
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
                <tr key={u.id}>
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
        <button type="button" className="um-link-quiet" onClick={onViewAll}>
          Open directory
        </button>
      </div>
    </div>
  );
}
