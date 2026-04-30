import { UserRepository } from "../../repository/auth/user.repository";
import { comparePassword } from "../../../shared/utils/password";
import { generateAuthToken } from "../../../shared/utils/jwt";
import { Status } from "@prisma/client";

export class LoginUsecase {
  constructor(private userRepo: UserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password hello");
    }

    // Allow login with either permanent password or temporary password
    let isValid = false;
    if (user.password) {
      isValid = await comparePassword(password, user.password);
    } else if (user.tempPassword) {
      isValid = await comparePassword(password, user.tempPassword);
    }

    if (!isValid) {
      throw new Error("Invalid password");
    }

    if(!user.isActive){
      throw new Error("Account disabled");
    }

    if (user.status === Status.INACTIVE) {
      throw new Error("Account is inactive");
    }

    return this.generateTokenForUser(user);
  }

  async generateTokenForUser(user: any) {
    const token = generateAuthToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    // Get employee information if exists
    let employeeId = null;
    if (user.employee) {
      employeeId = user.employee.id;
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
      employeeId, // Include employeeId for attendance system
      companyId: user.companyId, // Include companyId for project management
      name,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      designation: user.designation,
      status: user.status,
      isActive: user.isActive,
      authProvider: user.authProvider
    };

    return { 
      success: true,
      user: formattedUser, 
      token 
    };
  }
}
