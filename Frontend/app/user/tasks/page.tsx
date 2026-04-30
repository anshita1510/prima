'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Sidebar from '../_components/sidebar_u';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  FolderOpen,
  User,
  TrendingUp
} from 'lucide-react';
import { projectService } from '@/app/services/projectService';
import { authService } from '@/app/services/authService';

interface Task {
  id: number;
  title: string;
  description?: string;
  code: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage: number;
  project: {
    id: number;
    name: string;
    code: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    employeeCode: string;
  };
  createdBy: {
    id: number;
    name: string;
    employeeCode: string;
  };
}

export default function UserTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    if (currentUser) {
      loadMyTasks();
    }
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, activeTab]);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User information not found. Please log in again.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userStr);

      if (!userData.employeeId) {
        setError('Employee ID not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      console.log('📥 Loading tasks for employee:', userData.employeeId);

      // First, get all projects where user is a member
      const projectsResult = await projectService.getAllProjects(userData.companyId);

      if (!projectsResult.success) {
        setError('Failed to load projects: ' + projectsResult.message);
        setLoading(false);
        return;
      }

      // Filter projects where user is a member
      const userProjects = projectsResult.data.filter((project: any) =>
        project.members?.some((member: any) => member.employeeId === userData.employeeId && member.isActive)
      );

      setProjects(userProjects);
      console.log('📊 User is member of', userProjects.length, 'projects');

      // Get tasks from all user's projects
      const allTasks: Task[] = [];

      for (const project of userProjects) {
        try {
          const tasksResult = await projectService.getProjectTasks(project.id);

          if (tasksResult.success && tasksResult.data) {
            // Filter tasks assigned to this user and ensure project data is included
            const userTasks = tasksResult.data
              .filter((task: any) => task.assignedTo?.id === userData.employeeId)
              .map((task: any) => ({
                ...task,
                // Ensure project data is included
                project: task.project || {
                  id: project.id,
                  name: project.name,
                  code: project.code
                }
              }));

            console.log(`✅ Found ${userTasks.length} tasks in project ${project.name}`);
            allTasks.push(...userTasks);
          }
        } catch (err) {
          console.error(`Error loading tasks for project ${project.id}:`, err);
        }
      }

      console.log('✅ Loaded', allTasks.length, 'tasks assigned to user');
      setTasks(allTasks);

      if (allTasks.length === 0 && userProjects.length === 0) {
        setError('You are not assigned to any projects yet. Contact your manager to get assigned to projects.');
      } else if (allTasks.length === 0) {
        setError('No tasks assigned to you yet.');
      }
    } catch (err: any) {
      console.error('❌ Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    switch (activeTab) {
      case 'todo':
        filtered = tasks.filter(task => task.status === 'TODO');
        break;
      case 'in-progress':
        filtered = tasks.filter(task => task.status === 'IN_PROGRESS');
        break;
      case 'in-review':
        filtered = tasks.filter(task => task.status === 'IN_REVIEW');
        break;
      case 'completed':
        filtered = tasks.filter(task => task.status === 'COMPLETED');
        break;
      default:
        filtered = tasks;
    }

    setFilteredTasks(filtered);
  };

  const getStatusBadge = (status: string) => {
    const colorClass = projectService.getStatusColor(status);
    return (
      <Badge className={`${colorClass} border-0`}>
        {status === 'TODO' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'IN_PROGRESS' && <TrendingUp className="w-3 h-3 mr-1" />}
        {status === 'COMPLETED' && <CheckSquare className="w-3 h-3 mr-1" />}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colorClass = projectService.getPriorityColor(priority);
    return (
      <Badge className={`${colorClass} border-0`}>
        {priority}
      </Badge>
    );
  };

  const getTabCounts = () => {
    return {
      all: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length
    };
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && filteredTasks.find(t => t.dueDate === dueDate)?.status !== 'COMPLETED';
  };

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        <Sidebar />
        <main className="flex-1 min-w-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3b82f6' }} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden">
        {/* Header Section */}
        <div className="px-8 py-6 sticky top-0 z-10"
          style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>My Tasks</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>View and manage your assigned tasks</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}>
                  EMPLOYEE
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{tasks.length}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {error && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <CheckSquare className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-orange-600">{tabCounts.inProgress}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-7 h-7 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{tabCounts.completed}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckSquare className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Projects</p>
                      <p className="text-3xl font-bold text-purple-600">{projects.length}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FolderOpen className="w-7 h-7 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-12 mb-8">
                <TabsTrigger value="all" className="text-sm font-medium">
                  All ({tabCounts.all})
                </TabsTrigger>
                <TabsTrigger value="todo" className="text-sm font-medium">
                  To Do ({tabCounts.todo})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="text-sm font-medium">
                  In Progress ({tabCounts.inProgress})
                </TabsTrigger>
                <TabsTrigger value="in-review" className="text-sm font-medium">
                  In Review ({tabCounts.inReview})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-sm font-medium">
                  Completed ({tabCounts.completed})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CheckSquare className="w-5 h-5" />
                      {activeTab === 'all' && 'All Tasks'}
                      {activeTab === 'todo' && 'To Do Tasks'}
                      {activeTab === 'in-progress' && 'In Progress Tasks'}
                      {activeTab === 'in-review' && 'In Review Tasks'}
                      {activeTab === 'completed' && 'Completed Tasks'}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {activeTab === 'all' && 'All your assigned tasks across all projects'}
                      {activeTab === 'todo' && 'Tasks waiting to be started'}
                      {activeTab === 'in-progress' && 'Tasks you are currently working on'}
                      {activeTab === 'in-review' && 'Tasks pending review'}
                      {activeTab === 'completed' && 'Your completed tasks'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <CheckSquare className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-base">
                          {activeTab === 'all' ? 'No tasks assigned to you yet' : `No ${activeTab.replace('-', ' ')} tasks`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className="border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white"
                          >
                            <div className="space-y-4">
                              {/* Task Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{task.title}</h3>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {getStatusBadge(task.status)}
                                    {getPriorityBadge(task.priority)}
                                    {isOverdue(task.dueDate) && (
                                      <Badge className="bg-red-100 text-red-800 border-0">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Overdue
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Task Description */}
                              {task.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
                              )}

                              {/* Task Metadata */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-y border-gray-100">
                                {task.project && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FolderOpen className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{task.project.name}</span>
                                  </div>
                                )}

                                {task.dueDate && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                  </div>
                                )}

                                {task.createdBy && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">By: {task.createdBy.name}</span>
                                  </div>
                                )}
                              </div>

                              {/* Progress Bar */}
                              {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 font-medium">Progress</span>
                                    <span className="font-semibold text-gray-900">{task.progressPercentage}%</span>
                                  </div>
                                  <Progress value={task.progressPercentage} className="h-2.5" />
                                </div>
                              )}

                              {/* Task Footer */}
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                                <span className="font-medium">
                                  {task.code ? `Task Code: ${task.code}` : 'No task code'}
                                </span>
                                {task.estimatedHours && (
                                  <span>
                                    Estimated: {task.estimatedHours}h
                                    {task.actualHours && ` | Actual: ${task.actualHours}h`}
                                  </span>
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
        </div>
      </main>
    </div>
  );
}