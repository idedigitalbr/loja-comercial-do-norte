/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import BrandPage, { generateMetadata } from './page';

const mockNotFound = vi.fn();

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const { mockBrands } = vi.hoisted(() => ({
  mockBrands: [
    {
      id: 'brand-fasapel',
      name: 'Fasapel',
      slug: 'fasapel',
      logoUrl: '/marcas-imgs/fasapel.png',
      _count: { products: 10 },
      subbrands: [
        { id: 'sub-fasa-eco', name: 'Fasapel Eco', slug: 'fasapel-eco', parentId: 'brand-fasapel', _count: { products: 5 } },
      ],
    },
  ],
}));

vi.mock('@/lib/api', () => ({
  getBrands: vi.fn().mockResolvedValue(mockBrands),
  getCategories: vi.fn().mockResolvedValue([]),
  getSegments: vi.fn().mockResolvedValue([]),
  getTags: vi.fn().mockResolvedValue([]),
  getProductsPage: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'prod-fasa-1',
        name: 'Guardanapo Fasapel 30x30 Folha Dupla',
        slug: 'guardanapo-fasapel-30x30',
        categories: [],
        variants: [{ id: 'var-1', sku: 'FAS-30', priceCents: 650, stockQuantity: 100 }],
        media: [],
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  }),
  getProducts: vi.fn().mockResolvedValue([]),
  mediaUrl: vi.fn((path: string) => path),
}));

vi.mock('@/components/quote-cart-provider', () => ({
  useQuoteCart: () => ({
    items: [],
    subtotalCents: 0,
    count: 0,
    add: vi.fn(),
    remove: vi.fn(),
    updateQuantity: vi.fn(),
    clear: vi.fn(),
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
    drawerOpen: false,
    ready: true,
  }),
}));

vi.mock('@/components/favorites-provider', () => ({
  useFavorites: () => ({
    favorites: [],
    count: 0,
    add: vi.fn(),
    remove: vi.fn(),
    isFavorite: vi.fn(() => false),
    clear: vi.fn(),
    ready: true,
  }),
}));

afterEach(cleanup);

describe('BrandPage (/marca/[slug])', () => {
  it('renderiza o título da marca, breadcrumb e produtos relacionados', async () => {
    const Component = await BrandPage({
      params: Promise.resolve({ slug: 'fasapel' }),
      searchParams: Promise.resolve({}),
    });

    render(Component);

    expect(screen.getAllByText(/Fasapel/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Guardanapo Fasapel 30x30/i)).toBeDefined();
    expect(screen.getByText(/R\$\s*6,50/i)).toBeDefined();
  });

  it('chama notFound() quando a marca não existe', async () => {
    await BrandPage({
      params: Promise.resolve({ slug: 'marca-inexistente' }),
      searchParams: Promise.resolve({}),
    });

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('gera metadata canônica para a marca', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'fasapel' }),
    });

    expect(meta.title).toBe('Fasapel | Comercial do Norte');
    expect(meta.description).toContain('Fasapel no catálogo da Comercial do Norte');
  });
});
