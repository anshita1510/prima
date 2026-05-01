'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className="min-w-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div>
        {/* Page Header */}
        <div
          className="sticky top-0 z-10 border-b px-4 py-4 sm:px-6"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>My Leave Management</h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Apply for leave and track your applications</p>
              <div className="mt-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--PRIMAry-subtle)',
                    color: 'var(--PRIMAry-color)',
                  }}
                >
                  EMPLOYEE
                </span>
              </div>
            </div>
            <Button onClick={() => setShowApplyModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          </div>
        </div>
        
        {/* Leave Management Content */}
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {error && (
            <Alert
              className="mb-4 border"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'color-mix(in srgb, var(--signal-negative) 10%, var(--card-bg))',
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--signal-negative)' }} />
              <AlertDescription style={{ color: 'var(--text-color)' }}>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert
              className="mb-4 border"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'color-mix(in srgb, var(--signal-positive) 10%, var(--card-bg))',
              }}
            >
              <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--signal-positive)' }} />
              <AlertDescription style={{ color: 'var(--text-color)' }}>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
              <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({tabCounts.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({tabCounts.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({tabCounts.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Card className="border-[var(--card-border)] bg-[var(--card-bg)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Calendar className="w-5 h-5" />
                    My Leave Applications
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--text-muted)' }}>
                    {activeTab === 'all' && 'All your leave applications'}
                    {activeTab === 'pending' && 'Leave applications awaiting approval'}
                    {activeTab === 'approved' && 'Your approved leave applications'}
                    {activeTab === 'rejected' && 'Your rejected leave applications'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex h-32 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--PRIMAry-color)]" />
                    </div>
                  ) : filteredLeaves.length === 0 ? (
                    <div className="py-8 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
                      <p style={{ color: 'var(--text-muted)' }}>No leave applications found</p>
                      <Button onClick={() => setShowApplyModal(true)} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Apply for Leave
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLeaves.map((leave) => (
                        <div
                          key={leave.id}
                          className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                          style={{
                            borderColor: 'var(--card-border)',
                            backgroundColor: 'var(--bg-subtle)',
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-3 flex items-center gap-3">
                                <h3 className="text-lg font-medium" style={{ color: 'var(--text-color)' }}>
                                  {leaveService.formatLeaveType(leave.type)}
                                </h3>
                                {getStatusBadge(leave.status)}
                              </div>
                              
                              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3" style={{ color: 'var(--text-muted)' }}>
                                <div>
                                  <span className="font-medium" style={{ color: 'var(--text-color)' }}>Duration:</span>
                                  <br />
                                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                  <br />
                                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    ({leaveService.calculateLeaveDays(leave.startDate, leave.endDate)} days)
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="font-medium" style={{ color: 'var(--text-color)' }}>Applied:</span>
                                  <br />
                                  {new Date(leave.createdAt).toLocaleDateString()}
                                </div>
                                
                                {leave.approvedBy && (
                                  <div>
                                    <span className="font-medium" style={{ color: 'var(--text-color)' }}>
                                      {leave.status === 'APPROVED' ? 'Approved by:' : 'Rejected by:'}
                                    </span>
                                    <br />
                                    {leave.approvedBy}
                                    <br />
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                      on {new Date(leave.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {leave.reason && (
                                <div
                                  className="mt-3 rounded-md border p-3"
                                  style={{
                                    borderColor: 'var(--card-border)',
                                    backgroundColor: 'var(--input-bg)',
                                  }}
                                >
                                  <span className="font-medium" style={{ color: 'var(--text-color)' }}>Reason:</span>
                                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{leave.reason}</p>
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

  const fieldClass =
    'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--PRIMAry-color)] focus:ring-offset-1 focus:ring-offset-[var(--card-bg)]';
  const fieldStyle: CSSProperties = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--card-border)',
    color: 'var(--text-color)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--sidebar-overlay-scrim)' }}
    >
      <div
        className="mx-auto w-full max-w-md rounded-lg border p-6 shadow-lg"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <h2 className="mb-4 text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Apply for Leave</h2>

        {error && (
          <div
            className="mb-4 flex items-start gap-2 rounded-lg border p-3"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'color-mix(in srgb, var(--signal-negative) 12%, var(--card-bg))',
            }}
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--signal-negative)' }} />
            <span className="text-sm" style={{ color: 'var(--text-color)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Leave Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className={fieldClass}
              style={fieldStyle}
              required
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="EARNED">Earned Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={fieldClass}
              style={fieldStyle}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={fieldClass}
              style={fieldStyle}
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Reason (Optional)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
              rows={3}
              placeholder="Enter reason for leave..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
