/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { ExplicaAiSinglePost } from '@/components/explica-ai/explica-ai-single-post';
import { QuoteCartProvider } from '@/components/quote-cart-provider';

afterEach(() => {
  cleanup();
});

// Mock Next.js Image e Link
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

// Mock do QuoteCartProvider com vi.hoisted para evitar erro de inicialização
const { mockAddToCart } = vi.hoisted(() => ({
  mockAddToCart: vi.fn(),
}));

vi.mock('@/components/quote-cart-provider', () => ({
  useQuoteCart: () => ({
    add: mockAddToCart,
    items: [],
    count: 0,
    open: false,
    setOpen: vi.fn(),
    remove: vi.fn(),
    updateQuantity: vi.fn(),
    clear: vi.fn(),
  }),
  QuoteCartProvider: ({ children }: any) => children,
}));

function renderPost(post = mockPost) {
  return render(<ExplicaAiSinglePost post={post} />);
}

const mockPost = {
  id: 'test-post-1',
  title: 'Caixas de pizza: formatos e respiros que preservam a massa',
  slug: 'caixas-de-pizza-formatos-e-respiros',
  excerpt:
    'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria. Dicas práticas para manter a qualidade da pizza do forno até o cliente.',
  content: '<p>Conteúdo de teste</p>',
  coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
  videoUrl: null,
  videoDuration: '5 min',
  authorName: 'Comercial do Norte',
  badges: ['PIZZARIAS', 'TRANSPORTE SEGURO'],
  status: 'ACTIVE',
  publishedAt: '2026-10-27T10:00:00.000Z',
  views: 12500,
  category: {
    id: 'cat-1',
    name: 'Embalagens & Delivery',
    slug: 'embalagens-delivery',
  },
};

describe('ExplicaAiSinglePost Component (Pixel-Perfect Spec)', () => {
  it('renderiza o breadcrumb com caminho completo até o post', () => {
    renderPost();

    expect(screen.getByText('Início')).toBeDefined();
    expect(screen.getByText('Explica Aí Nort!')).toBeDefined();
    expect(screen.getByText('Embalagens & Delivery')).toBeDefined();
  });

  it('renderiza o Hero Banner com badge oficial, título, descrição, metadados e mascote Nort', () => {
    renderPost();

    // Badge Oficial
    expect(screen.getByText('EXPLICA AÍ NORT!')).toBeDefined();

    // Título principal
    expect(
      screen.getByRole('heading', { level: 1, name: /Caixas de pizza: formatos e respiros que preservam a massa/i })
    ).toBeDefined();

    // Callout
    expect(screen.getByText('Assista')).toBeDefined();
    expect(screen.getByText('ao vídeo')).toBeDefined();
    expect(screen.getByText('e veja as dicas')).toBeDefined();
    expect(screen.getByText('na prática!')).toBeDefined();

    // Mascote
    const mascot = screen.getByAltText(/Mascote Nort/i);
    expect(mascot).toBeDefined();
  });

  it('renderiza a seção Descrição do post com texto explicativo, foto e Principais pontos', () => {
    renderPost();

    expect(screen.getByText('Descrição do post')).toBeDefined();
    expect(
      screen.getByText(/A embalagem certa faz toda a diferença para manter a qualidade da pizza até o cliente/i)
    ).toBeDefined();

    // Imagem do artigo
    const articlePhoto = screen.getByAltText(/Pizza no forno com caixas de entrega ao lado/i);
    expect(articlePhoto).toBeDefined();

    // Principais pontos do vídeo
    expect(screen.getByText('Principais pontos do vídeo')).toBeDefined();
    expect(screen.getByText('Formatos: diferenças entre caixa oitavada e quadrada.')).toBeDefined();
    expect(screen.getByText('Respiros: como a ventilação evita que a massa fique borrachuda.')).toBeDefined();
    expect(screen.getByText('Lacres de segurança: mais confiança na entrega.')).toBeDefined();
    expect(screen.getByText('Dicas práticas de uso e armazenamento.')).toBeDefined();
  });

  it('renderiza o Banner de Produtos Relacionados com carrossel navegável e adiciona à cotação', () => {
    renderPost();

    expect(screen.getByText('PRODUTOS RELACIONADOS')).toBeDefined();
    expect(screen.getByText('Tudo para a sua pizzaria')).toBeDefined();
    expect(screen.getByText('Ver todos os produtos')).toBeDefined();

    // Produtos do carrossel
    expect(screen.getByText('Caixa de pizza oitavada')).toBeDefined();
    expect(screen.getByText('Caixa de pizza quadrada')).toBeDefined();
    expect(screen.getByText('Caixa com respiros laterais')).toBeDefined();
    expect(screen.getByText('Lacre de segurança')).toBeDefined();
    expect(screen.getByText('Papel para forno de pizza')).toBeDefined();

    // Preços
    expect(screen.getByText('R$ 7,49')).toBeDefined();
    expect(screen.getByText('R$ 24,90')).toBeDefined();
    expect(screen.getByText('R$ 7,30')).toBeDefined();
    expect(screen.getByText('R$ 4,20')).toBeDefined();
    expect(screen.getByText('R$ 15,90')).toBeDefined();

    // Botões de Adicionar à Cotação
    const addButtons = screen.getAllByText('Adicionar à Cotação');
    expect(addButtons.length).toBe(5);

    // Clica no primeiro produto para adicionar
    fireEvent.click(addButtons[0]);
    expect(mockAddToCart).toHaveBeenCalled();
  });

  it('renderiza Outras dicas que podem te ajudar com os cards de vídeo (VideoArticleCard de /posts)', () => {
    renderPost();

    expect(screen.getByText('Outras dicas que podem te ajudar')).toBeDefined();
    expect(screen.getByText('Ver todos os conteúdos')).toBeDefined();

    const verCompletoButtons = screen.getAllByText('Ver Completo');
    expect(verCompletoButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('abre e fecha o modal de vídeo ao clicar no botão de play', () => {
    renderPost();

    const playBtn = screen.getByLabelText('Assistir ao vídeo agora');
    fireEvent.click(playBtn);

    // Modal aberto
    const modal = screen.getByRole('dialog');
    expect(modal).toBeDefined();

    // Fecha o modal
    const closeBtn = screen.getByLabelText('Fechar vídeo');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
