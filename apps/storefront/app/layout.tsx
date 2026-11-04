import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { FavoritesProvider } from '@/components/favorites-provider';
import { LocationProvider } from '@/components/location-provider';
import { PostalCodeModal } from '@/components/postal-code-modal';
import { QuoteCartProvider } from '@/components/quote-cart-provider';
import { NortTourProvider } from '@/components/tour';
import { NortIntroVideo } from '@/components/intro';
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var s = window.location.search || '';
    var p = s.indexOf('intro=1') !== -1 || s.indexOf('force-intro=1') !== -1 || s.indexOf('reset-intro=1') !== -1;
    var v = localStorage.getItem('cn_nort_intro_views_v1');
    var count = v === null ? 0 : parseInt(v, 10);
    if (p || isNaN(count) || count < 3) {
      document.documentElement.classList.add('nort-intro-active');
    }
  } catch (e) {}
})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html.nort-intro-active {
  background-color: #E1DBD7 !important;
}
html.nort-intro-active body {
  background-color: #E1DBD7 !important;
  overflow: hidden !important;
}
html.nort-intro-active #storefront-shell-root,
html.nort-intro-active [data-storefront-content="true"],
html.nort-intro-active header,
html.nort-intro-active main,
html.nort-intro-active footer,
html.nort-intro-active nav {
  visibility: hidden !important;
  pointer-events: none !important;
}
html.nort-intro-active #nort-intro-ssr-curtain {
  display: block !important;
}
`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-white" suppressHydrationWarning>
        <div
          id="nort-intro-ssr-curtain"
          aria-hidden="true"
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#E1DBD7',
            zIndex: 9999990,
            pointerEvents: 'none',
            transition: 'opacity 700ms ease-out',
          }}
        />
        <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink" href="#conteudo">
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <FavoritesProvider>
            <LocationProvider>
              <QuoteCartProvider>
                <NortTourProvider>
                  <NortIntroVideo />
                  <WebVitalsReporter />
                  <div id="storefront-shell-root" data-storefront-content="true">
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
                  </div>
                </NortTourProvider>
              </QuoteCartProvider>
            </LocationProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
