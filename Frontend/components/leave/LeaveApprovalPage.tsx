'use client';

import { useState, useEffect } from 'react';
import { leaveService, LeaveRequest, LeaveNotification } from '@/app/services/leave.service';
import { CheckCircle, XCircle, Clock, Bell, User, Calendar, FileText, AlertCircle } from 'lucide-react';

interface LeaveApprovalPageProps {
  userRole: 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
}

export default function LeaveApprovalPage({ userRole }: LeaveApprovalPageProps) {
  const [approvableLeaves, setApprovableLeaves] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<LeaveNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leavesRes, notifRes] = await Promise.all([
        leaveService.getApprovableLeaves(),
        leaveService.getLeaveNotifications()
      ]);

      if (leavesRes.success && leavesRes.leaves) {
        setApprovableLeaves(leavesRes.leaves as LeaveRequest[]);
      }

      if (notifRes.success) {
        setNotifications(notifRes.notifications || []);
        setUnreadCount(notifRes.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.notificationId);

    if (unreadIds.length === 0) return;

    try {
      await leaveService.markNotificationsRead(unreadIds);
      setUnreadCount(0);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleApproveReject = async () => {
    if (!selectedLeave || !actionType) return;

    if (actionType === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const result = await leaveService.updateLeaveStatus(
        selectedLeave.id,
        actionType,
        rejectionReason
      );

      if (result.success) {
        // Remove the processed leave from the list
        setApprovableLeaves(prev => prev.filter(l => l.id !== selectedLeave.id));
        setSelectedLeave(null);
        setActionType(null);
        setRejectionReason('');
        
        // Reload notifications
        const notifRes = await leaveService.getLeaveNotifications();
        if (notifRes.success) {
          setNotifications(notifRes.notifications || []);
          setUnreadCount(notifRes.unreadCount || 0);
        }
      } else {
        alert(result.error || 'Failed to process leave request');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to process leave request');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleBasedTitle = () => {
    switch (userRole) {
      case 'MANAGER':
        return 'Employee Leave Approvals';
      case 'ADMIN':
        return 'Employee & Manager Leave Approvals';
      case 'SUPER_ADMIN':
        return 'All Leave Approvals (CEO)';
      default:
        return 'Leave Approvals';
    }
  };

  const getRoleBasedDescription = () => {
    switch (userRole) {
      case 'MANAGER':
        return 'You can approve leave requests from employees in your team.';
      case 'ADMIN':
        return 'You can approve leave requests from employees and managers.';
      case 'SUPER_ADMIN':
        return 'You can approve leave requests from all employees, managers, and HR.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getRoleBasedTitle()}</h1>
          <p className="text-gray-600 mt-1">{getRoleBasedDescription()}</p>
        </div>
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            if (!showNotifications && unreadCount > 0) {
              handleMarkNotificationsRead();
            }
          }}
          className="relative px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-sm text-yellow-700">Pending Approvals</div>
              <div className="text-3xl font-bold text-yellow-900">{approvableLeaves.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-blue-700">Unread Notifications</div>
              <div className="text-3xl font-bold text-blue-900">{unreadCount}</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-green-700">Your Role</div>
              <div className="text-xl font-bold text-green-900">
                {userRole === 'SUPER_ADMIN' ? 'CEO' : userRole === 'ADMIN' ? 'HR' : 'Manager'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border ${
                    notif.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Leave Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Pending Leave Requests</h2>
        </div>
        
        {approvableLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending leave requests to approve at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {approvableLeaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{leave.employee.name}</h3>
                        <p className="text-sm text-gray-500">
                          {leave.employee.employeeCode} • {leave.employee.designation} • {leave.employee.role}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500">Leave Type</div>
                          <div className="font-medium">{leaveService.formatLeaveType(leave.type)}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500">Duration</div>
                          <div className="font-medium">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({leaveService.calculateLeaveDays(leave.startDate, leave.endDate)} days)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500">Applied On</div>
                          <div className="font-medium">{new Date(leave.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    {leave.reason && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Reason</div>
                        <p className="text-sm text-gray-700">{leave.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedLeave(leave);
                        setActionType('APPROVED');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLeave(leave);
                        setActionType('REJECTED');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedLeave && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {actionType === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Employee</div>
              <div className="font-semibold">{selectedLeave.employee.name}</div>
              <div className="text-sm text-gray-600 mt-2">Leave Type</div>
              <div className="font-semibold">{leaveService.formatLeaveType(selectedLeave.type)}</div>
              <div className="text-sm text-gray-600 mt-2">Duration</div>
              <div className="font-semibold">
                {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
              </div>
            </div>

            {actionType === 'REJECTED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}

            <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                {actionType === 'APPROVED'
                  ? 'The employee will be notified immediately about the approval.'
                  : 'The employee will be notified immediately about the rejection.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedLeave(null);
                  setActionType(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveReject}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  actionType === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={processing || (actionType === 'REJECTED' && !rejectionReason.trim())}
              >
                {processing ? 'Processing...' : `Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
