import { PrismaClient, RecordStatus } from '@prisma/client';
import { cleanOptionalText, normalizeCompareKey, slugifyText } from './db-safety';

export interface CatalogBrandInput {
  nome: string;
  slug: string;
  legacy_id?: string;
}

export interface CatalogCategoryInput {
  nome: string;
  slug: string;
  legacy_id?: string;
  parent_slug?: string | null;
  parent_nome?: string | null;
  nivel?: number;
  sort_order?: number;
}

/**
 * Conecta categorias L1/L2 do catálogo também às categorias principais da vitrine atual,
 * preservando os atalhos de menu e grade da página inicial sem criar duplicatas.
 */
const STOREFRONT_CATEGORY_BRIDGES: Record<string, string[]> = {
  'confeitaria-chocolates-e-festas': ['artigos-para-festa'],
  'chocolates-e-coberturas': ['doces-e-bomboniere'],
  'velas-e-artigos-de-festa': ['velas-e-suprimentos'],
  'copos-talheres-e-descartaveis-de-mesa': ['descartaveis'],
  'epis-e-protecao-descartavel': ['descartaveis'],
  'embalagens-alimenticias': ['embalagens'],
  'filmes-papeis-e-rolos': ['embalagens'],
  'utilidades-termicas-e-amarracao': ['embalagens'],
  'limpeza-e-higiene': ['produtos-de-limpeza'],
  'sacolas-sacos-e-bobinas-plasticas': ['sacos-e-sacolas'],
  'insumos-e-condimentos-food-service': ['mercearia'],
};

const STOREFRONT_SEGMENT_BRIDGES: Record<string, string[]> = {
  'food service': ['restaurante-buffet', 'delivery', 'lanchonete'],
  'embalagens varejo': ['delivery', 'bar-distribuidora'],
  'confeitaria panificacao': ['padaria', 'confeitaria-bolos'],
  'festas eventos': ['loja-de-festas'],
  'eventos lazer': ['loja-de-festas'],
  'higiene limpeza': ['restaurante-buffet'],
  'sorveterias acais': ['sorveteria-acai'],
};

const STOREFRONT_TAG_BRIDGES: Record<string, string[]> = {
  'termico eps': ['termico'],
  termico: ['termico'],
  'sustentavel kraft bambu': ['kraft', 'biodegradavel'],
  kraft: ['kraft'],
  biodegradavel: ['biodegradavel'],
  descartavel: ['descartavel'],
  transparente: ['transparente'],
  cristal: ['transparente'],
  reforcado: ['reforcado'],
  'vai ao micro ondas': ['vai-ao-micro-ondas'],
  'micro ondas': ['vai-ao-micro-ondas'],
};

export interface TaxonomyContext {
  brandsBySlug: Map<string, string>;
  brandsByKey: Map<string, string>;
  brandNamesNormalized: Set<string>;
  categoriesBySlug: Map<string, string>;
  categoriesByKey: Map<string, string>;
  segmentsBySlug: Map<string, string>;
  segmentsByKey: Map<string, string>;
  tagsBySlug: Map<string, string>;
  tagsByKey: Map<string, string>;
}

