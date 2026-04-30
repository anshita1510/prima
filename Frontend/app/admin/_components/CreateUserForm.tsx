'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Loader2, UserPlus, Mail, Phone, User, Briefcase, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { userService, CreateUserData } from '@/app/services/userService';
import { authService } from '@/app/services/authService';
import { DESIGNATION_OPTIONS } from '@/lib/designation';

const ROLES = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function CreateUserForm() {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    designation: '',
    role: '',
    employeeCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          setCurrentUser(parsedUser);
          setIsAuthenticated(['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(parsedUser.role));
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Quick login for demo purposes
  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.quickAdminLogin();
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        setMessage({
          type: 'success',
          text: 'Successfully logged in as admin!'
        });

        // Test the debug endpoint
        await testDebugEndpoint();
      } else {
        // Try demo session as fallback
        const demoResult = authService.createDemoSession();
        setCurrentUser(demoResult.user);
        setIsAuthenticated(true);
        setMessage({
          type: 'success',
          text: 'Demo admin session created!'
        });

        // Test the debug endpoint
        await testDebugEndpoint();
      }
    } catch (error) {
      console.error('Quick login failed:', error);
      setMessage({
        type: 'error',
        text: 'Quick login failed. Please try manual login.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test debug endpoint
  const testDebugEndpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5004/api/users/debug-test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Debug endpoint response:', data);

      if (response.ok) {
        console.log('✅ Authentication working correctly');
      } else {
        console.log('❌ Authentication failed:', data);
      }
    } catch (error) {
      console.error('Debug endpoint error:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Employee Code validation (optional but if provided, should be valid)
    if (formData.employeeCode && formData.employeeCode.trim()) {
      if (formData.employeeCode.trim().length < 3) {
        newErrors.employeeCode = 'Employee ID must be at least 3 characters';
      } else if (!/^[A-Z0-9_-]+$/i.test(formData.employeeCode.trim())) {
        newErrors.employeeCode = 'Employee ID can only contain letters, numbers, hyphens, and underscores';
      }
    }

    // Designation validation
    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    // Clear general message when user makes changes
    if (message) {
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({
          type: 'error',
          text: 'You must be logged in to create users. Please log in first.'
        });
        setLoading(false);
        return;
      }

      // Check user role
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
          setMessage({
            type: 'error',
            text: 'You do not have permission to create users. Admin or Manager access required.'
          });
          setLoading(false);
          return;
        }
      }

      console.log('Creating user with data:', formData);
      console.log('Auth token present:', !!token);

      const result = await userService.createUser(formData);

      if (result.success) {
        window.alert(result.message || 'User created successfully! An invitation email has been sent.');
        setMessage({
          type: 'success',
          text: result.message || 'User created successfully! An invitation email has been sent.'
        });

        // Reset form on success
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          designation: '',
          role: '',
          employeeCode: ''
        });
        setErrors({});
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to create user. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Form submission error:', error);

      // More detailed error handling
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response.data?.error || error.response.data?.message;

        if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (status === 400) {
          errorMessage = serverMessage || 'Invalid request data. Please check your input.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      designation: '',
      role: '',
      employeeCode: ''
    });
    setErrors({});
    setMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Authentication Check */}
      {!isAuthenticated && (
        <Card className="shadow-lg mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <CardTitle className="text-xl font-bold text-orange-800">Authentication Required</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              You need to be logged in as an admin to create users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-orange-700">
                Current status: {currentUser ? `Logged in as ${currentUser.name} (${currentUser.role})` : 'Not logged in'}
              </p>
              <Button
                onClick={handleQuickLogin}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Quick Admin Login
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={`shadow-lg ${!isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold">Create New User</CardTitle>
          </div>
          <CardDescription>
            Add a new user to the system. An invitation email will be sent to the provided email address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address *</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>First Name *</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={loading}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.firstName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Last Name *</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.lastName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number *</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 000 0000"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Employee ID Field */}
            <div className="space-y-2">
              <Label htmlFor="employeeCode" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Employee ID</span>
                <span className="text-xs text-gray-500">(Optional - will auto-generate if not provided)</span>
              </Label>
              <Input
                id="employeeCode"
                type="text"
                placeholder="EMP001 or JOHN_DOE"
                value={formData.employeeCode}
                onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                className={errors.employeeCode ? 'border-red-500 focus:border-red-500' : ''}
                disabled={loading}
              />
              {errors.employeeCode && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.employeeCode}</span>
                </p>
              )}
              <p className="text-xs text-gray-500">
                Leave empty to auto-generate (e.g., EMP0001). Must be unique and contain only letters, numbers, hyphens, and underscores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Designation Field */}
              <div className="space-y-2">
                <Label htmlFor="designation" className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Designation *</span>
                </Label>
                <Select
                  value={formData.designation}
                  onValueChange={(value) => handleInputChange('designation', value)}
                >
                  <SelectTrigger
                    className={errors.designation ? 'border-red-500 focus:border-red-500' : ''}
                    disabled={loading}
                  >
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATION_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        <span className="font-medium">{d.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.designation && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.designation}</span>
                  </p>
                )}
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Role *</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger
                    className={errors.role ? 'border-red-500 focus:border-red-500' : ''}
                    disabled={loading}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        <span className="font-medium">{d.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.role}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User & Send Invitation
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Reset Form
              </Button>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• An invitation email will be sent to the provided email address</li>
              <li>• The user will receive a temporary password and OTP</li>
              <li>• They can set their permanent password using the OTP</li>
              <li>• Once activated, they can log in with their credentials</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}