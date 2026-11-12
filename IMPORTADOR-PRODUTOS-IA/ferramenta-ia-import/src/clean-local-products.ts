import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { assertLocalDatabaseUrl, loadLocalEnvironment, resolveRepoRoot } from './db-safety';

const PROTECTED_UPLOAD_PREFIXES = ['seed-banner-'];

export interface CleanLocalProductsResult {
  before: Record<string, number>;
  after: Record<string, number>;
  removedUploadFolders: string[];
  preservedCounts: Record<string, number>;
}

async function getProductAndTaxonomyCounts(prisma: PrismaClient) {
  const [
    products,
    variants,
    images,
    inventoryBalances,
    quotes,
    orders,
    carts,
    favorites,
    brands,
    categories,
    segments,
    tags,
    users,
    posts,
    events,
    siteConfigs,
    siteBanners,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
    prisma.inventoryBalance.count(),
    prisma.quote.count(),
    prisma.order.count(),
    prisma.cart.count(),
    prisma.customerFavorite.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.segment.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.post.count(),
    prisma.event.count(),
    prisma.siteConfiguration.count(),
    prisma.siteBanner.count(),
  ]);

  return {
    productData: { products, variants, images, inventoryBalances, quotes, orders, carts, favorites },
    preserved: { brands, categories, segments, tags, users, posts, events, siteConfigs, siteBanners },
  };
}

function extractOwnedUploadFolder(uploadPath: string | null | undefined): string | null {
  if (!uploadPath) return null;
  const normalized = uploadPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = normalized.split('/');
  // Espera: uploads/<subdir>/... ou uploads/cn-cat/<slug>/...
  if (parts[0] !== 'uploads' || parts.length < 2) return null;
  if (parts[1] === 'cn-cat' && parts.length >= 3) {
    return `uploads/cn-cat/${parts[2]}`;
  }
  return `uploads/${parts[1]}`;
}

