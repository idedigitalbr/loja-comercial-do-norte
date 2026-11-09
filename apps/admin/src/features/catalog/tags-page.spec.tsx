/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TagsPage } from './tags-page';

const mockTags = [
  { id: 'tag-1', name: 'Biodegradável', slug: 'biodegradavel', status: 'ACTIVE', description: 'Produtos ecológicos' },
  { id: 'tag-2', name: 'Kraft', slug: 'kraft', status: 'ACTIVE', description: 'Papel kraft e derivados' },
];

const mockProducts = [
  { id: 'prod-1', tags: [{ tag: { id: 'tag-1', name: 'Biodegradável' } }] },
  { id: 'prod-2', tags: [{ tag: { id: 'tag-1', name: 'Biodegradável' } }] },
];

describe('TagsPage (WordPress Tags Experience)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/admin/catalog/tags')) {
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

    expect(await screen.findByRole('heading', { level: 1, name: 'Tags de produto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Adicionar nova tag' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();

    expect(screen.getByText('Biodegradável')).toBeInTheDocument();
    expect(screen.getByText('Kraft')).toBeInTheDocument();
  });

  it('displays accurate product counts for tags', async () => {
    render(<TagsPage />);

    const badges = await screen.findAllByTitle('Ver produtos desta tag');
    expect(badges[0]).toHaveTextContent('2'); // Biodegradável has 2
    expect(badges[1]).toHaveTextContent('0'); // Kraft has 0
  });
});
