import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../app.module';
import { configureApp, loadEnvironment } from '../../main';
import { PrismaService } from './prisma.service';
import { InventoryService, InventoryUnavailableError } from '../inventory/inventory.service';
import { QuotesService } from '../quotes/quotes.service';

/**
 * Suite de Integração Concorrente no PostgreSQL Real (Issue #11 / B6)
 *
 * Valida:
 * 1. Travas transacionais em linhas de estoque (SELECT ... FOR UPDATE).
 * 2. Prevenção de race-conditions em requisições simultâneas.
 * 3. Idempotência transacional sob concorrência estrita em cotações.
 * 4. Atomicidade e Rollback completo em falhas de transação.
 */
describe('PostgreSQL Real — Concorrência e Travas Transacionais (Issue #11)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let inventoryService: InventoryService;
  let quotesService: QuotesService;

  beforeAll(async () => {
    loadEnvironment();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    inventoryService = app.get(InventoryService);
    quotesService = app.get(QuotesService);
  }, 30_000);

  afterAll(async () => {
    await app?.close();
  });

  describe('Travas de Linha em Saldo de Estoque (Row-Level Locking)', () => {
    it('executa ajustes simultâneos com FOR UPDATE sem perda de dados (Lost Updates)', async () => {
      // 1. Busca uma variante existente com saldo
      const balance = await prisma.inventoryBalance.findFirst({
        select: { id: true, variantId: true, physicalQuantity: true, reservedQuantity: true },
      });
      expect(balance).toBeTruthy();
      if (!balance) return;

      const initialPhysical = balance.physicalQuantity;
      const increments = [1, 2, 3, 4, 5]; // total: +15
      const totalDelta = increments.reduce((sum, n) => sum + n, 0);

      // 2. Dispara 5 ajustes concorrentes simultaneamente
      const results = await Promise.all(
        increments.map((qty, idx) =>
          inventoryService.adjust({
            variantId: balance.variantId,
            quantity: qty,
            reason: `Teste de concorrencia #${idx} (Issue #11)`,
          }),
        ),
      );

      expect(results).toHaveLength(5);

      // 3. Verifica saldo final no PostgreSQL
      const updatedBalance = await prisma.inventoryBalance.findUnique({
        where: { id: balance.id },
      });
      expect(updatedBalance?.physicalQuantity).toBe(initialPhysical + totalDelta);

      // 4. Reverte o ajuste para não sujar o banco de desenvolvimento
      await inventoryService.adjust({
        variantId: balance.variantId,
        quantity: -totalDelta,
        reason: 'Rollback compensatorio do teste de concorrencia',
      });
    });

    it('impede decremento concorrente além do saldo através de trava FOR UPDATE', async () => {
      const balance = await prisma.inventoryBalance.findFirst({
        where: { physicalQuantity: { gt: 0 } },
        select: { id: true, variantId: true, physicalQuantity: true, reservedQuantity: true },
      });
      expect(balance).toBeTruthy();
      if (!balance) return;

      const currentQty = balance.physicalQuantity;

      // Dispara 2 decrementos simultâneos de exatamente currentQty
      const promise1 = inventoryService.adjust({
        variantId: balance.variantId,
        quantity: -currentQty,
        reason: 'Teste concorrencia decremento 1',
      });

      const promise2 = inventoryService.adjust({
        variantId: balance.variantId,
        quantity: -currentQty,
        reason: 'Teste concorrencia decremento 2',
      });

      const outcomes = await Promise.allSettled([promise1, promise2]);

      const fulfilled = outcomes.filter((o) => o.status === 'fulfilled');
      const rejected = outcomes.filter((o) => o.status === 'rejected');

      // Exatamente um deve ter sucesso e o concorrente deve falhar com InventoryUnavailableError
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      // Reverte o decremento bem-sucedido restaurando o saldo original
      await inventoryService.adjust({
        variantId: balance.variantId,
        quantity: currentQty,
        reason: 'Restauracao de saldo pos-teste',
      });
    });
  });

  describe('Idempotência Transacional sob Concorrência', () => {
    it('garante criação única de cotação com chave de idempotência duplicada concorrente', async () => {
      const variant = await prisma.productVariant.findFirst({
        where: { status: 'ACTIVE', product: { status: 'ACTIVE' } },
        select: { id: true },
      });
      expect(variant).toBeTruthy();
      if (!variant) return;

      const idempotencyKey = `conc-key-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const input = {
        customerName: 'Cliente Teste Concorrência',
        customerPhone: '(91) 98888-7777',
        customerEmail: 'conc@example.com',
        notes: 'Teste de corrida de idempotência no PostgreSQL',
        idempotencyKey,
        items: [{ variantId: variant.id, quantity: 1 }],
      };

      // Dispara 3 requisições simultâneas com a mesma chave
      const settled = await Promise.allSettled([
        quotesService.create(input),
        quotesService.create(input),
        quotesService.create(input),
      ]);

      const successful = settled.filter(
        (s): s is PromiseFulfilledResult<{ publicId: string }> => s.status === 'fulfilled' && Boolean(s.value?.publicId),
      );

      // Pelo menos 1 obteve o registro (e se mais de 1, todas devem ter o MESMO publicId)
      expect(successful.length).toBeGreaterThanOrEqual(1);
      const firstPublicId = successful[0].value.publicId;

      for (const res of successful) {
        expect(res.value.publicId).toBe(firstPublicId);
      }

      // No PostgreSQL deve existir exatamente 1 cotação gravada com essa chave
      const count = await prisma.idempotencyKey.count({
        where: { key: idempotencyKey },
      });
      expect(count).toBe(1);
    });
  });

  describe('Atomicidade e Rollback Transacional', () => {
    it('desfaz todas as alterações de uma transação se ocorrer uma falha intermediária', async () => {
      const initialUsersCount = await prisma.user.count();
      const initialLogsCount = await prisma.auditLog.count();

      await expect(
        prisma.$transaction(async (tx) => {
          await tx.auditLog.create({
            data: {
              actorType: 'SYSTEM',
              action: 'TEST_TRANSACTION_ROLLBACK',
              entityType: 'Test',
              entityId: 'test-123',
            },
          });

          // Força erro intencional para acionar o ROLLBACK do PostgreSQL
          throw new Error('INTENTIONAL_ROLLBACK_ERROR');
        }),
      ).rejects.toThrow('INTENTIONAL_ROLLBACK_ERROR');

      // Verifica se nenhuma linha residual foi persistida
      const finalUsersCount = await prisma.user.count();
      const finalLogsCount = await prisma.auditLog.count();

      expect(finalUsersCount).toBe(initialUsersCount);
      expect(finalLogsCount).toBe(initialLogsCount);
    });
  });
});
