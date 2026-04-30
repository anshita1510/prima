'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/tasks/TaskCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Task, Project, TaskStats } from '@/app/types/project';
import { taskService } from '@/app/services/taskService';
import { projectService } from '@/app/services/projectService';
import { authService } from '@/app/services/authService';
import { 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  User
} from 'lucide-react';

export default function DashboardPage() {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load my tasks
      const myTasksResponse = await taskService.getMyTasks();
      setMyTasks(myTasksResponse.data.slice(0, 6)); // Show only first 6

      // Load recent projects
      const projectsResponse = await projectService.getAllProjects();
      setRecentProjects(projectsResponse.data?.slice(0, 6) || []);

      // Load task statistics
      const statsResponse = await taskService.getTaskStats();
      setTaskStats(statsResponse.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (task: Task, status: Task['status']) => {
    try {
      await taskService.updateTask(task.id, { status });
      loadDashboardData(); // Reload to update stats
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const overdueTasks = myTasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    task.status !== 'COMPLETED'
  );

  const todayTasks = myTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome {user?.name || 'User'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your projects and tasks today
            </p>
            <div className="flex items-center mt-3 space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {user?.role || 'USER'}
              </Badge>
              <span className="text-blue-100">•</span>
              <span className="text-blue-100">{user?.designation || 'Team Member'}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">Track your progress and manage your work efficiently.</p>
      </div>

      {/* Stats Cards */}
      {taskStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Currently working on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Tasks finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Tasks */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">My Tasks</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/user/tasks'}
            >
              View All
            </Button>
          </div>

          {myTasks.length > 0 ? (
            <div className="space-y-4">
              {myTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  onView={(task) => window.location.href = `/user/tasks/${task.id}`}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckSquare className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center mb-4">No tasks assigned to you yet</p>
                <Button onClick={() => window.location.href = '/user/tasks'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/user/projects'}
            >
              View All
            </Button>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={(project) => window.location.href = `/user/projects/${project.id}`}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center mb-4">No projects available</p>
                <Button onClick={() => window.location.href = '/user/projects'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {(todayTasks.length > 0 || overdueTasks.length > 0) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todayTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Due Today ({todayTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {todayTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">{task.title}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/user/tasks/${task.id}`}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {overdueTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Overdue ({overdueTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm truncate">{task.title}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/user/tasks/${task.id}`}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}