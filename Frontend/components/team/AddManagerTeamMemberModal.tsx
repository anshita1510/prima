'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { teamService } from '@/app/services/teamService';
import { Users, AlertCircle, CheckCircle, Mail } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  employeeCode?: string;
}

interface AddManagerTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (member: any) => void;
}

export function AddManagerTeamMemberModal({ isOpen, onClose, onSuccess }: AddManagerTeamMemberModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [managerName, setManagerName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadUnassignedEmployees();
      // Get manager name from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setManagerName(user?.firstName || 'Manager');
    }
  }, [isOpen]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadUnassignedEmployees = async () => {
    setLoadingEmployees(true);
    setError('');
    try {
      console.log('📤 Fetching unassigned employees...');
      const result = await teamService.getUnassignedEmployees();
      console.log('📥 Unassigned employees:', result);

      if (result.success && result.data && Array.isArray(result.data)) {
        setEmployees(result.data);
        console.log('✅ Found unassigned employees:', result.data.length);
      } else {
        setError(result.message || 'Failed to load employees');
        setEmployees([]);
      }
    } catch (err) {
      console.error('❌ Error loading employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredEmployees(filtered);
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('📤 Assigning employee to manager:', selectedEmployee.id);

      const result = await teamService.assignEmployeeToManager(selectedEmployee.id);
      console.log('📥 Assignment result:', result);

      if (result.success && result.data) {
        console.log('✅ Employee assigned successfully:', result.data);
        setSuccess(true);

        // Create the team member object
        const newMember = {
          id: result.data.id || result.data.employeeId || Math.random(),
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || selectedEmployee.phone,
          designation: result.data.designation,
          role: result.data.role || 'EMPLOYEE',
          status: result.data.status || 'ACTIVE',
          location: result.data.location || 'Not specified',
          avatar: teamService.generateAvatarInitials(result.data.name),
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
        setError(result.message || 'Failed to assign employee');
      }
    } catch (err) {
      console.error('❌ Error assigning employee:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while assigning the employee');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setSearchTerm('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
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
            <span>Employee assigned successfully! Invitation sent.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 px-2">
          {selectedEmployee ? (
            <>
              {/* Selected Employee Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Selected Employee:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {teamService.generateAvatarInitials(selectedEmployee.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedEmployee.name}</p>
                    <p className="text-sm text-gray-600">{selectedEmployee.designation}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmployee(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Invitation Message Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Invitation Message:</p>
                <div className="bg-white border border-gray-300 rounded p-3 text-sm text-gray-700">
                  <p className="mb-2">Dear {selectedEmployee.name},</p>
                  <p className="mb-2">
                    You have been assigned to the team of <strong>{managerName}</strong>.
                  </p>
                  <p>
                    Please log in to your account to view your team assignments and tasks.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading || success}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="flex-1"
                >
                  {loading ? 'Sending Invitation...' : success ? 'Sent!' : 'Send Invitation'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Employee Search */}
              <div className="space-y-2">
                <Label htmlFor="employee-search">Search Employees</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="employee-search"
                    placeholder="Search by name, email, or designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loadingEmployees}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Employees List */}
              <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                {loadingEmployees ? (
                  <div className="p-4 text-center text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Loading employees...</p>
                  </div>
                ) : filteredEmployees.length > 0 ? (
                  <div className="divide-y">
                    {filteredEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => handleSelectEmployee(employee)}
                        className="w-full p-3 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {teamService.generateAvatarInitials(employee.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-600 truncate">{employee.email}</p>
                            <p className="text-xs text-gray-500">{employee.designation}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-600">
                    {employees.length === 0 ? (
                      <>
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p>No unassigned employees available</p>
                      </>
                    ) : (
                      <>
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p>No employees match your search</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-600">
                Click on an employee to select them and send an invitation to join your team.
              </p>

              {/* Cancel Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
