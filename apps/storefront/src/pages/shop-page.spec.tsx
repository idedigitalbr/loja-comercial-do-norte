import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrandPage } from './brand-page';
import { CategoryPage } from './category-page';
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

    expect(screen.getByRole('heading', { name: 'Loja' })).toHaveClass('sr-only');
    expect(screen.getByRole('region', { name: 'Compre por marca' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Produtos' })).toBeInTheDocument();
    expect(await screen.findByText('Seu catálogo será exibido aqui assim que a importação terminar.')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar produtos' })).toBeInTheDocument();

  });

  it('preserves active filters when clearing a search with no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    window.history.pushState({}, '', '/loja?search=produto-inexistente&brand=haskell&category=shampoo&page=2');

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    expect(await screen.findByText('Nenhum produto encontrado para “produto-inexistente”.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Limpar busca' })).toHaveAttribute('href', '/loja?brand=haskell&category=shampoo');
  });

  it('sorts products by name by default and offers the common catalog orders', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: RequestInfo | URL) => ({
      ok: true,
      json: async () => String(input).includes('/catalog/products?') ? [
        { slug: 'zeta', name: 'Zeta Finalizador', variants: [{ id: 'zeta-variant', status: 'ACTIVE', priceCents: 10000 }] },
        { slug: 'acidificante', name: 'Acidificante Redutor', variants: [{ id: 'acidificante-variant', status: 'ACTIVE', priceCents: 19000 }] },
      ] : [],
    })));

    render(<MemoryRouter initialEntries={['/loja']}><ShopPage /></MemoryRouter>);

    const sort = await screen.findByRole('combobox', { name: 'Ordenar por' });
    expect(sort).toHaveValue('alphabetical');
    expect(Array.from(document.querySelectorAll('.product-card h2')).map((heading) => heading.textContent)).toEqual(['Acidificante Redutor', 'Zeta Finalizador']);
    expect(screen.getByRole('option', { name: 'Nome (A–Z)' })).toBeInTheDocument();
  });

  it('keeps brand and category filters in the URL', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/loja');
    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Haskell' }));
    await user.click(screen.getByRole('checkbox', { name: 'Shampoo' }));

    expect(window.location.search).toContain('brand=haskell');
    expect(window.location.search).toContain('category=shampoo');
  });

  it.each([
    { path: '/categoria/hidratacao-e-reparacao', page: <CategoryPage />, query: 'category=hidratacao-e-reparacao' },
    { path: '/marca/bioma-care', page: <BrandPage />, query: 'brand=bioma-care' },
  ])('uses the route scope when loading $path', async ({ path, page, query }) => {
    const requestedUrls: string[] = [];
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      requestedUrls.push(String(input));
      return { ok: true, json: async () => [] };
    }));

    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/categoria/:slug" element={page} />
          <Route path="/marca/:slug" element={page} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(requestedUrls.some((url) => url.includes(query))).toBe(true));
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

  it('does not invent a rating when the catalog has no review data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: string) => {
      if (input.includes('/catalog/products')) {
        return {
          ok: true,
          json: async () => [{
            publicId: 'product-no-rating',
            slug: 'produto-sem-avaliacao',
            name: 'Produto sem avaliação',
            status: 'ACTIVE',
            images: [],
            variants: [{ id: 'variant-no-rating', priceCents: 5000, status: 'ACTIVE', images: [] }],
          }],
        };
      }
      return { ok: true, json: async () => [] };
    }));

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Produto sem avaliação' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver Produto sem avaliação' }).querySelector('img')).toHaveAttribute('src', '/woocommerce-placeholder.png');
    expect(screen.queryByText('4,9')).not.toBeInTheDocument();
    expect(screen.queryByText('(338)')).not.toBeInTheDocument();
    expect(screen.queryByText('Ainda sem avaliações')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('product-card-rating-star')).toHaveLength(0);
  });

  it('shows contextual product merchandising instead of a generic availability badge', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: string) => {
      if (input.includes('/catalog/products')) {
        return {
          ok: true,
          json: async () => [{
            publicId: 'product-sale',
            slug: 'produto-em-oferta',
            name: 'Produto em oferta',
            status: 'ACTIVE',
            rating: { value: 4.9, count: 338 },
            images: [{ path: '/uploads/produto.webp', isPrimary: true }],
            variants: [{ id: 'variant-sale', priceCents: 8000, compareAtPriceCents: 10000, status: 'ACTIVE', stockStatus: 'IN_STOCK', lowStockThreshold: 5, inventoryBalance: { physicalQuantity: 3, reservedQuantity: 0 } }],
          }],
        };
      }
      return { ok: true, json: async () => [] };
    }));

    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Produto em oferta' })).toBeInTheDocument();
    expect(screen.queryByText('Disponível')).not.toBeInTheDocument();
    expect(screen.getByText('Oferta!')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00').tagName).toBe('DEL');
    expect(screen.getByText('R$ 80,00')).toBeInTheDocument();
    expect(screen.queryByText('Quase acabando')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Avaliação/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Favoritar produto' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver produto: Produto em oferta' })).toHaveAttribute('href', '/produto/produto-em-oferta');
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

    expect(await screen.findByRole('checkbox', { name: 'Bioma Care' })).toBeInTheDocument();
    expect(await screen.findByRole('checkbox', { name: 'Cremes e Bálsamos' })).toBeInTheDocument();
    expect(Array.from(screen.getByRole('complementary', { name: 'Filtros de produtos' }).querySelectorAll('fieldset legend')).map((legend) => legend.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['Filtro Categoria Produtos', 'Filtro sub marcas']);
  });

  it('keeps only the original public brands in the filter and preserves their subbrands', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (input: string) => {
      if (input.includes('/catalog/brands')) {
        return { ok: true, json: async () => [
          { id: 'brand-bioma', name: 'BIOMA CARE', slug: 'bioma-care' },
          { id: 'brand-meu-tudo', name: 'Meu Tudo!', slug: 'meu-tudo' },
          { id: 'brand-nova', name: 'Nova-marca', slug: 'nova-marca' },
          { id: 'brand-bioma-sub', name: 'Bioma Profissional', slug: 'bioma-profissional', parentId: 'brand-bioma' },
        ] };
      }
      return { ok: true, json: async () => [] };
    }));

    render(<BrowserRouter><ShopPage /></BrowserRouter>);

    expect(await screen.findByRole('checkbox', { name: 'BIOMA CARE' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Meu Tudo!' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Nova-marca' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Expandir submarcas de BIOMA CARE' }));
    expect(screen.getByRole('checkbox', { name: 'Bioma Profissional' })).toBeInTheDocument();
  });

  it('paginates the imported catalogue in groups of twelve products', async () => {
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

    expect(await screen.findByText('Exibindo 1–12 de 34 resultados')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Ver produto: Produto/ })).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Página 3' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(await screen.findByText('Exibindo 13–24 de 34 resultados')).toBeInTheDocument();
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
    expect(await screen.findByRole('img', { name: 'Grandha' })).toHaveAttribute('src', '/brands/grandha.webp');
    expect(document.querySelector('input[aria-label="Grandha"]')?.parentElement?.querySelector('img')).toHaveAttribute('src', '/storage/uploads/grandha/960.webp');
  });

  it('shows only the seven published storefront brands in the reference rail', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/catalog/products')) return { ok: true, json: async () => [] } as Response;
      if (String(input).includes('/catalog/brands')) return { ok: true, json: async () => [
        { id: 'brand-1', name: 'BIOMA CARE', slug: 'bioma-care' },
        { id: 'brand-2', name: 'Grandha', slug: 'grandha' },
        { id: 'brand-3', name: 'HASKELL', slug: 'haskell' },
        { id: 'brand-4', name: 'KNUT', slug: 'knut' },
        { id: 'brand-5', name: 'Maxiline', slug: 'maxiline' },
        { id: 'brand-6', name: 'Meu Tudo!', slug: 'meu-tudo' },
        { id: 'brand-7', name: 'Nova-marca', slug: 'nova-marca' },
        { id: 'brand-8', name: 'OH MY', slug: 'oh-my' },
        { id: 'brand-9', name: 'Senscience', slug: 'senscience' },
      ] } as Response;
      return { ok: true, json: async () => [] } as Response;
    }));

    render(<BrowserRouter><ShopPage /></BrowserRouter>);

    const rail = await screen.findByRole('region', { name: 'Compre por marca' });
    expect(Array.from(rail.querySelectorAll('.brand-rail__item')).map((item) => item.textContent?.trim())).toEqual(['Haskell', 'Grandha', 'Maxiline', 'KNUT', 'Bioma Care', 'Oh My', 'Senscience']);
    expect(rail).not.toHaveTextContent('Nova-marca');
    expect(rail).not.toHaveTextContent('Meu Tudo!');
    expect(screen.queryByRole('checkbox', { name: 'Nova-marca' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Meu Tudo!' })).toBeInTheDocument();
  });

  it('opens a product detail from the card action', async () => {
    const user = userEvent.setup();
    const products = [{
      publicId: 'product-1',
      slug: 'produto-1',
      name: 'Produto 1',
      status: 'ACTIVE',
      variants: [{ id: 'variant-1', priceCents: 1000, status: 'ACTIVE', images: [] }],
      images: [],
    }];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/catalog/products')) return { ok: true, json: async () => products } as Response;
      if (url.includes('/catalog/brands') || url.includes('/catalog/categories')) return { ok: true, json: async () => [] } as Response;
      return { ok: false, json: async () => ({}) } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/loja']}>
        <Routes>
          <Route path="/loja" element={<ShopPage />} />
          <Route path="/produto/:slug" element={<h1>Detalhe do produto</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('link', { name: 'Ver produto: Produto 1' }));
    expect(await screen.findByRole('heading', { name: 'Detalhe do produto' })).toBeInTheDocument();
    expect(fetchMock.mock.calls.every(([input]) => !String(input).includes('/api/v1/carts'))).toBe(true);
  });
});
