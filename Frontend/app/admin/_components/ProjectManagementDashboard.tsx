'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FolderOpen,
  Plus,
  Calendar,
  Users,
  MoreVertical,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  CheckSquare,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Building,
  DollarSign,
  AlertCircle,
  User
} from 'lucide-react';
import { projectService, Project, ProjectMember, Task, Employee } from '@/app/services/projectService';
import { authService } from '@/app/services/authService';
import CreateProjectForm from './CreateProjectForm';

interface ProjectManagementDashboardProps {
  className?: string;
}

export default function ProjectManagementDashboard({ className }: ProjectManagementDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
    if (currentUser && currentUser.companyId) {
      loadProjects(currentUser.companyId);
      loadDashboardStats(currentUser.companyId);
    }
  }, []);

  const loadProjects = async (companyId: number) => {
    try {
      setLoading(true);
      const result = await projectService.getAllProjects(companyId);
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async (companyId: number) => {
    try {
      const result = await projectService.getDashboardStats(companyId);
      if (result.success) {
        setDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadAvailableEmployees = async () => {
    const companyId = user?.companyId;
    if (!companyId) return;

    try {
      const result = await projectService.getAvailableEmployees(companyId);
      if (result.success) {
        setAvailableEmployees(result.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    if (user?.companyId) {
      loadDashboardStats(user.companyId);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const result = await projectService.deleteProject(projectId);
      if (result.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (user?.companyId) {
          loadDashboardStats(user.companyId);
        }
        alert('Project deleted successfully');
      } else {
        alert(`Failed to delete project: ${result.message}`);
      }
    } catch (error: any) {
      alert(`Error deleting project: ${error.message}`);
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

  const handleManageTeam = async (project: Project) => {
    setSelectedProject(project);
    await loadAvailableEmployees();
    setShowTeamManagement(true);
  };

  const handleAssignTeamMember = async (employeeId: number, role: 'MANAGER' | 'MEMBER' | 'VIEWER') => {
    if (!selectedProject) return;

    try {
      const result = await projectService.assignTeamMember(selectedProject.id, { employeeId, role });
      if (result.success) {
        // Reload project details
        const updatedProject = await projectService.getProject(selectedProject.id);
        if (updatedProject.success) {
          setSelectedProject(updatedProject.data);
        }
        alert('Team member assigned successfully');
      } else {
        alert(`Failed to assign team member: ${result.message}`);
      }
    } catch (error: any) {
      alert(`Error assigning team member: ${error.message}`);
    }
  };

  const handleRemoveTeamMember = async (employeeId: number) => {
    if (!selectedProject) return;
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const result = await projectService.removeTeamMember(selectedProject.id, employeeId);
      if (result.success) {
        // Reload project details
        const updatedProject = await projectService.getProject(selectedProject.id);
        if (updatedProject.success) {
          setSelectedProject(updatedProject.data);
        }
        alert('Team member removed successfully');
      } else {
        alert(`Failed to remove team member: ${result.message}`);
      }
    } catch (error: any) {
      alert(`Error removing team member: ${error.message}`);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-PRIMAry"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Create and manage projects with dynamic team assignment</p>
        </div>
        <CreateProjectForm onProjectCreated={handleProjectCreated} />
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.projects.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.projects.active} active projects
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardStats.projects.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.projects.total > 0 ?
                  Math.round((dashboardStats.projects.completed / dashboardStats.projects.total) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.tasks.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.tasks.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardStats.tasks.overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>
      )}

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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProject(project)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageTeam(project)}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first project'}
          </p>
          <CreateProjectForm onProjectCreated={handleProjectCreated} />
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

              {/* Tasks Summary */}
              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedProject.tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500">
                              Assigned to: {task.assignedTo?.name || 'Unassigned'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Team Management Dialog */}
      <Dialog open={showTeamManagement} onOpenChange={setShowTeamManagement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage Team - {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>
              Add or remove team members and manage their roles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
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
                    handleAssignTeamMember(employeeId, 'MEMBER');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees
                        .filter(emp => !selectedProject?.members?.some(member => member.employeeId === emp.id))
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

            {/* Current Team Members */}
            {selectedProject?.members && selectedProject.members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedProject.members.map((member) => (
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
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                          {member.role !== 'OWNER' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTeamMember(member.employeeId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}