import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../features/account/login-page';
import { PaymentStep } from '../features/checkout/payment-step';
import { CartPage } from './cart-page';
import { CheckoutPage } from './checkout-page';
import { ProductPage } from './product-page';
import { OrderConfirmationPage } from './order-confirmation-page';

describe('commerce page visual contracts', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('uses the branded account form surface', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toHaveClass('page-section');
    expect(screen.getByRole('form')).toHaveClass('form-panel');
    expect(screen.getByRole('button', { name: 'Entrar' })).toHaveClass('button', 'button--primary');
  });

  it('uses a product detail layout with a clear purchase hierarchy', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'Máscara Haskell',
        slug: 'mascara-haskell',
        brandName: 'Haskell',
        price: { amount: 8990, currency: 'BRL' },
        available: true,
        imageUrl: null,
      }),
    }));

    render(
      <MemoryRouter initialEntries={['/produto/mascara-haskell']}>
        <Routes>
          <Route path="/produto/:slug" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('article')).toHaveClass('product-detail');
    expect(screen.getByRole('heading', { name: 'Máscara Haskell' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar ao carrinho' })).toHaveClass('button', 'button--primary');
  });

  it('adds an available product to the existing cart', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Máscara Haskell',
          slug: 'mascara-haskell',
          brandName: 'Haskell',
          price: { amount: 8990, currency: 'BRL' },
          available: true,
          variantId: 'variant-1',
          imageUrl: null,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/produto/mascara-haskell']}>
        <Routes>
          <Route path="/produto/:slug" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const button = await screen.findByRole('button', { name: 'Adicionar ao carrinho' });
    await userEvent.click(button);

    expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/carts/cart-1/items', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ variantId: 'variant-1', quantity: 1 }),
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('Produto adicionado ao carrinho.');
  });

  it('uses a focused cart panel', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'item-1', quantity: 1, unitPriceCents: 9900, variant: { product: { name: 'Shampoo Haskell' } } }] }) }));

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toHaveClass('page-section');
    expect(await screen.findByRole('complementary', { name: 'Carrinho' })).toHaveClass('cart-panel');
    expect(screen.getByRole('link', { name: 'Finalizar compra' })).toHaveClass('button', 'button--primary');
  });

  it('updates an item quantity from the cart', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          publicId: 'cart-1',
          subtotalCents: 9900,
          items: [{ id: 'item-1', quantity: 1, unitPriceCents: 9900, variant: { id: 'variant-1', product: { name: 'Shampoo Haskell' } } }],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    const increase = await screen.findByRole('button', { name: 'Aumentar quantidade de Shampoo Haskell' });
    await userEvent.click(increase);

    expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/carts/cart-1/items/variant-1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ quantity: 2 }),
    }));
  });

  it('uses a clear stepper for checkout', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ publicId: 'cart-1', subtotalCents: 9900, items: [] }),
    }));

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('main')).toHaveClass('page-section', 'checkout-page');
    expect(screen.getByRole('navigation', { name: 'Etapas do checkout' })).toHaveClass('checkout-stepper');
    expect(screen.getByRole('heading', { name: 'Contato' }).closest('section')).toHaveClass('form-panel');
  });

  it('loads shipping options from the API after the postal code step', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ publicId: 'cart-1', subtotalCents: 9900, items: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { code: 'PICKUP_SALON', provider: 'PICKUP', label: 'Retirada no salão', priceCents: 0, deliveryDays: 1 },
          { code: 'STANDARD', provider: 'MELHOR_ENVIO', label: 'Entrega padrão', priceCents: 1500, deliveryDays: 5 },
        ]),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    await userEvent.type(await screen.findByLabelText('E-mail'), 'cliente@teste.com');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.type(screen.getByLabelText('CEP'), '68900050');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular entrega' }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/shipping/quote', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ postalCode: '68900050', totalCents: 9900 }),
    })));
    expect(await screen.findByLabelText(/Retirada no salão/)).toBeChecked();
    expect(screen.getByLabelText(/Entrega padrão/)).toBeInTheDocument();
  });

  it('shows the Pix code returned by the payment provider', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'PENDING',
        pixCopyPaste: '000201PIX-COPY-PASTE',
        pixQrCodeBase64: 'qr-code-data',
      }),
    }));

    render(<PaymentStep orderId="order-1" amountCents={9900} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pagar com Pix' }));

    expect(await screen.findByText('000201PIX-COPY-PASTE')).toBeInTheDocument();
    expect(screen.getByAltText('QR Code do Pix')).toHaveAttribute('src', 'data:image/png;base64,qr-code-data');
    expect(screen.getByRole('link', { name: 'Acompanhar pedido' })).toHaveAttribute('href', '/pedido/order-1');
  });

  it('shows the order confirmation and purchased items', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        publicId: 'order-1',
        status: 'AWAITING_PAYMENT',
        totalCents: 11_400,
        items: [{ name: 'Shampoo Haskell', quantity: 1, totalCents: 9900 }],
      }),
    }));

    render(
      <MemoryRouter initialEntries={['/pedido/order-1']}>
        <Routes>
          <Route path="/pedido/:publicId" element={<OrderConfirmationPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Pedido order-1' })).toBeInTheDocument();
    expect(screen.getByText('Aguardando pagamento')).toBeInTheDocument();
    expect(screen.getByText(/Shampoo Haskell/)).toBeInTheDocument();
    expect(screen.getByText(/114,00/)).toBeInTheDocument();
  });
});
