import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShopPage } from './shop-page';

describe('ShopPage', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the branded catalogue structure for an empty imported catalogue', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    window.history.pushState({}, '', '/loja');

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Loja' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Marcas em destaque' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Produtos' })).toBeInTheDocument();
    expect(await screen.findByText('Seu catálogo será exibido aqui assim que a importação terminar.')).toBeInTheDocument();

  });

  it('keeps brand and category filters in the URL', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/loja');
    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    await user.click(screen.getByLabelText('Haskell'));
    await user.click(screen.getByLabelText('Shampoo'));

    expect(window.location.search).toContain('brand=haskell');
    expect(window.location.search).toContain('category=shampoo');
  });

  it('normalizes the catalog API shape into a visual product card', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        publicId: 'product-1',
        slug: 'mascara-haskell',
        name: 'Máscara Haskell',
        status: 'ACTIVE',
        brand: { name: 'Haskell' },
        images: [{ path: '/uploads/mascara.webp', isPrimary: true, altText: 'Máscara Haskell' }],
        variants: [{ id: 'variant-1', priceCents: 8990, status: 'ACTIVE', images: [] }],
      }],
    }));

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Máscara Haskell' })).toBeInTheDocument();
    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver Máscara Haskell' }).querySelector('img')).toHaveAttribute('src', '/uploads/mascara.webp');
  });

  it('renders imported brands and categories in the existing filter treatment', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: string) => {
      if (input.includes('/catalog/brands')) {
        return { ok: true, json: async () => [{ id: 'brand-1', name: 'Bioma Care', slug: 'bioma-care' }] };
      }
      if (input.includes('/catalog/categories')) {
        return { ok: true, json: async () => [{ id: 'category-1', name: 'Cremes e Bálsamos', slug: 'cremes-e-balsamos' }] };
      }
      return { ok: true, json: async () => [] };
    }));

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    expect(await screen.findByLabelText('Bioma Care')).toBeInTheDocument();
    expect(await screen.findByLabelText('Cremes e Bálsamos')).toBeInTheDocument();
  });

  it('paginates the imported catalogue in groups of sixteen products', async () => {
    const user = userEvent.setup();
    const products = Array.from({ length: 34 }, (_, index) => ({
      publicId: `product-${index + 1}`,
      slug: `produto-${index + 1}`,
      name: `Produto ${index + 1}`,
      status: 'ACTIVE',
      variants: [{ id: `variant-${index + 1}`, priceCents: 1000, status: 'ACTIVE', images: [] }],
      images: [],
    }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => products }));
    window.history.pushState({}, '', '/loja');

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    expect(await screen.findByText('Exibindo 1–16 de 34 produtos')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Ver Produto/ })).toHaveLength(16);
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(await screen.findByText('Exibindo 17–32 de 34 produtos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    expect(window.location.search).toContain('page=2');
  });

  it('renders the main brand image in the featured brand rail', async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/catalog/products')) return { ok: true, json: async () => [] } as Response;
      if (String(input).includes('/catalog/brands')) return { ok: true, json: async () => [{ id: 'brand-1', name: 'Grandha', slug: 'grandha', imagePath: '/storage/uploads/grandha/960.webp' }] } as Response;
      return { ok: true, json: async () => [] } as Response;
    }) as typeof fetch;

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );
    expect(await screen.findByRole('img', { name: 'Grandha' })).toHaveAttribute('src', '/storage/uploads/grandha/960.webp');
    expect(document.querySelector('input[aria-label="Grandha"]')?.parentElement?.querySelector('img')).toHaveAttribute('src', '/storage/uploads/grandha/960.webp');
  });
});
