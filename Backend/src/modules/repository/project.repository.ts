import { PrismaClient, Project, Employee } from '@prisma/client';
import { CreateProjectDtoType, UpdateProjectDtoType, ProjectQueryDtoType } from '../dto/project.dto';

export class ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProjectDtoType & { ownerId: number; companyId: number }) {
    const { memberIds, ...projectData } = data;
    
    return this.prisma.project.create({
      data: {
        ...projectData,
        members: memberIds?.length ? {
          connect: memberIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        owner: {
          select: { id: true, name: true, designation: true }
        },
        department: {
          select: { id: true, name: true }
        },
        members: {
          select: { id: true, name: true, designation: true }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });
  }

  async findMany(query: ProjectQueryDtoType & { companyId: number; employeeId?: number; isManager?: boolean }) {
    const { page, limit, departmentId, ownerId, isActive, companyId, employeeId, isManager } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      ...(departmentId && { departmentId }),
      ...(ownerId && { ownerId }),
      ...(isActive !== undefined && { isActive })
    };

    // If not a manager, only show projects where user is owner or member
    if (!isManager && employeeId) {
      where.OR = [
        { ownerId: employeeId },
        { members: { some: { id: employeeId } } }
      ];
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, name: true, designation: true }
          },
          department: {
            select: { id: true, name: true }
          },
          members: {
            select: { id: true, name: true, designation: true }
          },
          _count: {
            select: { tasks: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.project.count({ where })
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: number, companyId: number) {
    return this.prisma.project.findFirst({
      where: { id, companyId },
      include: {
        owner: {
          select: { id: true, name: true, designation: true }
        },
        department: {
          select: { id: true, name: true }
        },
        members: {
          select: { id: true, name: true, designation: true }
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async update(id: number, data: UpdateProjectDtoType & { companyId: number }) {
    const { memberIds, companyId, ...updateData } = data;
    
    return this.prisma.project.update({
      where: { id, companyId },
      data: {
        ...updateData,
        ...(memberIds && {
          members: {
            set: memberIds.map(id => ({ id }))
          }
        })
      },
      include: {
        owner: {
          select: { id: true, name: true, designation: true }
        },
        department: {
          select: { id: true, name: true }
        },
        members: {
          select: { id: true, name: true, designation: true }
        }
      }
    });
  }

  async delete(id: number, companyId: number) {
    return this.prisma.project.delete({
      where: { id, companyId }
    });
  }

  async checkAccess(projectId: number, employeeId: number, companyId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        companyId,
        OR: [
          { ownerId: employeeId },
          { members: { some: { id: employeeId } } }
        ]
      }
    });
    return !!project;
  }
}