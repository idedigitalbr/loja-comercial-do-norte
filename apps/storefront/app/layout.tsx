import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { FavoritesProvider } from '@/components/favorites-provider';
import { LocationProvider } from '@/components/location-provider';
import { PostalCodeModal } from '@/components/postal-code-modal';
import { QuoteCartProvider } from '@/components/quote-cart-provider';
import { QuoteDrawer } from '@/components/quote-drawer';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { StorefrontShell } from '@/components/storefront/storefront-shell';
import { WebVitalsReporter } from '@/components/web-vitals-reporter';
import { getCategories, getBrands, getSegments, getTags, getSiteConfig, mediaUrl } from '@/lib/api';
import { getStorefrontComposition } from '@/lib/storefront/composition-storage';

export const metadata: Metadata = {
  title: 'Comercial do Norte | Embalagens, descartáveis e mercearia',
  description: 'Catálogo de plásticos, descartáveis, embalagens, variedades e mercearia em Belém/PA. Monte sua lista e receba a cotação.',
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [config, categories, brands, segments, tags, composition] = await Promise.all([
    getSiteConfig(),
    getCategories(),
    getBrands(),
    getSegments(),
    getTags(),
    getStorefrontComposition(),
  ]);
  const site = config?.site ?? null;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-white" suppressHydrationWarning>
        <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink" href="#conteudo">
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <FavoritesProvider>
            <LocationProvider>
              <QuoteCartProvider>
                <WebVitalsReporter />
                <StorefrontShell
                  initialComposition={composition}
                  footer={<SiteFooter categories={categories} site={site} />}
                  header={
                    <SiteHeader
                      brands={brands}
                      categories={categories}
                      segments={segments}
                      tags={tags}
                      logoUrl={mediaUrl(site?.logoPath ?? null)}
                      phone={site?.phone ?? null}
                      siteName={site?.siteName ?? 'Comercial do Norte'}
                      whatsapp={site?.whatsapp ?? null}
                    />
                  }
                >
                  <main id="conteudo">{children}</main>
                  <QuoteDrawer />
                  <PostalCodeModal />
                </StorefrontShell>
              </QuoteCartProvider>
            </LocationProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
