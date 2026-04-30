const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log("🔄 Resetting admin password...");
    
    // Find the super admin user
    const admin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN'
      }
    });
    
    if (!admin) {
      console.log("❌ No super admin found");
      return;
    }
    
    console.log(`Found admin: ${admin.email}`);
    
    // Hash new password
    const newPassword = "admin123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    
    console.log(`✅ Password reset successfully for ${admin.email}`);
    console.log(`New password: ${newPassword}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();