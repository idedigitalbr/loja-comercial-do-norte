import { describe, expect, it } from 'vitest';
import { defaultHomeComposition } from './home-configuration';

describe('defaultHomeComposition (17 seções site-final + S0/S20)', () => {
  it('possui exatamente 17 seções de widgets habilitadas em ordem sequencial de 1 a 17', () => {
    expect(defaultHomeComposition.page).toBe('home');
    expect(defaultHomeComposition.version).toBeGreaterThanOrEqual(2);
    expect(defaultHomeComposition.widgets).toHaveLength(17);

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
      'segments-carousel',
      'promo-strip',
      'product-carousel',
      'banner-grid',
      'events-carousel',
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
    expect(json).toContain('/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (1).webp');
    expect(json).toContain('/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg');
    expect(json).toContain('Tudo para todos os negócios');
    expect(json).toContain('OFERTAS IMPERDÍVEIS');
    expect(json).toContain('Nossos Eventos');
    expect(json).toContain('Explica Aí Nort');
    expect(json).toContain('A Loja no Instagram');
    expect(json).toContain('Exclusivas do WhatsApp');
    expect(json).toContain('O que nossos clientes dizem no Google.');
    expect(json).toContain('Encontre nossas unidades');
  });
});
