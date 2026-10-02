import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard, type StoreProduct } from './product-card';

const product: StoreProduct = {
  publicId: 'product-1',
  slug: 'acidificante-redutor-de-ph',
  name: 'Acidificante Redutor de pH 500ml (Extrato de Açaí e Óleo de Pracaxi)',
  brandName: 'Haskell',
  price: { amount: 19000, currency: 'BRL' },
  available: true,
  variantId: 'variant-1',
};

describe('ProductCard', () => {
  afterEach(() => cleanup());

  it('clamps long product names while exposing the full title and a view-product action', () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} catalogAppearance />
      </MemoryRouter>,
    );

    const heading = screen.getByRole('heading', { name: product.name });
    const titleLink = within(heading).getByRole('link', { name: product.name });
    expect(titleLink).toHaveAttribute('aria-describedby', `product-card-tooltip-${product.slug}`);
    expect(screen.getByRole('tooltip')).toHaveTextContent(product.name);

    const viewProductLink = screen.getByRole('link', { name: `Ver produto: ${product.name}` });
    expect(viewProductLink).toHaveAttribute('href', `/produto/${product.slug}`);
    expect(viewProductLink).toHaveTextContent('Ver produto');
    expect(viewProductLink.querySelector('[data-icon="eye"]')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Adicionar .* ao carrinho/ })).not.toBeInTheDocument();
  });
});
