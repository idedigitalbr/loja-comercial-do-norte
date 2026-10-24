import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { FeatureGuard, featureFlagsSnapshot, isFeatureEnabled, RequireFeature, RequireFeature as _RequireFeature } from './feature-flags';

function buildContext(handler = () => undefined) {
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({}) }),
  } as unknown as ExecutionContext;
}

function buildReflector(flag: string | undefined) {
  return { getAllAndOverride: () => flag } as unknown as Reflector;
}

afterEach(() => {
  delete process.env.FEATURE_CHECKOUT;
  delete process.env.FEATURE_PAYMENTS;
  delete process.env.FEATURE_TRAININGS;
});

describe('feature flags (fase 1: catálogo + cotação)', () => {
  it('ficam desligadas por padrão', () => {
    expect(isFeatureEnabled('CHECKOUT')).toBe(false);
    expect(featureFlagsSnapshot()).toEqual({ checkout: false, payments: false, trainings: false });
  });

  it('só ligam com o valor exatamente "true"', () => {
    process.env.FEATURE_CHECKOUT = 'TRUE';
    expect(isFeatureEnabled('CHECKOUT')).toBe(true);
    process.env.FEATURE_CHECKOUT = '1';
    expect(isFeatureEnabled('CHECKOUT')).toBe(false);
    process.env.FEATURE_CHECKOUT = 'false';
    expect(isFeatureEnabled('CHECKOUT')).toBe(false);
  });

  it('bloqueia rota desligada com 404 e libera quando habilitada', () => {
    const guard = new FeatureGuard(buildReflector('CHECKOUT'));
    expect(() => guard.canActivate(buildContext())).toThrowError(NotFoundException);

    process.env.FEATURE_CHECKOUT = 'true';
    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('não interfere em rotas sem requisito de feature', () => {
    const guard = new FeatureGuard(buildReflector(undefined));
    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('expõe o decorator de requisito', () => {
    expect(typeof RequireFeature('PAYMENTS')).toBe('function');
    expect(RequireFeature).toBe(_RequireFeature);
  });
});
