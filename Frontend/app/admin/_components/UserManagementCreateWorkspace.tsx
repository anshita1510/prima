'use client';

import React from 'react';
import UserManagementStats from './UserManagementStats';
import UserManagementUsersPreview from './UserManagementUsersPreview';

type Props = {
  refreshKey: number;
  onViewAllUsers: () => void;
  children: React.ReactNode;
};

export default function UserManagementCreateWorkspace({
  refreshKey,
  onViewAllUsers,
  children,
}: Props) {
  return (
    <div className="um-console-stack">
      <UserManagementStats refreshKey={refreshKey} />
      <div className="um-workspace-grid">
        <div className="um-workspace-main min-w-0">
          <UserManagementUsersPreview refreshKey={refreshKey} onViewAll={onViewAllUsers} />
        </div>
        <div className="um-workspace-panel flex min-h-0 min-w-0 flex-col">{children}</div>
      </div>
    </div>
  );
}
