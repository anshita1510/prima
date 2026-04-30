'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  FolderOpen, 
  Calendar, 
  Users, 
  Search,
  Eye,
  Target,
  DollarSign,
  User
} from 'lucide-react';
import Sidebar from '../_components/sidebar_u';
import { projectService, Project } from '@/app/services/projectService';
import { authService } from '@/app/services/authService';

export default function UserProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
    if (currentUser) {
      loadMyProjects();
    }
  }, []);

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('User not found in localStorage');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userStr);
      
      if (!userData.employeeId) {
        console.error('Employee ID not found for user');
        setLoading(false);
        return;
      }

      console.log('📥 Loading projects for employee:', userData.employeeId);
      
      // Fetch all projects for the company
      const result = await projectService.getAllProjects(userData.companyId);
      
      if (result.success && result.data) {
        console.log('📊 Total projects in company:', result.data.length);
        
        // Filter projects where the employee is a team member
        const employeeProjects = result.data.filter((project: any) => {
          // Check if employee is in the members/projectRoles array
          const isMember = project.members?.some((member: any) => 
            member.employeeId === userData.employeeId && member.isActive
          );
          
          // Also check if employee is the project owner
          const isOwner = project.ownerId === userData.employeeId;
          
          return isMember || isOwner;
        });
        
        console.log('✅ Employee is member of', employeeProjects.length, 'projects');
        setProjects(employeeProjects);
      } else {
        console.error('Failed to load projects:', result.message);
        setProjects([]);
      }
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = async (project: Project) => {
    try {
      const result = await projectService.getProject(project.id);
      if (result.success) {
        setSelectedProject(result.data);
        setShowProjectDetails(true);
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return projectService.getStatusColor(status);
  };

  const getRoleColor = (role: string) => {
    return projectService.getRoleColor(role);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-16 min-h-screen pt-16 lg:pt-0">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-PRIMAry"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-16 min-h-screen pt-16 lg:pt-0">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">View projects you're assigned to</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              EMPLOYEE
            </span>
            <span className="text-sm text-gray-500">View Only</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.stats?.progressPercentage || 0}%</span>
                    </div>
                    <Progress value={project.stats?.progressPercentage || 0} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{project.stats?.teamMembersCount || 0} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0} tasks
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  {project.endDate && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {projectService.formatDate(project.endDate)}</span>
                      </div>
                    </div>
                  )}

                  {/* Budget */}
                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget: ${project.budget.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : projects.length === 0
                    ? 'You are not assigned to any projects yet. Contact your manager to get assigned to a project.'
                    : 'No projects match your current filters'}
              </p>
            </div>
          )}

          {/* Project Details Dialog */}
          <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  {selectedProject?.name}
                </DialogTitle>
                <DialogDescription>
                  Project details and team information
                </DialogDescription>
              </DialogHeader>

              {selectedProject && (
                <div className="space-y-6">
                  {/* Project Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Code:</span>
                        <p className="text-gray-600">{selectedProject.code}</p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge className={getStatusColor(selectedProject.status)}>
                          {selectedProject.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-gray-600">{selectedProject.owner?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Department:</span>
                        <p className="text-gray-600">{selectedProject.department?.name}</p>
                      </div>
                      {selectedProject.startDate && (
                        <div>
                          <span className="font-medium">Start Date:</span>
                          <p className="text-gray-600">{projectService.formatDate(selectedProject.startDate)}</p>
                        </div>
                      )}
                      {selectedProject.endDate && (
                        <div>
                          <span className="font-medium">End Date:</span>
                          <p className="text-gray-600">{projectService.formatDate(selectedProject.endDate)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Team Members */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        Team Members
                        <Badge variant="outline">{selectedProject.members?.length || 0} members</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProject.members?.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{member.employee.name}</p>
                                <p className="text-sm text-gray-500">
                                  {member.employee.designation} • {member.employee.employeeCode}
                                </p>
                              </div>
                            </div>
                            <Badge className={getRoleColor(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
