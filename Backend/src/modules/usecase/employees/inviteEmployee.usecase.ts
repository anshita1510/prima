
import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserRepository } from "../../repository/auth/user.repository";
import { SendEmailUseCase } from "../email/sendEmail.usecase";
import { Role, Status, Designation, DepartmentType } from "@prisma/client";
import { prisma } from "../../../config/db";

export class InviteEmployeeUsecase {
  constructor(
    private userRepo: UserRepository,
    private sendEmailUseCase: SendEmailUseCase
  ) { }

  async execute(
    inviterRole: Role,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      designation: string;
      employeeCode?: string;
      companyId?: number | string;
      companyName?: string;
      departmentId?: number;
    },
    inviterUserId?: number
  ) {
    const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER];

    if (!allowedRoles.includes(inviterRole)) {
      throw new Error("Unauthorized");
    }

    /* 🔄 Derive role from designation */
    const managerDesignations = ['MANAGER', 'HR', 'DIRECTOR', 'TECH_LEAD'];
    const derivedRole: Role = managerDesignations.includes(data.designation.toUpperCase())
      ? Role.MANAGER
      : Role.EMPLOYEE;

    const t0 = Date.now();
    console.log(`⏱ [0ms] inviteEmployee started for ${data.email}`);

    /* 👤 Check existing user + employee code in parallel */
    const [existingUser, existingEmployee] = await Promise.all([
      this.userRepo.findByEmail(data.email),
      data.employeeCode
        ? prisma.employee.findUnique({ where: { employeeCode: data.employeeCode } })
        : Promise.resolve(null),
    ]);
    console.log(`⏱ [${Date.now() - t0}ms] existence checks done`);

    if (existingUser) throw new Error("User with this email already exists");
    if (existingEmployee) throw new Error("Employee code already exists");

    /* ⏳ Tokens & Expiry + bcrypt — all in parallel */
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tempPassword = crypto.randomBytes(6).toString("hex");
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`⏱ [${Date.now() - t0}ms] starting bcrypt (parallel)`);
    const [hashedTempPassword, hashedOtp] = await Promise.all([
      bcrypt.hash(tempPassword, 6),
      bcrypt.hash(rawOtp, 6),
    ]);
    console.log(`⏱ [${Date.now() - t0}ms] bcrypt done`);

    const otpExpiry = new Date(Date.now() + 30 * 60 * 1000);

    console.log('🔐 GENERATED CREDENTIALS FOR:', data.email);
    console.log('   OTP:', rawOtp);
    console.log('   Temp Password:', tempPassword);
    console.log('   OTP Expiry:', otpExpiry);

    /* 🏢 Handle Company Creation/Assignment Based on Role */
    let companyId: number | null = null;

    if (inviterRole === Role.SUPER_ADMIN) {
      if (data.companyName) {
        const companyCode = typeof data.companyId === 'string' ? data.companyId :
          data.companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
        console.log(`⏱ [${Date.now() - t0}ms] upserting company...`);
        const company = await prisma.company.upsert({
          where: { code: companyCode },
          update: {},
          create: { name: data.companyName, code: companyCode, isActive: true }
        });
        companyId = company.id;
        console.log(`⏱ [${Date.now() - t0}ms] company upsert done, id=${companyId}`);
      } else if (data.companyId && typeof data.companyId === 'number') {
        companyId = data.companyId;
      }
    } else if (inviterRole === Role.ADMIN || inviterRole === Role.MANAGER) {
      if (!inviterUserId) throw new Error("Inviter user ID is required for ADMIN/MANAGER roles");
      console.log(`⏱ [${Date.now() - t0}ms] fetching inviter user...`);
      const inviterUser = await prisma.user.findUnique({
        where: { id: inviterUserId },
        select: { email: true, companyId: true, employee: { select: { companyId: true } } }
      });
      console.log(`⏱ [${Date.now() - t0}ms] inviter user fetched`);
      if (!inviterUser) throw new Error("Inviter user not found");
      companyId = inviterUser.companyId || inviterUser.employee?.companyId || null;
      if (!companyId) throw new Error("Admin/Manager must be associated with a company to invite employees");
      console.log(`⏱ [${Date.now() - t0}ms] companyId resolved: ${companyId}`);
    }

    console.log(`⏱ [${Date.now() - t0}ms] creating user in DB...`);
    /* 🧑 CREATE USER */
    const user = await this.userRepo.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      designation: data.designation,
      role: derivedRole,
      status: Status.ACTIVE,  // Changed from PENDING to ACTIVE
      isActive: true,         // Changed from false to true
      tempPassword: hashedTempPassword,
      otp: hashedOtp,
      otpExpiry: otpExpiry,
      inviteToken,
      inviteExpiry,
      companyId: companyId,
    });

    console.log(`⏱ [${Date.now() - t0}ms] user created, id=${user.id}`);

    /* 🏢 CREATE EMPLOYEE RECORD (non-blocking) */
    setTimeout(() => {
      this.createEmployeeRecord(user.id, { ...data, companyId }).catch((e: any) =>
        console.error('❌ createEmployeeRecord failed:', e.message)
      );
    }, 0);

    /* 📧 Send invite email (non-blocking, fully deferred) */
    setTimeout(() => {
      this.sendEmailUseCase.execute({
        to: data.email,
        subject: "Welcome to PRIMA - Your Account is Ready!",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to PRIMA</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 36px; color: white; font-weight: bold;">T</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Welcome to PRIMA</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Your journey starts here</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #2d3748; margin: 0 0 10px; font-size: 24px; font-weight: 600;">Hello ${data.firstName}! 👋</h2>
                <p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.6;">You've been invited to join our platform. We're excited to have you on board!</p>
              </div>

              <!-- Credentials Card -->
              <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                  🔐 Your Login Credentials
                </h3>
                <div style="background-color: white; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #4a5568; font-size: 14px; font-weight: 500; margin-bottom: 5px;">Email Address</label>
                    <div style="background-color: #f7fafc; padding: 12px; border-radius: 6px; font-family: monospace; color: #2d3748; border: 1px solid #e2e8f0;">${data.email}</div>
                  </div>
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #4a5568; font-size: 14px; font-weight: 500; margin-bottom: 5px;">OTP (One-Time Password)</label>
                    <div style="background-color: #fff5f5; padding: 12px; border-radius: 6px; font-family: monospace; color: #c53030; font-weight: 600; border: 1px solid #fed7d7; font-size: 18px; letter-spacing: 2px;">${rawOtp}</div>
                  </div>
                  <div>
                    <label style="display: block; color: #4a5568; font-size: 14px; font-weight: 500; margin-bottom: 5px;">Temporary Password</label>
                    <div style="background-color: #fff5f5; padding: 12px; border-radius: 6px; font-family: monospace; color: #c53030; font-weight: 600; border: 1px solid #fed7d7; font-size: 16px; letter-spacing: 1px;">${tempPassword}</div>
                  </div>
                </div>
              </div>

              <!-- Important Notice -->
              <div style="background-color: #fffbeb; border: 1px solid #f6e05e; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
                  <div>
                    <h4 style="color: #744210; margin: 0 0 8px; font-size: 16px; font-weight: 600;">Important Security Notice</h4>
                    <p style="color: #744210; margin: 0; font-size: 14px; line-height: 1.5;">This temporary password is valid for <strong>30 minutes only</strong>. Please log in and change your password immediately for security purposes.</p>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What's Next?</h3>
                <div style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="background-color: #667eea; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px;">1</span>
                    <span>Click the login button below to access your account</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="background-color: #667eea; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px;">2</span>
                    <span>Use the temporary password provided above</span>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <span style="background-color: #667eea; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px;">3</span>
                    <span>Set up your new secure password</span>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                  🚀 Access Your Account
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; margin: 0 0 10px; font-size: 14px;">Need help? Contact our support team</p>
              <p style="color: #a0aec0; margin: 0; font-size: 12px;">
                Best regards,<br/>
                <strong style="color: #4a5568;">The PRIMA Team</strong>
              </p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #a0aec0; margin: 0; font-size: 11px;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      }).catch((emailError: any) => {
        console.error('❌ Failed to send invitation email:', emailError.message);
        // Email failure doesn't affect user creation success
      });
    }, 0); // defer fully off the current call stack

    console.log(`⏱ [${Date.now() - t0}ms] ✅ execute() complete — sending response`);

    return {
      message: "User created successfully! Invitation email is being sent in the background.",
      email: data.email,
    };
  }

  private async createEmployeeRecord(userId: number, data: any) {
    try {
      // Get or create default company
      let companyId = data.companyId;
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
      let departmentId = data.departmentId;
      if (!departmentId) {
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
        departmentId = defaultDepartment.id;
      }

      // Map user role to employee designation
      let designation: Designation;
      switch (data.role) {
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
      const employeeCode = data.employeeCode || `EMP${userId.toString().padStart(4, '0')}`;

      // Create employee record
      const employee = await prisma.employee.create({
        data: {
          userId,
          companyId,
          departmentId,
          name: `${data.firstName} ${data.lastName}`.trim(),
          designation,
          employeeCode,
          isActive: true
        }
      });

      console.log(`✅ Created employee record for user ${userId} (Employee ID: ${employee.id}, Code: ${employeeCode})`);
      return employee;
    } catch (error) {
      console.error(`❌ Failed to create employee record for user ${userId}:`, error);
      // Don't throw error to avoid breaking user creation
    }
  }
}

