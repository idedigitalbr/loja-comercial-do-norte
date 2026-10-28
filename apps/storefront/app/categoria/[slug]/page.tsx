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
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  return {
    title: `${category?.name ?? 'Categoria'} | Comercial do Norte`,
    description: category ? `Produtos de ${category.name} para cotação na Comercial do Norte.` : undefined,
    alternates: { canonical: `/categoria/${slug}` },
  };
}

const PAGE_SIZE = 12;

export default async function CategoryPage({
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

  const [categories, segments, tags, brands, result] = await Promise.all([
    getCategories(),
    getSegments(),
    getTags(),
    getBrands(),
    getProductsPage({
      category: slug,
      search: q,
      page,
      pageSize: PAGE_SIZE,
      sort,
    }),
  ]);

  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

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
      activeCategory={category}
      baseUrl={`/categoria/${slug}`}
      brands={brands}
      breadcrumbs={[{ label: category.name }]}
      categories={categories}
      page={result.page}
      pageSize={PAGE_SIZE}
      products={items}
      searchParamsState={{
        q,
        categoria: slug,
        ordem,
        entrega,
        avaliacao,
        precoMin,
        precoMax,
        pagina,
      }}
      segments={segments}
      tags={tags}
      title={category.name}
      total={result.total}
      totalPages={result.totalPages}
    />
  );
}
