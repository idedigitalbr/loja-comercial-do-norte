'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { WebSheet } from '@commerce/ui/web';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import { useQuoteCart } from './quote-cart-provider';

/** Mini-carrinho acessível (sheet lateral) do carrinho de cotação. */
export function QuoteDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, remove, subtotalCents, count } = useQuoteCart();

  return (
    <WebSheet
      eyebrow="Sua lista"
      footer={
        items.length > 0 ? (
          <div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted">{count} item(ns) · valores de referência</span>
              <strong className="text-ink">{formatMoney(subtotalCents)}</strong>
            </div>
            <Link
              className="block rounded-pill bg-promo px-4 py-3 text-center text-sm font-bold text-white hover:bg-promo-hover"
              href="/cotacao"
              onClick={closeDrawer}
            >
              Enviar cotação
            </Link>
            <p className="mt-2 text-center text-xs text-muted">
              Sem pagamento online: a equipe comercial responde com a proposta.
            </p>
          </div>
        ) : undefined
      }
      onClose={closeDrawer}
      open={drawerOpen}
      title="Carrinho de cotação"
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <ShoppingBasket aria-hidden className="size-10 text-muted" />
          <p className="text-sm text-muted">Sua cotação está vazia. Adicione produtos do catálogo.</p>
          <Link
            className="rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white"
            href="/loja"
            onClick={closeDrawer}
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line px-4">
          {items.map((item) => {
            const image = resolveProductImage(item.productSlug || item.variantId);
            return (
              <li className="flex gap-3 py-4" key={item.variantId}>
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-100 bg-white p-1">
                  <Image
                    alt={`${item.name} (Imagem ilustrativa)`}
                    className="size-full object-contain"
                    height={64}
                    src={image}
                    unoptimized
                    width={64}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-muted">SKU {item.sku}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-pill border border-line">
                      <button
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        className="p-1.5 hover:bg-surface-soft"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        type="button"
                      >
                        <Minus aria-hidden className="size-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        className="p-1.5 hover:bg-surface-soft"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        type="button"
                      >
                        <Plus aria-hidden className="size-3.5" />
                      </button>
                    </div>
                    <button
                      aria-label={`Remover ${item.name}`}
                      className="rounded p-1.5 text-muted hover:bg-promo-soft hover:text-promo"
                      onClick={() => remove(item.variantId)}
                      type="button"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-ink">
                  {formatMoney(item.unitPriceCents * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </WebSheet>
  );
}
