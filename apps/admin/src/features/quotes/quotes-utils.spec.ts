import { describe, expect, it } from 'vitest';
import { formatQuotePhone, nextQuoteStatuses, quoteStatusLabel } from './quotes-utils';

describe('quotes utils', () => {
  it('oferece apenas transições válidas para o status atual', () => {
    expect(nextQuoteStatuses('REQUESTED')).toEqual(['IN_REVIEW', 'ANSWERED', 'CANCELLED', 'LOST', 'EXPIRED']);
    expect(nextQuoteStatuses('ANSWERED')).toEqual(['WON', 'LOST', 'CANCELLED', 'EXPIRED']);
    expect(nextQuoteStatuses('WON')).toEqual([]);
    expect(nextQuoteStatuses('CANCELLED')).toEqual([]);
  });

  it('traduz os status para o operador', () => {
    expect(quoteStatusLabel('REQUESTED')).toBe('Recebida');
    expect(quoteStatusLabel('ANSWERED')).toBe('Proposta enviada');
    expect(quoteStatusLabel('DESCONHECIDO')).toBe('DESCONHECIDO');
  });

  it('formata telefone brasileiro', () => {
    expect(formatQuotePhone('91983440880')).toBe('(91) 98344-0880');
    expect(formatQuotePhone('9132464908')).toBe('(91) 3246-4908');
    expect(formatQuotePhone('123')).toBe('123');
  });
});
