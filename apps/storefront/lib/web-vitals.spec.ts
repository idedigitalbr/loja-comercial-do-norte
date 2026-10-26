import { describe, expect, it } from 'vitest';
import { CACHE_TAGS, REVALIDATE_WINDOWS, mediaUrl } from './api';
import { classifyWebVital, responsiveGridSizes } from './web-vitals';

describe('performance, cache e web vitals (D4)', () => {
  it('classifica métricas Core Web Vitals nos limiares oficiais (good, needs-improvement, poor)', () => {
    expect(classifyWebVital('LCP', 1900)).toBe('good');
    expect(classifyWebVital('LCP', 3200)).toBe('needs-improvement');
    expect(classifyWebVital('LCP', 4500)).toBe('poor');

    expect(classifyWebVital('CLS', 0.04)).toBe('good');
    expect(classifyWebVital('CLS', 0.18)).toBe('needs-improvement');
    expect(classifyWebVital('CLS', 0.35)).toBe('poor');

    expect(classifyWebVital('INP', 120)).toBe('good');
    expect(classifyWebVital('INP', 350)).toBe('needs-improvement');
    expect(classifyWebVital('INP', 600)).toBe('poor');
  });

  it('gera atributo sizes responsivo para grades de catálogo e produtos', () => {
    expect(responsiveGridSizes({ mobile: 1, tablet: 2, desktop: 4 })).toBe(
      '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px',
    );
    expect(responsiveGridSizes({ mobile: 2, tablet: 4, desktop: 6 })).toBe(
      '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 213px',
    );
  });

  it('define janelas de cache ISR e tags semânticas para revalidação da vitrine', () => {
    expect(REVALIDATE_WINDOWS.SITE_CONFIG).toBe(300);
    expect(REVALIDATE_WINDOWS.TAXONOMY).toBe(180);
    expect(REVALIDATE_WINDOWS.CATALOG).toBe(60);
    expect(CACHE_TAGS.PRODUCTS).toBe('catalog-products');
    expect(CACHE_TAGS.CATEGORIES).toBe('catalog-categories');
    expect(mediaUrl('uploads/site/logo.webp')).toContain('/storage/uploads/site/logo.webp');
    expect(mediaUrl(null)).toBeNull();
  });
});
