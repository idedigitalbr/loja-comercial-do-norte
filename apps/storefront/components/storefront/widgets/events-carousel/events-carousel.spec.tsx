/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EventsCarouselWidget } from './events-carousel';

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
  });
});
