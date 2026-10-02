import { StoreProduct } from './product-card';

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return typeof value === 'object' && value !== null ? value as RecordValue : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function decodeHtmlEntities(value: string): string {
  if (typeof document === 'undefined') return value.replace(/&amp;/gi, '&');
  const decoder = document.createElement('textarea');
  decoder.innerHTML = value;
  return decoder.value;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asImage(value: unknown): { path: string; altText?: string | null; isPrimary?: boolean } | null {
  const image = asRecord(value);
  const path = asString(image?.path);
  return path ? { path, altText: asString(image?.altText), isPrimary: image?.isPrimary === true } : null;
}

export function normalizeStoreProduct(payload: unknown): StoreProduct | null {
  const record = asRecord(payload);
  const slug = asString(record?.slug);
  const name = asString(record?.name);
  if (!record || !slug || !name) return null;

  const variantRecords = Array.isArray(record.variants) ? record.variants.map(asRecord).filter((value): value is RecordValue => value !== null) : [];
  const variant = variantRecords[0];
  const directPrice = asRecord(record.price);
  const productImages = Array.isArray(record.images) ? record.images.map(asImage).filter((value): value is NonNullable<typeof value> => value !== null) : [];
  const variantImages = Array.isArray(variant?.images) ? variant.images.map(asImage).filter((value): value is NonNullable<typeof value> => value !== null) : [];
  const image = [...productImages, ...variantImages].find((item) => item.isPrimary) ?? productImages[0] ?? variantImages[0] ?? null;
  const directAmount = typeof directPrice?.amount === 'number' ? directPrice.amount : null;
  const variantAmount = typeof variant?.priceCents === 'number' ? variant.priceCents : 0;
  const compareAtPriceCents = asNumber(variant?.compareAtPriceCents);
  const brand = asRecord(record.brand);
  const directAvailable = typeof record.available === 'boolean' ? record.available : null;
  const stockStatus = variant?.stockStatus === 'IN_STOCK' || variant?.stockStatus === 'OUT_OF_STOCK' || variant?.stockStatus === 'ON_BACKORDER'
    ? variant.stockStatus
    : undefined;
  const inventoryBalance = asRecord(variant?.inventoryBalance);
  const physicalQuantity = asNumber(inventoryBalance?.physicalQuantity);
  const reservedQuantity = asNumber(inventoryBalance?.reservedQuantity) ?? 0;
  const stockQuantity = physicalQuantity === null ? null : Math.max(physicalQuantity - reservedQuantity, 0);
  const lowStockThreshold = asNumber(variant?.lowStockThreshold);
  const ratingRecord = asRecord(record.rating);
  const ratingValue = asNumber(ratingRecord?.value) ?? asNumber(record.averageRating);
  const ratingCount = asNumber(ratingRecord?.count) ?? asNumber(record.reviewCount);
  const rating = ratingValue !== null && ratingCount !== null && ratingValue >= 0 && ratingValue <= 5 && ratingCount >= 0
    ? { value: ratingValue, count: ratingCount }
    : undefined;
  const stockAvailable = stockStatus === 'OUT_OF_STOCK' ? false : null;
  const categoryValues = Array.isArray(record.categories)
    ? record.categories
    : record.categories ? [record.categories] : [];
  const categories = categoryValues
    .map(asRecord)
    .filter((value): value is RecordValue => value !== null)
    .map((value) => asRecord(value.category) ?? value)
    .map((value) => ({ name: asString(value.name), slug: asString(value.slug) }))
    .filter((value): value is { name: string; slug: string } => Boolean(value.name && value.slug))
    .map((value) => ({ name: decodeHtmlEntities(value.name), slug: value.slug }));

  return {
    publicId: asString(record.publicId) ?? slug,
    slug,
    name: decodeHtmlEntities(name),
    brandName: asString(record.brandName) ?? asString(brand?.name),
    brandSlug: asString(brand?.slug),
    sku: asString(variant?.sku) ?? asString(record.sku),
    descriptionHtml: asString(record.description),
    categories,
    price: { amount: directAmount ?? variantAmount, currency: 'BRL' },
    available: stockAvailable ?? directAvailable ?? Boolean(variant && variant.status !== 'ARCHIVED'),
    imageUrl: image?.path ?? asString(record.imageUrl),
    variantId: asString(record.variantId) ?? asString(variant?.id) ?? undefined,
    compareAtPriceCents,
    stockQuantity,
    lowStockThreshold,
    stockStatus,
    rating,
    isNew: record.isNew === true,
    isTrending: record.isTrending === true,
  };
}
