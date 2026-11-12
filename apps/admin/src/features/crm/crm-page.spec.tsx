/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CRMPage } from './crm-page';

const SAMPLE_ITEMS = [
  {
    id: 'lead-1',
    publicId: 'lead-abc1',
    customerName: 'Maria Silva',
    customerPhone: '91981112222',
    preferredStore: 'Bernardo Sayão (Jurunas)',
    storeId: 'loja-jurunas',
    subject: 'Cotação de produtos',
    stage: 'NEW',
    origin: 'chat-norti',
    conversationLog: {
      ticketId: '#000101',
      category: 'Atendimento Geral',
      messages: [
        { id: 'm1', sender: 'bot', text: 'Oi! Eu sou o Norti!', timestamp: '10:00' },
        { id: 'm2', sender: 'user', text: 'Quero saber preços de sacolas.', timestamp: '10:01' },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    leadNotes: [],
    quotes: [],
  },
  {
    id: 'lead-2',
    publicId: 'lead-quote-1',
    customerName: 'Restaurante Amazônia',
    customerPhone: '91988887777',
    customerEmail: 'compras@amazonia.com.br',
    preferredStore: 'Matriz São Brás',
    storeId: 'loja-sao-bras',
    subject: 'Cotação: Caixa Pizza 35cm',
    stage: 'NEW',
    origin: 'cotacao-site',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    leadNotes: [],
    quotes: [
      {
        id: 'quote-1',
        publicId: 'qte-99887766',
        status: 'REQUESTED',
        customerName: 'Restaurante Amazônia',
        customerPhone: '91988887777',
        customerEmail: 'compras@amazonia.com.br',
        companyName: 'Amazônia Alimentos LTDA',
        document: '12.345.678/0001-90',
        notes: '[Unidade/Loja mais próxima: Matriz São Brás]\n[Modalidade: Retirada na loja]\nPreciso de NF-e.',
        itemsCount: 100,
        subtotalCents: 0,
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'qi-1',
            productName: 'Caixa Pizza 35cm Kraft',
            sku: 'CX-PIZ-35',
            quantity: 100,
            unitPriceCents: null,
            totalCents: null,
          },
        ],
      },
    ],
  },
];

describe('CRMPage (CRM Leads & Cotações)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders unified CRM heading, KPIs, origin pills and Kanban cards with embedded quotes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: SAMPLE_ITEMS,
          total: 2,
          counts: { NEW: 2, CONTACTED: 0, IN_PROGRESS: 0, WON: 0, LOST: 0 },
        }),
      }),
    );

    render(<CRMPage />);

    expect(screen.getByRole('heading', { name: /CRM \(Leads & Cotações\)/i })).toBeInTheDocument();
    expect(screen.getByText(/Total de Leads/i)).toBeInTheDocument();
    expect(screen.getByText(/Novos no Funil/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('Restaurante Amazônia')).toBeInTheDocument();
      expect(screen.getByText('#99887766')).toBeInTheDocument();
      expect(screen.getAllByText(/Sob cotação/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('filters by origin (Com Cotação / Chat Norti) and switches to Lista view', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: SAMPLE_ITEMS,
          total: 2,
          counts: { NEW: 2, CONTACTED: 0, IN_PROGRESS: 0, WON: 0, LOST: 0 },
        }),
      }),
    );

    render(<CRMPage />);

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: /Com Cotação/i }));
    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument();
    expect(screen.getByText('Restaurante Amazônia')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Lista/i }));
    expect(screen.getByRole('columnheader', { name: /Origem & Protocolo/i })).toBeInTheDocument();
  });

  it('opens the lead drawer showing linked quote items, transition buttons and object-shaped Norti chat log', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: SAMPLE_ITEMS,
        total: 2,
        counts: { NEW: 2, CONTACTED: 0, IN_PROGRESS: 0, WON: 0, LOST: 0 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<CRMPage />);

    await waitFor(() => {
      expect(screen.getByText('Restaurante Amazônia')).toBeInTheDocument();
    });

    // Open quote lead drawer
    fireEvent.click(screen.getByText('Restaurante Amazônia'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Cotação vinculada ao lead/i)).toBeInTheDocument();
    expect(screen.getByText('Caixa Pizza 35cm Kraft')).toBeInTheDocument();
    expect(screen.getByText(/Preciso de NF-e\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Colocar em análise/i })).toBeInTheDocument();

    // Close and open chat lead drawer to verify object conversationLog parsing
    fireEvent.click(screen.getByRole('button', { name: /Fechar ficha do lead/i }));
    fireEvent.click(screen.getByText('Maria Silva'));
    expect(screen.getByText('Quero saber preços de sacolas.')).toBeInTheDocument();
  });
});
