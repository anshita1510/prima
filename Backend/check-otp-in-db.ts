import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkOTP() {
    const email = process.argv[2];

    if (!email) {
        console.log('Usage: npx ts-node check-otp-in-db.ts <email>');
        console.log('Example: npx ts-node check-otp-in-db.ts superadmin@prima.com');
        process.exit(1);
    }

    console.log(`\n🔍 Checking OTP for: ${email}\n`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                resetOtp: true,
                resetOtpExpiry: true,
            }
        });

        if (!user) {
            console.log('❌ User not found in database');
            process.exit(1);
        }

        console.log('✅ User found:');
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log('');

        if (user.resetOtp) {
            console.log('🔐 OTP Information:');
            console.log(`   OTP Hash: ${user.resetOtp.substring(0, 20)}...`);
            console.log(`   Expiry: ${user.resetOtpExpiry}`);

            if (user.resetOtpExpiry) {
                const now = new Date();
                const expiry = new Date(user.resetOtpExpiry);
                const isExpired = expiry < now;

                console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);

                if (!isExpired) {
                    const minutesLeft = Math.floor((expiry.getTime() - now.getTime()) / 1000 / 60);
                    console.log(`   Time Left: ${minutesLeft} minutes`);
                }
            }
        } else {
            console.log('⚠️  No OTP found for this user');
            console.log('   Request a new OTP from the forgot password page');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkOTP();
