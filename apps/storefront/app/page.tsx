import { HomeView } from '@/components/storefront/home-view';
import { getStorefrontComposition } from '@/lib/storefront/composition-storage';
import { getBrands, getCategories, getOffers, getProducts, getSiteConfig } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [config, categories, brands, offers, products, composition] = await Promise.all([
    getSiteConfig(),
    getCategories(),
    getBrands(),
    getOffers(12),
    getProducts(),
    getStorefrontComposition(),
  ]);

  const contextData = {
    categories,
    brands,
    offers,
    products,
  };

  return (
    <div className="flex flex-col gap-0 bg-[#EBEBEB]">
      <HomeView contextData={contextData} initialComposition={composition} />
    </div>
  );
}
