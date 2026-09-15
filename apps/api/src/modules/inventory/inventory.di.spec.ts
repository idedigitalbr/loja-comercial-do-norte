import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from './inventory.service';

describe('InventoryService wiring', () => {
  it('resolves PrismaService through its explicit Nest token', async () => {
    const prisma = {};
    const module = await Test.createTestingModule({
      providers: [InventoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    const service = module.get(InventoryService);

    expect((service as unknown as { prisma?: unknown }).prisma).toBe(prisma);
  });
});
