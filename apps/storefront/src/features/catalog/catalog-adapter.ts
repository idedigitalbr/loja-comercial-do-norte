import { StoreProduct } from './product-card';

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return typeof value === 'object' && value !== null ? value as RecordValue : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
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
  const brand = asRecord(record.brand);
  const directAvailable = typeof record.available === 'boolean' ? record.available : null;

  return {
    publicId: asString(record.publicId) ?? slug,
    slug,
    name,
    brandName: asString(record.brandName) ?? asString(brand?.name),
    price: { amount: directAmount ?? variantAmount, currency: 'BRL' },
    available: directAvailable ?? Boolean(variant && variant.status !== 'ARCHIVED'),
    imageUrl: image?.path ?? asString(record.imageUrl),
    variantId: asString(record.variantId) ?? asString(variant?.id) ?? undefined,
  };
}
