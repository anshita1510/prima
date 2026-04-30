"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Hash, UserCheck, Briefcase, Send, RotateCcw, Search, Edit, Trash2, RefreshCw, MoreVertical, Eye, Plus } from 'lucide-react';
import { userService, CreateUserData, User as UserType, Company } from '../../services/user.service';
import CreateUserForm from '../../components/CreateUserForm';
import CompanyManagement from '../../components/CompanyManagement';

export default function CreateUserSuperAdmin() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'companies'>('create');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Manage Users state
  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);

  // Fetch users when manage tab is active
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchUsers();
    }
  }, [activeTab, currentPage, searchTerm]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await userService.getUsers(currentPage, usersPerPage, searchTerm);
      setUsers(response.users || []);
      setTotalUsers(response.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    
    // Refresh users list if on manage tab
    if (activeTab === 'manage') {
      fetchUsers();
    }
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  };

  const handleDeleteUser = async (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    const userType = userToDelete?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                     userToDelete?.role === 'ADMIN' ? 'Admin' : 
                     userToDelete?.role === 'MANAGER' ? 'Manager' : 'Employee';
    
    if (!confirm(`Are you sure you want to delete this ${userType} (${userToDelete?.email})? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        alert(`${userType} deleted successfully!`);
        fetchUsers(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Delete user error:', err);
      alert(`Failed to delete ${userType}: ` + (err.message || 'Unknown error occurred'));
    }
  };

  const handleResendInvitation = async (userId: number) => {
    try {
      const response = await userService.resendInvitation(userId);
      if (response.success) {
        alert('Invitation email sent successfully!');
      }
    } catch (err: any) {
      console.error('Resend invitation error:', err);
      alert('Failed to resend invitation: ' + (err.message || 'Unknown error occurred'));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'MANAGER': return 'bg-green-100 text-green-800';
      case 'EMPLOYEE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Create and manage user accounts</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create New User
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'companies'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Companies
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === 'manage'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Users
            </button>
          </div>
        </div>

        {/* Create User Tab */}
        {activeTab === 'create' && (
          <>
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <UserCheck className="w-5 h-5" />
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <CreateUserForm
              currentUserRole="SUPER_ADMIN"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </>
        )}

        {/* Company Management Tab */}
        {activeTab === 'companies' && (
          <>
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <UserCheck className="w-5 h-5" />
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <CompanyManagement
              onSuccess={handleSuccess}
              onError={handleError}
              onCompanyCreated={(company) => {
                handleSuccess(`Company "${company.name}" created successfully!`);
              }}
            />
          </>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header with Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
                  <p className="text-sm text-gray-600">View and manage all users in the system</p>
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-800">
                      <strong>SuperAdmin Permissions:</strong> You can delete any user including Admins, Managers, and Employees. 
                      You can also delete other SuperAdmins (except yourself and the last SuperAdmin in the system).
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchUsers}
                  disabled={usersLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading users...
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'No users match your search criteria.' : 'No users have been created yet.'}
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-800">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.companyName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.companyId || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResendInvitation(user.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Resend Invitation"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title={`Delete ${user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'User'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {users.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers || 0)} of {totalUsers || 0} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {Math.ceil((totalUsers || 0) / usersPerPage) || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil((totalUsers || 0) / usersPerPage)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}