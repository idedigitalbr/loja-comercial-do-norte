import { Injectable } from '@nestjs/common';

const defaultShell = '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><!--SEO_TITLE--><!--SEO_META--><!--SEO_JSON_LD--></head><body><div id="root"></div></body></html>';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

@Injectable()
export class SeoRendererService {
  productShell(product: { name: string; slug: string; description?: string | null; priceCents: number; image?: string | null }, template = defaultShell) {
    const title = `${product.name} | Jonas & Elivaldo`;
    const description = product.description ?? `Compre ${product.name} na Jonas & Elivaldo.`;
    const canonical = `https://jonaselivaldohair.com.br/produto/${encodeURIComponent(product.slug)}`;
    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, description, image: product.image ? [product.image] : undefined, offers: { '@type': 'Offer', priceCurrency: 'BRL', price: (product.priceCents / 100).toFixed(2), url: canonical } }).replace(/</g, '\\u003c');
    return template
      .replace('<!--SEO_TITLE-->', `<title>${escapeHtml(title)}</title>`)
      .replace('<!--SEO_META-->', `<meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="product"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}">`)
      .replace('<!--SEO_JSON_LD-->', `<script type="application/ld+json">${jsonLd}</script>`);
  }

  storefrontShell(template = defaultShell) {
    return template.replace('<!--SEO_TITLE-->', '<title>Jonas &amp; Elivaldo</title>');
  }
}
