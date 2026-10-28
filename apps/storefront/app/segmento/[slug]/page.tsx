import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/catalog-view';
import { SegmentHeroBanner } from '@/components/segment-hero-banner';
import { getBrands, getCategories, getProductsPage, getSegments, getTags } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{
  q?: string;
  ordem?: string;
  entrega?: string;
  avaliacao?: string;
  precoMin?: string;
  precoMax?: string;
  pagina?: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const segments = await getSegments();
  const segment = segments.find((item) => item.slug === slug);
  return {
    title: `${segment?.name ?? 'Segmento'} | Comercial do Norte`,
    description:
      segment?.description ??
      `Produtos e embalagens para ${segment?.name ?? 'seu segmento'} na Comercial do Norte.`,
    alternates: { canonical: `/segmento/${slug}` },
  };
}

const PAGE_SIZE = 12;

export default async function SegmentPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const {
    q,
    ordem,
    entrega,
    avaliacao,
    precoMin,
    precoMax,
    pagina,
  } = await searchParams;

  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);
  const sort = ordem === 'nome' ? 'name_asc' : 'newest';

  const [segments, categories, tags, brands, result] = await Promise.all([
    getSegments(),
    getCategories(),
    getTags(),
    getBrands(),
    getProductsPage({
      segment: slug,
      search: q,
      page,
      pageSize: PAGE_SIZE,
      sort,
    }),
  ]);

  const segment = segments.find((item) => item.slug === slug);
  if (!segment) notFound();

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

  return (
    <div className="flex flex-col bg-[#F4F7FB] min-h-screen">
      {/* Banner Oficial do Segmento: Mesma altura e largura total do Hero da Home */}
      <SegmentHeroBanner segment={segment} />

      <CatalogView
        activeSegment={segment}
        baseUrl={`/segmento/${slug}`}
        brands={brands}
        breadcrumbs={[
          { label: 'Segmentos', href: '/segmentos' },
          { label: segment.name },
        ]}
        categories={categories}
        page={result.page}
        pageSize={PAGE_SIZE}
        products={items}
        searchParamsState={{
          q,
          segmento: slug,
          ordem,
          entrega,
          avaliacao,
          precoMin,
          precoMax,
          pagina,
        }}
        segments={segments}
        tags={tags}
        title={segment.name}
        total={result.total}
        totalPages={result.totalPages}
      />
    </div>
  );
}
