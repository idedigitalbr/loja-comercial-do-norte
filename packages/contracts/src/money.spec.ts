import { describe, expect, it } from 'vitest';
import { MoneySchema } from './money';

describe('MoneySchema', () => {
  it('rejects decimal money values and accepts integer BRL cents', () => {
    expect(() => MoneySchema.parse({ amount: 19.9, currency: 'BRL' })).toThrow();
    expect(MoneySchema.parse({ amount: 1990, currency: 'BRL' })).toEqual({
      amount: 1990,
      currency: 'BRL',
    });
  });
});
