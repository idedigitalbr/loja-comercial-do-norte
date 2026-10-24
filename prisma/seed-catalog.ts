import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { resolveApiStorageRoot } from '../apps/api/src/modules/files/storage-root';

/**
 * Catálogo de DEMONSTRAÇÃO da Comercial do Norte.
 *
 * - Nenhum dado real de cliente, marca, preço ou depoimento: tudo é exemplo.
 * - `legacySource = SEED_DEMO` marca os registros criados por este seed.
 * - Imagens são geradas localmente (WebP) na storage da API; não há hotlink.
 * - Idempotente: upserts por `slug`/`sku`, seguro para rodar várias vezes.
 */

export const DEMO_SOURCE = 'SEED_DEMO';

const categories = [
  { name: 'Artigos para Festa', slug: 'artigos-para-festa' },
  { name: 'Embalagens', slug: 'embalagens' },
  { name: 'Descartáveis', slug: 'descartaveis' },
  { name: 'Doces e Bomboniere', slug: 'doces-e-bomboniere' },
  { name: 'Sacos e Sacolas', slug: 'sacos-e-sacolas' },
  { name: 'Produtos de Limpeza', slug: 'produtos-de-limpeza' },
  { name: 'Frios e Laticínios', slug: 'frios-e-laticinios' },
  { name: 'Mercearia', slug: 'mercearia' },
] as const;

const brands = [{ name: 'Marca Exemplo', slug: 'marca-exemplo' }] as const;

type DemoProduct = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  sku: string;
  priceCents: number;
  compareAtPriceCents?: number;
  weightGrams: number;
  widthMm?: number;
  heightMm?: number;
  lengthMm?: number;
  physicalQuantity: number;
  status: 'ACTIVE' | 'DRAFT';
};

