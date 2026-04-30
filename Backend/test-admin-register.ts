import { UserRepository } from './src/modules/repository/auth/user.repository';
import { SendEmailUseCase } from './src/modules/usecase/email/sendEmail.usecase';
import { NodemailerService } from './src/modules/repository/email/nodemailer.service';
import { InviteEmployeeUsecase } from './src/modules/usecase/employees/inviteEmployee.usecase';
import { Role } from '@prisma/client';
import { prisma } from './src/config/db';

async function main() {
  const userRepo = new UserRepository();
  const emailService = new NodemailerService();
  const sendEmailUseCase = new SendEmailUseCase(emailService);
  const usecase = new InviteEmployeeUsecase(userRepo, sendEmailUseCase);

  // let's grab the first admin
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
      console.log('No admin found, using super admin to create one');
      return;
  }

  console.log(`Starting execute as ADMIN (userId: ${admin.id}, companyId: ${admin.companyId})...`);
  const result = await usecase.execute(Role.ADMIN, {
    email: 'test_invite_321_by_admin@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
    designation: 'Manager',
    role: Role.EMPLOYEE,
  }, admin.id);
  
  console.log('Result:', result);
}
main().catch(console.error).finally(() => process.exit(0));
