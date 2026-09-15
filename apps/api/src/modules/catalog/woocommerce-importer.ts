import { Prisma, PrismaClient, RecordStatus } from '@prisma/client';

export type WooBrand = {
  id: number;
  name: string;
  slug: string;
  parent?: number;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  short_description?: string;
  prices?: { price?: string; regular_price?: string; sale_price?: string };
  stock_quantity?: number | null;
  is_in_stock?: boolean;
  images?: Array<{ src?: string; alt?: string }>;
  categories?: WooCategory[];
  brands?: WooBrand[];
};

export type MappedWooProduct = {
  legacyId: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  priceCents: number;
  stockQuantity: number | null;
  status: 'ACTIVE';
  brand: { legacyId: string; name: string; slug: string } | null;
  categories: Array<{ legacyId: string; name: string; slug: string }>;
  images: Array<{ path: string; altText: string; sortOrder: number; isPrimary: boolean }>;
};

const SOURCE = 'woocommerce';
const preferredBrandSlugs = new Set([
  'bioma-care',
  'grandha',
  'haskell',
  'knut',
  'maxiline',
  'oh-my',
  'senscience',
]);

export function parseWooPriceCents(value: string | undefined): number {
  const normalized = value?.trim().replace(',', '.') ?? '';
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) return 0;
  return normalized.includes('.') ? Math.round(Number(normalized) * 100) : Number.parseInt(normalized, 10);
}

function cleanSlug(value: string, fallback: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function selectBrand(brands: WooBrand[] = [], parentByLegacyId = new Map<string, string>()): WooBrand | null {
  const leafBrands = brands.filter((brand) => !brands.some((candidate) => parentByLegacyId.get(String(candidate.id)) === String(brand.id)));
  const candidates = leafBrands.length ? leafBrands : brands;
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    if (preferredBrandSlugs.has(candidates[index].slug)) return candidates[index];
  }
  return candidates[candidates.length - 1] ?? null;
}

export function mapWooProduct(product: WooProduct, parentByLegacyId = new Map<string, string>()): MappedWooProduct {
  const brand = selectBrand(product.brands, parentByLegacyId);
  const categories = (product.categories ?? [])
    .filter((category) => category.name.trim().toLowerCase() !== 'uncategorized')
    .map((category) => ({
      legacyId: String(category.id),
      name: category.name.trim(),
      slug: cleanSlug(category.slug, `category-${category.id}`),
    }));
  const images = (product.images ?? [])
    .filter((image) => Boolean(image.src))
    .map((image, sortOrder) => ({
      path: image.src!.slice(0, 500),
      altText: (image.alt?.trim() || product.name).slice(0, 255),
      sortOrder,
      isPrimary: sortOrder === 0,
    }));

  return {
    legacyId: String(product.id),
    name: product.name.trim().slice(0, 220),
    slug: cleanSlug(product.slug, `product-${product.id}`).slice(0, 191),
    description: (product.description?.trim() || product.short_description?.trim() || null),
    sku: product.sku?.trim().slice(0, 100) || `woo-${product.id}`,
    priceCents: parseWooPriceCents(product.prices?.price || product.prices?.sale_price || product.prices?.regular_price),
    stockQuantity: Number.isInteger(product.stock_quantity) && product.stock_quantity! >= 0 ? product.stock_quantity! : null,
    status: 'ACTIVE',
    brand: brand
      ? {
          legacyId: String(brand.id),
          name: brand.name.trim().slice(0, 160),
          slug: cleanSlug(brand.slug, `brand-${brand.id}`).slice(0, 191),
        }
      : null,
    categories,
    images,
  };
}

export type ImportSummary = {
  fetched: number;
  imported: number;
  brands: number;
  subbrands: number;
  categories: number;
  images: number;
  dryRun: boolean;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

async function fetchWooBrands(fetchImpl: FetchLike, baseUrl: string, perPage: number): Promise<WooBrand[]> {
  const brands: WooBrand[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL('/wp-json/wp/v2/product_brand', baseUrl);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));
    const response = await fetchImpl(url.toString());
    if (!response.ok) throw new Error(`WooCommerce REST API respondeu ${response.status} em ${url.pathname}`);
    brands.push(...((await response.json()) as WooBrand[]));
    totalPages = Number(response.headers.get('X-WP-TotalPages') ?? totalPages);
    page += 1;
  }

  return brands;
}

async function fetchWooProducts(fetchImpl: FetchLike, baseUrl: string, perPage: number): Promise<WooProduct[]> {
  const products: WooProduct[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL('/wp-json/wc/store/v1/products', baseUrl);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));
    const response = await fetchImpl(url.toString());
    if (!response.ok) throw new Error(`WooCommerce Store API respondeu ${response.status} em ${url.pathname}`);
    const pageProducts = (await response.json()) as WooProduct[];
    products.push(...pageProducts);
    totalPages = Number(response.headers.get('X-WP-TotalPages') ?? totalPages);
    page += 1;
  }

  return products;
}

