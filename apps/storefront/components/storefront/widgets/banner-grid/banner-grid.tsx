'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { BannerGridProps, BannerItem } from '@/lib/storefront/widget-types';

export function BannerGridWidget({
  widgetId,
  columns = 3,
  banners = [],
}: BannerGridProps) {
  const { isEditing, previewMode } = useElementor();
  const [currentPage, setCurrentPage] = useState(0);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);

  if (!banners || banners.length === 0) return null;

  const itemsPerPage = columns;
  const totalPages = Math.ceil(banners.length / itemsPerPage);

  const gridClass =
    columns === 2
      ? 'md:grid-cols-2'
      : 'md:grid-cols-3';

  // Divide os banners em páginas reais para a visualização desktop (md+)
  const pages: BannerItem[][] = [];
  for (let i = 0; i < banners.length; i += itemsPerPage) {
    pages.push(banners.slice(i, i + itemsPerPage));
  }

  const safeCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));
  const safeMobileIdx = Math.min(mobileActiveIdx, Math.max(0, banners.length - 1));

  const handleMobileScroll = () => {
    const el = mobileTrackRef.current;
    if (!el || banners.length <= 1) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth + 12; // gap-3 = 12px
    if (cardWidth <= 0) return;
    const idx = Math.round(el.scrollLeft / cardWidth);
    const clamped = Math.max(0, Math.min(banners.length - 1, idx));
    if (clamped !== mobileActiveIdx) {
      setMobileActiveIdx(clamped);
    }
  };

  const scrollToMobileSlide = (idx: number) => {
    setMobileActiveIdx(idx);
    const el = mobileTrackRef.current;
    if (!el) return;
    const targetChild = el.children[idx] as HTMLElement | undefined;
    if (targetChild && typeof targetChild.scrollIntoView === 'function') {
      targetChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  const renderBannerCard = (banner: BannerItem, globalIdx: number, extraClassName = '') => {
    const hasLink = Boolean(
      banner.linkUrl &&
        banner.linkUrl.trim() !== '' &&
        banner.linkUrl !== '#',
    );

    const imageElement = (
      <Image
        alt={banner.altText || banner.title || `Banner ${globalIdx + 1}`}
        className={`size-full object-cover transition duration-500 ${
          isEditing && !previewMode
            ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
            : hasLink
              ? 'group-hover/img:scale-[1.02]'
              : ''
        }`}
        height={450}
        src={banner.imageUrl}
        unoptimized
        width={800}
      />
    );

    return (
      <div
        className={`group/img relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 ${
          hasLink ? 'cursor-pointer' : 'cursor-default'
        } ${extraClassName}`}
        key={banner.id || globalIdx}
      >
        {hasLink ? (
          <Link
            className="block size-full"
            href={banner.linkUrl!}
            onClick={(e) => {
              if (isEditing && !previewMode) e.preventDefault();
            }}
          >
            {imageElement}
          </Link>
        ) : (
          <div className="block size-full select-none cursor-default">
            {imageElement}
          </div>
        )}

        {widgetId ? (
          <InlineImageEditorOverlay
            canAdd={false}
            canRemove={false}
            currentLinkUrl={banner.linkUrl}
            fieldPath={`banners.${globalIdx}.imageUrl`}
            linkFieldPath={`banners.${globalIdx}.linkUrl`}
            previewUrl={banner.imageUrl}
            slideIndex={globalIdx}
            title={banner.title || banner.altText || `Banner ${globalIdx + 1}`}
            widgetId={widgetId}
          />
        ) : null}
      </div>
    );
  };

  return (
    <section aria-label="Banners promocionais" className="cn-container py-3 sm:py-4">
      <div className="relative rounded-2xl border border-slate-200/80 bg-white px-4 pb-4 pt-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:px-5 sm:pb-5 sm:pt-5">
        {/* Mobile (< md): Carrossel horizontal estilo Netflix em linha única com prévia do próximo card (Anexo 4) */}
        <div
          className="no-scrollbar flex flex-nowrap items-stretch gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory touch-pan-x md:hidden"
          data-testid="banner-grid-mobile-track"
          onScroll={handleMobileScroll}
          ref={mobileTrackRef}
        >
          {banners.map((banner, idx) =>
            renderBannerCard(
              banner,
              idx,
              'w-[85%] sm:w-[72%] shrink-0 snap-start',
            ),
          )}
        </div>

        {/* Desktop (md+): Carrossel paginado de múltiplas colunas */}
        <div className="hidden overflow-hidden md:block">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${safeCurrentPage * 100}%)` }}
          >
            {pages.map((pageBanners, pIdx) => (
              <div
                className={`grid gap-3.5 sm:gap-4 ${gridClass} w-full shrink-0`}
                key={pIdx}
              >
                {pageBanners.map((banner, idx) => {
                  const globalIdx = pIdx * itemsPerPage + idx;
                  return renderBannerCard(banner, globalIdx, 'w-full');
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Setas circulares nas bordas para desktop (apenas quando há mais de 1 página real) */}
        {totalPages > 1 && (
          <>
            <button
              aria-label="Banner anterior"
              className="absolute -left-3.5 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 md:flex cursor-pointer"
              onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Próximo banner"
              className="absolute -right-3.5 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 md:flex cursor-pointer"
              onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Pílula de paginação mobile (máx 4 indicadores) */}
        {banners.length > 1 && (
          <div className="mt-3.5 flex justify-center md:hidden">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5">
              {Array.from({ length: Math.min(banners.length, 4) }).map((_, dot) => {
                const activeDot = Math.min(
                  3,
                  Math.floor((safeMobileIdx / Math.max(1, banners.length - 1)) * 3),
                );
                const isSelected = banners.length <= 4 ? safeMobileIdx === dot : activeDot === dot;
                return (
                  <button
                    aria-label={`Banner móvel ${dot + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      isSelected ? 'w-4 bg-[#E2091E]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    key={dot}
                    onClick={() => scrollToMobileSlide(dot)}
                    type="button"
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Pílula de paginação azul marinho no centro inferior para desktop */}
        {totalPages > 1 && (
          <div className="mt-3.5 hidden justify-center md:flex">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5">
              {Array.from({ length: totalPages }).map((_, dot) => (
                <button
                  aria-label={`Slide ${dot + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    safeCurrentPage === dot ? 'w-4 bg-[#E2091E]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  key={dot}
                  onClick={() => setCurrentPage(dot)}
                  type="button"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
