const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- TRACING ASSIGNMENT DATES ---");
  const guides = await prisma.tourGuide.findMany({
    include: {
      user: true,
      assignments: {
        include: {
          booking: true
        }
      }
    }
  });
  for (const g of guides) {
    console.log(`\nGuide: ${g.user.name} (${g.user.email})`);
    for (const asg of g.assignments) {
      console.log(`  - Assignment ID: ${asg.id}, Status: ${asg.status}, Booking ID: ${asg.booking.id}, Travel Date: ${asg.booking.travelDate}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
