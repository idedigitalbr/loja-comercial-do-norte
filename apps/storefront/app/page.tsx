import { HomeView } from '@/components/storefront/home-view';
import { defaultHomeComposition } from '@/lib/storefront/home-configuration';
import { getBrands, getCategories, getOffers, getProducts, getSiteConfig } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [config, categories, brands, offers, products] = await Promise.all([
    getSiteConfig(),
    getCategories(),
    getBrands(),
    getOffers(8),
    getProducts(),
  ]);

  const contextData = {
    categories,
    brands,
    offers,
    products,
  };

  return (
    <div className="flex flex-col gap-0 bg-[#EBEBEB]">
      <HomeView contextData={contextData} initialComposition={defaultHomeComposition} />
    </div>
  );
}
