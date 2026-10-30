import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/catalog-view';
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
  oferta?: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((item) => item.slug === slug);
  return {
    title: `Tag: #${tag?.name ?? slug} | Comercial do Norte`,
    description: `Produtos com a etiqueta #${tag?.name ?? slug} no Comercial do Norte.`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

const PAGE_SIZE = 20;

export default async function TagPage({
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

  const [tags, categories, segments, brands, result] = await Promise.all([
    getTags(),
    getCategories(),
    getSegments(),
    getBrands(),
    getProductsPage({
      tag: slug,
      search: q,
      page,
      pageSize: PAGE_SIZE,
      sort,
      offer: isOferta,
    }),
  ]);

  const tag = tags.find((item) => item.slug === slug);
  if (!tag) notFound();

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
    <CatalogView
      activeTag={tag}
      baseUrl={`/tag/${slug}`}
      brands={brands}
      breadcrumbs={[
        { label: 'Tags' },
        { label: `#${tag.name}` },
      ]}
      categories={categories}
      page={result.page}
      pageSize={PAGE_SIZE}
      products={items}
      searchParamsState={{
        q,
        tag: slug,
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
      title={`Tag: #${tag.name}`}
      total={result.total}
      totalPages={result.totalPages}
    />
  );
}
