/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { QuoteDrawer } from './quote-drawer';

let mockItems: Array<{
  variantId: string;
  productSlug: string;
  name: string;
  sku: string;
  imagePath?: string | null;
  unitPriceCents: number | null;
  quantity: number;
}> = [];

let mockSubtotal = 0;
let mockDrawerOpen = true;
const mockCloseDrawer = vi.fn();
const mockUpdateQuantity = vi.fn();
const mockRemove = vi.fn();
const mockClear = vi.fn();

vi.mock('./quote-cart-provider', () => ({
  useQuoteCart: () => ({
    items: mockItems,
    subtotalCents: mockSubtotal,
    count: mockItems.reduce((sum, i) => sum + i.quantity, 0),
    drawerOpen: mockDrawerOpen,
    closeDrawer: mockCloseDrawer,
    updateQuantity: mockUpdateQuantity,
    remove: mockRemove,
    clear: mockClear,
  }),
}));

afterEach(() => {
  cleanup();
  mockItems = [];
  mockSubtotal = 0;
  mockDrawerOpen = true;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  vi.clearAllMocks();
});

describe('QuoteDrawer', () => {
  it('exibe Sob cotação (e nunca R$ 0,00) quando os itens não possuem preço fixo', () => {
    mockItems = [
      {
        variantId: 'var-quote-only',
        productSlug: 'sacola-kraft-p',
        name: 'Sacola Kraft P',
        sku: 'SAC-01',
        unitPriceCents: null,
        quantity: 3,
      },
    ];
    mockSubtotal = 0;

    render(<QuoteDrawer />);

    expect(screen.getByRole('heading', { name: /Carrinho de cotação/i })).toBeDefined();
    expect(screen.getAllByText('Sob cotação').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/R\$\s*0,00/)).toBeNull();
  });

  it('renderiza apenas o botão Enviar cotação (sem opção de WhatsApp) e abre em overlay escuro acima da página', () => {
    mockItems = [
      {
        variantId: 'var-1',
        productSlug: 'copo-200ml',
        name: 'Copo 200ml',
        sku: 'COP-200',
        unitPriceCents: 1500,
        quantity: 2,
      },
    ];
    mockSubtotal = 3000;

    render(<QuoteDrawer />);

    const dialog = screen.getByRole('dialog', { name: 'Carrinho de cotação' });
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog.className).toContain('z-[10050]');
    expect(document.body.style.overflow).toBe('hidden');

    const backdrop = screen.getByRole('button', { name: 'Fechar painel' });
    expect(backdrop.className).toContain('bg-slate-950/70');

    const ctaLink = screen.getByRole('link', { name: /Enviar cotação/i });
    expect(ctaLink).toHaveAttribute('href', '/cotacao');

    expect(screen.queryByText(/WhatsApp/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Cotar/i })).toBeNull();
  });

  it('permite ajustar quantidade, remover item e limpar lista', () => {
    mockItems = [
      {
        variantId: 'var-1',
        productSlug: 'copo-200ml',
        name: 'Copo 200ml',
        sku: 'COP-200',
        unitPriceCents: 1500,
        quantity: 2,
      },
      {
        variantId: 'var-2',
        productSlug: 'prato-15cm',
        name: 'Prato 15cm',
        sku: 'PRA-15',
        unitPriceCents: null,
        quantity: 1,
      },
    ];
    mockSubtotal = 3000;

    render(<QuoteDrawer />);

    expect(screen.getByLabelText('Diminuir quantidade de Prato 15cm')).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Aumentar quantidade de Copo 200ml'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('var-1', 3);

    fireEvent.click(screen.getByLabelText('Diminuir quantidade de Copo 200ml'));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('var-1', 1);

    fireEvent.click(screen.getByLabelText('Remover Prato 15cm'));
    expect(mockRemove).toHaveBeenCalledWith('var-2');

    fireEvent.click(screen.getByRole('button', { name: /Limpar lista/i }));
    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('exibe estado vazio com link para catálogo e oculta botão Limpar', () => {
    mockItems = [];
    mockSubtotal = 0;

    render(<QuoteDrawer />);

    expect(screen.getByText(/Sua lista de cotação está vazia/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Ver catálogo/i })).toHaveAttribute('href', '/loja');
    expect(screen.queryByRole('button', { name: /Limpar lista/i })).toBeNull();
  });
});
