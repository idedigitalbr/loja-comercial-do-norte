'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { WebSheet } from '@commerce/ui/web';
import { formatMoney, formatMoneyOrQuote } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import { useQuoteCart } from './quote-cart-provider';

/** Mini-carrinho acessível (sheet lateral) do carrinho de cotação. */
export function QuoteDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, remove, clear, subtotalCents, count } =
    useQuoteCart();

  const totalUnitsLabel = `${count} ${count === 1 ? 'un.' : 'un.'}`;
  const hasItems = items.length > 0;

  return (
    <WebSheet
      badge={
        hasItems ? (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-[#004CB1] tabular-nums">
            {totalUnitsLabel}
          </span>
        ) : undefined
      }
      bodyClassName={hasItems ? 'bg-[#F4F7FB] p-4' : 'bg-white'}
      eyebrow="Sua lista"
      footer={
        hasItems ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600">
                  {items.length} {items.length === 1 ? 'produto' : 'produtos'} · {count}{' '}
                  {count === 1 ? 'unidade' : 'unidades'}
                </p>
                <p className="text-[11px] text-slate-400">Valores de referência</p>
              </div>
              {subtotalCents > 0 ? (
                <strong className="shrink-0 text-base font-extrabold text-[#004CB1] tabular-nums">
                  {formatMoneyOrQuote(subtotalCents)}
                </strong>
              ) : (
                <span className="inline-flex shrink-0 items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-[#004CB1]">
                  {formatMoneyOrQuote(subtotalCents)}
                </span>
              )}
            </div>

            <Link
              className="flex w-full items-center justify-center gap-2 rounded-pill bg-promo px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-promo-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promo focus-visible:ring-offset-2"
              href="/cotacao"
              onClick={closeDrawer}
            >
              <span>Enviar cotação</span>
              <ArrowRight aria-hidden className="size-4" />
            </Link>

            <p className="text-center text-[11.5px] leading-snug text-slate-500">
              Sem pagamento online: você preenche seus dados na próxima etapa e a equipe responde com a proposta.
            </p>
          </div>
        ) : undefined
      }
      headerActions={
        hasItems && typeof clear === 'function' ? (
          <button
            aria-label="Limpar lista"
            className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-rose-50 hover:text-promo"
            onClick={clear}
            type="button"
          >
            Limpar
          </button>
        ) : undefined
      }
      onClose={closeDrawer}
      open={drawerOpen}
      title="Carrinho de cotação"
    >
      {!hasItems ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#004CB1]">
            <ShoppingBasket aria-hidden className="size-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#1D2433]">Sua lista de cotação está vazia</p>
            <p className="max-w-xs text-xs leading-relaxed text-slate-500">
              Adicione produtos do catálogo para montar sua lista e solicitar uma cotação com nossa equipe.
            </p>
          </div>
          <Link
            className="mt-1 rounded-pill bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#003882]"
            href="/loja"
            onClick={closeDrawer}
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const image = item.imagePath
              ? item.imagePath.startsWith('/') || /^https?:\/\//i.test(item.imagePath)
                ? item.imagePath
                : resolveProductImage({ imagePath: item.imagePath })
              : resolveProductImage(item.productSlug || item.variantId);
            const hasPrice = item.unitPriceCents != null && item.unitPriceCents > 0;
            const lineTotalCents = hasPrice ? item.unitPriceCents! * item.quantity : null;
            const productHref = item.productSlug ? `/produto/${item.productSlug}` : '/loja';

            return (
              <li
                className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition hover:border-[#004CB1]/30"
                key={item.variantId}
              >
                <div className="flex items-start gap-3">
                  <Link
                    className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70 p-1.5 transition hover:border-[#004CB1]/40"
                    href={productHref}
                    onClick={closeDrawer}
                  >
                    <Image
                      alt={`${item.name} (Imagem ilustrativa)`}
                      className="size-full object-contain"
                      height={72}
                      src={image}
                      unoptimized
                      width={72}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        className="line-clamp-2 text-[13.5px] font-bold leading-snug text-[#1D2433] transition hover:text-[#004CB1]"
                        href={productHref}
                        onClick={closeDrawer}
                      >
                        {item.name}
                      </Link>
                      <button
                        aria-label={`Remover ${item.name}`}
                        className="-mr-1 -mt-1 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-promo"
                        onClick={() => remove(item.variantId)}
                        title="Remover item"
                        type="button"
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    </div>

                    <p className="mt-1 truncate font-mono text-[11px] text-slate-500">
                      SKU {item.sku}
                      {hasPrice ? ` · ${formatMoney(item.unitPriceCents!)} / un.` : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
                    <button
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:shadow-2xs disabled:cursor-not-allowed disabled:opacity-35"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      type="button"
                    >
                      <Minus aria-hidden className="size-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-xs font-extrabold text-[#1D2433] tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:shadow-2xs"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      type="button"
                    >
                      <Plus aria-hidden className="size-3.5" />
                    </button>
                  </div>

                  {lineTotalCents !== null ? (
                    <p className="text-sm font-extrabold text-[#1D2433] tabular-nums">
                      {formatMoneyOrQuote(lineTotalCents)}
                    </p>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/90 px-2.5 py-0.5 text-[11px] font-bold text-[#004CB1]">
                      {formatMoneyOrQuote(lineTotalCents)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WebSheet>
  );
}
