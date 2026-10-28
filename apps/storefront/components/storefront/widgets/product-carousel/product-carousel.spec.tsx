/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ProductCarouselWidget } from './product-carousel';
import type { ApiProduct } from '@/lib/types';
import * as QuoteCartModule from '@/components/quote-cart-provider';
import * as FavoritesModule from '@/components/favorites-provider';

vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
    updateWidgetProps: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('ProductCarouselWidget', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const mockOffers: ApiProduct[] = [
    {
      id: 'prod-copo-300',
      publicId: 'prod-copo-300',
      name: 'Copo Descartável Transparente 300 ml',
      slug: 'copo-descartavel-300ml',
      description: 'Sai a R$ 0,12 por copo no atacado',
      status: 'ACTIVE',
      brand: { id: 'b1', name: 'Cristalcopo', slug: 'cristalcopo' },
      categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
      images: [{ id: 'img1', path: '/assets/PRODUTOS/produtos-imgs/copo-300ml.png', altText: 'Copo 300ml', isPrimary: true, sortOrder: 0, variantId: null }],
      variants: [{ id: 'v1', publicId: 'v1', sku: 'DEMO-COP-300', priceCents: 890, compareAtPriceCents: 1090, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
    },
    {
      id: 'prod-caixa-pizza',
      publicId: 'prod-caixa-pizza',
      name: 'Caixa de Pizza 35 cm',
      slug: 'caixa-pizza-35cm',
      description: 'Linha reforçada com respiro anti-umidade',
      status: 'ACTIVE',
      brand: { id: 'b2', name: 'Comercial do Norte', slug: 'comercial-do-norte' },
      categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
      images: [{ id: 'img2', path: '/assets/PRODUTOS/produtos-imgs/caixa-pizza-35cm.jpg', altText: 'Caixa de Pizza', isPrimary: true, sortOrder: 0, variantId: null }],
      variants: [{ id: 'v2', publicId: 'v2', sku: 'DEMO-CAI-035', priceCents: 390, compareAtPriceCents: 450, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
    },
    {
      id: 'prod-detergente',
      publicId: 'prod-detergente',
      name: 'Detergente Neutro 5 L',
      slug: 'detergente-neutro-5l',
      description: 'Alto rendimento para cozinhas industriais',
      status: 'ACTIVE',
      brand: { id: 'b3', name: 'Limpeza Pro', slug: 'limpeza-pro' },
      categories: [{ category: { id: 'c3', name: 'Limpeza', slug: 'limpeza' } }],
      images: [{ id: 'img3', path: '/assets/PRODUTOS/produtos-imgs/detergente-5l.jpg', altText: 'Detergente Neutro', isPrimary: true, sortOrder: 0, variantId: null }],
      variants: [{ id: 'v3', publicId: 'v3', sku: 'DEMO-DET-005L', priceCents: 2490, compareAtPriceCents: 2790, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
    },
  ];

  it('renderiza o carrossel split-banner com paginação de 2 páginas e navegação funcional', () => {
    vi.spyOn(QuoteCartModule, 'useQuoteCart').mockReturnValue({
      addItem: vi.fn(),
      items: [],
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      totalItems: 0,
    } as unknown as ReturnType<typeof QuoteCartModule.useQuoteCart>);

    vi.spyOn(FavoritesModule, 'useFavorites').mockReturnValue({
      isFavorite: vi.fn(() => false),
      toggleFavorite: vi.fn(),
      favorites: [],
      totalCount: 0,
    } as unknown as ReturnType<typeof FavoritesModule.useFavorites>);

    render(
      <ProductCarouselWidget
        contextData={{
          offers: mockOffers,
          products: [],
          categories: [],
          brands: [],
        }}
        limit={3}
        source="offers"
        title="Produtos em Promoção"
        variant="split-banner"
      />,
    );

    // 1. Título e link Ver todos presentes
    expect(screen.getByText('Produtos em Promoção')).toBeDefined();
    expect(screen.getByText('Ver todos')).toBeDefined();

    // 2. Banner vertical lateral presente
    expect(screen.getByText('Semana do Feirante ⌄')).toBeDefined();

    // 3. Pílula navy com indicadores de página (Página 1 e Página 2)
    const page1Btn = screen.getByLabelText('Página 1');
    const page2Btn = screen.getByLabelText('Página 2');
    expect(page1Btn).toBeDefined();
    expect(page2Btn).toBeDefined();

    // 4. Produtos da página 1 presentes
    expect(screen.getByText('Copo Descartável Transparente 300 ml')).toBeDefined();
    expect(screen.getByText('Caixa de Pizza 35 cm')).toBeDefined();
    expect(screen.getByText('Detergente Neutro 5 L')).toBeDefined();

    // 5. Botão Próximo presente e Anterior oculto na página inicial
    const nextBtn = screen.getByLabelText('Próximo');
    const prevBtn = screen.getByLabelText('Anterior');
    expect(nextBtn).toBeDefined();
    expect(prevBtn.className).toContain('hidden');

    // 6. Avança para a Página 2
    fireEvent.click(nextBtn);

    // Na página 2, o produto de sacola deve ser exibido
    expect(screen.getByText(/Sacola Plástica/i)).toBeDefined();
    expect(prevBtn.className).not.toContain('hidden');

    // 7. Retorna para a Página 1 ao clicar em Anterior
    fireEvent.click(prevBtn);
    expect(screen.getByText('Copo Descartável Transparente 300 ml')).toBeDefined();
  });
});
