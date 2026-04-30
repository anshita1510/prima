'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  User,
  Shield,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Hash
} from 'lucide-react';
import { userService, User as UserType } from '@/app/services/userService';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50',
  INACTIVE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
};

const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50',
  ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
  MANAGER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
  EMPLOYEE: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50'
};

type UserListProps = {
  /** Use full width of parent (e.g. user management console) instead of centered max width */
  fullWidth?: boolean;
};

export default function UserList({ fullWidth = false }: UserListProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.getUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        // 403 means the role doesn't have access — show empty list gracefully
        if (result.message?.includes('403') || result.message?.toLowerCase().includes('forbidden')) {
          setUsers([]);
          setError('You do not have permission to view all users.');
        } else {
          setError(result.message || 'Failed to load users');
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('An unexpected error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        (user.employeeCode && user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'INACTIVE':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-PRIMAry/10 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 animate-spin text-PRIMAry" />
            </div>
            <p className="text-muted-foreground font-medium">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={fullWidth ? 'w-full max-w-none space-y-6' : 'mx-auto max-w-5xl space-y-6'}>
      <Card className="premium-card border-border shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 icon-box">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">User Database</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Manage and view all users in the system ({filteredUsers.length} of {users.length} users)
                </CardDescription>
              </div>
            </div>
            <Button onClick={loadUsers} variant="outline" size="sm" className="btn-outline-theme whitespace-nowrap">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, phone, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border mt-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more users.'
                  : 'No users have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const isExpanded = expandedUserId === user.id;

                return (
                  <Card key={user.id} className={`transition-all bg-card border overflow-hidden ${isExpanded ? 'border-PRIMAry ring-1 ring-PRIMAry/50 shadow-md' : 'border-border hover:border-border/80 hover:shadow-md'}`}>
                    {/* Header Row - Minimal Inline Info */}
                    <div
                      className="p-4 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                    >
                      <div className="flex items-center space-x-4 w-full sm:w-auto">
                        <div className="w-10 h-10 icon-box rounded-full flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto sm:ml-auto">
                        <Badge className={`${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]} hidden md:inline-flex`}>
                          {user.role}
                        </Badge>
                        <Badge className={STATUS_COLORS[user.status as keyof typeof STATUS_COLORS]}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(user.status)}
                            <span className="hidden sm:inline">{user.status}</span>
                          </div>
                        </Badge>
                        <Button variant="ghost" size="sm" className="ml-2">
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {isExpanded && (
                      <div className="border-t border-border px-5 py-6 bg-muted/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                          <div className="space-y-3">
                            <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Contact Info</h4>
                            <div className="flex items-center space-x-3 text-sm text-foreground">
                              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center"><Mail className="w-3.5 h-3.5 text-muted-foreground" /></div>
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-foreground">
                              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center"><Phone className="w-3.5 h-3.5 text-muted-foreground" /></div>
                              <span>{user.phone || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Work Details</h4>
                            <div className="flex items-center space-x-3 text-sm text-foreground">
                              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center"><Briefcase className="w-3.5 h-3.5 text-muted-foreground" /></div>
                              <span>{user.designation}</span>
                            </div>
                            {user.employeeCode && (
                              <div className="flex items-center space-x-3 text-sm text-foreground">
                                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center"><Hash className="w-3.5 h-3.5 text-muted-foreground" /></div>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded border border-border">
                                  {user.employeeCode}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">System Information</h4>
                            <div className="flex items-center space-x-3 text-sm text-foreground">
                              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center"><Shield className="w-3.5 h-3.5 text-muted-foreground" /></div>
                              <span>Role: {user.role}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 px-1 space-y-1.5">
                              <p className="flex justify-between"><span>Created:</span> <span>{formatDate(user.createdAt)}</span></p>
                              <p className="flex justify-between font-mono"><span>User ID:</span> <span>{user.id}</span></p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
