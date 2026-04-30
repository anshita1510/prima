import bcrypt from "bcrypt";
import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { SendEmailUseCase } from "../../usecase/email/sendEmail.usecase";
import { NodemailerService } from "../../repository/email/nodemailer.service";
import { prisma } from "../../../config/db";

const emailService = new NodemailerService();
const sendEmailUseCase = new SendEmailUseCase(emailService);

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) {
  throw new Error("JWT_SECRET is not defined");
}
const JWT_SECRET: string = JWT_SECRET_ENV;

const jwtOptions: SignOptions = {
  expiresIn: "7d",
};

export class CreateSuperAdminUsecase {
  async execute(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;           // ← Correct: string
    designation: string;
    companyId?: number;
  }) {
    // Prevent multiple Super Admins
    const existing = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existing) {
      throw new Error("Super Admin already exists");
    }

    // Generate secure random password
    const rawPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Generate invite token (kept for consistency, even if not used)
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create Super Admin
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,                    // ← Provided correctly
        designation: data.designation,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        isActive: true,
        inviteToken,
        inviteExpiry,
        companyId: data.companyId ?? null,
      },
    });

    // Generate JWT for immediate login
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      jwtOptions
    );

    console.log("SUPER ADMIN TOKEN:", token);

    // Send credentials via email
    await sendEmailUseCase.execute({
      to: user.email,
      subject: "Your Super Admin Credentials",
      html: `
        <h2>Welcome ${user.firstName}!</h2>
        <p>Your Super Admin account has been created.</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Temporary Password:</b> ${rawPassword}</p>
        <p><strong>Please change your password after logging in.</strong></p>
        <br/>
        <p>Thank you,<br/>Team PRIMA</p>
      `,
    });

    // Return safe user data + token
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
      },
      token,
    };
  }
}