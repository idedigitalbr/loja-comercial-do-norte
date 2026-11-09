/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostListPage } from './post-list-page';

const mockPosts = [
  {
    id: 'post-1',
    title: 'Decoração de doces e bolos com chantilly profissional',
    slug: 'decoracao-doces-bolos-chantilly',
    excerpt: 'Dicas práticas para confeitaria.',
    content: '<p>Conteúdo completo do post</p>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    authorName: 'Comercial do Norte',
    badges: ['CONFEITARIA', 'DOCES & BOLOS'],
    status: 'ACTIVE',
    publishedAt: '2026-10-27T10:00:00.000Z',
    views: 120,
    category: { id: 'cat-1', name: 'Confeitaria & Festas', slug: 'confeitaria-festas' },
    createdAt: '2026-10-27T10:00:00.000Z',
  },
  {
    id: 'post-2',
    title: 'Caixas de pizza: formatos e respiros',
    slug: 'caixas-de-pizza-formatos',
    excerpt: 'Como escolher embalagens ideais.',
    content: '<p>Conteúdo sobre caixas</p>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    authorName: 'Comercial do Norte',
    badges: ['PIZZARIA', 'DELIVERY'],
    status: 'DRAFT',
    publishedAt: '2026-10-28T10:00:00.000Z',
    views: 45,
    category: { id: 'cat-2', name: 'Embalagens & Delivery', slug: 'embalagens-delivery' },
    createdAt: '2026-10-28T10:00:00.000Z',
  },
];

const mockCategories = [
  { id: 'cat-1', name: 'Confeitaria & Festas', slug: 'confeitaria-festas' },
  { id: 'cat-2', name: 'Embalagens & Delivery', slug: 'embalagens-delivery' },
];

describe('PostListPage (WordPress Admin Experience)', () => {
  const onCreate = vi.fn();
  const onEdit = vi.fn();
  const onManageCategories = vi.fn();

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('/api/v1/admin/posts/categories')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockCategories,
          });
        }
        if (url.includes('/api/v1/admin/posts')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ items: mockPosts }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the WordPress heading with Adicionar novo and Categorias', async () => {
    render(
      <PostListPage
        onCreate={onCreate}
        onEdit={onEdit}
        onManageCategories={onManageCategories}
      />
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'Posts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar novo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Categorias de post' })).toBeInTheDocument();
  });

  it('renders status views (Tudo, Publicados, Rascunhos) with counts', async () => {
    render(
      <PostListPage
        onCreate={onCreate}
        onEdit={onEdit}
        onManageCategories={onManageCategories}
      />
    );

    expect(await screen.findByRole('button', { name: /Tudo/ })).toHaveTextContent('Tudo (2)');
    expect(screen.getByRole('button', { name: /Publicados/ })).toHaveTextContent('Publicados (1)');
    expect(screen.getByRole('button', { name: /Rascunhos/ })).toHaveTextContent('Rascunhos (1)');
  });

  it('renders table columns, post title, author and row actions', async () => {
    render(
      <PostListPage
        onCreate={onCreate}
        onEdit={onEdit}
        onManageCategories={onManageCategories}
      />
    );

    expect(
      await screen.findByText('Decoração de doces e bolos com chantilly profissional')
    ).toBeInTheDocument();
    expect(screen.getByText('Caixas de pizza: formatos e respiros')).toBeInTheDocument();

    const editButtons = screen.getAllByRole('button', { name: 'Editar' });
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith('post-1');
  });

  it('filters posts by status view when clicking Rascunhos', async () => {
    render(
      <PostListPage
        onCreate={onCreate}
        onEdit={onEdit}
        onManageCategories={onManageCategories}
      />
    );

    const draftTab = await screen.findByRole('button', { name: /Rascunhos/ });
    fireEvent.click(draftTab);

    expect(screen.getByText('Caixas de pizza: formatos e respiros')).toBeInTheDocument();
    expect(
      screen.queryByText('Decoração de doces e bolos com chantilly profissional')
    ).not.toBeInTheDocument();
  });
});
