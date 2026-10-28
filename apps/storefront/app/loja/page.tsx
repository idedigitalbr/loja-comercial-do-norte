import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/catalog-view';
import { getBrands, getCategories, getProductsPage, getSegments, getTags } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo | Comercial do Norte',
  description: 'Embalagens, descartáveis, artigos para festa, limpeza e mercearia. Monte sua lista e receba a cotação.',
  alternates: { canonical: '/loja' },
};

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
}>;

const PAGE_SIZE = 12;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
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
  } = await searchParams;

  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);
  const sort = ordem === 'nome' ? 'name_asc' : 'newest';

  const [result, categories, segments, tags, brands] = await Promise.all([
    getProductsPage({
      search: q,
      category: categoria,
      segment: segmento,
      tag,
      brand: marca,
      page,
      pageSize: PAGE_SIZE,
      sort,
    }),
    getCategories(),
    getSegments(),
    getTags(),
    getBrands(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);
  const activeSegment = segments.find((s) => s.slug === segmento);
  const activeTag = tags.find((t) => t.slug === tag);
  const activeBrand = brands.find((b) => b.slug === marca);

  // Filtros em memória complementares para ordenação por preço e faixas personalizadas
  let items = result.items;
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
      (a, b) => (a.variants[0]?.priceCents ?? 0) - (b.variants[0]?.priceCents ?? 0)
    );
  } else if (ordem === 'preco_desc') {
    items = [...items].sort(
      (a, b) => (b.variants[0]?.priceCents ?? 0) - (a.variants[0]?.priceCents ?? 0)
    );
  }

  const pageTitle = activeSegment
    ? `Segmento: ${activeSegment.name}`
    : activeCategory
      ? activeCategory.name
      : activeTag
        ? `Tag: #${activeTag.name}`
        : activeBrand
          ? `Marca: ${activeBrand.name}`
          : 'Catálogo completo';

  return (
    <CatalogView
      activeBrand={activeBrand}
      activeCategory={activeCategory}
      activeSegment={activeSegment}
      activeTag={activeTag}
      baseUrl="/loja"
      brands={brands}
      categories={categories}
      page={result.page}
      pageSize={PAGE_SIZE}
      products={items}
      searchParamsState={{
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
      }}
      segments={segments}
      tags={tags}
      title={pageTitle}
      total={result.total}
      totalPages={result.totalPages}
    />
  );
}
