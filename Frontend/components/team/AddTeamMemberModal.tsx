'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeService } from '@/app/services/employeeService';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (member: any) => void;
}

export function AddTeamMemberModal({ isOpen, onClose, onSuccess }: AddTeamMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.designation.trim()) {
      setError('Designation is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('📤 Submitting team member creation:', formData);

      const result = await employeeService.createEmployee({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        designation: formData.designation,
        role: formData.role as 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
        status: formData.status as 'ACTIVE' | 'AWAY' | 'BUSY' | 'OFFLINE',
        location: formData.location || undefined,
      });

      console.log('📥 API Response:', result);

      if (result.success && result.data) {
        console.log('✅ Team member created successfully:', result.data);
        setSuccess(true);
        
        // Create the team member object with all required fields
        const newMember = {
          id: result.data.id || result.data.employeeId || Math.random(),
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || formData.phone,
          designation: result.data.designation,
          role: result.data.role || formData.role,
          status: result.data.status || formData.status,
          location: result.data.location || formData.location,
          avatar: employeeService.generateAvatarInitials(result.data.name),
          activeTasks: 0,
          completedTasks: 0,
          isActive: true,
        };

        // Call success callback
        onSuccess(newMember);

        // Reset form
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Failed to create team member');
      }
    } catch (err) {
      console.error('❌ Error creating team member:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the team member');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: '',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      location: '',
    });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add Team Member
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>Team member created successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 px-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <Input
              id="designation"
              name="designation"
              placeholder="e.g., Senior Developer, Manager"
              value={formData.designation}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
              <SelectTrigger id="role" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger id="status" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="AWAY">Away</SelectItem>
                <SelectItem value="BUSY">Busy</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., New York, USA"
              value={formData.location}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1"
            >
              {loading ? 'Creating...' : success ? 'Created!' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
