/**
 * Regras de apresentação da fila de cotações no painel.
 * A autoridade sobre as transições é da API (`assertQuoteTransition`); aqui só
 * mostramos ao operador as ações que fazem sentido para o status atual.
 */
export const QUOTE_STATUSES = ['REQUESTED', 'IN_REVIEW', 'ANSWERED', 'WON', 'LOST', 'CANCELLED', 'EXPIRED'] as const;
export type QuoteStatus = typeof QUOTE_STATUSES[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  REQUESTED: 'Recebida',
  IN_REVIEW: 'Em análise',
  ANSWERED: 'Proposta enviada',
  WON: 'Fechada',
  LOST: 'Perdida',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
};

const allowed: Record<QuoteStatus, readonly QuoteStatus[]> = {
  REQUESTED: ['IN_REVIEW', 'ANSWERED', 'CANCELLED', 'LOST', 'EXPIRED'],
  IN_REVIEW: ['ANSWERED', 'CANCELLED', 'LOST', 'EXPIRED'],
  ANSWERED: ['WON', 'LOST', 'CANCELLED', 'EXPIRED'],
  WON: [],
  LOST: [],
  CANCELLED: [],
  EXPIRED: [],
};

export function nextQuoteStatuses(status: QuoteStatus): QuoteStatus[] {
  return [...allowed[status]];
}

export function quoteStatusLabel(status: string): string {
  return QUOTE_STATUS_LABELS[status as QuoteStatus] ?? status;
}

export function formatQuoteMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function formatQuotePhone(digits: string): string {
  const value = digits.replace(/\D+/g, '');
  if (value.length === 11) return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  if (value.length === 10) return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  return digits;
}
