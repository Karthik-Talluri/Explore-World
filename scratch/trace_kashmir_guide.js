const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findUnique({
    where: { email: 'kashmirguide@exploreworld.com' }
  });
  console.log("Kashmir Guide User details:", u);
}

main().catch(console.error).finally(() => prisma.$disconnect());
