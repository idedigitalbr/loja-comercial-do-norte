import { PrismaClient } from '@prisma/client';
import { importWooCommerceCatalog } from '../apps/api/src/modules/catalog/woocommerce-importer';

const baseUrl = process.env.WOOCOMMERCE_STORE_URL ?? 'https://jonaselivaldohair.com.br';
const dryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

async function main() {
  try {
    const summary = await importWooCommerceCatalog({ prisma, baseUrl, dryRun });
    console.log(JSON.stringify({ source: baseUrl, ...summary }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

void main();
