import { describe, expect, it } from 'vitest';
import { addItem, cartCount, cartSubtotalCents, normalizeQuantity, parseCart, removeItem, setQuantity, type QuoteCartItem } from './quote-cart';

const item: QuoteCartItem = {
  variantId: 'variant-1',
  productSlug: 'copo-300ml',
  name: 'Copo 300 ml',
  sku: 'DEMO-COP-300',
  imagePath: 'uploads/seed-copo/960.webp',
  unitPriceCents: 890,
  quantity: 1,
};

describe('quote cart', () => {
  it('adiciona item novo e soma quantidades do mesmo produto', () => {
    const first = addItem([], item);
    expect(first).toHaveLength(1);

    const second = addItem(first, { ...item, quantity: 2 });
    expect(second).toHaveLength(1);
    expect(second[0].quantity).toBe(3);
  });

  it('respeita os limites de quantidade e de itens', () => {
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(5000)).toBe(999);
    expect(normalizeQuantity(Number.NaN)).toBe(1);

    const many = Array.from({ length: 50 }, (_, index) => ({ ...item, variantId: `variant-${index}` }));
    expect(addItem(many, { ...item, variantId: 'extra' })).toHaveLength(50);
  });

  it('atualiza, remove e calcula totais', () => {
    const items = setQuantity([item], item.variantId, 4);
    expect(items[0].quantity).toBe(4);
    expect(cartCount(items)).toBe(4);
    expect(cartSubtotalCents(items)).toBe(3560);
    expect(removeItem(items, item.variantId)).toEqual([]);
  });

  it('ignora carrinho corrompido ou inválido', () => {
    expect(parseCart(null)).toEqual([]);
    expect(parseCart('nao-e-json')).toEqual([]);
    expect(parseCart('{"a":1}')).toEqual([]);
    expect(parseCart(JSON.stringify([{ foo: 'bar' }]))).toEqual([]);
    expect(parseCart(JSON.stringify([{ ...item, quantity: 0 }]))[0].quantity).toBe(1);
  });
});
