/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import QuoteConfirmationPage from './page';

vi.mock('@/lib/api', () => ({
  getQuote: vi.fn(async () => ({
    id: 'quote-1',
    publicId: 'CN-2026-0042',
    status: 'SUBMITTED',
    createdAt: '2026-11-11T18:00:00.000Z',
    customerName: 'Maria Souza',
    customerPhone: '(91) 98888-7777',
    customerEmail: 'maria@exemplo.com',
    companyName: 'Padaria Norte',
    notes: '[Unidade/Loja mais próxima: São Brás]\n[Modalidade: Retirada na loja]',
    subtotalCents: 0,
    itemsCount: 3,
    items: [
      {
        sku: 'CN-001',
        productName: 'Colher Linha Forte Strawplast Cristal',
        productSlug: 'colher-linha-forte',
        imagePath: null,
        quantity: 3,
        unitPriceCents: null,
        totalCents: null,
      },
    ],
  })),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('QuoteConfirmationPage (/cotacao/[publicId])', () => {
  it('exibe mensagem de sucesso com instrução de aguardar WhatsApp e aviso opcional lá embaixo para adiantar conversa', async () => {
    const ui = await QuoteConfirmationPage({
      params: Promise.resolve({ publicId: 'CN-2026-0042' }),
      searchParams: Promise.resolve({ storeId: 'loja-sao-bras' }),
    });

    render(ui);

    expect(
      screen.getByRole('heading', { level: 1, name: /Sua cotação foi enviada com sucesso/i }),
    ).toBeDefined();
    expect(
      screen.getByText(/Aguarde para que nossos atendentes entrem em contato com você por WhatsApp!/i),
    ).toBeDefined();
    expect(screen.getAllByText(/CN-2026-0042/).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/Quer adiantar a conversa no WhatsApp\?/i)).toBeDefined();
    expect(screen.getByText(/fure a fila/i)).toBeDefined();

    const whatsappLink = screen.getByRole('link', { name: /Enviar cotação via WhatsApp/i });
    expect(whatsappLink.getAttribute('href')).toContain('wa.me/');
  });
});
