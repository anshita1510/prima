import { PrismaClient, Designation, DepartmentType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      employee: { is: null }
    }
  });
  
  console.log(`Found ${users.length} admins without employee records.`);

  for (const user of users) {
    if (!user.companyId) {
      const defaultCompany = await prisma.company.upsert({
        where: { code: 'DEFAULT_COMPANY' },
        update: {},
        create: { name: 'Default Company', code: 'DEFAULT_COMPANY', isActive: true }
      });
      await prisma.user.update({ where: { id: user.id }, data: { companyId: defaultCompany.id } });
      user.companyId = defaultCompany.id;
    }

    const defaultDepartment = await prisma.department.upsert({
      where: { companyId_name: { companyId: user.companyId!, name: 'Management' } },
      update: {},
      create: { name: 'Management', type: DepartmentType.OPERATIONS, companyId: user.companyId! }
    });

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        companyId: user.companyId!,
        departmentId: defaultDepartment.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin',
        designation: Designation.MANAGER,
        employeeCode: user.ceoId || `ADM${user.id.toString().padStart(4, '0')}`,
        isActive: true
      }
    });
    console.log(`Created employee ${employee.id} for user ${user.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
