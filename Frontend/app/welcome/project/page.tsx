'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderOpen,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { authService } from '@/app/services/authService';
import { projectService } from '@/app/services/project.service';

export default function WelcomeProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWelcomeData();
  }, []);

  const loadWelcomeData = async () => {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const currentUser = authService.getStoredUser();
      setUser(currentUser);

      // Load user's projects
      const response = await projectService.getProjects();
      if (response.success) {
        setProjects(response.data?.projects || response.data || []);
      }
    } catch (error) {
      console.error('Error loading welcome data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToTMS = () => {
    router.push('/enhanced-tms/dashboard');
  };

  const handleNavigateToProjects = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin/project');
    } else if (user?.role === 'SUPER_ADMIN') {
      router.push('/superAdmin/projects');
    } else {
      router.push('/user/projects');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access the project management system.</p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Project Management
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Hello, {user.name}!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="bg-white">
              Role: {user.role}
            </Badge>
            <Badge variant="outline" className="bg-white">
              Designation: {user.designation}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <p className="text-xs text-gray-500">Active projects</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Access</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {user.role === 'ADMIN' || user.designation === 'MANAGER' ? 'Full' : 'Limited'}
              </div>
              <p className="text-xs text-gray-500">Access level</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-gray-500">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Access Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Access Permissions */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Your Access Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Create Projects</span>
                  <Badge variant={user.role === 'ADMIN' || user.designation === 'MANAGER' || user.designation === 'TECH_LEAD' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' || user.designation === 'MANAGER' || user.designation === 'TECH_LEAD' ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Manage Tasks</span>
                  <Badge variant="default">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">View All Projects</span>
                  <Badge variant={user.role === 'ADMIN' || user.designation === 'HR' || user.designation === 'DIRECTOR' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' || user.designation === 'HR' || user.designation === 'DIRECTOR' ? 'Allowed' : 'Limited'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Team Management</span>
                  <Badge variant={user.role === 'ADMIN' || user.designation === 'MANAGER' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' || user.designation === 'MANAGER' ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-green-500" />
                <span>Recent Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.code}</p>
                      </div>
                      <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={handleNavigateToProjects}
                  >
                    View All Projects
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No projects found</p>
                  <p className="text-gray-400 text-xs">Start by creating your first project</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Button
              size="lg"
              onClick={handleNavigateToTMS}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FolderOpen className="h-5 w-5 mr-2" />
              Go to Enhanced TMS Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleNavigateToProjects}
            >
              <Users className="h-5 w-5 mr-2" />
              Manage Projects
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Need help? Check out our{' '}
            <Button variant="link" className="p-0 h-auto text-blue-600">
              documentation
            </Button>{' '}
            or contact support.
          </p>
        </div>

        {/* Role-specific Information */}
        {(user.role === 'ADMIN' || user.designation === 'MANAGER') && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Administrator Access Confirmed
                  </h3>
                  <p className="text-blue-800 text-sm">
                    You have full access to the Task Management System. You can create projects,
                    manage teams, assign tasks, and view comprehensive analytics across all departments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}