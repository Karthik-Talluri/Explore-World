const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Force seeding guides in Neon DB...");
  const hashedGuidePassword = await bcrypt.hash('guide123', 10);
  
  // Seed John Guide
  const guideUser = await prisma.user.upsert({
    where: { email: 'guide@exploreworld.com' },
    update: { role: 'GUIDE' },
    create: {
      email: 'guide@exploreworld.com',
      name: 'John Guide',
      password: hashedGuidePassword,
      role: 'GUIDE'
    }
  });
  
  await prisma.tourGuide.upsert({
    where: { userId: guideUser.id },
    update: { specialization: 'Kashmir, Rajasthan', availability: true },
    create: {
      userId: guideUser.id,
      specialization: 'Kashmir, Rajasthan',
      availability: true
    }
  });
  console.log("John Guide seeded successfully.");

  // Seed Alex Guide
  const guide2User = await prisma.user.upsert({
    where: { email: 'guide2@exploreworld.com' },
    update: { role: 'GUIDE' },
    create: {
      email: 'guide2@exploreworld.com',
      name: 'Alex Guide',
      password: hashedGuidePassword,
      role: 'GUIDE'
    }
  });
  
  await prisma.tourGuide.upsert({
    where: { userId: guide2User.id },
    update: { specialization: 'Kashmir, Kerala', availability: true },
    create: {
      userId: guide2User.id,
      specialization: 'Kashmir, Kerala',
      availability: true
    }
  });
  console.log("Alex Guide seeded successfully.");

  console.log("Database seed completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
