import { describe, expect, it, vi } from 'vitest';
import OfertasPage from './page';

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

describe('OfertasPage (/ofertas)', () => {
  it('redireciona para /loja?oferta=1 preservando outros parâmetros', async () => {
    await OfertasPage({
      searchParams: Promise.resolve({ categoria: 'descartaveis' }),
    });

    expect(mockRedirect).toHaveBeenCalledWith('/loja?categoria=descartaveis&oferta=1');
  });

  it('redireciona para /loja?oferta=1 quando sem parâmetros adicionais', async () => {
    await OfertasPage({
      searchParams: Promise.resolve({}),
    });

    expect(mockRedirect).toHaveBeenCalledWith('/loja?oferta=1');
  });
});
