// Quick script to set admin password directly (bypass OTP)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask question and get input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setPassword() {
  try {
    console.log('\n🔐 Admin Password Setup Tool');
    console.log('=====================================\n');

    // Get email from user
    const email = await askQuestion('📧 Enter admin email: ');
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email!');
      rl.close();
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      console.log(`❌ User with email "${email}" not found!`);
      rl.close();
      return;
    }

    // Get password from user
    const newPassword = await askQuestion('🔑 Enter new password: ');
    
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters!');
      rl.close();
      return;
    }

    console.log(`\n⏳ Setting password for: ${email}...`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
        isActive: true,
        otp: null,
        tempPassword: null,
        otpExpiry: null
      }
    });

    console.log('\n✅ Password set successfully!');
    console.log('=====================================');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', newPassword);
    console.log('📊 Status:', user.status);
    console.log('✅ Active:', user.isActive);
    console.log('=====================================');
    console.log('\n🎉 Admin can now login with these credentials!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n💡 Try logging in at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

setPassword();
