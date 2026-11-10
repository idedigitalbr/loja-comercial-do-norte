/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import FavoritosPage from './page';

let mockFavorites: Array<{
  id: string;
  name: string;
  productSlug: string;
  sku: string;
  imagePath: string;
  unitPriceCents: number;
}> = [];

vi.mock('@/components/favorites-provider', () => ({
  useFavorites: () => ({
    favorites: mockFavorites,
    count: mockFavorites.length,
    remove: vi.fn(),
    clear: vi.fn(),
    ready: true,
  }),
}));

vi.mock('@/components/quote-cart-provider', () => ({
  useQuoteCart: () => ({
    add: vi.fn(),
    openDrawer: vi.fn(),
  }),
}));

vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

afterEach(() => {
  cleanup();
  mockFavorites = [];
  vi.clearAllMocks();
});

describe('FavoritosPage (/favoritos)', () => {
  it('renderiza o estado de nenhum produto favorito quando lista está vazia', () => {
    mockFavorites = [];

    render(<FavoritosPage />);

    expect(screen.getByText(/Seus favoritos estão guardados/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Explorar catálogo/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Entrar/i })).toBeDefined();
  });

  it('renderiza os produtos favoritos quando há itens salvos', () => {
    mockFavorites = [
      {
        id: 'fav-1',
        name: 'Saco Kraft Delivery Reforçado',
        productSlug: 'saco-kraft-delivery',
        sku: 'KRAFT-01',
        imagePath: '/img/kraft.png',
        unitPriceCents: 4500,
      },
    ];

    render(<FavoritosPage />);

    expect(screen.getByText(/Saco Kraft Delivery Reforçado/i)).toBeDefined();
    expect(screen.getByText(/R\$\s*45,00/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Adicionar todos à cotação/i })).toBeDefined();
  });
});
