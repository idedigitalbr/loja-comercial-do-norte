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
  it('renderiza a variante offers-strip em full largura com fundo e bordas arredondadas nos cantos', () => {
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
    expect(section?.className).toContain('w-full');

    const backgroundContainer = section?.firstElementChild;
    expect(backgroundContainer?.className).toContain('w-full');
    expect(backgroundContainer?.className).toContain('rounded-[20px]');
    expect(backgroundContainer?.className).toContain('bg-[#001F4D]');

    const contentContainer = backgroundContainer?.querySelector('.cn-container');
    expect(contentContainer).toBeDefined();
  });
});
