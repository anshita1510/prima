import bcrypt from "bcrypt";
import { Status, Designation, DepartmentType } from "@prisma/client";
import { UserRepository } from "../../repository/auth/user.repository";
import { prisma } from "../../../config/db";

export class SetPasswordUsecase {
  constructor(private userRepo: UserRepository) { }

  async execute(
    email: string,
    otp: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.userRepo.findByEmail(email);

    if (!user || !user.otp || !user.otpExpiry) {
      throw new Error("Invalid OTP request");
    }

    if (user.otpExpiry < new Date()) {
      throw new Error("OTP expired");
    }

    const otpValid = await bcrypt.compare(otp, user.otp);
    if (!otpValid) {
      throw new Error("Invalid OTP");
    }

    if (!user.tempPassword) {
      throw new Error("Temporary password not set");
    }


    const tempPasswordValid = await bcrypt.compare(
      currentPassword,
      user.tempPassword
    );

    if (!tempPasswordValid) {
      throw new Error("Invalid temporary password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepo.updateUser(user.id, {
      password: hashedPassword,
      tempPassword: null,
      otp: null,
      otpExpiry: null,
      status: Status.ACTIVE,
      isActive: true,
    });

    // Create employee record if it doesn't exist
    await this.createEmployeeRecordIfNeeded(user.id);
  }

  private async createEmployeeRecordIfNeeded(userId: number) {
    try {
      // Check if employee record already exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { userId }
      });

      if (existingEmployee) {
        return; // Employee record already exists
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return;
      }

      // Get or create default company
      let companyId = user.companyId;
      if (!companyId) {
        const defaultCompany = await prisma.company.upsert({
          where: { code: 'DEFAULT_COMPANY' },
          update: {},
          create: {
            name: 'Default Company',
            code: 'DEFAULT_COMPANY',
            isActive: true
          }
        });
        companyId = defaultCompany.id;

        // Update user with company
        await prisma.user.update({
          where: { id: userId },
          data: { companyId }
        });
      }

      // Get or create default department
      const defaultDepartment = await prisma.department.upsert({
        where: {
          companyId_name: {
            companyId: companyId,
            name: 'General'
          }
        },
        update: {},
        create: {
          name: 'General',
          type: DepartmentType.OPERATIONS,
          companyId: companyId
        }
      });

      // Map user role to employee designation
      let designation: Designation;
      switch (user.role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          designation = Designation.MANAGER;
          break;
        case 'MANAGER':
          designation = Designation.MANAGER;
          break;
        default:
          designation = Designation.SOFTWARE_ENGINEER;
      }

      // Generate unique employee code
      const employeeCode = `EMP${userId.toString().padStart(4, '0')}`;

      // Create employee record
      const employee = await prisma.employee.create({
        data: {
          userId,
          companyId,
          departmentId: defaultDepartment.id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          designation,
          employeeCode,
          isActive: true
        }
      });

      console.log(`✅ Created employee record during password setup for user ${userId} (Employee ID: ${employee.id}, Code: ${employeeCode})`);
    } catch (error) {
      console.error(`❌ Failed to create employee record for user ${userId}:`, error);
      // Don't throw error to avoid breaking password setup
    }
  }
}
