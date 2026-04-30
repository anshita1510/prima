'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from "../_components/sidebar_u";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { leaveService, Leave } from '@/app/services/leave.service';
import { authService } from '@/app/services/authService';

export default function EmployeeLeaveManagement() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    const token = authService.getToken();
    
    if (!currentUser || !token) {
      setError('Please log in to access this page.');
      return;
    }
    
    setUser(currentUser);
    loadMyLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, activeTab]);

  const loadMyLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaveService.getMyLeaves();
      
      if (response.success && response.leaves) {
        setLeaves(response.leaves);
      } else {
        setError('Failed to load leaves: ' + (response.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Load leaves error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = leaves;
    
    switch (activeTab) {
      case 'pending':
        filtered = leaves.filter(leave => leave.status === 'PENDING');
        break;
      case 'approved':
        filtered = leaves.filter(leave => leave.status === 'APPROVED');
        break;
      case 'rejected':
        filtered = leaves.filter(leave => leave.status === 'REJECTED');
        break;
      default:
        filtered = leaves;
    }
    
    setFilteredLeaves(filtered);
  };

  const getStatusBadge = (status: string) => {
    const colorClass = leaveService.getStatusColor(status);
    return (
      <Badge className={`${colorClass} border-0`}>
        {status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const getTabCounts = () => {
    return {
      all: leaves.length,
      pending: leaves.filter(l => l.status === 'PENDING').length,
      approved: leaves.filter(l => l.status === 'APPROVED').length,
      rejected: leaves.filter(l => l.status === 'REJECTED').length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content with proper offset for sidebar - 64px (16 * 4) on desktop */}
      <div className="lg:ml-16 min-h-screen pt-16 lg:pt-0">
        {/* Page Header */}
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Leave Management</h1>
              <p className="text-gray-600 mt-1">Apply for leave and track your applications</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  EMPLOYEE
                </span>
              </div>
            </div>
            <Button
              onClick={() => setShowApplyModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          </div>
        </div>
        
        {/* Leave Management Content */}
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({tabCounts.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({tabCounts.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({tabCounts.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    My Leave Applications
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'all' && 'All your leave applications'}
                    {activeTab === 'pending' && 'Leave applications awaiting approval'}
                    {activeTab === 'approved' && 'Your approved leave applications'}
                    {activeTab === 'rejected' && 'Your rejected leave applications'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredLeaves.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No leave applications found</p>
                      <Button
                        onClick={() => setShowApplyModal(true)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Apply for Leave
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLeaves.map((leave) => (
                        <div 
                          key={leave.id} 
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-medium text-lg">
                                  {leaveService.formatLeaveType(leave.type)}
                                </h3>
                                {getStatusBadge(leave.status)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium text-gray-900">Duration:</span>
                                  <br />
                                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                  <br />
                                  <span className="text-xs text-gray-500">
                                    ({leaveService.calculateLeaveDays(leave.startDate, leave.endDate)} days)
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-gray-900">Applied:</span>
                                  <br />
                                  {new Date(leave.createdAt).toLocaleDateString()}
                                </div>
                                
                                {leave.approvedBy && (
                                  <div>
                                    <span className="font-medium text-gray-900">
                                      {leave.status === 'APPROVED' ? 'Approved by:' : 'Rejected by:'}
                                    </span>
                                    <br />
                                    {leave.approvedBy}
                                    <br />
                                    <span className="text-xs text-gray-500">
                                      on {new Date(leave.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {leave.reason && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                  <span className="font-medium text-gray-900">Reason:</span>
                                  <p className="text-sm text-gray-700 mt-1">{leave.reason}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            // ❌ NO success message shown - silent submission
            loadMyLeaves();
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
