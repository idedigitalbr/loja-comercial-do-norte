"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, ChevronRight, Package, Store } from "lucide-react";
import { cn } from "@commerce/ui/web";
import { SEGMENT_BANNER_MAP } from "@/components/segment-hero-banner";
import { buildEnrichedBrands, DEFAULT_BRAND_SHOWCASE } from "@/lib/brands-data";
import {
  DEFAULT_FALLBACK_SEGMENTS,
  DEFAULT_FALLBACK_TAGS,
  getCategoryIcon,
  getCategoryPromoMeta,
  getSegmentIcon,
  normalizeCategoryTree,
  resolveStorefrontAssetUrl,
} from "@/lib/taxonomy-ui";
import type { ApiBrand, ApiCategory, ApiSegment, ApiTag } from "@/lib/types";

type PromoCardConfig = {
  tag: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageFit?: "cover" | "contain";
  ctaLabel: string;
  ctaHref: string;
  subLinks?: Array<{ label: string; href: string }>;
};

type MegaMenuShellProps = {
  ariaLabel: string;
  badgeIcon: React.ReactNode;
  badgeClassName: string;
  title: string;
  allLabel: string;
  allHref: string;
  onClose?: () => void;
  promo: PromoCardConfig;
  children: React.ReactNode;
};

