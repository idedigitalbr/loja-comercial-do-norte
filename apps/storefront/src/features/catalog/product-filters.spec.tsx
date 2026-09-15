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
