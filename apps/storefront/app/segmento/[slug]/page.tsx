import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/catalog-view';
import { SegmentHeroBanner } from '@/components/segment-hero-banner';
import { VideoArticlesCarouselWidget } from '@/components/storefront/widgets/video-articles-carousel/video-articles-carousel';
import { getBrands, getCategories, getProductsPage, getSegments, getTags } from '@/lib/api';
import { getSegmentContentSuggestions, getSegmentTipsHeading } from '@/lib/segment-content-data';
import type { ApiSegment } from '@/lib/types';

export const dynamic = 'force-dynamic';

const DEFAULT_FALLBACK_SEGMENTS: ApiSegment[] = [
  { id: 'seg_lanchonete', name: 'Lanchonetes & Hamburguerias', slug: 'lanchonete' },
  { id: 'seg_pizzaria', name: 'Pizzarias & Esfiharias', slug: 'pizzaria' },
  { id: 'seg_padaria', name: 'Padarias & Confeitarias', slug: 'padaria' },
  { id: 'seg_festas', name: 'Festas & Eventos', slug: 'loja-de-festas' },
  { id: 'seg_delivery', name: 'Delivery', slug: 'delivery' },
  { id: 'seg_buffet', name: 'Restaurantes & Buffets', slug: 'restaurante-buffet' },
  { id: 'seg_confeitaria', name: 'Doces & Confeitaria Caseira', slug: 'confeitaria-bolos' },
  { id: 'seg_sorveteria', name: 'Sorveterias & Açaís', slug: 'sorveteria-acai' },
  { id: 'seg_bar', name: 'Bares & Distribuidoras', slug: 'bar-distribuidora' },
];

function findSegment(segments: ApiSegment[], slug: string): ApiSegment | undefined {
  const all = segments.length > 0 ? segments : DEFAULT_FALLBACK_SEGMENTS;
  return (
    all.find((item) => item.slug === slug) ??
    (slug === 'festas' ? all.find((item) => item.slug === 'loja-de-festas') : null) ??
    (slug === 'loja-de-festas' ? all.find((item) => item.slug === 'festas') : null) ??
    (slug === 'buffet' ? all.find((item) => item.slug === 'restaurante-buffet') : null) ??
    (slug === 'confeitaria' ? all.find((item) => item.slug === 'confeitaria-bolos') : null) ??
    (slug === 'acai' ? all.find((item) => item.slug === 'sorveteria-acai') : null) ??
    (slug === 'bar' ? all.find((item) => item.slug === 'bar-distribuidora') : null) ??
    DEFAULT_FALLBACK_SEGMENTS.find((item) => item.slug === slug)
  );
}

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{
  q?: string;
  ordem?: string;
  entrega?: string;
  avaliacao?: string;
  precoMin?: string;
  precoMax?: string;
  pagina?: string;
  oferta?: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const segments = await getSegments();
  const segment = findSegment(segments, slug);
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
    oferta,
  } = await searchParams;

  const isOferta = oferta === '1' || oferta === 'true';
  const page = Math.max(1, Number.parseInt(pagina ?? '1', 10) || 1);
  const sort = ordem === 'nome' ? 'name_asc' : ordem === 'mais_vendidos' ? 'mais_vendidos' : 'newest';

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
      offer: isOferta,
    }),
  ]);

  const segment = findSegment(segments, slug);
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

  const contentSuggestions = getSegmentContentSuggestions(slug);
  const tipsHeading = getSegmentTipsHeading(slug, segment.name);

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
          oferta: isOferta ? '1' : undefined,
        }}
        segments={segments}
        tags={tags}
        title={segment.name}
        total={result.total}
        totalPages={result.totalPages}
      />

      {/* Sugestões de Conteúdo para o Segmento (Explica Aí Nort!) — Acima do Footer */}
      <section
        aria-label={`Sugestões de conteúdo para ${segment.name}`}
        className="mt-2 pb-10 sm:pb-14"
      >
        <VideoArticlesCarouselWidget
          fullWidth={false}
          items={contentSuggestions}
          showViewAll={true}
          subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
          title="Explica Aí Nort"
          topHeading={tipsHeading}
          viewAllLabel="Ver mais"
          viewAllUrl="/post"
        />
      </section>
    </div>
  );
}
