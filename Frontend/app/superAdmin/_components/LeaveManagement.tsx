"use client";

import { useState, useEffect } from 'react';
import { Calendar, Users, AlertCircle, Plus, ChevronDown } from 'lucide-react';
import { leaveService, LeaveRequest } from '../../services/leave.service';

interface LeaveBalance {
  type: string;
  available: number;
  consumed: number;
  total: number;
  color: string;
}

export default function LeaveManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('Jan 2024 - Dec 2024');
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    loadLeaveData();
  }, []);

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      
      // Load approvable leaves (pending requests)
      const approvableRes = await leaveService.getApprovableLeaves();
      if (approvableRes.success && approvableRes.leaves) {
        setPendingRequests(approvableRes.leaves as LeaveRequest[]);
      }

      // Load leave statistics for current user
      const statsRes = await leaveService.getLeaveStatistics();
      if (statsRes.success && statsRes.statistics) {
        const stats = statsRes.statistics;
        
        // Convert stats to balance format
        const balances: LeaveBalance[] = [
          {
            type: 'Casual Leave',
            available: 12 - stats.byType.CASUAL,
            consumed: stats.byType.CASUAL,
            total: 12,
            color: 'bg-purple-500'
          },
          {
            type: 'Sick Leave',
            available: 12 - stats.byType.SICK,
            consumed: stats.byType.SICK,
            total: 12,
            color: 'bg-green-500'
          },
          {
            type: 'Earned Leave',
            available: 15 - stats.byType.EARNED,
            consumed: stats.byType.EARNED,
            total: 15,
            color: 'bg-red-500'
          },
          {
            type: 'Unpaid Leave',
            available: 0,
            consumed: stats.byType.UNPAID,
            total: 0,
            color: 'bg-gray-400'
          }
        ];
        
        setLeaveBalances(balances);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load leave data');
      console.error('Error loading leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: number) => {
    try {
      const result = await leaveService.updateLeaveStatus(leaveId, 'APPROVED');
      
      if (result.success) {
        // Reload data
        await loadLeaveData();
      } else {
        setError(result.error || 'Failed to approve leave');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId: number) => {
    try {
      const result = await leaveService.updateLeaveStatus(leaveId, 'REJECTED');
      
      if (result.success) {
        // Reload data
        await loadLeaveData();
      } else {
        setError(result.error || 'Failed to reject leave');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject leave');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const weeklyPattern = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const CircularProgress = ({ percentage, available, color }: { percentage: number, available: number, color: string }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={color.replace('bg-', 'text-')}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{available}</span>
          <span className="text-xs text-gray-500">Days</span>
          <span className="text-xs text-gray-500">Available</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Summary</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Jan 2024 - Dec 2024">Jan 2024 - Dec 2024</option>
                <option value="Jan 2023 - Dec 2023">Jan 2023 - Dec 2023</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Pending Leave Requests */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending leave requests</h2>
            <button 
              onClick={() => setShowApplyModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Request Leave
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {pendingRequests.length === 0 ? (
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>Hurray! No pending leave requests</span>
              <span className="text-sm text-gray-400">Request leave on the right</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{request.employee.name}</h3>
                      <p className="text-sm text-gray-600">
                        {request.type.charAt(0) + request.type.slice(1).toLowerCase()} Leave • {calculateDays(request.startDate, request.endDate)} days
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(request.startDate)} to {formatDate(request.endDate)}
                      </p>
                      {request.reason && (
                        <p className="text-xs text-gray-500 mt-1">Reason: {request.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveLeave(request.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectLeave(request.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-blue-800 font-medium">If your leave balances don't look updated yet, don't worry!</p>
          <p className="text-blue-700 text-sm">We have updated our system once this processing year and balancing. Please check back after the weekend.</p>
        </div>
      </div>

      {/* My Leave Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Leave Stats</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Pattern */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Weekly Pattern</h3>
              <span className="text-sm text-gray-500">ℹ️</span>
            </div>
            <div className="flex justify-between items-end h-32">
              {weeklyPattern.map((day) => (
                <div key={day} className="flex flex-col items-center">
                  <div 
                    className="w-6 bg-gray-200 rounded-t mb-2"
                    style={{ height: `${Math.random() * 80 + 20}px` }}
                  ></div>
                  <span className="text-xs text-gray-600">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consumed Leave Types */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Consumed Leave Types</h3>
              <span className="text-sm text-gray-500">ℹ️</span>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">No data to display</p>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Monthly Stats</h3>
              <span className="text-sm text-gray-500">ℹ️</span>
            </div>
            <div className="flex justify-between items-end h-32">
              {months.map((month) => (
                <div key={month} className="flex flex-col items-center">
                  <div 
                    className="w-3 bg-blue-200 rounded-t mb-2"
                    style={{ height: `${Math.random() * 60 + 10}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 transform -rotate-45 origin-bottom-left">{month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balances</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leaveBalances.map((balance) => (
            <div key={balance.type} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{balance.type}</h3>
                <button className="text-blue-600 text-sm hover:underline">View details</button>
              </div>
              
              <div className="flex items-center justify-center mb-4">
                <CircularProgress 
                  percentage={balance.total > 0 ? (balance.available / balance.total) * 100 : 0} 
                  available={balance.available}
                  color={balance.color}
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">AVAILABLE</span>
                  <span className="font-medium">{balance.available} day{balance.available !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CONSUMED</span>
                  <span className="font-medium">{balance.consumed} day{balance.consumed !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ANNUAL QUOTA</span>
                  <span className="font-medium">{balance.total} day{balance.total !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Leave History</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No Leave History to show.</p>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            loadLeaveData();
          }}
        />
      )}
    </div>
  );
}

// Apply Leave Modal Component
function ApplyLeaveModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'CASUAL' as 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await leaveService.applyLeave(formData);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to apply for leave');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Apply for Leave</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="EARNED">Earned Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Enter reason for leave..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}