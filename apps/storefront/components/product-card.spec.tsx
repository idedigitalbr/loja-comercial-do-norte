/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ProductCard } from './product-card';
import type { ApiProduct } from '@/lib/types';
import * as QuoteCartModule from './quote-cart-provider';
import * as FavoritesModule from './favorites-provider';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('ProductCard', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const mockProduct = {
    id: 'prod-sacola-1',
    name: 'Sacola Plástica Branca 50×60 — Pct 5kg',
    slug: 'sacola-plastica-branca-50x60',
    description: 'Alta resistência para atacado e comércio',
    categoryId: 'cat-embalagens',
    brandId: 'brand-1',
    status: 'ACTIVE',
    images: [{ id: 'img-1', path: '/assets/home-ref/prod-sacola-plastica.jpg', altText: 'Sacola', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [
      {
        id: 'var-1',
        publicId: 'var-pub-1',
        sku: 'SAC-5060-BR',
        priceCents: 6990,
        compareAtPriceCents: 8990,
        weightGrams: 5000,
        widthMm: 500,
        heightMm: 600,
        lengthMm: 10,
        sortOrder: 0,
        status: 'ACTIVE',
      },
    ],
  } as unknown as ApiProduct;

  it('renders badges, title, rating, prices and description', () => {
    vi.spyOn(QuoteCartModule, 'useQuoteCart').mockReturnValue({
      items: [],
      count: 0,
      subtotalCents: 0,
      ready: true,
      drawerOpen: false,
      add: vi.fn(),
      updateQuantity: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
    });

    vi.spyOn(FavoritesModule, 'useFavorites').mockReturnValue({
      favorites: [],
      count: 0,
      ready: true,
      isFavorite: vi.fn(() => false),
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      clear: vi.fn(),
    });

    render(<ProductCard flashBadge product={mockProduct} />);

    // Badges
    expect(screen.getByText(/22% OFF/i)).toBeDefined();
    expect(screen.getByText(/RELÂMPAGO/i)).toBeDefined();

    // Title
    expect(screen.getByText('Sacola Plástica Branca 50×60 — Pct 5kg')).toBeDefined();

    // Rating
    expect(screen.getByText(/4.7/i)).toBeDefined();

    // Prices
    expect(screen.getByText(/R\$\s*89,90/)).toBeDefined();
    expect(screen.getByText(/R\$\s*69,90/)).toBeDefined();
    expect(screen.getByText('no pacote')).toBeDefined();

    // Description
    expect(screen.getByText('Alta resistência para atacado e comércio')).toBeDefined();

    // Action buttons rendered
    expect(screen.getByRole('button', { name: /Cotar agora/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Adicionar à cotação/i })).toBeDefined();
  });
});
