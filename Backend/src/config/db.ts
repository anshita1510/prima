import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Hard limit on individual query execution time (15s)
    transactionOptions: {
        timeout: 15000,
    },
});
