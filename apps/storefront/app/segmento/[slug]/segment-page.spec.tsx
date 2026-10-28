/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import SegmentPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api', () => ({
  getSegments: vi.fn().mockResolvedValue([
    { id: 'seg_lanchonete', name: 'Lanchonetes & Hamburguerias', slug: 'lanchonete' },
    { id: 'seg_pizzaria', name: 'Pizzarias & Esfiharias', slug: 'pizzaria' },
  ]),
  getCategories: vi.fn().mockResolvedValue([]),
  getTags: vi.fn().mockResolvedValue([]),
  getBrands: vi.fn().mockResolvedValue([]),
  getProductsPage: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  }),
}));

afterEach(cleanup);

describe('SegmentPage (/segmento/[slug])', () => {
  it('renderiza a seção de sugestões de conteúdo "Explica Aí Nort" acima do footer para o segmento lanchonete', async () => {
    const Component = await SegmentPage({
      params: Promise.resolve({ slug: 'lanchonete' }),
      searchParams: Promise.resolve({}),
    });

    render(Component);

    // Verifica a presença da marca Explica Aí Nort
    expect(screen.getByText('Explica Aí')).toBeDefined();
    expect(screen.getByText('Nort!')).toBeDefined();
    expect(screen.getByText('Dicas em vídeos e artigos')).toBeDefined();
    expect(screen.getByText('para você usar no seu negócio.')).toBeDefined();

    // Verifica que os cards sugeridos para lanchonete foram renderizados
    expect(screen.getByText('Embalagens kraft para o seu delivery')).toBeDefined();
    expect(screen.getByText('Copos e tampas para açaí e café')).toBeDefined();
    expect(screen.getByText('DELIVERY')).toBeDefined();
    expect(screen.getByText('LINHA KRAFT')).toBeDefined();
    expect(screen.getByText('AÇAÍ & CAFÉ')).toBeDefined();

    // Verifica a presença do link Ver todos
    const verTodosLink = screen.getByText('Ver todos');
    expect(verTodosLink).toBeDefined();
    expect(verTodosLink.closest('a')?.getAttribute('href')).toBe('/post');
  });

  it('renderiza a seção de sugestões de conteúdo específica para pizzaria', async () => {
    const Component = await SegmentPage({
      params: Promise.resolve({ slug: 'pizzaria' }),
      searchParams: Promise.resolve({}),
    });

    render(Component);

    expect(
      screen.getByText('Caixas de pizza: formatos e respiros que preservam a massa')
    ).toBeDefined();
    expect(screen.getByText('PIZZARIAS')).toBeDefined();
    expect(screen.getByText('TRANSPORTE SEGURO')).toBeDefined();
  });
});
