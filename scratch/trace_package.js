const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- TRACING TOUR PACKAGES IN DATABASE ---");
  const pkgs = await prisma.tourPackage.findMany();
  for (const p of pkgs) {
    console.log(`Package Name: "${p.name}"`);
    console.log(`Destination: "${p.destination}"`);
    console.log(`ID: ${p.id}`);
    console.log(`----------------------------------------`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
