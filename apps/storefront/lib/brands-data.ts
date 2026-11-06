import type { ApiBrand } from './types';

export interface BrandShowcaseItem {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  imagePath: string;
  accentColor: string;
  productCount: number;
  subbrands: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
}

export const DEFAULT_BRAND_SHOWCASE: BrandShowcaseItem[] = [
  {
    id: 'brand-copobras',
    name: 'Copobras',
    slug: 'copobras',
    subtitle: 'Embalagens & Descartáveis',
    imagePath: '/assets/PRODUTOS/marcas-imgs/copobras_logo.svg',
    accentColor: '#004CB1',
    productCount: 38,
    subbrands: [
      { id: 'sub-copobras-cristal', name: 'Linha Cristal PP', slug: 'copobras-cristal-pp', productCount: 12 },
      { id: 'sub-copobras-termica', name: 'Linha Térmica EPS', slug: 'copobras-termica-eps', productCount: 10 },
      { id: 'sub-copobras-food', name: 'Copobras Food Service', slug: 'copobras-food-service', productCount: 9 },
      { id: 'sub-copobras-festa', name: 'Pratos & Talheres Festa', slug: 'copobras-pratos-talheres', productCount: 7 },
    ],
  },
  {
    id: 'brand-cristalcopo',
    name: 'Cristalcopo',
    slug: 'cristalcopo',
    subtitle: 'Copos & Potes Ultra Cristal',
    imagePath: '/assets/PRODUTOS/marcas-imgs/cristalcopo_logo.svg',
    accentColor: '#E2091E',
    productCount: 32,
    subbrands: [
      { id: 'sub-cristalcopo-bolha', name: 'Linha Copo Bolha', slug: 'cristalcopo-bolha', productCount: 11 },
      { id: 'sub-cristalcopo-eco', name: 'Linha Eco Biodegradável', slug: 'cristalcopo-eco', productCount: 8 },
      { id: 'sub-cristalcopo-ultra', name: 'Linha Ultra Resistente', slug: 'cristalcopo-ultra', productCount: 13 },
    ],
  },
  {
    id: 'brand-wyda',
    name: 'Wyda',
    slug: 'wyda',
    subtitle: 'Alumínio & Filmes PVC',
    imagePath: '/assets/PRODUTOS/marcas-imgs/wyda_logo.svg',
    accentColor: '#00357B',
    productCount: 26,
    subbrands: [
      { id: 'sub-wyda-aluminio', name: 'Bandejas & Marmitas Alumínio', slug: 'wyda-aluminio', productCount: 11 },
      { id: 'sub-wyda-filmes', name: 'Filmes PVC & Esticáveis', slug: 'wyda-filmes-pvc', productCount: 8 },
      { id: 'sub-wyda-papel', name: 'Papel Assa Fácil & Manteiga', slug: 'wyda-assa-facil', productCount: 7 },
    ],
  },
  {
    id: 'brand-norteplast',
    name: 'NortePlast',
    slug: 'norteplast',
    subtitle: 'Sacolas & Bobinas Reforçadas',
    imagePath: '/assets/PRODUTOS/marcas-imgs/norteplast_logo.svg',
    accentColor: '#15803D',
    productCount: 28,
    subbrands: [
      { id: 'sub-norteplast-sacolas', name: 'Sacolas Alça Camiseta', slug: 'norteplast-sacolas', productCount: 10 },
      { id: 'sub-norteplast-bobinas', name: 'Bobinas Picotadas Fundo Estrela', slug: 'norteplast-bobinas', productCount: 9 },
      { id: 'sub-norteplast-kraft', name: 'Linha Kraft Delivery', slug: 'norteplast-kraft', productCount: 9 },
    ],
  },
  {
    id: 'brand-mili',
    name: 'Mili Profissional',
    slug: 'mili',
    subtitle: 'Papéis & Higiene Institucional',
    imagePath: '/assets/PRODUTOS/marcas-imgs/mili_logo.png',
    accentColor: '#0284C7',
    productCount: 18,
    subbrands: [
      { id: 'sub-mili-interfolha', name: 'Toalhas Interfolhadas', slug: 'mili-interfolhadas', productCount: 7 },
      { id: 'sub-mili-guardanapos', name: 'Guardanapos Folha Dupla', slug: 'mili-guardanapos', productCount: 6 },
      { id: 'sub-mili-higienico', name: 'Rolão Institucional', slug: 'mili-rolao', productCount: 5 },
    ],
  },
  {
    id: 'brand-nestle',
    name: 'Nestlé Professional',
    slug: 'nestle',
    subtitle: 'Confeitaria & Food Service',
    imagePath: '/assets/PRODUTOS/marcas-imgs/nestle_logo.png',
    accentColor: '#7C2D12',
    productCount: 24,
    subbrands: [
      { id: 'sub-nestle-moca', name: 'Linha Moça Profissional', slug: 'nestle-moca', productCount: 9 },
      { id: 'sub-nestle-chocolates', name: 'Coberturas & Chocolates Nobres', slug: 'nestle-chocolates', productCount: 9 },
      { id: 'sub-nestle-cremes', name: 'Cremes & Bases Culinárias', slug: 'nestle-cremes', productCount: 6 },
    ],
  },
  {
    id: 'brand-supermax',
    name: 'Supermax',
    slug: 'supermax',
    subtitle: 'Luvas & Proteção Profissional',
    imagePath: '/assets/PRODUTOS/marcas-imgs/supermax_logo.svg',
    accentColor: '#0D9488',
    productCount: 16,
    subbrands: [
      { id: 'sub-supermax-nitrilica', name: 'Luvas Nitrílicas Sem Pó', slug: 'supermax-nitrilica', productCount: 9 },
      { id: 'sub-supermax-vinil', name: 'Luvas de Vinil & Gastronomia', slug: 'supermax-vinil', productCount: 7 },
    ],
  },
  {
    id: 'brand-grandha',
    name: 'Grandha',
    slug: 'grandha',
    subtitle: 'Linha Profissional & Cuidados',
    imagePath: '/assets/PRODUTOS/marcas-imgs/grandha_logo.svg',
    accentColor: '#14532D',
    productCount: 22,
    subbrands: [
      { id: 'sub-grandha-alkymia', name: 'Alkymia di Grandha', slug: 'alkymia', productCount: 8 },
      { id: 'sub-grandha-bbtox', name: 'BBTox Absolute Repair', slug: 'bbtox-absolute-repair', productCount: 6 },
      { id: 'sub-grandha-fito', name: 'Fito Capillus', slug: 'fito-capillus', productCount: 4 },
      { id: 'sub-grandha-urbano', name: 'Urbano Spa', slug: 'urbano-spa', productCount: 4 },
    ],
  },
  {
    id: 'brand-maxiline',
    name: 'Maxiline',
    slug: 'maxiline',
    subtitle: 'Cosmética Profissional',
    imagePath: '/assets/PRODUTOS/marcas-imgs/maxiline_logo.svg',
    accentColor: '#1E293B',
    productCount: 14,
    subbrands: [
      { id: 'sub-maxiline-hidratacao', name: 'Linha Hidratação Intensa', slug: 'maxiline-hidratacao', productCount: 7 },
      { id: 'sub-maxiline-finalizadores', name: 'Linha Finalizadores', slug: 'maxiline-finalizadores', productCount: 7 },
    ],
  },
  {
    id: 'brand-knut',
    name: 'Knut Hair Care',
    slug: 'knut',
    subtitle: 'Cuidado & Nutrição',
    imagePath: '/assets/PRODUTOS/marcas-imgs/knut_logo.svg',
    accentColor: '#0F172A',
    productCount: 12,
    subbrands: [
      { id: 'sub-knut-amino', name: 'Knut Amino Complex', slug: 'knut-amino', productCount: 6 },
      { id: 'sub-knut-cachos', name: 'Knut Cachos & Ondas', slug: 'knut-cachos', productCount: 6 },
    ],
  },
];

