import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up dummy data...");
    try {
        // Drop all employees assigned to users ID < 333
        await prisma.$executeRawUnsafe(`DELETE FROM "Employee" WHERE "userId" < 333`);
    } catch (e) {
        console.log("Employee cleanup error", e);
    }

    try {
        // Clean up users
        await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE id < 333`);
        console.log("Successfully deleted dummy users!");
    } catch (e) {
        console.log("User cleanup error", e);
    }
}

main().finally(() => prisma.$disconnect());
