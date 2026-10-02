import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../features/account/login-page';
import { PaymentStep } from '../features/checkout/payment-step';
import { CartPage } from './cart-page';
import { CheckoutPage } from './checkout-page';
import { ProductPage } from './product-page';
import { OrderConfirmationPage } from './order-confirmation-page';
import { StorefrontRoutes } from '../routes/router';

const checkoutCartItem = {
  id: 'item-1',
  quantity: 1,
  unitPriceCents: 9900,
  variant: { id: 'variant-1', product: { name: 'Shampoo Haskell' } },
};

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
    expect(screen.getByLabelText('E-mail')).toHaveFocus();
  });

  it('authenticates the customer and opens the account area', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { email: 'cliente@teste.com' } }) });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/entrar']}>
        <Routes>
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/conta" element={<p>Área da conta</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('E-mail'), 'cliente@teste.com');
    await user.type(screen.getByLabelText('Senha'), 'SenhaSegura1');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/auth/login', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email: 'cliente@teste.com', password: 'SenhaSegura1' }),
    }));
    expect(await screen.findByText('Área da conta')).toBeInTheDocument();
  });

  it('opens a complete customer account dashboard', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { email: 'cliente@teste.com', profile: { firstName: 'Cliente', lastName: 'Teste' } },
        metrics: { orderCount: 2, favoriteCount: 3, totalSpentCents: 24_900 },
        lastOrder: null,
        defaultAddress: null,
      }),
    }));

    render(
      <MemoryRouter initialEntries={['/conta']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Olá, Cliente' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Meus pedidos/ })).toHaveAttribute('href', '/conta/pedidos');
    expect(screen.getByText('3 produtos salvos')).toBeInTheDocument();
  });

  it('preenche o endereço automaticamente ao consultar um CEP válido', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { publicId: 'user-1', email: 'cliente@teste.com', createdAt: '2026-01-01T00:00:00.000Z', profile: { firstName: 'Cliente', lastName: 'Teste', phone: null } },
          metrics: { orderCount: 0, favoriteCount: 0, totalSpentCents: 0 },
          defaultAddress: null,
          lastOrder: null,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logradouro: 'Avenida FAB', bairro: 'Central', localidade: 'Macapá', uf: 'AP' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/conta/enderecos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    await user.type(await screen.findByLabelText('CEP'), '68900050');

    await waitFor(() => {
      expect(screen.getByLabelText('Rua / avenida')).toHaveValue('Avenida FAB');
      expect(screen.getByLabelText('Bairro')).toHaveValue('Central');
      expect(screen.getByLabelText('Cidade')).toHaveValue('Macapá');
      expect(screen.getByLabelText('UF')).toHaveValue('AP');
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://viacep.com.br/ws/68900050/json/', expect.objectContaining({ headers: { Accept: 'application/json' } }));
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
        variantId: 'variant-1',
        imageUrl: null,
        rating: { value: 4.9, count: 338 },
        variants: [{ id: 'variant-1', status: 'ACTIVE', stockStatus: 'IN_STOCK', lowStockThreshold: 5, inventoryBalance: { physicalQuantity: 3, reservedQuantity: 0 } }],
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
    expect(screen.getByRole('heading', { level: 1, name: 'Máscara Haskell' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar ao carrinho' })).toHaveClass('button', 'button--primary');
    expect(screen.getByRole('button', { name: 'Comprar agora' })).toHaveClass('button', 'button--secondary');
    expect(screen.getByRole('button', { name: 'Favoritar produto' })).toBeInTheDocument();
    expect(screen.getAllByTestId('product-rating-star')).toHaveLength(5);
    expect(screen.getByText('Restam apenas 3 unidades')).toBeInTheDocument();
    expect(screen.getByText(/até 3x de/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compartilhar no WhatsApp' })).toHaveAttribute('href', expect.stringContaining('https://wa.me/?text='));
  });

  it('shows the original product breadcrumb, metadata, full description tabs, and related products', async () => {
    const targetSlug = 'acidificante-redutor-de-ph-500ml-extrato-de-acai-e-oleo-de-pracaxi';
    const product = {
      name: 'Acidificante Redutor de pH 500ml (Extrato de Açaí e Óleo de Pracaxi)',
      slug: targetSlug,
      description: '<p><b>ACIDIFICANTE REDUTOR DE PH</b></p><p>Modo de Uso:</p><p>Após a aplicação da proteína + máscara, sobreponha a estes produtos o acidificante.</p>',
      brand: { name: 'BIOMA CARE', slug: 'bioma-care' },
      categories: [{ category: { name: 'Hidratação e Reparação', slug: 'hidratacao-e-reparacao' } }],
      variants: [{ id: 'variant-1', sku: '179191651651', status: 'ACTIVE', stockStatus: 'IN_STOCK', priceCents: 19000 }],
    };
    const related = [
      ['maxi-liss-intense-defrizz-480g', 'MAXI LISS INTENSE DEFRIZZ 480g', 43000],
      ['mascara-capilar-reparador-de-danos-de-progressiva-120g', 'Máscara Capilar Reparador de Danos de Progressiva 120g', 5500],
      ['hidratacao-ouse-300-ml', 'Hidratação Ouse &#8211; 300 mL', 5800],
      ['btx-1-l', 'BTX &#8211; 1 L', 52500],
    ] as const;
    const relatedProducts = related.map(([slug, name, priceCents]) => ({ slug, name, variants: [{ id: `${slug}-variant`, status: 'ACTIVE', priceCents }] }));
    const productBySlug = new Map<string, unknown>([[targetSlug, product], ...relatedProducts.map((item) => [item.slug, item] as [string, unknown])]);
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: RequestInfo | URL) => ({
      ok: true,
      json: async () => productBySlug.get(String(input).split('/').pop() ?? '') ?? null,
    })));

    render(
      <MemoryRouter initialEntries={[`/produto/${targetSlug}`]}>
        <Routes><Route path="/produto/:slug" element={<ProductPage />} /></Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'Hidratação e Reparação' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Hidratação e Reparação' })[0]).toHaveAttribute('href', '/categoria/hidratacao-e-reparacao');
    expect(screen.getByRole('link', { name: 'BIOMA CARE' })).toHaveAttribute('href', '/marca/bioma-care');
    expect(screen.getByText('179191651651')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Descrição' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('ACIDIFICANTE REDUTOR DE PH')).toBeInTheDocument();
    expect(screen.getByText(/Após a aplicação da proteína/)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Produtos relacionados' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'MAXI LISS INTENSE DEFRIZZ 480g' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Máscara Capilar Reparador de Danos de Progressiva 120g' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hidratação Ouse – 300 mL' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'BTX – 1 L' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Avaliações (0)' }));
    expect(screen.getByRole('tabpanel', { name: 'Avaliações (0)' })).toHaveTextContent('Ainda não há avaliações para este produto.');
  });

  it('shows payment options and persists the product favorite locally', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Máscara Haskell', slug: 'mascara-haskell', brandName: 'Haskell', price: { amount: 8990, currency: 'BRL' }, available: true, variantId: 'variant-1', imageUrl: null }),
    }));

    render(<MemoryRouter initialEntries={['/produto/mascara-haskell']}><Routes><Route path="/produto/:slug" element={<ProductPage />} /></Routes></MemoryRouter>);

    expect(await screen.findByRole('tab', { name: 'Avaliações (0)' })).toBeInTheDocument();
    expect(screen.queryAllByTestId('product-rating-star')).toHaveLength(0);
    await user.click(screen.getByRole('tab', { name: 'Avaliações (0)' }));
    expect(screen.getByRole('tabpanel', { name: 'Avaliações (0)' })).toHaveTextContent('Ainda não há avaliações para este produto.');
    await user.click(screen.getByRole('tab', { name: 'Descrição' }));
    await user.click(await screen.findByRole('button', { name: 'Ver opções de pagamento' }));
    expect(screen.getByRole('region', { name: 'Opções de pagamento' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Favoritar produto' }));
    expect(screen.getByRole('button', { name: 'Remover produto dos favoritos' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('je_favorite_products') ?? '[]')).toContain('mascara-haskell');
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
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 0, items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 8990, items: [checkoutCartItem] }) });
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
    expect(await within(screen.getByRole('complementary', { name: 'Carrinho' })).findByRole('link', { name: 'Finalizar compra' })).toHaveClass('button', 'button--primary');
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
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          publicId: 'cart-1',
          status: 'ACTIVE',
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
      json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 9900, items: [checkoutCartItem] }),
    }));

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('main')).toHaveClass('page-section', 'checkout-page');
    expect(screen.getByRole('navigation', { name: 'Etapas do checkout' })).toHaveClass('checkout-stepper');
    expect(screen.getByRole('heading', { name: 'Contato' }).closest('form')).toHaveClass('form-panel');
  });

  it('offers guest checkout and collects the minimum contact data before the address step', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 9900, items: [checkoutCartItem] }),
    }));

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

    expect(await screen.findByRole('radio', { name: 'Comprar sem conta' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Criar uma conta' })).not.toBeChecked();
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Cliente Teste');
    await userEvent.type(screen.getByLabelText('E-mail'), 'cliente@teste.com');
    await userEvent.type(screen.getByLabelText('WhatsApp'), '96981001897');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('heading', { name: 'Endereço de entrega' })).toBeInTheDocument();
  });

  it('creates a customer account before continuing when the account option is selected', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 9900, items: [checkoutCartItem] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'user-1', email: 'cliente@teste.com' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { email: 'cliente@teste.com' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 9900, items: [checkoutCartItem] }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    await userEvent.click(await screen.findByRole('radio', { name: 'Criar uma conta' }));
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Cliente Teste');
    await userEvent.type(screen.getByLabelText('E-mail'), 'cliente@teste.com');
    await userEvent.type(screen.getByLabelText('WhatsApp'), '96981001897');
    await userEvent.type(screen.getByLabelText('Senha'), 'SenhaSegura1');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'SenhaSegura1');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/auth/register', expect.objectContaining({ method: 'POST' })));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/v1/auth/login', expect.objectContaining({ method: 'POST' }));
    expect(await screen.findByRole('heading', { name: 'Endereço de entrega' })).toBeInTheDocument();
  });

  it('adds an optional order bump to the cart before the review total is calculated', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 9900, items: [checkoutCartItem] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ code: 'STANDARD', provider: 'MELHOR_ENVIO', label: 'Entrega padrão', priceCents: 1500, deliveryDays: 5 }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ slug: 'oleo-nutritivo', name: 'Óleo Nutritivo', price: { amount: 3500, currency: 'BRL' }, available: true, variantId: 'variant-bump', imageUrl: '/storage/oleo.jpg' }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 13400, items: [checkoutCartItem, { id: 'item-bump', quantity: 1, unitPriceCents: 3500, variant: { id: 'variant-bump', product: { name: 'Óleo Nutritivo' } } }] }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    await userEvent.type(await screen.findByLabelText('Nome completo'), 'Cliente Teste');
    await userEvent.type(screen.getByLabelText('E-mail'), 'cliente@teste.com');
    await userEvent.type(screen.getByLabelText('WhatsApp'), '96981001897');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.type(screen.getByLabelText('CEP'), '68900050');
    await userEvent.type(screen.getByLabelText('Rua'), 'Av. Gen. Gurjão');
    await userEvent.type(screen.getByLabelText('Número'), '151');
    await userEvent.type(screen.getByLabelText('Bairro'), 'Central');
    await userEvent.type(screen.getByLabelText('Cidade'), 'Macapá');
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'AP');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular entrega' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));

    const bump = await screen.findByRole('checkbox', { name: /Adicionar Óleo Nutritivo/ });
    await userEvent.click(bump);

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/carts/cart-1/items', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ variantId: 'variant-bump', quantity: 1 }),
    })));
    await waitFor(() => expect(bump).toBeChecked());
  });

  it('loads shipping options from the API after the postal code step', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 9900, items: [checkoutCartItem] }),
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

    await userEvent.type(await screen.findByLabelText('Nome completo'), 'Cliente Teste');
    await userEvent.type(screen.getByLabelText('E-mail'), 'cliente@teste.com');
    await userEvent.type(screen.getByLabelText('WhatsApp'), '96981001897');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.type(screen.getByLabelText('CEP'), '68900050');
    await userEvent.type(screen.getByLabelText('Rua'), 'Av. Gen. Gurjão');
    await userEvent.type(screen.getByLabelText('Número'), '151');
    await userEvent.type(screen.getByLabelText('Bairro'), 'Central');
    await userEvent.type(screen.getByLabelText('Cidade'), 'Macapá');
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'AP');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular entrega' }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/shipping/quote', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ postalCode: '68900050', totalCents: 9900 }),
    })));
    expect(await screen.findByLabelText(/Retirada no salão/)).toBeChecked();
    expect(screen.getByLabelText(/Entrega padrão/)).toBeInTheDocument();
  });

  it('applies a coupon in the review step and reflects the quoted discount', async () => {
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ publicId: 'cart-1', status: 'ACTIVE', subtotalCents: 20_000, items: [{ ...checkoutCartItem, unitPriceCents: 20_000 }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ code: 'STANDARD', provider: 'MELHOR_ENVIO', label: 'Entrega padrão', priceCents: 1_500, deliveryDays: 5 }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ subtotalCents: 20_000, couponCode: 'VIP20', discountCents: 4_000, shippingCents: 0, totalCents: 16_000 }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    await userEvent.type(await screen.findByLabelText('Nome completo'), 'Cliente Teste');
    await userEvent.type(screen.getByLabelText('E-mail'), 'cliente@teste.com');
    await userEvent.type(screen.getByLabelText('WhatsApp'), '96981001897');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.type(screen.getByLabelText('CEP'), '68900050');
    await userEvent.type(screen.getByLabelText('Rua'), 'Av. Gen. Gurjão');
    await userEvent.type(screen.getByLabelText('Número'), '151');
    await userEvent.type(screen.getByLabelText('Bairro'), 'Central');
    await userEvent.type(screen.getByLabelText('Cidade'), 'Macapá');
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'AP');
    await userEvent.click(screen.getByRole('button', { name: 'Calcular entrega' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
    await userEvent.type(screen.getByLabelText('Cupom de desconto'), 'vip20');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar cupom' }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/checkout/quote', expect.objectContaining({ method: 'POST', body: JSON.stringify({ cartId: 'cart-1', contactEmail: 'cliente@teste.com', couponCode: 'VIP20', shippingCents: 1_500 }) })));
    expect(await screen.findByText('Desconto')).toBeInTheDocument();
    expect(document.querySelector('.checkout-review__total')).toHaveTextContent('R$ 160,00');
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
