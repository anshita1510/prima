import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { number } from "zod";

const prisma = new PrismaClient();

export const updateCredentials = async (
  req: Request,
  res: Response
) => {
  try {
    const loggedInUser = req.user;
console.log('loggedInUser---', loggedInUser);

    if (!loggedInUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const targetUserId = Number(req.params.id);

    if (!targetUserId || isNaN(targetUserId)) {
      return res.status(400).json({ error: "Inavlid user id" });
    }

    if (
      loggedInUser.role !== Role.ADMIN &&
      loggedInUser.id !== targetUserId
    ) {
      return res.status(403)
        .json({
            error: "You are not allowed to update this user"
        });
    }

    const {
      email,
      firstName,
      lastName,
      phone,
      designation
    } = req.body;

    const updateData: Record<string, any>={
      email,
      firstName,
      lastName,
      phone,
      designation
    };

    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    if(Object.keys(updateData).length == 0){
      return res.status(400).json({
        error: "No valid fields provided for update"
      });
    }

    const updateUser = await prisma.user.update({
      where: { id: targetUserId},
      data: updateData
    });

    return res.status(200).json({
      message: "Credentials updated successfully",
      user: updateUser
    });
  } catch(error){
    console.error("Updated credentials error: ", error);
    return res.status(500).json({error: " Internal server error"});
  }
};