export async function cleanLocalProducts(options: {
  prisma: PrismaClient;
  parsedUrl: URL;
  repoRoot: string;
  dryRun?: boolean;
}): Promise<CleanLocalProductsResult> {
  const { prisma, parsedUrl, repoRoot, dryRun = false } = options;

  // Trava rígida: limpeza nunca pode rodar fora de PostgreSQL local
  assertLocalDatabaseUrl(parsedUrl, { allowRemote: false });

  const beforeSnap = await getProductAndTaxonomyCounts(prisma);

  const [productImages, protectedBanners, protectedConfigs, protectedBrands, protectedCategories, protectedSegments] =
    await Promise.all([
      prisma.productImage.findMany({ select: { path: true } }),
      prisma.siteBanner.findMany({ select: { desktopPath: true, mobilePath: true } }),
      prisma.siteConfiguration.findMany({ select: { logoPath: true, faviconPath: true } }),
      prisma.brand.findMany({ select: { imagePath: true } }),
      prisma.category.findMany({ select: { imagePath: true } }),
      prisma.segment.findMany({ select: { imagePath: true } }),
    ]);

  const protectedFolders = new Set<string>();
  for (const row of protectedBanners) {
    const f1 = extractOwnedUploadFolder(row.desktopPath);
    const f2 = extractOwnedUploadFolder(row.mobilePath);
    if (f1) protectedFolders.add(f1);
    if (f2) protectedFolders.add(f2);
  }
  for (const row of protectedConfigs) {
    const f1 = extractOwnedUploadFolder(row.logoPath);
    const f2 = extractOwnedUploadFolder(row.faviconPath);
    if (f1) protectedFolders.add(f1);
    if (f2) protectedFolders.add(f2);
  }
  for (const row of [...protectedBrands, ...protectedCategories, ...protectedSegments]) {
    const f = extractOwnedUploadFolder(row.imagePath);
    if (f) protectedFolders.add(f);
  }

  const candidateUploadFolders = new Set<string>();
  for (const img of productImages) {
    const folder = extractOwnedUploadFolder(img.path);
    if (!folder) continue;
    const baseName = folder.split('/').pop() ?? '';
    if (PROTECTED_UPLOAD_PREFIXES.some((prefix) => baseName.startsWith(prefix))) continue;
    if (protectedFolders.has(folder)) continue;
    candidateUploadFolders.add(folder);
  }

  if (dryRun) {
    return {
      before: beforeSnap.productData,
      after: beforeSnap.productData,
      removedUploadFolders: Array.from(candidateUploadFolders),
      preservedCounts: beforeSnap.preserved,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.deleteMany();
    await tx.inventoryReservation.deleteMany();
    await tx.cartItem.deleteMany();
    await tx.cart.deleteMany();
    await tx.quoteItem.deleteMany();
    await tx.quoteEvent.deleteMany();
    await tx.quote.deleteMany();
    await tx.customerFavorite.deleteMany();

    // Remove apenas pedidos que não contenham sessões de treinamento
    const demoProductOrders = await tx.order.findMany({
      where: {
        items: { none: { trainingSessionId: { not: null } } },
      },
      select: { id: true },
    });
    const demoOrderIds = demoProductOrders.map((o) => o.id);
    if (demoOrderIds.length > 0) {
      await tx.couponRedemption.deleteMany({ where: { orderId: { in: demoOrderIds } } });
      await tx.payment.deleteMany({ where: { orderId: { in: demoOrderIds } } });
      await tx.shippingQuote.deleteMany({ where: { orderId: { in: demoOrderIds } } });
      await tx.shipment.deleteMany({ where: { orderId: { in: demoOrderIds } } });
      await tx.orderStatusHistory.deleteMany({ where: { orderId: { in: demoOrderIds } } });
      await tx.orderItem.deleteMany({ where: { orderId: { in: demoOrderIds } } });
      await tx.order.deleteMany({ where: { id: { in: demoOrderIds } } });
    }

    await tx.inventoryBalance.deleteMany();
    await tx.productImage.deleteMany();
    await tx.productCategory.deleteMany();
    await tx.productSegment.deleteMany();
    await tx.productTag.deleteMany();
    await tx.promotionScope.deleteMany({ where: { productId: { not: null } } });
    await tx.couponProductRule.deleteMany();
    await tx.productVariant.deleteMany();
    await tx.product.deleteMany();
  });

  const storageRoot = resolve(repoRoot, 'apps/api/storage');
  const removedUploadFolders: string[] = [];
  for (const relFolder of candidateUploadFolders) {
    const absFolder = resolve(storageRoot, relFolder);
    if (existsSync(absFolder)) {
      await rm(absFolder, { recursive: true, force: true });
      removedUploadFolders.push(relFolder);
    }
  }

  const afterSnap = await getProductAndTaxonomyCounts(prisma);
  return {
    before: beforeSnap.productData,
    after: afterSnap.productData,
    removedUploadFolders,
    preservedCounts: afterSnap.preserved,
  };
}

async function runCli() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const confirmed = args.includes('--confirm');

  if (!dryRun && !confirmed) {
    console.error('Uso: npx tsx clean-local-products.ts --confirm [--dry-run]');
    console.error('Passe --confirm para executar a limpeza dos produtos de demonstração no banco LOCAL.');
    process.exit(1);
  }

  const repoRoot = resolveRepoRoot(__dirname);
  const { parsedUrl } = loadLocalEnvironment(repoRoot);
  assertLocalDatabaseUrl(parsedUrl, { allowRemote: false });

  const prisma = new PrismaClient();
  try {
    console.log(`[clean-local-products] Destino LOCAL: ${parsedUrl.host}${parsedUrl.pathname} (dryRun=${dryRun})`);
    const result = await cleanLocalProducts({ prisma, parsedUrl, repoRoot, dryRun });
    console.log('[clean-local-products] Antes :', JSON.stringify(result.before));
    console.log('[clean-local-products] Depois:', JSON.stringify(result.after));
    console.log('[clean-local-products] Taxonomia & CMS preservados:', JSON.stringify(result.preservedCounts));
    console.log(`[clean-local-products] Pastas de imagem removidas: ${result.removedUploadFolders.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runCli().catch((err) => {
    console.error('[clean-local-products] Erro:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
