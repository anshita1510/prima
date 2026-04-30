
import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../modules/repository/auth/user.repository";
import { prisma } from "../config/db";


const userRepo = new UserRepository();


export const inviteAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Invite token missing" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    // Find User directly by inviteToken
    const user = await prisma.user.findUnique({
      where: { inviteToken: token },
    });
    if (!user || !user.inviteExpiry || user.inviteExpiry < new Date()) {
      return res.status(401).json({ error: "Invalid or expired invite token aggaga" });
    }
    // Attach the invited user to request
    (req as any).invitedUser = user;
    next();
  } catch (err) {
    console.error("Invite auth error:", err);
    return res.status(401).json({ error: "Invalid invite token" });
  }
};
