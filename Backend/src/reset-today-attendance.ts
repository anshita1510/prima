// Script to reset today's attendance for testing
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetTodayAttendance() {
  try {
    console.log('🔄 Resetting today\'s attendance records...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deletedRecords = await prisma.attendance.deleteMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    console.log(`✅ Deleted ${deletedRecords.count} attendance records for today`);
    console.log('🎉 Ready for fresh check-in/check-out testing!');

  } catch (error) {
    console.error('❌ Error resetting attendance:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  resetTodayAttendance();
}

export { resetTodayAttendance };