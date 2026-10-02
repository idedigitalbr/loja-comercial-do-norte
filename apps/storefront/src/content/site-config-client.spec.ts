import { describe, expect, it } from 'vitest';
import { institutionalContent } from './institutional-content';
import { isSafeCtaHref, loadSiteConfig, resolveSiteContent } from './site-config-client';

describe('loadSiteConfig', () => {
  it('returns null when remote site configuration is unavailable', async () => {
    const result = await loadSiteConfig(async () => ({ ok: false } as Response));

    expect(result).toBeNull();
  });

  it('accepts internal and approved external CTA schemes only', () => {
    expect(isSafeCtaHref('/loja')).toBe(true);
    expect(isSafeCtaHref('https://jonaselivaldohair.com.br/loja')).toBe(true);
    expect(isSafeCtaHref('mailto:contato@example.com')).toBe(true);
    expect(isSafeCtaHref('javascript:alert(1)')).toBe(false);
    expect(isSafeCtaHref('//malicious.example')).toBe(false);
  });

  it('adds the Brazilian country code to a local phone when building its tel link', () => {
    const resolved = resolveSiteContent(institutionalContent.site, {
      site: {
        siteName: 'Jonas & Elivaldo Hair Designers',
        logoPath: null,
        faviconPath: null,
        address: null,
        phone: '(96) 98100-1897',
        whatsapp: '5596981001897',
        instagramUrl: null,
        title: null,
        description: null,
      },
      banners: [],
    });

    expect(resolved.phoneHref).toBe('tel:+5596981001897');
  });
});
