import { describe, expect, it } from 'vitest';
import { isSafeCtaHref, loadSiteConfig } from './site-config-client';

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
});
