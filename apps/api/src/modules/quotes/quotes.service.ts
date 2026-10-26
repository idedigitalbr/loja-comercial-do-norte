import { ActorType, EmailEventKey, Prisma, QuoteStatus } from '@prisma/client';
import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { assertIdempotencyScope } from '../../common/idempotency/idempotency';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { assertQuoteTransition, normalizeQuoteEmail, normalizeQuotePhone } from './quote-status-machine';

export type QuoteRequestItem = { variantId: string; quantity: number };

export type CreateQuoteInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  companyName?: string | null;
  document?: string | null;
  notes?: string | null;
  items: QuoteRequestItem[];
  idempotencyKey?: string;
  userId?: string;
};

const MAX_ITEMS = 50;
const MAX_QUANTITY = 999;

const quoteInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
  events: { orderBy: { createdAt: 'asc' as const } },
} as const;

@Injectable()
export class QuotesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Optional() @Inject(NotificationsService) private readonly notifications?: NotificationsService,
  ) {}

  /**
   * Registra uma solicitação de cotação. Preços e disponibilidade vêm sempre do
   * servidor; nada é reservado, cobrado ou convertido em pedido.
   */
  async create(input: CreateQuoteInput) {
    const customerName = input.customerName?.trim();
    if (!customerName || customerName.length < 3 || customerName.length > 160) {
      throw new BadRequestException('INVALID_QUOTE_NAME');
    }
    const customerPhone = normalizeQuotePhone(input.customerPhone ?? '');
    const customerEmail = normalizeQuoteEmail(input.customerEmail);
    const items = mergeItems(input.items);
    if (!items.length) throw new BadRequestException('QUOTE_EMPTY');
    if (items.length > MAX_ITEMS) throw new BadRequestException('QUOTE_TOO_MANY_ITEMS');
    if (items.some((item) => item.quantity < 1 || item.quantity > MAX_QUANTITY)) {
      throw new BadRequestException('INVALID_QUOTE_QUANTITY');
    }

    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: items.map((item) => item.variantId) },
        status: 'ACTIVE',
        product: { status: 'ACTIVE' },
      },
      select: {
        id: true,
        sku: true,
        priceCents: true,
        product: {
          select: {
            name: true,
            slug: true,
            images: { where: { isPrimary: true }, take: 1, select: { path: true } },
          },
        },
      },
    });
    const variantById = new Map(variants.map((variant) => [variant.id, variant]));
    if (variants.length !== items.length) throw new BadRequestException('QUOTE_ITEM_UNAVAILABLE');

    const lines = items.map((item) => {
      const variant = variantById.get(item.variantId)!;
      return {
        variantId: variant.id,
        sku: variant.sku,
        productName: variant.product.name,
        productSlug: variant.product.slug,
        imagePath: variant.product.images[0]?.path ?? null,
        quantity: item.quantity,
        unitPriceCents: variant.priceCents,
        totalCents: variant.priceCents * item.quantity,
      };
    });
    const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);
    const itemsCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const scope = `quote:${customerPhone}`;

    const quote = await this.prisma.$transaction(async (transaction) => {
      if (input.idempotencyKey) {
        // Serialize concurrent retries before reading the key. The lock is released
        // by PostgreSQL on commit/rollback, so every retry sees the confirmed quote.
        await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.idempotencyKey}, 0))`;
        const existing = await transaction.idempotencyKey.findUnique({ where: { key: input.idempotencyKey } });
        assertIdempotencyScope(existing, scope);
        if (existing?.responseJson && typeof existing.responseJson === 'object' && 'quotePublicId' in existing.responseJson) {
          return transaction.quote.findUnique({
            where: { publicId: String(existing.responseJson.quotePublicId) },
            include: quoteInclude,
          });
        }
      }

      const created = await transaction.quote.create({
        data: {
          customerName,
          customerPhone,
          customerEmail,
          companyName: input.companyName?.trim() || null,
          document: input.document?.trim() || null,
          notes: input.notes?.trim() || null,
          userId: input.userId,
          itemsCount,
          subtotalCents,
          items: { create: lines },
          events: { create: { toStatus: QuoteStatus.REQUESTED, actorType: ActorType.SYSTEM } },
        },
        include: quoteInclude,
      });

      if (input.idempotencyKey) {
        await transaction.idempotencyKey.create({
          data: {
            key: input.idempotencyKey,
            scope,
            responseJson: { quotePublicId: created.publicId },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
      return created;
    });

    if (quote) await this.notifySales(quote.id, quote.publicId, customerName, itemsCount, subtotalCents);
    return quote;
  }

  private async notifySales(quoteId: string, publicId: string, customerName: string, itemsCount: number, subtotalCents: number) {
    try {
      await this.notifications?.enqueue(EmailEventKey.QUOTE_REQUESTED, {
        entityId: quoteId,
        customerName,
        quoteId: publicId,
        quoteUrl: `/admin/cotacoes/${publicId}`,
        itemsCount: String(itemsCount),
        total: `R$ ${(subtotalCents / 100).toFixed(2).replace('.', ',')}`,
        status: QuoteStatus.REQUESTED,
      });
    } catch {
      // Falha de e-mail nunca deve desfazer a cotação já registrada.
    }
  }

  /** Visão pública da cotação: somente dados do próprio solicitante. */
  async getPublic(publicId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { publicId },
      select: {
        publicId: true,
        status: true,
        customerName: true,
        customerPhone: true,
        companyName: true,
        itemsCount: true,
        subtotalCents: true,
        notes: true,
        createdAt: true,
        answeredAt: true,
        items: {
          orderBy: { createdAt: 'asc' },
          select: { productName: true, productSlug: true, sku: true, imagePath: true, quantity: true, unitPriceCents: true, totalCents: true },
        },
      },
    });
    if (!quote) throw new NotFoundException('QUOTE_NOT_FOUND');
    return { ...quote, customerPhone: maskPhone(quote.customerPhone) };
  }

  async listForAdmin(input: { status?: QuoteStatus; search?: string; page?: number; pageSize?: number } = {}) {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
    const search = input.search?.trim();
    const where: Prisma.QuoteWhereInput = {
      ...(input.status ? { status: input.status } : {}),
      ...(search
        ? {
            OR: [
              { publicId: { contains: search } },
              { customerName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { customerPhone: { contains: search.replace(/\D+/g, '') } },
              { companyName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const [items, total, grouped] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: { orderBy: { createdAt: 'asc' } } },
      }),
      this.prisma.quote.count({ where }),
      this.prisma.quote.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      counts: Object.fromEntries(grouped.map((row) => [row.status, row._count._all])),
    };
  }

  async getForAdmin(id: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id }, include: quoteInclude });
    if (!quote) throw new NotFoundException('QUOTE_NOT_FOUND');
    return quote;
  }

  async transition(id: string, toStatus: QuoteStatus, input: { actorId?: string; reason?: string } = {}) {
    return this.prisma.$transaction(async (transaction) => {
      const quote = await transaction.quote.findUnique({ where: { id } });
      if (!quote) throw new NotFoundException('QUOTE_NOT_FOUND');
      assertQuoteTransition(quote.status, toStatus);

      const updated = await transaction.quote.update({
        where: { id },
        data: {
          status: toStatus,
          ...(toStatus === QuoteStatus.ANSWERED ? { answeredAt: new Date() } : {}),
          ...([QuoteStatus.WON, QuoteStatus.LOST, QuoteStatus.CANCELLED, QuoteStatus.EXPIRED] as QuoteStatus[]).includes(toStatus) ? { closedAt: new Date() } : {},
        },
      });
      await transaction.quoteEvent.create({
        data: { quoteId: id, fromStatus: quote.status, toStatus, actorType: ActorType.USER, actorId: input.actorId, reason: input.reason },
      });

      try {
        await this.notifications?.enqueue(EmailEventKey.QUOTE_STATUS_CHANGED, {
          entityId: id,
          quoteId: updated.publicId,
          recipient: updated.customerEmail ?? undefined,
          customerName: updated.customerName,
          status: toStatus,
          quoteUrl: `/cotacao/${updated.publicId}`,
        });
      } catch {
        // Notificação é acessória: a mudança de estado já foi persistida.
      }
      return updated;
    });
  }
}

function mergeItems(items: QuoteRequestItem[] | undefined): QuoteRequestItem[] {
  const merged = new Map<string, number>();
  for (const item of items ?? []) {
    if (!item?.variantId) throw new BadRequestException('INVALID_QUOTE_ITEM');
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw new BadRequestException('INVALID_QUOTE_QUANTITY');
    merged.set(item.variantId, Math.min(MAX_QUANTITY, (merged.get(item.variantId) ?? 0) + quantity));
  }
  return [...merged.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return '****';
  return `${'*'.repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`;
}
