import { vi, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';

const { helmetSpy } = vi.hoisted(() => ({ helmetSpy: vi.fn(() => vi.fn()) }));
vi.mock('helmet', () => ({ default: helmetSpy }));

import { configureApp } from './main';

function buildApp() {
  const enableCors = vi.fn();
  const app = {
    getHttpAdapter: () => ({ getInstance: () => ({ use: vi.fn() }) }),
    setGlobalPrefix: vi.fn(),
    enableCors,
    use: vi.fn(),
    useGlobalPipes: vi.fn(),
    useGlobalInterceptors: vi.fn(),
    useGlobalFilters: vi.fn(),
  } as unknown as INestApplication;
  return { app, enableCors };
}

describe('API — cabeçalhos de segurança e CORS', () => {
  it('não permite imagens de domínio herdado e mantém os embeds do YouTube', () => {
    const { app } = buildApp();

    configureApp(app);

    expect(helmetSpy).toHaveBeenCalledWith(expect.objectContaining({
      contentSecurityPolicy: expect.objectContaining({
        directives: expect.objectContaining({
          imgSrc: ["'self'", 'data:'],
          frameSrc: expect.arrayContaining(["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com']),
        }),
      }),
    }));
    expect(JSON.stringify(helmetSpy.mock.calls)).not.toMatch(/jonas|elivaldo/i);
  });

  it('restringe CORS às origens configuradas com credenciais', () => {
    const previousAppOrigin = process.env.APP_ORIGIN;
    const previousAdminOrigin = process.env.ADMIN_ORIGIN;
    process.env.APP_ORIGIN = 'http://localhost:3001';
    process.env.ADMIN_ORIGIN = 'http://localhost:5174';
    const { app, enableCors } = buildApp();

    try {
      configureApp(app);
      expect(enableCors).toHaveBeenCalledWith(expect.objectContaining({
        origin: ['http://localhost:3001', 'http://localhost:5174'],
        credentials: true,
      }));
    } finally {
      process.env.APP_ORIGIN = previousAppOrigin;
      process.env.ADMIN_ORIGIN = previousAdminOrigin;
    }
  });

  it('não libera nenhuma origem quando as variáveis não estão definidas', () => {
    const previousAppOrigin = process.env.APP_ORIGIN;
    const previousAdminOrigin = process.env.ADMIN_ORIGIN;
    delete process.env.APP_ORIGIN;
    delete process.env.ADMIN_ORIGIN;
    const { app, enableCors } = buildApp();

    try {
      configureApp(app);
      expect(enableCors).toHaveBeenCalledWith(expect.objectContaining({ origin: false }));
    } finally {
      if (previousAppOrigin !== undefined) process.env.APP_ORIGIN = previousAppOrigin;
      if (previousAdminOrigin !== undefined) process.env.ADMIN_ORIGIN = previousAdminOrigin;
    }
  });
});
