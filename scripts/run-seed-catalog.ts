import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedCatalog } from '../prisma/seed-catalog';

const prisma = new PrismaClient();

async function main() {
  console.log('Running seedCatalog...');
  const res = await seedCatalog(prisma);
  console.log('Done seedCatalog:', res);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
