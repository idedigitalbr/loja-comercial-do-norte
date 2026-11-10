/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { TestimonialsGridWidget } from './testimonials-grid';
import type { TestimonialItem } from '@/lib/storefront/widget-types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('TestimonialsGridWidget', () => {
  const mockItems: TestimonialItem[] = [
    {
      id: 'rev-1',
      authorName: 'Carlos Eduardo',
      authorHandle: '14 avaliações',
      timeAgo: '1 mês atrás',
      avatarInitials: 'CE',
      avatarColor: '#004CB1',
      rating: 5,
      text: 'Excelente variedade de caixas de pizza e descartáveis.',
    },
    {
      id: 'rev-2',
      authorName: 'Fernanda Souza',
      authorHandle: '8 avaliações',
      timeAgo: '2 semanas atrás',
      avatarInitials: 'FS',
      avatarColor: '#E2091E',
      rating: 5,
      text: 'Sempre compro todas as embalagens para doces e bolos no Comercial do Norte.',
    },
    {
      id: 'rev-3',
      authorName: 'Roberto Mendes',
      authorHandle: '22 avaliações',
      timeAgo: '1 mês atrás',
      avatarInitials: 'RM',
      avatarColor: '#00357B',
      rating: 5,
      text: 'Os preços por fardo compensam muito para quem tem comércio.',
    },
    {
      id: 'rev-4',
      authorName: 'Juliana Lima',
      authorHandle: '11 avaliações',
      timeAgo: '3 semanas atrás',
      avatarInitials: 'JL',
      avatarColor: '#0D9488',
      rating: 5,
      text: 'Encontro tudo para festas e eventos em um só lugar.',
    },
  ];

  it('retorna null se a lista de itens estiver vazia', () => {
    const { container } = render(<TestimonialsGridWidget eyebrow="AVALIAÇÕES" title="Depoimentos" ratingSummary="4.8" totalReviewsLabel="2 mil" items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza o cabeçalho oficial com estrelas, classificação e título', () => {
    render(
      <TestimonialsGridWidget
        eyebrow="AVALIAÇÕES NO GOOGLE"
        title="O que nossos clientes dizem no Google."
        ratingSummary="Classificação 4.8 de 5.0 estrelas"
        totalReviewsLabel="Um bloco com mais de 2 mil avaliações"
        items={mockItems}
      />
    );

    expect(screen.getByText('AVALIAÇÕES NO GOOGLE')).toBeDefined();
    expect(screen.getByText('O que nossos clientes dizem no Google.')).toBeDefined();
    expect(screen.getByText('Classificação 4.8 de 5.0 estrelas')).toBeDefined();
    expect(screen.getByText('Um bloco com mais de 2 mil avaliações')).toBeDefined();
  });

  it('renderiza os containers específicos para mobile (mosaico em 2 linhas) e desktop (grid 5x2)', () => {
    const { container } = render(
      <TestimonialsGridWidget
        eyebrow="AVALIAÇÕES NO GOOGLE"
        title="O que nossos clientes dizem no Google."
        ratingSummary="Classificação 4.8 de 5.0 estrelas"
        totalReviewsLabel="Um bloco com mais de 2 mil avaliações"
        items={mockItems}
      />
    );

    // Container mobile com overflow horizontal e classe sm:hidden
    const mobileContainer = container.querySelector('.sm\\:hidden');
    expect(mobileContainer).toBeDefined();

    const scrollTrack = mobileContainer?.querySelector('[aria-label="Depoimentos do Google em carrossel contínuo móvel"]');
    expect(scrollTrack).toBeDefined();
    expect(scrollTrack?.className).toContain('overflow-x-auto');

    // Container desktop com classe hidden sm:grid
    const desktopGrid = container.querySelector('.hidden.sm\\:grid');
    expect(desktopGrid).toBeDefined();
  });

  it('reage a eventos de toque (touchstart / touchend) e mouse (mousedown / mouseup / hover) sem erros', () => {
    const { container } = render(
      <TestimonialsGridWidget
        eyebrow="AVALIAÇÕES NO GOOGLE"
        title="O que nossos clientes dizem no Google."
        ratingSummary="Classificação 4.8 de 5.0 estrelas"
        totalReviewsLabel="Um bloco com mais de 2 mil avaliações"
        items={mockItems}
      />
    );

    const scrollTrack = container.querySelector('[aria-label="Depoimentos do Google em carrossel contínuo móvel"]');
    expect(scrollTrack).not.toBeNull();

    if (scrollTrack) {
      // Simula toque no mobile
      fireEvent.touchStart(scrollTrack);
      fireEvent.scroll(scrollTrack);
      fireEvent.touchEnd(scrollTrack);

      // Simula mouse e drag no desktop
      fireEvent.mouseEnter(scrollTrack);
      fireEvent.mouseDown(scrollTrack, { pageX: 100 });
      fireEvent.mouseMove(scrollTrack, { pageX: 80 });
      fireEvent.mouseUp(scrollTrack);
      fireEvent.mouseLeave(scrollTrack);
    }
  });

  it('renderiza os valores padrão reais (4.3 e 988 avaliações) e suporta foto com fallback para iniciais', () => {
    const itemWithPhoto: TestimonialItem = {
      id: 'google-review-001',
      authorName: 'Priscilla Vasconcelos',
      authorHandle: 'Local Guide · 17 avaliações',
      timeAgo: '4 semanas atrás',
      avatarInitials: 'PV',
      avatarColor: '#004CB1',
      profilePhotoUrl: 'https://lh3.googleusercontent.com/test-photo.jpg',
      rating: 5,
      text: 'Tem tudo e preço é excelente.',
    };

    const { container } = render(
      <TestimonialsGridWidget
        title="O que nossos clientes dizem no Google."
        items={[itemWithPhoto]}
      />
    );

    // Verifica defaults reais do Google Maps
    expect(screen.getByText('Classificação 4.3 de 5.0 estrelas')).toBeDefined();
    expect(screen.getByText('988 avaliações no Google')).toBeDefined();
    expect(screen.getAllByText('Priscilla Vasconcelos').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tem tudo e preço é excelente/).length).toBeGreaterThan(0);

    // Verifica presença da imagem de perfil
    const imgList = container.querySelectorAll('img[alt="Priscilla Vasconcelos"]');
    expect(imgList.length).toBeGreaterThan(0);
    const firstImg = imgList[0] as HTMLImageElement;
    expect(firstImg?.src).toContain('test-photo.jpg');

    // Simula erro no carregamento da imagem (ex: 403 / CORS) para validar o fallback das iniciais
    fireEvent.error(firstImg);
    expect(screen.getAllByText('PV').length).toBeGreaterThan(0);
  });
});
