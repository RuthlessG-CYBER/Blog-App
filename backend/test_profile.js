const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst();
  console.log("User before:", user.profileImageUpdatedAt);
  
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      profileImageUpdatedAt: new Date(),
    }
  });
  console.log("User after:", updatedUser.profileImageUpdatedAt);
}
test().catch(console.error).finally(() => prisma.$disconnect());
