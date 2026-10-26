import { describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';
import { defaultHomeComposition } from '@/lib/storefront/home-configuration';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('API Route /api/storefront/composition', () => {
  it('GET retorna sucesso e a composição de widgets', async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.page).toBe('home');
    expect(Array.isArray(json.data.widgets)).toBe(true);
  });

  it('POST rejeita requisição de usuário comum / não administrador com 403', async () => {
    const request = new Request('http://localhost:3001/api/storefront/composition', {
      method: 'POST',
      body: JSON.stringify(defaultHomeComposition),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(request);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('Acesso negado');
  });

  it('POST autoriza e persiste quando enviado por administrador autenticado', async () => {
    const request = new Request('http://localhost:3001/api/storefront/composition', {
      method: 'POST',
      body: JSON.stringify(defaultHomeComposition),
      headers: {
        'Content-Type': 'application/json',
        'x-admin-role': 'ADMIN',
      },
    });

    const res = await POST(request);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('salva no servidor');
    expect(json.widgetsCount).toBeGreaterThan(0);
  });
});
