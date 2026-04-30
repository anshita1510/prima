import { UserRepository } from '../repository/auth/user.repository';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUserProfile(userId: number) {
    const user = await this.userRepo.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
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

    return {
      id: user.id,
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
  }

  async updateUserProfile(userId: number, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    designation?: string;
  }) {
    const updatedUser = await this.userRepo.updateUser(userId, data);
    
    // Format user data for frontend
    const firstName = updatedUser.firstName || '';
    const lastName = updatedUser.lastName || '';
    
    // Create name, avoiding duplicates and handling empty values
    let name = firstName;
    if (lastName && lastName !== firstName) {
      name = `${firstName} ${lastName}`;
    }
    name = name.trim() || 'User'; // Fallback to 'User' if both are empty

    return {
      id: updatedUser.id,
      name,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      designation: updatedUser.designation,
      status: updatedUser.status,
      isActive: updatedUser.isActive
    };
  }
}