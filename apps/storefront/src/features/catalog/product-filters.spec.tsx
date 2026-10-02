import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ProductFilters } from './product-filters';

describe('ProductFilters', () => {
  afterEach(() => cleanup());

  it('allows a main brand to collapse and expand its sub-brands', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <ProductFilters
          brands={[
            { id: 'grandha', label: 'Grandha', value: 'grandha', depth: 0 },
            { id: 'alkumia', label: 'Alkumia', value: 'alkumia', parentId: 'grandha', depth: 1 },
          ]}
          categories={[]}
        />
      </BrowserRouter>,
    );

    expect(screen.queryByLabelText('Alkumia')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expandir submarcas de Grandha' }));
    expect(screen.getByLabelText('Alkumia')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Recolher submarcas de Grandha' }));
    expect(screen.queryByLabelText('Alkumia')).not.toBeInTheDocument();
  });

  it('keeps expanded brand options inside a dedicated scroll region', () => {
    render(
      <BrowserRouter>
        <ProductFilters
          brands={[
            { id: 'grandha', label: 'Grandha', value: 'grandha', depth: 0 },
            { id: 'alkumia', label: 'Alkumia', value: 'alkumia', parentId: 'grandha', depth: 1 },
          ]}
          categories={[{ label: 'Shampoo', value: 'shampoo' }]}
        />
      </BrowserRouter>,
    );

    const scrollRegion = screen.getByTestId('catalog-filters-scroll');
    expect(scrollRegion).toHaveClass('catalog-sidebar__filters');
    const fieldsets = scrollRegion.querySelectorAll('fieldset');
    expect(fieldsets).toHaveLength(2);
    expect(fieldsets[0]).toHaveTextContent('Filtro Categoria Produtos');
    expect(fieldsets[1]).toHaveTextContent('Filtro sub marcas');
  });

  it('keeps sub-brands collapsed when the imported taxonomy arrives after the fallback', () => {
    const { rerender } = render(
      <BrowserRouter>
        <ProductFilters brands={[]} categories={[]} />
      </BrowserRouter>,
    );

    rerender(
      <BrowserRouter>
        <ProductFilters
          brands={[
            { id: 'grandha', label: 'Grandha', value: 'grandha', depth: 0 },
            { id: 'alkumia', label: 'Alkumia', value: 'alkumia', parentId: 'grandha', depth: 1 },
          ]}
          categories={[]}
        />
      </BrowserRouter>,
    );

    expect(screen.queryByLabelText('Alkumia')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir submarcas de Grandha' })).toHaveAttribute('aria-expanded', 'false');
  });
});
