/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ProductCardActions } from './product-card-actions';
import * as QuoteCartModule from './quote-cart-provider';
import * as NavigationModule from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('ProductCardActions', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const mockItem = {
    variantId: 'var-123',
    productSlug: 'sacola-plastica-50x60',
    name: 'Sacola Plástica Branca 50×60',
    sku: 'SAC-5060',
    imagePath: '/img/sacola.jpg',
    unitPriceCents: 6990,
    quantity: 1,
  };

  it('renders "Cotar agora" and "Adicionar à cotação" buttons', () => {
    const mockAdd = vi.fn();
    vi.spyOn(QuoteCartModule, 'useQuoteCart').mockReturnValue({
      items: [],
      count: 0,
      subtotalCents: 0,
      ready: true,
      drawerOpen: false,
      add: mockAdd,
      updateQuantity: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
    });

    render(<ProductCardActions item={mockItem} />);

    expect(screen.getByRole('button', { name: /Cotar agora/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Adicionar à cotação/i })).toBeDefined();
  });

  it('handles instant quote: adds item and navigates to /cotacao', () => {
    const mockAdd = vi.fn();
    const mockPush = vi.fn();
    vi.spyOn(QuoteCartModule, 'useQuoteCart').mockReturnValue({
      items: [],
      count: 0,
      subtotalCents: 0,
      ready: true,
      drawerOpen: false,
      add: mockAdd,
      updateQuantity: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
    });
    vi.spyOn(NavigationModule, 'useRouter').mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as any);

    render(<ProductCardActions item={mockItem} />);

    const instantBtn = screen.getByRole('button', { name: /Cotar agora/i });
    fireEvent.click(instantBtn);

    expect(mockAdd).toHaveBeenCalledWith(mockItem);
    expect(mockPush).toHaveBeenCalledWith('/cotacao');
  });

  it('handles add to quote cart: adds item and shows temporary feedback', () => {
    const mockAdd = vi.fn();
    vi.spyOn(QuoteCartModule, 'useQuoteCart').mockReturnValue({
      items: [],
      count: 0,
      subtotalCents: 0,
      ready: true,
      drawerOpen: false,
      add: mockAdd,
      updateQuantity: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
    });

    render(<ProductCardActions item={mockItem} />);

    const addBtn = screen.getByRole('button', { name: /Adicionar à cotação/i });
    fireEvent.click(addBtn);

    expect(mockAdd).toHaveBeenCalledWith(mockItem);
    expect(screen.getByText(/Adicionado!/i)).toBeDefined();
  });
});