export async function importWooCommerceCatalog(options: {
  prisma: PrismaClient;
  baseUrl: string;
  fetchImpl?: FetchLike;
  perPage?: number;
  dryRun?: boolean;
}): Promise<ImportSummary> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const products = await fetchWooProducts(fetchImpl, options.baseUrl, options.perPage ?? 100);
  const sourceBrands = await fetchWooBrands(fetchImpl, options.baseUrl, options.perPage ?? 100);
  const parentByLegacyId = new Map(
    sourceBrands
      .filter((brand) => brand.parent && brand.parent > 0)
      .map((brand) => [String(brand.id), String(brand.parent)] as const),
  );
  const mappedProducts = products.map((product) => mapWooProduct(product, parentByLegacyId));
  const brandIds = new Set([
    ...sourceBrands.map((brand) => String(brand.id)),
    ...mappedProducts.flatMap((product) => (product.brand ? [product.brand.legacyId] : [])),
  ]);
  const summary: ImportSummary = {
    fetched: mappedProducts.length,
    imported: 0,
    brands: brandIds.size,
    subbrands: sourceBrands.filter((brand) => Boolean(brand.parent && brand.parent > 0)).length,
    categories: new Set(mappedProducts.flatMap((product) => product.categories.map((category) => category.legacyId))).size,
    images: mappedProducts.reduce((total, product) => total + product.images.length, 0),
    dryRun: options.dryRun ?? false,
  };
  if (options.dryRun) return summary;

  await options.prisma.$transaction(async (tx) => {
    const sourceBrandById = new Map(sourceBrands.map((brand) => [String(brand.id), brand]));
    const localBrandIds = new Map<string, string>();

    const upsertBrand = async (legacyId: string, trail = new Set<string>()): Promise<string | null> => {
      const cachedId = localBrandIds.get(legacyId);
      if (cachedId) return cachedId;
      const sourceBrand = sourceBrandById.get(legacyId);
      if (!sourceBrand) return null;
      const nextTrail = new Set(trail).add(legacyId);
      const parentLegacyId = sourceBrand.parent && sourceBrand.parent > 0 ? String(sourceBrand.parent) : null;
      const parentId = parentLegacyId && !trail.has(parentLegacyId)
        ? await upsertBrand(parentLegacyId, nextTrail)
        : null;
      const localBrand = await tx.brand.upsert({
        where: { legacySource_legacyId: { legacySource: SOURCE, legacyId } },
        create: {
          legacySource: SOURCE,
          legacyId,
          name: sourceBrand.name.trim(),
          slug: cleanSlug(sourceBrand.slug, `brand-${legacyId}`).slice(0, 191),
          status: RecordStatus.ACTIVE,
          parentId,
        },
        update: {
          name: sourceBrand.name.trim(),
          slug: cleanSlug(sourceBrand.slug, `brand-${legacyId}`).slice(0, 191),
          status: RecordStatus.ACTIVE,
          parentId,
        },
      });
      localBrandIds.set(legacyId, localBrand.id);
      return localBrand.id;
    };

    for (const sourceBrand of sourceBrands) await upsertBrand(String(sourceBrand.id));
  });

  for (const product of mappedProducts) {
    await options.prisma.$transaction(async (tx) => {
      const brand = product.brand
        ? await tx.brand.upsert({
            where: { legacySource_legacyId: { legacySource: SOURCE, legacyId: product.brand.legacyId } },
            create: {
              legacySource: SOURCE,
              legacyId: product.brand.legacyId,
              name: product.brand.name,
              slug: product.brand.slug,
              status: RecordStatus.ACTIVE,
            },
            update: { name: product.brand.name, slug: product.brand.slug, status: RecordStatus.ACTIVE },
          })
        : null;

      const categoryIds: string[] = [];
      for (const category of product.categories) {
        const localCategory = await tx.category.upsert({
          where: { legacySource_legacyId: { legacySource: SOURCE, legacyId: category.legacyId } },
          create: {
            legacySource: SOURCE,
            legacyId: category.legacyId,
            name: category.name,
            slug: category.slug,
            status: RecordStatus.ACTIVE,
          },
          update: { name: category.name, slug: category.slug, status: RecordStatus.ACTIVE },
        });
        categoryIds.push(localCategory.id);
      }

      const localProduct = await tx.product.upsert({
        where: { legacySource_legacyId: { legacySource: SOURCE, legacyId: product.legacyId } },
        create: {
          legacySource: SOURCE,
          legacyId: product.legacyId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          status: RecordStatus.ACTIVE,
          brandId: brand?.id,
        },
        update: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          status: RecordStatus.ACTIVE,
          brandId: brand?.id,
        },
      });

      await tx.productCategory.deleteMany({ where: { productId: localProduct.id } });
      if (categoryIds.length) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId: localProduct.id, categoryId })),
          skipDuplicates: true,
        });
      }

      const variant = await tx.productVariant.upsert({
        where: { sku: product.sku },
        create: {
          productId: localProduct.id,
          sku: product.sku,
          priceCents: product.priceCents,
          status: RecordStatus.ACTIVE,
        },
        update: {
          productId: localProduct.id,
          priceCents: product.priceCents,
          status: RecordStatus.ACTIVE,
        },
      });

      await tx.inventoryBalance.upsert({
        where: { variantId: variant.id },
        create: { variantId: variant.id, physicalQuantity: product.stockQuantity ?? 0 },
        update: product.stockQuantity === null ? {} : { physicalQuantity: product.stockQuantity },
      });

      await tx.productImage.deleteMany({ where: { productId: localProduct.id } });
      if (product.images.length) {
        await tx.productImage.createMany({
          data: product.images.map((image) => ({ ...image, productId: localProduct.id, variantId: variant.id })),
        });
      }
    });
    summary.imported += 1;
  }

  return summary;
}

export type CatalogImportClient = PrismaClient;
export type CatalogImportTransaction = Prisma.TransactionClient;
