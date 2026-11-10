/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import ProductPage, { generateMetadata } from './page';

const mockNotFound = vi.fn();

vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
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

const mockProduct = {
  id: 'prod-copo-200ml',
  name: 'Copo Descartável 200ml Cristalcopo',
  slug: 'copo-descartavel-200ml',
  description: 'Copo plástico descartável resistente para bebidas frias ou quentes.',
  brand: { id: 'brand-cristalcopo', name: 'Cristalcopo', slug: 'cristalcopo' },
  categories: [
    {
      category: {
        id: 'cat-descartaveis',
        name: 'Descartáveis',
        slug: 'descartaveis',
      },
    },
  ],
  variants: [
    {
      id: 'var-copo-200',
      sku: 'COP-200-CRISTAL',
      priceCents: 1250,
      compareAtPriceCents: 1500,
      weightGrams: 500,
      widthMm: 100,
      heightMm: 200,
      lengthMm: 100,
      stockQuantity: 50,
    },
  ],
  media: [],
};

vi.mock('@/lib/api', () => ({
  getProduct: vi.fn().mockImplementation((slug: string) => {
    if (slug === 'copo-descartavel-200ml') return Promise.resolve(mockProduct);
    return Promise.resolve(null);
  }),
  getProducts: vi.fn().mockResolvedValue([
    {
      id: 'prod-prato-15cm',
      name: 'Prato Plástico 15cm',
      slug: 'prato-plastico-15cm',
      categories: [{ category: { id: 'cat-descartaveis', name: 'Descartáveis', slug: 'descartaveis' } }],
      variants: [{ id: 'var-prato', sku: 'PRAT-15', priceCents: 890, stockQuantity: 20 }],
      media: [],
    },
  ]),
  mediaUrl: vi.fn((path: string) => path),
}));

afterEach(cleanup);

describe('ProductPage (/produto/[slug])', () => {
  it('renderiza o nome, SKU, preço formatado, descrição e botão Adicionar à cotação', async () => {
    const Component = await ProductPage({
      params: Promise.resolve({ slug: 'copo-descartavel-200ml' }),
    });

    render(Component);

    expect(screen.getByRole('heading', { level: 1, name: /Copo Descartável 200ml Cristalcopo/i })).toBeDefined();
    expect(screen.getByText(/SKU COP-200-CRISTAL/i)).toBeDefined();
    expect(screen.getByText(/R\$\s*12,50/i)).toBeDefined();
    expect(screen.getByText(/Copo plástico descartável resistente/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Adicionar à cotação/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/CRISTALCOPO/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/500 g/i)).toBeDefined();
    expect(screen.getByText(/Produtos relacionados/i)).toBeDefined();
  });

  it('chama notFound() quando o produto não existe', async () => {
    await ProductPage({
      params: Promise.resolve({ slug: 'produto-inexistente' }),
    });

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('gera metadata canônica para o produto', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'copo-descartavel-200ml' }),
    });

    expect(meta.title).toBe('Copo Descartável 200ml Cristalcopo | Comercial do Norte');
    expect(meta.description).toContain('Copo plástico descartável resistente');
  });
});
