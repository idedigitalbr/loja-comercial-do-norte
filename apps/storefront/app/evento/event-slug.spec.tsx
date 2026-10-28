/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventSinglePost } from '@/components/evento/event-single-post';
import type { ApiEvent } from '@/lib/api';

afterEach(() => {
  cleanup();
});

// Mock Next.js Image e Link
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

const mockEvent: ApiEvent = {
  id: 'event-grande-reinauguracao-loja-pedreira',
  title: 'Grande Reinauguração Loja Pedreira',
  slug: 'grande-reinauguracao-loja-pedreira',
  subtitle: 'Onde tem Comercial do Norte você vende muito mais',
  description:
    'Venha participar da reinauguração da nossa loja na Pedreira! Um novo espaço, mais variedade, promoções exclusivas e um café da manhã especial para clientes e parceiros.',
  posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg',
  eventDateText: '03 de Julho de 2026',
  eventTime: '08h às 14h',
  location: 'Loja Pedreira',
  locationAddress: 'Travessa Mauriti, entre Pedro Miranda e Antônio Everdosa - Pedreira, Belém/PA',
  badge: 'REINAUGURAÇÃO',
  ctaLabel: 'Confirmar Presença',
  ctaUrl: 'https://wa.me/5591983440880',
  status: 'ACTIVE',
  sortOrder: 1,
};

describe('EventSinglePost Component (Pixel-Perfect Spec)', () => {
  it('renderiza o breadcrumb com caminho completo até o evento', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('Início')).toBeDefined();
    expect(screen.getByText('Eventos')).toBeDefined();
    expect(screen.getAllByText('Grande Reinauguração Loja Pedreira').length).toBeGreaterThan(0);
  });

  it('exibe badges de Reinauguração e Evento Presencial', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('REINAUGURAÇÃO')).toBeDefined();
    expect(screen.getByText('Evento Presencial')).toBeDefined();
  });

  it('renderiza metadados principais (data, horário e loja)', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('03 de Julho de 2026')).toBeDefined();
    expect(screen.getByText('08h às 14h')).toBeDefined();
    expect(screen.getAllByText('Loja Pedreira').length).toBeGreaterThan(0);
  });

  it('permite incrementar e decrementar ingressos com limites (1 a 5)', () => {
    render(<EventSinglePost event={mockEvent} />);

    const decBtn = screen.getByLabelText('Diminuir quantidade de ingressos') as HTMLButtonElement;
    const incBtn = screen.getByLabelText('Aumentar quantidade de ingressos') as HTMLButtonElement;

    // Inicialmente 1, dec desabilitado
    expect(screen.getByText('1')).toBeDefined();
    expect(decBtn.disabled).toBe(true);

    // Incrementa para 2
    fireEvent.click(incBtn);
    expect(screen.getByText('2')).toBeDefined();
    expect(decBtn.disabled).toBe(false);

    // Incrementa até 5
    fireEvent.click(incBtn);
    fireEvent.click(incBtn);
    fireEvent.click(incBtn);
    expect(screen.getByText('5')).toBeDefined();
    expect(incBtn.disabled).toBe(true);

    // Decrementa de volta para 4
    fireEvent.click(decBtn);
    expect(screen.getByText('4')).toBeDefined();
  });

  it('gera links corretos de confirmação e dúvidas no WhatsApp', () => {
    render(<EventSinglePost event={mockEvent} />);

    const confirmLink = screen.getByRole('link', { name: /Confirmar Presença/i });
    expect(confirmLink.getAttribute('href')).toContain('wa.me/5591983440880');
    expect(confirmLink.getAttribute('href')).toContain('Grande%20Reinaugura%C3%A7%C3%A3o%20Loja%20Pedreira');

    const doubtLinks = screen.getAllByRole('link', { name: /WhatsApp/i });
    expect(doubtLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('renderiza os 4 cards de destaques com títulos corretos', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('Novos ambientes')).toBeDefined();
    expect(screen.getAllByText('Promoções exclusivas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Café da manhã')).toBeDefined();
    expect(screen.getByText('Especialistas do mercado')).toBeDefined();
  });

  it('renderiza a linha do tempo da Programação', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('Programação')).toBeDefined();
    expect(screen.getByText('08h00')).toBeDefined();
    expect(screen.getByText('Recepção e café da manhã')).toBeDefined();
    expect(screen.getByText('09h00')).toBeDefined();
    expect(screen.getByText('Abertura oficial')).toBeDefined();
    expect(screen.getByText('10h00')).toBeDefined();
    expect(screen.getByText('Demonstração de produtos')).toBeDefined();
    expect(screen.getByText('12h00')).toBeDefined();
    expect(screen.getByText('14h00')).toBeDefined();
    expect(screen.getByText('Encerramento')).toBeDefined();
  });

  it('renderiza o card de Local do Evento com mapa e link do Google Maps', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('Local do Evento')).toBeDefined();
    const gmapsLink = screen.getByRole('link', { name: /Abrir no Google Maps/i });
    expect(gmapsLink.getAttribute('href')).toContain('google.com/maps');
  });

  it('renderiza a seção "O que te espera" com 4 benefícios', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('O que te espera')).toBeDefined();
    expect(screen.getByText('Loja ampliada')).toBeDefined();
    expect(screen.getByText('Sorteios e brindes')).toBeDefined();
    expect(screen.getByText('Atendimento especializado')).toBeDefined();
  });

  it('renderiza a galeria "Veja como foi na última edição" e abre modal no clique', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('Veja como foi na última edição')).toBeDefined();

    // Clica na primeira foto para abrir modal lightbox
    const photoButtons = screen.getAllByRole('button').filter((b) => b.classList.contains('cursor-zoom-in'));
    expect(photoButtons.length).toBe(4);

    fireEvent.click(photoButtons[0]);

    // Modal aberto com botão de fechar
    const closeBtn = screen.getByLabelText('Fechar foto ampliada');
    expect(closeBtn).toBeDefined();

    // Fecha o modal
    fireEvent.click(closeBtn);
    expect(screen.queryByLabelText('Fechar foto ampliada')).toBeNull();
  });

  it('renderiza o banner inferior "Ainda tem dúvidas?"', () => {
    render(<EventSinglePost event={mockEvent} />);

    expect(screen.getByText('Ainda tem dúvidas?')).toBeDefined();
    expect(
      screen.getByText(
        'Fale com nossa equipe pelo WhatsApp e tire todas as suas dúvidas sobre o evento.'
      )
    ).toBeDefined();
    expect(screen.getByRole('link', { name: /Falar no WhatsApp/i })).toBeDefined();
  });
});
