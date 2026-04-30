'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Sidebar from "./_components/sidebar_u";
import { 
  BarChart3, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Calendar,
  FolderOpen,
  Target,
  Activity,
  PlayCircle,
  MessageSquare,
  PieChart as PieChartIcon
} from 'lucide-react';
import { authService } from '@/app/services/authService';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface DashboardStats {
  myTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  hoursLogged: number;
  attendanceRate: number;
}

interface RecentActivity {
  id: string;
  type: 'task_completed' | 'task_started' | 'time_logged' | 'comment_added';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export default function UserDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    myTasks: 12,
    completedTasks: 8,
    inProgressTasks: 3,
    overdueTasks: 1,
    hoursLogged: 38,
    attendanceRate: 96
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Chart data
  const attendanceData = [
    { day: 'Mon', hours: 8.5, status: 'Present' },
    { day: 'Tue', hours: 9.0, status: 'Present' },
    { day: 'Wed', hours: 7.5, status: 'Present' },
    { day: 'Thu', hours: 8.0, status: 'Present' },
    { day: 'Fri', hours: 9.5, status: 'Present' },
    { day: 'Sat', hours: 0, status: 'Weekend' },
    { day: 'Sun', hours: 0, status: 'Weekend' }
  ];

  const taskCompletionData = [
    { name: 'Completed', value: stats.completedTasks, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#3b82f6' },
    { name: 'Overdue', value: stats.overdueTasks, color: '#ef4444' }
  ];

  const weeklyProgressData = [
    { week: 'Week 1', completed: 5, assigned: 8 },
    { week: 'Week 2', completed: 7, assigned: 10 },
    { week: 'Week 3', completed: 6, assigned: 9 },
    { week: 'Week 4', completed: 8, assigned: 12 }
  ];

  const productivityData = [
    { month: 'Jan', tasks: 12, hours: 160 },
    { month: 'Feb', tasks: 15, hours: 168 },
    { month: 'Mar', tasks: 18, hours: 172 },
    { month: 'Apr', tasks: 14, hours: 165 },
    { month: 'May', tasks: 20, hours: 180 },
    { month: 'Jun', tasks: 16, hours: 170 }
  ];

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      setRecentActivity([
        {
          id: '1',
          type: 'task_completed',
          title: 'Task Completed',
          description: 'User interface design task was completed',
          timestamp: '2 hours ago',
          user: user?.name || 'You'
        },
        {
          id: '2',
          type: 'task_started',
          title: 'Task Started',
          description: 'Backend API development task was started',
          timestamp: '4 hours ago',
          user: user?.name || 'You'
        },
        {
          id: '3',
          type: 'time_logged',
          title: 'Time Logged',
          description: '3 hours logged for database optimization',
          timestamp: '6 hours ago',
          user: user?.name || 'You'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'task_started':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'time_logged':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const completionRate = stats.myTasks > 0 ? (stats.completedTasks / stats.myTasks) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-16 min-h-screen">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        {/* Page Header */}
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Employee'}</p>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.myTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.inProgressTasks} in progress
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Tasks finished
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{completionRate.toFixed(1)}%</div>
                <Progress value={completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.hoursLogged}</div>
                <p className="text-xs text-muted-foreground">
                  Time logged
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Attendance Chart */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Attendance
                </CardTitle>
                <CardDescription>
                  Your work hours this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Distribution Pie Chart */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Task Distribution
                </CardTitle>
                <CardDescription>
                  Current task status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskCompletionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Progress Chart */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Progress
                </CardTitle>
                <CardDescription>
                  Tasks completed vs assigned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assigned" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Productivity Trend */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Productivity Trend
                </CardTitle>
                <CardDescription>
                  Tasks and hours over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="tasks" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                    <Area type="monotone" dataKey="hours" stackId="2" stroke="#3b82f6" fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Actions */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/user/tasks">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    View My Tasks
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/user/projects">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    My Projects
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/user/attendance">
                    <Clock className="mr-2 h-4 w-4" />
                    Check Attendance
                  </a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/user/leave-management">
                    <Calendar className="mr-2 h-4 w-4" />
                    Request Leave
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  My Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
