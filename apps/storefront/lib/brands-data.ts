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
    id: 'brand-lanchero',
    name: 'Lanchero',
    slug: 'lanchero',
    subtitle: 'Embalagens para Lanches & Fast Food',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-lanchero.png',
    accentColor: '#D97706',
    productCount: 10,
    subbrands: [
      { id: 'sub-lanchero-hamburgueiras', name: 'Hamburgueiras & Sanduíches', slug: 'lanchero-hamburgueiras', productCount: 5 },
      { id: 'sub-lanchero-barcas', name: 'Barcas & Embalagens de Porção', slug: 'lanchero-barcas-porcoes', productCount: 5 },
    ],
  },
  {
    id: 'brand-fasapel',
    name: 'Fasapel',
    slug: 'fasapel',
    subtitle: 'Papéis & Toalhas Profissionais',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-fasapel.png',
    accentColor: '#0284C7',
    productCount: 10,
    subbrands: [
      { id: 'sub-fasapel-guardanapos', name: 'Guardanapos & Toalhas', slug: 'fasapel-guardanapos-toalhas', productCount: 5 },
      { id: 'sub-fasapel-institucional', name: 'Papel Higiênico Institucional', slug: 'fasapel-papel-institucional', productCount: 5 },
    ],
  },
  {
    id: 'brand-segplast',
    name: 'Segplast',
    slug: 'segplast',
    subtitle: 'Filmes Stretch & Fitas de Proteção',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-segplast.png',
    accentColor: '#0D9488',
    productCount: 10,
    subbrands: [
      { id: 'sub-segplast-stretch', name: 'Filmes Stretch & PVC', slug: 'segplast-filmes-stretch-pvc', productCount: 5 },
      { id: 'sub-segplast-fitas', name: 'Fitas Adesivas & Lacres', slug: 'segplast-fitas-adesivas', productCount: 5 },
    ],
  },
  {
    id: 'brand-ultra-descartaveis',
    name: 'Ultra Descartáveis',
    slug: 'ultra-descartaveis',
    subtitle: 'Copos Ultra Cristal & Descartáveis Premium',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-ultradescartaveis.png',
    accentColor: '#E2091E',
    productCount: 10,
    subbrands: [
      { id: 'sub-ultra-copos', name: 'Copos Ultra Cristal & Chopp', slug: 'ultra-descartaveis-copos-cristal', productCount: 5 },
      { id: 'sub-ultra-bolha', name: 'Potes Bolha & Sobremesa', slug: 'ultra-descartaveis-potes-bolha', productCount: 5 },
    ],
  },
  {
    id: 'brand-knauf',
    name: 'Knauf',
    slug: 'knauf',
    subtitle: 'Isopor & Caixas Térmicas EPS',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-knauf.png',
    accentColor: '#004CB1',
    productCount: 10,
    subbrands: [
      { id: 'sub-knauf-caixas', name: 'Caixas Térmicas EPS', slug: 'knauf-caixas-termicas', productCount: 5 },
      { id: 'sub-knauf-marmitas', name: 'Marmitas & Discos Térmicos', slug: 'knauf-marmitas-discos', productCount: 5 },
    ],
  },
  {
    id: 'brand-plasan',
    name: 'Plasan',
    slug: 'plasan',
    subtitle: 'Potes & Recipientes Plásticos',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-plasan.png',
    accentColor: '#2563EB',
    productCount: 10,
    subbrands: [
      { id: 'sub-plasan-hermeticos', name: 'Potes Herméticos com Tampa', slug: 'plasan-potes-hermeticos', productCount: 5 },
      { id: 'sub-plasan-molheiras', name: 'Recipientes & Molheiras', slug: 'plasan-recipientes-molheiras', productCount: 5 },
    ],
  },
  {
    id: 'brand-fonteplast',
    name: 'Fonteplast',
    slug: 'fonteplast',
    subtitle: 'Sacos & Embalagens Plásticas',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-fonteplast.png',
    accentColor: '#15803D',
    productCount: 10,
    subbrands: [
      { id: 'sub-fonteplast-sacolas', name: 'Sacolas Alça Camiseta', slug: 'fonteplast-sacolas-camiseta', productCount: 5 },
      { id: 'sub-fonteplast-bobinas', name: 'Bobinas Picotadas Fundo Estrela', slug: 'fonteplast-bobinas-picotadas', productCount: 5 },
    ],
  },
  {
    id: 'brand-prafesta',
    name: 'Prafesta',
    slug: 'prafesta',
    subtitle: 'Potes para Freezer & Micro-ondas',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-prafesta.png',
    accentColor: '#E11D48',
    productCount: 10,
    subbrands: [
      { id: 'sub-prafesta-freezer', name: 'Linha Freezer & Micro-ondas', slug: 'prafesta-freezer-microondas', productCount: 5 },
      { id: 'sub-prafesta-artigos', name: 'Artigos de Festa & Refeição', slug: 'prafesta-artigos-festa', productCount: 5 },
    ],
  },
  {
    id: 'brand-sicao',
    name: 'Sicao',
    slug: 'sicao',
    subtitle: 'Chocolates & Confeitaria Profissional',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-sicao.png',
    accentColor: '#7C2D12',
    productCount: 10,
    subbrands: [
      { id: 'sub-sicao-barras', name: 'Chocolates Nobres & Barras', slug: 'sicao-chocolates-barras', productCount: 5 },
      { id: 'sub-sicao-gotas', name: 'Gotas Forneáveis & Coberturas', slug: 'sicao-gotas-coberturas', productCount: 5 },
    ],
  },
  {
    id: 'brand-techplast',
    name: 'Techplast',
    slug: 'techplast',
    subtitle: 'Copos & Descartáveis Técnicos',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-techplast.png',
    accentColor: '#004CB1',
    productCount: 10,
    subbrands: [
      { id: 'sub-techplast-copos', name: 'Copos PP & PS Descartáveis', slug: 'techplast-copos-descartaveis', productCount: 5 },
      { id: 'sub-techplast-talheres', name: 'Pratos & Talheres Reforçados', slug: 'techplast-pratos-talheres', productCount: 5 },
    ],
  },
  {
    id: 'brand-totalplast',
    name: 'Totalplast',
    slug: 'totalplast',
    subtitle: 'Embalagens Térmicas & Descartáveis',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-totalplast.png',
    accentColor: '#4F46E5',
    productCount: 10,
    subbrands: [
      { id: 'sub-totalplast-termicos', name: 'Copos & Potes Térmicos EPS', slug: 'totalplast-copos-potes-termicos', productCount: 5 },
      { id: 'sub-totalplast-bandejas', name: 'Bandejas & Discos de Isopor', slug: 'totalplast-bandejas-isopor', productCount: 5 },
    ],
  },
  {
    id: 'brand-vipel',
    name: 'Vipel',
    slug: 'vipel',
    subtitle: 'Embalagens de Papel & Linha Kraft',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-vipel.png',
    accentColor: '#92400E',
    productCount: 10,
    subbrands: [
      { id: 'sub-vipel-kraft', name: 'Sacolas & Sacos Kraft Delivery', slug: 'vipel-sacolas-kraft', productCount: 5 },
      { id: 'sub-vipel-bobinas', name: 'Bobinas de Papel & Papel Manteiga', slug: 'vipel-papel-culinario-bobinas', productCount: 5 },
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
