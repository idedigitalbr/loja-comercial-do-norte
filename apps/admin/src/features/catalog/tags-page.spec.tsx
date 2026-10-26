import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TagsPage } from './tags-page';

const mockTags = [
  { id: 'tag-1', name: 'Itambé', slug: 'itambe', status: 'ACTIVE', description: 'Laticínios Itambé' },
  { id: 'tag-2', name: 'Ypê', slug: 'ype', status: 'ACTIVE', description: 'Produtos Ypê' },
];

const mockProducts = [
  { id: 'prod-1', brand: { id: 'tag-1', name: 'Itambé' } },
  { id: 'prod-2', brand: { id: 'tag-1', name: 'Itambé' } },
];

describe('TagsPage (WordPress Tags / Marcas Experience)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/admin/catalog/brands')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTags,
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

  it('renders heading, add tag form and tags table', async () => {
    render(<TagsPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Tags e marcas de produto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Adicionar nova tag' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();

    expect(screen.getByText('Itambé')).toBeInTheDocument();
    expect(screen.getByText('Ypê')).toBeInTheDocument();
  });

  it('displays accurate product counts for tags/marcas', async () => {
    render(<TagsPage />);

    const badges = await screen.findAllByTitle('Ver produtos desta marca');
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveTextContent('2'); // Itambé has 2
    expect(badges[1]).toHaveTextContent('0'); // Ypê has 0
  });
});
