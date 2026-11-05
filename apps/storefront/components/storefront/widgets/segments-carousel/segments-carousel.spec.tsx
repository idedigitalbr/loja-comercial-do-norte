/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    id: 'seg-buffet',
    prefix: 'Para seu',
    title: 'Restaurante & Buffet',
    description: 'Marmitas térmicas, travessas de alumínio e talheres descartáveis.',
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-05-buffet.jpg',
    linkUrl: '/segmento/restaurante-buffet',
    iconType: 'buffet',
  },
  {
    id: 'seg-confeitaria',
    prefix: 'Para sua',
    title: 'Confeitaria & Bolos',
    description: 'Bases para bolos, caixas vitrine, forminhas para doces.',
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-06-confeitaria.jpg',
    linkUrl: '/segmento/confeitaria-bolos',
    iconType: 'confectionery',
  },
  {
    id: 'seg-sorveteria',
    prefix: 'Para sua',
    title: 'Sorveteria & Açaí',
    description: 'Potes térmicos, copos transparentes com tampa bolha.',
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-07-acai.jpg',
    linkUrl: '/segmento/sorveteria-acai',
    iconType: 'icecream',
  },
  {
    id: 'seg-bar',
    prefix: 'Para seu',
    title: 'Bar & Distribuidora',
    description: 'Copos chopp e cerveja descartáveis, petisqueiras.',
    imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-08-sustentaveis.jpg',
    linkUrl: '/segmento/bar-distribuidora',
    iconType: 'bar',
  },
];

