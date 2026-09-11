import { describe, expect, it } from 'vitest';
import { SeoRendererService } from './seo-renderer.service';

describe('SeoRendererService', () => {
  it('injects safe product metadata into the storefront shell', () => {
    const renderer = new SeoRendererService();
    const html = renderer.productShell({ name: 'Acidificante Redutor de pH', slug: 'acidificante-redutor-de-ph', description: 'Produto <seguro>', priceCents: 19_900, image: 'https://cdn.example/imagem.webp' });
    expect(html).toContain('<title>Acidificante Redutor de pH | Jonas &amp; Elivaldo</title>');
    expect(html).toContain('property="og:type" content="product"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('"@type":"Product"');
    expect(html).not.toContain('<seguro>');
  });
});
