import { PrismaClient, ProjectStatus, ProjectRole, TaskStatus, TaskPriority } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface CreateProjectData {
  name: string;
  description?: string;
  code?: string;
  companyId: number;
  departmentId: number;
  ownerId: number;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status?: ProjectStatus;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  code?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status?: ProjectStatus;
  progressPercentage?: number;
}

interface AssignTeamMemberData {
  projectId: number;
  employeeId: number;
  role: ProjectRole;
}

interface CreateTaskData {
  title: string;
  description?: string;
  code?: string;
  projectId: number;
  assignedToId?: number;
  createdById: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  milestoneId?: number;
  parentTaskId?: number;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedToId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage?: number;
  completedAt?: Date;
}

class ProjectService {
  // Project Management Methods
  async createProject(data: CreateProjectData, req: Request) {
    try {
      // Generate project code if not provided
      if (!data.code) {
        const projectCount = await prisma.project.count({
          where: { companyId: data.companyId }
        });
        data.code = `PRJ${String(projectCount + 1).padStart(3, '0')}`;
      }

      const project = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          code: data.code,
          companyId: data.companyId,
          departmentId: data.departmentId,
          ownerId: data.ownerId,
          status: data.status || ProjectStatus.PLANNING,
          startDate: data.startDate,
          endDate: data.endDate,
          budget: data.budget,
          progressPercentage: 0
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              designation: true
            }
          },
          department: {
            select: {
              name: true,
              type: true
            }
          },
          company: {
            select: {
              name: true,
              code: true
            }
          }
        }
      });

      // Automatically assign the owner as project manager
      await this.assignTeamMember({
        projectId: project.id,
        employeeId: data.ownerId,
        role: ProjectRole.MANAGER
      }, req);

      console.log(`✅ Project created: ${project.name} (ID: ${project.id}, Code: ${project.code})`);
      return project;
    } catch (error: any) {
      console.error('❌ Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async updateProject(projectId: number, data: UpdateProjectData, req: Request) {
    try {
      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              designation: true
            }
          },
          department: {
            select: {
              name: true,
              type: true
            }
          },
          projectRoles: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  employeeCode: true,
                  designation: true
                }
              }
            }
          },
          tasks: {
            select: {
              id: true,
              status: true
            }
          }
        }
      });

      console.log(`✅ Project updated: ${project.name} (ID: ${project.id})`);
      return project;
    } catch (error: any) {
      console.error('❌ Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async getProjectById(projectId: number) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              designation: true
            }
          },
          department: {
            select: {
              name: true,
              type: true
            }
          },
          company: {
            select: {
              name: true,
              code: true
            }
          },
          projectRoles: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  employeeCode: true,
                  designation: true
                }
              }
            },
            where: {
              isActive: true
            }
          },
          tasks: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  employeeCode: true
                }
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  employeeCode: true
                }
              }
            },
            where: {
              isActive: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          milestones: {
            orderBy: {
              dueDate: 'asc'
            }
          },
          _count: {
            select: {
              projectRoles: true,
              tasks: true
            }
          }
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      return {
        ...project,
        members: project.projectRoles, // Map projectRoles to members for consistency
        _count: {
          ...project._count,
          members: project._count.projectRoles // Map projectRoles count to members count
        }
      };
    } catch (error: any) {
      console.error('❌ Error fetching project:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }

  async getAllProjects(companyId?: number, departmentId?: number, ownerId?: number) {
    try {
      const whereClause: any = {
        isActive: true
      };

      if (companyId) whereClause.companyId = companyId;
      if (departmentId) whereClause.departmentId = departmentId;
      if (ownerId) whereClause.ownerId = ownerId;

      const projects = await prisma.project.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              designation: true
            }
          },
          department: {
            select: {
              name: true,
              type: true
            }
          },
          projectRoles: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  employeeCode: true
                }
              }
            },
            where: {
              isActive: true
            }
          },
          tasks: {
            select: {
              id: true,
              status: true
            },
            where: {
              isActive: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calculate project statistics
      const projectsWithStats = projects.map((project: any) => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter((task: any) => task.status === TaskStatus.COMPLETED).length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project,
          members: project.projectRoles, // Map projectRoles to members for consistency
          _count: {
            members: project.projectRoles?.length || 0,
            tasks: totalTasks
          },
          stats: {
            totalTasks,
            completedTasks,
            progressPercentage,
            teamMembersCount: project.projectRoles?.length || 0
          }
        };
      });

      return projectsWithStats;
    } catch (error: any) {
      console.error('❌ Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  async deleteProject(projectId: number, req: Request) {
    try {
      // Soft delete - mark as inactive
      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Project deleted: ${project.name} (ID: ${project.id})`);
      return project;
    } catch (error: any) {
      console.error('❌ Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // Team Member Management Methods
  async assignTeamMember(data: AssignTeamMemberData, req: Request) {
    try {
      // Check if member is already assigned
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_employeeId: {
            projectId: data.projectId,
            employeeId: data.employeeId
          }
        }
      });

      if (existingMember) {
        if (existingMember.isActive) {
          throw new Error('Employee is already assigned to this project');
        } else {
          // Reactivate existing member
          const updatedMember = await prisma.projectMember.update({
            where: { id: existingMember.id },
            data: {
              role: data.role,
              isActive: true,
              joinedAt: new Date(),
              leftAt: null
            },
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  employeeCode: true,
                  designation: true
                }
              },
              project: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          });

          console.log(`✅ Team member reactivated: ${updatedMember.employee.name} to ${updatedMember.project.name}`);
          return updatedMember;
        }
      }

      // Create new team member assignment
      const projectMember = await prisma.projectMember.create({
        data: {
          projectId: data.projectId,
          employeeId: data.employeeId,
          role: data.role,
          isActive: true
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              designation: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      console.log(`✅ Team member assigned: ${projectMember.employee.name} to ${projectMember.project.name} as ${projectMember.role}`);
      return projectMember;
    } catch (error: any) {
      console.error('❌ Error assigning team member:', error);
      throw new Error(`Failed to assign team member: ${error.message}`);
    }
  }

  async removeTeamMember(projectId: number, employeeId: number, req: Request) {
    try {
      const projectMember = await prisma.projectMember.update({
        where: {
          projectId_employeeId: {
            projectId,
            employeeId
          }
        },
        data: {
          isActive: false,
          leftAt: new Date()
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      console.log(`✅ Team member removed: ${projectMember.employee.name} from ${projectMember.project.name}`);
      return projectMember;
    } catch (error: any) {
      console.error('❌ Error removing team member:', error);
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  }

  async updateTeamMemberRole(projectId: number, employeeId: number, role: ProjectRole, req: Request) {
    try {
      const projectMember = await prisma.projectMember.update({
        where: {
          projectId_employeeId: {
            projectId,
            employeeId
          }
        },
        data: {
          role,
          updatedAt: new Date()
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      console.log(`✅ Team member role updated: ${projectMember.employee.name} in ${projectMember.project.name} to ${role}`);
      return projectMember;
    } catch (error: any) {
      console.error('❌ Error updating team member role:', error);
      throw new Error(`Failed to update team member role: ${error.message}`);
    }
  }

  async getProjectTeamMembers(projectId: number) {
    try {
      const teamMembers = await prisma.projectMember.findMany({
        where: {
          projectId,
          isActive: true
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              designation: true,
              user: {
                select: {
                  email: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: {
          joinedAt: 'asc'
        }
      });

      return teamMembers;
    } catch (error: any) {
      console.error('❌ Error fetching team members:', error);
      throw new Error(`Failed to fetch team members: ${error.message}`);
    }
  }

  // Task Management Methods
  async createTask(data: CreateTaskData, req: Request) {
    try {
      // Generate task code if not provided
      if (!data.code) {
        const taskCount = await prisma.task.count({
          where: { projectId: data.projectId }
        });
        data.code = `TSK${String(taskCount + 1).padStart(3, '0')}`;
      }

      const task = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          code: data.code,
          projectId: data.projectId,
          assignedToId: data.assignedToId,
          createdById: data.createdById,
          status: data.status || TaskStatus.TODO,
          priority: data.priority || TaskPriority.MEDIUM,
          dueDate: data.dueDate,
          startDate: data.startDate,
          estimatedHours: data.estimatedHours,
          milestoneId: data.milestoneId,
          parentTaskId: data.parentTaskId,
          progressPercentage: 0
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      console.log(`✅ Task created: ${task.title} (ID: ${task.id}, Code: ${task.code})`);
      return task;
    } catch (error: any) {
      console.error('❌ Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async updateTask(taskId: number, data: UpdateTaskData, req: Request) {
    try {
      // If status is being changed to COMPLETED, set completedAt
      if (data.status === TaskStatus.COMPLETED && !data.completedAt) {
        data.completedAt = new Date();
        data.progressPercentage = 100;
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      console.log(`✅ Task updated: ${task.title} (ID: ${task.id})`);
      return task;
    } catch (error: any) {
      console.error('❌ Error updating task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async getProjectTasks(projectId: number, status?: TaskStatus, assignedToId?: number) {
    try {
      const whereClause: any = {
        projectId,
        isActive: true
      };

      if (status) whereClause.status = status;
      if (assignedToId) whereClause.assignedToId = assignedToId;

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              employeeCode: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
              dueDate: true
            }
          },
          parentTask: {
            select: {
              id: true,
              title: true,
              code: true
            }
          },
          subTasks: {
            select: {
              id: true,
              title: true,
              status: true
            },
            where: {
              isActive: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return tasks;
    } catch (error: any) {
      console.error('❌ Error fetching tasks:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
  }

  async deleteTask(taskId: number, req: Request) {
    try {
      // Soft delete - mark as inactive
      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Task deleted: ${task.title} (ID: ${task.id})`);
      return task;
    } catch (error: any) {
      console.error('❌ Error deleting task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  // Dashboard and Analytics Methods
  async getProjectDashboardStats(companyId?: number, departmentId?: number) {
    try {
      const whereClause: any = {
        isActive: true
      };

      if (companyId) whereClause.companyId = companyId;
      if (departmentId) whereClause.departmentId = departmentId;

      const [
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalTasks,
        completedTasks,
        overdueTasks
      ] = await Promise.all([
        prisma.project.count({ where: whereClause }),
        prisma.project.count({ where: { ...whereClause, status: ProjectStatus.ACTIVE } }),
        prisma.project.count({ where: { ...whereClause, status: ProjectStatus.COMPLETED } }),
        prisma.project.count({ where: { ...whereClause, status: ProjectStatus.ON_HOLD } }),
        prisma.task.count({
          where: {
            project: whereClause,
            isActive: true
          }
        }),
        prisma.task.count({
          where: {
            project: whereClause,
            isActive: true,
            status: TaskStatus.COMPLETED
          }
        }),
        prisma.task.count({
          where: {
            project: whereClause,
            isActive: true,
            dueDate: {
              lt: new Date()
            },
            status: {
              not: TaskStatus.COMPLETED
            }
          }
        })
      ]);

      return {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          onHold: onHoldProjects,
          planning: totalProjects - activeProjects - completedProjects - onHoldProjects
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          inProgress: totalTasks - completedTasks
        }
      };
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }

  // Utility Methods
  async getAvailableEmployees(companyId: number, departmentId?: number) {
    try {
      const whereClause: any = {
        companyId,
        isActive: true
      };

      if (departmentId) whereClause.departmentId = departmentId;

      const employees = await prisma.employee.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          employeeCode: true,
          designation: true,
          user: {
            select: {
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return employees;
    } catch (error: any) {
      console.error('❌ Error fetching available employees:', error);
      throw new Error(`Failed to fetch available employees: ${error.message}`);
    }
  }
}

export const projectService = new ProjectService();