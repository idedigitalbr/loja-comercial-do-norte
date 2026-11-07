/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ExplicaAiSinglePost } from './explica-ai-single-post';
import * as FavoritesModule from '@/components/favorites-provider';
import * as CartModule from '@/components/quote-cart-provider';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/post/caixas-de-pizza-formatos-e-respiros',
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(cleanup);

beforeEach(() => {
  vi.spyOn(CartModule, 'useQuoteCart').mockReturnValue({
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
});

const mockPost = {
  id: 'post-pizza',
  title: 'Caixas de pizza: formatos e respiros que preservam a massa',
  slug: 'caixas-de-pizza-formatos-e-respiros',
  excerpt: 'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria.',
  content: '<p>Conteúdo de teste</p>',
  coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
  videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
  videoDuration: '2:18',
  authorName: 'Comercial do Norte',
  badges: ['PIZZARIAS', 'TRANSPORTE SEGURO'],
  publishedAt: '2026-10-27T10:00:00.000Z',
  views: 12500,
  conceptTag: 'Conceito 7',
  category: {
    id: 'cat-1',
    name: 'Embalagens & Delivery',
    slug: 'embalagens-delivery',
  },
};

describe('ExplicaAiSinglePost', () => {
  it('renderiza o post com título, badge e mockup do smartphone', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    expect(screen.getByRole('heading', { level: 1, name: /Caixas de pizza/i })).toBeDefined();
    expect(screen.getByText('EXPLICA AÍ NORT!')).toBeDefined();
    expect(screen.getByText(/12,5 mil visualizações/i)).toBeDefined();
    expect(screen.getByLabelText('Assistir ao vídeo agora')).toBeDefined();
    expect(screen.getByLabelText('Assistir ao vídeo explicativo')).toBeDefined();
  });

  it('abre o modal do vídeo com embed do YouTube ao clicar no smartphone ou botão de play', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    // Inicialmente o modal não está aberto
    expect(screen.queryByRole('dialog')).toBeNull();

    // Clica no botão de play
    const playButton = screen.getByLabelText('Assistir ao vídeo agora');
    fireEvent.click(playButton);

    // O modal deve estar aberto
    const modal = screen.getByRole('dialog');
    expect(modal).toBeDefined();

    // O iframe deve estar presente com embed do YouTube Shorts
    const iframe = screen.getByTitle(mockPost.title) as HTMLIFrameElement;
    expect(iframe).toBeDefined();
    expect(iframe.src).toContain('https://www.youtube-nocookie.com/embed/m6drhnZQmCM');

    // Botão de fechar fecha o modal
    const closeBtn = screen.getByLabelText('Fechar vídeo');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('abre o modal com fundo 97% escuro (modo cinema z-[99999]) e fecha com ESC ou clique fora', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    // Clica para abrir o vídeo
    fireEvent.click(screen.getByLabelText('Assistir ao vídeo agora'));

    const modal = screen.getByRole('dialog');
    expect(modal).toBeDefined();

    // Backdrop com 97% de escuridão e z-index alto para ficar acima do header
    expect(modal.style.backgroundColor).toBe('rgba(0, 0, 0, 0.97)');
    expect(modal.className).toContain('z-[99999]');

    // Botão flutuante de fechar com atalho ESC
    const floatingClose = screen.getByLabelText('Fechar visualização');
    expect(floatingClose).toBeDefined();

    // Fechar pressionando a tecla Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    // Reabre e testa clique fora no backdrop
    fireEvent.click(screen.getByLabelText('Assistir ao vídeo agora'));
    const reOpenedModal = screen.getByRole('dialog');
    expect(reOpenedModal).toBeDefined();

    fireEvent.click(reOpenedModal);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renderiza corretamente o post de copos e tampas para açaí e café', () => {
    const coposPost = {
      ...mockPost,
      id: 'post-copos',
      title: 'Copos e tampas para açaí e café',
      slug: 'copos-e-tampas-para-acai-e-cafe',
      coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    };

    render(<ExplicaAiSinglePost post={coposPost} />);

    expect(screen.getByRole('heading', { level: 1, name: /Copos e tampas para açaí e café/i })).toBeDefined();
    expect(screen.getByText(/Tampas: bolha com ou sem furo e bico para bebidas quentes/i)).toBeDefined();
    expect(screen.getAllByAltText('Copos e tampas para açaí e café').length).toBeGreaterThan(0);
  });
});
