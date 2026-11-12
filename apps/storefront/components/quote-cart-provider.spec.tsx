/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { QuoteCartProvider, useQuoteCart } from './quote-cart-provider';

let mockPathname = '/loja';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const sampleItem = {
  variantId: 'var-1',
  productSlug: 'colher-ref',
  name: 'Colher REF Strawplast Branca',
  sku: 'CN-7898282616829',
  imagePath: null,
  unitPriceCents: null,
  quantity: 1,
};

function Harness() {
  const { items, drawerOpen, add } = useQuoteCart();
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="drawer-open">{String(drawerOpen)}</span>
      <button onClick={() => add(sampleItem)} type="button">
        add-default
      </button>
      <button onClick={() => add(sampleItem, { openDrawer: false })} type="button">
        add-silent
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  mockPathname = '/loja';
  vi.clearAllMocks();
});

describe('QuoteCartProvider', () => {
  it('opens drawer by default when adding item, but keeps it closed when openDrawer is false', () => {
    render(
      <QuoteCartProvider>
        <Harness />
      </QuoteCartProvider>,
    );

    expect(screen.getByTestId('drawer-open').textContent).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'add-silent' }));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('drawer-open').textContent).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'add-default' }));
    expect(screen.getByTestId('drawer-open').textContent).toBe('true');
  });

  it('closes drawer automatically when navigating to /cotacao', () => {
    const { rerender } = render(
      <QuoteCartProvider>
        <Harness />
      </QuoteCartProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'add-default' }));
    expect(screen.getByTestId('drawer-open').textContent).toBe('true');

    mockPathname = '/cotacao';
    rerender(
      <QuoteCartProvider>
        <Harness />
      </QuoteCartProvider>,
    );

    expect(screen.getByTestId('drawer-open').textContent).toBe('false');
  });
});
