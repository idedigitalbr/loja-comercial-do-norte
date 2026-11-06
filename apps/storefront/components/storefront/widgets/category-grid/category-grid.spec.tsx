/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { CategoryGridWidget } from './category-grid';

vi.mock('@/components/storefront/editor/elementor-editor-context', () => ({
  useElementor: () => ({
    isEditing: false,
    previewMode: false,
    updateWidgetProps: vi.fn(),
    openMediaModal: vi.fn(),
  }),
}));

describe('CategoryGridWidget', () => {
  afterEach(() => {
    cleanup();
  });

  const mockCategories = [
    { id: 'c1', label: 'Ofertas do Dia', imageUrl: '/icon1.png', linkUrl: '/ofertas' },
    { id: 'c2', label: 'Embalagens', imageUrl: '/icon2.png', linkUrl: '/embalagens' },
    { id: 'c3', label: 'Descartáveis', imageUrl: '/icon3.png', linkUrl: '/descartaveis' },
    { id: 'c4', label: 'Artigos para Festa', imageUrl: '/icon4.png', linkUrl: '/festa' },
    { id: 'c5', label: 'Doces e Confeitaria', imageUrl: '/icon5.png', linkUrl: '/doces' },
    { id: 'c6', label: 'Limpeza Profissional', imageUrl: '/icon6.png', linkUrl: '/limpeza' },
    { id: 'c7', label: 'Mais Vendidos', imageUrl: '/icon7.png', linkUrl: '/mais-vendidos' },
  ];

  it('exibe todos os ícones em uma única linha com rolagem horizontal no mobile e preserva o grid no desktop (Anexo 1)', () => {
    const { container } = render(
      <CategoryGridWidget
        customItems={mockCategories}
        title="Categorias"
        variant="icons-bar"
      />,
    );

    expect(screen.getByText('Ofertas do Dia')).toBeDefined();
    expect(screen.getByText('Mais Vendidos')).toBeDefined();

    const listContainer = container.querySelector('section > div');
    expect(listContainer).not.toBeNull();
    // Garante linha única sem quebra (flex-nowrap) e rolagem horizontal oculta (overflow-x-auto no-scrollbar)
    expect(listContainer?.className).toContain('flex-nowrap');
    expect(listContainer?.className).toContain('overflow-x-auto');
    expect(listContainer?.className).toContain('no-scrollbar');
    // Preserva grid de 7 colunas no desktop
    expect(listContainer?.className).toContain('sm:grid-cols-7');
  });
});
