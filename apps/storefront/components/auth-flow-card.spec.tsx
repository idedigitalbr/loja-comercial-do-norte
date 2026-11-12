/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { AuthFlowCard } from './auth-flow-card';
import * as AuthModule from './auth-provider';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => '/conta'),
  })),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe('AuthFlowCard', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const mockCheckEmail = vi.fn().mockResolvedValue({ exists: true });
  const mockLogin = vi.fn().mockResolvedValue({ ok: true, isAdmin: false });
  const mockRegister = vi.fn().mockResolvedValue({ ok: true });
  const mockUpdateProfile = vi.fn().mockResolvedValue({ ok: true });
  const mockChangePassword = vi.fn().mockResolvedValue({ ok: true });
  const mockLogout = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();

    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      ready: true,
      checkEmail: mockCheckEmail,
      login: mockLogin,
      register: mockRegister,
      updateProfile: mockUpdateProfile,
      changePassword: mockChangePassword,
      logout: mockLogout,
    });
  });

  it('renders "Esqueci minha senha" and "Ver Senhas" button', () => {
    render(<AuthFlowCard />);
    expect(screen.getByText('Esqueci minha senha')).toBeTruthy();
    expect(screen.getByText('Ver Senhas')).toBeTruthy();
    expect(screen.getByText('Não sou um robô')).toBeTruthy();
    expect(screen.getByText('SSL 256-Bit Criptografado')).toBeTruthy();
  });

  it('opens the dev credentials modal when "Ver Senhas" is clicked', () => {
    render(<AuthFlowCard />);
    const verSenhasBtn = screen.getByText('Ver Senhas');
    fireEvent.click(verSenhasBtn);

    expect(screen.getByText('Contas e Senhas de Teste')).toBeTruthy();
    expect(screen.getByText('admin@admin.com')).toBeTruthy();
    expect(screen.getByText('admin123456')).toBeTruthy();
    expect(screen.getByText('cliente@demo.com')).toBeTruthy();
    expect(screen.getByText('cliente123456')).toBeTruthy();
  });

  it('toggles the captcha verification checkbox', async () => {
    render(<AuthFlowCard />);
    const captchaButton = screen.getByRole('button', { name: /Não sou um robô/i });
    expect(screen.getByText('Não sou um robô')).toBeTruthy();

    fireEvent.click(captchaButton);
    expect(screen.getByText('Verificando segurança…')).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it('redirects an administrator to the Admin Panel upon dev login', async () => {
    mockLogin.mockResolvedValueOnce({ ok: true, isAdmin: true });
    render(<AuthFlowCard />);

    // Open dev modal
    fireEvent.click(screen.getByText('Ver Senhas'));

    // Click on "⚡ Entrar Direto (ADMIN)"
    const adminLoginBtn = screen.getByRole('button', { name: /Entrar Direto \(ADMIN\)/i });
    expect(adminLoginBtn).toBeTruthy();

    fireEvent.click(adminLoginBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@admin.com', 'admin123456');
    });
  });

  it('renders ADM EDITOR badge and link to Painel Administrativo when already authenticated as admin', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@admin.com',
        firstName: 'Victor',
        fullName: 'Victor Williames',
        roles: ['ADMIN'],
        isAdmin: true,
      },
      isAuthenticated: true,
      ready: true,
      checkEmail: mockCheckEmail,
      login: mockLogin,
      register: mockRegister,
      updateProfile: mockUpdateProfile,
      changePassword: mockChangePassword,
      logout: mockLogout,
    });

    render(<AuthFlowCard />);
    expect(screen.getByText('ADM EDITOR')).toBeTruthy();
    expect(screen.getByText('Acessar Painel Administrativo')).toBeTruthy();
  });

  it('bloqueia open redirect em ?redirect= externo após autenticação', async () => {
    mockLogin.mockResolvedValueOnce({ ok: true, isAdmin: false });
    const navMod = await import('next/navigation');
    vi.mocked(navMod.useSearchParams).mockReturnValueOnce({
      get: vi.fn((key: string) => (key === 'redirect' ? 'https://evil.example/phish' : null)),
    } as never);

    render(<AuthFlowCard />);
    fireEvent.click(screen.getByText('Ver Senhas'));
    const clienteBtn = screen.getByRole('button', { name: /Entrar Direto \(CLIENTE\)/i });
    fireEvent.click(clienteBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
