"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';

const stats = [
  { title: 'Team Members', value: '24', icon: Users, change: '+2 this month' },
  { title: 'Leave Requests', value: '5', icon: Calendar, change: '3 pending' },
  { title: 'Attendance Rate', value: '96%', icon: TrendingUp, change: '+2% vs last week' },
  { title: 'Hours Logged', value: '186', icon: Clock, change: 'This week' },
];

const DashboardContent = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Here's what's happening with your team today.</p>
      </div>
        
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-PRIMAry/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-PRIMAry" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Team member checked in</p>
                    <p className="text-xs text-muted-foreground">{i} hour{i > 1 ? 's' : ''} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;