import { PrismaClient, Role } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function getEmployeeCredentials() {
    console.log('\n📋 FETCHING EMPLOYEE CREDENTIALS\n');
    console.log('='.repeat(80));

    try {
        // Get all users with their roles
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                isActive: true,
                designation: true,
                phone: true,
                employee: {
                    select: {
                        employeeCode: true,
                        department: {
                            select: {
                                name: true,
                                type: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { role: 'asc' },
                { firstName: 'asc' }
            ]
        });

        if (users.length === 0) {
            console.log('❌ No users found in database');
            return;
        }

        console.log(`\n✅ Found ${users.length} users\n`);

        // Group by role
        const groupedByRole: Record<string, typeof users> = {};
        users.forEach(user => {
            if (!groupedByRole[user.role]) {
                groupedByRole[user.role] = [];
            }
            groupedByRole[user.role].push(user);
        });

        // Display by role
        Object.entries(groupedByRole).forEach(([role, roleUsers]) => {
            console.log(`\n${'━'.repeat(80)}`);
            console.log(`🔹 ${role} (${roleUsers.length} user${roleUsers.length > 1 ? 's' : ''})`);
            console.log('━'.repeat(80));

            roleUsers.forEach((user, index) => {
                const fullName = `${user.firstName} ${user.lastName}`.trim();
                const status = user.isActive ? '✅ Active' : '❌ Inactive';
                const dept = user.employee?.department?.name || 'N/A';
                const deptType = user.employee?.department?.type || '';
                const empCode = user.employee?.employeeCode || 'N/A';

                console.log(`\n${index + 1}. ${fullName}`);
                console.log(`   Email:         ${user.email}`);
                console.log(`   Role:          ${user.role}`);
                console.log(`   Status:        ${user.status} ${status}`);
                console.log(`   Designation:   ${user.designation || 'N/A'}`);
                console.log(`   Phone:         ${user.phone || 'N/A'}`);
                console.log(`   Employee Code: ${empCode}`);
                console.log(`   Department:    ${dept}${deptType ? ` (${deptType})` : ''}`);
            });
        });

        console.log('\n' + '='.repeat(80));
        console.log('\n📝 NOTES:');
        console.log('   • Passwords are hashed and cannot be displayed');
        console.log('   • Use "Forgot Password" to reset any password');
        console.log('   • For new employees, check invite emails for temp passwords');
        console.log('   • OTP will be shown in backend console when requested');

        console.log('\n💡 TO LOGIN:');
        console.log('   1. Go to: http://localhost:3000/login');
        console.log('   2. Use email from above');
        console.log('   3. If password unknown, use "Forgot Password"');
        console.log('   4. Check backend console for OTP');

        console.log('\n🔧 TO RESET PASSWORD:');
        console.log('   1. Go to: http://localhost:3000/Forget_pass');
        console.log('   2. Enter email address');
        console.log('   3. Check backend console for OTP (printed there!)');
        console.log('   4. Enter OTP and set new password');

        console.log('\n📊 SUMMARY:');
        console.log(`   Total Users: ${users.length}`);
        Object.entries(groupedByRole).forEach(([role, roleUsers]) => {
            console.log(`   ${role}: ${roleUsers.length}`);
        });

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

getEmployeeCredentials();
