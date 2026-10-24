'use client';

import { Plus } from 'lucide-react';
import type { QuoteCartItem } from '@/lib/quote-cart';
import { useQuoteCart } from './quote-cart-provider';

type AddToQuoteButtonProps = {
  item: QuoteCartItem;
  label?: string;
  className?: string;
};

/** CTA de fase 1: nunca "Comprar" — sempre "Adicionar à cotação". */
export function AddToQuoteButton({ item, label = 'Adicionar à cotação', className }: AddToQuoteButtonProps) {
  const { add } = useQuoteCart();
  return (
    <button
      className={className ?? 'inline-flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover'}
      onClick={() => add(item)}
      type="button"
    >
      <Plus aria-hidden className="size-4" />
      {label}
    </button>
  );
}
