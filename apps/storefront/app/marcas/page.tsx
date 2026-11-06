import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/catalog-view';
import { getBrands, getCategories, getSegments, getTags } from '@/lib/api';
import { buildEnrichedBrands } from '@/lib/brands-data';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  q?: string;
  ordem?: string;
  pagina?: string;
}>;

export const metadata: Metadata = {
  title: 'Marcas | Comercial do Norte',
  description: 'Compre por marca e submarca no catálogo da Comercial do Norte.',
  alternates: { canonical: '/marcas' },
};

export default async function BrandsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, ordem, pagina } = await searchParams;

  const [apiBrands, categories, segments, tags] = await Promise.all([
    getBrands(),
    getCategories(),
    getSegments(),
    getTags(),
  ]);

  const enrichedBrands = buildEnrichedBrands(apiBrands);

  return (
    <CatalogView
      baseUrl="/marcas"
      brands={enrichedBrands}
      breadcrumbs={[{ label: 'Marcas' }]}
      categories={categories}
      page={1}
      pageSize={20}
      products={[]}
      searchParamsState={{
        q,
        ordem,
        pagina,
      }}
      segments={segments}
      tags={tags}
      title="Marcas"
      total={enrichedBrands.length}
      totalPages={1}
      viewMode="brands"
    />
  );
}
