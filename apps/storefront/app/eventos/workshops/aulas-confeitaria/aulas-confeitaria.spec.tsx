/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ConfeitariaWorkshopsPage, { metadata } from './page';

afterEach(() => {
  cleanup();
});

vi.mock('@/lib/api', () => ({
  getEvents: vi.fn().mockResolvedValue([
    {
      id: 'test-workshop-1',
      title: 'Workshop de Confeitaria Teste',
      slug: 'workshop-confeitaria-teste',
      subtitle: 'Aprenda técnicas de bico',
      description: 'Descrição de teste para workshop',
      posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
      eventDateText: '10 de Novembro',
      eventTime: '14h',
      location: 'Centro Técnico Comercial do Norte',
      instructor: 'Chef Teste',
      badge: 'WORKSHOP CONFEITARIA',
      ctaLabel: 'Garantir Vaga',
      ctaUrl: 'https://wa.me/5591983440880',
      status: 'ACTIVE',
      sortOrder: 1,
    },
  ]),
}));

vi.mock('@/lib/storefront/composition-storage', () => ({
  getStorefrontComposition: vi.fn().mockResolvedValue({
    widgets: [
      {
        id: 's15b-workshops-confeitaria',
        type: 'video-articles-carousel',
        enabled: true,
        order: 11,
        props: {
          variant: 'confeitaria',
          title: 'Workshops & Aulas Práticas de Confeitaria',
          subtitle: 'Faça suas compras e ganhe treinamento gratuitamente.',
          viewAllLabel: 'Ver todos',
          viewAllUrl: '/eventos/workshops/aulas-confeitaria',
          mascotImageUrl: '/assets/confeitaria/confeiteira-banner-cutout-trimmed.webp',
          bgImageUrl: '/assets/confeitaria/bg-confeitaria-banner.svg',
          items: [
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
          ],
        },
      },
    ],
  }),
}));

describe('Workshops & Aulas de Confeitaria Page (White Mode)', () => {
  it('has correct SEO metadata', () => {
    expect(metadata.title).toContain('Workshops & Aulas de Confeitaria');
    expect(metadata.alternates?.canonical).toBe('/eventos/workshops/aulas-confeitaria');
  });

  it('renders the top hero identical to the Home Confeitaria section', async () => {
    const Component = await ConfeitariaWorkshopsPage();
    render(Component);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'Workshops & Aulas Práticas de Confeitaria'
    );
    expect(screen.getByText(/Faça suas compras e ganhe/)).toBeDefined();
    expect(screen.getByText('gratuitamente.')).toBeDefined();
    expect(screen.getByText('Técnicas de decoração para bolos e tortas')).toBeDefined();
    expect(screen.getByText('Doces finos e sobremesas para vender')).toBeDefined();
    expect(screen.getAllByAltText('Workshop de Confeitaria').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ver todos').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the confectionery workshop cards with 9:16 poster and single post CTA link', async () => {
    const Component = await ConfeitariaWorkshopsPage();
    render(Component);

    expect(screen.getByText('Workshop de Confeitaria Teste')).toBeDefined();
    expect(screen.getByText(/10 de Novembro/)).toBeDefined();
    expect(screen.getAllByText('Centro Técnico Comercial do Norte').length).toBeGreaterThanOrEqual(1);

    const ctaLinks = screen.getAllByRole('link', { name: /Garantir Vaga/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0].getAttribute('href')).toBe('/evento/workshop/aulas-confeitaria/workshop-confeitaria-teste');
  });

  it('garante que a página de workshops não exibe palestras nem reinaugurações', async () => {
    const Component = await ConfeitariaWorkshopsPage();
    render(Component);

    // Não deve conter categorias de palestras nem reinaugurações
    expect(screen.queryByText(/Palestras/i)).toBeNull();
    expect(screen.queryByText(/Reinaugurações/i)).toBeNull();

    // Deve conter botão de todos os workshops
    expect(screen.getByText('Todos os workshops')).toBeDefined();
  });
});
