'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PageHeader from '../../admin/_components/PageHeader';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { projectService } from '@/app/services/projectService';
import { ProjectDetailView } from '@/components/projects/ProjectDetailView';
import { Loader, Plus, Search, Filter, FolderOpen, Trash2, Users, Calendar } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await projectService.getAllProjects();
      setProjects(result.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (projectId: number) => {
    try {
      const result = await projectService.getProjectTasks(projectId);
      setTasks(result.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleProjectCreated = () => {
    loadProjects();
    setIsCreateProjectOpen(false);
  };

  const handleTaskCreated = () => {
    if (selectedProject) {
      loadProjectTasks(selectedProject.id);
    }
    setIsCreateTaskOpen(false);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        loadProjects();
        setSelectedProject(null);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await projectService.deleteTask(taskId);
        if (selectedProject) {
          loadProjectTasks(selectedProject.id);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await projectService.updateTask(taskId, { status: newStatus as any });
      if (selectedProject) {
        loadProjectTasks(selectedProject.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'ON_HOLD': 'bg-yellow-100 text-yellow-800',
      'PLANNING': 'bg-purple-100 text-purple-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'TODO': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'IN_REVIEW': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && projects.length === 0) {
    return (
      <div className="flex min-h-[40vh] w-full flex-1 flex-col items-center justify-center gap-4">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Loading projects…</p>
      </div>
    );
  }

  // Project Detail View
  if (selectedProject) {
    return (
      <>
        <PageHeader
          title={selectedProject.name}
          subtitle="Project Details & Task Management"
        />
        <div className="p-6">
          <ProjectDetailView
            project={selectedProject}
            tasks={tasks}
            onBack={() => setSelectedProject(null)}
            onAddTask={() => setIsCreateTaskOpen(true)}
            onDeleteProject={handleDeleteProject}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </div>

        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSuccess={handleTaskCreated}
          projectId={selectedProject.id}
        />
      </>
    );
  }

  // Projects List View
  return (
    <>
      <PageHeader
        title="Enhanced Projects"
        subtitle="Manage and track your project progress"
      >
        <Button className="flex items-center gap-2" onClick={() => setIsCreateProjectOpen(true)}>
          <Plus className="w-4 h-4" />
          Create New Project
        </Button>
      </PageHeader>
      <div className="p-6">
        <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="card-hover cursor-pointer"
                    onClick={() => {
                      setSelectedProject(project);
                      loadProjectTasks(project.id);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                          <Badge className={getStatusColor(project.status)}>
                            {project.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{project.progressPercentage}%</span>
                        </div>
                        <Progress value={project.progressPercentage} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{project._count?.members || 0} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Tasks Summary */}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasks</span>
                          <span className="font-medium">
                            {project._count?.tasks || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
                </p>
                <Button 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => setIsCreateProjectOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create New Project
                </Button>
              </div>
            )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </>
  );
}
