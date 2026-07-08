const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const b = await prisma.booking.findUnique({
    where: { id: 'eb0e064b-924b-4624-a76b-a26f6544d0fe' },
    include: {
      guideAssignment: {
        include: {
          guide: {
            include: { user: true }
          }
        }
      }
    }
  });
  console.log(`Booking ID: ${b.id}`);
  console.log(`Rejected Guides: "${b.rejectedGuides}"`);
  console.log(`Active Assignment: Guide ${b.guideAssignment?.guide?.user?.name}, Status: ${b.guideAssignment?.status}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