export function buildEnrichedBrands(apiBrands: ApiBrand[] = []): ApiBrand[] {
  const result: ApiBrand[] = [];
  const seenSlugs = new Set<string>();

  // 1. Mantém marcas vindas da API, enriquecendo com logos/submarcas do showcase quando aplicável
  for (const b of apiBrands) {
    if (b.slug === 'marca-exemplo' && apiBrands.length > 1) continue;
    const showcaseMatch = DEFAULT_BRAND_SHOWCASE.find((s) => s.slug === b.slug);
    const children: ApiBrand[] =
      b.children && b.children.length > 0
        ? b.children
        : showcaseMatch
          ? showcaseMatch.subbrands.map((sub) => ({
              id: sub.id,
              publicId: sub.id,
              name: sub.name,
              slug: sub.slug,
              imagePath: null,
              parentId: b.id,
              _count: { products: sub.productCount },
            }))
          : [];

    const totalProducts =
      b._count?.products && b._count.products > 0
        ? b._count.products
        : showcaseMatch?.productCount ?? children.reduce((acc, c) => acc + (c._count?.products ?? 0), 0);

    result.push({
      ...b,
      imagePath: b.imagePath || showcaseMatch?.imagePath || null,
      children,
      _count: {
        products: totalProducts,
        children: children.length,
      },
    });
    seenSlugs.add(b.slug);
    for (const c of children) {
      seenSlugs.add(c.slug);
    }
  }

  // 2. Garante que todas as marcas e submarcas do showcase estejam presentes para navegação e filtro rico
  for (const item of DEFAULT_BRAND_SHOWCASE) {
    if (seenSlugs.has(item.slug)) continue;
    const children: ApiBrand[] = item.subbrands.map((sub) => ({
      id: sub.id,
      publicId: sub.id,
      name: sub.name,
      slug: sub.slug,
      imagePath: null,
      parentId: item.id,
      _count: { products: sub.productCount },
    }));

    result.push({
      id: item.id,
      publicId: item.id,
      name: item.name,
      slug: item.slug,
      imagePath: item.imagePath,
      parentId: null,
      children,
      _count: {
        products: item.productCount,
        children: children.length,
      },
    });
    seenSlugs.add(item.slug);
    for (const c of children) {
      seenSlugs.add(c.slug);
    }
  }

  return result;
}

export function findBrandOrSubbrand(
  apiBrands: ApiBrand[],
  slug: string,
): { brand: ApiBrand; parentBrand?: ApiBrand } | null {
  const enriched = buildEnrichedBrands(apiBrands);
  for (const root of enriched) {
    if (root.slug === slug) {
      return { brand: root };
    }
    if (root.children) {
      const child = root.children.find((c) => c.slug === slug);
      if (child) {
        return { brand: child, parentBrand: root };
      }
    }
  }
  return null;
}
