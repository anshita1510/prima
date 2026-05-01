import { PrismaClient, Role, DepartmentType, Designation } from '@prisma/client'
import bcrypt from 'bcrypt'
import { seedSuperAdminWorld } from './seedSuperAdminWorld'
import { seedDemoMeetings } from './seedMeetings'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('Seeding started...')

  // 1️⃣ Create Company
  const company = await prisma.company.upsert({
    where: { code: 'PRIMA' },
    update: {},
    create: {
      name: 'PRIMA Technologies',
      code: 'PRIMA',
      isActive: true,
    },
  })

  // 2️⃣ Create Department (IT)
  const itDepartment = await prisma.department.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'IT',
      },
    },
    update: {},
    create: {
      name: 'IT',
      type: DepartmentType.IT,
      companyId: company.id,
    },
  })

  // 3️⃣ Hash password
  const passwordHash: string = await bcrypt.hash('Admin@123', 10)

  // 4️⃣ Create SUPER ADMIN User
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@mailinator.com' },
    update: {},
    create: {
      email: 'superadmin@mailinator.com',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890',
      designation: 'DIRECTOR',
      password: passwordHash,
      role: Role.SUPER_ADMIN,
      status: 'ACTIVE',
      isActive: true,
      companyId: company.id
    },
  })

  // 5️⃣ Employee for super admin — upsert by employeeCode so re-seeding after an email
  //    change does not try to create a second EMP-0001 (unique on employeeCode / userId).
  const superOther = await prisma.employee.findUnique({ where: { userId: superAdminUser.id } })
  if (superOther && superOther.employeeCode !== 'EMP-0001') {
    await prisma.employee.delete({ where: { id: superOther.id } })
  }
  const superAdminEmployee = await prisma.employee.upsert({
    where: { employeeCode: 'EMP-0001' },
    update: {
      userId: superAdminUser.id,
      companyId: company.id,
      departmentId: itDepartment.id,
      name: 'Super Admin',
      designation: Designation.DIRECTOR,
      isActive: true,
    },
    create: {
      userId: superAdminUser.id,
      companyId: company.id,
      departmentId: itDepartment.id,
      name: 'Super Admin',
      designation: Designation.DIRECTOR,
      employeeCode: 'EMP-0001',
      isActive: true,
    },
  })

  // 6️⃣ Assign Department Manager
  await prisma.department.update({
    where: { id: itDepartment.id },
    data: {
      managerId: superAdminEmployee.id,
    },
  })

  await seedSuperAdminWorld(prisma, passwordHash)
  await seedDemoMeetings(prisma)

  console.log('✅ Seeding completed successfully')
  console.log('👤 SUPER ADMIN LOGIN:')
  console.log('📧 Email: superadmin@mailinator.com')
  console.log('🔑 Password: Admin@123')
  console.log('')
  console.log('👤 CEO TENANTS: ceo.tnt01@mailinator.com … ceo.tnt20@mailinator.com (Admin@123)')
  console.log('📅 Demo MEETING rows seeded per company — visible under Admin → Meetings after login.')
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
