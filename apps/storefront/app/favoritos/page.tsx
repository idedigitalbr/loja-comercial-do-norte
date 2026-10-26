'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Heart,
  Plus,
  ShoppingBag,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useFavorites } from '@/components/favorites-provider';
import { useQuoteCart } from '@/components/quote-cart-provider';
import { useAuth } from '@/components/auth-provider';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';

export default function FavoritosPage() {
  const { favorites, count, remove, clear, ready } = useFavorites();
  const { add: addToCart, openDrawer } = useQuoteCart();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'favoritos' | 'listas'>('favoritos');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  function handleAddAllToQuote() {
    if (!favorites.length) return;
    for (const item of favorites) {
      addToCart({
        variantId: item.variantId || item.id,
        productSlug: item.productSlug,
        name: item.name,
        sku: item.sku || 'SKU-FAV',
        imagePath: item.imagePath,
        unitPriceCents: item.unitPriceCents,
        quantity: 1,
      });
    }
    setAddedNotice(`${favorites.length} itens foram adicionados à sua cotação!`);
    openDrawer();
    setTimeout(() => setAddedNotice(null), 4000);
  }

  function handleAddSingleToQuote(item: (typeof favorites)[0]) {
    addToCart({
      variantId: item.variantId || item.id,
      productSlug: item.productSlug,
      name: item.name,
      sku: item.sku || 'SKU-FAV',
      imagePath: item.imagePath,
      unitPriceCents: item.unitPriceCents,
      quantity: 1,
    });
    setAddedNotice(`"${item.name}" foi adicionado à sua cotação.`);
    openDrawer();
    setTimeout(() => setAddedNotice(null), 3000);
  }

  if (!ready) {
    return (
      <div className="cn-container py-16 text-center text-sm text-slate-500">
        Carregando seus favoritos…
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#F4F7FB] pb-16 pt-6">
      <div className="cn-container">
        {/* Título Principal */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2433]">Favoritos</h1>

        {/* Abas Superiores (Fiel à referência: Meus Favoritos | Minhas listas) */}
        <div className="mt-4 flex border-b border-slate-200">
          <button
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'favoritos'
                ? 'border-[#004CB1] text-[#004CB1]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('favoritos')}
            type="button"
          >
            <Heart className="size-4" />
            <span>Meus Favoritos</span>
            {count > 0 && (
              <span className="rounded-full bg-[#004CB1]/10 px-2 py-0.5 text-xs text-[#004CB1]">
                {count}
              </span>
            )}
          </button>

          <button
            className={`ml-8 flex items-center gap-2 pb-3 pt-1 text-sm font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'listas'
                ? 'border-[#004CB1] text-[#004CB1]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('listas')}
            type="button"
          >
            <span>Minhas listas</span>
          </button>
        </div>

        {/* Aviso de item adicionado à cotação */}
        {addedNotice && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 shadow-sm animate-in fade-in duration-200">
            <span>{addedNotice}</span>
            <button
              className="text-xs font-bold text-emerald-900 underline ml-3"
              onClick={openDrawer}
              type="button"
            >
              Ver cotação
            </button>
          </div>
        )}

        {/* Banner de Usuário Visitante (quando não logado) */}
        {!isAuthenticated && count > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#004CB1] text-white">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <strong className="block font-bold">Você está navegando como visitante.</strong>
                <span className="text-xs text-blue-800">
                  Seus favoritos estão guardados neste navegador. Entre ou crie sua conta para salvá-los permanentemente!
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

        {/* CONTEÚDO DA ABA: MEUS FAVORITOS */}
        {activeTab === 'favoritos' && (
          <>
            {count === 0 ? (
              /* ESTADO VAZIO (Fidelidade visual à imagem Magalu enviada) */
              <div className="mt-12 flex flex-col items-center justify-center text-center py-12 px-4">
                {/* Ícone de Coração Vermelho com Ícone de Alerta */}
                <div className="relative mb-6 flex size-24 items-center justify-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-rose-50">
                    <Heart className="size-12 fill-[#E2091E] text-[#E2091E] stroke-[1.5]" />
                  </div>
                  <div className="absolute bottom-1 right-2 flex size-6 items-center justify-center rounded-full bg-white shadow-md">
                    <AlertCircle className="size-4 text-amber-500 fill-amber-50" />
                  </div>
                </div>

                {/* Textos Oficiais */}
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D2433]">
                  Seus favoritos estão guardados!
                </h2>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  {isAuthenticated
                    ? 'Você ainda não adicionou nenhum item aos favoritos. Explore nosso catálogo de embalagens e descartáveis!'
                    : 'Entre na sua conta para ver a lista completa ou explore nosso catálogo.'}
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
              /* ESTADO COM PRODUTOS FAVORITADOS ("se tiver coisa as coisa") */
              <div className="mt-6">
                {/* Barra de Ações do Topo */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-xs border border-slate-200/80">
                  <span className="text-sm font-semibold text-slate-700">
                    {count} {count === 1 ? 'produto salvo' : 'produtos salvos'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#004CB1] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#003882] cursor-pointer"
                      onClick={handleAddAllToQuote}
                      type="button"
                    >
                      <ShoppingBag className="size-3.5" />
                      <span>Adicionar todos à cotação</span>
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
                      onClick={clear}
                      type="button"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Limpar lista</span>
                    </button>
                  </div>
                </div>

                {/* Grade de Produtos Favoritados */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {favorites.map((item) => {
                    const image = resolveProductImage(item.productSlug || item.id);
                    return (
                      <article
                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#004CB1]/40 hover:shadow-md"
                        key={item.id}
                      >
                        <div className="relative">
                          {/* Botão Remover dos Favoritos */}
                          <button
                            aria-label={`Remover ${item.name} dos favoritos`}
                            className="absolute right-1 top-1 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-xs transition hover:bg-rose-50 hover:text-[#E2091E] cursor-pointer"
                            onClick={() => remove(item.id)}
                            title="Remover dos favoritos"
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>

                          {/* Imagem do Produto */}
                          <Link
                            className="relative block aspect-square w-full overflow-hidden rounded-lg bg-slate-50"
                            href={`/produto/${item.productSlug}`}
                          >
                            <Image
                              alt={`${item.name} (Imagem ilustrativa)`}
                              className="size-full object-contain p-2 transition duration-200 group-hover:scale-105"
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              src={image}
                              unoptimized
                            />
                          </Link>
                        </div>

                        <div className="mt-3 flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              className="line-clamp-2 text-xs sm:text-sm font-bold text-slate-800 transition hover:text-[#004CB1]"
                              href={`/produto/${item.productSlug}`}
                            >
                              {item.name}
                            </Link>

                            <div className="mt-2 flex items-baseline gap-1">
                              <strong className="text-base sm:text-lg font-extrabold text-[#163264]">
                                {formatMoney(item.unitPriceCents)}
                              </strong>
                              <span className="text-[11px] text-slate-500">no pacote</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <button
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#004CB1] py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#003882] cursor-pointer"
                              onClick={() => handleAddSingleToQuote(item)}
                              type="button"
                            >
                              <Plus className="size-3.5" />
                              <span>Adicionar à cotação</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* CONTEÚDO DA ABA: MINHAS LISTAS */}
        {activeTab === 'listas' && (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-[#1D2433]">Crie listas personalizadas</h3>
            <p className="mt-2 text-sm text-slate-500">
              Organize seus produtos favoritos por evento, padaria, pizzaria ou reposição semanal para agilizar suas cotações.
            </p>
            {!isAuthenticated ? (
              <div className="mt-6">
                <Link
                  className="inline-flex items-center justify-center rounded-lg bg-[#004CB1] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#003882]"
                  href="/login"
                >
                  Entre ou Crie sua Conta para criar listas
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#004CB1] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#003882] cursor-pointer"
                  onClick={() => alert('Recurso de múltiplas listas em homologação para o evento ACP.')}
                  type="button"
                >
                  <Plus className="size-4" />
                  <span>Criar nova lista</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