function MegaMenuShell({
  ariaLabel,
  badgeIcon,
  badgeClassName,
  title,
  allLabel,
  allHref,
  onClose,
  promo,
  children,
}: MegaMenuShellProps) {
  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      className="w-[840px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200/95 bg-white p-5 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Área principal (8 colunas): Barra de topo + Conteúdo reutilizado */}
        <div className="flex min-w-0 flex-col lg:col-span-8">
          <div className="mb-3 border-b border-slate-100 pb-2.5">
            <Link
              className="group flex items-center justify-between rounded-xl bg-slate-50/90 px-3 py-2 transition hover:bg-blue-50 hover:text-[#004CB1]"
              href={allHref}
              onClick={onClose}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs",
                    badgeClassName
                  )}
                >
                  {badgeIcon}
                </span>
                <div className="leading-tight min-w-0">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                    VER PRODUTOS POR
                  </span>
                  <span className="block truncate text-xs font-extrabold text-slate-900 group-hover:text-[#004CB1]">
                    {title}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#004CB1]">
                <span>{allLabel}</span>
                <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#004CB1]" />
              </div>
            </Link>
          </div>

          <div className="flex-1 min-h-0">{children}</div>
        </div>

        {/* Coluna Direita (4 colunas): Card Promocional / Preview Dinâmico */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md lg:col-span-4">
          {promo.imageUrl ? (
            promo.imageFit === "contain" ? (
              <div className="flex h-28 w-full items-center justify-center border-b border-slate-100 bg-slate-50 p-4">
                <div className="relative size-full">
                  <Image
                    alt={promo.title}
                    className="object-contain"
                    fill
                    sizes="240px"
                    src={promo.imageUrl}
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <Image
                  alt={promo.title}
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  fill
                  sizes="260px"
                  src={promo.imageUrl}
                  unoptimized
                />
              </div>
            )
          ) : (
            <div className="flex h-28 w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#002B66] via-[#004CB1] to-[#00357B] p-4 text-center text-white">
              <Award className="size-6 text-amber-300" />
              <span className="line-clamp-1 text-sm font-black tracking-tight">
                {promo.title}
              </span>
            </div>
          )}

          <div className="flex flex-1 flex-col justify-between p-3.5">
            <div>
              <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-[#004CB1] uppercase">
                {promo.tag}
              </span>

              <h4 className="mt-2 line-clamp-2 text-xs font-bold leading-tight text-slate-900">
                {promo.title}
              </h4>

              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                {promo.description}
              </p>

              {promo.subLinks && promo.subLinks.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {promo.subLinks.map((sub) => (
                    <Link
                      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition hover:border-[#004CB1] hover:bg-blue-50 hover:text-[#004CB1]"
                      href={sub.href}
                      key={sub.href}
                      onClick={onClose}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#004CB1] px-3 py-2 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#00357B] active:scale-98"
              href={promo.ctaHref}
              onClick={onClose}
            >
              <span className="truncate">{promo.ctaLabel}</span>
              <ChevronRight className="size-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export type CategoriesMegaMenuProps = {
  categories: ApiCategory[];
  tags?: ApiTag[];
  onClose?: () => void;
};

export function CategoriesMegaMenu({
  categories,
  tags,
  onClose,
}: CategoriesMegaMenuProps) {
  const normalizedCategories = useMemo(
    () => normalizeCategoryTree(categories),
    [categories]
  );

  const defaultCategory = useMemo(
    () =>
      normalizedCategories.find((c) =>
        c.subcategories.some((s) => s.productCount > 0)
      ) ??
      normalizedCategories.find((c) => c.subcategories.length > 0) ??
      normalizedCategories[0],
    [normalizedCategories]
  );

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const activeCategory = useMemo(
    () =>
      normalizedCategories.find((c) => c.slug === hoveredSlug) ?? defaultCategory,
    [normalizedCategories, hoveredSlug, defaultCategory]
  );

  const quickTags = useMemo(
    () => (tags && tags.length > 0 ? tags : DEFAULT_FALLBACK_TAGS).slice(0, 5),
    [tags]
  );

  const promoMeta = getCategoryPromoMeta(
    activeCategory.slug,
    activeCategory.name,
    activeCategory.imagePath
  );

  const ActiveIcon = getCategoryIcon(activeCategory.slug);

  return (
    <MegaMenuShell
      allHref="/loja"
      allLabel="Ver catálogo completo"
      ariaLabel="Menu expandido de Categorias"
      badgeClassName="bg-[#E2091E]"
      badgeIcon={<Package className="size-4" />}
      onClose={onClose}
      promo={{
        ...promoMeta,
        imageFit: "cover",
        ctaLabel: "Explorar Categoria",
        ctaHref: `/categoria/${activeCategory.slug}`,
      }}
      title="Categorias"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        {/* Lista Principal de Categorias (Esquerda) */}
        <div className="max-h-[330px] space-y-0.5 overflow-y-auto sidebar-scrollbar pr-1.5 sm:col-span-5 sm:border-r sm:border-slate-100">
          {normalizedCategories.map((cat) => {
            const IconComponent = getCategoryIcon(cat.slug);
            const isActive = cat.slug === activeCategory.slug;

            return (
              <Link
                className={cn(
                  "group/item flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-blue-50 font-bold text-[#004CB1]"
                    : "font-medium text-slate-700 hover:bg-slate-50 hover:text-[#004CB1]"
                )}
                href={`/categoria/${cat.slug}`}
                key={cat.id || cat.slug}
                onClick={onClose}
                onFocus={() => setHoveredSlug(cat.slug)}
                onMouseEnter={() => setHoveredSlug(cat.slug)}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <IconComponent
                    className={cn(
                      "size-3.5 shrink-0 transition-colors",
                      isActive
                        ? "text-[#004CB1]"
                        : "text-slate-400 group-hover/item:text-[#004CB1]"
                    )}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {cat.productCount > 0 && (
                    <span className="text-[10px] font-medium text-slate-400">
                      ({cat.productCount})
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      "size-3.5 transition-transform",
                      isActive
                        ? "translate-x-0.5 text-[#004CB1]"
                        : "text-slate-300 group-hover/item:translate-x-0.5 group-hover/item:text-[#004CB1]"
                    )}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Painel de Subcategorias da Categoria em Foco (Centro) */}
        <div className="flex min-w-0 flex-col justify-between sm:col-span-7">
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex min-w-0 items-center gap-2">
                <ActiveIcon className="size-4 shrink-0 text-[#004CB1]" />
                <span className="truncate text-xs font-extrabold text-slate-900">
                  {activeCategory.name}
                </span>
              </div>
              <Link
                className="shrink-0 text-[11px] font-bold text-[#004CB1] hover:underline"
                href={`/categoria/${activeCategory.slug}`}
                onClick={onClose}
              >
                Ver tudo →
              </Link>
            </div>

            {activeCategory.subcategories.length > 0 ? (
              <div
                className={cn(
                  "grid gap-1",
                  activeCategory.subcategories.length >= 4
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
                )}
              >
                {activeCategory.subcategories.map((sub) => (
                  <Link
                    className="group/sub flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50/70 hover:text-[#004CB1]"
                    href={`/categoria/${sub.slug}`}
                    key={sub.slug}
                    onClick={onClose}
                  >
                    <span className="truncate">{sub.name}</span>
                    <div className="flex shrink-0 items-center gap-1">
                      {sub.productCount > 0 && (
                        <span className="text-[10px] text-slate-400">
                          ({sub.productCount})
                        </span>
                      )}
                      <ChevronRight className="size-3 text-slate-300 transition-transform group-hover/sub:translate-x-0.5 group-hover/sub:text-[#004CB1]" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <p className="text-xs font-bold text-slate-800">
                  Linha completa em {activeCategory.name}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Confira opções selecionadas com preços especiais para pedidos no atacado e varejo.
                </p>
                <Link
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[#004CB1] hover:underline"
                  href={`/categoria/${activeCategory.slug}`}
                  onClick={onClose}
                >
                  <span>
                    Ver produtos de {activeCategory.name}
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Atalhos Rápidos por Tag */}
          {quickTags.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tags rápidas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => (
                  <Link
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/70 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600 transition hover:border-[#004CB1] hover:bg-blue-50 hover:text-[#004CB1]"
                    href={`/loja?tag=${encodeURIComponent(tag.slug)}`}
                    key={tag.id || tag.slug}
                    onClick={onClose}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MegaMenuShell>
  );
}

export type SegmentsMegaMenuProps = {
  segments?: ApiSegment[];
  onClose?: () => void;
};

export function SegmentsMegaMenu({ segments, onClose }: SegmentsMegaMenuProps) {
  const activeSegments = useMemo(
    () =>
      segments && segments.length > 0 ? segments : DEFAULT_FALLBACK_SEGMENTS,
    [segments]
  );

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const hoveredSegment = useMemo(
    () => activeSegments.find((s) => s.slug === hoveredSlug) ?? null,
    [activeSegments, hoveredSlug]
  );

  const promo: PromoCardConfig = useMemo(() => {
    if (hoveredSegment) {
      const resolvedImage =
        resolveStorefrontAssetUrl(hoveredSegment.imagePath) ||
        SEGMENT_BANNER_MAP[hoveredSegment.slug]?.imageSrc ||
        "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-09-delivery.jpg";

      return {
        tag: hoveredSegment._count?.products
          ? `${hoveredSegment._count.products} PRODUTOS`
          : "SEGMENTO",
        title: hoveredSegment.name,
        description:
          hoveredSegment.description ||
          `Embalagens, descartáveis e utilidades selecionadas para ${hoveredSegment.name}.`,
        imageUrl: resolvedImage,
        imageFit: "cover",
        ctaLabel: "Explorar Segmento",
        ctaHref: `/segmento/${encodeURIComponent(hoveredSegment.slug)}`,
      };
    }

    return {
      tag: "PARA TODOS OS NEGÓCIOS",
      title: "Soluções sob medida para o seu ramo",
      description:
        "Pizzarias, lanchonetes, padarias, festas, delivery e muito mais com condição de atacado.",
      imageUrl:
        "/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-09-delivery.jpg",
      imageFit: "cover",
      ctaLabel: "Ver Todos os Segmentos",
      ctaHref: "/segmentos",
    };
  }, [hoveredSegment]);

  return (
    <MegaMenuShell
      allHref="/segmentos"
      allLabel="Ver todos os segmentos"
      ariaLabel="Menu expandido de Segmentos"
      badgeClassName="bg-[#004CB1]"
      badgeIcon={<Store className="size-4" />}
      onClose={onClose}
      promo={promo}
      title="Segmentos"
    >
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {activeSegments.map((seg) => {
          const IconComponent = getSegmentIcon(seg.slug);
          const isActive = hoveredSegment?.slug === seg.slug;

          return (
            <Link
              className={cn(
                "group/item flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-xs transition-colors",
                isActive
                  ? "border-blue-200 bg-blue-50/70 font-bold text-[#004CB1]"
                  : "border-transparent font-medium text-slate-700 hover:border-slate-200/80 hover:bg-slate-50 hover:text-[#004CB1]"
              )}
              href={`/segmento/${encodeURIComponent(seg.slug)}`}
              key={seg.id || seg.slug}
              onClick={onClose}
              onFocus={() => setHoveredSlug(seg.slug)}
              onMouseEnter={() => setHoveredSlug(seg.slug)}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-[#004CB1] text-white"
                      : "bg-slate-100 text-slate-500 group-hover/item:bg-[#004CB1] group-hover/item:text-white"
                  )}
                >
                  <IconComponent className="size-3.5" />
                </span>
                <span className="truncate">{seg.name}</span>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {seg._count?.products !== undefined && seg._count.products > 0 && (
                  <span className="text-[10px] font-medium text-slate-400">
                    ({seg._count.products})
                  </span>
                )}
                <ChevronRight className="size-3.5 text-slate-300 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-[#004CB1]" />
              </div>
            </Link>
          );
        })}
      </div>
    </MegaMenuShell>
  );
}

export type BrandsMegaMenuProps = {
  brands: ApiBrand[];
  onClose?: () => void;
};

export function BrandsMegaMenu({ brands, onClose }: BrandsMegaMenuProps) {
  const enrichedBrands = useMemo(
    () => buildEnrichedBrands(brands ?? []),
    [brands]
  );

  const { featuredBrands, otherBrands } = useMemo(() => {
    const withLogos = enrichedBrands.filter((b) => Boolean(b.imagePath));
    const featured = (withLogos.length > 0 ? withLogos : enrichedBrands).slice(
      0,
      12
    );
    const featuredSlugs = new Set(featured.map((b) => b.slug));
    const others = enrichedBrands
      .filter((b) => !featuredSlugs.has(b.slug))
      .sort(
        (a, b) =>
          (b._count?.products ?? 0) - (a._count?.products ?? 0) ||
          a.name.localeCompare(b.name, "pt-BR")
      );

    return { featuredBrands: featured, otherBrands: others };
  }, [enrichedBrands]);

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const hoveredBrand = useMemo(
    () => enrichedBrands.find((b) => b.slug === hoveredSlug) ?? null,
    [enrichedBrands, hoveredSlug]
  );

  const promo: PromoCardConfig = useMemo(() => {
    if (hoveredBrand) {
      const showcaseMatch = DEFAULT_BRAND_SHOWCASE.find(
        (s) => s.slug === hoveredBrand.slug
      );
      const count = hoveredBrand._count?.products ?? 0;

      return {
        tag: count > 0 ? `${count} PRODUTOS` : "MARCA PARCEIRA",
        title: hoveredBrand.name,
        description:
          hoveredBrand.description ||
          showcaseMatch?.subtitle ||
          `Confira a linha completa de produtos ${hoveredBrand.name} para seu negócio.`,
        imageUrl: resolveStorefrontAssetUrl(hoveredBrand.imagePath),
        imageFit: "contain",
        subLinks: (hoveredBrand.children ?? []).slice(0, 3).map((sub) => ({
          label: sub.name,
          href: `/marca/${sub.slug}`,
        })),
        ctaLabel: `Explorar ${hoveredBrand.name}`,
        ctaHref: `/marca/${hoveredBrand.slug}`,
      };
    }

    return {
      tag: "MARCAS PARCEIRAS",
      title: "As Principais Marcas do Setor em Um Só Lugar",
      description:
        "Fabricantes líderes em embalagens, descartáveis, papéis e confeitaria com cotação rápida.",
      imageUrl: "/assets/HOME Vitrine/S3-CARDS-Categorias/cat-embalagens.jpg",
      imageFit: "cover",
      ctaLabel: "Ver Todas as Marcas",
      ctaHref: "/marcas",
    };
  }, [hoveredBrand]);

  return (
    <MegaMenuShell
      allHref="/marcas"
      allLabel={`Ver todas (${enrichedBrands.length})`}
      ariaLabel="Menu expandido de Marcas"
      badgeClassName="bg-[#00357B]"
      badgeIcon={<Award className="size-4" />}
      onClose={onClose}
      promo={promo}
      title="Marcas"
    >
      <div className="flex flex-col gap-3">
        {/* Grade de Marcas em Destaque com Logo */}
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Marcas em destaque
          </span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {featuredBrands.map((brand) => {
              const logoUrl = resolveStorefrontAssetUrl(brand.imagePath);
              const isActive = hoveredBrand?.slug === brand.slug;

              return (
                <Link
                  className={cn(
                    "group/brand flex flex-col items-center justify-center gap-1 rounded-xl border p-2 transition",
                    isActive
                      ? "border-[#004CB1] bg-blue-50/50 shadow-2xs"
                      : "border-slate-200/80 bg-white hover:border-[#004CB1] hover:bg-blue-50/30 hover:shadow-2xs"
                  )}
                  href={`/marca/${brand.slug}`}
                  key={brand.id || brand.slug}
                  onClick={onClose}
                  onFocus={() => setHoveredSlug(brand.slug)}
                  onMouseEnter={() => setHoveredSlug(brand.slug)}
                >
                  {logoUrl ? (
                    <div className="relative h-10 w-full">
                      <Image
                        alt={brand.name}
                        className="object-contain"
                        fill
                        sizes="120px"
                        src={logoUrl}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-full items-center justify-center rounded bg-slate-50">
                      <Award className="size-4 text-[#00357B]" />
                    </div>
                  )}
                  <span className="max-w-full truncate text-center text-[10.5px] font-bold text-slate-700 group-hover/brand:text-[#004CB1]">
                    {brand.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Lista Compacta das Demais Marcas do Catálogo */}
        {otherBrands.length > 0 && (
          <div className="border-t border-slate-100 pt-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mais marcas do catálogo ({otherBrands.length})
              </span>
            </div>
            <div className="grid max-h-[112px] grid-cols-2 gap-1 overflow-y-auto sidebar-scrollbar pr-1 sm:grid-cols-3">
              {otherBrands.map((brand) => {
                const count = brand._count?.products ?? 0;
                const isActive = hoveredBrand?.slug === brand.slug;

                return (
                  <Link
                    className={cn(
                      "flex items-center justify-between gap-1 rounded-lg px-2 py-1 text-[11px] transition-colors",
                      isActive
                        ? "bg-blue-50 font-bold text-[#004CB1]"
                        : "font-medium text-slate-700 hover:bg-slate-50 hover:text-[#004CB1]"
                    )}
                    href={`/marca/${brand.slug}`}
                    key={brand.id || brand.slug}
                    onClick={onClose}
                    onFocus={() => setHoveredSlug(brand.slug)}
                    onMouseEnter={() => setHoveredSlug(brand.slug)}
                  >
                    <span className="truncate">{brand.name}</span>
                    {count > 0 && (
                      <span className="shrink-0 text-[10px] text-slate-400">
                        ({count})
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MegaMenuShell>
  );
}
