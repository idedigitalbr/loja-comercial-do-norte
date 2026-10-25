import { describe, expect, it } from 'vitest';
import { defaultHomeComposition } from './home-configuration';

describe('defaultHomeComposition (19 seções site-final + S0/S20)', () => {
  it('possui exatamente 19 seções de widgets habilitadas em ordem sequencial de 1 a 19', () => {
    expect(defaultHomeComposition.page).toBe('home');
    expect(defaultHomeComposition.version).toBeGreaterThanOrEqual(2);
    expect(defaultHomeComposition.widgets).toHaveLength(19);

    defaultHomeComposition.widgets.forEach((widget, idx) => {
      expect(widget.enabled).toBe(true);
      expect(widget.order).toBe(idx + 1);
      expect(widget.id).toBeTruthy();
    });
  });

  it('cobre todos os tipos de widgets estruturais exigidos pelo wireframe e site-final', () => {
    const types = defaultHomeComposition.widgets.map((w) => w.type);
    expect(types).toEqual([
      'hero-carousel',
      'contained-hero',
      'category-grid',
      'product-carousel',
      'banner-grid',
      'product-carousel',
      'quote-steps-banner',
      'segments-carousel',
      'promo-strip',
      'product-carousel',
      'banner-grid',
      'events-carousel',
      'promo-strip',
      'product-carousel',
      'video-articles-carousel',
      'instagram-feed',
      'promo-strip',
      'testimonials-grid',
      'store-locations-map',
    ]);
  });

  it('valida fidelidade visual das seções S01–S19 (assets locais sem hotlinks e textos oficiais)', () => {
    const json = JSON.stringify(defaultHomeComposition);
    expect(json).toContain('/assets/home-ref/s01-hero-pizzaria.jpg');
    expect(json).toContain('/assets/home-ref/s02-contained-feirante.jpg');
    expect(json).toContain('Como funciona a cotação online');
    expect(json).toContain('Tudo para todos os negócios');
    expect(json).toContain('OFERTAS IMPERDÍVEIS');
    expect(json).toContain('Nossos Eventos');
    expect(json).toContain('CONDIÇÕES ESPECIAIS');
    expect(json).toContain('Explica aí comercial');
    expect(json).toContain('A Loja no Instagram');
    expect(json).toContain('Exclusivas do WhatsApp');
    expect(json).toContain('O que nossos clientes dizem no Google.');
    expect(json).toContain('Encontre nossas unidades');
  });
});
