'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { DEFAULT_BRAND_SHOWCASE, buildEnrichedBrands } from '@/lib/brands-data';
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
  subtitle,
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

    const enriched = buildEnrichedBrands(contextData?.brands ?? []).filter(
      (b) => !b.parentId,
    );

    if (enriched.length > 0) {
      return enriched.map((b, idx) => {
        const showcase = DEFAULT_BRAND_SHOWCASE.find((s) => s.slug === b.slug);
        const palette = ['#004CB1', '#E2091E', '#00357B', '#15803D', '#0284C7', '#7C2D12'];
        return {
          id: b.id || `brand-${idx}`,
          name: b.name,
          slug: b.slug,
          imageUrl:
            b.imagePath ||
            showcase?.imagePath ||
            '/assets/PRODUTOS/marcas-imgs/copobras_logo.svg',
          linkUrl: `/marca/${b.slug}`,
          accentColor: showcase?.accentColor || palette[idx % palette.length],
        };
      });
    }

    return DEFAULT_BRAND_SHOWCASE.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      imageUrl: s.imagePath,
      linkUrl: `/marca/${s.slug}`,
      accentColor: s.accentColor,
    }));
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
      className="cn-container py-5 sm:py-7"
      data-testid="brands-carousel-section"
    >
      {/* CABEÇALHO CENTRALIZADO ESTILO ANEXO 1 */}
      <div className="mb-5 flex flex-col items-center justify-center text-center">
        {isEditing && !previewMode ? (
          <div className="group/title relative flex items-center justify-center gap-2">
            {editingTitle ? (
              <input
                autoFocus
                className="rounded-lg border-2 border-[#004CB1] bg-white px-3 py-1 text-center text-xl font-extrabold text-slate-800 outline-none sm:text-2xl"
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
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-200/60"
                onClick={() => setEditingTitle(true)}
                title="Clique para editar o título"
              >
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
                  {title}
                </h2>
                <Edit2 className="size-4 text-[#004CB1] opacity-0 transition-opacity group-hover/title:opacity-100" />
              </div>
            )}
          </div>
        ) : (
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
            {title}
          </h2>
        )}

        {subtitle ? (
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{subtitle}</p>
        ) : null}
      </div>

      {/* CONTAINER DOS CARDS DE MARCAS */}
      <div className="relative">
        {/* MOBILE (< md): Carrossel horizontal em linha única com scroll suave */}
        <div
          className="no-scrollbar -mx-4 flex flex-nowrap items-stretch gap-3.5 overflow-x-auto px-4 pb-2 touch-pan-x snap-x snap-mandatory md:hidden"
          data-testid="brands-carousel-mobile-track"
          onScroll={handleMobileScroll}
          ref={mobileTrackRef}
        >
          {brandItems.map((brand) => (
            <Link
              aria-label={`Ver produtos da marca ${brand.name}`}
              className="group relative flex aspect-square w-[132px] shrink-0 snap-start flex-col items-center justify-center overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,76,177,0.14)]"
              href={brand.linkUrl || `/marca/${brand.slug}`}
              key={`mob-${brand.id}`}
              onClick={(e) => {
                if (isEditing && !previewMode) e.preventDefault();
              }}
            >
              <div className="relative flex size-full items-center justify-center p-1">
                <Image
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  height={160}
                  src={brand.imageUrl}
                  unoptimized
                  width={160}
                />
              </div>
              {/* Faixa inferior característica do Anexo 1 */}
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-0 h-[5px] rounded-t-full transition-all duration-200 group-hover:h-[6px]"
                style={{ backgroundColor: brand.accentColor || '#004CB1' }}
              />
            </Link>
          ))}
        </div>

        {/* DESKTOP (md+): Grid de 6 colunas idêntico ao Anexo 1 */}
        <div className="hidden md:grid md:grid-cols-6 md:gap-4 lg:gap-5">
          {desktopVisibleItems.map((brand) => (
            <Link
              aria-label={`Ver produtos da marca ${brand.name}`}
              className="group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[#004CB1]/40 hover:shadow-[0_14px_32px_rgba(0,76,177,0.14)]"
              href={brand.linkUrl || `/marca/${brand.slug}`}
              key={`desk-${brand.id}`}
              onClick={(e) => {
                if (isEditing && !previewMode) e.preventDefault();
              }}
            >
              <div className="relative flex size-full items-center justify-center p-2">
                <Image
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  height={180}
                  src={brand.imageUrl}
                  unoptimized
                  width={180}
                />
              </div>

              {/* Faixa inferior característica do Anexo 1 */}
              <span
                aria-hidden="true"
                className="absolute inset-x-4 bottom-0 h-[6px] rounded-t-full transition-all duration-200 group-hover:h-[7px]"
                style={{ backgroundColor: brand.accentColor || '#004CB1' }}
              />
            </Link>
          ))}
        </div>

        {/* Setas laterais no Desktop quando houver mais de 1 página */}
        {totalDesktopPages > 1 && (
          <>
            <button
              aria-label="Marcas anteriores"
              className="absolute -left-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:border-[#004CB1] hover:text-[#004CB1] active:scale-95 md:flex"
              onClick={() =>
                setPage((prev) => (prev - 1 + totalDesktopPages) % totalDesktopPages)
              }
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Próximas marcas"
              className="absolute -right-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:border-[#004CB1] hover:text-[#004CB1] active:scale-95 md:flex"
              onClick={() => setPage((prev) => (prev + 1) % totalDesktopPages)}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* BOLINHAS INFERIORES DE PAGINAÇÃO (Anexo 1) + LINK VER TODAS */}
      <div className="mt-5 flex flex-col items-center justify-center gap-2">
        {/* Indicadores Desktop */}
        {totalDesktopPages > 1 && (
          <div
            aria-label="Paginação de marcas"
            className="hidden items-center justify-center gap-2.5 md:flex"
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
                      : 'size-2.5 bg-slate-400/70 hover:bg-slate-600'
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
            {Array.from({ length: Math.min(MAX_CAROUSEL_DOTS, brandItems.length) }).map(
              (_, idx) => {
                const isActive = idx === mobileDot;
                return (
                  <button
                    aria-label={`Slide de marcas ${idx + 1}`}
                    className={`cursor-pointer rounded-full transition-all ${
                      isActive ? 'size-2.5 bg-[#004CB1]' : 'size-2 bg-slate-400/70'
                    }`}
                    key={idx}
                    onClick={() => {
                      setMobileDot(idx);
                      const el = mobileTrackRef.current;
                      if (!el) return;
                      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
                      el.scrollTo({
                        left: (idx / Math.max(1, MAX_CAROUSEL_DOTS - 1)) * maxScroll,
                        behavior: 'smooth',
                      });
                    }}
                    type="button"
                  />
                );
              },
            )}
          </div>
        )}

        {viewAllLink ? (
          <Link
            className="mt-1 text-xs font-bold text-[#004CB1] transition hover:underline"
            href={viewAllLink}
          >
            Ver todas as marcas
          </Link>
        ) : null}
      </div>
    </section>
  );
}
