const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
  try {
    const users = await prisma.user.findMany({
      where: {
        profileImage: { not: null },
        profileImageUpdatedAt: null
      }
    });

    console.log(`Found ${users.length} users to backfill.`);

    for (const user of users) {
      // We can use the timestamp from the Cloudinary URL!
      // URL format: https://res.cloudinary.com/.../image/upload/v1788554595/...
      const match = user.profileImage.match(/\/v(\d+)\//);
      let updatedAt = new Date(); // default to now
      
      if (match && match[1]) {
        const unixSeconds = parseInt(match[1], 10);
        updatedAt = new Date(unixSeconds * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { profileImageUpdatedAt: updatedAt }
      });
      console.log(`Updated user ${user.id} with date ${updatedAt.toISOString()}`);
    }
    
    console.log("Backfill complete!");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

backfill();
