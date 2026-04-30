import { PrismaClient, ProjectStatus, ProjectRole } from '@prisma/client';
import { AuthorizationUtil, UserContext } from '../../../shared/utils/authorization.util';

const prisma = new PrismaClient();

export interface CreateProjectRequest {
  name: string;
  description?: string;
  code?: string;
  companyId: number;
  departmentId: number;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status?: ProjectStatus;
  teamMembers?: {
    employeeId: number;
    role: ProjectRole;
  }[];
}

export interface CreateProjectResponse {
  success: boolean;
  data?: any;
  message: string;
  errors?: string[];
}

export class CreateProjectUsecase {
  /**
   * Execute project creation with full authorization and validation
   */
  async execute(
    request: CreateProjectRequest,
    creator: UserContext
  ): Promise<CreateProjectResponse> {
    try {
      // Step 1: Authorization Check
      const canCreate = await AuthorizationUtil.canCreateProject(creator);
      if (!canCreate) {
        return {
          success: false,
          message: 'Insufficient permissions to create projects',
          errors: ['User does not have project creation permissions']
        };
      }

      // Step 2: Input Validation
      const validationResult = await this.validateInput(request, creator);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationResult.errors
        };
      }

      // Step 3: Business Logic Validation
      const businessValidation = await this.validateBusinessRules(request, creator);
      if (!businessValidation.isValid) {
        return {
          success: false,
          message: 'Business rule validation failed',
          errors: businessValidation.errors
        };
      }

      // Step 4: Create Project with Transaction
      const project = await this.createProjectWithTeam(request, creator);

      // Step 5: Audit Log (if needed)
      await this.createAuditLog(project.id, creator, 'PROJECT_CREATED');

