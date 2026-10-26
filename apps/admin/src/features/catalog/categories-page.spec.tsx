import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoriesPage } from './categories-page';

const mockCategories = [
  { id: 'cat-1', name: 'Alimentos', slug: 'alimentos', status: 'ACTIVE', description: 'Produtos alimentícios' },
  { id: 'cat-2', name: 'Limpeza', slug: 'limpeza', status: 'ACTIVE', description: 'Produtos de limpeza' },
];

const mockProducts = [
  { id: 'prod-1', categories: [{ category: { id: 'cat-1' } }] },
  { id: 'prod-2', categories: [{ category: { id: 'cat-1' } }] },
  { id: 'prod-3', categories: [{ category: { id: 'cat-2' } }] },
];

describe('CategoriesPage (WordPress Categories 2-Column Experience)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/admin/catalog/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategories,
        });
      }
      if (url.includes('/api/v1/admin/catalog/products')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProducts,
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders heading, add category form and categories table', async () => {
    render(<CategoriesPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Categorias de produto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Adicionar nova categoria' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria ascendente')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();

    expect(screen.getByText('Alimentos')).toBeInTheDocument();
    expect(screen.getByText('Limpeza')).toBeInTheDocument();
  });

  it('displays accurate product counts for categories', async () => {
    render(<CategoriesPage />);

    // Cat-1 has 2 products, Cat-2 has 1 product
    expect(await screen.findByTitle('Ver produtos desta categoria')).toBeInTheDocument();
    const badges = screen.getAllByTitle('Ver produtos desta categoria');
    expect(badges[0]).toHaveTextContent('2');
    expect(badges[1]).toHaveTextContent('1');
  });
});
