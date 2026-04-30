import { Request, Response } from 'express';
import { PrismaClient, Designation, Prisma, Role, Status } from '@prisma/client';

const prisma = new PrismaClient();

class EmployeeController {
  // Get all employees
  getAllEmployees = async (req: Request, res: Response) => {
    try {
      const { companyId, departmentId, status } = req.query;
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      // Build where clause
      const where: any = {
        isActive: true
      };

      if (companyId) {
        where.companyId = parseInt(companyId as string);
      } else if (userContext.companyId) {
        where.companyId = userContext.companyId;
      }

      if (departmentId) {
        where.departmentId = parseInt(departmentId as string);
      }

      const employees = await prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              isActive: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Transform response
      const transformedEmployees = employees.map(emp => ({
        id: emp.id,
        employeeId: emp.id,
        name: emp.name,
        email: emp.user?.email,
        phone: emp.user?.phone,
        designation: emp.designation,
        role: emp.user?.role,
        status: emp.user?.status || 'ACTIVE',
        location: 'Not specified',
        employeeCode: emp.employeeCode,
        companyId: emp.companyId,
        departmentId: emp.departmentId,
        isActive: emp.isActive,
        user: emp.user,
        department: emp.department,
        company: emp.company
      }));

      res.status(200).json({
        success: true,
        data: transformedEmployees,
        meta: {
          total: transformedEmployees.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employees'
      });
    }
  };

  // Get employee by ID
  getEmployeeById = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              isActive: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: employee.id,
          employeeId: employee.id,
          name: employee.name,
          email: employee.user?.email,
          phone: employee.user?.phone,
          designation: employee.designation,
          role: employee.user?.role,
          status: employee.user?.status || 'ACTIVE',
          location: 'Not specified',
          employeeCode: employee.employeeCode,
          companyId: employee.companyId,
          departmentId: employee.departmentId,
          isActive: employee.isActive,
          user: employee.user,
          department: employee.department,
          company: employee.company
        }
      });
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee'
      });
    }
  };

  // Create new employee
  createEmployee = async (req: Request, res: Response) => {
    try {
      const {
        name,
        firstName,
        lastName,
        email,
        phone,
        designation,
        role,
        status = 'ACTIVE',
        departmentId,
        managerId,
        password,
        companyId
      } = req.body;

      const userContext = req.user;

      if (!userContext) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // ✅ Support both name formats from Flutter and web
      const resolvedFirstName: string = firstName?.trim() || name?.trim().split(' ')[0] || '';
      const resolvedLastName: string = lastName?.trim() || name?.trim().split(' ').slice(1).join(' ') || resolvedFirstName;
      const resolvedName: string = name?.trim() || `${resolvedFirstName} ${resolvedLastName}`.trim();

      // ... rest of your role/companyId logic unchanged ...

      // Replace old name validation
      if (!resolvedName || !email || !designation) {
        return res.status(400).json({ success: false, message: 'Name, email, and designation are required' });
      }

      // ... rest of validation unchanged ...

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            firstName: resolvedFirstName,   // ✅ use resolved
            lastName: resolvedLastName,     // ✅ use resolved
            phone: phone || '',
            designation: designation.toUpperCase() as Designation,
            role: Role[role.toUpperCase() as keyof typeof Role] || Role.EMPLOYEE,
            status: (status.toUpperCase() as Status) || Status.ACTIVE,
            password: password || 'temp123',
            isActive: true,
            companyId: companyId || userContext.companyId
          }
        });

        const employeeData: Prisma.EmployeeUncheckedCreateInput = {
          name: resolvedName,             // ✅ use resolved
          designation: designation.toUpperCase() as Designation,
          employeeCode: `EMP${Date.now()}` + Math.floor(Math.random() * 1000),
          isActive: true,
          userId: user.id,
          companyId: companyId || userContext.companyId,
          ...(departmentId && { departmentId: parseInt(departmentId) }),
          ...(managerId && { managerId: parseInt(managerId) })
        };

        return await tx.employee.create({
          data: employeeData,
          include: {
            user: { select: { id: true, email: true, phone: true, role: true, status: true, isActive: true } },
            department: { select: { id: true, name: true } },
            company: { select: { id: true, name: true } }
          }
        });
      });

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: result
      });

    } catch (error: any) {
      console.error('❌ Error creating employee:', error.code, error.message);
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ success: false, message: 'Invalid department, company, or manager reference', details: error.meta });
      }
      return res.status(500).json({ success: false, message: error.message || 'Failed to create employee' });
    }
  };
  // Update employee
  updateEmployee = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const {
        name,
        email,
        phone,
        designation,
        role,
        status,
        location,
        departmentId,
        managerId
      } = req.body;

      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Update user if email, phone, role, or status changed
      if (email || phone || role || status) {
        const nameParts = name ? name.trim().split(' ') : [];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        await prisma.user.update({
          where: { id: employee.userId },
          data: {
            email: email || undefined,
            phone: phone || undefined,
            role: role || undefined,
            status: status || undefined,
            firstName: firstName || undefined,
            lastName: lastName || undefined
          }
        });
      }

      // Update employee
      const updatedEmployee = await prisma.employee.update({
        where: { id: parseInt(employeeId) },
        data: {
          name: name || undefined,
          designation: designation || undefined,
          departmentId: departmentId || undefined,
          managerId: managerId || undefined
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              isActive: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: {
          id: updatedEmployee.id,
          employeeId: updatedEmployee.id,
          name: updatedEmployee.name,
          email: updatedEmployee.user?.email,
          phone: updatedEmployee.user?.phone,
          designation: updatedEmployee.designation,
          role: updatedEmployee.user?.role,
          status: updatedEmployee.user?.status || 'ACTIVE',
          location: location || 'Not specified',
          employeeCode: updatedEmployee.employeeCode,
          companyId: updatedEmployee.companyId,
          departmentId: updatedEmployee.departmentId,
          isActive: updatedEmployee.isActive,
          user: updatedEmployee.user,
          department: updatedEmployee.department,
          company: updatedEmployee.company
        }
      });
    } catch (error: any) {
      console.error('Error updating employee:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update employee'
      });
    }
  };

  // Delete employee
  deleteEmployee = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Soft delete - mark as inactive
      await prisma.employee.update({
        where: { id: parseInt(employeeId) },
        data: { isActive: false }
      });

      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete employee'
      });
    }
  };

  // Get employee statistics
  getEmployeeStats = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Get task statistics
      const activeTasks = await prisma.task.count({
        where: {
          assignedToId: parseInt(employeeId),
          status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] }
        }
      });

      const completedTasks = await prisma.task.count({
        where: {
          assignedToId: parseInt(employeeId),
          status: 'COMPLETED'
        }
      });

      res.status(200).json({
        success: true,
        data: {
          employeeId: employee.id,
          name: employee.name,
          activeTasks,
          completedTasks,
          totalTasks: activeTasks + completedTasks
        }
      });
    } catch (error: any) {
      console.error('Error fetching employee stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee stats'
      });
    }
  };

  // Get manager's team members
  getManagerTeamMembers = async (req: Request, res: Response) => {
    try {
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      // Get the manager's employee record
      const managerEmployee = await prisma.employee.findUnique({
        where: { userId: userContext.id }
      });

      if (!managerEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Manager employee record not found'
        });
      }

      // Get all employees reporting to this manager
      const teamMembers = await prisma.employee.findMany({
        where: {
          managerId: managerEmployee.id,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              isActive: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      const transformedMembers = teamMembers.map(emp => ({
        id: emp.id,
        employeeId: emp.id,
        name: emp.name,
        email: emp.user?.email,
        phone: emp.user?.phone,
        designation: emp.designation,
        role: emp.user?.role,
        status: emp.user?.status || 'ACTIVE',
        location: 'Not specified',
        employeeCode: emp.employeeCode,
        companyId: emp.companyId,
        departmentId: emp.departmentId,
        isActive: emp.isActive,
        user: emp.user,
        department: emp.department,
        company: emp.company
      }));

      res.status(200).json({
        success: true,
        data: transformedMembers,
        meta: {
          total: transformedMembers.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching manager team members:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch team members'
      });
    }
  };

  // Get unassigned employees (not assigned to any manager)
  getUnassignedEmployees = async (req: Request, res: Response) => {
    try {
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      // Get unassigned employees in the same company
      const unassignedEmployees = await prisma.employee.findMany({
        where: {
          companyId: userContext.companyId,
          managerId: null,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              isActive: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      const transformedEmployees = unassignedEmployees.map(emp => ({
        id: emp.id,
        employeeId: emp.id,
        name: emp.name,
        email: emp.user?.email,
        phone: emp.user?.phone,
        designation: emp.designation,
        role: emp.user?.role,
        status: emp.user?.status || 'ACTIVE',
        employeeCode: emp.employeeCode,
        companyId: emp.companyId,
        departmentId: emp.departmentId,
        isActive: emp.isActive,
        user: emp.user,
        department: emp.department
      }));

      res.status(200).json({
        success: true,
        data: transformedEmployees,
        meta: {
          total: transformedEmployees.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching unassigned employees:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch unassigned employees'
      });
    }
  };

  // Assign employee to manager
  assignEmployeeToManager = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      // Get the manager's employee record
      const managerEmployee = await prisma.employee.findUnique({
        where: { userId: userContext.id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!managerEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Manager employee record not found'
        });
      }

      // Get the employee to assign
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId) },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Check if employee is already assigned to another manager
      if (employee.managerId && employee.managerId !== managerEmployee.id) {
        return res.status(400).json({
          success: false,
          message: 'Employee is already assigned to another manager'
        });
      }

      // Assign employee to manager
      const updatedEmployee = await prisma.employee.update({
        where: { id: parseInt(employeeId) },
        data: {
          managerId: managerEmployee.id
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              isActive: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      console.log(`✅ Employee ${employee.name} assigned to manager ${managerEmployee.user?.firstName} ${managerEmployee.user?.lastName}`);

      res.status(200).json({
        success: true,
        message: 'Employee assigned to manager successfully',
        data: {
          id: updatedEmployee.id,
          employeeId: updatedEmployee.id,
          name: updatedEmployee.name,
          email: updatedEmployee.user?.email,
          phone: updatedEmployee.user?.phone,
          designation: updatedEmployee.designation,
          role: updatedEmployee.user?.role,
          status: updatedEmployee.user?.status || 'ACTIVE',
          employeeCode: updatedEmployee.employeeCode,
          companyId: updatedEmployee.companyId,
          departmentId: updatedEmployee.departmentId,
          isActive: updatedEmployee.isActive,
          user: updatedEmployee.user,
          department: updatedEmployee.department
        }
      });
    } catch (error: any) {
      console.error('Error assigning employee to manager:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign employee to manager'
      });
    }
  };

  // Get all users (for admin)
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const { role } = req.query;
      const userContext = (req as any).user;

      if (!userContext) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED'
        });
      }

      // Build where clause
      const where: any = {
        companyId: userContext.companyId
      };

      if (role) {
        where.role = role;
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              designation: true,
              employeeCode: true
            }
          }
        },
        orderBy: {
          firstName: 'asc'
        }
      });

      const transformedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        employee: user.employee
      }));

      res.status(200).json({
        success: true,
        data: transformedUsers,
        meta: {
          total: transformedUsers.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch users'
      });
    }
  };
}

export const employeeController = new EmployeeController();
