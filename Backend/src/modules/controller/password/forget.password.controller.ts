import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/db";
import { sendEmail } from "../../../shared/utils/sendEmail";

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "Email does not exist" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await prisma.user.update({
    where: { email },
    data: {
      resetOtp: hashedOtp,
      resetOtpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await sendEmail(
    email,
    "Reset Password OTP",
    `Your OTP is ${otp}. It will expire in 5 minutes.`
  );

  res.json({ message: "OTP sent to email" });
};


