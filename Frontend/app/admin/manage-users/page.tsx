'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamService } from '@/app/services/teamService';
import {
  Users,
  Mail,
  Phone,
  Search,
  Filter,
  MoreVertical,
  Shield,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
  employee?: {
    id: number;
    name: string;
    designation: string;
    employeeCode: string;
  };
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  MANAGER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  EMPLOYEE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  INACTIVE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { filterUsers(); }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await teamService.getAllUsers();
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    setFilteredUsers(filtered);
  };

  const getRoleIcon = (role: string) => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return <Shield className="w-3.5 h-3.5" />;
    if (role === 'MANAGER') return <Users className="w-3.5 h-3.5" />;
    return <UserIcon className="w-3.5 h-3.5" />;
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] w-full flex-1 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-10 w-10 animate-spin text-[var(--PRIMAry-color)]" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
        {/* Page Header */}
        <div className="px-6 py-6 sticky top-0 z-10 page-header">
          <h1 className="text-3xl font-bold gradient-text pb-1">Manage Users</h1>
          <p className="text-sm mt-1 text-muted-foreground">View and manage all users in your organization</p>
        </div>

        <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in-up content-area space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', count: users.length, icon: <Users className="w-6 h-6" /> },
              { label: 'Admins', count: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length, icon: <Shield className="w-6 h-6" /> },
              { label: 'Managers', count: users.filter(u => u.role === 'MANAGER').length, icon: <Users className="w-6 h-6" /> },
              { label: 'Employees', count: users.filter(u => u.role === 'EMPLOYEE').length, icon: <UserIcon className="w-6 h-6" /> },
            ].map(({ label, count, icon }) => (
              <Card key={label} className="premium-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="icon-box w-10 h-10">{icon}</div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Users Table Card */}
          <Card className="premium-card">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold">Users List</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Showing {filteredUsers.length} of {users.length} users
                  </CardDescription>
                </div>
                <Button onClick={loadUsers} variant="outline" size="sm" className="btn-outline-theme">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Designation</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Phone</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 icon-box rounded-full flex-shrink-0">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">
                                  {user.firstName} {user.lastName}
                                </p>
                                {user.employee && (
                                  <p className="text-xs text-muted-foreground">{user.employee.employeeCode}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${ROLE_COLORS[user.role] ?? ''} flex items-center gap-1 w-fit`}>
                              {getRoleIcon(user.role)}
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={STATUS_COLORS[user.status] ?? ''}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{user.designation}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                              {user.phone}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </>
  );
}
