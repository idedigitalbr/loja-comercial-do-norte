/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { BannerGridWidget } from './banner-grid';

vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
    updateWidgetProps: vi.fn(),
  }),
}));

describe('BannerGridWidget', () => {
  afterEach(() => {
    cleanup();
  });

  const mockBanners = [
    { id: 'b1', title: 'Produtos de Limpeza', imageUrl: '/b1.webp', linkUrl: '/limpeza', altText: 'Banner Limpeza' },
    { id: 'b2', title: 'Semana do Feirante', imageUrl: '/b2.webp', linkUrl: '/feirante', altText: 'Banner Feirante' },
    { id: 'b3', title: 'Sacos e Sacolas', imageUrl: '/b3.webp', linkUrl: '/sacolas', altText: 'Banner Sacolas' },
  ];

  it('renderiza carrossel horizontal estilo Netflix no mobile com linha única e prévia do próximo card (Anexo 4)', () => {
    render(<BannerGridWidget banners={mockBanners} columns={3} />);

    const mobileTrack = screen.getByTestId('banner-grid-mobile-track');
    expect(mobileTrack).toBeDefined();
    expect(mobileTrack.className).toContain('flex-nowrap');
    expect(mobileTrack.className).toContain('overflow-x-auto');
    expect(mobileTrack.className).toContain('snap-x');
    expect(mobileTrack.className).toContain('snap-mandatory');

    // Verifica que cada card no mobile tem largura parcial (w-[85%]) e shrink-0 para mostrar prévia do próximo card
    const firstCard = mobileTrack.firstElementChild;
    expect(firstCard?.className).toContain('w-[85%]');
    expect(firstCard?.className).toContain('shrink-0');
    expect(firstCard?.className).toContain('aspect-[16/9]');
  });
});
