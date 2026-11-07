import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/catalog-view';
import { getBrands, getCategories, getProductsPage, getSegments, getTags } from '@/lib/api';
import { buildEnrichedBrands, findBrandOrSubbrand } from '@/lib/brands-data';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  segmento?: string;
  tag?: string;
  marca?: string;
  ordem?: string;
  entrega?: string;
  avaliacao?: string;
  precoMin?: string;
  precoMax?: string;
  pagina?: string;
  oferta?: string;
  promocao?: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const apiBrands = await getBrands();
  const resolved = findBrandOrSubbrand(apiBrands, slug);
  const brandName = resolved?.brand.name ?? 'Marca';
  return {
    title: `${brandName} | Comercial do Norte`,
    description: `Confira produtos e submarcas de ${brandName} no catálogo da Comercial do Norte e solicite sua cotação.`,
    alternates: { canonical: `/marca/${slug}` },
  };
}

const PAGE_SIZE = 16;

function hashSlugOffset(slug: string, mod: number): number {
  if (mod <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const {
    q,
    categoria,
    segmento,
    tag,
    marca,
    ordem,
    entrega,
    avaliacao,
    precoMin,
    precoMax,
    pagina,
    oferta,
    promocao,
  } = await searchParams;

  const isOferta = oferta === '1' || oferta === 'true' || promocao === '1';
  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);
  const sort = ordem === 'nome' ? 'name_asc' : ordem === 'mais_vendidos' ? 'mais_vendidos' : 'newest';
  const effectiveBrand = marca || slug;

  const [apiBrands, categories, segments, tags, result] = await Promise.all([
    getBrands(),
    getCategories(),
    getSegments(),
    getTags(),
    getProductsPage({
      brand: effectiveBrand,
      category: categoria,
      segment: segmento,
      tag,
      search: q,
      page,
      pageSize: PAGE_SIZE,
      sort,
      offer: isOferta,
    }),
  ]);

  const enrichedBrands = buildEnrichedBrands(apiBrands);
  const resolved = findBrandOrSubbrand(apiBrands, slug);
  if (!resolved) notFound();

  const { brand, parentBrand } = resolved;

  const activeCategory = categoria
    ? categories.find((c) => c.slug === categoria) ??
      categories.flatMap((c) => c.children ?? []).find((c) => c.slug === categoria)
    : undefined;
  const activeSegment = segmento ? segments.find((s) => s.slug === segmento) : undefined;
  const activeTag = tag ? tags.find((t) => t.slug === tag) : undefined;

  let items = result.items;
  let total = result.total;
  let totalPages = result.totalPages;

  // Se o banco ainda estiver apenas com o seed genérico ('marca-exemplo'), exibe uma seleção determinística
  // do catálogo para que a vitrine de marca/submarca apareça populada como na referência visual.
  if (items.length === 0 && !q) {
    const fallbackPool = await getProductsPage({
      category: categoria,
      segment: segmento,
      tag,
      page: 1,
      pageSize: 48,
      sort,
      offer: isOferta,
    });
    if (fallbackPool.items.length > 0) {
      const targetCount = Math.min(
        fallbackPool.items.length,
        Math.max(8, Math.min(PAGE_SIZE, brand._count?.products ?? 12)),
      );
      const offset = hashSlugOffset(slug, fallbackPool.items.length);
      const rotated = [
        ...fallbackPool.items.slice(offset),
        ...fallbackPool.items.slice(0, offset),
      ];
      items = rotated.slice(0, targetCount);
      total = brand._count?.products ?? items.length;
      totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    }
  }

  if (precoMin) {
    const minCents = Math.round(Number(precoMin) * 100);
    items = items.filter((p) => (p.variants[0]?.priceCents ?? 0) >= minCents);
  }
  if (precoMax) {
    const maxCents = Math.round(Number(precoMax) * 100);
    items = items.filter((p) => (p.variants[0]?.priceCents ?? 0) <= maxCents);
  }
  if (ordem === 'preco_asc') {
    items = [...items].sort(
      (a, b) => (a.variants[0]?.priceCents ?? 0) - (b.variants[0]?.priceCents ?? 0),
    );
  } else if (ordem === 'preco_desc') {
    items = [...items].sort(
      (a, b) => (b.variants[0]?.priceCents ?? 0) - (a.variants[0]?.priceCents ?? 0),
    );
  }

  const breadcrumbs = parentBrand
    ? [
        { label: 'Marcas', href: '/marcas' },
        { label: parentBrand.name, href: `/marca/${parentBrand.slug}` },
        { label: brand.name },
      ]
    : [
        { label: 'Marcas', href: '/marcas' },
        { label: brand.name },
      ];

  return (
    <CatalogView
      activeBrand={brand}
      activeCategory={activeCategory}
      activeSegment={activeSegment}
      activeTag={activeTag}
      baseUrl={`/marca/${slug}`}
      brands={enrichedBrands}
      breadcrumbs={breadcrumbs}
      categories={categories}
      page={page}
      pageSize={PAGE_SIZE}
      products={items}
      searchParamsState={{
        q,
        categoria,
        segmento,
        tag,
        marca: effectiveBrand,
        ordem,
        entrega,
        avaliacao,
        precoMin,
        precoMax,
        pagina,
        oferta: isOferta ? '1' : undefined,
        promocao,
      }}
      segments={segments}
      tags={tags}
      title={parentBrand ? `${parentBrand.name} — ${brand.name}` : brand.name}
      total={total}
      totalPages={totalPages}
    />
  );
}
