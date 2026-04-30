'use client';

import { Task } from '@/app/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MessageSquare, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onView?: (task: Task) => void;
  onStatusChange?: (task: Task, status: Task['status']) => void;
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
};

export function TaskCard({ task, onEdit, onDelete, onView, onStatusChange }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold truncate">
          {task.title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(task)}>
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Edit Task
              </DropdownMenuItem>
            )}
            {onStatusChange && (
              <>
                <DropdownMenuItem onClick={() => onStatusChange(task, 'TODO')}>
                  Mark as Todo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task, 'IN_PROGRESS')}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task, 'IN_REVIEW')}>
                  Mark as In Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task, 'COMPLETED')}>
                  Mark as Completed
                </DropdownMenuItem>
              </>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(task)}
                className="text-red-600"
              >
                Delete Task
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center space-x-2">
            <Badge className={statusColors[task.status]}>
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive">Overdue</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
            {task.assignedTo && (
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span className="truncate">{task.assignedTo.name}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{task.estimatedHours}h estimated</span>
              </div>
            )}
            {task._count?.comments && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{task._count.comments} comments</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Project: {task.project.name}</span>
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}