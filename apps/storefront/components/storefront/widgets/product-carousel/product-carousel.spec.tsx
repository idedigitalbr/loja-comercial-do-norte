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
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  const mockCartAndFavorites = () => {
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
  };

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

  it('renderiza o carrossel split-banner com banner 3:4 sem cortes, seletor de campanhas e paginação funcional', () => {
    mockCartAndFavorites();

    const { container } = render(
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

    // 2. Banner vertical lateral respeitando proporção 3:4 e object-contain (Anexo 2.1)
    const bannerContainer = container.querySelector('.aspect-\\[3\\/4\\]');
    expect(bannerContainer).not.toBeNull();
    const bannerImg = bannerContainer?.querySelector('img');
    expect(bannerImg?.className).toContain('object-contain');
    expect(bannerImg?.className).not.toContain('object-cover');

    // 3. Seletor interativo de campanhas ("Semana do Feirante") presente (Anexo 2.2)
    const campaignSelectorBtn = screen.getByRole('button', {
      name: /Selecionar campanha promocional/i,
    });
    expect(campaignSelectorBtn).toBeDefined();
    expect(screen.getByText('Semana do Feirante')).toBeDefined();

    // 4. Pílula navy com indicadores de página (Página 1 e Página 2)
    const page1Btn = screen.getByLabelText('Página 1');
    const page2Btn = screen.getByLabelText('Página 2');
    expect(page1Btn).toBeDefined();
    expect(page2Btn).toBeDefined();

    // 5. Produtos da página 1 presentes
    expect(screen.getByText('Copo Descartável Transparente 300 ml')).toBeDefined();
    expect(screen.getByText('Caixa de Pizza 35 cm')).toBeDefined();
    expect(screen.getByText('Detergente Neutro 5 L')).toBeDefined();

    // 6. Botão Próximo presente e Anterior oculto na página inicial
    const nextBtn = screen.getByLabelText('Próximo');
    const prevBtn = screen.getByLabelText('Anterior');
    expect(nextBtn).toBeDefined();
    expect(prevBtn.className).toContain('hidden');

    // 7. Avança para a Página 2
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Sacola Plástica/i)).toBeDefined();
    expect(prevBtn.className).not.toContain('hidden');

    // 8. Retorna para a Página 1 ao clicar em Anterior
    fireEvent.click(prevBtn);
    expect(screen.getByText('Copo Descartável Transparente 300 ml')).toBeDefined();
  });

  it('permite selecionar outra campanha promocional no seletor interativo e atualiza banner e produtos (Anexo 2.2)', () => {
    mockCartAndFavorites();

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

    const selectorBtn = screen.getByRole('button', {
      name: /Selecionar campanha promocional/i,
    });

    // Abre o menu de campanhas
    fireEvent.click(selectorBtn);
    const listbox = screen.getByRole('listbox', {
      name: /Campanhas promocionais ativas/i,
    });
    expect(listbox).toBeDefined();

    // Seleciona "Especial Delivery & Kraft"
    const deliveryOption = screen.getByRole('option', {
      name: /Especial Delivery & Kraft/i,
    });
    fireEvent.click(deliveryOption);

    // O menu fecha e o subtítulo/banner mudam para a campanha selecionada
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByText('Linha Delivery')).toBeDefined();
    expect(screen.getByText('Especial Delivery & Kraft')).toBeDefined();
  });

  it('exibe grade 2x2 (4 produtos por página) no mobile e não duplica nem estica produtos em grupo ímpar (Anexo 3)', () => {
    mockCartAndFavorites();

    // Simula viewport mobile de 375px
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // Cria exatamente 10 produtos para validar a regra do enunciado:
    // Página 1: produtos 1 a 4 | Página 2: produtos 5 a 8 | Página 3: produtos 9 e 10
    const tenProducts: ApiProduct[] = Array.from({ length: 10 }, (_, i) => ({
      id: `prod-mob-${i + 1}`,
      publicId: `prod-mob-${i + 1}`,
      name: `Produto Mobile ${i + 1}`,
      slug: `produto-mobile-${i + 1}`,
      description: `Descrição ${i + 1}`,
      status: 'ACTIVE' as const,
      brand: { id: 'b1', name: 'Marca', slug: 'marca' },
      categories: [{ category: { id: 'c1', name: 'Geral', slug: 'geral' } }],
      images: [{ id: `img-${i + 1}`, path: '/assets/PRODUTOS/produtos-imgs/copo-300ml.png', altText: `Produto ${i + 1}`, isPrimary: true, sortOrder: 0, variantId: null }],
      variants: [{ id: `v-${i + 1}`, publicId: `v-${i + 1}`, sku: `SKU-${i + 1}`, priceCents: 1000, compareAtPriceCents: 1200, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK' as const, status: 'ACTIVE' as const }],
    }));

    render(
      <ProductCarouselWidget
        contextData={{
          offers: [],
          products: tenProducts,
          categories: [],
          brands: [],
        }}
        limit={5}
        source="recent"
        title="Mais vendidos"
        variant="standard-5col"
      />,
    );

    // Página 1 no mobile deve exibir exatamente os produtos 1 a 4 (grade 2x2)
    expect(screen.getByText('Produto Mobile 1')).toBeDefined();
    expect(screen.getByText('Produto Mobile 2')).toBeDefined();
    expect(screen.getByText('Produto Mobile 3')).toBeDefined();
    expect(screen.getByText('Produto Mobile 4')).toBeDefined();
    expect(screen.queryByText('Produto Mobile 5')).toBeNull();

    // Avança para Página 2 (produtos 5 a 8)
    const nextBtn = screen.getByLabelText('Próximo');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Produto Mobile 5')).toBeDefined();
    expect(screen.getByText('Produto Mobile 8')).toBeDefined();
    expect(screen.queryByText('Produto Mobile 9')).toBeNull();

    // Avança para Página 3 (produtos 9 e 10 — sem duplicar produtos 1 e 2!)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Produto Mobile 9')).toBeDefined();
    expect(screen.getByText('Produto Mobile 10')).toBeDefined();
    expect(screen.queryByText('Produto Mobile 1')).toBeNull();
  });

  it('limita as bolinhas da vitrine Para você / Mais vendidos a no máximo 4 páginas na home', () => {
    mockCartAndFavorites();

    const largeCatalog: ApiProduct[] = Array.from({ length: 50 }, (_, i) => ({
      id: `prod-${i}`,
      publicId: `prod-${i}`,
      name: `Produto Catálogo ${i + 1}`,
      slug: `produto-catalogo-${i + 1}`,
      description: `Descrição do produto ${i + 1}`,
      status: 'ACTIVE' as const,
      brand: { id: 'b1', name: 'Marca Teste', slug: 'marca-teste' },
      categories: [{ category: { id: 'c1', name: 'Geral', slug: 'geral' } }],
      images: [{ id: `img-${i}`, path: '/assets/PRODUTOS/produtos-imgs/copo-300ml.png', altText: `Produto ${i + 1}`, isPrimary: true, sortOrder: 0, variantId: null }],
      variants: [{ id: `v-${i}`, publicId: `v-${i}`, sku: `SKU-${i}`, priceCents: 1000 + i * 100, compareAtPriceCents: 1500, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK' as const, status: 'ACTIVE' as const }],
    }));

    render(
      <ProductCarouselWidget
        contextData={{
          offers: [],
          products: largeCatalog,
          categories: [],
          brands: [],
        }}
        limit={5}
        source="recent"
        title="Para você"
        variant="standard-5col"
      />,
    );

    const titleEl = screen.getByRole('heading', { name: 'Para você' });
    expect(titleEl).toBeDefined();
    expect(titleEl.className).toContain('whitespace-nowrap');

    const pageButtons = screen.getAllByRole('button', { name: /Página \d+/ });
    expect(pageButtons.length).toBeLessThanOrEqual(4);
    expect(pageButtons.length).toBe(4);

    expect(screen.getByLabelText('Página 1')).toBeDefined();
    expect(screen.getByLabelText('Página 2')).toBeDefined();
    expect(screen.getByLabelText('Página 3')).toBeDefined();
    expect(screen.getByLabelText('Página 4')).toBeDefined();
    expect(screen.queryByLabelText('Página 5')).toBeNull();
  });
});
