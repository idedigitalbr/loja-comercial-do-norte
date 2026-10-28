"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PanelLeft, SlidersHorizontal, X } from "lucide-react";
import { cn, WebButton, WebEmptyState } from "@commerce/ui/web";
import { ProductCard } from "@/components/product-card";
import type { ApiBrand, ApiCategory, ApiProduct, ApiSegment, ApiTag } from "@/lib/types";
import { CatalogSidebar } from "./catalog-sidebar";

export type CatalogBreadcrumb = {
  label: string;
  href?: string;
};

export type CatalogViewProps = {
  title: string;
  breadcrumbs?: CatalogBreadcrumb[];
  products: ApiProduct[];
  total: number;
  page: number;
  totalPages: number;
  pageSize?: number;
  categories: ApiCategory[];
  segments: ApiSegment[];
  tags: ApiTag[];
  brands: ApiBrand[];
  searchParamsState: {
    q?: string;
    categoria?: string;
    segmento?: string;
    tag?: string;
    marca?: string;
    ordem?: string;
    entrega?: string;
    avaliacao?: string;
    precoMin?: string;
    precoMax?: string;
    pagina?: string;
  };
  activeCategory?: ApiCategory;
  activeSegment?: ApiSegment;
  activeTag?: ApiTag;
  activeBrand?: ApiBrand;
  baseUrl?: string;
};

