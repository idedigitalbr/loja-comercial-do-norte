import { describe, expect, it } from 'vitest';
import { defaultHomeComposition, reconcileComposition } from './home-configuration';
import type { PageComposition } from './widget-types';

describe('defaultHomeComposition (seções site-final + S0/S20)', () => {
  it('possui todas as seções de widgets habilitadas em ordem sequencial', () => {
    expect(defaultHomeComposition.page).toBe('home');
    expect(defaultHomeComposition.version).toBeGreaterThanOrEqual(2);
    expect(defaultHomeComposition.widgets).toHaveLength(16);

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
      'brands-carousel',
      'product-carousel',
      'segments-carousel',
      'promo-strip',
      'product-carousel',
      'video-articles-carousel',
      'events-carousel',
      'product-carousel',
      'video-articles-carousel',
      'testimonials-grid',
      'store-locations-map',
    ]);
  });

  it('valida fidelidade visual das seções S01–S19 (assets locais sem hotlinks e textos oficiais)', () => {
    const json = JSON.stringify(defaultHomeComposition);
    expect(json).toContain('/assets/HOME Vitrine/S1-TOPO-HERO-largura-total/s1-topo (1).webp');
    expect(json).toContain('/assets/HOME Vitrine/S2-TOPO-HERO-padrao/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg');
    expect(json).toContain('Para todos os Negócios');
    expect(json).toContain('OFERTAS IMPERDÍVEIS');
    expect(json).toContain('Nossos Eventos');
    expect(json).toContain('/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg');
    expect(json).toContain('Explica Aí Nort');
    expect(json).toContain('Workshops & Aulas Práticas de Confeitaria');
    expect(json).toContain('O que nossos clientes dizem no Google.');
    expect(json).toContain('Encontre nossas unidades');
  });
});

describe('reconcileComposition (auto-reconciliação inteligente)', () => {
  it('retorna defaultHomeComposition quando a entrada é nula ou indefinida e preenche se vazia', () => {
    expect(reconcileComposition(null)).toBe(defaultHomeComposition);
    expect(reconcileComposition(undefined)).toBe(defaultHomeComposition);
    expect(reconcileComposition({ page: 'home', version: 1, widgets: [] }).widgets).toHaveLength(16);
  });

  it('injeta automaticamente seções canônicas novas (como brands-carousel) quando o banco possui snapshot antigo', () => {
    // Simula o snapshot antigo de 16 seções que estava no Neon antes da correção (sem brands-carousel)
    const oldSnapshot: PageComposition = {
      page: 'home',
      version: 5,
      widgets: defaultHomeComposition.widgets
        .filter((w) => w.id !== 's07-compre-por-marca')
        .map((w, idx) => ({ ...w, order: idx + 1 })),
    };

    expect(oldSnapshot.widgets).toHaveLength(15);
    expect(oldSnapshot.widgets.some((w) => w.id === 's07-compre-por-marca')).toBe(false);

    const reconciled = reconcileComposition(oldSnapshot);

    expect(reconciled.widgets).toHaveLength(16);
    const brandWidget = reconciled.widgets.find((w) => w.id === 's07-compre-por-marca');
    expect(brandWidget).toBeDefined();
    expect(brandWidget?.type).toBe('brands-carousel');

    // Garante que brands-carousel foi inserido na posição canônica exata (após s05-triple-banners-1)
    const s05Idx = reconciled.widgets.findIndex((w) => w.id === 's05-triple-banners-1');
    const brandIdx = reconciled.widgets.findIndex((w) => w.id === 's07-compre-por-marca');
    expect(brandIdx).toBe(s05Idx + 1);

    // Garante normalização de ordem sequencial 1..16
    reconciled.widgets.forEach((w, idx) => {
      expect(w.order).toBe(idx + 1);
    });
  });

  it('preserva dados e props customizadas já salvas no snapshot', () => {
    const customizedSnapshot: PageComposition = {
      page: 'home',
      version: 6,
      widgets: [
        {
          ...defaultHomeComposition.widgets[0],
          enabled: false, // Administrador desativou
        },
      ],
    };

    const reconciled = reconcileComposition(customizedSnapshot);

    // O s01 deve continuar disabled
    const s01 = reconciled.widgets.find((w) => w.id === 's01-hero-full-width');
    expect(s01?.enabled).toBe(false);

    // E todas as seções faltantes devem ter sido preenchidas
    expect(reconciled.widgets.length).toBe(defaultHomeComposition.widgets.length);
  });
});

