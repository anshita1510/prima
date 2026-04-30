import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../../config/db";

export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword, confirmPassword, email } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required....." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // 🔐 Find the user who passed OTP verification
  // If email is provided, use it; otherwise find any user with passwordResetAllowed
  const whereClause = email 
    ? { email, passwordResetAllowed: true }
    : { passwordResetAllowed: true };

  const user = await prisma.user.findFirst({
    where: whereClause,
  });

  if (!user) {
    return res.status(403).json({
      message: "OTP verification required or invalid session",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetAllowed: false, // 🔒 lock again
      resetOtp: null,
      resetOtpExpiry: null,
    },
  });

  return res.json({
    message: "Password reset successful",
  });
};
