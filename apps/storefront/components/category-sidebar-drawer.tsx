"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@commerce/ui/web";
import {
  Boxes,
  Bike,
  CakeSlice,
  Candy,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Croissant,
  CupSoda,
  IceCream2,
  Milk,
  Package,
  PanelLeft,
  PartyPopper,
  Pizza,
  Sandwich,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Tag as TagIcon,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import type { ApiCategory, ApiSegment, ApiTag } from "@/lib/types";

export type CategorySidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  categories: ApiCategory[];
  segments?: ApiSegment[];
  tags?: ApiTag[];
};

// Fallbacks caso os dados ainda estejam carregando ou venham vazios
const DEFAULT_FALLBACK_CATEGORIES: Array<{
  id: string;
  name: string;
  slug: string;
  subcategories: Array<{ name: string; slug: string }>;
}> = [
  {
    id: "artigos-para-festa",
    name: "Artigos para Festa",
    slug: "artigos-para-festa",
    subcategories: [{ name: "Velas e Suprimentos", slug: "velas-e-suprimentos" }],
  },
  {
    id: "descartaveis",
    name: "Descartáveis",
    slug: "descartaveis",
    subcategories: [
      { name: "Copos", slug: "copos" },
      { name: "Pratos", slug: "pratos" },
    ],
  },
  {
    id: "embalagens",
    name: "Embalagens",
    slug: "embalagens",
    subcategories: [
      { name: "Caixas e Bandejas", slug: "caixas-e-bandejas" },
      { name: "Filme e Alumínio", slug: "filme-e-aluminio" },
    ],
  },
  {
    id: "doces-e-bomboniere",
    name: "Doces e Bomboniere",
    slug: "doces-e-bomboniere",
    subcategories: [],
  },
  {
    id: "frios-e-laticinios",
    name: "Frios e Laticínios",
    slug: "frios-e-laticinios",
    subcategories: [],
  },
  {
    id: "mercearia",
    name: "Mercearia",
    slug: "mercearia",
    subcategories: [],
  },
  {
    id: "produtos-de-limpeza",
    name: "Produtos de Limpeza",
    slug: "produtos-de-limpeza",
    subcategories: [],
  },
  {
    id: "sacos-e-sacolas",
    name: "Sacos e Sacolas",
    slug: "sacos-e-sacolas",
    subcategories: [],
  },
];

const DEFAULT_FALLBACK_SEGMENTS: ApiSegment[] = [
  { id: "seg_lanchonete", name: "Lanchonetes & Hamburguerias", slug: "lanchonete" },
  { id: "seg_pizzaria", name: "Pizzarias & Esfiharias", slug: "pizzaria" },
  { id: "seg_padaria", name: "Padarias & Confeitarias", slug: "padaria" },
  { id: "seg_festas", name: "Festas & Eventos", slug: "loja-de-festas" },
  { id: "seg_delivery", name: "Delivery", slug: "delivery" },
  { id: "seg_buffet", name: "Restaurantes & Buffets", slug: "restaurante-buffet" },
  { id: "seg_confeitaria", name: "Doces & Confeitaria Caseira", slug: "confeitaria-bolos" },
  { id: "seg_sorveteria", name: "Sorveterias & Açaís", slug: "sorveteria-acai" },
  { id: "seg_bar", name: "Bares & Distribuidoras", slug: "bar-distribuidora" },
];

const DEFAULT_FALLBACK_TAGS: ApiTag[] = [
  { id: "tag_biodegradavel", name: "Biodegradável", slug: "biodegradavel" },
  { id: "tag_descartavel", name: "Descartável", slug: "descartavel" },
  { id: "tag_kraft", name: "Kraft", slug: "kraft" },
  { id: "tag_reforcado", name: "Reforçado", slug: "reforcado" },
  { id: "tag_termico", name: "Térmico", slug: "termico" },
  { id: "tag_transparente", name: "Transparente", slug: "transparente" },
  { id: "tag_microondas", name: "Vai ao Micro-ondas", slug: "vai-ao-micro-ondas" },
];

