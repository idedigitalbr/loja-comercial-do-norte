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

  function mockProviders() {
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
  }

  const mockProduct = {
    id: 'prod-sacola-1',
    publicId: 'prod-pub-1',
    name: 'Sacola Plástica Branca 50×60 — Pct 5kg',
    slug: 'sacola-plastica-branca-50x60',
    description: 'Alta resistência para atacado e comércio',
    brand: { id: 'brand-1', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'cat-embalagens', name: 'Sacos e Sacolas', slug: 'sacos-e-sacolas' } }],
    status: 'ACTIVE',
    images: [{ id: 'img-1', path: '/assets/PRODUTOS/produtos-imgs/sacola-50x60.jpg', altText: 'Sacola', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [
      {
        id: 'var-1',
        publicId: 'var-pub-1',
        sku: 'SAC-5060-BR',
        priceCents: 6990,
        compareAtPriceCents: 8990,
        packagingRaw: 'PCT 5KG',
        color: 'Branca',
        sizeOrModel: '50X60',
        weightGrams: 5000,
        widthMm: 500,
        heightMm: 600,
        lengthMm: 10,
        sortOrder: 0,
        status: 'ACTIVE',
      },
    ],
  } as unknown as ApiProduct;

  it('renders badges, title, category | brand, description, specs and real prices without stars', () => {
    mockProviders();

    render(<ProductCard flashBadge product={mockProduct} />);

    // Badges
    expect(screen.getByText(/22% OFF/i)).toBeDefined();
    expect(screen.getByText(/RELÂMPAGO/i)).toBeDefined();

    // Title
    expect(screen.getByText('Sacola Plástica Branca 50×60 — Pct 5kg')).toBeDefined();

    // Sem estrelas no card (ficam apenas na página single)
    expect(screen.queryByText(/4\.7/i)).toBeNull();

    // Categoria | Marca e Descrição
    expect(screen.getByText('Sacos e Sacolas')).toBeDefined();
    expect(screen.getByText('NortePlast')).toBeDefined();
    expect(screen.getByText('Alta resistência para atacado e comércio')).toBeDefined();

    // Especificações no rodapé
    expect(screen.getByText('Quantidade:')).toBeDefined();
    expect(screen.getByText('PCT 5KG')).toBeDefined();
    expect(screen.getByText('Cor:')).toBeDefined();
    expect(screen.getByText('Branca')).toBeDefined();
    expect(screen.getByText('Tamanho/Modelo:')).toBeDefined();
    expect(screen.getByText('50X60')).toBeDefined();

    // Prices (quando preço real existe)
    expect(screen.getByText(/R\$\s*89,90/)).toBeDefined();
    expect(screen.getByText(/R\$\s*69,90/)).toBeDefined();
    expect(screen.getByText('no pacote')).toBeDefined();

    // Action buttons rendered
    expect(screen.getByRole('button', { name: /Cotar agora/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Adicionar à cotação/i })).toBeDefined();
  });

  it('renders clean catalog card without Sob cotação or fake P/M/G model prefix when priceCents is null', () => {
    mockProviders();

    const quoteOnlyProduct = {
      ...mockProduct,
      id: 'prod-quote-1',
      name: 'Embalagem P-65M Torta Plasan',
      slug: 'embalagem-p-65m-torta-plasan',
      description: 'Embalagem P-65M Torta Plasan — linha Embalagens para Bolos, Tortas e Doces da marca Plasan.',
      brand: { id: 'brand-plasan', name: 'Plasan', slug: 'plasan' },
      categories: [{ category: { id: 'cat-bolos', name: 'Embalagens para Bolos, Tortas e Doces', slug: 'bolos' } }],
      images: [{ id: 'img-q', path: 'uploads/cn-cat/1/960.webp', altText: 'Pote', isPrimary: true, sortOrder: 0, variantId: null }],
      variants: [
        {
          ...mockProduct.variants[0],
          id: 'var-quote-1',
          sku: 'CN-7891234567890',
          priceCents: null,
          compareAtPriceCents: null,
          packagingRaw: 'CX C/50UND',
          color: null,
          sizeOrModel: 'P',
          manufacturerRef: 'P-65M',
        },
      ],
    } as unknown as ApiProduct;

    render(<ProductCard product={quoteOnlyProduct} />);

    expect(screen.queryByText(/Sob cotação/i)).toBeNull();
    expect(screen.queryByText(/Solicite valor/i)).toBeNull();
    expect(screen.queryByText(/4\.7/i)).toBeNull();
    expect(screen.queryByText(/% OFF/i)).toBeNull();
    expect(screen.queryByText(/R\$\s*0,00/)).toBeNull();

    // Não mostra 'P' espúrio extraído de P-65M; usa Modelo P-65M
    expect(screen.getByText('Embalagens para Bolos, Tortas e Doces')).toBeDefined();
    expect(screen.getByText('Plasan')).toBeDefined();
    expect(screen.getByText('Quantidade:')).toBeDefined();
    expect(screen.getByText('CX C/50UND')).toBeDefined();
    expect(screen.getByText('Modelo:')).toBeDefined();
    expect(screen.getByText('P-65M')).toBeDefined();
  });

  it('aggregates multiple variant colors and keeps genuine glove size P/M/G', () => {
    mockProviders();

    const multiColorProduct = {
      ...mockProduct,
      id: 'prod-luva-1',
      name: 'Luva Nitrilica Ind Preta (g) 3073 VABENE',
      slug: 'luva-nitrilica-vabene',
      description: 'Luva de proteção descartável sem pó.',
      brand: { id: 'brand-vabene', name: 'Vabene', slug: 'vabene' },
      categories: [{ category: { id: 'cat-epi', name: 'EPIs e Proteção Descartável', slug: 'epis' } }],
      variants: [
        {
          ...mockProduct.variants[0],
          id: 'var-1',
          sku: 'CN-LUVA-1',
          priceCents: null,
          compareAtPriceCents: null,
          packagingRaw: 'CX C/100UND',
          color: 'Preto',
          sizeOrModel: 'G',
        },
        {
          ...mockProduct.variants[0],
          id: 'var-2',
          sku: 'CN-LUVA-2',
          priceCents: null,
          compareAtPriceCents: null,
          packagingRaw: 'CX C/100UND',
          color: 'Azul',
          sizeOrModel: 'G',
        },
      ],
    } as unknown as ApiProduct;

    render(<ProductCard product={multiColorProduct} />);

    expect(screen.getByText('2 cores')).toBeDefined();
    expect(screen.getByText('Tamanho/Modelo:')).toBeDefined();
    expect(screen.getByText('G')).toBeDefined();
  });
});
