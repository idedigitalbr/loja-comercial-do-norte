import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import { PermissionGuard } from './permission.guard';

describe('PermissionGuard wiring', () => {
  it('resolves Reflector through its explicit Nest token', async () => {
    const reflector = {};
    const module = await Test.createTestingModule({
      providers: [PermissionGuard, { provide: Reflector, useValue: reflector }],
    }).compile();

    const guard = module.get(PermissionGuard);

    expect((guard as unknown as { reflector?: unknown }).reflector).toBe(reflector);
  });
});
