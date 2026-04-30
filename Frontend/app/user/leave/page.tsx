'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Sidebar from "../_components/sidebar_u";
import Banner from "../_components/Banner";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { leaveService, LeaveApplication, Leave } from '@/app/services/leave.service';
import { authService } from '@/app/services/authService';

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState('apply');
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<LeaveApplication>({
    type: 'CASUAL',
    reason: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
    if (activeTab === 'history') {
      loadMyLeaves();
    }
  }, [activeTab]);

  const loadMyLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaveService.getMyLeaves();
      if (response.success && response.leaves) {
        setLeaves(response.leaves);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LeaveApplication, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = (): boolean => {
    if (!formData.type || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (endDate < startDate) {
      setError('End date must be after start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const response = await leaveService.applyLeave(formData);
      
      if (response.success) {
        // ❌ NO success message shown - silent submission
        // Reset form
        setFormData({
          type: 'CASUAL',
          reason: '',
          startDate: '',
          endDate: ''
        });
        // Refresh leaves list if on history tab
        if (activeTab === 'history') {
          loadMyLeaves();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leave application?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await leaveService.deleteLeave(id);
      if (response.success) {
        setSuccess('Leave application deleted successfully');
        loadMyLeaves();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete leave');
    } finally {
      setLoading(false);
    }
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

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      return leaveService.calculateLeaveDays(formData.startDate, formData.endDate);
    }
    return 0;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Banner />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-1">Apply for leave and manage your leave applications</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="apply" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Apply for Leave
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                My Leave History
              </TabsTrigger>
            </TabsList>

            {/* Apply for Leave Tab */}
            <TabsContent value="apply">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Apply for Leave
                  </CardTitle>
                  <CardDescription>
                    Submit a new leave application for approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="type">Leave Type *</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => handleInputChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASUAL">Casual Leave</SelectItem>
                            <SelectItem value="SICK">Sick Leave</SelectItem>
                            <SelectItem value="EARNED">Earned Leave</SelectItem>
                            <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <span className="text-sm font-medium">
                            {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          min={formData.startDate || new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter reason for leave (optional)"
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="min-w-[120px]"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          'Submit Application'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leave History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    My Leave History
                  </CardTitle>
                  <CardDescription>
                    View and manage your leave applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : leaves.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No leave applications found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab('apply')}
                      >
                        Apply for Leave
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leaves.map((leave) => (
                        <div 
                          key={leave.id} 
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium">
                                  {leaveService.formatLeaveType(leave.type)}
                                </h3>
                                {getStatusBadge(leave.status)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Duration:</span>
                                  <br />
                                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                  <br />
                                  <span className="text-xs">
                                    ({leaveService.calculateLeaveDays(leave.startDate, leave.endDate)} days)
                                  </span>
                                </div>
                                
                                {leave.reason && (
                                  <div>
                                    <span className="font-medium">Reason:</span>
                                    <br />
                                    {leave.reason}
                                  </div>
                                )}
                                
                                <div>
                                  <span className="font-medium">Applied:</span>
                                  <br />
                                  {new Date(leave.createdAt).toLocaleDateString()}
                                  {leave.approvedBy && (
                                    <>
                                      <br />
                                      <span className="text-xs">
                                        Approved by: {leave.approvedBy}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {leave.status === 'PENDING' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteLeave(leave.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
      </main>
    </div>
  );
}