"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, ChevronUp, Flame, PanelLeft, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { cn, WebButton, WebEmptyState } from "@commerce/ui/web";
import { ProductCard } from "@/components/product-card";
import { ScrollCatalogProductItem } from "@/components/ui/scroll-skeleton-reveal";
import { buildEnrichedBrands, DEFAULT_BRAND_SHOWCASE, findBrandOrSubbrand } from "@/lib/brands-data";
import { mediaUrl } from "@/lib/api";
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
    oferta?: string;
    promocao?: string;
  };
  activeCategory?: ApiCategory;
  activeSegment?: ApiSegment;
  activeTag?: ApiTag;
  activeBrand?: ApiBrand;
  baseUrl?: string;
  viewMode?: "products" | "brands";
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
  viewMode = "products",
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
    oferta,
    promocao,
  } = searchParamsState;

  const isOferta = oferta === "1" || oferta === "true" || promocao === "1";
  const isMaisVendidos = ordem === "mais_vendidos";
  const currentSort = ordem === "nome" ? "name_asc" : isMaisVendidos ? "mais_vendidos" : "newest";

  const enrichedBrands = useMemo(() => buildEnrichedBrands(brands), [brands]);
  const isBrandsDirectory = viewMode === "brands";

  const selectedBrands = useMemo(() => {
    const raw = marca ?? activeBrand?.slug ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [marca, activeBrand]);

  const selectedCategories = useMemo(() => {
    const raw = categoria ?? activeCategory?.slug ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [categoria, activeCategory]);

  const selectedSegments = useMemo(() => {
    const raw = segmento ?? activeSegment?.slug ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [segmento, activeSegment]);

  const selectedTags = useMemo(() => {
    const raw = tag ?? activeTag?.slug ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [tag, activeTag]);

  const isBrandContext = Boolean(
    isBrandsDirectory || activeBrand || selectedBrands.length > 0 || baseUrl.startsWith("/marca")
  );

  const displayedBrandsInGrid = useMemo(() => {
    if (!isBrandsDirectory) return [];
    let list = [...enrichedBrands];
    if (q) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.slug.toLowerCase().includes(term) ||
          b.children?.some(
            (sub) =>
              sub.name.toLowerCase().includes(term) ||
              sub.slug.toLowerCase().includes(term)
          )
      );
    }
    if (ordem === "nome") {
      list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    } else if (ordem === "mais_vendidos") {
      list.sort((a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0));
    }
    return list;
  }, [isBrandsDirectory, enrichedBrands, q, ordem]);

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
      precoMax ||
      isOferta ||
      isMaisVendidos
  );

  const isBrandActive = useCallback(
    (b: ApiBrand) => {
      const isSelectedSlug = selectedBrands.includes(b.slug);
      const isMatchingActive = Boolean(
        activeBrand &&
          (activeBrand.slug === b.slug ||
            activeBrand.id === b.id ||
            activeBrand.parentId === b.id)
      );
      const isChildSelected = Boolean(
        b.children?.some(
          (child) =>
            selectedBrands.includes(child.slug) ||
            activeBrand?.slug === child.slug ||
            activeBrand?.id === child.id
        )
      );
      return isSelectedSlug || isMatchingActive || isChildSelected;
    },
    [selectedBrands, activeBrand]
  );

  const activeBrands = useMemo(() => {
    return enrichedBrands.filter(isBrandActive);
  }, [enrichedBrands, isBrandActive]);

  const hasActiveBrandFilter = activeBrands.length > 0;

  const sortedBrands = useMemo(() => {
    const active: ApiBrand[] = [];
    const others: ApiBrand[] = [];

    for (const b of enrichedBrands) {
      if (isBrandActive(b)) {
        active.push(b);
      } else {
        others.push(b);
      }
    }

    return [...active, ...others];
  }, [enrichedBrands, isBrandActive]);

  const activeBrandFilterKey = selectedBrands.join(",") || activeBrand?.slug || "";
  const [isExpandedBrands, setIsExpandedBrands] = useState(false);

  useEffect(() => {
    setIsExpandedBrands(false);
  }, [activeBrandFilterKey]);

  const brandCarouselRef = useRef<HTMLDivElement>(null);
  const [canScrollBrandLeft, setCanScrollBrandLeft] = useState(false);
  const [canScrollBrandRight, setCanScrollBrandRight] = useState(false);

  const updateBrandScrollButtons = useCallback(() => {
    const el = brandCarouselRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollBrandLeft(scrollLeft > 6);
    setCanScrollBrandRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateBrandScrollButtons, 50);
    const el = brandCarouselRef.current;
    if (!el) return () => clearTimeout(timer);

    el.addEventListener("scroll", updateBrandScrollButtons, { passive: true });
    window.addEventListener("resize", updateBrandScrollButtons);

    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", updateBrandScrollButtons);
      window.removeEventListener("resize", updateBrandScrollButtons);
    };
  }, [updateBrandScrollButtons, sortedBrands, isExpandedBrands]);

  const handleBrandScroll = (direction: "left" | "right") => {
    const el = brandCarouselRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.7, 260);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const renderBrandSquare = (b: ApiBrand, isSelected: boolean) => {
    const count = b._count?.products ?? 0;
    const rawImg = b.imagePath;
    const imgSrc = rawImg
      ? rawImg.startsWith("http") || rawImg.startsWith("/")
        ? rawImg
        : mediaUrl(rawImg)
      : null;

    const targetHref = isSelected
      ? baseUrl.startsWith("/marca/") || baseUrl.startsWith("/marca")
        ? buildHref({ marca: undefined, pagina: undefined }).replace(baseUrl, "/loja")
        : buildHref({
            marca:
              selectedBrands
                .filter((s) => s !== b.slug && !b.children?.some((c) => c.slug === s))
                .join(",") || undefined,
            pagina: undefined,
          })
      : baseUrl.startsWith("/marca") || baseUrl === "/marcas"
        ? buildHref({ marca: undefined, pagina: undefined }).replace(
            baseUrl,
            `/marca/${b.slug}`
          )
        : buildHref({
            marca: [...selectedBrands, b.slug].join(","),
            pagina: undefined,
          });

    return (
      <Link
        className="group flex shrink-0 items-center gap-2 focus:outline-none"
        href={targetHref}
        key={b.id || b.slug}
        title={
          isSelected
            ? `Marca ${b.name} filtrada (clique para desmarcar)`
            : `Filtrar produtos da marca ${b.name}`
        }
      >
        <div
          className={cn(
            "relative flex size-16 sm:size-[72px] items-center justify-center rounded-2xl p-2.5 transition-all duration-200",
            isSelected
              ? "border-2 border-[#E2091E] ring-4 ring-[#E2091E]/15 bg-gradient-to-b from-red-50/70 to-white shadow-xs scale-[1.02]"
              : "border border-slate-200/90 bg-white shadow-2xs hover:border-[#004CB1]/60 hover:shadow-xs hover:-translate-y-0.5"
          )}
        >
          {isSelected && (
            <span
              aria-label="Filtro ativo"
              className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[#E2091E] text-white shadow-xs"
              title="Filtro ativo"
            >
              <Check className="size-2.5 stroke-[3]" />
            </span>
          )}
          {imgSrc ? (
            <img
              alt={b.name}
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              src={imgSrc}
            />
          ) : (
            <span
              className={cn(
                "text-center text-[11px] font-black uppercase leading-tight",
                isSelected ? "text-[#E2091E]" : "text-slate-800"
              )}
            >
              {b.name}
            </span>
          )}
        </div>
        <span
          className={cn(
            "text-xs tabular-nums transition",
            isSelected
              ? "font-black text-[#E2091E]"
              : "font-medium text-slate-500 group-hover:text-slate-800"
          )}
        >
          ({count})
        </span>
      </Link>
    );
  };

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
            {/* CABEÇALHO DO CATÁLOGO: TÍTULO, CONTAGEM E ORDENAÇÃO EM UMA LINHA SÓ */}
            <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap items-baseline gap-2 min-w-0">
                <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900">
                  {title}
                </h1>
                <span className="text-xs text-slate-500 font-medium">
                  {isBrandsDirectory
                    ? `· ${displayedBrandsInGrid.length} marca(s) parceira(s)${q ? ` para “${q}”` : ""} · selecione uma marca para ver os produtos`
                    : `· ${total} produto(s) publicado(s)${q ? ` para “${q}”` : ""} · página ${page} de ${totalPages}`}
                </span>
              </div>

              {/* CONTROLES DE ORDENAÇÃO */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0 flex-wrap">
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
                    currentSort === "mais_vendidos"
                      ? "border-[#004CB1] bg-[#004CB1] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1]"
                  )}
                  href={buildHref({ ordem: "mais_vendidos" })}
                >
                  Mais Vendidos
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
                <Link
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition shadow-2xs",
                    isOferta
                      ? "border-[#E2091E] bg-[#E2091E] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#E2091E] hover:text-[#E2091E]"
                  )}
                  href={buildHref({ oferta: isOferta ? undefined : "1" })}
                >
                  <Flame className={cn("size-3.5", isOferta ? "text-white" : "text-[#E2091E]")} />
                  <span>Ofertas</span>
                </Link>
              </div>
            </div>

            {/* FAIXA DE CARDS DE MARCAS COM CARROSSEL E DESTAQUE INTELIGENTE DE FILTRO */}
            {isBrandContext && enrichedBrands.length > 0 ? (
              hasActiveBrandFilter && !isExpandedBrands ? (
                /* MODO COMPACTO / FOCADO QUANDO UMA MARCA ESTÁ FILTRADA */
                <div
                  aria-label="Navegação rápida por marcas"
                  className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200/90 bg-gradient-to-r from-red-50/60 via-red-50/20 to-white p-3 sm:px-4 sm:py-3 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#E2091E]">
                      <span className="size-2 rounded-full bg-[#E2091E] animate-pulse" />
                      <span>Marca filtrada:</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeBrands.map((b) => renderBrandSquare(b, true))}
                    </div>

                    {/* Botão rápido para desmarcar */}
                    <Link
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-bold text-[#E2091E] shadow-2xs transition hover:bg-red-50 hover:border-red-300 active:scale-95"
                      href={
                        baseUrl.startsWith("/marca/") || baseUrl.startsWith("/marca")
                          ? buildHref({ marca: undefined, pagina: undefined }).replace(
                              baseUrl,
                              "/loja"
                            )
                          : buildHref({
                              marca:
                                selectedBrands
                                  .filter(
                                    (s) =>
                                      !activeBrands.some(
                                        (ab) => ab.slug === s || ab.children?.some((c) => c.slug === s)
                                      )
                                  )
                                  .join(",") || undefined,
                              pagina: undefined,
                            })
                      }
                      title="Remover filtro desta marca"
                    >
                      <X className="size-3 stroke-[2.5]" />
                      <span>Remover filtro</span>
                    </Link>
                  </div>

                  {/* Botão Ver mais marcas > */}
                  <button
                    className="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#E2091E] hover:text-[#E2091E] active:scale-95"
                    onClick={() => setIsExpandedBrands(true)}
                    type="button"
                  >
                    <span>Ver mais marcas</span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 transition group-hover:bg-red-100 group-hover:text-[#E2091E]">
                      +{enrichedBrands.length - activeBrands.length}
                    </span>
                    <ChevronRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#E2091E]" />
                  </button>
                </div>
              ) : (
                /* MODO CARROSSEL COMPLETO (COM SETAS ESQUERDA/DIREITA E ITENS ATIVOS EM PRIMEIRO EM VERMELHO) */
                <div className="relative mb-6">
                  {hasActiveBrandFilter && isExpandedBrands && (
                    <div className="mb-2 flex items-center justify-between px-0.5 text-xs">
                      <span className="font-bold text-slate-600">
                        Navegando por todas as marcas (marca filtrada em primeiro):
                      </span>
                      <button
                        className="inline-flex cursor-pointer items-center gap-1 font-bold text-slate-500 hover:text-[#E2091E] transition hover:underline"
                        onClick={() => setIsExpandedBrands(false)}
                        type="button"
                      >
                        <span>Ocultar outras marcas</span>
                        <ChevronUp className="size-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="relative group/carousel">
                    {/* Botão Carrossel Esquerda */}
                    <button
                      aria-label="Rolar marcas para a esquerda"
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 z-20 flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200 transition-all duration-200 hover:bg-white hover:text-[#004CB1] hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs",
                        canScrollBrandLeft
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      )}
                      disabled={!canScrollBrandLeft}
                      onClick={() => handleBrandScroll("left")}
                      type="button"
                    >
                      <ChevronLeft className="size-5 stroke-[2.5]" />
                    </button>

                    {/* Botão Carrossel Direita */}
                    <button
                      aria-label="Rolar marcas para a direita"
                      className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 z-20 flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200 transition-all duration-200 hover:bg-white hover:text-[#004CB1] hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs",
                        canScrollBrandRight
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      )}
                      disabled={!canScrollBrandRight}
                      onClick={() => handleBrandScroll("right")}
                      type="button"
                    >
                      <ChevronRight className="size-5 stroke-[2.5]" />
                    </button>

                    {/* Efeito de fade nas bordas para indicar continuidade suave */}
                    <div
                      className={cn(
                        "pointer-events-none absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-[#F4F5F7] to-transparent z-10 transition-opacity duration-200",
                        canScrollBrandLeft ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div
                      className={cn(
                        "pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#F4F5F7] to-transparent z-10 transition-opacity duration-200",
                        canScrollBrandRight ? "opacity-100" : "opacity-0"
                      )}
                    />

                    {/* Trilho de rolagem horizontal dos quadradinhos */}
                    <div
                      aria-label="Navegação rápida por marcas"
                      className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth px-1"
                      ref={brandCarouselRef}
                    >
                      {sortedBrands.map((b) => {
                        const isSelected = isBrandActive(b);
                        return renderBrandSquare(b, isSelected);
                      })}
                    </div>
                  </div>
                </div>
              )
            ) : null}

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
                {selectedCategories.map((catSlug) => {
                  const cat =
                    categories.find((c) => c.slug === catSlug) ??
                    categories.flatMap((c) => c.children ?? []).find((c) => c.slug === catSlug);
                  const name = cat?.name ?? catSlug;
                  const remaining = selectedCategories.filter((c) => c !== catSlug);
                  const nextCat = remaining.length > 0 ? remaining.join(",") : undefined;
                  return (
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                      href={
                        baseUrl.startsWith("/categoria/")
                          ? buildHref({ categoria: nextCat, pagina: undefined }).replace(
                              baseUrl,
                              nextCat ? baseUrl : "/loja"
                            )
                          : buildHref({ categoria: nextCat, pagina: undefined })
                      }
                      key={catSlug}
                      title={`Remover filtro de categoria ${name}`}
                    >
                      Categoria: {name} <span className="font-bold text-slate-400">×</span>
                    </Link>
                  );
                })}

                {selectedSegments.map((segSlug) => {
                  const seg = segments.find((s) => s.slug === segSlug);
                  const name = seg?.name ?? segSlug;
                  const remaining = selectedSegments.filter((s) => s !== segSlug);
                  const nextSeg = remaining.length > 0 ? remaining.join(",") : undefined;
                  return (
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                      href={
                        baseUrl.startsWith("/segmento/")
                          ? buildHref({ segmento: nextSeg, pagina: undefined }).replace(
                              baseUrl,
                              nextSeg ? baseUrl : "/loja"
                            )
                          : buildHref({ segmento: nextSeg, pagina: undefined })
                      }
                      key={segSlug}
                      title={`Remover filtro de segmento ${name}`}
                    >
                      Segmento: {name} <span className="font-bold text-slate-400">×</span>
                    </Link>
                  );
                })}

                {selectedTags.map((tagSlug) => {
                  const t = tags.find((item) => item.slug === tagSlug);
                  const name = t?.name ?? tagSlug;
                  const remaining = selectedTags.filter((s) => s !== tagSlug);
                  const nextTag = remaining.length > 0 ? remaining.join(",") : undefined;
                  return (
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                      href={
                        baseUrl.startsWith("/tag/")
                          ? buildHref({ tag: nextTag, pagina: undefined }).replace(
                              baseUrl,
                              nextTag ? baseUrl : "/loja"
                            )
                          : buildHref({ tag: nextTag, pagina: undefined })
                      }
                      key={tagSlug}
                      title={`Remover filtro de tag #${name}`}
                    >
                      Tag: #{name} <span className="font-bold text-slate-400">×</span>
                    </Link>
                  );
                })}

                {selectedBrands.map((brandSlug) => {
                  const brandInfo = findBrandOrSubbrand(enrichedBrands, brandSlug);
                  const name = brandInfo?.brand.name ?? brandSlug;
                  const remaining = selectedBrands.filter((b) => b !== brandSlug);
                  const nextMarca = remaining.length > 0 ? remaining.join(",") : undefined;
                  return (
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-medium text-slate-800 transition hover:border-red-500 hover:text-red-600"
                      href={
                        baseUrl.startsWith("/marca/")
                          ? buildHref({ marca: nextMarca, pagina: undefined }).replace(
                              baseUrl,
                              nextMarca ? baseUrl : "/loja"
                            )
                          : buildHref({ marca: nextMarca, pagina: undefined })
                      }
                      key={brandSlug}
                      title={`Remover filtro de marca ${name}`}
                    >
                      Marca: {name} <span className="font-bold text-slate-400">×</span>
                    </Link>
                  );
                })}
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
                {isOferta ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 font-medium text-[#E2091E] transition hover:border-red-500 hover:text-red-700"
                    href={buildHref({ oferta: undefined, promocao: undefined })}
                    title="Remover filtro de ofertas"
                  >
                    <Flame className="size-3 text-[#E2091E]" />
                    Ofertas do Dia <span className="font-bold text-red-400">×</span>
                  </Link>
                ) : null}
                {isMaisVendidos ? (
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 font-medium text-[#004CB1] transition hover:border-[#004CB1] hover:text-[#004CB1]"
                    href={buildHref({ ordem: undefined })}
                    title="Remover ordenação por mais vendidos"
                  >
                    <ShoppingBag className="size-3 text-[#004CB1]" />
                    Mais Vendidos <span className="font-bold text-blue-400">×</span>
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

            {/* GRID PRINCIPAL: 4 COLUNAS DE MARCAS (EM /marcas) OU 4 COLUNAS DE PRODUTOS */}
            {isBrandsDirectory ? (
              displayedBrandsInGrid.length > 0 ? (
                <div
                  aria-label="Grade de marcas em 4 colunas"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch"
                >
                  {displayedBrandsInGrid.map((brand, index) => {
                    const showcase = DEFAULT_BRAND_SHOWCASE.find(
                      (s) => s.slug === brand.slug
                    );
                    const rawImg = brand.imagePath || showcase?.imagePath;
                    const imgSrc = rawImg
                      ? rawImg.startsWith("http") || rawImg.startsWith("/")
                        ? rawImg
                        : mediaUrl(rawImg)
                      : null;
                    const count = brand._count?.products ?? showcase?.productCount ?? 0;
                    const subs = brand.children ?? [];
                    const accentColor = showcase?.accentColor || "#004CB1";

                    return (
                      <ScrollCatalogProductItem index={index} key={brand.id || brand.slug}>
                        <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#004CB1]/50 hover:shadow-md">
                          {/* Barra superior discreta na cor da marca */}
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-1 transition-all duration-200 group-hover:h-1.5"
                            style={{ backgroundColor: accentColor }}
                          />

                          <div>
                            {/* Badge de quantidade no topo */}
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#004CB1]">
                                {count} produtos
                              </span>
                              {subs.length > 0 ? (
                                <span className="text-[10.5px] font-semibold text-slate-400">
                                  {subs.length} linhas
                                </span>
                              ) : null}
                            </div>

                            {/* Área quadrada do Logo (mesma proporção da foto do produto) */}
                            <Link
                              aria-label={`Ver produtos da marca ${brand.name}`}
                              className="my-2 flex aspect-square w-full items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-5 transition group-hover:border-blue-100 group-hover:bg-white"
                              href={`/marca/${brand.slug}`}
                            >
                              {imgSrc ? (
                                <img
                                  alt={brand.name}
                                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                  src={imgSrc}
                                />
                              ) : (
                                <span className="text-center text-base font-black uppercase text-slate-800">
                                  {brand.name}
                                </span>
                              )}
                            </Link>

                            {/* Nome e subtítulo da marca */}
                            <Link
                              className="mt-2 block"
                              href={`/marca/${brand.slug}`}
                            >
                              <h2 className="text-sm sm:text-base font-black text-slate-900 transition group-hover:text-[#004CB1]">
                                {brand.name}
                              </h2>
                              <p className="mt-0.5 line-clamp-1 text-[11.5px] font-medium text-slate-500">
                                {showcase?.subtitle ||
                                  brand.description ||
                                  "Linha completa no atacado e varejo"}
                              </p>
                            </Link>

                            {/* Submarcas rápidas dentro do card */}
                            {subs.length > 0 && (
                              <div className="mt-3 border-t border-slate-100 pt-2.5">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Submarcas:
                                </span>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {subs.slice(0, 3).map((sub) => (
                                    <Link
                                      className="inline-flex items-center gap-1 rounded-md border border-slate-200/90 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 transition hover:border-[#004CB1] hover:bg-blue-50 hover:text-[#004CB1]"
                                      href={`/marca/${sub.slug}`}
                                      key={sub.id || sub.slug}
                                    >
                                      <span className="truncate max-w-[115px]">{sub.name}</span>
                                      <span className="text-[9.5px] text-slate-400">
                                        ({sub._count?.products ?? 0})
                                      </span>
                                    </Link>
                                  ))}
                                  {subs.length > 3 && (
                                    <Link
                                      className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-[#004CB1]"
                                      href={`/marca/${brand.slug}`}
                                    >
                                      +{subs.length - 3}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* CTA Inferior no padrão dos cards do catálogo */}
                          <Link
                            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#004CB1] px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#00357B]"
                            href={`/marca/${brand.slug}`}
                          >
                            <span>Ver Produtos</span>
                            <ChevronRight className="size-3.5" />
                          </Link>
                        </div>
                      </ScrollCatalogProductItem>
                    );
                  })}
                </div>
              ) : (
                <WebEmptyState
                  action={
                    <Link
                      className="inline-block rounded-full bg-[#004CB1] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#00357B]"
                      href="/marcas"
                    >
                      Ver todas as marcas
                    </Link>
                  }
                  className="mt-8 bg-white border border-slate-200/90 rounded-2xl p-8"
                  description="Tente outros termos de busca para localizar a marca ou submarca desejada."
                  title="Nenhuma marca encontrada."
                />
              )
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 items-start">
                  {products.map((product, index) => (
                    <ScrollCatalogProductItem index={index} key={product.id}>
                      <ProductCard product={product} />
                    </ScrollCatalogProductItem>
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
