import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductListPage } from './product-list-page';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Detergente Neutro 5L',
    slug: 'detergente-neutro-5l',
    status: 'ACTIVE',
    brand: { id: 'brand-1', name: 'Limpeza Pro', slug: 'limpeza-pro' },
    categories: [{ category: { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', status: 'ACTIVE' } }],
    variants: [
      {
        id: 'var-1',
        sku: 'DET-5L',
        priceCents: 2490,
        stockStatus: 'IN_STOCK',
        inventoryBalance: { physicalQuantity: 15, reservedQuantity: 0 },
      },
    ],
    images: [{ path: '/assets/PRODUTOS/placeholders/placeholder-1.png', isPrimary: true }],
  },
  {
    id: 'prod-2',
    name: 'Esponja Multiuso',
    slug: 'esponja-multiuso',
    status: 'DRAFT',
    brand: { id: 'brand-1', name: 'Limpeza Pro', slug: 'limpeza-pro' },
    categories: [{ category: { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', status: 'ACTIVE' } }],
    variants: [
      {
        id: 'var-2',
        sku: 'ESP-01',
        priceCents: 350,
        stockStatus: 'OUT_OF_STOCK',
        inventoryBalance: { physicalQuantity: 0, reservedQuantity: 0 },
      },
    ],
    images: [],
  },
];

const mockCategories = [
  { id: 'cat-1', name: 'Limpeza', slug: 'limpeza', status: 'ACTIVE' },
];

const mockBrands = [
  { id: 'brand-1', name: 'Limpeza Pro', slug: 'limpeza-pro', status: 'ACTIVE' },
];

describe('ProductListPage (WooCommerce / WordPress Experience)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/admin/catalog/products')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProducts,
        });
      }
      if (url.includes('/api/v1/admin/catalog/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategories,
        });
      }
      if (url.includes('/api/v1/admin/catalog/brands')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockBrands,
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the WordPress heading with Adicionar novo, Importar, Exportar', async () => {
    const onCreate = vi.fn();
    render(<ProductListPage onCreate={onCreate} onEdit={vi.fn()} />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Produtos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar novo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Importar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar novo' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('renders status views (Tudo, Publicados, Rascunhos, Em destaque, Lixeira)', async () => {
    render(<ProductListPage onCreate={vi.fn()} onEdit={vi.fn()} />);

    expect(await screen.findByText('Detergente Neutro 5L')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tudo/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publicados/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rascunhos/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Em destaque/ })).toBeInTheDocument();
  });

  it('renders the featured status filter and stock status filter', async () => {
    render(<ProductListPage onCreate={vi.fn()} onEdit={vi.fn()} />);

    expect(await screen.findByText('Detergente Neutro 5L')).toBeInTheDocument();

    const featuredSelect = screen.getByDisplayValue('Filtrar por destaque');
    expect(featuredSelect).toBeInTheDocument();

    const stockSelect = screen.getByDisplayValue('Filtrar por status de estoque');
    expect(stockSelect).toBeInTheDocument();
  });

  it('toggles featured product star and updates filter reactive state', async () => {
    render(<ProductListPage onCreate={vi.fn()} onEdit={vi.fn()} />);

    expect(await screen.findByText('Detergente Neutro 5L')).toBeInTheDocument();

    // Star buttons for the products
    const starButtons = screen.getAllByRole('button', { name: /Produto não destacado/ });
    expect(starButtons.length).toBeGreaterThanOrEqual(1);

    // Toggle star on first product
    fireEvent.click(starButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Produto em destaque' })).toBeInTheDocument();
    });

    // Filter by featured
    const featuredSelect = screen.getByDisplayValue('Filtrar por destaque');
    fireEvent.change(featuredSelect, { target: { value: 'featured' } });

    // Detergente should remain, Esponja should be filtered out
    expect(screen.getByText('Detergente Neutro 5L')).toBeInTheDocument();
    expect(screen.queryByText('Esponja Multiuso')).not.toBeInTheDocument();
  });

  it('opens quick edit inline panel on click', async () => {
    render(<ProductListPage onCreate={vi.fn()} onEdit={vi.fn()} />);

    expect(await screen.findByText('Detergente Neutro 5L')).toBeInTheDocument();

    const quickEditButtons = screen.getAllByRole('button', { name: 'Edição rápida' });
    fireEvent.click(quickEditButtons[0]);

    expect(screen.getByRole('heading', { level: 4, name: 'Edição rápida' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
  });
});
