"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
class TaskRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async findMany(query) {
        const { page, limit, projectId, assignedToId, status, priority, isActive, companyId, employeeId, isManager } = query;
        const skip = (page - 1) * limit;
        const where = {
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
    async findById(id, companyId) {
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
    async update(id, data) {
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
    async delete(id, companyId) {
        return this.prisma.task.delete({
            where: {
                id,
                project: { companyId }
            }
        });
    }
    async addComment(taskId, data) {
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
    async checkTaskAccess(taskId, employeeId, companyId) {
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
    async getMyTasks(employeeId, companyId, status) {
        return this.prisma.task.findMany({
            where: {
                assignedToId: employeeId,
                project: { companyId },
                ...(status && { status: status }),
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
exports.TaskRepository = TaskRepository;
