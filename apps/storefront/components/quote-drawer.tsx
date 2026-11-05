'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { MapPin, MessageCircle, Minus, Plus, ShoppingBasket, Trash2, X } from 'lucide-react';
import { WebSheet } from '@commerce/ui/web';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import { COMMERCIAL_STORES, CommercialStore, buildWhatsAppLink } from '@/lib/stores-data';
import { useQuoteCart } from './quote-cart-provider';

/** Mini-carrinho acessível (sheet lateral) do carrinho de cotação. */
export function QuoteDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, remove, subtotalCents, count } = useQuoteCart();
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  function handleSendToStoreWhatsApp(store: CommercialStore) {
    const itemsList = items.map((i) => `• ${i.quantity}x ${i.name} (SKU: ${i.sku})`).join('\n');
    const msg = `Olá, Comercial do Norte (${store.shortTitle})!\nGostaria de solicitar uma cotação rápida para estes itens do carrinho no site:\n\n${itemsList}\n\nTotal de referência: ${formatMoney(subtotalCents)} (${count} itens)\nQual a disponibilidade na loja e condições para atacado?`;
    const url = buildWhatsAppLink(store.whatsappDigits, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
    setStoreModalOpen(false);
    closeDrawer();
  }

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
            <div className="flex flex-col gap-2">
              <Link
                className="block rounded-pill bg-promo px-4 py-3 text-center text-sm font-bold text-white hover:bg-promo-hover"
                href="/cotacao"
                onClick={closeDrawer}
              >
                Enviar cotação pelo site
              </Link>
              <button
                className="flex items-center justify-center gap-1.5 rounded-pill bg-[#25D366] hover:bg-[#128C7E] px-4 py-2.5 text-center text-xs font-bold text-white transition cursor-pointer"
                onClick={() => setStoreModalOpen((prev) => !prev)}
                type="button"
              >
                <MessageCircle className="size-4" />
                {storeModalOpen ? 'Ocultar lojas' : 'Cotar no WhatsApp da Loja'}
              </button>
            </div>
            {storeModalOpen && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left animate-in fade-in duration-200">
                <p className="text-xs font-bold text-slate-800 mb-2">Qual a loja mais próxima de você?</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {COMMERCIAL_STORES.map((st) => (
                    <button
                      key={st.id}
                      className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-xs flex items-center justify-between group"
                      onClick={() => handleSendToStoreWhatsApp(st)}
                      type="button"
                    >
                      <div className="min-w-0 pr-2">
                        <strong className="block text-slate-900 group-hover:text-emerald-700 truncate">{st.shortTitle}</strong>
                        <span className="block text-[10px] text-slate-500 truncate">{st.address}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold shrink-0">Enviar &rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
