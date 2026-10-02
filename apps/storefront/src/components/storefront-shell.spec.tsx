import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StorefrontShell } from './storefront-shell';
import { StorefrontProductSearch } from './storefront-product-search';

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Busca aplicada">{location.search}</output>;
}

function PathProbe() {
  const location = useLocation();
  return <output aria-label="Rota atual">{location.pathname}{location.search}</output>;
}

function RouteProbe() {
  const navigate = useNavigate();
  return <button type="button" onClick={() => navigate('/produto/teste')}>Ir para produto</button>;
}

describe('StorefrontShell', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.lang = 'pt-BR';
    vi.useRealTimers();
  });

  it('keeps the original main navigation in one shared header on catalog routes', () => {
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <main>Conteúdo da loja</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const banner = screen.getByRole('banner');
    expect(within(banner).queryByRole('searchbox', { name: 'Buscar produtos' })).not.toBeInTheDocument();
    const primaryNav = within(banner).getByRole('navigation', { name: 'Navegação principal' });
    expect(primaryNav.closest('.navigation-bar')).toBeInTheDocument();
    expect(banner.querySelector('.shop-navigation-row')).not.toBeInTheDocument();
    expect(banner.querySelectorAll('.primary-nav')).toHaveLength(1);
  });

  it('exposes Entrar in the utility bar and routes to the customer login', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes('/auth/me')) return { ok: false };
      return { ok: false };
    }));

    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <PathProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    const headerActions = screen.getByRole('banner').querySelector('.header-actions') as HTMLElement;
    const loginLink = within(headerActions).getByRole('link', { name: 'Entrar' });
    expect(loginLink).toHaveAttribute('href', '/entrar');
    expect(loginLink).toHaveClass('header-account');
    expect(loginLink.querySelector('[data-icon="user"]')).toBeInTheDocument();
    await user.click(loginLink);
    expect(screen.getByRole('status', { name: 'Rota atual' })).toHaveTextContent('/entrar');
  });

  it('shows Sair for an authenticated customer and redirects to login after logout', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/me')) return { ok: true, json: async () => ({ user: { email: 'cliente@teste.com' } }) };
      if (url.includes('/auth/logout')) return { ok: true, json: async () => ({ ok: true }) };
      return { ok: false };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <PathProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    const headerActions = screen.getByRole('banner').querySelector('.header-actions') as HTMLElement;
    const logoutButton = await within(headerActions).findByRole('button', { name: 'Sair da conta' });
    const accountLink = within(headerActions).getByRole('link', { name: 'Minha conta' });
    expect(accountLink).toHaveAttribute('href', '/conta');
    expect(accountLink).toHaveClass('header-account', 'header-account--link');
    expect(accountLink.querySelector('[data-icon="user"]')).toBeInTheDocument();
    await user.click(logoutButton);

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    await waitFor(() => expect(screen.getByRole('status', { name: 'Rota atual' })).toHaveTextContent('/entrar'));
    expect(await within(headerActions).findByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/entrar');
  });

  it('renews an expired access session before treating the customer as anonymous', async () => {
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/me')) return { ok: false, status: 401 };
      if (url.includes('/auth/refresh')) return { ok: true, json: async () => ({ user: { email: 'cliente@teste.com' } }) };
      return { ok: false };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <PathProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    const headerActions = screen.getByRole('banner').querySelector('.header-actions') as HTMLElement;
    expect(await within(headerActions).findByRole('button', { name: 'Sair da conta' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' });
  });

  it('ignores repeated logout clicks while the first request is pending', async () => {
    let resolveLogout: (response: { ok: boolean }) => void = () => undefined;
    const logoutResponse = new Promise<{ ok: boolean }>((resolve) => { resolveLogout = resolve; });
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/me')) return Promise.resolve({ ok: true, json: async () => ({ user: { email: 'cliente@teste.com' } }) });
      if (url.includes('/auth/logout')) return logoutResponse;
      return Promise.resolve({ ok: false });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <PathProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    const headerActions = screen.getByRole('banner').querySelector('.header-actions') as HTMLElement;
    const logoutButton = await within(headerActions).findByRole('button', { name: 'Sair da conta' });
    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton);
    expect(fetchMock.mock.calls.filter(([input]) => String(input).includes('/auth/logout'))).toHaveLength(1);

    await act(async () => { resolveLogout({ ok: true }); });
    await waitFor(() => expect(screen.getByRole('status', { name: 'Rota atual' })).toHaveTextContent('/entrar'));
  });

  it('keeps the account action available and explains a logout failure', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/me')) return { ok: true, json: async () => ({ user: { email: 'cliente@teste.com' } }) };
      if (url.includes('/auth/logout')) return { ok: false };
      return { ok: false };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <PathProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    const headerActions = screen.getByRole('banner').querySelector('.header-actions') as HTMLElement;
    await user.click(await within(headerActions).findByRole('button', { name: 'Sair da conta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível sair da conta. Tente novamente.');
    expect(within(headerActions).getByRole('button', { name: 'Sair da conta' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Rota atual' })).toHaveTextContent('/loja');
  });

  it('debounces product search, supports Enter and clears immediately', () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <StorefrontProductSearch />
          <main>Conteúdo da loja</main>
          <LocationProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    const search = screen.getByRole('searchbox', { name: 'Buscar produtos' });
    fireEvent.change(search, { target: { value: 'shampoo' } });
    expect(search).toHaveValue('shampoo');
    expect(screen.getByRole('button', { name: 'Limpar busca' })).toBeInTheDocument();
    const appliedSearch = screen.getByRole('status', { name: 'Busca aplicada' });
    expect(appliedSearch).toHaveTextContent('');

    act(() => vi.advanceTimersByTime(299));
    expect(appliedSearch).toHaveTextContent('');
    act(() => vi.advanceTimersByTime(1));
    expect(appliedSearch).toHaveTextContent('?search=shampoo');

    fireEvent.change(search, { target: { value: 'shampoo novo' } });
    fireEvent.submit(search.closest('form')!);
    expect(appliedSearch).toHaveTextContent('?search=shampoo+novo');

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(search).toHaveValue('');
    expect(appliedSearch).toHaveTextContent('');
    expect(search).toHaveFocus();
  });

  it('does not apply a search after navigation leaves the current route', () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <StorefrontProductSearch />
          <RouteProbe />
          <PathProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar produtos' }), { target: { value: 'shampoo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ir para produto' }));
    expect(screen.getByRole('status', { name: 'Rota atual' })).toHaveTextContent('/produto/teste');

    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('status', { name: 'Rota atual' })).toHaveTextContent('/produto/teste');
  });

  it('waits for IME composition to finish before applying a search', () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <StorefrontProductSearch />
          <LocationProbe />
        </StorefrontShell>
      </MemoryRouter>,
    );

    const search = screen.getByRole('searchbox', { name: 'Buscar produtos' });
    const appliedSearch = screen.getByRole('status', { name: 'Busca aplicada' });
    fireEvent.compositionStart(search);
    fireEvent.change(search, { target: { value: 'shampoo' } });
    act(() => vi.advanceTimersByTime(300));
    expect(appliedSearch).toHaveTextContent('');

    fireEvent.compositionEnd(search);
    act(() => vi.advanceTimersByTime(300));
    expect(appliedSearch).toHaveTextContent('?search=shampoo');
  });

  it('presents branded commerce navigation and conversion actions', () => {
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <StorefrontProductSearch />
          <main>Conteúdo da loja</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    expect(within(screen.getByRole('banner')).getByRole('img', { name: 'Jonas & Elivaldo Hair Designers' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Loja' })[0]).toHaveAttribute('href', '/loja');
    const primaryNav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(primaryNav).getByRole('link', { name: 'Sobre nós' })).toHaveAttribute('href', '/sobre-nos');
    expect(within(primaryNav).getByRole('button', { name: 'Serviços' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(primaryNav).getByRole('link', { name: 'Certificação internacional' })).toHaveAttribute('href', '/certificacao-internacional');
    expect(screen.getAllByRole('link', { name: 'Entrar' })[0]).toHaveAttribute('href', '/entrar');
    expect(screen.getAllByRole('link', { name: /WhatsApp/i })[0]).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(screen.getAllByRole('button', { name: 'Carrinho' })[0]).toHaveAttribute('aria-controls', 'storefront-cart-drawer');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('uses Lucide icons for navigation, commerce and contact actions', () => {
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <main>Conteúdo da loja</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const banner = screen.getByRole('banner');
    expect(banner.querySelector('[data-icon="chevron-down"].lucide')).toBeInTheDocument();
    expect(banner.querySelector('[data-icon="shopping-cart"].lucide')).toBeInTheDocument();
    expect(banner.querySelector('a.button--whatsapp [data-icon="whatsapp"]')).toBeInTheDocument();
    expect(banner.querySelector('[data-icon="menu"].lucide')).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    expect(footer.querySelector('[data-icon="map-pin"].lucide')).toBeInTheDocument();
    expect(footer.querySelector('[data-icon="instagram"].lucide')).toBeInTheDocument();
    expect(screen.queryByText('⌄')).not.toBeInTheDocument();
    expect(screen.queryByText('◌')).not.toBeInTheDocument();
    expect(screen.queryByText('⌖')).not.toBeInTheDocument();
    expect(screen.queryByText('◉')).not.toBeInTheDocument();
  });

  it('keeps the desktop cart icon-only without losing its accessible label', () => {
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <main>Conteúdo da loja</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const cartButton = within(screen.getByRole('banner')).getByRole('button', { name: 'Carrinho' });
    expect(within(cartButton).getByText('Carrinho')).toHaveClass('sr-only');
  });

  it('identifies the WhatsApp action and exposes its shimmer hook', () => {
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <StorefrontShell>
          <main>Conteúdo da loja</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const whatsapp = screen.getByRole('banner').querySelector('a.button--whatsapp') as HTMLAnchorElement;
    expect(whatsapp).toHaveClass('button--whatsapp');
    expect(whatsapp.querySelector('.whatsapp-button__icon')).toBeInTheDocument();
    expect(whatsapp.querySelector('[data-icon="whatsapp"]')).toBeInTheDocument();
  });

  it('marks only the current institutional route as active', () => {
    render(
      <MemoryRouter initialEntries={['/sobre-nos']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const primaryNav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(primaryNav).getByRole('link', { name: 'Sobre nós' })).toHaveClass('is-active');
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveClass('is-active');
  });

  it('keeps Serviços as a click-only disclosure trigger', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const primaryNav = screen.getByRole('navigation', { name: 'Navegação principal' });
    const trigger = within(primaryNav).getByRole('button', { name: 'Serviços' });
    const menu = primaryNav.querySelector('.primary-nav__dropdown-menu') as HTMLElement;

    expect(trigger.tagName).toBe('BUTTON');
    expect(within(primaryNav).queryByRole('link', { name: 'Serviços' })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveAttribute('aria-hidden', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveAttribute('aria-hidden', 'false');
    expect(within(menu).getByRole('link', { name: 'Cabelos e Penteados' })).toHaveAttribute('href', '/cabelos-e-penteados');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('opens a localized right-side cart drawer with product details and recommendations', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('je_cart_public_id', 'cart-1');
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/site/config')) return Promise.resolve({ ok: false } as Response);
      if (url.includes('/catalog/products')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ publicId: 'product-2', slug: 'oleo-nutritivo', name: 'Óleo Nutritivo', brandName: 'Bioma Care', price: { amount: 6900, currency: 'BRL' }, available: true, variantId: 'variant-2', imageUrl: '/storage/oleo.jpg' }],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          publicId: 'cart-1',
          subtotalCents: 9900,
          items: [{
            id: 'item-1',
            quantity: 2,
            unitPriceCents: 4950,
            variant: { id: 'variant-1', product: { name: 'Shampoo Haskell', slug: 'shampoo-haskell', images: [{ path: '/storage/shampoo.jpg', isPrimary: true }] } },
          }],
        }),
      } as Response);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const cartButton = within(screen.getByRole('banner')).getByRole('button', { name: 'Carrinho' });
    await user.click(cartButton);

    const drawer = await screen.findByRole('dialog', { name: /Seu carrinho/ });
    expect(drawer).toHaveClass('cart-drawer');
    await waitFor(() => expect(cartButton.querySelector('.cart-badge')).toHaveTextContent('2'));
    expect(within(drawer).getByRole('img', { name: 'Shampoo Haskell' })).toHaveAttribute('src', '/storage/shampoo.jpg');
    expect(within(drawer).getByRole('button', { name: 'Aumentar quantidade de Shampoo Haskell' })).toBeInTheDocument();
    expect(within(drawer).getByText('Aplicar cupom no checkout')).toBeInTheDocument();
    expect(within(drawer).getByText('Óleo Nutritivo')).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: 'Finalizar compra' })).toHaveAttribute('href', '/checkout');

    await user.click(within(drawer).getByRole('button', { name: 'Fechar carrinho' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /Seu carrinho/ })).not.toBeInTheDocument());
    expect(cartButton).toHaveFocus();
  });

  it('recreates the legacy footer contact block and bottom strip', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: /Av\. Gen\. Gurjão/ })).toHaveAttribute('href', 'https://maps.app.goo.gl/YpTsxUwiuvHUPDHw7');
    expect(within(footer).getByRole('link', { name: /WhatsApp/i })).toHaveAttribute('href', 'https://wa.me/5596981001897');
    expect(within(footer).getByRole('link', { name: /Instagram/i })).toHaveAttribute('href', 'https://www.instagram.com/jonas_elivaldo_hair_designers/');
    expect(within(footer).getByText(/Todos os direitos reservados/)).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /Desenvolvido por/i })).toHaveAttribute('href', 'https://digital.ideinstituto.com.br/');
  });

  it('matches the original top utility bar links and falls back when a configured logo fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const utilityBar = screen.getByRole('banner').querySelector('.utility-bar') as HTMLElement;
    const address = within(utilityBar).getByRole('link', { name: /Av\. Gen\. Gurjão, 151.*Prédio Essência da Natureza/ });
    expect(address).toHaveAttribute('href', 'https://maps.app.goo.gl/YpTsxUwiuvHUPDHw7');
    const whatsapp = within(utilityBar).getByRole('link', { name: 'WhatsApp (96) 98100-1897' });
    expect(whatsapp).toHaveAttribute('href', 'https://wa.me/5596981001897');
    expect(whatsapp.querySelector('[data-icon="whatsapp"]')).toBeInTheDocument();
    expect(address.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(within(utilityBar).getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/jonas_elivaldo_hair_designers/');

    const brandImages = screen.getAllByRole('img', { name: 'Jonas & Elivaldo Hair Designers' });
    brandImages.forEach((image) => fireEvent.error(image));
    expect(brandImages[0]).toHaveAttribute('src', '/brand-logo.jpg');
    expect(brandImages[1]).toHaveAttribute('src', '/brand-logo.jpg');
  });

  it('offers the six legacy languages and persists the selected language', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    const languageGroup = within(screen.getByRole('contentinfo')).getByRole('group', { name: 'Idiomas' });
    expect(within(languageGroup).getAllByRole('button')).toHaveLength(6);
    expect(Array.from(languageGroup.querySelectorAll('svg[data-flag]')).map((flag) => flag.getAttribute('data-flag'))).toEqual(['us', 'fr', 'de', 'it', 'br', 'es']);

    const english = within(languageGroup).getByRole('button', { name: 'Traduzir site para English' });
    await user.click(english);

    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem('site-language')).toBe('en');
    expect(english).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the external translation engine out of the focus order', async () => {
    window.localStorage.setItem('site-language', 'es');

    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell>
          <main>Conteúdo institucional</main>
        </StorefrontShell>
      </MemoryRouter>,
    );

    await waitFor(() => expect(within(screen.getByRole('group', { name: 'Idiomas' })).getByRole('button', { name: 'Traduzir site para Español' })).toHaveAttribute('aria-pressed', 'true'));
    expect(document.documentElement.lang).toBe('es');
    expect(document.getElementById('google_translate_element')).toHaveAttribute('inert');
  });
});
