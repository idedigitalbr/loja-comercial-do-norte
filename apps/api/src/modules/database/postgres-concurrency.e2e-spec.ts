import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from './prisma.service';
import { InventoryService, InventoryUnavailableError } from '../inventory/inventory.service';
import { QuotesService } from '../quotes/quotes.service';

// vitest.e2e.config + the runner verify the URL before loading any test.
const prisma = new PrismaService();
const inventory = new InventoryService(prisma);
const quotes = new QuotesService(prisma);
let productId: string;
let variantId: string;

describe('PostgreSQL real: owned fixtures, locks, idempotency and migration', () => {
  beforeAll(async () => { await prisma.$connect(); });
  beforeEach(async () => {
    const product = await prisma.product.create({ data: {
      name: 'Fixture de concorrência isolada', slug: `fixture-${crypto.randomUUID()}`, status: 'ACTIVE',
      variants: { create: { sku: `TEST-${crypto.randomUUID()}`, priceCents: 1000, status: 'ACTIVE', inventoryBalance: { create: { physicalQuantity: 20, reservedQuantity: 0 } } } },
    }, include: { variants: true } });
    productId = product.id; variantId = product.variants[0].id;
  });
  afterAll(async () => { await prisma.$disconnect(); });
  it('serializes increments without lost updates or compensating writes to shared data', async () => {
    await Promise.all([1,2,3,4,5].map(quantity => inventory.adjust({ variantId, quantity, reason: 'isolated concurrency fixture' })));
    expect((await prisma.inventoryBalance.findUniqueOrThrow({ where: { variantId } })).physicalQuantity).toBe(35);
    expect(await prisma.stockMovement.count({ where: { variantId } })).toBe(5);
  });
  it('rejects the second concurrent decrement with the expected business error', async () => {
    const outcomes = await Promise.allSettled([1,2].map(() => inventory.adjust({ variantId, quantity: -20, reason: 'isolated decrement' })));
    expect(outcomes.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    const failed = outcomes.find(result => result.status === 'rejected') as PromiseRejectedResult;
    expect(failed.reason).toBeInstanceOf(InventoryUnavailableError);
    expect((await prisma.inventoryBalance.findUniqueOrThrow({ where: { variantId } })).physicalQuantity).toBe(0);
  });
  it('returns the same confirmed quote to every concurrent request with one idempotency key', async () => {
    const key = `isolated-${crypto.randomUUID()}`;
    const input = { customerName: 'Cliente Fixture', customerPhone: '(91) 98888-7777', idempotencyKey: key, items: [{ variantId, quantity: 1 }] };
    const outcomes = await Promise.allSettled([quotes.create(input),quotes.create(input),quotes.create(input)]);
    expect(outcomes.every(outcome => outcome.status === 'fulfilled')).toBe(true);
    const confirmed = outcomes.filter(outcome => outcome.status === 'fulfilled') as PromiseFulfilledResult<{ publicId: string }>[];
    expect(new Set(confirmed.map(outcome => outcome.value.publicId)).size).toBe(1);
    expect(await prisma.idempotencyKey.count({ where: { key } })).toBe(1);
    expect(await prisma.quote.count({ where: { items: { some: { variantId } } } })).toBe(1);
    expect((await prisma.inventoryBalance.findUniqueOrThrow({ where: { variantId } })).reservedQuantity).toBe(0);
  });
  it('rolls back all writes when a transaction fails', async () => {
    const action = `rollback-${crypto.randomUUID()}`;
    await expect(prisma.$transaction(async tx => {
      await tx.product.update({ where: { id: productId }, data: { name: 'must roll back' } });
      await tx.auditLog.create({ data: { actorType: 'SYSTEM', action, entityType: 'Test', entityId: productId } });
      throw new Error('INTENTIONAL_ROLLBACK');
    })).rejects.toThrow('INTENTIONAL_ROLLBACK');
    expect((await prisma.product.findUniqueOrThrow({ where: { id: productId } })).name).toBe('Fixture de concorrência isolada');
    expect(await prisma.auditLog.count({ where: { action } })).toBe(0);
  });
  it('preserves existing JSONB when the additive migration is reapplied', async () => {
    const snapshot = { page: 'home', version: 7, widgets: [] };
    await prisma.siteConfiguration.update({ where: { id: 'default' }, data: { homeComposition: snapshot } });
    await prisma.$executeRawUnsafe('ALTER TABLE "SiteConfiguration" ADD COLUMN IF NOT EXISTS "homeComposition" JSONB');
    expect((await prisma.siteConfiguration.findUniqueOrThrow({ where: { id: 'default' } })).homeComposition).toEqual(snapshot);
    const rows = await prisma.$queryRawUnsafe<Array<{ migration_name: string }>>('SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = \'20261026190000_add_home_composition\' AND finished_at IS NOT NULL AND rolled_back_at IS NULL');
    expect(rows).toHaveLength(1);
  });
});
