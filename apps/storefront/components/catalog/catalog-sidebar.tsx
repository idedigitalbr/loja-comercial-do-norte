"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Boxes,
  Bike,
  CakeSlice,
  Candy,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Croissant,
  CupSoda,
  Flame,
  IceCream2,
  Milk,
  Minus,
  Package,
  PartyPopper,
  Pizza,
  Plus,
  Sandwich,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tag as TagIcon,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import { cn } from "@commerce/ui/web";
import { buildEnrichedBrands } from "@/lib/brands-data";
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

  const currentQ = searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(currentQ);

  useEffect(() => {
    setSearchQuery(currentQ);
  }, [currentQ]);

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
  const currentOrdem = searchParams.get("ordem") ?? "";
  const currentOferta = searchParams.get("oferta") === "1" || searchParams.get("promocao") === "1";
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
  const availableBrands = useMemo(() => buildEnrichedBrands(brands ?? []), [brands]);

  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentMarca) return;
    for (const root of availableBrands) {
      if (root.slug === currentMarca || root.children?.some((c) => c.slug === currentMarca)) {
        setExpandedBrands((prev) => ({ ...prev, [root.slug]: true }));
      }
    }
  }, [currentMarca, availableBrands]);

  function toggleBrandExpand(slug: string, e?: React.SyntheticEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedBrands((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  }

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

  const filteredTags = useMemo(() => {
    if (!normalizedQuery) return activeTags;
    return activeTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(normalizedQuery) ||
        tag.slug.toLowerCase().includes(normalizedQuery)
    );
  }, [activeTags, normalizedQuery]);

  const filteredBrands = useMemo(() => {
    if (!normalizedQuery) return availableBrands;
    return availableBrands.filter((brand) => {
      const matchRoot =
        brand.name.toLowerCase().includes(normalizedQuery) ||
        brand.slug.toLowerCase().includes(normalizedQuery);
      const matchSub = brand.children?.some(
        (sub) =>
          sub.name.toLowerCase().includes(normalizedQuery) ||
          sub.slug.toLowerCase().includes(normalizedQuery)
      );
      return matchRoot || matchSub;
    });
  }, [availableBrands, normalizedQuery]);

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

  // Tags visíveis: quando buscando exibe todas as encontradas, senão 3 inicialmente com +4 mais / ver menos
  const visibleTags = showAllTags || normalizedQuery ? filteredTags : filteredTags.slice(0, 3);

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

  const visibleBrands = useMemo(() => {
    if (showAllBrands || normalizedQuery || currentMarca || baseUrl.startsWith("/marca")) {
      return filteredBrands;
    }
    return filteredBrands.slice(0, 6);
  }, [showAllBrands, normalizedQuery, currentMarca, baseUrl, filteredBrands]);

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
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.delete("pagina");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${baseUrl}?${query}` : baseUrl);
    });
    onItemClick?.();
  }

  function handleClearSearch() {
    setSearchQuery("");
    if (searchParams.get("q")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      params.delete("pagina");
      const query = params.toString();
      startTransition(() => {
        router.push(query ? `${baseUrl}?${query}` : baseUrl);
      });
      onItemClick?.();
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
    const targetBaseUrl = baseUrl === "/marcas" ? "/loja" : baseUrl;
    startTransition(() => {
      router.push(query ? `${targetBaseUrl}?${query}` : targetBaseUrl, { scroll: false });
    });
    onItemClick?.();
  }

  function handleSelectBrandFilter(brandSlug: string) {
    if (baseUrl === "/marcas" || baseUrl.startsWith("/marca/")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("marca");
      params.delete("pagina");
      if (currentMarca === brandSlug) {
        const query = params.toString();
        startTransition(() => {
          router.push(query ? `/loja?${query}` : "/loja", { scroll: false });
        });
      } else {
        const query = params.toString();
        startTransition(() => {
          router.push(
            query ? `/marca/${brandSlug}?${query}` : `/marca/${brandSlug}`,
            { scroll: false }
          );
        });
      }
      onItemClick?.();
      return;
    }
    toggleParam("marca", brandSlug);
  }

  function handleSelectCategoryFilter(catSlug: string) {
    if (baseUrl.startsWith("/categoria/")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("categoria");
      params.delete("pagina");
      if (activeCategorySlug === catSlug) {
        const query = params.toString();
        startTransition(() => {
          router.push(query ? `/loja?${query}` : "/loja", { scroll: false });
        });
      } else {
        const query = params.toString();
        startTransition(() => {
          router.push(
            query ? `/categoria/${catSlug}?${query}` : `/categoria/${catSlug}`,
            { scroll: false }
          );
        });
      }
      onItemClick?.();
      return;
    }
    toggleParam("categoria", catSlug);
  }

  function handleSelectSegmentFilter(segSlug: string) {
    if (baseUrl.startsWith("/segmento/")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("segmento");
      params.delete("pagina");
      if (activeSegmentSlug === segSlug) {
        const query = params.toString();
        startTransition(() => {
          router.push(query ? `/loja?${query}` : "/loja", { scroll: false });
        });
      } else {
        const query = params.toString();
        startTransition(() => {
          router.push(
            query ? `/segmento/${segSlug}?${query}` : `/segmento/${segSlug}`,
            { scroll: false }
          );
        });
      }
      onItemClick?.();
      return;
    }
    toggleParam("segmento", segSlug);
  }

  const hasRefinementActive = Boolean(
    precoMin !== undefined ||
    precoMax !== undefined ||
    currentOrdem ||
    currentEntrega ||
    currentAvaliacao
  );

  function handleClearRefinements() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("precoMin");
    params.delete("precoMax");
    params.delete("ordem");
    params.delete("entrega");
    params.delete("avaliacao");
    params.delete("pagina");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${baseUrl}?${query}` : baseUrl, { scroll: false });
    });
    onItemClick?.();
  }

  function handleClearBrandFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("marca");
    params.delete("pagina");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/loja?${query}` : "/loja", { scroll: false });
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

        {/* Linha de Tags e Filtros Rápidos */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Botão Rápido de Ofertas */}
          <button
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition shadow-2xs",
              currentOferta
                ? "border-[#E2091E] bg-[#E2091E] text-white"
                : "border-red-200 bg-red-50/70 text-[#E2091E] hover:border-[#E2091E] hover:bg-red-100/60"
            )}
            onClick={() => toggleParam("oferta", "1")}
            type="button"
          >
            <Flame className="size-3" />
            <span>Ofertas do Dia</span>
          </button>

          {/* Botão Rápido de Mais Vendidos */}
          <button
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition shadow-2xs",
              currentOrdem === "mais_vendidos"
                ? "border-[#004CB1] bg-[#004CB1] text-white"
                : "border-blue-200 bg-blue-50/70 text-[#004CB1] hover:border-[#004CB1] hover:bg-blue-100/60"
            )}
            onClick={() => toggleParam("ordem", "mais_vendidos")}
            type="button"
          >
            <ShoppingBag className="size-3" />
            <span>Mais Vendidos</span>
          </button>

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
        <form
          className="relative w-full"
          onSubmit={handleSidebarSearchSubmit}
          role="search"
        >
          <label className="sr-only" htmlFor="catalog-sidebar-search">
            Buscar produtos, categorias ou marcas
          </label>
          <button
            aria-label="Buscar produtos e categorias"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 text-slate-400 hover:text-[#004CB1] transition"
            type="submit"
          >
            <Search className="size-4" />
          </button>
          <input
            aria-label="Buscar produtos, categorias..."
            className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pr-8 pl-10 text-xs text-slate-800 placeholder-slate-400 shadow-xs transition focus:border-[#004CB1] focus:outline-none focus:ring-1 focus:ring-[#004CB1]"
            id="catalog-sidebar-search"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos, categorias..."
            type="search"
            value={searchQuery}
          />
          {searchQuery ? (
            <button
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 text-slate-400 hover:text-slate-600 transition"
              onClick={handleClearSearch}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </form>
      </div>

      {/* CARD 00: FILTRO DE MARCAS & SUBMARCAS (ESTILO ÁRVORE HIERÁRQUICA — ANEXO 2) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
        {(currentMarca || baseUrl.startsWith("/marca")) && (
          <div className="mb-3">
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#004CB1] shadow-2xs transition hover:bg-blue-100"
              onClick={handleClearBrandFilter}
              type="button"
            >
              <X className="size-3.5 stroke-[2.5]" />
              <span>Limpar Filtro de Marca</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 p-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00357B] text-white shadow-xs">
              <Award className="size-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                VER POR:
              </span>
              <span className="block text-base font-black text-slate-900">
                Marcas
              </span>
            </div>
          </div>
          <Link
            className="text-[11px] font-bold text-[#004CB1] hover:underline"
            href="/marcas"
            onClick={onItemClick}
          >
            Ver todas
          </Link>
        </div>

        <div className="my-2.5 h-px w-full bg-slate-100" />

        <div className="space-y-1">
          {visibleBrands.map((brand) => {
            const subs = brand.children ?? [];
            const hasSubs = subs.length > 0;
            const isParentActive = currentMarca === brand.slug;
            const isChildActive = subs.some((s) => s.slug === currentMarca);
            const isExpanded =
              Boolean(expandedBrands[brand.slug]) ||
              isParentActive ||
              isChildActive ||
              (Boolean(normalizedQuery) &&
                subs.some((s) =>
                  s.name.toLowerCase().includes(normalizedQuery)
                ));
            const brandCount = brand._count?.products ?? 0;

            return (
              <div className="rounded-xl transition" key={brand.id || brand.slug}>
                <div
                  className={cn(
                    "group flex items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 text-xs transition",
                    isParentActive || isChildActive
                      ? "bg-blue-50/80 text-[#004CB1] font-bold"
                      : "text-slate-700 hover:bg-slate-100/80"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {hasSubs ? (
                      <button
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? `Recolher submarcas de ${brand.name}`
                            : `Expandir submarcas de ${brand.name}`
                        }
                        className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900"
                        onClick={(e) => toggleBrandExpand(brand.slug, e)}
                        type="button"
                      >
                        {isExpanded ? (
                          <Minus className="size-3.5 stroke-[2.5]" />
                        ) : (
                          <Plus className="size-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    ) : (
                      <span className="size-5 shrink-0" />
                    )}

                    <button
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                      onClick={() => handleSelectBrandFilter(brand.slug)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border transition",
                          isParentActive || isChildActive
                            ? "border-[#004CB1] bg-[#004CB1] text-white"
                            : "border-slate-300 bg-white group-hover:border-[#004CB1]"
                        )}
                      >
                        {(isParentActive || isChildActive) && (
                          <Check className="size-3 stroke-[3]" />
                        )}
                      </span>
                      <span className="truncate font-bold uppercase tracking-tight text-slate-800 group-hover:text-[#004CB1]">
                        {brand.name}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        ({brandCount})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submarcas Indentadas */}
                {hasSubs && isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-2.5 pb-1 animate-in fade-in">
                    {subs.map((sub) => {
                      const isSubSelected = currentMarca === sub.slug;
                      const subCount = sub._count?.products ?? 0;
                      return (
                        <button
                          className={cn(
                            "group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left text-[11.5px] transition",
                            isSubSelected
                              ? "bg-blue-100/70 font-bold text-[#004CB1]"
                              : "font-medium text-slate-600 hover:bg-blue-50/60 hover:text-[#004CB1]"
                          )}
                          key={sub.id || sub.slug}
                          onClick={() => handleSelectBrandFilter(sub.slug)}
                          type="button"
                        >
                          <span
                            className={cn(
                              "flex size-3.5 shrink-0 items-center justify-center rounded border transition",
                              isSubSelected
                                ? "border-[#004CB1] bg-[#004CB1] text-white"
                                : "border-slate-300 bg-white group-hover:border-[#004CB1]"
                            )}
                          >
                            {isSubSelected && <Check className="size-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{sub.name}</span>
                          <span className="shrink-0 text-[10.5px] text-slate-400">
                            ({subCount})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!normalizedQuery && availableBrands.length > 6 && (
          <button
            className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1 border-t border-slate-100 pt-2.5 text-[10.5px] font-black uppercase tracking-wider text-slate-500 transition hover:text-[#004CB1]"
            onClick={() => setShowAllBrands(!showAllBrands)}
            type="button"
          >
            <span>{showAllBrands ? "VER MENOS MARCAS" : "VER TODAS AS MARCAS"}</span>
            {showAllBrands ? (
              <ChevronUp className="size-3.5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="size-3.5 stroke-[2.5]" />
            )}
          </button>
        )}
      </div>

      {/* CARD 01: Ver produtos por CATEGORIAS (FILTRO COMBINÁVEL COM CHECKBOX) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
        <div className="flex items-center gap-3 p-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E2091E] text-white shadow-xs">
            <Package className="size-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              VER POR:
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
            const currentCatSlug = activeCategorySlug || searchParams.get("categoria") || "";
            const isCategoryActive = currentCatSlug === cat.slug;
            const isSubCategoryActive = cat.subcategories.some(
              (s) => s.slug === currentCatSlug
            );

            const isExpanded =
              !!expandedCategories[cat.id] ||
              isCategoryActive ||
              isSubCategoryActive ||
              (Boolean(normalizedQuery) &&
                cat.subcategories.some((s) =>
                  s.name.toLowerCase().includes(normalizedQuery)
                ));

            return (
              <div className="rounded-xl transition" key={cat.id || cat.slug}>
                <div
                  className={cn(
                    "group flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition",
                    isCategoryActive || isSubCategoryActive
                      ? "bg-blue-50 font-bold text-[#004CB1]"
                      : "text-slate-700 hover:bg-slate-100/80"
                  )}
                >
                  <button
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                    onClick={() => handleSelectCategoryFilter(cat.slug)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border transition",
                        isCategoryActive || isSubCategoryActive
                          ? "border-[#004CB1] bg-[#004CB1] text-white"
                          : "border-slate-300 bg-white group-hover:border-[#004CB1]"
                      )}
                    >
                      {(isCategoryActive || isSubCategoryActive) && (
                        <Check className="size-3 stroke-[3]" />
                      )}
                    </span>
                    <IconComponent
                      className={cn(
                        "size-4 shrink-0 transition",
                        isCategoryActive || isSubCategoryActive
                          ? "text-[#004CB1]"
                          : "text-slate-400 group-hover:text-[#004CB1]"
                      )}
                    />
                    <span className="truncate font-semibold text-slate-800 transition group-hover:text-[#004CB1]">
                      {cat.name}
                    </span>
                  </button>

                  {hasSubs ? (
                    <button
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded ? `Recolher ${cat.name}` : `Expandir ${cat.name}`
                      }
                      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700"
                      onClick={(e) => toggleCategoryExpand(cat.id, e)}
                      type="button"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-3.5 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="size-3.5 stroke-[2.5]" />
                      )}
                    </button>
                  ) : null}
                </div>

                {/* Subcategorias Indentadas */}
                {hasSubs && isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-2 pb-1 animate-in fade-in">
                    {cat.subcategories.map((sub) => {
                      const isSubActive = currentCatSlug === sub.slug;
                      return (
                        <button
                          className={cn(
                            "group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left text-[11.5px] font-medium transition",
                            isSubActive
                              ? "bg-blue-100/70 text-[#004CB1] font-bold"
                              : "text-slate-600 hover:bg-blue-50/70 hover:text-[#004CB1]"
                          )}
                          key={sub.slug}
                          onClick={() => handleSelectCategoryFilter(sub.slug)}
                          type="button"
                        >
                          <span
                            className={cn(
                              "flex size-3.5 shrink-0 items-center justify-center rounded border transition",
                              isSubActive
                                ? "border-[#004CB1] bg-[#004CB1] text-white"
                                : "border-slate-300 bg-white group-hover:border-[#004CB1]"
                            )}
                          >
                            {isSubActive && <Check className="size-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{sub.name}</span>
                        </button>
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

        {/* Botão VER MENOS / VER MAIS de Categorias */}
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

      {/* CARD 02: Ver produtos por SEGMENTOS (FILTRO COMBINÁVEL COM CHECKBOX) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
        <div className="flex items-center gap-3 p-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#004CB1] text-white shadow-xs">
            <Store className="size-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              VER POR:
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
              <button
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition",
                  isSegmentActive
                    ? "bg-blue-50 text-[#004CB1] font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-[#004CB1]"
                )}
                key={seg.id || seg.slug}
                onClick={() => handleSelectSegmentFilter(seg.slug)}
                type="button"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border transition",
                      isSegmentActive
                        ? "border-[#004CB1] bg-[#004CB1] text-white"
                        : "border-slate-300 bg-white group-hover:border-[#004CB1]"
                    )}
                  >
                    {isSegmentActive && <Check className="size-3 stroke-[3]" />}
                  </span>
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
              </button>
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

      {/* CARD 03: REFINAR POR: PREÇO & CRITÉRIOS (SEM MARCA REDUNDANTE) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition">
        <div className="flex items-center justify-between gap-2 p-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
              <SlidersHorizontal className="size-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                REFINAR POR:
              </span>
              <span className="block text-base font-black text-slate-900">
                Preço &amp; Critérios
              </span>
            </div>
          </div>
          {hasRefinementActive && (
            <button
              className="text-[11px] font-bold text-[#004CB1] hover:underline cursor-pointer"
              onClick={handleClearRefinements}
              type="button"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="my-2.5 h-px w-full bg-slate-100" />

        {/* 1. Faixa de Preço */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Faixa de Preço
            </h3>
            {(precoMin !== undefined || precoMax !== undefined) && (
              <button
                className="cursor-pointer text-[10.5px] font-bold text-red-600 hover:underline"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("precoMin");
                  params.delete("precoMax");
                  params.delete("pagina");
                  const q = params.toString();
                  startTransition(() => {
                    router.push(q ? `${baseUrl}?${q}` : baseUrl, { scroll: false });
                  });
                  onItemClick?.();
                }}
                type="button"
              >
                Resetar preço
              </button>
            )}
          </div>
          <CatalogPriceSlider
            baseUrl={baseUrl}
            initialMax={precoMax}
            initialMin={precoMin}
          />
        </div>

        {/* 2. Ordenar Produtos */}
        <div className="mt-4 border-t border-slate-100 pt-3.5">
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-700">
            Ordenar Produtos
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "Menor Preço", value: "preco_asc" },
              { label: "Maior Preço", value: "preco_desc" },
              { label: "Mais Vendidos", value: "mais_vendidos" },
              { label: "Novidades", value: "lancamento" },
              { label: "Relevância", value: "relevancia" },
              { label: "Mais Bem Avaliados", value: "avaliacao" },
            ].map((opt) => {
              const isSelected = currentOrdem === opt.value;
              return (
                <button
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition shadow-2xs",
                    isSelected
                      ? "border-[#004CB1] bg-[#004CB1] text-white font-bold shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#004CB1] hover:text-[#004CB1]"
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

        {/* 3. Disponibilidade & Entrega */}
        <div className="mt-4 border-t border-slate-100 pt-3.5">
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-700">
            Disponibilidade &amp; Entrega
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "Frete Grátis", value: "frete_gratis" },
              { label: "Retirar na Loja", value: "retire_gratis" },
              { label: "Pronta Entrega", value: "pronta_entrega" },
            ].map((opt) => {
              const isSelected = currentEntrega === opt.value;
              return (
                <button
                  className={cn(
                    "cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition shadow-2xs",
                    isSelected
                      ? "border-[#004CB1] bg-[#004CB1] text-white font-bold shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#004CB1] hover:text-[#004CB1]"
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

        {/* 4. Avaliação dos Clientes */}
        <div className="mt-4 border-t border-slate-100 pt-3.5">
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-700">
            Avaliação dos Clientes
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "5", value: "5" },
              { label: "4+", value: "4" },
              { label: "3+", value: "3" },
              { label: "2+", value: "2" },
            ].map((starOpt) => {
              const isSelected = currentAvaliacao === starOpt.value;
              return (
                <button
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition shadow-2xs",
                    isSelected
                      ? "border-[#004CB1] bg-[#004CB1] text-white font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#004CB1] hover:text-[#004CB1]"
                  )}
                  key={starOpt.value}
                  onClick={() => toggleParam("avaliacao", starOpt.value)}
                  type="button"
                >
                  <Star
                    className={cn(
                      "size-3",
                      isSelected ? "fill-white text-white" : "fill-amber-400 text-amber-400"
                    )}
                  />
                  <span>{starOpt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
