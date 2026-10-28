"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Boxes,
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
  PartyPopper,
  Pizza,
  Sandwich,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag as TagIcon,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import { cn } from "@commerce/ui/web";
import type { ApiBrand, ApiCategory, ApiSegment, ApiTag } from "@/lib/types";
import { CatalogPriceSlider } from "./catalog-price-slider";

export type CatalogSidebarProps = {
  categories: ApiCategory[];
  segments?: ApiSegment[];
  tags?: ApiTag[];
  brands?: ApiBrand[];
  activeCategorySlug?: string;
  activeSegmentSlug?: string;
  activeTagSlug?: string;
  activeBrandSlug?: string;
  baseUrl?: string;
  productsCount?: number;
  onItemClick?: () => void;
};

// Fallbacks caso os dados venham vazios para manter fidelidade estrita ao layout
const DEFAULT_FALLBACK_CATEGORIES = [
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
    id: "doces-e-bomboniere",
    name: "Doces e Bomboniere",
    slug: "doces-e-bomboniere",
    subcategories: [],
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

const DEMO_BRANDS = [
  { id: "b_110v", name: "110v", slug: "110v" },
  { id: "b_alianca", name: "Aliança", slug: "alianca" },
  { id: "b_asaf", name: "Asaf", slug: "asaf" },
  { id: "b_atlas", name: "Atlas", slug: "atlas" },
  { id: "b_bases", name: "Bases e Cia", slug: "bases-e-cia" },
  { id: "b_bellator", name: "Bellator", slug: "bellator" },
  { id: "b_bivena", name: "Bivena", slug: "bivena" },
  { id: "b_brastemp", name: "Brastemp", slug: "brastemp" },
  { id: "b_brastemp_consul", name: "Brastemp e Consul", slug: "brastemp-e-consul" },
  { id: "b_brastemp_consul_bar", name: "Brastemp/consul", slug: "brastemp-consul" },
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
  if (slug.includes("buffet") || slug.includes("restaurante")) return UtensilsCrossed;
  if (slug.includes("confeitaria") || slug.includes("bolo")) return CakeSlice;
  if (slug.includes("sorveteria") || slug.includes("acai")) return IceCream2;
  if (slug.includes("bar") || slug.includes("distribuidora")) return Wine;
  return Store;
}

export function CatalogSidebar({
  categories,
  segments,
  tags,
  brands,
  activeCategorySlug,
  activeSegmentSlug,
  activeTagSlug,
  activeBrandSlug,
  baseUrl = "/loja",
  productsCount,
  onItemClick,
}: CatalogSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const isFewProducts = productsCount !== undefined && productsCount <= 4;
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(!isFewProducts);
  const [showAllSegments, setShowAllSegments] = useState(!isFewProducts);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Inicializa a primeira categoria aberta com subcategoria (exatamente como no print "Artigos para Festa")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "artigos-para-festa": true,
  });

  // Query parameters atuais da URL
  const currentOrdem = searchParams.get("ordem") ?? "mais_vendidos";
  const currentEntrega = searchParams.get("entrega") ?? "";
  const currentMarca = activeBrandSlug ?? searchParams.get("marca") ?? "";
  const currentAvaliacao = searchParams.get("avaliacao") ?? "";
  const currentTag = activeTagSlug ?? searchParams.get("tag") ?? "";
  const precoMin = searchParams.get("precoMin") ? Number(searchParams.get("precoMin")) : undefined;
  const precoMax = searchParams.get("precoMax") ? Number(searchParams.get("precoMax")) : undefined;

  // Processa hierarquia de categorias
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
  const availableBrands = brands && brands.length > 0 ? brands : DEMO_BRANDS;

  // Filtragem dinâmica pela busca digitada na sidebar
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

  // Segmentos visíveis: quando showAllSegments está ativo exibe todos, senão exibe 4 itens com 'VER MAIS'
  const visibleSegments = useMemo(() => {
    if (showAllSegments || normalizedQuery) return filteredSegments;
    const base = filteredSegments.slice(0, 4);
    // Garante que o segmento ativo selecionado sempre apareça mesmo em modo recolhido
    if (activeSegmentSlug && !base.some((s) => s.slug === activeSegmentSlug)) {
      const active = filteredSegments.find((s) => s.slug === activeSegmentSlug);
      if (active) base.push(active);
    }
    return base;
  }, [showAllSegments, normalizedQuery, filteredSegments, activeSegmentSlug]);

  // Tags visíveis: 3 inicialmente com +4 mais / ver menos
  const visibleTags = showAllTags ? activeTags : activeTags.slice(0, 3);

  // Categorias visíveis: quando showAllCategories está ativo exibe todas, senão exibe 4 itens com 'VER MAIS'
  const visibleCategories = useMemo(() => {
    if (showAllCategories || normalizedQuery) return filteredCategories;
    const base = filteredCategories.slice(0, 4);
    // Garante que a categoria ativa selecionada sempre apareça mesmo em modo recolhido
    if (activeCategorySlug && !base.some((c) => c.slug === activeCategorySlug)) {
      const active = filteredCategories.find((c) => c.slug === activeCategorySlug);
      if (active) base.push(active);
    }
    return base;
  }, [showAllCategories, normalizedQuery, filteredCategories, activeCategorySlug]);

  const visibleBrands = showAllBrands ? availableBrands : availableBrands.slice(0, 5);

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

  function handleSidebarSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const term = searchQuery.trim();
    if (term) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", term);
      params.delete("pagina");
      router.push(`/loja?${params.toString()}`);
    }
  }

  function toggleParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);
    if (current === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("pagina");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${baseUrl}?${query}` : baseUrl, { scroll: false });
    });
    onItemClick?.();
  }

  return (
    <div className="w-full space-y-3.5 text-slate-800">
      {/* 1. SEÇÃO DE TAGS & FILTROS RÁPIDOS */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        <div className="mb-2 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <TagIcon className="size-3 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tags &amp; Filtros Rápidos
            </span>
          </div>
        </div>

        {/* Linha de Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleTags.map((tag) => {
            const isTagActive = currentTag === tag.slug;
            return (
              <button
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition shadow-2xs",
                  isTagActive
                    ? "border-[#004CB1] bg-[#004CB1] text-white font-semibold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#004CB1] hover:text-[#004CB1]"
                )}
                key={tag.id || tag.slug}
                onClick={() => toggleParam("tag", tag.slug)}
                type="button"
              >
                <span className={cn("text-[10px]", isTagActive ? "text-white/80" : "text-slate-400")}>
                  •
                </span>
                <span>{tag.name}</span>
              </button>
            );
          })}

          {/* Botão para ver mais / recolher tags */}
          {activeTags.length > 3 && (
            <button
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-500 transition hover:border-[#004CB1] hover:text-[#004CB1]"
              onClick={() => setShowAllTags(!showAllTags)}
              type="button"
            >
              <span>{showAllTags ? "Ver Menos" : `+${activeTags.length - 3} mais`}</span>
              {showAllTags ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. CAMPO DE BUSCA NA SIDEBAR */}
      <div className="relative w-full">
        <form className="relative w-full" onSubmit={handleSidebarSearchSubmit}>
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

      {/* CARD 01: Ver produtos por CATEGORIAS */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
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

        <div className="my-2.5 h-px w-full bg-slate-100" />

        <div className="space-y-1">
          {visibleCategories.map((cat) => {
            const IconComponent = getCategoryIcon(cat.slug);
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isCategoryActive =
              activeCategorySlug === cat.slug ||
              searchParams.get("categoria") === cat.slug;

            const isExpanded =
              !!expandedCategories[cat.id] ||
              (Boolean(normalizedQuery) &&
                cat.subcategories.some((s) =>
                  s.name.toLowerCase().includes(normalizedQuery)
                ));

            return (
              <div className="rounded-xl transition" key={cat.id || cat.slug}>
                {hasSubs ? (
                  <div
                    aria-expanded={isExpanded}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition",
                      isCategoryActive
                        ? "bg-blue-50 font-bold text-[#004CB1]"
                        : "text-slate-700 hover:bg-slate-100/80"
                    )}
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
                      <IconComponent
                        className={cn(
                          "size-4 shrink-0 transition",
                          isCategoryActive
                            ? "text-[#004CB1]"
                            : "text-slate-400 group-hover:text-[#004CB1]"
                        )}
                      />
                      <Link
                        className="truncate font-semibold text-slate-800 transition hover:text-[#004CB1] hover:underline"
                        href={`/categoria/${cat.slug}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick?.();
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
                  <Link
                    className={cn(
                      "group flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition",
                      isCategoryActive
                        ? "bg-blue-50 font-bold text-[#004CB1]"
                        : "text-slate-700 hover:bg-slate-100/80 hover:text-[#004CB1]"
                    )}
                    href={`/categoria/${cat.slug}`}
                    onClick={onItemClick}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <IconComponent
                        className={cn(
                          "size-4 shrink-0 transition",
                          isCategoryActive
                            ? "text-[#004CB1]"
                            : "text-slate-400 group-hover:text-[#004CB1]"
                        )}
                      />
                      <span className="truncate font-semibold">{cat.name}</span>
                    </div>
                    <ChevronRight className="size-3 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#004CB1]" />
                  </Link>
                )}

                {/* Subcategorias Indentadas */}
                {hasSubs && isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-2 pb-1 animate-in fade-in">
                    {cat.subcategories.map((sub) => {
                      const isSubActive =
                        activeCategorySlug === sub.slug ||
                        searchParams.get("categoria") === sub.slug;
                      return (
                        <Link
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium transition",
                            isSubActive
                              ? "bg-blue-100/70 text-[#004CB1] font-bold"
                              : "text-slate-600 hover:bg-blue-50/70 hover:text-[#004CB1]"
                          )}
                          href={`/categoria/${sub.slug}`}
                          key={sub.slug}
                          onClick={onItemClick}
                        >
                          <span className="text-[10px] text-slate-300">-</span>
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {visibleCategories.length === 0 && (
            <p className="py-2 text-center text-xs text-slate-400">
              Nenhuma categoria encontrada.
            </p>
          )}
        </div>

        {/* Botão VER MENOS / VER MAIS de Categorias (Exatamente no estilo do print) */}
        {!normalizedQuery && processedCategories.length > 2 && (
          <button
            className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1 border-t border-slate-100 pt-2.5 text-[10.5px] font-black uppercase tracking-wider text-slate-500 transition hover:text-[#004CB1]"
            onClick={() => setShowAllCategories(!showAllCategories)}
            type="button"
          >
            <span>{showAllCategories ? "VER MENOS" : "VER MAIS"}</span>
            {showAllCategories ? (
              <ChevronUp className="size-3.5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="size-3.5 stroke-[2.5]" />
            )}
          </button>
        )}
      </div>

      {/* CARD 02: Ver produtos por SEGMENTOS */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
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

        <div className="my-2.5 h-px w-full bg-slate-100" />

        <div className="space-y-1">
          {visibleSegments.map((seg) => {
            const IconComponent = getSegmentIcon(seg.slug);
            const isSegmentActive =
              activeSegmentSlug === seg.slug ||
              searchParams.get("segmento") === seg.slug;

            return (
              <Link
                className={cn(
                  "group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition",
                  isSegmentActive
                    ? "bg-blue-50 text-[#004CB1] font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-[#004CB1]"
                )}
                href={`/segmento/${encodeURIComponent(seg.slug)}`}
                key={seg.id || seg.slug}
                onClick={onItemClick}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <IconComponent
                    className={cn(
                      "size-4 shrink-0 transition",
                      isSegmentActive
                        ? "text-[#004CB1]"
                        : "text-slate-400 group-hover:text-[#004CB1]"
                    )}
                  />
                  <span className="truncate">{seg.name}</span>
                </div>
                <ChevronRight className="size-3 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#004CB1]" />
              </Link>
            );
          })}

          {visibleSegments.length === 0 && (
            <p className="py-2 text-center text-xs text-slate-400">
              Nenhum segmento encontrado.
            </p>
          )}
        </div>

        {/* Botão VER MENOS / VER MAIS de Segmentos */}
        {!normalizedQuery && activeSegments.length > 4 && (
          <button
            className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1 border-t border-slate-100 pt-2.5 text-[10.5px] font-black uppercase tracking-wider text-slate-500 transition hover:text-[#004CB1]"
            onClick={() => setShowAllSegments(!showAllSegments)}
            type="button"
          >
            <span>{showAllSegments ? "VER MENOS" : "VER MAIS"}</span>
            {showAllSegments ? (
              <ChevronUp className="size-3.5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="size-3.5 stroke-[2.5]" />
            )}
          </button>
        )}
      </div>

      {/* CARD 03: SEÇÃO DE FILTROS (Ordenar, Entrega, Marca, Preço, Avaliação) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition">
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          Filtros
        </h2>

        {/* 1. Ordenar */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Ordenar</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "Relevância", value: "relevancia" },
              { label: "Menor Prazo", value: "prazo" },
              { label: "Menor Preço com Frete", value: "menor_frete" },
              { label: "Menor Preço", value: "preco_asc" },
              { label: "Maior Preço", value: "preco_desc" },
              { label: "Mais Vendidos", value: "mais_vendidos" },
              { label: "Mais Bem Avaliados", value: "avaliacao" },
              { label: "Lançamento", value: "lancamento" },
            ].map((opt) => {
              const isSelected =
                currentOrdem === opt.value ||
                (!searchParams.get("ordem") && opt.value === "mais_vendidos");
              return (
                <button
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition shadow-2xs",
                    isSelected
                      ? "border-[#004CB1] bg-[#004CB1] text-white font-semibold shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1] hover:text-[#004CB1]"
                  )}
                  key={opt.value}
                  onClick={() => toggleParam("ordem", opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Entrega */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Entrega</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "Frete Grátis", value: "frete_gratis" },
              { label: "Retire Grátis", value: "retire_gratis" },
              { label: "Receba até Amanhã", value: "amanha" },
              { label: "Full", value: "full" },
            ].map((opt) => {
              const isSelected = currentEntrega === opt.value;
              return (
                <button
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition shadow-2xs",
                    isSelected
                      ? "border-[#004CB1] bg-[#004CB1] text-white font-semibold"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1] hover:text-[#004CB1]"
                  )}
                  key={opt.value}
                  onClick={() => toggleParam("entrega", opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Marca */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Marca</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleBrands.map((b) => {
              const isSelected = currentMarca === b.slug;
              return (
                <button
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-1 text-xs transition shadow-2xs",
                    isSelected
                      ? "border-[#004CB1] bg-[#004CB1] text-white font-semibold"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1] hover:text-[#004CB1]"
                  )}
                  key={b.id || b.slug}
                  onClick={() => toggleParam("marca", b.slug)}
                  type="button"
                >
                  {b.name}
                </button>
              );
            })}
          </div>

          <button
            className="mt-2.5 flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#004CB1] hover:underline"
            onClick={() => setShowAllBrands(!showAllBrands)}
            type="button"
          >
            <span>{showAllBrands ? "Mostrar menos" : "Mostrar todos"}</span>
            <ArrowRight className="size-3" />
          </button>
        </div>

        {/* 4. Preço (Dual Range Slider) */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Preço</h3>
          <CatalogPriceSlider
            baseUrl={baseUrl}
            initialMax={precoMax}
            initialMin={precoMin}
          />
        </div>

        {/* 5. Avaliação */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Avaliação</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {["5", "4", "3", "2"].map((stars) => {
              const isSelected = currentAvaliacao === stars;
              return (
                <button
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition shadow-2xs",
                    isSelected
                      ? "border-[#004CB1] bg-[#004CB1] text-white font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#004CB1] hover:text-[#004CB1]"
                  )}
                  key={stars}
                  onClick={() => toggleParam("avaliacao", stars)}
                  type="button"
                >
                  <Star
                    className={cn(
                      "size-3",
                      isSelected ? "fill-white text-white" : "fill-amber-400 text-amber-400"
                    )}
                  />
                  <span>{stars}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
