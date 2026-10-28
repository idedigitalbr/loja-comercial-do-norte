/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { VideoArticlesCarouselWidget } from './video-articles-carousel';
import type { VideoArticleItem } from '@/lib/storefront/widget-types';

afterEach(cleanup);

const mockItems: VideoArticleItem[] = [
  {
    id: 'vid-2',
    tags: ['DELIVERY', 'LINHA KRAFT'],
    title: 'Embalagens kraft para o seu delivery',
    paragraphs: [
      'Mais praticidade com embalagens kraft.',
      'Combine formato e resistência.',
      'Valorize a apresentação do seu delivery.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/loja?q=kraft',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
  },
  {
    id: 'vid-3',
    tags: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
    title: 'Copos e tampas para açaí e café',
    paragraphs: [
      'O copo certo faz a diferença.',
      'Combine a tampa com sua bebida.',
      'Evite vazamentos no transporte.',
    ],
    ctaLabel: 'Ver Completo',
    ctaUrl: '/loja?q=copo',
    imageUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
  },
];

describe('VideoArticlesCarouselWidget (Explica Aí Nort)', () => {
  it('renderiza o título oficial "Explica Aí Nort!", subtítulo e link "Ver todos"', () => {
    render(
      <VideoArticlesCarouselWidget
        title="Explica Aí Nort"
        subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
        viewAllLabel="Ver todos"
        viewAllUrl="/loja"
        items={mockItems}
      />
    );

    expect(screen.getByText('Explica Aí')).toBeDefined();
    expect(screen.getByText('Nort!')).toBeDefined();
    expect(
      screen.getByText(/Dicas em vídeos e artigos/)
    ).toBeDefined();
    expect(screen.getByText('Ver todos')).toBeDefined();
  });

  it('renderiza os cards com tags, títulos, parágrafos e botões de ação', () => {
    render(
      <VideoArticlesCarouselWidget
        title="Explica Aí Nort"
        subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
        viewAllLabel="Ver todos"
        viewAllUrl="/loja"
        items={mockItems}
      />
    );

    expect(screen.getByText('DELIVERY')).toBeDefined();
    expect(screen.getByText('LINHA KRAFT')).toBeDefined();
    expect(screen.getByText('Embalagens kraft para o seu delivery')).toBeDefined();
    expect(screen.getByText('Mais praticidade com embalagens kraft.')).toBeDefined();

    expect(screen.getByText('AÇAÍ & CAFÉ')).toBeDefined();
    expect(screen.getByText('Copos e tampas para açaí e café')).toBeDefined();

    const buttons = screen.getAllByText('Ver Completo');
    expect(buttons.length).toBe(2);
  });

  it('exibe o mascote e os botões de navegação circular do carrossel', () => {
    render(
      <VideoArticlesCarouselWidget
        title="Explica Aí Nort"
        subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
        viewAllLabel="Ver todos"
        viewAllUrl="/loja"
        items={mockItems}
      />
    );

    const mascotImages = screen.getAllByAltText('Mascote Explica Aí Nort');
    expect(mascotImages.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByLabelText('Dica anterior')).toBeDefined();
    expect(screen.getByLabelText('Próxima dica')).toBeDefined();
  });

  it('permite ocultar o botão "Ver todos" com showViewAll={false} e renderizar modo fullWidth', () => {
    const { container } = render(
      <VideoArticlesCarouselWidget
        title="Explica Aí Nort"
        subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
        showViewAll={false}
        fullWidth={true}
        items={mockItems}
      />
    );

    expect(screen.queryByText('Ver todos')).toBeNull();
    const section = container.querySelector('section');
    expect(section?.className).toContain('w-full');
    expect(section?.className).toContain('rounded-b-');
  });
});