/** Produtos de exemplo. Dois ficam em DRAFT para exercitar a fila de publicação. */
export const demoProducts: readonly DemoProduct[] = [
  {
    slug: 'copo-descartavel-300ml', name: 'Copo Descartável Transparente 300 ml',
    description: 'Pacote com 100 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'descartaveis', sku: 'DEMO-COP-300', priceCents: 890, compareAtPriceCents: 1090,
    weightGrams: 1200, widthMm: 300, heightMm: 400, lengthMm: 300, physicalQuantity: 180, status: 'ACTIVE',
  },
  {
    slug: 'prato-descartavel-21cm', name: 'Prato Descartável Branco 21 cm',
    description: 'Pacote com 50 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'descartaveis', sku: 'DEMO-PRA-021', priceCents: 1250,
    weightGrams: 900, widthMm: 210, heightMm: 120, lengthMm: 210, physicalQuantity: 140, status: 'ACTIVE',
  },
  {
    slug: 'guardanapo-papel-24x24', name: 'Guardanapo de Papel 24 x 24 cm',
    description: 'Pacote com 50 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'artigos-para-festa', sku: 'DEMO-GUA-2424', priceCents: 650,
    weightGrams: 500, widthMm: 240, heightMm: 80, lengthMm: 240, physicalQuantity: 220, status: 'ACTIVE',
  },
  {
    slug: 'caixa-pizza-35cm', name: 'Caixa de Pizza 35 cm',
    description: 'Caixa de papelão para pizza, 100 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'embalagens', sku: 'DEMO-CAI-035', priceCents: 390, compareAtPriceCents: 450,
    weightGrams: 400, widthMm: 350, heightMm: 40, lengthMm: 350, physicalQuantity: 300, status: 'ACTIVE',
  },
  {
    slug: 'bandeja-isopor-n2', name: 'Bandeja de Isopor nº 2',
    description: 'Bandeja para frios e carnes, 100 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'embalagens', sku: 'DEMO-BAN-002', priceCents: 990,
    weightGrams: 300, widthMm: 250, heightMm: 30, lengthMm: 200, physicalQuantity: 160, status: 'ACTIVE',
  },
  {
    slug: 'sacola-plastica-40x50', name: 'Sacola Plástica Reforçada 40 x 50 cm',
    description: 'Fardo com 1 kg de sacolas. Produto de demonstração do catálogo.',
    categorySlug: 'sacos-e-sacolas', sku: 'DEMO-SAC-4050', priceCents: 1590,
    weightGrams: 1500, widthMm: 400, heightMm: 60, lengthMm: 500, physicalQuantity: 90, status: 'ACTIVE',
  },
  {
    slug: 'velas-aniversario-coloridas', name: 'Velas de Aniversário Coloridas',
    description: 'Cartela com 12 velas. Produto de demonstração do catálogo.',
    categorySlug: 'artigos-para-festa', sku: 'DEMO-VEL-0012', priceCents: 420,
    weightGrams: 120, widthMm: 150, heightMm: 20, lengthMm: 100, physicalQuantity: 75, status: 'ACTIVE',
  },
  {
    slug: 'forminha-docinho-n5', name: 'Forminha de Docinho nº 5',
    description: 'Pacote com 100 forminhas. Produto de demonstração do catálogo.',
    categorySlug: 'doces-e-bomboniere', sku: 'DEMO-FOR-005', priceCents: 730,
    weightGrams: 200, widthMm: 200, heightMm: 60, lengthMm: 150, physicalQuantity: 210, status: 'ACTIVE',
  },
  {
    slug: 'detergente-neutro-5l', name: 'Detergente Neutro 5 L',
    description: 'Galão de 5 litros. Produto de demonstração do catálogo.',
    categorySlug: 'produtos-de-limpeza', sku: 'DEMO-DET-005L', priceCents: 2490, compareAtPriceCents: 2790,
    weightGrams: 5200, widthMm: 200, heightMm: 300, lengthMm: 150, physicalQuantity: 60, status: 'ACTIVE',
  },
  {
    slug: 'leite-condensado-395g', name: 'Leite Condensado 395 g',
    description: 'Lata de 395 g. Produto de demonstração do catálogo.',
    categorySlug: 'mercearia', sku: 'DEMO-LEI-395', priceCents: 749,
    weightGrams: 400, widthMm: 80, heightMm: 110, lengthMm: 80, physicalQuantity: 320, status: 'ACTIVE',
  },
  {
    // DRAFT: falta comprimento, então a publicação deve falhar com PRODUCT_INCOMPLETE.
    slug: 'filme-pvc-30cm', name: 'Filme PVC 30 cm x 30 m',
    description: 'Rolo de filme PVC. Produto de demonstração aguardando dados completos.',
    categorySlug: 'embalagens', sku: 'DEMO-FIL-030', priceCents: 1890,
    weightGrams: 350, widthMm: 300, heightMm: 100, physicalQuantity: 45, status: 'DRAFT',
  },
  {
    // DRAFT completo: publicar deve funcionar assim que o marketing decidir.
    slug: 'queijo-mussarela-fatiado-1kg', name: 'Queijo Mussarela Fatiado 1 kg',
    description: 'Pacote de 1 kg. Produto de demonstração pronto para publicação.',
    categorySlug: 'frios-e-laticinios', sku: 'DEMO-QUE-001', priceCents: 3990,
    weightGrams: 1000, widthMm: 250, heightMm: 60, lengthMm: 200, physicalQuantity: 25, status: 'DRAFT',
  },
] as const;

const uploadsRoot = join(resolveApiStorageRoot(), 'uploads');

