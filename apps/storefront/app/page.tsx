import { HomeView } from '@/components/storefront/home-view';
import { getStorefrontComposition } from '@/lib/storefront/composition-storage';
import { getBrands, getCategories, getEvents, getOffers, getProductsPage, getSiteConfig } from '@/lib/api';
import { interleaveDistinctProducts } from '@/lib/catalog-filters';
import { filterConfeitariaEvents } from '@/lib/events-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    _config,
    categories,
    brands,
    offers,
    pGeneral,
    pEmbalagens,
    pDescartaveis,
    pSacolas,
    pFestas,
    pPotes,
    rawEvents,
    composition,
  ] = await Promise.all([
    getSiteConfig(),
    getCategories(),
    getBrands(),
    getOffers(12),
    getProductsPage({ page: 1, pageSize: 16, sort: 'name_asc' }),
    getProductsPage({ category: 'embalagens', page: 1, pageSize: 16, sort: 'name_asc' }),
    getProductsPage({ category: 'descartaveis', page: 1, pageSize: 16, sort: 'newest' }),
    getProductsPage({ category: 'sacos-e-sacolas', page: 1, pageSize: 16, sort: 'name_asc' }),
    getProductsPage({ category: 'artigos-para-festa', page: 1, pageSize: 16, sort: 'newest' }),
    getProductsPage({ category: 'potes-marmitas-plasticas-e-tampas', page: 1, pageSize: 16, sort: 'newest' }),
    getEvents(),
    getStorefrontComposition(),
  ]);

  const events = filterConfeitariaEvents(rawEvents);

  const products = interleaveDistinctProducts(
    [
      pEmbalagens.items,
      pDescartaveis.items,
      pSacolas.items,
      pFestas.items,
      pPotes.items,
      pGeneral.items,
    ],
    80,
  );

  const contextData = {
    categories,
    brands,
    offers,
    products,
    events,
  };

  return (
    <div className="flex flex-col gap-0 bg-[#EBEBEB]">
      <HomeView contextData={contextData} initialComposition={composition} />
    </div>
  );
}