function getCategoryIcon(slug: string) {
  if (slug.includes("festa")) return PartyPopper;
  if (slug.includes("descartaveis") || slug.includes("copo")) return CupSoda;
  if (slug.includes("embalagens") || slug.includes("caixa")) return Boxes;
  if (slug.includes("doce") || slug.includes("bomboniere")) return Candy;
  if (slug.includes("frio") || slug.includes("laticinio")) return Milk;
  if (slug.includes("mercearia")) return Store;
  if (slug.includes("limpeza")) return Sparkles;
  if (slug.includes("saco") || slug.includes("sacola")) return ShoppingBag;
  return Package;
}

function getSegmentIcon(slug: string) {
  if (slug.includes("lanchonete")) return Sandwich;
  if (slug.includes("pizzaria")) return Pizza;
  if (slug.includes("padaria")) return Croissant;
  if (slug.includes("festas")) return PartyPopper;
  if (slug.includes("delivery")) return Bike;
  if (slug.includes("buffet") || slug.includes("restaurante")) return UtensilsCrossed;
  if (slug.includes("confeitaria") || slug.includes("bolo")) return CakeSlice;
  if (slug.includes("sorveteria") || slug.includes("acai")) return IceCream2;
  if (slug.includes("bar") || slug.includes("distribuidora")) return Wine;
  return Store;
}

