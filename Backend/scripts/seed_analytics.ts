import process from 'process';
import { PrismaClient, Role, Status, Designation } from '@prisma/client';

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateAnalyticsData() {
    console.log('🌱 Starting dummy data generation for Analytics Engine...');

    const now = new Date();
    const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    console.log('🏢 Spawning Dummy Companies over the last 365 days...');
    let companiesCreated = 0;
    for (let i = 0; i < 40; i++) {
        const creationDate = randomDate(pastYear, now);
        try {
            await prisma.company.create({
                data: {
                    name: `Sample Organization Alpha ${i}-${Math.floor(Math.random() * 9999)}`,
                    code: `S-ORG-${i}-${Math.floor(Math.random() * 9999)}`,
                    isActive: Math.random() > 0.05, // 95% active
                    createdAt: creationDate,
                    updatedAt: creationDate,
                }
            });
            companiesCreated++;
        } catch (e) {
            // Ignore unique constraints
        }
    }
    console.log(`✅ Created ${companiesCreated} fake companies.`);

    console.log('👥 Spawning Dummy Users & Admins over the last 365 days...');
    let usersCreated = 0;

    for (let i = 0; i < 150; i++) {
        const creationDate = randomDate(pastYear, now);
        const updatedDate = randomDate(creationDate, now); // Activity trend proxy

        // Distributed generation: 15% Admin, 25% Manager, 60% Employee
        const rand = Math.random();
        let assignedRole: Role = Role.EMPLOYEE;
        if (rand < 0.15) assignedRole = Role.ADMIN;
        else if (rand < 0.40) assignedRole = Role.MANAGER;

        try {
            await prisma.user.create({
                data: {
                    email: `dummy.user.analytics${i}_${Math.floor(Math.random() * 99999)}@testplatform.com`,
                    firstName: `DemoUser${i}`,
                    lastName: `DataPoint`,
                    phone: `555-01${i.toString().padStart(2, '0').slice(0, 2)}${Math.floor(Math.random() * 99)}`,
                    designation: Designation.SOFTWARE_ENGINEER,
                    role: assignedRole,
                    status: Status.ACTIVE,
                    password: 'mock_password_do_not_use',
                    isActive: true,
                    createdAt: creationDate,
                    updatedAt: updatedDate,
                }
            });
            usersCreated++;
        } catch (e) {
            // Ignore unique constraints
        }
    }
    console.log(`✅ Created ${usersCreated} fake active users.`);
    console.log('🎉 Database is successfully saturated with historical dummy data for the Analytics Engine!');
}

generateAnalyticsData()
    .catch(e => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
