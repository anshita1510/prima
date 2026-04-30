import { Role } from "@prisma/client";

export interface InviteEmployeeDTO{
    email: string;
    firstName: string;
    lastName: string;
    phone?: number;
    designation: string;
    role: Role; // ✅ invited user's role
}