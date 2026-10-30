/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventsView } from '@/components/evento/events-view';
import EventsPage from './page';
import { CANONICAL_EVENTS } from '@/lib/events-data';

afterEach(() => {
  cleanup();
});

// Mock Next.js Image e Link
vi.mock('next/image', () => ({
  default: ({ alt, src, className }: { alt: string; src: string; className?: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
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

describe('EventsView Component (Pixel-Perfect Spec)', () => {
  it('renderiza o Hero Banner com breadcrumb, eyebrow, título, subtítulo e os 3 pilares', () => {
    render(<EventsView initialEvents={CANONICAL_EVENTS} />);

    // Breadcrumb
    expect(screen.getByText('Início')).toBeDefined();
    expect(screen.getByText('Eventos')).toBeDefined();

    // Eyebrow e Headline
    expect(screen.getByText('Nossos Eventos')).toBeDefined();
    expect(screen.getByText(/Aprenda, conecte-se e/i)).toBeDefined();
    expect(screen.getByText(/faça seu negócio crescer/i)).toBeDefined();

    // 3 Pilares
    expect(screen.getAllByText(/Especialistas/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Conteúdo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Networking/i).length).toBeGreaterThan(0);

    // Imagem do Hero no topo
    const heroImg = screen.getByAltText('Eventos e Capacitação Comercial do Norte');
    expect(heroImg).toBeDefined();
    expect(heroImg.getAttribute('src')).toBe('/assets/evento/hero-eventos.png');
  });

  it('renderiza as 5 categorias de filtro com contadores corretos', () => {
    render(<EventsView initialEvents={CANONICAL_EVENTS} />);

    expect(screen.getByText('Todos os eventos')).toBeDefined();
    expect(screen.getByText(/Workshops \(3\)/i)).toBeDefined();
    expect(screen.getByText(/Aulas-show \(2\)/i)).toBeDefined();
    expect(screen.getByText(/Palestras \(2\)/i)).toBeDefined();
    expect(screen.getByText(/Reinaugurações \(1\)/i)).toBeDefined();
  });

  it('renderiza os 8 cartões canônicos com títulos, datas e locais', () => {
    render(<EventsView initialEvents={CANONICAL_EVENTS} />);

    expect(screen.getByText('Encontro de Empreendedores')).toBeDefined();
    expect(screen.getByText('Grande Reinauguração Loja Pedreira')).toBeDefined();
    expect(screen.getByText('Workshop de Confeitaria Profissional')).toBeDefined();
    expect(screen.getByText('Croquete de Charque com Maionese de Chicória')).toBeDefined();
    expect(screen.getByText('Doces e Bolos para o seu Negócio')).toBeDefined();
    expect(screen.getByText('Bebidas para seu Negócio')).toBeDefined();
    expect(screen.getByText('Soluções em Embalagens para Delivery')).toBeDefined();
    expect(screen.getByText('Gestão e Crescimento para Pequenos Negócios')).toBeDefined();

    // Metadados
    expect(screen.getByText('31 de Agosto')).toBeDefined();
    expect(screen.getByText('03 de Julho')).toBeDefined();
    expect(screen.getByText('19h30')).toBeDefined();

    // Botões dos cards devem apontar para o Single Post (/evento/[slug]) e não para WhatsApp/externo
    const empreendedoresCta = screen.getByRole('link', { name: /Garantir Vaga/i });
    expect(empreendedoresCta.getAttribute('href')).toBe('/evento/encontro-de-empreendedores');

    const pedreiraCta = screen.getByRole('link', { name: /Ver Como Chegar/i });
    expect(pedreiraCta.getAttribute('href')).toBe('/evento/grande-reinauguracao-loja-pedreira');
  });

  it('filtra por categoria ao clicar nas pills', () => {
    render(<EventsView initialEvents={CANONICAL_EVENTS} />);

    const workshopsBtn = screen.getByText(/Workshops \(3\)/i);
    fireEvent.click(workshopsBtn);

    // Deve exibir workshops
    expect(screen.getByText('Workshop de Confeitaria Profissional')).toBeDefined();
    expect(screen.getByText('Doces e Bolos para o seu Negócio')).toBeDefined();
    expect(screen.getByText('Soluções em Embalagens para Delivery')).toBeDefined();

    // Não deve exibir outros
    expect(screen.queryByText('Encontro de Empreendedores')).toBeNull();
    expect(screen.queryByText('Grande Reinauguração Loja Pedreira')).toBeNull();
  });

  it('filtra por texto no campo de busca de eventos', () => {
    render(<EventsView initialEvents={CANONICAL_EVENTS} />);

    const searchInput = screen.getByPlaceholderText('Buscar evento...');
    fireEvent.change(searchInput, { target: { value: 'Croquete' } });

    expect(screen.getByText('Croquete de Charque com Maionese de Chicória')).toBeDefined();
    expect(screen.queryByText('Encontro de Empreendedores')).toBeNull();
    expect(screen.queryByText('Grande Reinauguração Loja Pedreira')).toBeNull();
  });

  it('exibe estado vazio e botão de reset quando nada é encontrado', () => {
    render(<EventsView initialEvents={CANONICAL_EVENTS} />);

    const searchInput = screen.getByPlaceholderText('Buscar evento...');
    fireEvent.change(searchInput, { target: { value: 'termoinexistente123' } });

    expect(screen.getByText('Nenhum evento encontrado')).toBeDefined();
    const resetBtn = screen.getByText('Ver todos os eventos');
    expect(resetBtn).toBeDefined();

    // Clica no botão de reset e restaura os eventos
    fireEvent.click(resetBtn);
    expect(screen.getByText('Encontro de Empreendedores')).toBeDefined();
  });

  it('garante que a página principal /eventos remove workshops e aulas, exibindo apenas eventos gerais', async () => {
    const Component = await EventsPage();
    render(Component);

    // Não deve conter categorias de workshops nem aulas
    expect(screen.queryByText(/Workshops \(/i)).toBeNull();
    expect(screen.queryByText(/Aulas-show \(/i)).toBeNull();

    // Deve conter categorias institucionais gerais
    expect(screen.getByText('Todos os eventos')).toBeDefined();
    expect(screen.getByText(/Palestras \(/i)).toBeDefined();
    expect(screen.getByText(/Reinaugurações \(/i)).toBeDefined();

    // Deve conter eventos gerais
    expect(screen.getByText(/Encontro de Empreendedores/i)).toBeDefined();
    expect(screen.getByText(/Grande Reinauguração Loja Pedreira/i)).toBeDefined();

    // Não deve conter eventos de workshops ou aulas
    expect(screen.queryByText('Workshop de Confeitaria Profissional')).toBeNull();
    expect(screen.queryByText('Croquete de Charque com Maionese de Chicória')).toBeNull();
  });
});
