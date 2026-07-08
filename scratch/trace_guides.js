const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- TRACING GUIDES IN DATABASE ---");
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
  
  console.log(`Total guides found: ${guides.length}`);
  for (const g of guides) {
    console.log(`\nGuide ID: ${g.id}`);
    console.log(`Name: ${g.user.name}`);
    console.log(`Email: ${g.user.email}`);
    console.log(`Availability: ${g.availability}`);
    console.log(`Specialization: "${g.specialization}"`);
    console.log(`Active Assignments Count: ${g.assignments.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