function buildSvg(width: number, height: number, seed: string): string {
  const hash = createHash('sha1').update(seed).digest();
  const hue = Math.round((hash[0] / 255) * 360);
  const accent = `hsl(${(hue + 160) % 360}, 72%, 60%)`;
  const base = `hsl(${hue}, 58%, 30%)`;
  const deep = `hsl(${(hue + 30) % 360}, 62%, 18%)`;
  const shapes = Array.from({ length: 5 }, (_, index) => {
    const cx = ((hash[(index * 3) % 20] / 255) * width).toFixed(0);
    const cy = ((hash[(index * 3 + 1) % 20] / 255) * height).toFixed(0);
    const radius = (((hash[(index * 3 + 2) % 20] / 255) * 0.32 + 0.06) * Math.min(width, height)).toFixed(0);
    const opacity = (0.14 + (hash[(index * 3 + 3) % 20] / 255) * 0.22).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${accent}" opacity="${opacity}"/>`;
  }).join('');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${base}"/><stop offset="100%" stop-color="${deep}"/></linearGradient></defs>`,
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>`,
    shapes,
    `<rect x="${(width * 0.08).toFixed(0)}" y="${(height * 0.8).toFixed(0)}" width="${(width * 0.32).toFixed(0)}" height="${(height * 0.055).toFixed(0)}" rx="${(height * 0.0275).toFixed(0)}" fill="#E33C34" opacity="0.92"/>`,
    '</svg>',
  ].join('');
}

/** Gera as imagens WebP do seed e devolve o caminho relativo usado no banco. */
async function writeImageSet(key: string, widths: readonly number[], aspect: number, mainWidth: number): Promise<string> {
  const directory = join(uploadsRoot, `seed-${key}`);
  await mkdir(directory, { recursive: true });
  for (const width of widths) {
    const height = Math.round(width * aspect);
    await sharp(Buffer.from(buildSvg(width, height, key)))
      .webp({ quality: 82 })
      .toFile(join(directory, `${width}.webp`));
  }
  return `uploads/seed-${key}/${mainWidth}.webp`;
}

export async function seedDemoMedia(): Promise<void> {
  for (const product of demoProducts) {
    await writeImageSet(product.slug, [480, 960, 1440], 1, 960);
  }
  for (const banner of ['ofertas', 'cotacao', 'festa']) {
    await writeImageSet(`banner-${banner}`, [960, 1440], 0.42, 1440);
  }
  await writeBrandLogo();
}

/**
 * Converte o logo oficial (referência HTML aprovada, já versionada no repo)
 * para WebP na storage da API. Não há hotlink nem cópia externa.
 */
async function writeBrandLogo(): Promise<void> {
  const source = join(process.cwd(), 'site-comercial-do-norte-html-referencia', 'assets', 'Logos', 'logo-comercial-do-norte.png');
  if (!existsSync(source)) return;
  const directory = join(uploadsRoot, 'seed-brand');
  await mkdir(directory, { recursive: true });
  await sharp(source).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 90 }).toFile(join(directory, 'logo.webp'));
}

export const DEMO_LOGO_PATH = 'uploads/seed-brand/logo.webp';

export async function seedCatalog(prisma: PrismaClient): Promise<{ categories: number; products: number }> {
  await seedDemoMedia();

  const categoryIdBySlug = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, status: 'ACTIVE' },
      create: { name: category.name, slug: category.slug, status: 'ACTIVE', legacySource: DEMO_SOURCE, legacyId: category.slug },
    });
    categoryIdBySlug.set(category.slug, row.id);
  }

  const brandIdBySlug = new Map<string, string>();
  for (const brand of brands) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, status: 'ACTIVE' },
      create: { name: brand.name, slug: brand.slug, status: 'ACTIVE', legacySource: DEMO_SOURCE, legacyId: brand.slug },
    });
    brandIdBySlug.set(brand.slug, row.id);
  }

  for (const product of demoProducts) {
    const imagePath = `uploads/seed-${product.slug}/960.webp`;
    const productRow = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        status: product.status,
        brandId: brandIdBySlug.get('marca-exemplo'),
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        status: product.status,
        brandId: brandIdBySlug.get('marca-exemplo'),
        legacySource: DEMO_SOURCE,
        legacyId: product.slug,
      },
    });

    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (categoryId) {
      await prisma.productCategory.deleteMany({ where: { productId: productRow.id } });
      await prisma.productCategory.create({ data: { productId: productRow.id, categoryId } });
    }

    const variant = await prisma.productVariant.upsert({
      where: { sku: product.sku },
      update: {
        productId: productRow.id,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents ?? null,
        weightGrams: product.weightGrams,
        widthMm: product.widthMm ?? null,
        heightMm: product.heightMm ?? null,
        lengthMm: product.lengthMm ?? null,
        status: 'ACTIVE',
        stockStatus: 'IN_STOCK',
      },
      create: {
        productId: productRow.id,
        sku: product.sku,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents,
        weightGrams: product.weightGrams,
        widthMm: product.widthMm,
        heightMm: product.heightMm,
        lengthMm: product.lengthMm,
        status: 'ACTIVE',
        stockStatus: 'IN_STOCK',
        inventoryBalance: { create: { physicalQuantity: product.physicalQuantity } },
      },
    });

    await prisma.inventoryBalance.upsert({
      where: { variantId: variant.id },
      update: { physicalQuantity: product.physicalQuantity },
      create: { variantId: variant.id, physicalQuantity: product.physicalQuantity },
    });

    await prisma.productImage.deleteMany({ where: { productId: productRow.id } });
    await prisma.productImage.create({
      data: {
        productId: productRow.id,
        variantId: variant.id,
        path: imagePath,
        altText: product.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });
  }

  return { categories: categories.length, products: demoProducts.length };
}
