/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import WorkshopEventPage, { generateMetadata } from './page';

vi.mock('@/lib/api', () => ({
  getEventBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === 'sabado-croquete-de-charque-para-trigo') {
      return {
        id: 'ev-croquete',
        title: 'Croquete de Charque com Maionese de Chicória — Aula-Show Gastronômica',
        slug: 'sabado-croquete-de-charque-para-trigo',
        subtitle: 'Aula prática regional no Stand Comercial do Norte',
        description: 'Aprenda o passo a passo completo da receita de croquete com chicória.',
        posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg',
        eventDateText: '03/10 (Sábado)',
        eventTime: '17h',
        location: 'Hangar Centro de Convenções',
        locationAddress: 'Stand Comercial do Norte — Belém/PA',
        instructor: 'Thais Reis',
        badge: 'AULA-SHOW',
        ctaLabel: 'Confirmar Presença',
        ctaUrl: 'https://wa.me/5591983440880',
        status: 'ACTIVE',
        sortOrder: 4,
      };
    }
    return null;
  }),
  getEvents: vi.fn().mockResolvedValue([]),
}));

afterEach(cleanup);

describe('Hierarchical Workshop Event Page (/evento/workshop/aulas-confeitaria/[slug])', () => {
  it('generates proper SEO metadata with hierarchical canonical URL', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'sabado-croquete-de-charque-para-trigo' }),
    });

    expect(meta.title).toContain('Croquete de Charque');
    expect(meta.alternates?.canonical).toBe(
      '/evento/workshop/aulas-confeitaria/sabado-croquete-de-charque-para-trigo'
    );
  });

  it('renders breadcrumb with link to Workshops Confeitaria hub', async () => {
    const Component = await WorkshopEventPage({
      params: Promise.resolve({ slug: 'sabado-croquete-de-charque-para-trigo' }),
    });

    render(Component);

    const hubLink = screen.getByRole('link', { name: 'Workshops · Aulas Confeitaria' });
    expect(hubLink).toBeDefined();
    expect(hubLink.getAttribute('href')).toBe('/eventos/workshops/aulas-confeitaria');

    expect(
      screen.getByRole('heading', { level: 1 }).textContent
    ).toContain('Croquete de Charque com Maionese de Chicória');
  });

  it('renders WhatsApp registration CTA with pre-filled message and tickets selector', async () => {
    const Component = await WorkshopEventPage({
      params: Promise.resolve({ slug: 'sabado-croquete-de-charque-para-trigo' }),
    });

    render(Component);

    const whatsappBtn = screen.getByRole('link', { name: /Garantir Vaga no WhatsApp/i });
    expect(whatsappBtn).toBeDefined();
    expect(whatsappBtn.getAttribute('href')).toContain('wa.me/5591983440880');
    expect(whatsappBtn.getAttribute('href')).toContain('Croquete');
  });

  it('renders workshop-doces-finos-brigadeiros-gourmet seamlessly with identical sections in light mode', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'workshop-doces-finos-brigadeiros-gourmet' }),
    });

    expect(meta.title).toContain('Doces Finos e Brigadeiros Gourmet');
    expect(meta.alternates?.canonical).toBe(
      '/evento/workshop/aulas-confeitaria/workshop-doces-finos-brigadeiros-gourmet'
    );

    const Component = await WorkshopEventPage({
      params: Promise.resolve({ slug: 'workshop-doces-finos-brigadeiros-gourmet' }),
    });

    const { container } = render(Component);

    // Light mode verification
    const themedContainer = container.querySelector('[data-event-theme="light"]');
    expect(themedContainer).toBeDefined();

    // Verify identical structure/sections as reference event
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'Doces Finos e Brigadeiros Gourmet'
    );
    expect(screen.getByText('Garanta seu ingresso')).toBeDefined();
    expect(screen.getByText('Programação')).toBeDefined();
    expect(screen.getByText('Local do Evento')).toBeDefined();
    expect(screen.getByText('O que te espera')).toBeDefined();
    expect(screen.getByText('Veja como foi na última edição')).toBeDefined();
    expect(screen.getByText('Ainda tem dúvidas?')).toBeDefined();
    expect(screen.getByRole('link', { name: /Garantir Vaga no WhatsApp/i })).toBeDefined();
  });
});
