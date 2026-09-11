export type WooProductRow = { id: string | number; name: string; slug?: string; brand?: string; category?: string; sku: string; price: string | number };

function clean(value: string | undefined) {
  return value?.trim().replace(/\s+/g, ' ') ?? '';
}

export function mapBrand(value: string | undefined) {
  const normalized = clean(value);
  if (normalized.toLowerCase() === 'haskell') return 'Haskell';
  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function mapCategory(value: string | undefined) {
  const normalized = clean(value);
  if (!normalized || normalized.toLowerCase() === 'uncategorized') throw new Error('CATEGORY_MAPPING_REQUIRED');
  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function mapProductRow(row: WooProductRow) {
  const name = clean(row.name);
  const slug = clean(row.slug) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const price = typeof row.price === 'number' ? row.price : Number(row.price.replace(',', '.'));
  if (!name || !slug || !row.sku || !Number.isFinite(price)) throw new Error('PRODUCT_MAPPING_INVALID');
  return { legacySource: 'woocommerce', legacyId: String(row.id), name, slug, brandName: mapBrand(row.brand), categoryName: mapCategory(row.category), sku: row.sku.trim(), priceCents: Math.round(price * 100) };
}