export function CategorySidebarDrawer({
  open,
  onClose,
  categories,
  segments,
  tags,
}: CategorySidebarDrawerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [headerHeight, setHeaderHeight] = useState<number>(136);
  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Trava COMPLETAMENTE o scroll da página principal (html e body) enquanto o menu estiver aberto
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    // Bloqueia qualquer rolagem na página principal
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    window.addEventListener("keydown", handleKeyDown);

    // Impede ativamente qualquer evento de rolagem na área do backdrop/fundo
    const backdropEl = backdropRef.current;
    function preventWheel(e: WheelEvent | TouchEvent) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (backdropEl) {
      backdropEl.addEventListener("wheel", preventWheel, { passive: false });
      backdropEl.addEventListener("touchmove", preventWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;

      window.removeEventListener("keydown", handleKeyDown);
      if (backdropEl) {
        backdropEl.removeEventListener("wheel", preventWheel);
        backdropEl.removeEventListener("touchmove", preventWheel);
      }
    };
  }, [open, onClose]);

  // Calcula a posição do header para garantir que o backdrop escureça APENAS a página, nunca o header
  useEffect(() => {
    function measureHeader() {
      const headerEl = document.getElementById("siteHeader");
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        const bottom = rect.bottom > 0 ? rect.bottom : 0;
        setHeaderHeight(bottom);
      }
    }

    measureHeader();
    window.addEventListener("resize", measureHeader);
    window.addEventListener("scroll", measureHeader, { passive: true });

    return () => {
      window.removeEventListener("resize", measureHeader);
      window.removeEventListener("scroll", measureHeader);
    };
  }, [open]);



  // Montagem hierárquica das categorias e subcategorias
  const processedCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return DEFAULT_FALLBACK_CATEGORIES;
    }

    const roots = categories.filter((c) => !c.parentId);
    if (roots.length === 0) return DEFAULT_FALLBACK_CATEGORIES;

    return roots.map((root) => {
      const subs =
        root.children && root.children.length > 0
          ? root.children
          : categories.filter((c) => c.parentId === root.id);

      return {
        id: root.id,
        name: root.name,
        slug: root.slug,
        subcategories: subs.map((s) => ({ name: s.name, slug: s.slug })),
      };
    });
  }, [categories]);

  const activeSegments =
    segments && segments.length > 0 ? segments : DEFAULT_FALLBACK_SEGMENTS;
  const activeTags = tags && tags.length > 0 ? tags : DEFAULT_FALLBACK_TAGS;

  // Filtragem dinâmica pela busca digitada
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return processedCategories;
    return processedCategories.filter((cat) => {
      const matchCat =
        cat.name.toLowerCase().includes(normalizedQuery) ||
        cat.slug.toLowerCase().includes(normalizedQuery);
      const matchSub = cat.subcategories.some(
        (sub) =>
          sub.name.toLowerCase().includes(normalizedQuery) ||
          sub.slug.toLowerCase().includes(normalizedQuery)
      );
      return matchCat || matchSub;
    });
  }, [processedCategories, normalizedQuery]);

  const filteredSegments = useMemo(() => {
    if (!normalizedQuery) return activeSegments;
    return activeSegments.filter(
      (seg) =>
        seg.name.toLowerCase().includes(normalizedQuery) ||
        seg.slug.toLowerCase().includes(normalizedQuery) ||
        (seg.description && seg.description.toLowerCase().includes(normalizedQuery))
    );
  }, [activeSegments, normalizedQuery]);

  // Tags visíveis: exibe apenas as 3 primeiras inicialmente com opção de "Ver mais"
  const visibleTags = showAllTags ? activeTags : activeTags.slice(0, 3);

  // Categorias: exibe APENAS 2 inicialmente (conforme solicitado pelo usuário)
  const visibleCategories =
    showAllCategories || normalizedQuery
      ? filteredCategories
      : filteredCategories.slice(0, 2);

  // Segmentos: sempre mostra TODOS os itens (sem botão de ver menos / recolher)
  const visibleSegments = filteredSegments;

  function toggleCategoryExpand(id: string, e?: React.SyntheticEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const term = searchQuery.trim();
    router.push(term ? `/loja?q=${encodeURIComponent(term)}` : "/loja");
    onClose();
  }

  if (!open) return null;

  return (
    <div
      aria-label="Menu de Navegação Lateral"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
    >
      {/* 
        Backdrop BEM ESCURO (sem blur) que escurece intensamente APENAS a página abaixo do header.
        Com z-[70], fica acima de qualquer elemento ou botão de carrossel da página.
        O topo começa exatamente na base do header (`top: headerHeight`), preservando o cabeçalho 100% nítido!
      */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-[70] bg-black/93 transition-opacity duration-300 animate-in fade-in touch-none"
        onClick={onClose}
        style={{
          top: `${Math.max(0, headerHeight)}px`,
        }}
      />

      {/* Painel lateral drawer à esquerda (z-[75], acima do backdrop, ancorado sob o header no desktop) */}
      <aside
        className="fixed left-0 z-[75] flex w-full max-w-[340px] sm:max-w-[380px] md:max-w-[400px] flex-col bg-[#F3F4F6] text-slate-800 shadow-2xl transition-transform duration-300 ease-out animate-in slide-in-from-left"
        style={{
          top: `${Math.max(0, headerHeight)}px`,
          height: `calc(100vh - ${Math.max(0, headerHeight)}px)`,
        }}
      >
        {/* 
          ÍCONE TOGGLE FLUTUANTE DE FECHAR (Posicionado do lado de fora do drawer à direita,
          exatamente como no print de referência)
        */}
        <button
          aria-label="Fechar menu lateral"
          className="absolute -right-11 top-2.5 z-50 hidden size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 hover:text-[#004CB1] active:scale-95 md:flex"
          onClick={onClose}
          title="Fechar menu lateral"
          type="button"
        >
          <PanelLeft className="size-5 stroke-[1.8]" />
        </button>

        {/* Versão mobile do botão fechar (no canto superior direito interno) */}
        <button
          aria-label="Fechar menu lateral"
          className="absolute right-2.5 top-2.5 z-50 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 md:hidden"
          onClick={onClose}
          type="button"
        >
          <PanelLeft className="size-4 stroke-[1.8]" />
        </button>

        {/* Conteúdo rolável exclusivo do Sidebar com scrollbar customizada e sem vazar para a página */}
        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-3 overflow-y-auto sidebar-scrollbar p-3.5 pt-3 sm:p-4 sm:pt-3 overscroll-contain"
        >
          {/* 1. SEÇÃO DE TAGS & FILTROS RÁPIDOS (ESTRITAMENTE EM 1 LINHA) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-xs">
            <div className="mb-1.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <TagIcon className="size-3 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tags &amp; Filtros Rápidos
                </span>
              </div>
            </div>

            {/* Linha única de Tags (sem quebrar em duas linhas) */}
            <div
              className={`flex items-center gap-1.5 ${
                showAllTags ? "flex-wrap" : "flex-nowrap overflow-x-auto no-scrollbar"
              }`}
            >
              {visibleTags.map((tag) => (
                <Link
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs transition hover:border-[#004CB1] hover:bg-blue-50/50 hover:text-[#004CB1]"
                  href={`/loja?tag=${encodeURIComponent(tag.slug)}`}
                  key={tag.id || tag.slug}
                  onClick={onClose}
                >
                  <span className="text-[10px] text-slate-400">•</span>
                  <span>{tag.name}</span>
                </Link>
              ))}

              {/* Botão para ver mais / recolher tags */}
              {activeTags.length > 3 && (
                <button
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-500 transition hover:border-[#004CB1] hover:text-[#004CB1]"
                  onClick={() => setShowAllTags(!showAllTags)}
                  type="button"
                >
                  <span>
                    {showAllTags ? "Ver Menos" : `+${activeTags.length - 3} mais`}
                  </span>
                  {showAllTags ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 2. CAMPO DE BUSCA (LOGO ABAIXO DAS TAGS, CONFORME A ORDEM EXATA) */}
          <div className="relative w-full">
            <form className="relative w-full" onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Buscar categorias, segmentos ou produtos"
                className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pr-8 pl-10 text-xs text-slate-800 placeholder-slate-400 shadow-xs transition focus:border-[#004CB1] focus:outline-none focus:ring-1 focus:ring-[#004CB1]"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos, categorias..."
                type="search"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 text-slate-400 hover:text-slate-600"
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* CARD 01: Ver produtos por CATEGORIAS (Exibe apenas 2 categorias inicialmente) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
            {/* Header Limpo do Card Categorias (Sem link e sem botão >) */}
            <div className="flex items-center gap-3 p-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E2091E] text-white shadow-xs">
                <Package className="size-5" />
              </div>
              <div className="leading-tight">
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Ver produtos por
                </span>
                <span className="block text-base font-black text-slate-900">
                  Categorias
                </span>
              </div>
            </div>

            {/* Divisor */}
            <div className="my-2.5 h-px w-full bg-slate-100" />

            {/* Lista de Categorias com Subcategorias (Accordion) */}
            <div className="space-y-1">
              {visibleCategories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.slug);
                const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                // Auto-expande caso haja busca ativa por subcategoria
                const isExpanded =
                  !!expandedCategories[cat.id] ||
                  (Boolean(normalizedQuery) &&
                    cat.subcategories.some((s) =>
                      s.name.toLowerCase().includes(normalizedQuery)
                    ));

                return (
                  <div className="rounded-xl transition" key={cat.id}>
                    {hasSubs ? (
                      /* Botão inteiro abre/fecha o collapse; apenas o texto navega para o link */
                      <div
                        aria-expanded={isExpanded}
                        className="group flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100/80 active:bg-slate-200/60"
                        onClick={() => toggleCategoryExpand(cat.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleCategoryExpand(cat.id);
                          }
                        }}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <IconComponent className="size-4 shrink-0 text-slate-400 transition group-hover:text-[#004CB1]" />
                          <Link
                            className="truncate font-semibold text-slate-800 transition hover:text-[#004CB1] hover:underline"
                            href={`/categoria/${cat.slug}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                            }}
                          >
                            {cat.name}
                          </Link>
                        </div>

                        <div
                          aria-label={
                            isExpanded ? `Recolher ${cat.name}` : `Expandir ${cat.name}`
                          }
                          className="flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition group-hover:text-slate-700"
                        >
                          {isExpanded ? (
                            <ChevronUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ChevronDown className="size-3.5 stroke-[2.5]" />
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Sem subcategorias: o card inteiro direciona diretamente */
                      <Link
                        className="group flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100/80 hover:text-[#004CB1]"
                        href={`/categoria/${cat.slug}`}
                        onClick={onClose}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <IconComponent className="size-4 shrink-0 text-slate-400 transition group-hover:text-[#004CB1]" />
                          <span className="truncate font-semibold">{cat.name}</span>
                        </div>
                        <ChevronRight className="size-3 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#004CB1]" />
                      </Link>
                    )}

                    {/* Subcategorias Indentadas */}
                    {hasSubs && isExpanded && (
                      <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-2 pb-1 animate-in fade-in">
                        {cat.subcategories.map((sub) => (
                          <Link
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium text-slate-600 transition hover:bg-blue-50/70 hover:text-[#004CB1]"
                            href={`/categoria/${sub.slug}`}
                            key={sub.slug}
                            onClick={onClose}
                          >
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {visibleCategories.length === 0 && (
                <p className="py-2 text-center text-xs text-slate-400">
                  Nenhuma categoria encontrada para &ldquo;{searchQuery}&rdquo;.
                </p>
              )}
            </div>

            {/* Botão VER MAIS / VER MENOS de Categorias (Exibe a partir de 2 itens) */}
            {!normalizedQuery && processedCategories.length > 2 && (
              <button
                className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1 border-t border-slate-100 pt-2.5 text-[10.5px] font-black uppercase tracking-wider text-slate-500 transition hover:text-[#004CB1]"
                onClick={() => setShowAllCategories(!showAllCategories)}
                type="button"
              >
                <span>{showAllCategories ? "Ver Menos" : "Ver Mais"}</span>
                {showAllCategories ? (
                  <ChevronUp className="size-3.5 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="size-3.5 stroke-[2.5]" />
                )}
              </button>
            )}
          </div>

          {/* CARD 02: Ver produtos por SEGMENTOS (Sempre exibe todos os 8 segmentos, sem botão ver menos) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
            {/* Header Limpo do Card Segmentos (Sem link e sem botão >) */}
            <div className="flex items-center gap-3 p-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#004CB1] text-white shadow-xs">
                <Store className="size-5" />
              </div>
              <div className="leading-tight">
                <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Ver produtos por
                </span>
                <span className="block text-base font-black text-slate-900">
                  Segmentos
                </span>
              </div>
            </div>

            {/* Divisor */}
            <div className="my-2.5 h-px w-full bg-slate-100" />

            {/* Lista com TODOS os Segmentos */}
            <div className="space-y-1">
              {visibleSegments.map((seg) => {
                const IconComponent = getSegmentIcon(seg.slug);

                return (
                  <Link
                    className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#004CB1]"
                    href={`/segmento/${encodeURIComponent(seg.slug)}`}
                    key={seg.id || seg.slug}
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent className="size-4 shrink-0 text-slate-400 group-hover:text-[#004CB1]" />
                      <span className="truncate">{seg.name}</span>
                    </div>
                    <ChevronRight className="size-3 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#004CB1]" />
                  </Link>
                );
              })}

              {visibleSegments.length === 0 && (
                <p className="py-2 text-center text-xs text-slate-400">
                  Nenhum segmento encontrado para &ldquo;{searchQuery}&rdquo;.
                </p>
              )}
            </div>
          </div>

          {/* Botão Ver Catálogo Completo (Por último no menu, logo após o card de Segmentos) */}
          <div className="pt-1 pb-4">
            <Link
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-slate-900 active:scale-98"
              href="/loja"
              onClick={onClose}
            >
              <span>Ver Catálogo Completo</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
