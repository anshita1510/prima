export interface Project {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    designation: string;
  };
  department: {
    id: number;
    name: string;
  };
  members: Array<{
    id: number;
    name: string;
    designation: string;
  }>;
  _count: {
    tasks: number;
  };
  tasks?: Task[];
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: number;
    name: string;
    designation: string;
  };
  createdBy: {
    id: number;
    name: string;
    designation: string;
  };
  project: {
    id: number;
    name: string;
  };
  comments?: TaskComment[];
  _count?: {
    comments: number;
  };
}

export interface TaskComment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    designation: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  departmentId: number;
  memberIds?: number[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  departmentId?: number;
  memberIds?: number[];
  isActive?: boolean;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  assignedToId?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedToId?: number;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  isActive?: boolean;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  completed: number;
  cancelled: number;
}