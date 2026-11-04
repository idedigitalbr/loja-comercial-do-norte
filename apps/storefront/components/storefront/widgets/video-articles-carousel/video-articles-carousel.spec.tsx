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
    ctaUrl: '/post/embalagens-kraft-para-o-seu-delivery',
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
    ctaUrl: '/post/copos-e-tampas-para-acai-e-cafe',
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
        viewAllUrl="/post"
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
        viewAllUrl="/post"
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
    expect(screen.getByLabelText('Ver conteúdo: Embalagens kraft para o seu delivery').getAttribute('href')).toBe('/post/embalagens-kraft-para-o-seu-delivery');
    expect(buttons[1].closest('a')?.getAttribute('href')).toBe('/post/copos-e-tampas-para-acai-e-cafe');
    expect(screen.getByText('Ver todos').closest('a')?.getAttribute('href')).toBe('/post');
  });

  it('exibe o mascote e os botões de navegação circular do carrossel', () => {
    render(
      <VideoArticlesCarouselWidget
        title="Explica Aí Nort"
        subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
        viewAllLabel="Ver todos"
        viewAllUrl="/post"
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

  it('renderiza o topHeading com destaque sublinhado quando informado', () => {
    render(
      <VideoArticlesCarouselWidget
        items={mockItems}
        topHeading={{ prefix: 'Dicas para sua', highlight: 'Lanchonete' }}
        viewAllLabel="Ver mais"
      />
    );

    expect(screen.getByText(/Dicas para sua/)).toBeDefined();
    expect(screen.getByText('Lanchonete')).toBeDefined();
    expect(screen.getByText('Ver mais')).toBeDefined();
  });

  it('renderiza a variante Confeitaria (Workshops & Aulas Práticas) com título serif, mascote confeiteira e cards temáticos', () => {
    const confeitariaItems: VideoArticleItem[] = [
      {
        id: 'conf-1',
        tags: ['WORKSHOP', 'BOLOS DECORADOS'],
        title: 'Técnicas de decoração para bolos e tortas',
        paragraphs: [
          'Aprenda acabamento, recheio, montagem e apresentação com foco prático.',
        ],
        ctaLabel: 'Ver Completo',
        ctaUrl: '/eventos/workshops/aulas-confeitaria',
        imageUrl: '/assets/confeitaria/card-tecnicas-decoracao.webp',
      },
      {
        id: 'conf-2',
        tags: ['AULA PRÁTICA', 'DOCES FINOS'],
        title: 'Doces finos e sobremesas para vender',
        paragraphs: [
          'Descubra receitas, finalização e embalagem para valorizar sua produção.',
        ],
        ctaLabel: 'Ver Completo',
        ctaUrl: '/eventos/workshops/aulas-confeitaria',
        imageUrl: '/assets/confeitaria/card-doces-finos.webp',
      },
    ];

    render(
      <VideoArticlesCarouselWidget
        variant="confeitaria"
        title="Workshops & Aulas Práticas de Confeitaria"
        subtitle="Faça suas compras e ganhe treinamento gratuitamente."
        viewAllLabel="Ver todos"
        viewAllUrl="/eventos/workshops/aulas-confeitaria"
        items={confeitariaItems}
      />
    );

    expect(screen.getByText(/Workshops &/)).toBeDefined();
    expect(screen.getByText('Aulas Práticas')).toBeDefined();
    expect(screen.getByText('de Confeitaria')).toBeDefined();
    expect(screen.getByText(/Faça suas compras e ganhe/)).toBeDefined();
    expect(screen.getByText('gratuitamente.')).toBeDefined();

    expect(screen.getByText('WORKSHOP')).toBeDefined();
    expect(screen.getByText('BOLOS DECORADOS')).toBeDefined();
    expect(screen.getByText('Técnicas de decoração para bolos e tortas')).toBeDefined();

    expect(screen.getByText('AULA PRÁTICA')).toBeDefined();
    expect(screen.getByText('DOCES FINOS')).toBeDefined();
    expect(screen.getByText('Doces finos e sobremesas para vender')).toBeDefined();

    const confeiteiraImages = screen.getAllByAltText('Workshop de Confeitaria');
    expect(confeiteiraImages.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByLabelText('Workshop anterior')).toBeDefined();
    expect(screen.getByLabelText('Próximo workshop')).toBeDefined();
  });
});