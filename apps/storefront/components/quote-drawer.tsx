'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBasket, Trash2, X } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { mediaUrl } from '@/lib/api';
import { useQuoteCart } from './quote-cart-provider';

/** Mini-carrinho acessível (sheet lateral) do carrinho de cotação. */
export function QuoteDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, remove, subtotalCents, count } = useQuoteCart();
  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Carrinho de cotação" aria-modal="true">
      <button aria-label="Fechar carrinho" className="absolute inset-0 bg-ink/40" onClick={closeDrawer} type="button" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-elevated">
        <header className="flex items-center justify-between border-b border-line px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Sua lista</p>
            <h2 className="text-lg font-bold text-ink">Carrinho de cotação</h2>
          </div>
          <button aria-label="Fechar" className="rounded-pill p-2 hover:bg-surface-soft" onClick={closeDrawer} type="button">
            <X aria-hidden className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBasket aria-hidden className="size-10 text-muted" />
            <p className="text-sm text-muted">Sua cotação está vazia. Adicione produtos do catálogo.</p>
            <Link className="rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white" href="/loja" onClick={closeDrawer}>
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-4">
              {items.map((item) => {
                const image = mediaUrl(item.imagePath);
                return (
                  <li className="flex gap-3 py-4" key={item.variantId}>
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-soft">
                      {image ? <Image alt={item.name} className="size-full object-cover" height={64} src={image} width={64} /> : null}
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
                    <p className="text-sm font-semibold text-ink">{formatMoney(item.unitPriceCents * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-line px-4 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted">{count} item(ns) · valores de referência</span>
                <strong className="text-ink">{formatMoney(subtotalCents)}</strong>
              </div>
              <Link className="block rounded-pill bg-promo px-4 py-3 text-center text-sm font-bold text-white hover:bg-promo-hover" href="/cotacao" onClick={closeDrawer}>
                Enviar cotação
              </Link>
              <p className="mt-2 text-center text-xs text-muted">Sem pagamento online: a equipe comercial responde com a proposta.</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
