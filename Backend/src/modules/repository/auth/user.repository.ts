import { Role, Status, User } from "@prisma/client";
import { prisma } from "../../../config/db";

export class UserRepository {
  /* Find user by invite token (via password table) */
  async findByInviteToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { inviteToken: token },
    });
  }

  /* Find by email */
  async findByEmail(email: string) {
    return prisma.user.findUnique({ 
      where: { email },
      include: {
        employee: true
      }
    });
  }

  /* Find by ID */
  async findById(id: number) {
    return prisma.user.findUnique({ 
      where: { id },
      include: {
        employee: true
      }
    });
  }

  /* Count Super Admins */
  async countSuperAdmins() {
    return prisma.user.count({
      where: { role: Role.SUPER_ADMIN },
    });
  }

  /* Create user – password is optional (null during invite) */
  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    designation: string;
    role: Role;
    status: Status;
    password?: string | null;
    isActive?: boolean;
    tempPassword?: string | null;
    otp?: string | null;
    otpExpiry?: Date | null;
    inviteToken?: string | null;
    inviteExpiry?: Date | null;
    companyId?: number | null;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        password: data.password ?? null,
        isActive: data.isActive ?? false,
      },
    });
  }

  /* Generic update */
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /* Specific method to update only the password – CLEAN & REUSABLE */
  async updatePassword(userId: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async findByOtp(otp: string) {
    return prisma.user.findFirst({
      where: {
        otp,
        otpExpiry: { gt: new Date() },
      },
    });
  }


  /* Activate user after setting password (used in invite flow) */
  async activateUser(userId: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: Status.ACTIVE,
        isActive: true,
        // Clear invite fields
        inviteToken: null,
        inviteExpiry: null,
        tempPassword: null,
        otp: null,
        otpExpiry: null,
      },
    });
  }
}