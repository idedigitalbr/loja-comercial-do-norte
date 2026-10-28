/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { ExplicaAiSinglePost } from '@/components/explica-ai/explica-ai-single-post';

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
  publishedAt: '2026-10-27T10:00:00.000Z',
  views: 12500,
  conceptTag: 'Conceito 7',
  category: {
    id: 'cat-1',
    name: 'Embalagens & Delivery',
    slug: 'embalagens-delivery',
  },
};

describe('ExplicaAiSinglePost Component (Pixel-Perfect Spec)', () => {
  it('renderiza o breadcrumb com caminho completo até o post', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    expect(screen.getByText('Início')).toBeDefined();
    expect(screen.getByText('Explica Aí Nort!')).toBeDefined();
    expect(screen.getByText('Embalagens & Delivery')).toBeDefined();
  });

  it('renderiza o Hero Banner com badges, título, descrição, metadados e mascote Nort', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    // Badges
    expect(screen.getByText('Conceito 7')).toBeDefined();
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

  it('renderiza a seção de Transcrição do vídeo com os 4 capítulos e permite expandir', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    expect(screen.getByText('Transcrição do vídeo')).toBeDefined();
    expect(screen.getByText('Assistir no YouTube')).toBeDefined();

    // 4 capítulos
    expect(screen.getByText('Introdução: por que a caixa de pizza é tão importante?')).toBeDefined();
    expect(screen.getByText('Formatos: oitavada x quadrada')).toBeDefined();
    expect(screen.getByText('Respiros: ventilação que preserva a massa')).toBeDefined();
    expect(screen.getByText('Lacres de segurança e boas práticas')).toBeDefined();

    // Timestamps
    expect(screen.getByText('00:00')).toBeDefined();
    expect(screen.getByText('00:32')).toBeDefined();
    expect(screen.getByText('01:10')).toBeDefined();
    expect(screen.getByText('01:45')).toBeDefined();

    // Clica para expandir capítulo 1
    const chapterTitle = screen.getByText('Introdução: por que a caixa de pizza é tão importante?');
    fireEvent.click(chapterTitle);

    expect(screen.getByText(/Quando o cliente recebe uma pizza em casa/i)).toBeDefined();
  });

  it('renderiza o Banner Comercial CTA para montagem de cotação online', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    expect(screen.getByText('PRECISA DESSES ITENS NO SEU NEGÓCIO?')).toBeDefined();
    expect(screen.getByText('Monte sua cotação online na Comercial do Norte')).toBeDefined();
    expect(screen.getByText(/Ver Catálogo de Produtos/i)).toBeDefined();
  });

  it('renderiza os 4 Produtos citados neste vídeo com imagem e botão Ver Produto', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    expect(screen.getByText('Produtos citados neste vídeo')).toBeDefined();
    expect(screen.getByText('Caixa de pizza oitavada')).toBeDefined();
    expect(screen.getByText('Caixa de pizza quadrada')).toBeDefined();
    expect(screen.getByText('Caixa com respiros laterais')).toBeDefined();
    expect(screen.getByText('Lacre de segurança')).toBeDefined();

    const verProdutoLinks = screen.getAllByText('Ver Produto');
    expect(verProdutoLinks.length).toBe(4);
  });

  it('renderiza as Outras dicas que podem te ajudar com os 4 cards de vídeo', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

    expect(screen.getByText('Outras dicas que podem te ajudar')).toBeDefined();
    expect(screen.getByText('Decoração de doces e bolos com chantilly profissional')).toBeDefined();
    expect(screen.getByText('Copos e tampas para açaí e café')).toBeDefined();
    expect(screen.getByText('Embalagens kraft para o seu delivery')).toBeDefined();
    expect(screen.getByText('Como melhorar a entrega da sua pizzaria')).toBeDefined();
  });

  it('abre e fecha o modal de vídeo ao clicar no botão de play', () => {
    render(<ExplicaAiSinglePost post={mockPost} />);

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
