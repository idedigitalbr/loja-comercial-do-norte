import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthService wiring', () => {
  it('resolves PrismaService through its explicit Nest token', async () => {
    const prisma = {};
    const module = await Test.createTestingModule({
      providers: [AuthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    const service = module.get(AuthService);

    expect((service as unknown as { prisma?: unknown }).prisma).toBe(prisma);
  });
});

describe('AuthController wiring', () => {
  it('resolves AuthService through its explicit Nest token', async () => {
    const authService = {};
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    const controller = module.get(AuthController);

    expect((controller as unknown as { authService?: unknown }).authService).toBe(authService);
  });
});
