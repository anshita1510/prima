// Script to create employee records for users who don't have them
import { PrismaClient, Designation, DepartmentType } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMissingEmployees() {
  try {
    console.log('🔍 Finding users without employee records...');

    // Find users who don't have employee records
    const usersWithoutEmployees = await prisma.user.findMany({
      where: {
        employee: null,
        isActive: true,
        status: 'ACTIVE'
      },
      include: {
        company: true
      }
    });

    if (usersWithoutEmployees.length === 0) {
      console.log('✅ All users already have employee records!');
      return;
    }

    console.log(`📋 Found ${usersWithoutEmployees.length} users without employee records`);

    for (const user of usersWithoutEmployees) {
      console.log(`👤 Processing user: ${user.firstName} ${user.lastName} (${user.email})`);

      // Get or create a default company if user doesn't have one
      let companyId = user.companyId;
      if (!companyId) {
        const defaultCompany = await prisma.company.upsert({
          where: { code: 'DEFAULT_COMPANY' },
          update: {},
          create: {
            name: 'Default Company',
            code: 'DEFAULT_COMPANY',
            isActive: true
          }
        });
        companyId = defaultCompany.id;

        // Update user with company
        await prisma.user.update({
          where: { id: user.id },
          data: { companyId }
        });
      }

      // Get or create a default department for the company
      const defaultDepartment = await prisma.department.upsert({
        where: {
          companyId_name: {
            companyId: companyId,
            name: 'General'
          }
        },
        update: {},
        create: {
          name: 'General',
          type: DepartmentType.OPERATIONS,
          companyId: companyId
        }
      });

      // Map user role to employee designation
      let designation: Designation;
      switch (user.role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          designation = Designation.MANAGER;
          break;
        case 'MANAGER':
          designation = Designation.MANAGER;
          break;
        default:
          designation = Designation.SOFTWARE_ENGINEER;
      }

      // Generate unique employee code
      const employeeCode = `EMP${user.id.toString().padStart(4, '0')}`;

      // Create employee record
      const employee = await prisma.employee.create({
        data: {
          userId: user.id,
          companyId: companyId,
          departmentId: defaultDepartment.id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          designation,
          employeeCode,
          isActive: true
        }
      });

      console.log(`✅ Created employee record for ${user.email} (Employee ID: ${employee.id}, Code: ${employeeCode})`);
    }

    console.log('🎉 Successfully created employee records for all users!');

  } catch (error) {
    console.error('❌ Error fixing missing employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  fixMissingEmployees();
}

export { fixMissingEmployees };