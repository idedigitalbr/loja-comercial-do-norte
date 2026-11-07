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

    // First 6 brands from DEFAULT_BRAND_SHOWCASE (matching mockup)
    expect(screen.getAllByRole('img', { name: 'Lanchero' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Fasapel' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Segplast' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Ultra Descartáveis' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Knauf' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Plasan' })[0]).toBeDefined();

    // Links point to /marca/[slug]
    const lancheroLink = screen.getAllByRole('img', { name: 'Lanchero' })[0]?.closest('a');
    expect(lancheroLink?.getAttribute('href')).toBe('/marca/lanchero');

    // Pagination dots exist and can switch page
    const page2Dot = screen.getByRole('button', { name: 'Página de marcas 2' });
    expect(page2Dot).toBeDefined();
    fireEvent.click(page2Dot);

    expect(screen.getAllByRole('img', { name: 'Fonteplast' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Prafesta' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Sicao' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Techplast' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Totalplast' })[0]).toBeDefined();
    expect(screen.getAllByRole('img', { name: 'Vipel' })[0]).toBeDefined();
  });
});
