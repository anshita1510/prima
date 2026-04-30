import bcrypt from 'bcrypt';
import { UserRepository } from '../../repository/auth/user.repository';

export class UpdatePasswordUsecase {
  constructor(private userRepo: UserRepository) {}

  async execute(userId: number, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // This method now exists!
    await this.userRepo.updatePassword(userId, hashedPassword);

    // NEVER log raw passwords in production!
    // console.log("New password: ", newPassword);  // Remove this line

    return { message: 'Password updated successfully' };
  }
}