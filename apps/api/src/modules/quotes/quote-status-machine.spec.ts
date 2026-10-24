import { describe, expect, it } from 'vitest';
import { canTransitionQuote, normalizeQuoteEmail, normalizeQuotePhone } from './quote-status-machine';

describe('quote status machine', () => {
  it('permite o caminho feliz da cotação até o fechamento', () => {
    expect(canTransitionQuote('REQUESTED', 'IN_REVIEW')).toBe(true);
    expect(canTransitionQuote('IN_REVIEW', 'ANSWERED')).toBe(true);
    expect(canTransitionQuote('ANSWERED', 'WON')).toBe(true);
  });

  it('permite cancelar/encerrar a partir de estados abertos', () => {
    for (const from of ['REQUESTED', 'IN_REVIEW', 'ANSWERED'] as const) {
      expect(canTransitionQuote(from, 'CANCELLED')).toBe(true);
      expect(canTransitionQuote(from, 'EXPIRED')).toBe(true);
    }
  });

  it('não permite reabrir nem pular do pedido para ganho', () => {
    expect(canTransitionQuote('REQUESTED', 'WON')).toBe(false);
    expect(canTransitionQuote('WON', 'IN_REVIEW')).toBe(false);
    expect(canTransitionQuote('CANCELLED', 'ANSWERED')).toBe(false);
  });

  it('normaliza o WhatsApp para dígitos e rejeita números inválidos', () => {
    expect(normalizeQuotePhone('(91) 98344-0880')).toBe('91983440880');
    expect(normalizeQuotePhone('91 9 9999-0000')).toBe('91999990000');
    expect(() => normalizeQuotePhone('123')).toThrowError(/INVALID_QUOTE_PHONE/);
    expect(() => normalizeQuotePhone('12345678901234567')).toThrowError(/INVALID_QUOTE_PHONE/);
  });

  it('normaliza e valida o e-mail opcional', () => {
    expect(normalizeQuoteEmail('  Cliente@Exemplo.COM ')).toBe('cliente@exemplo.com');
    expect(normalizeQuoteEmail('')).toBeNull();
    expect(() => normalizeQuoteEmail('invalido@')).toThrowError(/INVALID_QUOTE_EMAIL/);
  });
});
