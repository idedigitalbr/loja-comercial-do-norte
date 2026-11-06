/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrandsCarouselWidget } from './brands-carousel';
import type { WidgetContextData } from '@/lib/storefront/widget-types';

vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
    updateWidgetProps: vi.fn(),
  }),
}));

describe('BrandsCarouselWidget', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const emptyContext: WidgetContextData = {
    products: [],
    offers: [],
    categories: [],
    brands: [],
  };

  it('renders centered title, 6 brand cards on first page, and pagination dots', () => {
    render(
      <BrandsCarouselWidget
        contextData={emptyContext}
        title="Compre por Marca"
        viewAllLink="/marcas"
        widgetId="s07-compre-por-marca"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Compre por Marca' })).toBeDefined();

    // First 6 brands from DEFAULT_BRAND_SHOWCASE
    expect(screen.getAllByRole('img', { name: 'Copobras' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Cristalcopo' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Wyda' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'NortePlast' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Mili Profissional' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Nestlé Professional' })[0]).toBeDefined();

    // Links point to /marca/[slug]
    const copobrasLink = screen.getAllByRole('img', { name: 'Copobras' })[0]?.closest('a');
    expect(copobrasLink?.getAttribute('href')).toBe('/marca/copobras');

    // Pagination dots exist and can switch page
    const page2Dot = screen.getByRole('button', { name: 'Página de marcas 2' });
    expect(page2Dot).toBeDefined();
    fireEvent.click(page2Dot);

    expect(screen.getAllByRole('img', { name: 'Grandha' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Maxiline' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Knut Hair Care' })[0]).toBeDefined();
  });
});
