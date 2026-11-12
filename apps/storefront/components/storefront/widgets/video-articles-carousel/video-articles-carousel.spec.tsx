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

    // Garante que não há player de vídeo no título
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.querySelector('svg')).toBeNull();
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

  it('exibe botões de navegação, paginação em bolinhas e mascote integrado no mobile (Anexo 2)', () => {
    const { container } = render(
      <VideoArticlesCarouselWidget
        title="Explica Aí Nort"
        subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
        viewAllLabel="Ver todos"
        viewAllUrl="/post"
        items={mockItems}
      />
    );

    // Botões de navegação circulares visíveis no mobile (sem hidden)
    const prevButton = screen.getByLabelText('Dica anterior');
    expect(prevButton.className).toContain('flex');
    expect(prevButton.className).not.toContain('hidden');

    const nextButton = screen.getByLabelText('Próxima dica');
    expect(nextButton.className).toContain('flex');
    expect(nextButton.className).not.toContain('hidden');

    // Mascote 3D integrado na primeira coluna do grid mobile
    const mascotImg = screen.getAllByAltText('Mascote Explica Aí Nort')[0];
    expect(mascotImg).toBeDefined();

    // Bolinhas / barras de paginação no mobile (Anexo 2)
    const pagination = screen.getByRole('tablist', { name: 'Paginação de dicas' });
    expect(pagination).toBeDefined();
    const dots = screen.getAllByRole('tab');
    expect(dots.length).toBe(mockItems.length);

    // Botão "Ver todos" em formato de pílula contornada
    const viewAllLink = screen.getByText('Ver todos').closest('a');
    expect(viewAllLink?.className).toContain('rounded-full');
    expect(viewAllLink?.className).toContain('border-2');
  });

  it('garante que a Confeitaria no mobile tem layout fiel ao Anexo 2: título à esquerda com play, confeiteira à direita, setas e paginação', () => {
    const confeitariaItems: VideoArticleItem[] = [
      {
        id: 'conf-1',
        tags: ['WORKSHOP', 'BOLOS DECORADOS'],
        title: 'Técnicas de decoração para bolos e tortas',
        paragraphs: ['Aprenda acabamento, recheio e montagem.'],
        ctaLabel: 'Ver Completo',
        ctaUrl: '/eventos/workshops/aulas-confeitaria',
        imageUrl: '/assets/confeitaria/card-tecnicas-decoracao.webp',
      },
      {
        id: 'conf-2',
        tags: ['AULA PRÁTICA', 'DOCES FINOS'],
        title: 'Doces finos e sobremesas para vender',
        paragraphs: ['Descubra receitas e embalagens.'],
        ctaLabel: 'Ver Completo',
        ctaUrl: '/eventos/workshops/aulas-confeitaria',
        imageUrl: '/assets/confeitaria/card-doces-finos.webp',
      },
      {
        id: 'conf-3',
        tags: ['AULA SHOW', 'BRIGADEIROS'],
        title: 'Brigadeiros gourmet para festas',
        paragraphs: ['Ponto de enrolar e texturas aveludadas.'],
        ctaLabel: 'Ver Completo',
        ctaUrl: '/eventos/workshops/aulas-confeitaria',
        imageUrl: '/assets/confeitaria/01-listagem-eventos/04-card-brigadeiros-gourmet.jpg',
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

    // Ícone de Play no título da Confeitaria
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.querySelector('svg.lucide-play')).not.toBeNull();

    // Setas visíveis no mobile (sem hidden)
    const prevButton = screen.getByLabelText('Workshop anterior');
    expect(prevButton.className).toContain('flex');
    expect(prevButton.className).not.toContain('hidden');

    const nextButton = screen.getByLabelText('Próximo workshop');
    expect(nextButton.className).toContain('flex');
    expect(nextButton.className).not.toContain('hidden');

    // Paginação com 3 bolinhas para Confeitaria
    const pagination = screen.getByRole('tablist', { name: 'Paginação de workshops' });
    expect(pagination).toBeDefined();
    const dots = screen.getAllByRole('tab');
    expect(dots.length).toBe(3);
    // A primeira bolinha ativa deve ter a cor rosa (#e26678)
    expect(dots[0].className).toContain('bg-[#e26678]');

    // Confeiteira presente tanto na versão mobile quanto desktop
    const confeiteiras = screen.getAllByAltText('Workshop de Confeitaria');
    expect(confeiteiras.length).toBe(2);
  });

  it('garante que o wrapper do cabeçalho possui lg:static no desktop para evitar corte de texto e colapso de altura dos mascotes', () => {
    const { container: explicaContainer } = render(
      <VideoArticlesCarouselWidget
        title="Explica Aí Nort"
        subtitle="Dicas em vídeos e artigos para você usar no seu negócio."
        items={mockItems}
      />
    );

    // O container do header do Explica Aí deve ter lg:static
    const explicaHeading = screen.getByRole('heading', { level: 2 });
    const explicaWrapper = explicaHeading.closest('div.grid');
    expect(explicaWrapper?.className).toContain('lg:static');

    // O mascote desktop do Explica Aí deve ter classes de posicionamento absoluto relativas ao banner
    const mascotImgs = screen.getAllByAltText('Mascote Explica Aí Nort');
    expect(mascotImgs.length).toBeGreaterThanOrEqual(1);

    const { container: confContainer } = render(
      <VideoArticlesCarouselWidget
        variant="confeitaria"
        title="Workshops & Aulas Práticas de Confeitaria"
        subtitle="Faça suas compras e ganhe treinamento gratuitamente."
        items={mockItems}
      />
    );

    // O container do header de Confeitaria deve ter lg:static
    const confHeading = confContainer.querySelector('h2');
    const confWrapper = confHeading?.parentElement?.parentElement;
    expect(confWrapper?.className).toContain('lg:static');
  });

  it('usa os eventos reais de contextData.events na variante Confeitaria substituindo placeholders', () => {
    render(
      <VideoArticlesCarouselWidget
        variant="confeitaria"
        title="Workshops & Aulas Práticas de Confeitaria"
        subtitle="Faça suas compras e ganhe treinamento gratuitamente."
        viewAllLabel="Ver todos"
        viewAllUrl="/eventos/workshops/aulas-confeitaria"
        contextData={{
          categories: [],
          brands: [],
          offers: [],
          products: [],
          events: [
            {
              id: 'ev-real-1',
              title: 'Doces Finos e Brigadeiros Gourmet',
              slug: 'workshop-doces-finos-brigadeiros-gourmet',
              subtitle: 'Técnicas de ponto perfeito e embalagens de luxo.',
              description: 'Descrição completa',
              posterUrl: '/assets/confeitaria/01-listagem-eventos/04-card-brigadeiros-gourmet.jpg',
              eventDateText: '18 de Novembro',
              badge: 'WORKSHOP',
              status: 'ACTIVE',
              sortOrder: 1,
            },
          ],
        }}
        items={mockItems}
      />
    );

    expect(screen.getByText('Doces Finos e Brigadeiros Gourmet')).toBeDefined();
    expect(screen.getByText('18 de Novembro')).toBeDefined();
    expect(screen.queryByText('Embalagens kraft para o seu delivery')).toBeNull();
    expect(screen.getByRole('link', { name: 'Ver Completo' }).getAttribute('href')).toBe(
      '/evento/workshop/aulas-confeitaria/workshop-doces-finos-brigadeiros-gourmet'
    );
  });
});