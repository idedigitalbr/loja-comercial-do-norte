import type { MetadataRoute } from 'next';
import { getBrands, getCategories, getProducts, getSegments } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

/** Sitemap público: apenas conteúdos publicados (DRAFT nunca aparece). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, segments] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    getSegments(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/loja`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/marcas`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/segmentos`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/cotacao`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  for (const category of categories) {
    entries.push({ url: `${siteUrl}/categoria/${category.slug}`, changeFrequency: 'weekly', priority: 0.7 });
  }
  for (const brand of brands) {
    entries.push({ url: `${siteUrl}/marca/${brand.slug}`, changeFrequency: 'weekly', priority: 0.5 });
  }
  for (const segment of segments) {
    entries.push({ url: `${siteUrl}/segmento/${segment.slug}`, changeFrequency: 'weekly', priority: 0.6 });
  }
  for (const product of products) {
    entries.push({ url: `${siteUrl}/produto/${product.slug}`, changeFrequency: 'weekly', priority: 0.8 });
  }
  return entries;
}
