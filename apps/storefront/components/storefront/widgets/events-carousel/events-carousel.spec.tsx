/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { EventsCarouselWidget } from './events-carousel';

afterEach(() => {
  cleanup();
});

// Mock Elementor Context
vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
  }),
}));

describe('EventsCarouselWidget', () => {
  const mockItems = [
    {
      id: 'event-1',
      title: 'Festival da Pizza',
      imageUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-cartaz-01-pizza.webp',
      linkUrl: '/loja?q=pizza',
    },
    {
      id: 'event-2',
      title: 'Festival do Hambúrguer',
      imageUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-cartaz-02-hamburguer.webp',
      linkUrl: '/loja?q=burger',
    },
  ];

  it('renderiza com fundo full largura e bordas arredondadas nos cantos', () => {
    const { container } = render(
      <EventsCarouselWidget
        items={mockItems}
        subtitle="Tudo que acontece no Comercial do Norte"
        title="Nossos Eventos"
        ctaLabel="Ver todos"
        ctaUrl="/loja"
      />
    );

    const section = container.querySelector('section');
    expect(section).toBeDefined();
    expect(section?.className).toContain('w-full');

    const backgroundContainer = section?.firstElementChild;
    expect(backgroundContainer?.className).toContain('w-full');
    expect(backgroundContainer?.className).toContain('rounded-[24px]');
    expect(backgroundContainer?.className).toContain('sm:rounded-[36px]');
    expect(backgroundContainer?.className).toContain('bg-[#060709]');

    const contentContainer = backgroundContainer?.querySelector('.cn-container');
    expect(contentContainer).toBeDefined();

    expect(screen.getByText('Nossos Eventos')).toBeDefined();
    expect(screen.getByText('Tudo que acontece no Comercial do Norte')).toBeDefined();
    expect(screen.getByText('Ver todos')).toBeDefined();
    const ctaLink = screen.getByRole('link', { name: /ver todos/i });
    expect(ctaLink.getAttribute('href')).toBe('/loja');
  });

  it('renderiza o texto padrão "Ver todos os eventos" e fallback para "/eventos"', () => {
    render(
      <EventsCarouselWidget
        items={mockItems}
        subtitle="Tudo que acontece no Comercial do Norte"
        title="Nossos Eventos"
      />
    );

    expect(screen.getByText('Ver todos os eventos')).toBeDefined();
    const ctaLink = screen.getByRole('link', { name: /ver todos os eventos/i });
    expect(ctaLink.getAttribute('href')).toBe('/eventos');
  });

  it('renderiza o cabeçalho centralizado no mobile e os cards em linha horizontal única com largura proporcional', () => {
    const { container } = render(
      <EventsCarouselWidget
        items={mockItems}
        subtitle="Tudo que acontece no Comercial do Norte"
        title="Nossos Eventos"
      />
    );

    // Header centralizado no mobile
    const header = container.querySelector('.mb-8');
    expect(header?.className).toContain('items-center');
    expect(header?.className).toContain('text-center');

    // Linha horizontal mobile com largura ~42% para exibir 2 cards + pedaço do 3º
    const mobileContainer = container.querySelector('.lg\\:hidden');
    expect(mobileContainer).toBeDefined();

    const mobileTrack = mobileContainer?.querySelector('.overflow-x-auto');
    expect(mobileTrack).toBeDefined();

    const mobileCardWrappers = mobileContainer?.querySelectorAll('.snap-start');
    expect(mobileCardWrappers?.length).toBe(mockItems.length);
    expect(mobileCardWrappers?.[0].className).toContain('w-[42%]');
  });
});
