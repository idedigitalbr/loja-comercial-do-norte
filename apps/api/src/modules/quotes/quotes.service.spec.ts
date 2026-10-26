import { describe, expect, it, vi } from 'vitest';
import { QuotesService } from './quotes.service';

function buildService(options: { variants?: unknown[]; existingKey?: unknown } = {}) {
  const variants = options.variants ?? [{
    id: 'variant-1',
    sku: 'DEMO-COP-300',
    priceCents: 890,
    product: { name: 'Copo Descartável 300 ml', slug: 'copo-descartavel-300ml', images: [{ path: 'uploads/seed-copo/960.webp' }] },
  }];

  const transaction = {
    $executeRaw: vi.fn().mockResolvedValue(1),
    idempotencyKey: {
      findUnique: vi.fn().mockResolvedValue(options.existingKey ?? null),
      create: vi.fn().mockResolvedValue({}),
    },
    quote: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'quote-1',
        publicId: 'pub-1',
        ...data,
      })),
      findUnique: vi.fn(),
    },
  };
  const prisma = {
    productVariant: { findMany: vi.fn().mockResolvedValue(variants) },
    $transaction: vi.fn(async (callback: (client: typeof transaction) => Promise<unknown>) => callback(transaction)),
  };
  const notifications = { enqueue: vi.fn().mockResolvedValue(null) };
  const service = new QuotesService(prisma as never, notifications as never);
  return { service, prisma, transaction, notifications };
}

describe('QuotesService', () => {
  it('calcula preços e totais no servidor, ignorando qualquer valor do cliente', async () => {
    const { service, transaction } = buildService();

    await service.create({
      customerName: 'Ana Souza',
      customerPhone: '(91) 90000-0000',
      items: [{ variantId: 'variant-1', quantity: 2 }],
    });

    const data = transaction.quote.create.mock.calls[0][0].data as any;
    expect(data.customerPhone).toBe('91900000000');
    expect(data.subtotalCents).toBe(1780);
    expect(data.itemsCount).toBe(2);
    expect(data.items.create).toEqual([
      expect.objectContaining({ variantId: 'variant-1', unitPriceCents: 890, totalCents: 1780, sku: 'DEMO-COP-300' }),
    ]);
    expect(data.events.create).toEqual(expect.objectContaining({ toStatus: 'REQUESTED' }));
  });

  it('agrupa itens repetidos do mesmo produto', async () => {
    const { service, transaction } = buildService();

    await service.create({
      customerName: 'Ana Souza',
      customerPhone: '91900000000',
      items: [{ variantId: 'variant-1', quantity: 1 }, { variantId: 'variant-1', quantity: 3 }],
    });

    const data = transaction.quote.create.mock.calls[0][0].data as any;
    expect(data.items.create).toHaveLength(1);
    expect(data.items.create[0].quantity).toBe(4);
    expect(data.subtotalCents).toBe(3560);
  });

  it('recusa cotação com produto inexistente ou fora do catálogo público', async () => {
    const { service } = buildService({ variants: [] });

    await expect(service.create({
      customerName: 'Ana Souza',
      customerPhone: '91900000000',
      items: [{ variantId: 'variant-1', quantity: 1 }],
    })).rejects.toThrowError(/QUOTE_ITEM_UNAVAILABLE/);
  });

  it('recusa cotação vazia e telefone inválido', async () => {
    const { service } = buildService();

    await expect(service.create({ customerName: 'Ana', customerPhone: '91900000000', items: [] }))
      .rejects.toThrowError(/QUOTE_EMPTY/);
    await expect(service.create({ customerName: 'Ana', customerPhone: '123', items: [{ variantId: 'variant-1', quantity: 1 }] }))
      .rejects.toThrowError(/INVALID_QUOTE_PHONE/);
  });

  it('é idempotente: a mesma chave devolve a cotação já criada', async () => {
    const { service, transaction } = buildService({
      existingKey: { scope: 'quote:91900000000', responseJson: { quotePublicId: 'pub-existente' } },
    });
    transaction.quote.findUnique.mockResolvedValue({ publicId: 'pub-existente', status: 'REQUESTED' });

    const quote = await service.create({
      customerName: 'Ana Souza',
      customerPhone: '91900000000',
      idempotencyKey: 'chave-1',
      items: [{ variantId: 'variant-1', quantity: 1 }],
    });

    expect(quote).toEqual(expect.objectContaining({ publicId: 'pub-existente' }));
    expect(transaction.quote.create).not.toHaveBeenCalled();
  });

  it('bloqueia transição de estado inválida', async () => {
    const prisma = {
      $transaction: vi.fn(async (callback: (client: unknown) => Promise<unknown>) => callback({
        quote: { findUnique: vi.fn().mockResolvedValue({ id: 'quote-1', status: 'WON' }), update: vi.fn() },
        quoteEvent: { create: vi.fn() },
      })),
    };
    const service = new QuotesService(prisma as never);

    await expect(service.transition('quote-1', 'REQUESTED')).rejects.toThrowError(/INVALID_QUOTE_TRANSITION/);
  });
});
