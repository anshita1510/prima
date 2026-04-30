'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Calendar,
  DollarSign,
  Users,
  Building,
  User,
  CheckCircle,
  AlertCircle,
  X,
  UserPlus,
  Trash2
} from 'lucide-react';
import { projectService, CreateProjectData, Employee, AssignTeamMemberData } from '@/app/services/projectService';
import { authService } from '@/app/services/authService';

interface CreateProjectFormProps {
  onProjectCreated?: (project: any) => void;
  onClose?: () => void;
}

export default function CreateProjectForm({ onProjectCreated, onClose }: CreateProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<AssignTeamMemberData[]>([]);
  const [createdProject, setCreatedProject] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    code: '',
    companyId: 0,
    departmentId: 0,
    ownerId: 0,
    startDate: '',
    endDate: '',
    budget: undefined,
    status: 'PLANNING'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = authService.getStoredUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        ownerId: user.employeeId || 0,
        companyId: user.companyId || 0,
        departmentId: user.departmentId || 0
      }));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAvailableEmployees();
    }
  }, [isOpen]);

  const loadAvailableEmployees = async () => {
    try {
      const result = await projectService.getAvailableEmployees(formData.companyId, formData.departmentId);
      if (result.success) {
        setAvailableEmployees(result.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.budget && formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTeamMember = (employeeId: number, role: 'MANAGER' | 'MEMBER' | 'VIEWER') => {
    const employee = availableEmployees.find(emp => emp.id === employeeId);
    if (!employee) return;

    // Check if already added
    if (selectedTeamMembers.some(member => member.employeeId === employeeId)) {
      alert('Employee is already added to the team');
      return;
    }

    setSelectedTeamMembers(prev => [...prev, { employeeId, role }]);
  };

  const removeTeamMember = (employeeId: number) => {
    setSelectedTeamMembers(prev => prev.filter(member => member.employeeId !== employeeId));
  };

  const updateTeamMemberRole = (employeeId: number, role: 'MANAGER' | 'MEMBER' | 'VIEWER') => {
    setSelectedTeamMembers(prev =>
      prev.map(member =>
        member.employeeId === employeeId ? { ...member, role } : member
      )
    );
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = availableEmployees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const getEmployeeDetails = (employeeId: number) => {
    return availableEmployees.find(emp => emp.id === employeeId);
  };

  const handleCreateProject = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);

    // Add debugging
    console.log('🚀 Creating project with data:', formData);
    console.log('🔑 Auth token exists:', !!localStorage.getItem('token'));
    console.log('🌐 API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004');

    try {
      const result = await projectService.createProject(formData);

      console.log('📡 API Response:', result);

      if (result.success) {
        console.log('✅ Project created successfully:', result.data);
        setCreatedProject(result.data);
        setCurrentStep(3);

        // Assign team members if any
        if (selectedTeamMembers.length > 0) {
          console.log('👥 Assigning team members:', selectedTeamMembers);
          await assignTeamMembers(result.data.id);
        }

        if (onProjectCreated) {
          onProjectCreated(result.data);
        }
      } else {
        console.error('❌ Project creation failed:', result.message);
        alert(`Failed to create project: ${result.message}`);
      }
    } catch (error: any) {
      console.error('💥 Project creation error:', error);
      alert(`Error creating project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const assignTeamMembers = async (projectId: number) => {
    try {
      for (const member of selectedTeamMembers) {
        await projectService.assignTeamMember(projectId, member);
      }
    } catch (error) {
      console.error('Error assigning team members:', error);
    }
  };

  const resetForm = () => {
    const user = authService.getStoredUser();
    setFormData({
      name: '',
      description: '',
      code: '',
      companyId: user?.companyId || 0,
      departmentId: user?.departmentId || 0,
      ownerId: user?.employeeId || 0,
      startDate: '',
      endDate: '',
      budget: undefined,
      status: 'PLANNING'
    });
    setSelectedTeamMembers([]);
    setErrors({});
    setCurrentStep(1);
    setCreatedProject(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
    if (onClose) {
      onClose();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter project name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Project Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="Auto-generated if empty"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the project objectives and scope"
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget || ''}
            onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter project budget"
            min="0"
            step="0.01"
            className={errors.budget ? 'border-red-500' : ''}
          />
          {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANNING">Planning</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assign Team Members</h3>
        <Badge variant="outline">{selectedTeamMembers.length} members selected</Badge>
      </div>

      {/* Add Team Member */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={(value) => {
              const employeeId = parseInt(value);
              addTeamMember(employeeId, 'MEMBER');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees
                  .filter(emp => !selectedTeamMembers.some(member => member.employeeId === emp.id))
                  .map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} ({employee.employeeCode})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selected Team Members */}
      {selectedTeamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedTeamMembers.map((member) => {
                const employee = getEmployeeDetails(member.employeeId);
                return (
                  <div key={member.employeeId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{employee?.name}</p>
                        <p className="text-sm text-gray-500">{employee?.designation} • {employee?.employeeCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateTeamMemberRole(member.employeeId, value as 'MANAGER' | 'MEMBER' | 'VIEWER')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(member.employeeId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Created Successfully!</h3>
        <p className="text-gray-600">
          Your project "{createdProject?.name}" has been created and team members have been assigned.
        </p>
      </div>

      {createdProject && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Project Code:</span>
                <p className="text-gray-600">{createdProject.code}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-gray-600">{createdProject.status}</p>
              </div>
              <div>
                <span className="font-medium">Owner:</span>
                <p className="text-gray-600">{createdProject.owner?.name}</p>
              </div>
              <div>
                <span className="font-medium">Team Members:</span>
                <p className="text-gray-600">{selectedTeamMembers.length + 1} members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={handleClose}>
          Close
        </Button>
        <Button variant="outline" onClick={() => {
          resetForm();
          setCurrentStep(1);
        }}>
          Create Another Project
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Set up a new project with team members and initial configuration.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : handleClose()}
            >
              {currentStep > 1 ? 'Previous' : 'Cancel'}
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 1) {
                  if (validateStep1()) {
                    setCurrentStep(2);
                  }
                } else if (currentStep === 2) {
                  handleCreateProject();
                }
              }}
              disabled={loading}
            >
              {loading ? 'Creating...' : currentStep === 2 ? 'Create Project' : 'Next'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}