export async function buildAndSyncTaxonomy(options: {
  prisma: PrismaClient;
  legacySource: string;
  brands: CatalogBrandInput[];
  categories: CatalogCategoryInput[];
  dryRun?: boolean;
}): Promise<{
  ctx: TaxonomyContext;
  createdBrands: number;
  createdCategories: number;
  reusedBrands: number;
  reusedCategories: number;
}> {
  const { prisma, legacySource, brands, categories, dryRun = false } = options;

  const existingBrands = await prisma.brand.findMany({
    select: { id: true, name: true, slug: true, parentId: true, status: true },
  });
  const existingCategories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true, status: true },
  });
  const existingSegments = await prisma.segment.findMany({
    select: { id: true, name: true, slug: true },
  });
  const existingTags = await prisma.tag.findMany({
    select: { id: true, name: true, slug: true },
  });

  const ctx: TaxonomyContext = {
    brandsBySlug: new Map(),
    brandsByKey: new Map(),
    brandNamesNormalized: new Set(),
    categoriesBySlug: new Map(),
    categoriesByKey: new Map(),
    segmentsBySlug: new Map(),
    segmentsByKey: new Map(),
    tagsBySlug: new Map(),
    tagsByKey: new Map(),
  };

  // Prefere marcas raiz (parentId == null) ao indexar por nome/chave
  const sortedBrands = [...existingBrands].sort((a, b) => Number(Boolean(a.parentId)) - Number(Boolean(b.parentId)));
  for (const b of sortedBrands) {
    const slugKey = b.slug.toLowerCase();
    const normKey = normalizeCompareKey(b.name);
    if (!ctx.brandsBySlug.has(slugKey)) ctx.brandsBySlug.set(slugKey, b.id);
    if (!ctx.brandsByKey.has(normKey)) ctx.brandsByKey.set(normKey, b.id);
    ctx.brandNamesNormalized.add(normKey);
  }

  for (const c of existingCategories) {
    ctx.categoriesBySlug.set(c.slug.toLowerCase(), c.id);
    ctx.categoriesByKey.set(normalizeCompareKey(c.name), c.id);
  }

  for (const s of existingSegments) {
    ctx.segmentsBySlug.set(s.slug.toLowerCase(), s.id);
    ctx.segmentsByKey.set(normalizeCompareKey(s.name), s.id);
  }

  for (const t of existingTags) {
    ctx.tagsBySlug.set(t.slug.toLowerCase(), t.id);
    ctx.tagsByKey.set(normalizeCompareKey(t.name), t.id);
  }

  let createdBrands = 0;
  let reusedBrands = 0;
  let createdCategories = 0;
  let reusedCategories = 0;

  for (const rawBrand of brands) {
    const name = cleanOptionalText(rawBrand.nome, 160);
    const slug = cleanOptionalText(rawBrand.slug, 191)?.toLowerCase() || (name ? slugifyText(name) : null);
    if (!name || !slug) continue;
    const normKey = normalizeCompareKey(name);
    if (normKey === 'sem marca' || normKey === 'nao identificada') continue;

    ctx.brandNamesNormalized.add(normKey);

    const existingId = ctx.brandsBySlug.get(slug) ?? ctx.brandsByKey.get(normKey);
    if (existingId) {
      reusedBrands += 1;
      ctx.brandsBySlug.set(slug, existingId);
      ctx.brandsByKey.set(normKey, existingId);
      continue;
    }

    createdBrands += 1;
    if (!dryRun) {
      const created = await prisma.brand.create({
        data: {
          legacySource,
          legacyId: cleanOptionalText(rawBrand.legacy_id, 191) ?? `CN-BRAND-${slug.toUpperCase()}`,
          name,
          slug,
          status: RecordStatus.ACTIVE,
        },
        select: { id: true },
      });
      ctx.brandsBySlug.set(slug, created.id);
      ctx.brandsByKey.set(normKey, created.id);
    } else {
      const dryId = `dry-brand-${slug}`;
      ctx.brandsBySlug.set(slug, dryId);
      ctx.brandsByKey.set(normKey, dryId);
    }
  }

  // Ordena L1 antes de L2 para resolver parentId corretamente
  const orderedCategories = [...categories].sort((a, b) => (a.nivel ?? 1) - (b.nivel ?? 1));
  for (const rawCat of orderedCategories) {
    const name = cleanOptionalText(rawCat.nome, 160);
    const slug = cleanOptionalText(rawCat.slug, 191)?.toLowerCase() || (name ? slugifyText(name) : null);
    if (!name || !slug) continue;

    const normKey = normalizeCompareKey(name);
    const existingId = ctx.categoriesBySlug.get(slug) ?? ctx.categoriesByKey.get(normKey);
    if (existingId) {
      reusedCategories += 1;
      ctx.categoriesBySlug.set(slug, existingId);
      ctx.categoriesByKey.set(normKey, existingId);
      continue;
    }

    const parentId = rawCat.parent_slug ? (ctx.categoriesBySlug.get(rawCat.parent_slug.toLowerCase()) ?? null) : null;
    createdCategories += 1;
    if (!dryRun) {
      const created = await prisma.category.create({
        data: {
          legacySource,
          legacyId: cleanOptionalText(rawCat.legacy_id, 191) ?? `CN-CAT-${slug.toUpperCase()}`,
          name,
          slug,
          parentId,
          sortOrder: rawCat.sort_order ?? 100,
          status: RecordStatus.ACTIVE,
        },
        select: { id: true },
      });
      ctx.categoriesBySlug.set(slug, created.id);
      ctx.categoriesByKey.set(normKey, created.id);
    } else {
      const dryId = `dry-cat-${slug}`;
      ctx.categoriesBySlug.set(slug, dryId);
      ctx.categoriesByKey.set(normKey, dryId);
    }
  }

  return { ctx, createdBrands, createdCategories, reusedBrands, reusedCategories };
}

export function resolveBrandId(ctx: TaxonomyContext, slug?: string | null, name?: string | null): string | null {
  if (slug) {
    const bySlug = ctx.brandsBySlug.get(slug.trim().toLowerCase());
    if (bySlug) return bySlug;
  }
  if (name) {
    const byKey = ctx.brandsByKey.get(normalizeCompareKey(name));
    if (byKey) return byKey;
  }
  return null;
}

