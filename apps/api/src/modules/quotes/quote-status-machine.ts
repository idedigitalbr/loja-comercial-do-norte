import { QuoteStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

/**
 * Máquina de estados da solicitação de cotação.
 *
 * Nenhum estado dispara cobrança, reserva de estoque ou criação de pedido: a
 * cotação é uma intenção comercial registrada para a equipe de vendas.
 */
const transitions: Record<QuoteStatus, readonly QuoteStatus[]> = {
  [QuoteStatus.REQUESTED]: [QuoteStatus.IN_REVIEW, QuoteStatus.ANSWERED, QuoteStatus.CANCELLED, QuoteStatus.LOST, QuoteStatus.EXPIRED],
  [QuoteStatus.IN_REVIEW]: [QuoteStatus.ANSWERED, QuoteStatus.CANCELLED, QuoteStatus.LOST, QuoteStatus.EXPIRED],
  [QuoteStatus.ANSWERED]: [QuoteStatus.WON, QuoteStatus.LOST, QuoteStatus.CANCELLED, QuoteStatus.EXPIRED],
  [QuoteStatus.WON]: [],
  [QuoteStatus.LOST]: [],
  [QuoteStatus.CANCELLED]: [],
  [QuoteStatus.EXPIRED]: [],
};

export const OPEN_QUOTE_STATUSES: readonly QuoteStatus[] = [
  QuoteStatus.REQUESTED,
  QuoteStatus.IN_REVIEW,
  QuoteStatus.ANSWERED,
];

export function canTransitionQuote(from: QuoteStatus, to: QuoteStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function assertQuoteTransition(from: QuoteStatus, to: QuoteStatus): void {
  if (!canTransitionQuote(from, to)) throw new BadRequestException('INVALID_QUOTE_TRANSITION');
}

/** Normaliza o WhatsApp para dígitos e valida tamanho de telefone brasileiro. */
export function normalizeQuotePhone(value: string): string {
  const digits = value.replace(/\D+/g, '');
  if (digits.length < 10 || digits.length > 13) throw new BadRequestException('INVALID_QUOTE_PHONE');
  return digits;
}

/** Valida e normaliza um e-mail opcional da cotação. */
export function normalizeQuoteEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase();
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 191) throw new BadRequestException('INVALID_QUOTE_EMAIL');
  return email;
}
