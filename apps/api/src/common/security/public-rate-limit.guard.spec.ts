import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PublicRateLimitGuard, resetPublicRateLimit, type PublicRateLimitOptions } from './public-rate-limit.guard';

function contextFor(ip: string, path = '/quotes'): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ ip, method: 'POST', route: { path } }) }),
  } as unknown as ExecutionContext;
}

function guardWith(options: PublicRateLimitOptions | undefined) {
  return new PublicRateLimitGuard({ get: () => options } as unknown as Reflector);
}

describe('PublicRateLimitGuard', () => {
  beforeEach(() => resetPublicRateLimit());
  afterEach(() => resetPublicRateLimit());

  it('libera quando a rota não define limite', () => {
    const guard = guardWith(undefined);
    expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
  });

  it('bloqueia depois do limite na mesma janela', () => {
    const guard = guardWith({ limit: 2, windowMs: 60_000 });
    expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
    expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
    expect(() => guard.canActivate(contextFor('1.1.1.1'))).toThrowError(HttpException);
  });

  it('isola o contador por IP', () => {
    const guard = guardWith({ limit: 1, windowMs: 60_000 });
    expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
    expect(guard.canActivate(contextFor('2.2.2.2'))).toBe(true);
  });

  it('reabre a janela após o tempo configurado', () => {
    const guard = guardWith({ limit: 1, windowMs: 1000 });
    expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
    expect(() => guard.canActivate(contextFor('1.1.1.1'))).toThrowError(HttpException);

    resetPublicRateLimit();
    expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
  });
});
