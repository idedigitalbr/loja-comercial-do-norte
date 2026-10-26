import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeBannersPage } from './home-banners-page';

describe('HomeBannersPage', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the visual editor landing page and action button to open editor', () => {
    render(<HomeBannersPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Editar Páginas e Banners' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Edição Direta na Vitrine da Comercial do Norte' })).toBeInTheDocument();

    const openButton = screen.getByRole('link', { name: /Abrir Editor Visual da Vitrine/i });
    expect(openButton).toBeInTheDocument();
    expect(openButton).toHaveAttribute('target', '_blank');
    expect(openButton).toHaveAttribute('href', expect.stringContaining('/?editor=1'));
  });
});
