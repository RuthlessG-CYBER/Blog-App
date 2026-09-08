const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { id: true, profileImageUpdatedAt: true }
  });
  console.log(users);
  await prisma.$disconnect();
}
check();
