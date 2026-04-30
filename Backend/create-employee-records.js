const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createEmployeeRecords() {
  try {
    console.log('🔍 Checking for users without employee records...');
    
    // Find all users who don't have employee records
    const usersWithoutEmployees = await prisma.user.findMany({
      where: {
        employee: null
      },
      include: {
        employee: true
      }
    });

    console.log(`📊 Found ${usersWithoutEmployees.length} users without employee records`);

    if (usersWithoutEmployees.length === 0) {
      console.log('✅ All users already have employee records');
      return;
    }

    // Get or create default company and department
    let company = await prisma.company.findFirst();
    if (!company) {
      console.log('🏢 Creating default company...');
      company = await prisma.company.create({
        data: {
          name: 'PRIMA Technologies',
          code: 'PRIMA',
          isActive: true
        }
      });
    }

    let department = await prisma.department.findFirst({
      where: { companyId: company.id }
    });
    if (!department) {
      console.log('🏬 Creating default department...');
      department = await prisma.department.create({
        data: {
          name: 'General',
          type: 'IT',
          companyId: company.id
        }
      });
    }

    // Create employee records for users
    for (const user of usersWithoutEmployees) {
      try {
        const employeeCode = `EMP${String(user.id).padStart(3, '0')}`;
        
        // Map user designation to employee designation enum
        let designation = 'SOFTWARE_ENGINEER'; // default
        const userDesignation = user.designation?.toUpperCase();
        
        if (userDesignation?.includes('INTERN')) designation = 'INTERN';
        else if (userDesignation?.includes('SENIOR')) designation = 'SENIOR_ENGINEER';
        else if (userDesignation?.includes('LEAD')) designation = 'TECH_LEAD';
        else if (userDesignation?.includes('MANAGER')) designation = 'MANAGER';
        else if (userDesignation?.includes('HR')) designation = 'HR';
        else if (userDesignation?.includes('DIRECTOR')) designation = 'DIRECTOR';

        const employee = await prisma.employee.create({
          data: {
            userId: user.id,
            companyId: company.id,
            departmentId: department.id,
            name: `${user.firstName} ${user.lastName}`.trim() || 'Employee',
            designation: designation,
            employeeCode: employeeCode,
            isActive: user.isActive
          }
        });

        console.log(`✅ Created employee record for ${user.firstName} ${user.lastName} (ID: ${employee.id}, Code: ${employeeCode})`);
        
      } catch (error) {
        console.error(`❌ Failed to create employee for user ${user.id}:`, error.message);
      }
    }

    console.log('🎉 Employee record creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating employee records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createEmployeeRecords();