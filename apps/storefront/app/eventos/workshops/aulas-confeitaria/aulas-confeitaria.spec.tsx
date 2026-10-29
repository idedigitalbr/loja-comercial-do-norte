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

describe('Workshops & Aulas de Confeitaria Page (White Mode)', () => {
  it('has correct SEO metadata', () => {
    expect(metadata.title).toContain('Workshops & Aulas de Confeitaria');
    expect(metadata.alternates?.canonical).toBe('/eventos/workshops/aulas-confeitaria');
  });

  it('renders the white mode header, official badge, and benefits', async () => {
    const Component = await ConfeitariaWorkshopsPage();
    render(Component);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'Workshops & Aulas Práticas de Confeitaria'
    );
    expect(screen.getByText('AULAS CONFEITARIA')).toBeDefined();
    expect(screen.getByText('100% Prático')).toBeDefined();
    expect(screen.getByText('Certificado')).toBeDefined();
    expect(screen.getByText('Insumos Inclusos')).toBeDefined();
  });

  it('renders the confectionery workshop cards with 9:16 poster and whatsapp CTA', async () => {
    const Component = await ConfeitariaWorkshopsPage();
    render(Component);

    expect(screen.getByText('Workshop de Confeitaria Teste')).toBeDefined();
    expect(screen.getByText(/10 de Novembro/)).toBeDefined();
    expect(screen.getAllByText('Centro Técnico Comercial do Norte').length).toBeGreaterThanOrEqual(1);

    const ctaLinks = screen.getAllByRole('link', { name: /Garantir Vaga/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
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
