import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../../config/db";
import { Role, Status, AuthProvider, Designation } from "@prisma/client"; // Import AuthProvider
import { AuthUser } from "../../../types/express"; // Import AuthUser type
import "../../../types/express"; // Import express type extensions

import { UserRepository } from "../../repository/auth/user.repository";
import { InviteEmployeeUsecase } from "../../usecase/employees/inviteEmployee.usecase";
import { SetPasswordUsecase } from "../../usecase/password/setPassword.usecase";
import { LoginUsecase } from "../../usecase/auth/login.usecase";
import { UpdateCredentialsUsecase } from "../../usecase/auth/update.credentials.usecase";
import { UpdatePasswordUsecase } from "../../usecase/auth/updatePassword.usecase";
import { CreateSuperAdminUsecase } from "../../usecase/super_admin/create.superAdmin.usecase";
import { SendEmailUseCase } from "../../usecase/email/sendEmail.usecase";
import { NodemailerService } from "../../repository/email/nodemailer.service";
import { OAuthService, GoogleUserInfo, MicrosoftUserInfo } from "../../../shared/utils/oauth";

/* -------------------------------------------------------------------------- */
/*                               INITIALIZATION                               */
/* -------------------------------------------------------------------------- */

const userRepo = new UserRepository();
const emailService = new NodemailerService();
const sendEmailUseCase = new SendEmailUseCase(emailService);
const inviteEmployeeUsecase = new InviteEmployeeUsecase(userRepo, sendEmailUseCase);

/* -------------------------------------------------------------------------- */
/*                         EXPRESS REQUEST AUGMENTATION                        */
/* -------------------------------------------------------------------------- */

// Type declaration moved to Backend/src/types/express.d.ts to avoid conflicts

/* -------------------------------------------------------------------------- */
/*                            ROLE HELPER FUNCTION                            */
/* -------------------------------------------------------------------------- */

// Fixed: Compare using string values instead of enum type
export function isAdminRole(role: Role): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER";
}

/* -------------------------------------------------------------------------- */
/*                                CONTROLLER                                  */
/* -------------------------------------------------------------------------- */

export class UserController {
  /* ================= CREATE SUPER ADMIN ================= */
  async createSuperAdmin(req: Request, res: Response) {
    try {
      const usecase = new CreateSuperAdminUsecase();
      const user = await usecase.execute(req.body);
      console.log('Auth: ', req.body.auth);

      return res.status(201).json({
        message: "Super Admin created successfully",
        user,

      });

    } catch (error: any) {

      return res.status(400).json({ error: error.message });
    }

  }

