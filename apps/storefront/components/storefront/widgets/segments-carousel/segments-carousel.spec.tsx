/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { SegmentsCarouselWidget } from './segments-carousel';
import type { SegmentCardItem } from '@/lib/storefront/widget-types';

vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
  }),
}));

afterEach(cleanup);

const mockItems: SegmentCardItem[] = [
  {
    id: 'seg-1',
    prefix: 'Para seu',
    title: 'Restaurante & Buffet',
    description: 'Marmitas térmicas, travessas de alumínio e talheres descartáveis.',
    imageUrl: '/assets/HOME Vitrine/S8-SEGMENTOS/1-restaurante.webp',
    linkUrl: '/loja?segmento=restaurante',
    iconType: 'buffet',
  },
  {
    id: 'seg-2',
    prefix: 'Para sua',
    title: 'Confeitaria & Bolos',
    description: 'Bases para bolos, caixas vitrine, forminhas para doces.',
    imageUrl: '/assets/HOME Vitrine/S8-SEGMENTOS/2-confeitaria.webp',
    linkUrl: '/loja?segmento=confeitaria',
    iconType: 'confectionery',
  },
  {
    id: 'seg-3',
    prefix: 'Para sua',
    title: 'Sorveteria & Açaí',
    description: 'Potes térmicos, copos transparentes com tampa bolha.',
    imageUrl: '/assets/HOME Vitrine/S8-SEGMENTOS/3-sorveteria.webp',
    linkUrl: '/loja?segmento=sorveteria',
    iconType: 'icecream',
  },
  {
    id: 'seg-4',
    prefix: 'Para seu',
    title: 'Bar & Distribuidora',
    description: 'Copos chopp e cerveja descartáveis, petisqueiras.',
    imageUrl: '/assets/HOME Vitrine/S8-SEGMENTOS/4-bar.webp',
    linkUrl: '/loja?segmento=bar',
    iconType: 'bar',
  },
];

describe('SegmentsCarouselWidget', () => {
  it('renderiza o container com fundo unificado azul escuro sem corte branco inferior', () => {
    const { container } = render(
      <SegmentsCarouselWidget
        title="Tudo para todos os negócios"
        subtitle="Para todos os tamanhos!"
        ctaLabel="Ver todos os segmentos"
        ctaUrl="/loja"
        items={mockItems}
      />
    );

    const section = screen.getByRole('region', { name: 'Tudo para todos os negócios' });
    expect(section).toBeDefined();

    // O container principal deve ter o gradiente azul unificado e NÃO bg-white
    const mainBox = section.querySelector('.rounded-\\[24px\\]');
    expect(mainBox).not.toBeNull();
    expect(mainBox?.className).toContain('bg-gradient-to-r');
    expect(mainBox?.className).toContain('from-[#002868]');
    expect(mainBox?.className).not.toContain('bg-white');

    // Não deve existir a divisão com pb-36 e -mt-28
    expect(container.querySelector('.pb-36')).toBeNull();
    expect(container.querySelector('.-mt-28')).toBeNull();
  });

  it('renderiza os cards com fundo branco para contraste máximo sobre o fundo azul', () => {
    render(
      <SegmentsCarouselWidget
        title="Tudo para todos os negócios"
        subtitle="Para todos os tamanhos!"
        ctaLabel="Ver todos os segmentos"
        ctaUrl="/loja"
        items={mockItems}
      />
    );

    expect(screen.getByText('Restaurante & Buffet')).toBeDefined();
    expect(screen.getByText('Confeitaria & Bolos')).toBeDefined();
    expect(screen.getByText('Sorveteria & Açaí')).toBeDefined();
    expect(screen.getByText('Bar & Distribuidora')).toBeDefined();

    // Cada card deve ter bg-white
    const cards = document.querySelectorAll('.group.flex.flex-col');
    expect(cards.length).toBe(4);
    cards.forEach((card) => {
      expect(card.className).toContain('bg-white');
    });
  });
});
