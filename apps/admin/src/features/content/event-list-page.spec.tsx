/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventListPage } from './event-list-page';

const mockEvents = [
  {
    id: 'event-1',
    title: 'Encontro de Empreendedores',
    slug: 'encontro-de-empreendedores',
    subtitle: 'Uma História de Sucesso',
    description: 'Palestra com empresários do setor alimentício.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg',
    eventDateText: '31 de Agosto',
    eventTime: '19h30',
    location: 'Igreja Nova Terra',
    instructor: 'James Holanda',
    badge: 'PALESTRA',
    status: 'ACTIVE',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'event-2',
    title: 'Grande Reinauguração Loja Pedreira',
    slug: 'grande-reinauguracao-loja-pedreira',
    subtitle: 'Nova loja com mais espaço',
    description: 'Venha conhecer o novo showroom.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg',
    eventDateText: '03 de Julho',
    eventTime: '08h',
    location: 'Loja Pedreira',
    instructor: 'Comercial do Norte',
    badge: 'REINAUGURAÇÃO',
    status: 'DRAFT',
    createdAt: '2026-06-15T10:00:00.000Z',
  },
];

describe('EventListPage (WordPress Admin Experience)', () => {
  const onCreate = vi.fn();
  const onEdit = vi.fn();

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('/api/v1/admin/events')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockEvents,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the WordPress heading with Adicionar novo evento', async () => {
    render(<EventListPage onCreate={onCreate} onEdit={onEdit} />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Eventos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar novo evento' })).toBeInTheDocument();
  });

  it('renders status views (Tudo, Publicados, Rascunhos) with counts', async () => {
    render(<EventListPage onCreate={onCreate} onEdit={onEdit} />);

    expect(await screen.findByRole('button', { name: /Tudo/ })).toHaveTextContent('Tudo (2)');
    expect(screen.getByRole('button', { name: /Publicados/ })).toHaveTextContent('Publicados (1)');
    expect(screen.getByRole('button', { name: /Rascunhos/ })).toHaveTextContent('Rascunhos (1)');
  });

  it('renders event titles, dates, locations, badges and row actions', async () => {
    render(<EventListPage onCreate={onCreate} onEdit={onEdit} />);

    expect(await screen.findByText('Encontro de Empreendedores')).toBeInTheDocument();
    expect(screen.getByText('Grande Reinauguração Loja Pedreira')).toBeInTheDocument();
    expect(screen.getByText('31 de Agosto')).toBeInTheDocument();
    expect(screen.getByText('Igreja Nova Terra')).toBeInTheDocument();
    expect(screen.getByText('PALESTRA')).toBeInTheDocument();

    const editButtons = screen.getAllByRole('button', { name: 'Editar' });
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith('event-1');
  });

  it('filters events when clicking Rascunhos view', async () => {
    render(<EventListPage onCreate={onCreate} onEdit={onEdit} />);

    const draftTab = await screen.findByRole('button', { name: /Rascunhos/ });
    fireEvent.click(draftTab);

    expect(screen.getByText('Grande Reinauguração Loja Pedreira')).toBeInTheDocument();
    expect(screen.queryByText('Encontro de Empreendedores')).not.toBeInTheDocument();
  });
});
