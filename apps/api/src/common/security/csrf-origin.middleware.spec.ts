import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCsrfOriginMiddleware } from './csrf-origin.middleware';

function createMockResponse() {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn().mockReturnThis();
  return { status, json } as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

describe('createCsrfOriginMiddleware', () => {
  const originalEnv = { ...process.env };
  const allowed = new Set([
    'https://loja-comercialdonorte.vercel.app',
    'https://admin-comercialdonorte.vercel.app',
  ]);

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('permite GET sem verificar origin', () => {
    const middleware = createCsrfOriginMiddleware(allowed);
    const req = { method: 'GET', headers: { origin: 'https://evil.com' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('bloqueia Sec-Fetch-Site: cross-site em requisições mutáveis', () => {
    const middleware = createCsrfOriginMiddleware(allowed);
    const req = {
      method: 'POST',
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'https://admin-comercialdonorte.vercel.app',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('bloqueia Origin não autorizado em POST', () => {
    const middleware = createCsrfOriginMiddleware(allowed);
    const req = {
      method: 'POST',
      headers: { origin: 'https://evil.com' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('permite Origin autorizado da whitelist em produção', () => {
    process.env.NODE_ENV = 'production';
    const middleware = createCsrfOriginMiddleware(allowed);
    const req = {
      method: 'POST',
      headers: {
        origin: 'https://admin-comercialdonorte.vercel.app',
        cookie: 'je_access=abc',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('exige Origin/Referer em produção quando autenticado apenas por cookie', () => {
    process.env.NODE_ENV = 'production';
    const middleware = createCsrfOriginMiddleware(allowed);
    const req = {
      method: 'POST',
      headers: { cookie: 'je_access=abc' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('permite BFF server-to-server com Authorization Bearer em produção mesmo sem Origin', () => {
    process.env.NODE_ENV = 'production';
    const middleware = createCsrfOriginMiddleware(allowed);
    const req = {
      method: 'POST',
      headers: {
        cookie: 'je_access=abc',
        authorization: 'Bearer token-123',
      },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
