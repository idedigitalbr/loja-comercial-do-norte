/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import QuoteFormPage from './page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

let mockItems: Array<{
  variantId: string;
  productSlug: string;
  name: string;
  sku: string;
  imagePath: string;
  unitPriceCents: number;
  quantity: number;
}> = [];

let mockSubtotal = 0;
const mockUpdateQuantity = vi.fn();
const mockRemove = vi.fn();
const mockClear = vi.fn();

vi.mock('@/components/quote-cart-provider', () => ({
  useQuoteCart: () => ({
    items: mockItems,
    subtotalCents: mockSubtotal,
    count: mockItems.length,
    updateQuantity: mockUpdateQuantity,
    remove: mockRemove,
    clear: mockClear,
    ready: true,
  }),
}));

vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

afterEach(() => {
  cleanup();
  mockItems = [];
  mockSubtotal = 0;
  vi.clearAllMocks();
});

describe('QuoteFormPage (/cotacao)', () => {
  it('renderiza o estado de cotação vazia quando não há itens', () => {
    mockItems = [];
    mockSubtotal = 0;

    render(<QuoteFormPage />);

    expect(screen.getByText(/Sua cotação está vazia/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Ver catálogo/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Entrar/i })).toBeDefined();
  });

  it('renderiza os itens, subtotal e campos de formulário quando há itens', () => {
    mockItems = [
      {
        variantId: 'var-1',
        productSlug: 'copo-200ml',
        name: 'Copo 200ml Cristalcopo',
        sku: 'COP-200',
        imagePath: '/img/copo.png',
        unitPriceCents: 1500,
        quantity: 2,
      },
    ];
    mockSubtotal = 3000;

    render(<QuoteFormPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Enviar cotação/i })).toBeDefined();
    expect(screen.getByText(/Copo 200ml Cristalcopo/i)).toBeDefined();
    expect(screen.getAllByText(/R\$\s*30,00/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Nome completo/i)).toBeDefined();
    expect(screen.getByLabelText(/WhatsApp/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /^Enviar cotação$/i })).toBeDefined();
  });

  it('abre WhatsApp direto ao clicar no botão de cotação via WhatsApp', () => {
    mockItems = [
      {
        variantId: 'var-1',
        productSlug: 'copo-200ml',
        name: 'Copo 200ml Cristalcopo',
        sku: 'COP-200',
        imagePath: '/img/copo.png',
        unitPriceCents: 1500,
        quantity: 2,
      },
    ];
    mockSubtotal = 3000;

    const mockOpen = vi.fn();
    vi.stubGlobal('open', mockOpen);

    render(<QuoteFormPage />);

    const wppBtn = screen.getByRole('button', { name: /Cotar direto no WhatsApp/i });
    fireEvent.click(wppBtn);

    expect(mockOpen).toHaveBeenCalled();
    const calledUrl = mockOpen.mock.calls[0][0];
    expect(calledUrl).toContain('wa.me');
  });
});
