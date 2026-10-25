import type { Metadata } from 'next';
import './globals.css';
import { QuoteCartProvider } from '@/components/quote-cart-provider';
import { QuoteDrawer } from '@/components/quote-drawer';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { StorefrontShell } from '@/components/storefront/storefront-shell';
import { getCategories, getBrands, getSiteConfig, mediaUrl } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Comercial do Norte | Embalagens, descartáveis e mercearia',
  description: 'Catálogo de plásticos, descartáveis, embalagens, variedades e mercearia em Belém/PA. Monte sua lista e receba a cotação.',
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [config, categories, brands] = await Promise.all([getSiteConfig(), getCategories(), getBrands()]);
  const site = config?.site ?? null;

  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased bg-white">
        <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink" href="#conteudo">
          Pular para o conteúdo
        </a>
        <QuoteCartProvider>
          <StorefrontShell
            footer={<SiteFooter categories={categories} site={site} />}
            header={
              <SiteHeader
                brands={brands}
                categories={categories}
                logoUrl={mediaUrl(site?.logoPath ?? null)}
                phone={site?.phone ?? null}
                siteName={site?.siteName ?? 'Comercial do Norte'}
                whatsapp={site?.whatsapp ?? null}
              />
            }
          >
            <main id="conteudo">{children}</main>
            <QuoteDrawer />
          </StorefrontShell>
        </QuoteCartProvider>
      </body>
    </html>
  );
}
