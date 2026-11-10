import { describe, expect, it, vi } from 'vitest';
import MaisVendidosPage from './page';

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

describe('MaisVendidosPage (/mais-vendidos)', () => {
  it('redireciona para /loja?ordem=mais_vendidos preservando outros parâmetros', async () => {
    await MaisVendidosPage({
      searchParams: Promise.resolve({ categoria: 'descartaveis' }),
    });

    expect(mockRedirect).toHaveBeenCalledWith('/loja?categoria=descartaveis&ordem=mais_vendidos');
  });

  it('redireciona para /loja?ordem=mais_vendidos quando sem parâmetros adicionais', async () => {
    await MaisVendidosPage({
      searchParams: Promise.resolve({}),
    });

    expect(mockRedirect).toHaveBeenCalledWith('/loja?ordem=mais_vendidos');
  });
});
