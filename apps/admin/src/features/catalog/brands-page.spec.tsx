/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandsPage } from './brands-page';

const mockBrands = [
  {
    id: 'brand-1',
    name: 'Fasapel',
    slug: 'fasapel',
    status: 'ACTIVE',
    description: 'Papéis profissionais',
    parentId: null,
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-fasapel.png',
  },
  {
    id: 'brand-2',
    name: 'Guardanapos & Toalhas',
    slug: 'fasapel-guardanapos-toalhas',
    status: 'ACTIVE',
    description: 'Linha de guardanapos',
    parentId: 'brand-1',
  },
  {
    id: 'brand-3',
    name: 'Lanchero',
    slug: 'lanchero',
    status: 'ACTIVE',
    description: 'Embalagens para lanche',
    parentId: null,
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-lanchero.png',
  },
];

const mockProducts = [
  { id: 'prod-1', brand: { id: 'brand-1', name: 'Fasapel' } },
  { id: 'prod-2', brand: { id: 'brand-2', name: 'Guardanapos & Toalhas' } },
];

describe('BrandsPage (WordPress Marcas e Submarcas Experience)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/admin/catalog/brands')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockBrands,
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

  it('renders heading, add brand form with hierarchy and brands table', async () => {
    render(<BrandsPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Marcas de produto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Adicionar nova marca' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Marca ascendente')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();

    expect(screen.getAllByText('Fasapel').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('— Guardanapos & Toalhas')).toBeInTheDocument();
    expect(screen.getAllByText('Lanchero').length).toBeGreaterThanOrEqual(1);
  });

  it('calculates total product counts including subbrands', async () => {
    render(<BrandsPage />);

    const fasapelBadge = await screen.findByTitle('Ver produtos da marca Fasapel');
    // Fasapel has 1 direct product + 1 subbrand product = 2
    expect(fasapelBadge).toHaveTextContent('2');

    const subbrandBadge = await screen.findByTitle('Ver produtos da marca Guardanapos & Toalhas');
    // Guardanapos has 1 product
    expect(subbrandBadge).toHaveTextContent('1');
  });
});