export function resolveProductCategoryIds(options: {
  ctx: TaxonomyContext;
  categorySlug?: string | null;
  categoryName?: string | null;
  subcategorySlug?: string | null;
  subcategoryName?: string | null;
}): string[] {
  const { ctx, categorySlug, categoryName, subcategorySlug, subcategoryName } = options;
  const ids: string[] = [];
  const pushUnique = (id?: string | null) => {
    if (id && !ids.includes(id)) ids.push(id);
  };

  if (subcategorySlug) pushUnique(ctx.categoriesBySlug.get(subcategorySlug.toLowerCase()));
  if (subcategoryName && ids.length === 0) pushUnique(ctx.categoriesByKey.get(normalizeCompareKey(subcategoryName)));

  if (categorySlug) pushUnique(ctx.categoriesBySlug.get(categorySlug.toLowerCase()));
  if (categoryName) pushUnique(ctx.categoriesByKey.get(normalizeCompareKey(categoryName)));

  for (const s of [subcategorySlug, categorySlug]) {
    if (!s) continue;
    const bridged = STOREFRONT_CATEGORY_BRIDGES[s.toLowerCase()];
    if (bridged) {
      for (const bSlug of bridged) {
        pushUnique(ctx.categoriesBySlug.get(bSlug));
      }
    }
  }

  return ids;
}

export async function resolveProductSegmentIds(options: {
  prisma: PrismaClient;
  ctx: TaxonomyContext;
  suggestedSegments: string[];
  productTextHint?: string;
  dryRun?: boolean;
}): Promise<string[]> {
  const { prisma, ctx, suggestedSegments, productTextHint = '', dryRun = false } = options;
  const ids: string[] = [];
  const pushUnique = (id?: string | null) => {
    if (id && !ids.includes(id)) ids.push(id);
  };

  const hint = normalizeCompareKey(productTextHint);
  if (/\b(pizza|esfiha|disco)\b/.test(hint)) {
    pushUnique(ctx.segmentsBySlug.get('pizzaria'));
  }
  if (/\b(acai|sorvete|casquinha|milk)\b/.test(hint)) {
    pushUnique(ctx.segmentsBySlug.get('sorveteria-acai'));
  }

  for (const rawSeg of suggestedSegments) {
    const clean = cleanOptionalText(rawSeg, 160);
    if (!clean) continue;
    const key = normalizeCompareKey(clean);
    const direct = ctx.segmentsBySlug.get(slugifyText(clean)) ?? ctx.segmentsByKey.get(key);
    if (direct) {
      pushUnique(direct);
      continue;
    }
    const mappedSlugs = STOREFRONT_SEGMENT_BRIDGES[key];
    if (mappedSlugs) {
      for (const sSlug of mappedSlugs) {
        pushUnique(ctx.segmentsBySlug.get(sSlug));
      }
      continue;
    }

    const newSlug = slugifyText(clean);
    if (!dryRun && newSlug) {
      const upserted = await prisma.segment.upsert({
        where: { slug: newSlug },
        update: {},
        create: { name: clean, slug: newSlug, status: RecordStatus.ACTIVE, sortOrder: 50 },
        select: { id: true },
      });
      ctx.segmentsBySlug.set(newSlug, upserted.id);
      ctx.segmentsByKey.set(key, upserted.id);
      pushUnique(upserted.id);
    }
  }

  return ids;
}

export async function resolveProductTagIds(options: {
  prisma: PrismaClient;
  ctx: TaxonomyContext;
  suggestedTags: string[];
  dryRun?: boolean;
}): Promise<string[]> {
  const { prisma, ctx, suggestedTags, dryRun = false } = options;
  const ids: string[] = [];
  const pushUnique = (id?: string | null) => {
    if (id && !ids.includes(id)) ids.push(id);
  };

  for (const rawTag of suggestedTags) {
    const clean = cleanOptionalText(rawTag, 160);
    if (!clean) continue;
    const key = normalizeCompareKey(clean);
    // Evita duplicar nomes de marcas dentro das tags de filtro da loja
    if (ctx.brandNamesNormalized.has(key)) continue;

    const bridgedSlugs = STOREFRONT_TAG_BRIDGES[key];
    if (bridgedSlugs) {
      for (const tSlug of bridgedSlugs) {
        pushUnique(ctx.tagsBySlug.get(tSlug));
      }
      continue;
    }

    const tagSlug = slugifyText(clean);
    if (!tagSlug) continue;
    const existing = ctx.tagsBySlug.get(tagSlug) ?? ctx.tagsByKey.get(key);
    if (existing) {
      pushUnique(existing);
      continue;
    }

    if (!dryRun) {
      const created = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name: clean, slug: tagSlug, status: RecordStatus.ACTIVE },
        select: { id: true },
      });
      ctx.tagsBySlug.set(tagSlug, created.id);
      ctx.tagsByKey.set(key, created.id);
      pushUnique(created.id);
    }
  }

  return ids;
}
