/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserMenuDropdown } from './user-menu-dropdown';

// Mock do auth-provider
const mockLogout = vi.fn();
let mockAuthState = {
  user: null as any,
  isAuthenticated: false,
  logout: mockLogout,
};

vi.mock('./auth-provider', () => ({
  useAuth: () => mockAuthState,
}));

describe('UserMenuDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('renders "Boas vindas :)" and "Entre ou Cadastre-se" when logged out', () => {
    render(<UserMenuDropdown />);

    expect(screen.getByText('Boas vindas :)')).toBeTruthy();
    expect(screen.getByText('Entre ou Cadastre-se')).toBeTruthy();
    const link = screen.getByRole('link', { name: /entre ou cadastre-se/i });
    expect(link.getAttribute('href')).toBe('/login');
  });

  it('renders "Olá" and only first name when logged in as Victor Williames', () => {
    mockAuthState = {
      user: {
        id: 'usr-1',
        email: 'admin@admin.com',
        firstName: 'Victor',
        lastName: 'Williames',
        fullName: 'Victor Williames',
        isAdmin: true,
      },
      isAuthenticated: true,
      logout: mockLogout,
    };

    render(<UserMenuDropdown />);

    expect(screen.getByText('Olá')).toBeTruthy();
    expect(screen.getByText('Victor')).toBeTruthy();
    expect(screen.queryByText('Williames')).toBeNull();
  });

  it('does NOT open on mouse hover, but opens strictly on CLICK with dark backdrop and badges', () => {
    mockAuthState = {
      user: {
        id: 'usr-1',
        email: 'admin@admin.com',
        firstName: 'Victor',
        fullName: 'Victor Williames',
        isAdmin: true,
      },
      isAuthenticated: true,
      logout: mockLogout,
    };

    render(<UserMenuDropdown />);

    const triggerButton = screen.getByRole('button', { name: /menu da conta de victor/i });

    // Passar o mouse NÃO deve abrir o menu
    fireEvent.mouseEnter(triggerButton);
    expect(screen.queryByText('Sua conta')).toBeNull();

    // Clicar no botão DEVE abrir o menu
    fireEvent.click(triggerButton);

    // O menu e os badges devem estar visíveis
    expect(screen.getByText('Sua conta')).toBeTruthy();
    expect(screen.getByText('ADM EDITOR')).toBeTruthy();
    expect(screen.getByText('CLIENTE OURO')).toBeTruthy();
    expect(screen.getByText('9.2100 PTS')).toBeTruthy();
    expect(screen.getByText('Meus pedidos')).toBeTruthy();
    expect(screen.getByText('Fale com lojista')).toBeTruthy();
    expect(screen.getByRole('button', { name: /sair/i })).toBeTruthy();

    // Clicar novamente no botão DEVE fechar o menu
    fireEvent.click(triggerButton);
    expect(screen.queryByText('Sua conta')).toBeNull();
  });

  it('points each button to its proper dedicated section', () => {
    mockAuthState = {
      user: {
        id: 'usr-1',
        email: 'victor@loja.com',
        firstName: 'Victor',
        fullName: 'Victor Williames',
        isAdmin: true,
      },
      isAuthenticated: true,
      logout: mockLogout,
    };

    render(<UserMenuDropdown />);

    const triggerButton = screen.getByRole('button', { name: /menu da conta de victor/i });
    fireEvent.click(triggerButton);

    const contaLink = screen.getByText('Sua conta').closest('a');
    expect(contaLink?.getAttribute('href')).toBe('/conta');

    const pedidosLink = screen.getByText('Meus pedidos').closest('a');
    expect(pedidosLink?.getAttribute('href')).toBe('/conta/pedidos');

    const trocasLink = screen.getByText('Trocas e cancelamentos').closest('a');
    expect(trocasLink?.getAttribute('href')).toBe('/conta/trocas');

    const dadosLink = screen.getByText('Dados pessoais').closest('a');
    expect(dadosLink?.getAttribute('href')).toBe('/conta/dados-pessoais');

    const contatoLink = screen.getByText('Alterar e-mail ou telefone').closest('a');
    expect(contatoLink?.getAttribute('href')).toBe('/conta/contato');

    const lojistaLink = screen.getByText('Fale com lojista').closest('a');
    expect(lojistaLink?.getAttribute('href')).toBe('/conta/atendimento');

    const ouroBadge = screen.getByText('CLIENTE OURO').closest('a');
    expect(ouroBadge?.getAttribute('href')).toBe('/conta/fidelidade');

    const ptsBadge = screen.getByText('9.2100 PTS').closest('a');
    expect(ptsBadge?.getAttribute('href')).toBe('/conta/fidelidade');
  });

  it('closes when Escape key is pressed', () => {
    mockAuthState = {
      user: {
        id: 'usr-1',
        email: 'cliente@demo.com',
        firstName: 'Cliente',
        fullName: 'Cliente Comercial',
        isAdmin: false,
      },
      isAuthenticated: true,
      logout: mockLogout,
    };

    render(<UserMenuDropdown />);

    const triggerButton = screen.getByRole('button', { name: /menu da conta de cliente/i });
    fireEvent.click(triggerButton);

    expect(screen.getByText('Sua conta')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Sua conta')).toBeNull();
  });
});
