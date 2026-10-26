/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { AuthFlowCard } from './auth-flow-card';
import * as AuthModule from './auth-provider';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
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
  const mockLogout = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      ready: true,
      checkEmail: mockCheckEmail,
      login: mockLogin,
      register: mockRegister,
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
  });
});
