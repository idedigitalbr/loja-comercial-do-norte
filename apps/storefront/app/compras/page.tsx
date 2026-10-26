'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useQuoteCart } from '@/components/quote-cart-provider';
import { useAuth } from '@/components/auth-provider';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';

export default function ComprasPage() {
  const { items, count, subtotalCents, updateQuantity, remove, clear, ready } = useQuoteCart();
  const { isAuthenticated, user } = useAuth();

  if (!ready) {
    return (
      <div className="cn-container py-16 text-center text-sm text-slate-500">
        Carregando sua sacola de compras…
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#F4F7FB] pb-16 pt-6">
      <div className="cn-container">
        {/* Título Principal */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2433]">Minhas Compras &amp; Cotações</h1>

        {/* Banner de Usuário Visitante (quando não logado e com itens) */}
        {!isAuthenticated && items.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#004CB1] text-white">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <strong className="block font-bold">Você está montando sua lista como visitante.</strong>
                <span className="text-xs text-blue-800">
                  Entre ou crie sua conta para preenchimento rápido e histórico de cotações!
                </span>
              </div>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#004CB1] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#003882]"
              href="/login"
            >
              <UserCheck className="size-4" />
              <span>Entre ou Crie sua Conta</span>
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          /* ESTADO VAZIO (Fidelidade ao padrão visual Magalu) */
          <div className="mt-12 flex flex-col items-center justify-center text-center py-12 px-4">
            {/* Ícone de Sacola com Badge de Alerta */}
            <div className="relative mb-6 flex size-24 items-center justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-blue-50">
                <ShoppingBag className="size-12 text-[#004CB1] stroke-[1.5]" />
              </div>
              <div className="absolute bottom-1 right-2 flex size-6 items-center justify-center rounded-full bg-white shadow-md">
                <AlertCircle className="size-4 text-amber-500 fill-amber-50" />
              </div>
            </div>

            {/* Textos Oficiais */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D2433]">
              Sua sacola de compras está vazia!
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              {isAuthenticated
                ? 'Você ainda não possui produtos na sua lista de cotação. Explore o catálogo para adicionar itens.'
                : 'Entre na sua conta para acompanhar suas cotações e pedidos anteriores ou explore nosso catálogo.'}
            </p>

            {/* Botões de Ação */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              {!isAuthenticated ? (
                <Link
                  className="inline-flex min-w-[200px] items-center justify-center rounded-lg bg-[#004CB1] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003882] active:scale-98"
                  href="/login"
                >
                  Entrar
                </Link>
              ) : null}

              <Link
                className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-98"
                href="/loja"
              >
                <span>Explorar catálogo</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ESTADO COM ITENS ("se tiver coisa as coisa") */
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Lista de Itens */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-700">
                  {count} {count === 1 ? 'item na lista' : 'itens na lista'}
                </span>
                <button
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  onClick={clear}
                  type="button"
                >
                  <Trash2 className="size-3.5" />
                  <span>Esvaziar sacola</span>
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {items.map((item) => {
                  const image = resolveProductImage(item.productSlug || item.variantId);
                  return (
                    <div className="flex gap-4 py-4" key={item.variantId}>
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-white border border-slate-100">
                        <Image
                          alt={`${item.name} (Imagem ilustrativa)`}
                          className="size-full object-contain p-1"
                          fill
                          sizes="80px"
                          src={image}
                          unoptimized
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#004CB1] line-clamp-2"
                            href={`/produto/${item.productSlug}`}
                          >
                            {item.name}
                          </Link>
                          <button
                            aria-label={`Remover ${item.name}`}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0 p-1"
                            onClick={() => remove(item.variantId)}
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          {/* Controles de Quantidade */}
                          <div className="flex items-center rounded-lg border border-slate-200">
                            <button
                              aria-label="Diminuir quantidade"
                              className="flex size-7 items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              type="button"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Aumentar quantidade"
                              className="flex size-7 items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              type="button"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>

                          {/* Preço Total do Item */}
                          <div className="text-right">
                            <strong className="block text-sm sm:text-base font-extrabold text-[#163264]">
                              {formatMoney(item.unitPriceCents * item.quantity)}
                            </strong>
                            <span className="text-[10px] text-slate-400">
                              {formatMoney(item.unitPriceCents)} cada
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo e Próximo Passo */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="text-base font-bold text-slate-900">Resumo da Cotação</h3>

                <div className="mt-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Quantidade de itens</span>
                    <span className="font-semibold text-slate-700">{count}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal estimado</span>
                    <span className="font-semibold text-slate-700">{formatMoney(subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Negociação no atacado</span>
                    <span className="font-semibold text-emerald-600">Disponível</span>
                  </div>
                </div>

                <div className="my-4 border-t border-slate-100 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Estimado</span>
                  <strong className="text-xl font-extrabold text-[#004CB1]">
                    {formatMoney(subtotalCents)}
                  </strong>
                </div>

                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#004CB1] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003882] active:scale-98"
                  href="/cotacao"
                >
                  <span>Avançar para Enviar Cotação</span>
                  <ArrowRight className="size-4" />
                </Link>

                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Fase 1: Sem cobrança imediata de cartão. A equipe comercial responde com condições de atacado.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800">Vantagens Comerciais:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  <li>Atendimento personalizado direto por WhatsApp</li>
                  <li>Preços especiais para volumes de atacado</li>
                  <li>Retirada nas lojas de Belém (Bernardo Sayão &amp; Jurunas)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