  /* ================= DEBUG TEST ENDPOINT ================= */
  async debugTest(req: Request, res: Response) {
    try {
      console.log('=== DEBUG TEST ENDPOINT ===');
      console.log('Request headers:', req.headers);
      console.log('Request user:', req.user);
      console.log('Request body:', req.body);

      return res.json({
        message: 'Debug test successful',
        user: req.user,
        headers: req.headers,
        body: req.body
      });
    } catch (error: any) {
      console.log('❌ Debug test error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /* ================= INVITE EMPLOYEE ================= */
  async inviteEmployee(req: Request, res: Response) {
    try {
      console.log('=== INVITE EMPLOYEE DEBUG ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Request user:', req.user);
      console.log('Request headers:', req.headers.authorization);

      const user = req.user as AuthUser | undefined;

      if (!user) {
        console.log('❌ No user in request');
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!isAdminRole(user.role)) {
        console.log('❌ User role not admin:', user.role);
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const { email, firstName, lastName, phone, designation, employeeCode, companyName, companyId } = req.body;

      if (!email || !firstName || !lastName || !phone || !designation) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const normalizedDesignation = designation.toUpperCase();
      const allowedDesignations = Object.values(Designation) as string[];
      if (!allowedDesignations.includes(normalizedDesignation)) {
        return res.status(400).json({
          error: `Invalid designation. Must be one of: ${allowedDesignations.join(", ")}`,
        });
      }

      console.log('✅ All validations passed, calling usecase...');

      await inviteEmployeeUsecase.execute(user.role, {
        email,
        firstName,
        lastName,
        phone,
        designation,
        employeeCode,
        companyName,
        companyId,
      }, user.id);

      console.log(`✅ Usecase done`);
      console.log('Auth is here: ', req.body.authorization);
      console.log("REQ.USER 👉", user);

      return res.status(201).json({
        message: "Invitation email sent successfully",
      });
    } catch (error: any) {
      console.log('❌ Error in inviteEmployee:', error.message);
      console.log('❌ Full error:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  /* ================= LOGIN ================= */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const usecase = new LoginUsecase(userRepo);
      const result = await usecase.execute(email, password);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  /* ================= FORGET PASSWORD (SELF OR SUPER_ADMIN) ================= */
  async updatePassword(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const targetUserId = Number(req.params.id);
      const { newPassword } = req.body;

      if (!newPassword || isNaN(targetUserId)) {
        return res.status(400).json({ error: "Invalid input" });
      }

      if (user.id !== targetUserId && user.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const usecase = new UpdatePasswordUsecase(userRepo);
      const result = await usecase.execute(targetUserId, newPassword);

      return res.json({ message: "Password updated successfully", result });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /* ================= SET PASSWORD FROM INVITE ================= */
  async setPassword(req: Request, res: Response) {
    try {

      const { email, otp, currentPassword, newPassword } = req.body;

      if (!email || !otp || !currentPassword || !newPassword) {
        return res.status(400).json({
          error: "OTP, temporary password, and new password are required",
        });
      }

      const usecase = new SetPasswordUsecase(userRepo);
      await usecase.execute(email, otp.trim(), currentPassword, newPassword);

      return res.json({
        message: "Password set successfully. You can now log in.",
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /* ================= RESEND OTP ================= */
  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.status !== Status.PENDING) {
        return res.status(400).json({ error: "Invalid user or status" });
      }
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(rawOtp, 10);
      const otpExpiry = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          otp: hashedOtp,
          otpExpiry: otpExpiry
        },
      });

      await sendEmailUseCase.execute({
        to: user.email,
        subject: "Your New Password Setup OTP",
        html: `
          <h3>New OTP for Account Setup</h3>
          <p>Use this OTP to complete your password setup:</p>
          <h2 style="color:#e53e3e; letter-spacing: 4px;">${rawOtp}</h2>
          <p><strong>Valid for 30 minutes only.</strong></p>
          <p>If you didn't request this, ignore this email.</p>
        `,
      });

      return res.json({ message: "New OTP sent successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to resend OTP" });
    }
  }

  /* ================= GET ALL USERS (ADMIN ONLY) ================= */
  async getAllUsers(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!isAdminRole(user.role)) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const isSuperAdmin = user.role === Role.SUPER_ADMIN;
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
      const search =
        typeof req.query.search === "string" ? req.query.search.trim() : "";

      const andClauses: Record<string, unknown>[] = [];
      if (isSuperAdmin) {
        andClauses.push({ role: { not: Role.EMPLOYEE } });
      }
      if (search) {
        andClauses.push({
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        });
      }
      const where = andClauses.length > 0 ? { AND: andClauses } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            employee: true,
            company: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      // Format users for frontend
      const formattedUsers = users.map(user => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';

        // Create name, avoiding duplicates and handling empty values
        let name = firstName;
        if (lastName && lastName !== firstName) {
          name = `${firstName} ${lastName}`;
        }
        name = name.trim() || 'User';

        return {
          id: user.id,
          name,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          designation: user.designation,
          role: user.role,
          status: user.status,
          isActive: user.isActive,
          employeeCode: user.employee?.employeeCode || null,
          companyName: user.company?.name || null,
          companyId: user.company?.code || null,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        };
      });

      return res.json({
        success: true,
        users: formattedUsers,
        total,
        page,
        limit,
        count: formattedUsers.length,
      });
    } catch (error: any) {
      console.error('Get all users error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  async getCurrentUser(req: Request, res: Response) {
    try {
      const authUser = req.user as AuthUser | undefined;
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await userRepo.findById(authUser.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Format user data for frontend
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';

      // Create name, avoiding duplicates and handling empty values
      let name = firstName;
      if (lastName && lastName !== firstName) {
        name = `${firstName} ${lastName}`;
      }
      name = name.trim() || 'User'; // Fallback to 'User' if both are empty

      const formattedUser = {
        id: user.id,
        employeeId: user.employee?.id,
        companyId: user.companyId,
        name,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        designation: user.designation,
        status: user.status,
        isActive: user.isActive
      };

      return res.json({
        success: true,
        user: formattedUser
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
  /* ================= CHECK USER AUTH PROVIDER ================= */
  async checkUser(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          authProvider: true,
          status: true,
          isActive: true
        }
      });

      if (!user) {
        return res.json({ provider: "NEW_USER" });
      }

      // Return the auth provider
      return res.json({
        provider: user.authProvider,
        userExists: true,
        isActive: user.isActive,
        status: user.status
      });

    } catch (error: any) {
      console.error('Check user error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /* ================= GOOGLE OAUTH LOGIN ================= */
  async googleLogin(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Google token is required" });
      }

      const googleUser = await OAuthService.verifyGoogleToken(token);

      const email = googleUser.email.toLowerCase();

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            firstName: googleUser.given_name || "Google",
            lastName: googleUser.family_name || "User",
            phone: "",
            designation: "Employee",
            role: Role.EMPLOYEE,
            authProvider: AuthProvider.GOOGLE,
            googleId: googleUser.id,
            status: Status.ACTIVE,
            isActive: true
          }
        });
      }

      const usecase = new LoginUsecase(userRepo);
      const result = await usecase.generateTokenForUser(user);

      return res.json(result);
    } catch (error: any) {
      console.error("Google login error:", error);
      return res.status(500).json({ error: "Google authentication failed" });
    }
  }


  // async googleLogin(req: Request, res: Response) {
  //   try {
  //     const { googleToken, email } = req.body;

  //     if (!googleToken || !email) {
  //       return res.status(400).json({ error: "Google token and email are required" });
  //     }

  //     // Verify Google token and get user info
  //     let googleUser: GoogleUserInfo;
  //     try {
  //       googleUser = await OAuthService.verifyGoogleToken(googleToken);
  //     } catch (error) {
  //       // For development, we'll allow mock tokens
  //       if (googleToken.startsWith('mock_google_token_')) {
  //         googleUser = {
  //           id: 'mock_google_id',
  //           email: email.toLowerCase(),
  //           name: 'Google User',
  //           given_name: 'Google',
  //           family_name: 'User'
  //         };
  //       } else {
  //         return res.status(400).json({ error: "Invalid Google token" });
  //       }
  //     }

  // Verify email matches
  // if (googleUser.email.toLowerCase() !== email.toLowerCase()) {
  //   return res.status(400).json({ error: "Email mismatch" });
  // }

  // let user = await prisma.user.findUnique({
  //   where: { email: email.toLowerCase() }
  // });

  // if (!user) {
  //   // Create new user with Google auth
  //   user = await prisma.user.create({
  //     data: {
  //       email: email.toLowerCase(),
  //       firstName: googleUser.given_name || "Google",
  //       lastName: googleUser.family_name || "User",
  //       phone: "",
  //       designation: "Employee",
  //       role: Role.EMPLOYEE,
  //       authProvider: AuthProvider.GOOGLE,
  //       googleId: googleUser.id,
  //       status: Status.ACTIVE,
  //       isActive: true
  //     }
  //   });
  // } else {
  //   // Update existing user to Google auth if not already
  //   if (user.authProvider !== AuthProvider.GOOGLE) {
  //     user = await prisma.user.update({
  //       where: { id: user.id },
  //       data: {
  //             authProvider: AuthProvider.GOOGLE,
  //             googleId: googleUser.id,
  //             status: Status.ACTIVE,
  //             isActive: true
  //           }
  //         });
  //       }
  //     }

  //     // Generate JWT token
  //     const usecase = new LoginUsecase(userRepo);
  //     const result = await usecase.generateTokenForUser(user);

  //     return res.json(result);

  //   } catch (error: any) {
  //     console.error('Google login error:', error);
  //     return res.status(500).json({ error: error.message });
  //   }
  // }

  /* ================= MICROSOFT OAUTH LOGIN ================= */
  async microsoftLogin(req: Request, res: Response) {
    try {
      const { microsoftToken, email } = req.body;

      if (!microsoftToken || !email) {
        return res.status(400).json({ error: "Microsoft token and email are required" });
      }

      // Verify Microsoft token and get user info
      let microsoftUser: MicrosoftUserInfo;
      try {
        microsoftUser = await OAuthService.verifyMicrosoftToken(microsoftToken);
      } catch (error) {
        // For development, we'll allow mock tokens
        if (microsoftToken.startsWith('mock_microsoft_token_')) {
          microsoftUser = {
            id: 'mock_microsoft_id',
            mail: email.toLowerCase(),
            displayName: 'Microsoft User',
            givenName: 'Microsoft',
            surname: 'User'
          };
        } else {
          return res.status(400).json({ error: "Invalid Microsoft token" });
        }
      }

      // Verify email matches
      const userEmail = microsoftUser.mail?.toLowerCase() || email.toLowerCase();
      if (userEmail !== email.toLowerCase()) {
        return res.status(400).json({ error: "Email mismatch" });
      }

      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // Create new user with Microsoft auth
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            firstName: microsoftUser.givenName || "Microsoft",
            lastName: microsoftUser.surname || "User",
            phone: "",
            designation: "Employee",
            role: Role.EMPLOYEE,
            authProvider: AuthProvider.MICROSOFT,
            microsoftId: microsoftUser.id,
            status: Status.ACTIVE,
            isActive: true
          }
        });
      } else {
        // Update existing user to Microsoft auth if not already
        if (user.authProvider !== AuthProvider.MICROSOFT) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authProvider: AuthProvider.MICROSOFT,
              microsoftId: microsoftUser.id,
              status: Status.ACTIVE,
              isActive: true
            }
          });
        }
      }

      // Generate JWT token
      const usecase = new LoginUsecase(userRepo);
      const result = await usecase.generateTokenForUser(user);

      return res.json(result);

    } catch (error: any) {
      console.error('Microsoft login error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /* ================= UPDATE USER CREDENTIALS ================= */
  async updateCredentials(req: Request, res: Response) {
    try {
      const user = req.user as AuthUser | undefined;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      if (user.role !== "ADMIN") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const usecase = new UpdateCredentialsUsecase(userRepo);
      const updatedUser = await usecase.execute(userId, req.body);

      return res.json({
        message: "User credentials updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /* ================= DELETE USER ================= */
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = (req as any).user;

      console.log("🔍 Delete user request:", {
        userId,
        currentUser,
        userRole: currentUser?.role,
        userIdFromToken: currentUser?.userId || currentUser?.id
      });

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid user ID"
        });
      }

      // Check if user exists
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          employee: true
        }
      });

      if (!userToDelete) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      console.log("🔍 User to delete:", {
        id: userToDelete.id,
        email: userToDelete.email,
        role: userToDelete.role
      });

      // Prevent self-deletion
      const currentUserId = currentUser.userId || currentUser.id;
      if (userToDelete.id === currentUserId) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete your own account"
        });
      }

      // Only prevent deletion of other super admins (super admin can delete admins, managers, employees)
      if (userToDelete.role === Role.SUPER_ADMIN && currentUser.role !== Role.SUPER_ADMIN) {
        return res.status(403).json({
          success: false,
          error: "Only super admins can delete other super admins"
        });
      }

      // Additional check: prevent deletion of the last super admin
      if (userToDelete.role === Role.SUPER_ADMIN) {
        const superAdminCount = await prisma.user.count({
          where: { role: Role.SUPER_ADMIN }
        });

        if (superAdminCount <= 1) {
          return res.status(400).json({
            success: false,
            error: "Cannot delete the last super admin in the system"
          });
        }
      }

      console.log("🔍 Proceeding with deletion...");

      // Delete related employee record first (if exists)
      if (userToDelete.employee) {
        await prisma.employee.delete({
          where: { userId: userId }
        });
      }

      // Delete the user permanently
      await prisma.user.delete({
        where: { id: userId }
      });

      console.log("✅ User deleted successfully");

      return res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });

    } catch (error: any) {
      console.error("Delete user error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete user"
      });
    }
  }

  /* ================= RESEND INVITATION ================= */
  async resendInvitation(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid user ID"
        });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      // Check if user already has a password set
      if (user.password) {
        return res.status(400).json({
          success: false,
          error: "User has already set up their account"
        });
      }

      // Generate new OTP and temporary password
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

      // Update user with new OTP and temp password
      await prisma.user.update({
        where: { id: userId },
        data: {
          otp: otp,
          password: hashedTempPassword,
          otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      });

      // Send invitation email
      const emailContent = `
        <h2>Account Setup - PRIMA Task Management</h2>
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>Your account invitation has been resent. Please use the following credentials to set up your account:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p><strong>OTP:</strong> ${otp}</p>
        </div>
        <p>Please log in and set your permanent password. This OTP will expire in 10 minutes.</p>
        <p>Best regards,<br>PRIMA Team</p>
      `;

      await sendEmailUseCase.execute({
        to: user.email,
        subject: "Account Setup - PRIMA Task Management",
        html: emailContent
      });

      return res.status(200).json({
        success: true,
        message: "Invitation email sent successfully"
      });

    } catch (error: any) {
      console.error("Resend invitation error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to resend invitation"
      });
    }
  }

  /* ================= API DOCUMENTATION ================= */
  async getApiDocumentation(req: Request, res: Response) {
    try {
      const apiDocumentation = {
        info: {
          title: "PRIMA API Documentation",
          version: "1.0.0",
          description: "Complete API documentation for PRIMA Task Management System",
          contact: {
            name: "PRIMA Development Team",
            email: "dev@mailinator.com"
          }
        },
        baseUrl: process.env.API_BASE_URL || "http://localhost:3001",
        authentication: {
          type: "Bearer Token (JWT)",
          description: "Include the JWT token in the Authorization header",
          example: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        endpoints: {
          authentication: [
            {
              method: "POST",
              path: "/api/users/login",
              description: "User login authentication",
              requiresAuth: false,
              requestBody: {
                email: "string (required)",
                password: "string (required)"
              },
              responses: {
                200: {
                  description: "Login successful",
                  example: {
                    token: "jwt_token_here",
                    user: {
                      id: 1,
                      name: "John Doe",
                      email: "john@example.com",
                      role: "ADMIN"
                    }
                  }
                },
                401: {
                  description: "Invalid credentials",
                  example: { error: "Invalid email or password" }
                }
              }
            },
            {
              method: "POST",
              path: "/api/users/superAdmin",
              description: "Create super admin user",
              requiresAuth: false,
              requestBody: {
                firstName: "string (required)",
                lastName: "string (required)",
                email: "string (required)",
                phone: "string (required)",
                designation: "string (required)"
              },
              responses: {
                201: {
                  description: "Super admin created successfully",
                  example: {
                    message: "Super Admin created successfully",
                    user: { id: 1, email: "admin@example.com" }
                  }
                }
              }
            }
          ],
          userManagement: [
            {
              method: "POST",
              path: "/api/users/register",
              description: "Invite new employee (Admin only)",
              requiresAuth: true,
              roles: ["ADMIN", "SUPER_ADMIN"],
              requestBody: {
                email: "string (required)",
                firstName: "string (required)",
                lastName: "string (required)",
                phone: "string (required)",
                designation: "string (required)",
                role: "enum: EMPLOYEE|MANAGER|ADMIN (required)",
                employeeCode: "string (optional)"
              },
              responses: {
                201: {
                  description: "Invitation sent successfully",
                  example: { message: "Invitation email sent successfully" }
                },
                403: {
                  description: "Forbidden - Admin access required",
                  example: { error: "Forbidden: Admin access required" }
                }
              }
            },
            {
              method: "GET",
              path: "/api/users/me",
              description: "Get current user profile",
              requiresAuth: true,
              responses: {
                200: {
                  description: "User profile retrieved",
                  example: {
                    success: true,
                    user: {
                      id: 1,
                      name: "John Doe",
                      email: "john@example.com",
                      role: "ADMIN",
                      designation: "Manager"
                    }
                  }
                }
              }
            },
            {
              method: "GET",
              path: "/api/users/",
              description: "Get all users (Admin only)",
              requiresAuth: true,
              roles: ["ADMIN", "SUPER_ADMIN"],
              responses: {
                200: {
                  description: "Users list retrieved",
                  example: {
                    success: true,
                    users: [
                      {
                        id: 1,
                        name: "John Doe",
                        email: "john@example.com",
                        role: "ADMIN",
                        status: "ACTIVE"
                      }
                    ],
                    count: 1
                  }
                }
              }
            }
          ],
          passwordManagement: [
            {
              method: "POST",
              path: "/api/users/set-password",
              description: "Set password from invite",
              requiresAuth: false,
              requestBody: {
                email: "string (required)",
                otp: "string (required)",
                currentPassword: "string (required)",
                newPassword: "string (required)"
              },
              responses: {
                200: {
                  description: "Password set successfully",
                  example: { message: "Password set successfully. You can now log in." }
                }
              }
            },
            {
              method: "POST",
              path: "/api/users/forgot-password",
              description: "Request password reset",
              requiresAuth: false,
              requestBody: {
                email: "string (required)"
              },
              responses: {
                200: {
                  description: "Reset email sent",
                  example: { message: "Password reset email sent" }
                }
              }
            },
            {
              method: "POST",
              path: "/api/users/reset-password",
              description: "Reset password with OTP",
              requiresAuth: false,
              requestBody: {
                email: "string (required)",
                otp: "string (required)",
                newPassword: "string (required)"
              },
              responses: {
                200: {
                  description: "Password reset successful",
                  example: { message: "Password reset successfully" }
                }
              }
            },
            {
              method: "POST",
              path: "/api/users/resend-otp",
              description: "Resend OTP for password setup",
              requiresAuth: false,
              requestBody: {
                email: "string (required)"
              },
              responses: {
                200: {
                  description: "OTP resent successfully",
                  example: { message: "New OTP sent successfully" }
                }
              }
            }
          ]
        },
        errorCodes: {
          400: "Bad Request - Invalid input data",
          401: "Unauthorized - Invalid or missing authentication",
          403: "Forbidden - Insufficient permissions",
          404: "Not Found - Resource not found",
          500: "Internal Server Error - Server error occurred"
        },
        postmanCollection: {
          downloadUrl: "/api/users/postman-collection",
          description: "Download complete Postman collection with all endpoints"
        }
      };

      return res.json(apiDocumentation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /* ================= POSTMAN COLLECTION DOWNLOAD ================= */
  async downloadPostmanCollection(req: Request, res: Response) {
    try {
      const baseUrl = process.env.API_BASE_URL || "http://localhost:3001";

      const postmanCollection = {
        info: {
          name: "PRIMA API Collection",
          description: "Complete API collection for PRIMA Task Management System",
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "baseUrl",
            value: baseUrl,
            type: "string"
          },
          {
            key: "token",
            value: "",
            type: "string"
          }
        ],
        item: [
          {
            name: "Authentication",
            item: [
              {
                name: "Login",
                request: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      email: "admin@example.com",
                      password: "password123"
                    }, null, 2)
                  },
                  url: {
                    raw: "{{baseUrl}}/api/users/login",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "login"]
                  }
                }
              },
              {
                name: "Create Super Admin",
                request: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      firstName: "Super",
                      lastName: "Admin",
                      email: "admin@example.com",
                      phone: "+1234567890",
                      designation: "Super Administrator"
                    }, null, 2)
                  },
                  url: {
                    raw: "{{baseUrl}}/api/users/superAdmin",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "superAdmin"]
                  }
                }
              }
            ]
          },
          {
            name: "User Management",
            item: [
              {
                name: "Get Current User",
                request: {
                  method: "GET",
                  header: [
                    {
                      key: "Authorization",
                      value: "Bearer {{token}}"
                    }
                  ],
                  url: {
                    raw: "{{baseUrl}}/api/users/me",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "me"]
                  }
                }
              },
              {
                name: "Get All Users",
                request: {
                  method: "GET",
                  header: [
                    {
                      key: "Authorization",
                      value: "Bearer {{token}}"
                    }
                  ],
                  url: {
                    raw: "{{baseUrl}}/api/users/",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", ""]
                  }
                }
              },
              {
                name: "Invite Employee",
                request: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    },
                    {
                      key: "Authorization",
                      value: "Bearer {{token}}"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      email: "employee@example.com",
                      firstName: "John",
                      lastName: "Doe",
                      phone: "+1234567890",
                      designation: "Developer",
                      role: "EMPLOYEE",
                      employeeCode: "EMP001"
                    }, null, 2)
                  },
                  url: {
                    raw: "{{baseUrl}}/api/users/register",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "register"]
                  }
                }
              }
            ]
          },
          {
            name: "Password Management",
            item: [
              {
                name: "Set Password",
                request: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      email: "user@example.com",
                      otp: "123456",
                      currentPassword: "temp_password",
                      newPassword: "new_password123"
                    }, null, 2)
                  },
                  url: {
                    raw: "{{baseUrl}}/api/users/set-password",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "set-password"]
                  }
                }
              },
              {
                name: "Forgot Password",
                request: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      email: "user@example.com"
                    }, null, 2)
                  },
                  url: {
                    raw: "{{baseUrl}}/api/users/forgot-password",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "forgot-password"]
                  }
                }
              },
              {
                name: "Reset Password",
                request: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      email: "user@example.com",
                      otp: "123456",
                      newPassword: "new_password123"
                    }, null, 2)
                  },
                  url: {
                    raw: "{{baseUrl}}/api/users/reset-password",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "reset-password"]
                  }
                }
              },
              {
                name: "Resend OTP",
                request: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      email: "user@example.com"
                    }, null, 2)
                  },
                  url: {
                    raw: "{{baseUrl}}/api/users/resend-otp",
                    host: ["{{baseUrl}}"],
                    path: ["api", "users", "resend-otp"]
                  }
                }
              }
            ]
          }
        ]
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="PRIMA-api-collection.json"');
      return res.json(postmanCollection);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /* ================= VERIFY EMAIL TOKEN ================= */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      // Check if user with token exists
      const user = await prisma.user.findUnique({
        where: { verificationToken: token }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Verify the user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          isActive: true,
          status: 'ACTIVE',
          verificationToken: null,
          updatedAt: new Date()
        }
      });

      return res.json({
        success: true,
        message: 'Account verified successfully. You can now log in.'
      });
    } catch (error: any) {
      console.error('Email verification error:', error);
      return res.status(500).json({ error: 'Failed to verify email' });
    }
  }
}