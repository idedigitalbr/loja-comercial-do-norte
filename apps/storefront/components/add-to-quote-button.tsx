'use client';

import { Plus } from 'lucide-react';
import { cn, WebButton } from '@commerce/ui/web';
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
    <WebButton
      className={cn('py-2.5 text-sm font-semibold', className)}
      fullWidth={!className}
      onClick={() => add(item)}
      type="button"
      variant="primary"
    >
      <Plus aria-hidden className="size-4" />
      {label}
    </WebButton>
  );
}
