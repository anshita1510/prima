import { PrismaClient } from '@prisma/client';
import { CreateTaskDtoType, UpdateTaskDtoType, TaskQueryDtoType, CreateTaskCommentDtoType } from '../dto/task.dto';

export class TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateTaskDtoType & { createdById: number }) {
    const { dueDate, startDate, ...taskData } = data;
    
    return this.prisma.task.create({
      data: {
        ...taskData,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, designation: true }
        },
        createdBy: {
          select: { id: true, name: true, designation: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findMany(query: TaskQueryDtoType & { companyId: number | null; employeeId?: number; isManager?: boolean }) {
    const { page, limit, projectId, assignedToId, status, priority, isActive, companyId, employeeId, isManager } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(companyId && { project: { companyId } }), // Only filter by company if companyId is provided
      ...(projectId && { projectId }),
      ...(assignedToId && { assignedToId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(isActive !== undefined && { isActive })
    };

    // If not a manager, only show tasks from projects where user has access
    if (!isManager && employeeId && companyId) {
      where.project = {
        companyId, // Keep company filter for non-managers
        OR: [
          { ownerId: employeeId },
          { members: { some: { id: employeeId } } }
        ]
      };
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, designation: true }
          },
          createdBy: {
            select: { id: true, name: true, designation: true }
          },
          project: {
            select: { id: true, name: true }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: number, companyId: number) {
    return this.prisma.task.findFirst({
      where: { 
        id, 
        project: { companyId }
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, designation: true }
        },
        createdBy: {
          select: { id: true, name: true, designation: true }
        },
        project: {
          select: { id: true, name: true, ownerId: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, designation: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async update(id: number, data: UpdateTaskDtoType & { companyId: number }) {
    const { dueDate, startDate, companyId, ...updateData } = data;
    
    return this.prisma.task.update({
      where: { 
        id,
        project: { companyId }
      },
      data: {
        ...updateData,
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(startDate && { startDate: new Date(startDate) })
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, designation: true }
        },
        createdBy: {
          select: { id: true, name: true, designation: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async delete(id: number, companyId: number) {
    return this.prisma.task.delete({
      where: { 
        id,
        project: { companyId }
      }
    });
  }

  async addComment(taskId: number, data: CreateTaskCommentDtoType & { authorId: number; companyId: number }) {
    const { companyId, ...commentData } = data;
    
    return this.prisma.taskComment.create({
      data: {
        ...commentData,
        taskId
      },
      include: {
        author: {
          select: { id: true, name: true, designation: true }
        }
      }
    });
  }

  async checkTaskAccess(taskId: number, employeeId: number, companyId: number) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          companyId,
          OR: [
            { ownerId: employeeId },
            { members: { some: { id: employeeId } } }
          ]
        }
      }
    });
    return !!task;
  }

  async getMyTasks(employeeId: number, companyId: number, status?: string) {
    return this.prisma.task.findMany({
      where: {
        assignedToId: employeeId,
        project: { companyId },
        ...(status && { status: status as any }),
        isActive: true
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
  }
}