      return {
        success: true,
        data: project,
        message: 'Project created successfully'
      };

    } catch (error: any) {
      console.error('Error in CreateProjectUsecase:', error);
      return {
        success: false,
        message: 'Failed to create project',
        errors: [error.message || 'Unknown error occurred']
      };
    }
  }

  /**
   * Validate input data
   */
  private async validateInput(
    request: CreateProjectRequest,
    creator: UserContext
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Required fields validation
    if (!request.name?.trim()) {
      errors.push('Project name is required');
    }

    if (!request.companyId) {
      errors.push('Company ID is required');
    }

    if (!request.departmentId) {
      errors.push('Department ID is required');
    }

    if (!creator.employeeId) {
      errors.push('Creator must have an employee record');
    }

    // Name length validation
    if (request.name && request.name.length > 255) {
      errors.push('Project name must be less than 255 characters');
    }

    // Description length validation
    if (request.description && request.description.length > 1000) {
      errors.push('Project description must be less than 1000 characters');
    }

    // Date validation
    if (request.startDate && request.endDate) {
      if (request.startDate >= request.endDate) {
        errors.push('End date must be after start date');
      }
    }

    // Budget validation
    if (request.budget !== undefined && request.budget < 0) {
      errors.push('Budget must be a positive number');
    }

    // Team members validation
    if (request.teamMembers) {
      const employeeIds = request.teamMembers.map(tm => tm.employeeId);
      const uniqueIds = new Set(employeeIds);
      if (employeeIds.length !== uniqueIds.size) {
        errors.push('Duplicate team members are not allowed');
      }

      // Validate team member roles
      const validRoles = ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'];
      for (const member of request.teamMembers) {
        if (!validRoles.includes(member.role)) {
          errors.push(`Invalid role: ${member.role}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(
    request: CreateProjectRequest,
    creator: UserContext
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if project name is unique within company
      if (request.name) {
        const existingProject = await prisma.project.findFirst({
          where: {
            name: request.name,
            companyId: request.companyId,
            isActive: true
          }
        });

        if (existingProject) {
          errors.push('Project name already exists in this company');
        }
      }

      // Check if project code is unique (if provided)
      if (request.code) {
        const existingCode = await prisma.project.findFirst({
          where: {
            code: request.code,
            companyId: request.companyId,
            isActive: true
          }
        });

        if (existingCode) {
          errors.push('Project code already exists in this company');
        }
      }

      // Validate company and department exist
      const company = await prisma.company.findUnique({
        where: { id: request.companyId }
      });

      if (!company || !company.isActive) {
        errors.push('Invalid or inactive company');
      }

      const department = await prisma.department.findUnique({
        where: { id: request.departmentId }
      });

      if (!department) {
        errors.push('Invalid department');
      }

      // Validate creator has access to the company/department
      if (creator.companyId && creator.companyId !== request.companyId) {
        errors.push('Cannot create project in different company');
      }

      // Validate team members exist and are active
      if (request.teamMembers && request.teamMembers.length > 0) {
        const employeeIds = request.teamMembers.map(tm => tm.employeeId);
        const employees = await prisma.employee.findMany({
          where: {
            id: { in: employeeIds },
            companyId: request.companyId,
            isActive: true
          },
          include: {
            user: {
              select: {
                isActive: true,
              }
            }
          }
        });

        const validEmployeeIds = employees
          .filter(emp => emp.user.isActive)
          .map(emp => emp.id);

        const invalidIds = employeeIds.filter(id => !validEmployeeIds.includes(id));
        if (invalidIds.length > 0) {
          errors.push(`Invalid or inactive employees: ${invalidIds.join(', ')}`);
        }
      }

    } catch (error: any) {
      console.error('Error in business rule validation:', error);
      errors.push('Failed to validate business rules');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create project with team members in a transaction
   */
  private async createProjectWithTeam(
    request: CreateProjectRequest,
    creator: UserContext
  ): Promise<any> {
    return await prisma.$transaction(async (tx) => {
      // Generate project code if not provided
      let projectCode = request.code;
      if (!projectCode) {
        // Generate unique code with timestamp and random suffix to avoid conflicts
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        projectCode = `PRJ${timestamp}${random}`;

        // Verify uniqueness (retry if collision)
        let attempts = 0;
        while (attempts < 5) {
          const existingCode = await tx.project.findFirst({
            where: { code: projectCode }
          });

          if (!existingCode) {
            break; // Code is unique
          }

          // Generate new code if collision
          const newRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          projectCode = `PRJ${timestamp}${newRandom}`;
          attempts++;
        }

        if (attempts >= 5) {
          throw new Error('Failed to generate unique project code after multiple attempts');
        }
      }

      // Create the project
      const project = await tx.project.create({
        data: {
          name: request.name,
          description: request.description,
          code: projectCode,
          companyId: request.companyId,
          departmentId: request.departmentId,
          ownerId: creator.employeeId!,
          status: request.status || 'PLANNING',
          startDate: request.startDate,
          endDate: request.endDate,
          budget: request.budget,
          progressPercentage: 0,
          isActive: true
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

      // Assign creator as project owner
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          employeeId: creator.employeeId!,
          role: 'OWNER',
          isActive: true
        }
      });

      // Assign additional team members
      if (request.teamMembers && request.teamMembers.length > 0) {
        const teamMemberData = request.teamMembers
          .filter(tm => tm.employeeId !== creator.employeeId) // Don't duplicate owner
          .map(tm => ({
            projectId: project.id,
            employeeId: tm.employeeId,
            role: tm.role,
            isActive: true
          }));

        if (teamMemberData.length > 0) {
          await tx.projectMember.createMany({
            data: teamMemberData
          });
        }
      }

      // Get complete project with team members
      const completeProject = await tx.project.findUnique({
        where: { id: project.id },
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
          }
        }
      });

      return completeProject;
    });
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    projectId: number,
    creator: UserContext,
    action: string
  ): Promise<void> {
    try {
      // This would integrate with your existing audit system
      console.log(`Audit Log: ${action} - Project ${projectId} by User ${creator.id}`);

      // Example audit log creation (adjust based on your audit schema)
      // await prisma.auditLog.create({
      //   data: {
      //     action,
      //     resourceType: 'PROJECT',
      //     resourceId: projectId,
      //     userId: creator.id,
      //     employeeId: creator.employeeId,
      //     timestamp: new Date(),
      //     details: { projectId, creatorId: creator.id }
      //   }
      // });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't fail the main operation for audit log issues
    }
  }
}