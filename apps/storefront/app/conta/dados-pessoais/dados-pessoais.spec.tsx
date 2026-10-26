/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DadosPessoaisPage from './page';

const mockUpdateProfile = vi.fn().mockResolvedValue({ ok: true });
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
    changePassword: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('DadosPessoaisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders initial user values in the inputs', () => {
    render(<DadosPessoaisPage />);

    const firstNameInput = screen.getByLabelText(/primeiro nome/i) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(/sobrenome/i) as HTMLInputElement;

    expect(firstNameInput.value).toBe('Victor');
    expect(lastNameInput.value).toBe('Williames');
  });

  it('updates the name when the user edits and clicks save', async () => {
    render(<DadosPessoaisPage />);

    const firstNameInput = screen.getByLabelText(/primeiro nome/i) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: 'Carlos' } });

    const submitBtn = screen.getByRole('button', { name: /salvar alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Carlos',
          lastName: 'Williames',
          fullName: 'Carlos Williames',
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/dados pessoais atualizados com sucesso/i),
      ).toBeTruthy();
    });
  });
});
