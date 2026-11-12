import type { ApiProduct } from './types';

export function hasRealDiscountOffer(product: ApiProduct): boolean {
  return product.variants.some(
    (variant) =>
      variant.priceCents != null &&
      variant.priceCents > 0 &&
      variant.compareAtPriceCents != null &&
      variant.compareAtPriceCents > variant.priceCents,
  );
}

export function getPrimaryVariantPriceCents(product: ApiProduct): number | null {
  const price = product.variants[0]?.priceCents;
  return typeof price === 'number' && price > 0 ? price : null;
}

export function filterAndSortProductsByPrice(
  products: ApiProduct[],
  options: {
    precoMin?: string;
    precoMax?: string;
    ordem?: string;
  },
): ApiProduct[] {
  let items = products;

  if (options.precoMin) {
    const parsedMin = Number(options.precoMin);
    if (Number.isFinite(parsedMin)) {
      const minCents = Math.round(parsedMin * 100);
      items = items.filter((product) => {
        const price = getPrimaryVariantPriceCents(product);
        return price !== null && price >= minCents;
      });
    }
  }

  if (options.precoMax) {
    const parsedMax = Number(options.precoMax);
    if (Number.isFinite(parsedMax)) {
      const maxCents = Math.round(parsedMax * 100);
      items = items.filter((product) => {
        const price = getPrimaryVariantPriceCents(product);
        return price !== null && price <= maxCents;
      });
    }
  }

  if (options.ordem === 'preco_asc') {
    items = [...items].sort((a, b) => {
      const pa = getPrimaryVariantPriceCents(a);
      const pb = getPrimaryVariantPriceCents(b);
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return pa - pb;
    });
  } else if (options.ordem === 'preco_desc') {
    items = [...items].sort((a, b) => {
      const pa = getPrimaryVariantPriceCents(a);
      const pb = getPrimaryVariantPriceCents(b);
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return pb - pa;
    });
  }

  return items;
}

const SECTION_ROTATION_OFFSETS: Record<string, number> = {
  's06-mais-vendidos': 8,
  's10-para-voce-1': 28,
  's14-para-voce-2': 48,
};

/** Intercala produtos de múltiplas categorias sem duplicação para diversificar a vitrine inicial. */
export function interleaveDistinctProducts(buckets: ApiProduct[][], maxItems = 80): ApiProduct[] {
  const result: ApiProduct[] = [];
  const seen = new Set<string>();
  const maxLen = buckets.reduce((max, bucket) => Math.max(max, bucket.length), 0);

  for (let i = 0; i < maxLen && result.length < maxItems; i += 1) {
    for (const bucket of buckets) {
      const product = bucket[i];
      if (!product) continue;
      const key = product.slug || product.id || product.publicId;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(product);
      if (result.length >= maxItems) break;
    }
  }

  return result;
}

/** Rotaciona deterministicamente a ordem do catálogo por seção da Home para evitar carrosséis idênticos. */
export function rotateProductsForSection(products: ApiProduct[], widgetId?: string): ApiProduct[] {
  if (!widgetId || products.length < 16) return products;
  const rawOffset = SECTION_ROTATION_OFFSETS[widgetId];
  if (!rawOffset) return products;
  const shift = rawOffset % products.length;
  if (shift === 0) return products;
  return [...products.slice(shift), ...products.slice(0, shift)];
}
