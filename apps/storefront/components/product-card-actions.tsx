'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Check } from 'lucide-react';
import type { QuoteCartItem } from '@/lib/quote-cart';
import { useQuoteCart } from './quote-cart-provider';

type ProductCardActionsProps = {
  item: QuoteCartItem;
  addToQuoteLabel?: string;
  instantQuoteLabel?: string;
};

/**
 * Ações do card de produto no hover:
 * - "Cotar agora" (Ação principal / compra rápida -> adiciona e vai direto para /cotacao)
 * - "Adicionar à cotação" (Ação secundária com ícone de carrinho -> adiciona e abre drawer/notifica)
 */
export function ProductCardActions({
  item,
  addToQuoteLabel = 'Adicionar à cotação',
  instantQuoteLabel = 'Cotar agora',
}: ProductCardActionsProps) {
  const router = useRouter();
  const { add } = useQuoteCart();
  const [added, setAdded] = useState(false);

  const handleInstantQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(item);
    router.push('/cotacao');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {/* Botão 1: Cotar agora (Equivalente a Comprar Agora - Ação Principal em Destaque) */}
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#004CB1] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition duration-150 hover:bg-[#003882] active:scale-[0.98]"
        onClick={handleInstantQuote}
        title="Cotar agora (ir direto para a cotação)"
        type="button"
      >
        <Zap className="size-3.5 fill-white text-white" />
        <span>{instantQuoteLabel}</span>
      </button>

      {/* Botão 2: Adicionar à Cotação / Carrinho (Ação Secundária) */}
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#004CB1] bg-white px-3 py-1.5 text-xs font-semibold text-[#004CB1] transition duration-150 hover:bg-[#004CB1]/5 active:scale-[0.98]"
        onClick={handleAddToCart}
        title="Adicionar à cotação"
        type="button"
      >
        {added ? (
          <>
            <Check className="size-3.5 text-emerald-600" />
            <span className="font-bold text-emerald-700">Adicionado!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="size-3.5" />
            <span>{addToQuoteLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}
