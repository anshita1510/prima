'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { userService, type User } from '@/app/services/userService';

export type UserMgmtStats = {
  total: number;
  active: number;
  pending: number;
  admins: number;
};

type Props = {
  refreshKey?: number;
};

export default function UserManagementStats({ refreshKey = 0 }: Props) {
  const [stats, setStats] = useState<UserMgmtStats>({
    total: 0,
    active: 0,
    pending: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await userService.getUsers();
    if (res.success && Array.isArray(res.data)) {
      const users = res.data as User[];
      setStats({
        total: users.length,
        active: users.filter((u) => u.status === 'ACTIVE').length,
        pending: users.filter((u) => u.status === 'PENDING').length,
        admins: users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
      });
    } else {
      setStats({ total: 0, active: 0, pending: 0, admins: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const cards: {
    label: string;
    value: number;
    trend: string;
    trendClass?: string;
  }[] = [
    {
      label: 'Total users',
      value: stats.total,
      trend: loading ? '…' : 'All accounts in directory',
    },
    {
      label: 'Active now',
      value: stats.active,
      trend: loading ? '…' : '▲ Verified & signed in',
      trendClass: 'um-kpi-trend--up',
    },
    {
      label: 'Pending invites',
      value: stats.pending,
      trend: loading ? '…' : 'Awaiting first sign-in',
    },
    {
      label: 'Admins',
      value: stats.admins,
      trend: loading ? '…' : 'Admin + super admin',
    },
  ];

  return (
    <div className="um-kpi-row" aria-busy={loading}>
      {cards.map(({ label, value, trend, trendClass }) => (
        <div key={label} className="um-kpi-card">
          <div className="um-kpi-value">{loading ? '—' : value}</div>
          <div className="um-kpi-label">{label}</div>
          <div className={trendClass ? `um-kpi-trend ${trendClass}` : 'um-kpi-trend'}>
            {trend}
          </div>
        </div>
      ))}
    </div>
  );
}
