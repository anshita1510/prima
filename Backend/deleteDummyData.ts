import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting deletion of old dummy data (IDs < 333)...');
  
  // We need to delete dependent records first or use Prisma cascade if configured.
  // Assuming there might be Employees associated.
  const oldUsers = await prisma.user.findMany({ where: { id: { lt: 333 } }, select: { id: true } });
  const oldUserIds = oldUsers.map(u => u.id);
  
  console.log(`Found ${oldUserIds.length} old users to delete.`);
  
  if (oldUserIds.length > 0) {
    try {
      await prisma.employee.deleteMany({ where: { userId: { in: oldUserIds } } });
      console.log('Deleted associated employee records.');
    } catch(e) { /* ignore if employee relation fails or doesn't exist */ }

    try {
      await prisma.ceo.deleteMany({ where: { userId: { in: oldUserIds } } });
      console.log('Deleted associated ceo records.');
    } catch(e) { }

    const deleted = await prisma.user.deleteMany({
      where: {
        id: { lt: 333 }
      }
    });
    console.log(`Successfully deleted ${deleted.count} dummy users.`);
  } else {
    console.log('No dummy users found to delete.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
