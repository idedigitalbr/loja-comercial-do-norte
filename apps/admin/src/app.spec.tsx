import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';

describe('admin app authentication boundary & design system branding', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('does not promote a customer session to the administrative dashboard and displays Comercial do Norte branding', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { email: 'cliente@teste.com', roles: ['CUSTOMER'], permissions: [] } }),
    }));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Esta conta não possui acesso ao painel administrativo.');
    expect(screen.getByText('Comercial do Norte')).toBeInTheDocument();
    expect(screen.queryByText(/Jonas/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Painel administrativo')).not.toBeInTheDocument();
  });
});
