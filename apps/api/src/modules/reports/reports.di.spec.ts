import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { ReportsService } from './reports.service';

describe('ReportsService wiring', () => {
  it('resolves PrismaService through its explicit Nest token', async () => {
    const prisma = {};
    const module = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    expect((module.get(ReportsService) as unknown as { prisma?: unknown }).prisma).toBe(prisma);
  });
});