describe('SegmentsCarouselWidget', () => {
  it('renderiza com os valores padrão corretos', () => {
    render(<SegmentsCarouselWidget items={mockItems} />);

    expect(screen.getByRole('region', { name: 'Para todos os Negócios' })).toBeDefined();
    expect(screen.getByText('Para todos os Negócios')).toBeDefined();
    expect(screen.getByText('De todos os tamanhos')).toBeDefined();
    expect(screen.getByText('Ver todos os segmentos')).toBeDefined();
  });

  it('renderiza o topo em azul escuro e a base transparente sem fundo branco', () => {
    const { container } = render(
      <SegmentsCarouselWidget
        title="Para todos os Negócios"
        subtitle="De todos os tamanhos"
        ctaLabel="Ver todos os segmentos"
        ctaUrl="/loja"
        items={mockItems}
      />
    );

    const section = screen.getByRole('region', { name: 'Para todos os Negócios' });
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

    // Os cards sobrepõem o topo azul no desktop com sm:-mt-28
    const carouselWrapper = container.querySelector('.sm\\:-mt-28, .-mt-28');
    expect(carouselWrapper).not.toBeNull();
  });

  it('renderiza os cards com fundo branco para contraste sobre a base transparente', () => {
    render(
      <SegmentsCarouselWidget
        title="Para todos os Negócios"
        subtitle="De todos os tamanhos"
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

    // O título e a imagem direcionam para /segmento/...
    const buffetLink = screen.getByText('Restaurante & Buffet').closest('a');
    expect(buffetLink?.getAttribute('href')).toBe('/segmento/restaurante-buffet');
  });

  it('normaliza URLs legadas com q=padaria para /segmento/padaria', () => {
    const legacyItem = {
      id: 'seg-padaria',
      prefix: 'Para sua',
      title: 'Padaria',
      description: 'Embalagens e formas.',
      imageUrl: '/assets/padaria.jpg',
      linkUrl: '/loja?q=padaria',
      iconType: 'bakery' as const,
    };

    render(
      <SegmentsCarouselWidget
        items={[legacyItem]}
        title="Para todos os Negócios"
      />
    );

    const padariaLink = screen.getByText('Padaria').closest('a');
    expect(padariaLink?.getAttribute('href')).toBe('/segmento/padaria');
  });

  it('renderiza card de Delivery com prefixo "Para" e resolve URL corretamente', () => {
    const deliveryItem = {
      id: 'seg-delivery',
      prefix: 'Para',
      title: 'Delivery',
      description: 'Sacolas kraft, lacres invioláveis e embalagens térmicas.',
      imageUrl: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-09-delivery.jpg',
      linkUrl: '/segmento/delivery',
      iconType: 'delivery' as const,
    };

    render(
      <SegmentsCarouselWidget
        items={[deliveryItem]}
        title="Para todos os Negócios"
      />
    );

    expect(screen.getByText('Delivery')).toBeDefined();
    expect(screen.getByText('Para')).toBeDefined();
    const deliveryLink = screen.getByText('Delivery').closest('a');
    expect(deliveryLink?.getAttribute('href')).toBe('/segmento/delivery');
  });

  it('ativa carrossel infinito passando de 1 em 1 quando há mais de 4 itens', () => {
    const nineItems: SegmentCardItem[] = [
      ...mockItems,
      {
        id: 'seg-delivery',
        prefix: 'Para',
        title: 'Delivery',
        description: 'Sacolas kraft.',
        imageUrl: '/assets/delivery.jpg',
        linkUrl: '/segmento/delivery',
        iconType: 'delivery',
      },
      {
        id: 'seg-lanchonete',
        prefix: 'Para',
        title: 'Lanchonete',
        description: 'Copos e embalagens.',
        imageUrl: '/assets/lanchonete.jpg',
        linkUrl: '/segmento/lanchonete',
        iconType: 'burger',
      },
      {
        id: 'seg-pizzaria',
        prefix: 'Para',
        title: 'Pizzaria',
        description: 'Caixas oitavadas.',
        imageUrl: '/assets/pizzaria.jpg',
        linkUrl: '/segmento/pizzaria',
        iconType: 'pizza',
      },
      {
        id: 'seg-festas',
        prefix: 'Para',
        title: 'Festas',
        description: 'Balões e descartáveis.',
        imageUrl: '/assets/festas.jpg',
        linkUrl: '/segmento/loja-de-festas',
        iconType: 'party',
      },
      {
        id: 'seg-padaria-2',
        prefix: 'Para',
        title: 'Padaria Especial',
        description: 'Sacos de papel.',
        imageUrl: '/assets/padaria.jpg',
        linkUrl: '/segmento/padaria',
        iconType: 'bakery',
      },
    ];

    const { container } = render(
      <SegmentsCarouselWidget items={nineItems} autoplayIntervalMs={0} />
    );

    // Deve exibir botões de navegação
    const prevBtn = screen.getByRole('button', { name: 'Segmento anterior' });
    const nextBtn = screen.getByRole('button', { name: 'Próximo segmento' });
    expect(prevBtn).toBeDefined();
    expect(nextBtn).toBeDefined();

    // Deve renderizar indicadores para cada um dos 9 itens
    const dots = screen.getAllByRole('button', { name: /Segmento \d+/ });
    expect(dots.length).toBe(9);

    // O track flexível deve usar a translação baseada em passo de 1 card
    const track = container.querySelector('[style*="translateX"]');
    expect(track).not.toBeNull();
    expect(track?.getAttribute('style')).toContain('var(--card-step)');
  });

  it('renderiza o botão "Assista nosso vídeo" e o mascote Nort visível no mobile e desktop', () => {
    render(<SegmentsCarouselWidget items={mockItems} />);

    expect(screen.getByRole('button', { name: 'Assista nosso vídeo' })).toBeDefined();
    expect(screen.getByText('Assista nosso vídeo')).toBeDefined();

    const mascotImg = screen.getByAltText(/Nort — Veja os produtos para seu segmento/i);
    expect(mascotImg).toBeDefined();

    // Garante que o mascote NÃO fica oculto no mobile (sem hidden sm:flex)
    const mascotContainer = screen.getByTestId('segments-nort-mascot');
    expect(mascotContainer).toBeDefined();
    expect(mascotContainer.className).not.toContain('hidden');
    expect(mascotContainer.className).toContain('flex');

    // Garante que no mobile o mascote não é cortado com margens negativas excessivas
    expect(mascotContainer.className).not.toContain('-mb-16');
    expect(mascotContainer.className).not.toContain('-mb-20');
  });

  it('renderiza o cabeçalho superior centralizado no mobile com mascote posicionado próximo aos cards', () => {
    const { container } = render(<SegmentsCarouselWidget items={mockItems} />);

    // Header centralizado no mobile
    const headerRow = container.querySelector('.relative.z-20.flex.flex-col');
    expect(headerRow?.className).toContain('items-center');
    expect(headerRow?.className).toContain('text-center');

    // Traço vermelho centralizado com mx-auto
    const redBar = container.querySelector('.bg-\\[\\#E2091E\\].h-1');
    expect(redBar?.className).toContain('mx-auto');

    // Botão CTA centralizado com self-center
    const ctaBtn = screen.getByRole('link', { name: /ver todos os segmentos/i });
    expect(ctaBtn.className).toContain('self-center');

    // Mascote desce um pouco mais com -mb-4
    const mascot = screen.getByTestId('segments-nort-mascot');
    expect(mascot.className).toContain('-mb-4');
  });

  it('dispara o evento para abrir o player de vídeo institucional em tela cheia ao clicar no botão', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    render(<SegmentsCarouselWidget items={mockItems} />);

    const videoBtn = screen.getByRole('button', { name: 'Assista nosso vídeo' });
    fireEvent.click(videoBtn);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'open-nort-intro-video' })
    );
  });
});
