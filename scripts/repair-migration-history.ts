import dotenv from 'dotenv';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const migrationName = '20260911154500_add_woocommerce_legacy_keys';

async function main() {
  const migrationFile = resolve(process.cwd(), 'prisma/migrations', migrationName, 'migration.sql');
  const checksum = createHash('sha256').update(await readFile(migrationFile)).digest('hex');
  const prisma = new PrismaClient();

  try {
    const migrationTable = await prisma.$queryRaw<Array<{ tableName: string }>>`
      SELECT table_name AS tableName
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = '_prisma_migrations'
      LIMIT 1
    `;
    if (!migrationTable.length) {
      console.log('migration-history: no repair needed');
      return;
    }
    const rows = await prisma.$queryRaw<Array<{ checksum: string }>>`
      SELECT checksum
      FROM _prisma_migrations
      WHERE migration_name = ${migrationName} AND finished_at IS NOT NULL
      LIMIT 1
    `;
    if (!rows.length || rows[0].checksum === checksum) {
      console.log('migration-history: no repair needed');
      return;
    }
    await prisma.$executeRaw`
      UPDATE _prisma_migrations
      SET checksum = ${checksum}
      WHERE migration_name = ${migrationName} AND finished_at IS NOT NULL
    `;
    console.log('migration-history: legacy checksum repaired');
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'migration-history: repair failed');
  process.exitCode = 1;
});
