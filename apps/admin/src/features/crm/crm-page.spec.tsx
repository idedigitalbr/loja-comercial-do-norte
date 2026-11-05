/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CRMPage } from './crm-page';

describe('CRMPage (MiniCRM Kanban & Leads)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders CRM page heading, KPIs and Kanban columns', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'lead-1',
              publicId: 'lead-abc1',
              customerName: 'Maria Silva',
              customerPhone: '(91) 98111-2222',
              preferredStore: 'Bernardo Sayão (Jurunas)',
              storeId: 'loja-jurunas',
              subject: 'Cotação de produtos',
              stage: 'NEW',
              origin: 'chat-norti',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              leadNotes: [],
            },
          ],
          total: 1,
          counts: { NEW: 1, CONTACTED: 0, IN_PROGRESS: 0, WON: 0, LOST: 0 },
        }),
      })
    );

    render(<CRMPage />);

    expect(screen.getByText(/MiniCRM — Pipeline de Leads/i)).toBeInTheDocument();
    expect(screen.getByText(/Total de Leads/i)).toBeInTheDocument();
    expect(screen.getByText(/Novos no Funil/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText(/📍 Bernardo Sayão \(Jurunas\)/i)).toBeInTheDocument();
      expect(screen.getByText(/🏷️ Cotação de produtos/i)).toBeInTheDocument();
    });
  });
});