export function CatalogView({
  title,
  breadcrumbs,
  products,
  total,
  page,
  totalPages,
  categories,
  segments,
  tags,
  brands,
  searchParamsState,
  activeCategory,
  activeSegment,
  activeTag,
  activeBrand,
  baseUrl = "/loja",
}: CatalogViewProps) {
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    q,
    categoria,
    segmento,
    tag,
    marca,
    ordem,
    entrega,
    avaliacao,
    precoMin,
    precoMax,
  } = searchParamsState;

  const currentSort = ordem === "nome" ? "name_asc" : "newest";

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...searchParamsState, ...overrides };

    Object.entries(merged).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.set(key, String(val));
      }
    });

    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  const hasActiveFilters = Boolean(
    q ||
      categoria ||
      segmento ||
      tag ||
      marca ||
      entrega ||
      avaliacao ||
      precoMin ||
      precoMax
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-6 sm:py-8">
      <div className="cn-container">
        {/* BREADCRUMB */}
        <nav aria-label="Você está aqui" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <Link className="hover:text-[#004CB1] transition" href="/">
            Início
          </Link>
          <span aria-hidden className="text-slate-400">/</span>
          <Link
            className={cn(
              "transition",
              !activeCategory && !activeSegment && !activeTag && !activeBrand
                ? "font-semibold text-slate-800"
                : "hover:text-[#004CB1]"
            )}
            href="/loja"
          >
            Catálogo
          </Link>

          {breadcrumbs && breadcrumbs.length > 0
            ? breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  <span aria-hidden className="text-slate-400">/</span>
                  {bc.href ? (
                    <Link className="hover:text-[#004CB1] transition" href={bc.href}>
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-800">{bc.label}</span>
                  )}
                </React.Fragment>
              ))
            : activeSegment ? (
                <>
                  <span aria-hidden className="text-slate-400">/</span>
                  <span className="font-semibold text-slate-800">{activeSegment.name}</span>
                </>
              ) : activeCategory ? (
                <>
                  <span aria-hidden className="text-slate-400">/</span>
                  <span className="font-semibold text-slate-800">{activeCategory.name}</span>
                </>
              ) : activeTag ? (
                <>
                  <span aria-hidden className="text-slate-400">/</span>
                  <span className="font-semibold text-slate-800">#{activeTag.name}</span>
                </>
              ) : activeBrand ? (
                <>
                  <span aria-hidden className="text-slate-400">/</span>
                  <span className="font-semibold text-slate-800">{activeBrand.name}</span>
                </>
              ) : null}
        </nav>

        {/* BOTÃO MOBILE DE ABRIR FILTROS & CATEGORIAS */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs lg:hidden">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-[#004CB1]" />
            <span className="text-xs font-bold text-slate-800">
              Categorias &amp; Filtros
            </span>
          </div>
          <button
            aria-label="Abrir filtros e categorias"
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#004CB1] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#00357B] active:scale-95"
            onClick={() => setMobileDrawerOpen(true)}
            type="button"
          >
            <span>Ver Filtros</span>
          </button>
        </div>

        {/* LAYOUT PRINCIPAL: SIDEBAR FIXO/STICKY À ESQUERDA + CONTEÚDO À DIREITA */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-7">
          {/* SIDEBAR DESKTOP (ABERTO TOTALMENTE, SEM SCROLLBAR INTERNA) */}
          <aside
            aria-label="Menu lateral e filtros de produtos"
            className="hidden lg:block w-[270px] xl:w-[280px] shrink-0"
          >
            <CatalogSidebar
              activeBrandSlug={activeBrand?.slug || marca}
              activeCategorySlug={activeCategory?.slug || categoria}
              activeSegmentSlug={activeSegment?.slug || segmento}
              activeTagSlug={activeTag?.slug || tag}
              baseUrl={baseUrl}
              brands={brands}
              categories={categories}
              productsCount={total}
              segments={segments}
              tags={tags}
            />
          </aside>

          {/* ÁREA DE CONTEÚDO PRINCIPAL (HEADER + FILTROS ATIVOS + GRID DE PRODUTOS 4 COLUNAS) */}
          <main className="flex-1 min-w-0 w-full">
            {/* CABEÇALHO DO CATÁLOGO: TÍTULO, CONTAGEM E CONTROLES À DIREITA */}
            <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-3.5">
              <div>
                <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900">
                  {title}
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  {total} produto(s) publicado(s){q ? ` para “${q}”` : ""} · página {page} de {totalPages}
                </p>
              </div>

              {/* CONTROLES À DIREITA: ORDENAR (NOVIDADES / NOME) + BUSCA NO CATÁLOGO */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500">Ordenar:</span>
                  <Link
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition shadow-2xs",
                      currentSort === "newest"
                        ? "border-[#004CB1] bg-blue-50/70 text-[#004CB1]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1]"
                    )}
                    href={buildHref({ ordem: undefined })}
                  >
                    Novidades
                  </Link>
                  <Link
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition shadow-2xs",
                      currentSort === "name_asc"
                        ? "border-[#004CB1] bg-blue-50/70 text-[#004CB1]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1]"
                    )}
                    href={buildHref({ ordem: "nome" })}
                  >
                    Nome A–Z
                  </Link>
                </div>

                {/* BUSCA COM BOTÃO AZUL ESCURO #162556 */}
                <form
                  action={baseUrl}
                  className="flex items-center gap-1.5"
                  role="search"
                >
                  <label className="sr-only" htmlFor="catalog-main-search">
                    Buscar no catálogo
                  </label>
                  <input
                    className="w-[190px] sm:w-[220px] rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-[#004CB1] focus:outline-none focus:ring-1 focus:ring-[#004CB1]"
                    defaultValue={q ?? ""}
                    id="catalog-main-search"
                    name="q"
                    placeholder="Buscar produto, marca ou SKU"
                    type="search"
                  />
                  {categoria ? <input name="categoria" type="hidden" value={categoria} /> : null}
                  {segmento ? <input name="segmento" type="hidden" value={segmento} /> : null}
                  {tag ? <input name="tag" type="hidden" value={tag} /> : null}
                  {marca ? <input name="marca" type="hidden" value={marca} /> : null}
                  <button
                    className="cursor-pointer rounded-full bg-[#162556] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#00357B] active:scale-95"
                    type="submit"
                  >
                    Buscar
                  </button>
                </form>
              </div>
            </div>

            {/* FAIXA DE FILTROS ATIVOS COM BOTÃO DE REMOÇÃO */}
            {hasActiveFilters ? (
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs shadow-xs">
                <span className="font-bold text-slate-700">Filtros ativos:</span>
                {q ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ q: undefined })}
                    title="Remover termo de busca"
                  >
                    Busca: “{q}” <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}
                {activeCategory ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ categoria: undefined })}
                    title="Remover filtro de categoria"
                  >
                    Categoria: {activeCategory.name}{" "}
                    <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}
                {activeSegment ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ segmento: undefined })}
                    title="Remover filtro de segmento"
                  >
                    Segmento: {activeSegment.name}{" "}
                    <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}
                {tag ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ tag: undefined })}
                    title="Remover filtro de tag"
                  >
                    Tag: #{tag} <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}
                {marca ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ marca: undefined })}
                    title="Remover filtro de marca"
                  >
                    Marca: {marca} <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}
                {entrega ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ entrega: undefined })}
                    title="Remover filtro de entrega"
                  >
                    Entrega: {entrega} <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}
                {avaliacao ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ avaliacao: undefined })}
                    title="Remover filtro de avaliação"
                  >
                    Avaliação: {avaliacao}★ <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}
                {precoMin || precoMax ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                    href={buildHref({ precoMin: undefined, precoMax: undefined })}
                    title="Remover filtro de preço"
                  >
                    Preço: {precoMin ? `Min R$${precoMin}` : ""} {precoMax ? `Max R$${precoMax}` : ""}{" "}
                    <span className="font-bold text-slate-400">×</span>
                  </Link>
                ) : null}

                <Link
                  className="ml-auto text-xs font-semibold text-[#004CB1] hover:underline"
                  href={baseUrl}
                >
                  Limpar todos os filtros
                </Link>
              </div>
            ) : null}

            {/* GRID DE PRODUTOS: EXATAMENTE 4 COLUNAS EM TELAS LARGAS */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 items-start">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 ? (
                  <nav
                    aria-label="Paginação do catálogo"
                    className="mt-10 flex items-center justify-center gap-2"
                  >
                    {page > 1 ? (
                      <Link
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-[#004CB1] hover:text-[#004CB1] shadow-2xs"
                        href={buildHref({ pagina: page - 1 })}
                      >
                        Anterior
                      </Link>
                    ) : null}
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter(
                        (value) =>
                          value === 1 ||
                          value === totalPages ||
                          Math.abs(value - page) <= 1
                      )
                      .map((value, index, list) => (
                        <span className="flex items-center gap-2" key={value}>
                          {index > 0 && value - list[index - 1] > 1 ? (
                            <span className="text-slate-400">…</span>
                          ) : null}
                          <Link
                            aria-current={value === page ? "page" : undefined}
                            className={cn(
                              "rounded-full border px-3.5 py-2 text-xs font-bold transition shadow-2xs",
                              value === page
                                ? "border-[#004CB1] bg-[#004CB1] text-white shadow-xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1] hover:text-[#004CB1]"
                            )}
                            href={buildHref({ pagina: value })}
                          >
                            {value}
                          </Link>
                        </span>
                      ))}
                    {page < totalPages ? (
                      <Link
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-[#004CB1] hover:text-[#004CB1] shadow-2xs"
                        href={buildHref({ pagina: page + 1 })}
                      >
                        Próxima
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </>
            ) : (
              <WebEmptyState
                action={
                  <Link
                    className="inline-block rounded-full bg-[#004CB1] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#00357B]"
                    href={baseUrl}
                  >
                    Ver catálogo completo
                  </Link>
                }
                className="mt-8 bg-white border border-slate-200/90 rounded-2xl p-8"
                description="Tente outros termos de busca ou ajuste os filtros ao lado."
                title="Nenhum produto encontrado."
              />
            )}
          </main>
        </div>
      </div>

      {/* DRAWER LATERAL PARA TELAS MOBILE (QUANDO O USUÁRIO CLICA EM 'VER FILTROS') */}
      {mobileDrawerOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
        >
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <aside className="relative z-10 flex w-full max-w-xs flex-col bg-[#F3F4F6] p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-sm font-black text-slate-900">
                Menu &amp; Filtros
              </span>
              <button
                aria-label="Fechar menu de filtros"
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs"
                onClick={() => setMobileDrawerOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto sidebar-scrollbar">
              <CatalogSidebar
                activeBrandSlug={activeBrand?.slug || marca}
                activeCategorySlug={activeCategory?.slug || categoria}
                activeSegmentSlug={activeSegment?.slug || segmento}
                activeTagSlug={activeTag?.slug || tag}
                baseUrl={baseUrl}
                brands={brands}
                categories={categories}
                onItemClick={() => setMobileDrawerOpen(false)}
                productsCount={total}
                segments={segments}
                tags={tags}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
