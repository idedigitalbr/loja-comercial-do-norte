import { readFile } from 'node:fs/promises';
import { PrismaClient, RecordStatus } from '@prisma/client';
import { mapProductRow, WooProductRow } from './migration/catalog-mapper';
import { reconcileMigration } from './migration/reconciliation';

const prisma = new PrismaClient();

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error('Informe o caminho do export JSON do WooCommerce.');
  const rows = JSON.parse(await readFile(inputPath, 'utf8')) as WooProductRow[];
  const result = { read: rows.length, imported: 0, rejected: 0, rejectedIds: [] as string[] };
  for (const row of rows) {
    try {
      const mapped = mapProductRow(row);
      const brand = mapped.brandName ? await prisma.brand.upsert({ where: { legacySource_legacyId: { legacySource: mapped.legacySource, legacyId: `brand:${mapped.brandName.toLowerCase()}` } }, update: { name: mapped.brandName, status: RecordStatus.ACTIVE }, create: { legacySource: mapped.legacySource, legacyId: `brand:${mapped.brandName.toLowerCase()}`, name: mapped.brandName, slug: mapped.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), status: RecordStatus.ACTIVE } }) : null;
      const category = await prisma.category.upsert({ where: { legacySource_legacyId: { legacySource: mapped.legacySource, legacyId: `category:${mapped.categoryName.toLowerCase()}` } }, update: { name: mapped.categoryName, status: RecordStatus.ACTIVE }, create: { legacySource: mapped.legacySource, legacyId: `category:${mapped.categoryName.toLowerCase()}`, name: mapped.categoryName, slug: mapped.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), status: RecordStatus.ACTIVE } });
      const product = await prisma.product.upsert({ where: { legacySource_legacyId: { legacySource: mapped.legacySource, legacyId: mapped.legacyId } }, update: { name: mapped.name, slug: mapped.slug, brandId: brand?.id }, create: { legacySource: mapped.legacySource, legacyId: mapped.legacyId, name: mapped.name, slug: mapped.slug, brandId: brand?.id, status: RecordStatus.DRAFT } });
      await prisma.productCategory.upsert({ where: { productId_categoryId: { productId: product.id, categoryId: category.id } }, update: {}, create: { productId: product.id, categoryId: category.id } });
      await prisma.productVariant.upsert({ where: { sku: mapped.sku }, update: { productId: product.id, priceCents: mapped.priceCents }, create: { productId: product.id, sku: mapped.sku, priceCents: mapped.priceCents } });
      result.imported += 1;
    } catch {
      result.rejected += 1;
      result.rejectedIds.push(String(row.id));
    }
  }
  console.log(JSON.stringify(reconcileMigration({ expected: rows.length, result }), null, 2));
}

main().finally(() => prisma.$disconnect());
