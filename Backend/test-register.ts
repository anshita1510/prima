import { UserRepository } from './src/modules/repository/auth/user.repository';
import { SendEmailUseCase } from './src/modules/usecase/email/sendEmail.usecase';
import { NodemailerService } from './src/modules/repository/email/nodemailer.service';
import { InviteEmployeeUsecase } from './src/modules/usecase/employees/inviteEmployee.usecase';
import { Role } from '@prisma/client';

async function main() {
  const userRepo = new UserRepository();
  const emailService = new NodemailerService();
  const sendEmailUseCase = new SendEmailUseCase(emailService);
  const usecase = new InviteEmployeeUsecase(userRepo, sendEmailUseCase);

  console.log('Starting execute...');
  const result = await usecase.execute(Role.SUPER_ADMIN, {
    email: 'test_invite_321@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
    designation: 'Manager',
    role: Role.ADMIN,
    companyName: 'Test Company'
  });
  console.log('Result:', result);
}
main().catch(console.error).finally(() => process.exit(0));
