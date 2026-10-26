/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ContatoSegurancaPage from './page';

const mockUpdateProfile = vi.fn().mockResolvedValue({ ok: true });
const mockChangePassword = vi.fn().mockResolvedValue({ ok: true });

let mockUserState = {
  id: 'usr-1',
  email: 'victor@loja.com',
  firstName: 'Victor',
  lastName: 'Williames',
  fullName: 'Victor Williames',
  phone: '(91) 98344-0880',
  document: '000.000.000-00',
  birthDate: '1990-01-01',
};

vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    user: mockUserState,
    isAuthenticated: true,
    ready: true,
    checkEmail: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: mockUpdateProfile,
    changePassword: mockChangePassword,
    logout: vi.fn(),
  }),
}));

describe('ContatoSegurancaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders contact inputs with current values', () => {
    render(<ContatoSegurancaPage />);

    const emailInput = screen.getByLabelText(/e-mail de acesso/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/whatsapp principal/i) as HTMLInputElement;

    expect(emailInput.value).toBe('victor@loja.com');
    expect(phoneInput.value).toBe('(91) 98344-0880');
  });

  it('submits updated contact information successfully', async () => {
    render(<ContatoSegurancaPage />);

    const emailInput = screen.getByLabelText(/e-mail de acesso/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'novo@loja.com' } });

    const submitContactBtn = screen.getByRole('button', { name: /salvar contato/i });
    fireEvent.click(submitContactBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'novo@loja.com',
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/e-mail e telefone atualizados com sucesso/i),
      ).toBeTruthy();
    });
  });
});
