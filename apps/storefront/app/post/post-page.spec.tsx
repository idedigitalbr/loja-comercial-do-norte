/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import PostsPage from './page';

// Mock das funções de API e composição
vi.mock('@/lib/api', () => ({
  getPosts: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'post-1',
        title: 'Embalagens kraft para o seu delivery',
        slug: 'embalagens-kraft-para-o-seu-delivery',
        excerpt: 'Mais praticidade com embalagens kraft. Combine formato e resistência. Valorize a apresentação do seu delivery.',
        content: '<p>Conteúdo de teste</p>',
        coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
        badges: ['DELIVERY', 'LINHA KRAFT'],
        status: 'ACTIVE',
        publishedAt: '2026-10-28T00:00:00.000Z',
        views: 10,
        category: { id: 'cat-1', name: 'Embalagens & Delivery', slug: 'embalagens-delivery' },
      },
      {
        id: 'post-2',
        title: 'Copos e tampas para açaí e café',
        slug: 'copos-e-tampas-para-acai-e-cafe',
        excerpt: 'O copo certo faz a diferença. Combine a tampa com sua bebida. Evite vazamentos no transporte.',
        content: '<p>Conteúdo de teste</p>',
        coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
        badges: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
        status: 'ACTIVE',
        publishedAt: '2026-10-28T00:00:00.000Z',
        views: 5,
        category: { id: 'cat-2', name: 'Food Service & Bebidas', slug: 'food-service-bebidas' },
      },
    ],
    total: 2,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  }),
  getPostCategories: vi.fn().mockResolvedValue([
    { id: 'cat-1', name: 'Embalagens & Delivery', slug: 'embalagens-delivery', _count: { posts: 2 } },
    { id: 'cat-2', name: 'Food Service & Bebidas', slug: 'food-service-bebidas', _count: { posts: 1 } },
  ]),
}));

vi.mock('@/lib/storefront/composition-storage', () => ({
  getStorefrontComposition: vi.fn().mockResolvedValue({
    widgets: [
      {
        id: 's15-explica-ai-comercial',
        type: 'video-articles-carousel',
        enabled: true,
        order: 13,
        props: {
          title: 'Explica Aí Nort',
          subtitle: 'Dicas em vídeos e artigos para você usar no seu negócio.',
          viewAllLabel: 'Ver todos',
          viewAllUrl: '/post',
          mascotImageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-Boneco3D-explica-ai-nort-trimmed.webp',
          bgImageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-bg-fundo-vermelho-geometrico-abstrato-hd.png',
          items: [
            {
              id: 'vid-2',
              tags: ['DELIVERY', 'LINHA KRAFT'],
              title: 'Embalagens kraft para o seu delivery',
              paragraphs: ['Mais praticidade com embalagens kraft.'],
              ctaLabel: 'Ver Completo',
              ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
              imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
            },
          ],
        },
      },
    ],
  }),
}));

afterEach(cleanup);

describe('PostsPage (/post)', () => {
  it('renderiza o banner oficial no topo, a barra de busca e o filtro de temas', async () => {
    const pageComponent = await PostsPage({
      searchParams: Promise.resolve({}),
    });

    render(pageComponent);

    // Banner da Home reutilizado no topo
    expect(screen.getAllByText('Explica Aí').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nort!').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dicas em vídeos e artigos/)).toBeDefined();

    // Barra de busca
    const searchInput = screen.getByPlaceholderText('O que você quer aprender hoje?');
    expect(searchInput).toBeDefined();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDefined();

    // Filtros de temas
    expect(screen.getByText('Temas:')).toBeDefined();
    expect(screen.getByText('Todos os conteúdos')).toBeDefined();
    expect(screen.getByText('Embalagens & Delivery (2)')).toBeDefined();
  });

  it('renderiza os cards da vitrine no formato horizontal com play e botão Ver Completo', async () => {
    const pageComponent = await PostsPage({
      searchParams: Promise.resolve({}),
    });

    render(pageComponent);

    // Cards do grid
    expect(screen.getAllByText('Embalagens kraft para o seu delivery').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Copos e tampas para açaí e café').length).toBeGreaterThanOrEqual(1);

    const buttons = screen.getAllByText('Ver Completo');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
