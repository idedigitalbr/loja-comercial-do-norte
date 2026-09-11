import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ShopPage } from './shop-page';

describe('ShopPage', () => {
  it('keeps brand and category filters in the URL', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/loja');
    render(
      <BrowserRouter>
        <ShopPage />
      </BrowserRouter>,
    );

    await user.click(screen.getByLabelText('Haskell'));
    await user.click(screen.getByLabelText('Shampoo'));

    expect(window.location.search).toContain('brand=haskell');
    expect(window.location.search).toContain('category=shampoo');
  });
});
