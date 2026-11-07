'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Edit2, Tag } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { DEFAULT_BRAND_SHOWCASE } from '@/lib/brands-data';
import type {
  BrandCarouselItem,
  BrandsCarouselProps,
  WidgetContextData,
} from '@/lib/storefront/widget-types';

const ITEMS_PER_DESKTOP_PAGE = 6;
const MAX_CAROUSEL_DOTS = 4;

export function BrandsCarouselWidget({
  widgetId,
  title = 'Compre por Marca',
  subtitle = 'As principais marcas em embalagens, descartáveis e muito mais.',
  viewAllLink = '/marcas',
  items,
  contextData,
}: BrandsCarouselProps & { contextData?: WidgetContextData }) {
  const { isEditing, previewMode, updateWidgetProps } = useElementor();
  const [editingTitle, setEditingTitle] = useState(false);
  const [page, setPage] = useState(0);
  const [mobileDot, setMobileDot] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);

  const brandItems = useMemo<BrandCarouselItem[]>(() => {
    if (items && items.length > 0) return items;

    const apiBrandMap = new Map((contextData?.brands ?? []).map((b) => [b.slug, b]));

    return DEFAULT_BRAND_SHOWCASE.map((s) => {
      const match = apiBrandMap.get(s.slug);
      return {
        id: match?.id || s.id,
        name: s.name,
        slug: s.slug,
        imageUrl: match?.imagePath || s.imagePath,
        linkUrl: `/marca/${s.slug}`,
        accentColor: s.accentColor,
      };
    });
  }, [items, contextData?.brands]);

  const totalDesktopPages = Math.min(
    MAX_CAROUSEL_DOTS,
    Math.max(1, Math.ceil(brandItems.length / ITEMS_PER_DESKTOP_PAGE)),
  );
  const safePage = Math.min(page, totalDesktopPages - 1);

  const desktopVisibleItems = useMemo(() => {
    const start = safePage * ITEMS_PER_DESKTOP_PAGE;
    const slice = brandItems.slice(start, start + ITEMS_PER_DESKTOP_PAGE);
    if (slice.length < ITEMS_PER_DESKTOP_PAGE && brandItems.length >= ITEMS_PER_DESKTOP_PAGE) {
      return [
        ...slice,
        ...brandItems.slice(0, ITEMS_PER_DESKTOP_PAGE - slice.length),
      ];
    }
    return slice;
  }, [brandItems, safePage]);

  const handleMobileScroll = () => {
    const el = mobileTrackRef.current;
    if (!el || brandItems.length <= 1) return;
    const maxScroll = Math.max(1, el.scrollWidth - el.clientWidth);
    const ratio = Math.min(1, Math.max(0, el.scrollLeft / maxScroll));
    const nextDot = Math.min(
      MAX_CAROUSEL_DOTS - 1,
      Math.round(ratio * (MAX_CAROUSEL_DOTS - 1)),
    );
    if (nextDot !== mobileDot) {
      setMobileDot(nextDot);
    }
  };

  return (
    <section
      aria-label={title || 'Compre por Marca'}
      className="cn-container py-3 sm:py-5"
      data-testid="brands-carousel-section"
    >
      <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 lg:p-8 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        {/* CABEÇALHO OFICIAL ESTILO MOCKUP: ÍCONE TAG VERMELHO + TÍTULO/SUBTÍTULO + BOTÃO PILL AZUL */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Ícone Tag Vermelha rotacionada estilo preço */}
            <div className="flex shrink-0 items-center justify-center">
              <Tag className="size-6 sm:size-7 lg:size-8 -rotate-45 text-[#E2091E] stroke-[2]" />
            </div>

            {/* Divisor vertical sutil */}
            <div className="h-7 sm:h-8 lg:h-9 w-px bg-slate-200 shrink-0 mx-1 sm:mx-1.5" />

            {/* Bloco de Título e Subtítulo */}
            <div className="min-w-0">
              {isEditing && !previewMode ? (
                <div className="group/title relative flex items-center gap-2">
                  {editingTitle ? (
                    <input
                      autoFocus
                      className="rounded-lg border-2 border-[#004CB1] bg-white px-3 py-1 text-lg sm:text-2xl font-extrabold text-[#001A49] outline-none"
                      onBlur={() => setEditingTitle(false)}
                      onChange={(e) => {
                        if (widgetId) updateWidgetProps(widgetId, { title: e.target.value });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingTitle(false);
                      }}
                      value={title}
                    />
                  ) : (
                    <div
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-0.5 transition hover:bg-slate-100"
                      onClick={() => setEditingTitle(true)}
                      title="Clique para editar o título"
                    >
                      <h2 className="text-lg sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-[#001A49]">
                        {title}
                      </h2>
                      <Edit2 className="size-4 text-[#004CB1] opacity-0 transition-opacity group-hover/title:opacity-100" />
                    </div>
                  )}
                </div>
              ) : (
                <h2 className="text-lg sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-[#001A49]">
                  {title}
                </h2>
              )}

              {subtitle ? (
                <p className="mt-0.5 text-xs sm:text-sm font-normal text-slate-500">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {/* Botão Pill Azul: "Ver todas as marcas →" */}
          {viewAllLink ? (
            <Link
              className="inline-flex shrink-0 items-center gap-2 self-start sm:self-auto rounded-full bg-[#004CB1] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#003B99] hover:shadow-md active:scale-95"
              href={viewAllLink}
            >
              <span>Ver todas as marcas</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>

        {/* CONTAINER DOS CARDS CIRCULARES DE MARCAS */}
        <div className="relative">
          {/* MOBILE (< md): Carrossel horizontal com cards circulares */}
          <div
            className="no-scrollbar -mx-4 flex flex-nowrap items-center gap-3 overflow-x-auto px-4 pb-2 touch-pan-x snap-x snap-mandatory md:hidden"
            data-testid="brands-carousel-mobile-track"
            onScroll={handleMobileScroll}
            ref={mobileTrackRef}
          >
            {brandItems.map((brand) => (
              <Link
                aria-label={`Ver produtos da marca ${brand.name}`}
                className="group relative flex aspect-square w-[116px] sm:w-[132px] shrink-0 snap-start items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-all duration-200 active:scale-95"
                href={brand.linkUrl || `/marca/${brand.slug}`}
                key={`mob-${brand.id}`}
                onClick={(e) => {
                  if (isEditing && !previewMode) e.preventDefault();
                }}
              >
                <div className="relative flex size-full items-center justify-center">
                  <Image
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                    height={130}
                    src={brand.imageUrl}
                    unoptimized
                    width={130}
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* DESKTOP (md+): Grid de 6 cards 100% CIRCULARES idênticos ao print mockup */}
          <div className="hidden md:grid md:grid-cols-6 md:gap-4 lg:gap-5">
            {desktopVisibleItems.map((brand) => (
              <Link
                aria-label={`Ver produtos da marca ${brand.name}`}
                className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white p-5 sm:p-6 lg:p-7 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#004CB1]/30 hover:shadow-[0_12px_30px_rgba(0,76,177,0.14)]"
                href={brand.linkUrl || `/marca/${brand.slug}`}
                key={`desk-${brand.id}`}
                onClick={(e) => {
                  if (isEditing && !previewMode) e.preventDefault();
                }}
              >
                <div className="relative flex size-full items-center justify-center">
                  <Image
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-108"
                    height={160}
                    src={brand.imageUrl}
                    unoptimized
                    width={160}
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Setas de navegação circulares laterais no Desktop */}
          {totalDesktopPages > 1 && (
            <>
              <button
                aria-label="Marcas anteriores"
                className="absolute -left-3 lg:-left-5 top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-md transition hover:border-[#004CB1] hover:bg-slate-50 hover:text-[#004CB1] active:scale-95 md:flex"
                onClick={() =>
                  setPage((prev) => (prev - 1 + totalDesktopPages) % totalDesktopPages)
                }
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Próximas marcas"
                className="absolute -right-3 lg:-right-5 top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-md transition hover:border-[#004CB1] hover:bg-slate-50 hover:text-[#004CB1] active:scale-95 md:flex"
                onClick={() => setPage((prev) => (prev + 1) % totalDesktopPages)}
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {/* BOLINHAS INFERIORES DE PAGINAÇÃO (3 BOLINHAS DISCRETAS ESTILO MOCKUP) */}
        <div className="mt-6 sm:mt-7 flex items-center justify-center gap-2">
          {/* Indicadores Desktop */}
          {totalDesktopPages > 1 && (
            <div
              aria-label="Paginação de marcas"
              className="hidden items-center justify-center gap-2 md:flex"
            >
              {Array.from({ length: totalDesktopPages }).map((_, idx) => {
                const isActive = idx === safePage;
                return (
                  <button
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`Página de marcas ${idx + 1}`}
                    className={`cursor-pointer rounded-full transition-all duration-200 ${
                      isActive
                        ? 'size-3 bg-[#004CB1] ring-2 ring-[#004CB1]/25'
                        : 'size-2.5 bg-[#CBD5E1] hover:bg-slate-400'
                    }`}
                    key={idx}
                    onClick={() => setPage(idx)}
                    type="button"
                  />
                );
              })}
            </div>
          )}

          {/* Indicadores Mobile */}
          {brandItems.length > 2 && (
            <div className="flex items-center justify-center gap-2 md:hidden">
              {Array.from({
                length: Math.min(MAX_CAROUSEL_DOTS, Math.ceil(brandItems.length / 2)),
              }).map((_, idx) => {
                const isActive = idx === mobileDot;
                return (
                  <button
                    aria-label={`Slide de marcas ${idx + 1}`}
                    className={`cursor-pointer rounded-full transition-all ${
                      isActive ? 'size-2.5 bg-[#004CB1]' : 'size-2 bg-[#CBD5E1]'
                    }`}
                    key={idx}
                    onClick={() => {
                      setMobileDot(idx);
                      const el = mobileTrackRef.current;
                      if (!el) return;
                      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
                      el.scrollTo({
                        left:
                          (idx /
                            Math.max(
                              1,
                              Math.min(
                                MAX_CAROUSEL_DOTS,
                                Math.ceil(brandItems.length / 2),
                              ) - 1,
                            )) *
                          maxScroll,
                        behavior: 'smooth',
                      });
                    }}
                    type="button"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
