/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { PromoStripWidget } from './promo-strip';

// Mock Elementor Context
vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
  }),
}));

describe('PromoStripWidget', () => {
  it('renderiza a variante offers-strip diretamente como imagem no container sem fundo escuro e sem vão excessivo', () => {
    const { container } = render(
      <PromoStripWidget
        ctaUrl="/loja?oferta=1"
        highlightText="OFERTAS IMPERDÍVEIS"
        imageUrl="/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp"
        title="em embalagens, descartáveis e utilidades"
        variant="offers-strip"
      />
    );

    const section = container.querySelector('section');
    expect(section).toBeDefined();
    expect(section?.className).toContain('cn-container');
    expect(section?.className).not.toContain('bg-[#001F4D]');

    const imageContainer = section?.firstElementChild;
    expect(imageContainer?.className).toContain('rounded-2xl');
    expect(imageContainer?.className).not.toContain('bg-[#001F4D]');

    const img = section?.querySelector('img');
    expect(img).toBeDefined();
    expect(img?.getAttribute('src')).toBe('/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp');
  });
});
