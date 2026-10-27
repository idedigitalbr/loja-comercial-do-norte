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
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-05-buffet.jpg',
    linkUrl: '/loja?segmento=restaurante',
    iconType: 'buffet',
  },
  {
    id: 'seg-2',
    prefix: 'Para sua',
    title: 'Confeitaria & Bolos',
    description: 'Bases para bolos, caixas vitrine, forminhas para doces.',
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-06-confeitaria.jpg',
    linkUrl: '/loja?segmento=confeitaria',
    iconType: 'confectionery',
  },
  {
    id: 'seg-3',
    prefix: 'Para sua',
    title: 'Sorveteria & Açaí',
    description: 'Potes térmicos, copos transparentes com tampa bolha.',
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-07-acai.jpg',
    linkUrl: '/loja?segmento=sorveteria',
    iconType: 'icecream',
  },
  {
    id: 'seg-4',
    prefix: 'Para seu',
    title: 'Bar & Distribuidora',
    description: 'Copos chopp e cerveja descartáveis, petisqueiras.',
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-08-sustentaveis.jpg',
    linkUrl: '/loja?segmento=bar',
    iconType: 'bar',
  },
];

describe('SegmentsCarouselWidget', () => {
  it('renderiza o topo em azul escuro e a base transparente sem fundo branco', () => {
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

    // O container externo deve ser transparente e NÃO ter bg-white
    const outerBox = section.querySelector('.bg-transparent');
    expect(outerBox).not.toBeNull();
    expect(outerBox?.className).not.toContain('bg-white');

    // O topo deve ter o fundo azul com gradiente oficial
    const blueHeader = section.querySelector('.rounded-\\[24px\\]');
    expect(blueHeader).not.toBeNull();
    expect(blueHeader?.className).toContain('bg-gradient-to-r');
    expect(blueHeader?.className).toContain('from-[#002868]');

    // Os cards sobrepõem o topo azul com -mt-28
    const carouselWrapper = container.querySelector('.-mt-28');
    expect(carouselWrapper).not.toBeNull();
  });

  it('renderiza os cards com fundo branco para contraste sobre a base transparente', () => {
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

    // Cada card possui bg-white
    const cards = document.querySelectorAll('.group.flex.flex-col');
    expect(cards.length).toBe(4);
    cards.forEach((card) => {
      expect(card.className).toContain('bg-white');
    });
  });
});
