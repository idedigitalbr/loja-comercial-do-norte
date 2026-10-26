import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { LoginPage, getStorefrontLoginUrl } from './features/auth/login-page';

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
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', getStorefrontLoginUrl());
  });

  it('redirects an expired session to the storefront login without a second form', async () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { origin: 'http://localhost:5174', replace });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    render(<App />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('http://localhost:3001/login'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
  });

  it('reuses a server-verified administrator session', async () => {
    const onAuthenticated = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { email: 'admin@teste.com', roles: ['ADMIN'] } }),
    }));
    render(<LoginPage onAuthenticated={onAuthenticated} />);
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith('admin@teste.com'));
  });

  it('offers recovery when the session API is unavailable', async () => {
    const onAuthenticated = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<LoginPage onAuthenticated={onAuthenticated} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível verificar sua sessão.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it('uses the configured storefront origin for the shared login', () => {
    vi.stubEnv('VITE_STOREFRONT_URL', 'https://loja.example/loja');
    try {
      expect(getStorefrontLoginUrl('https://painel.example')).toBe('https://loja.example/login');
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
