'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { EventsCarouselProps } from '@/lib/storefront/widget-types';

export function EventsCarouselWidget({
  widgetId,
  title = 'Nossos Eventos',
  subtitle = 'Tudo que acontece no Comercial do Norte',
  ctaLabel = 'Ver todos os eventos',
  ctaUrl = '/eventos',
  items = [],
}: EventsCarouselProps) {
  const { isEditing, previewMode } = useElementor();
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const resolvedCtaLabel = ctaLabel?.trim() ? ctaLabel : 'Ver todos os eventos';
  const resolvedCtaUrl = ctaUrl && ctaUrl.trim() !== '' ? ctaUrl : '/eventos';

  const itemsPerPage = 4;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const pages = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage));
  }

  const safeCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || totalPages <= 1) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      setCurrentPage((p) => (p + 1) % totalPages);
    } else if (diff < -45) {
      setCurrentPage((p) => (p - 1 + totalPages) % totalPages);
    }
    setTouchStartX(null);
  };

  const renderCard = (item: (typeof items)[number], globalIdx: number) => {
    const hasLink = Boolean(
      item.linkUrl &&
        item.linkUrl.trim() !== '' &&
        item.linkUrl !== '#',
    );

    const imageElement = (
      <Image
        alt={item.title}
        className={`size-full object-cover transition duration-500 ${
          isEditing && !previewMode
            ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
            : hasLink
              ? 'group-hover/img:scale-[1.02]'
              : ''
        }`}
        height={1025}
        src={item.imageUrl}
        unoptimized
        width={578}
      />
    );

    return (
      <div
        className={`group/img relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition duration-300 ${
          hasLink ? 'hover:-translate-y-1 cursor-pointer' : 'cursor-default'
        }`}
      >
        {hasLink ? (
          <Link
            className="block size-full"
            href={item.linkUrl!}
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
            currentLinkUrl={item.linkUrl}
            fieldPath={`items.${globalIdx}.imageUrl`}
            linkFieldPath={`items.${globalIdx}.linkUrl`}
            previewUrl={item.imageUrl}
            slideIndex={globalIdx}
            title={`Evento: ${item.title}`}
            widgetId={widgetId}
          />
        ) : null}
      </div>
    );
  };

  return (
    <section aria-label={title} className="w-full py-3 sm:py-5">
      <div className="w-full overflow-hidden rounded-[24px] sm:rounded-[36px] md:rounded-[44px] bg-[#060709] bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:36px_36px] py-10 sm:py-14 shadow-xl border-y border-white/10">
        <div className="cn-container">
          {/* Header escuro: centralizado no mobile conforme solicitado, e alinhado no desktop */}
          <div className="mb-8 flex flex-col items-center text-center justify-between gap-4 sm:flex-row sm:items-end sm:text-left">
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-lg font-medium text-slate-300 sm:text-xl">
                {title}
              </p>
              <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {subtitle}
              </h2>
              <div className="mt-2.5 h-1 w-28 rounded-full bg-[#E2091E]" />
            </div>

            <Link
              className="inline-flex items-center gap-2 self-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-xs transition hover:border-white/40 hover:bg-white/20 active:scale-95 sm:self-auto"
              href={resolvedCtaUrl}
              onClick={(e) => {
                if (isEditing && !previewMode) e.preventDefault();
              }}
            >
              <span>{resolvedCtaLabel}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile view (< lg): 1 linha horizontal contínua com 2 cards e um pedacinho do terceiro */}
          <div className="lg:hidden">
            <div className="no-scrollbar flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:px-0 py-2 -mx-4 sm:mx-0 focus:outline-none">
              {items.map((item, idx) => (
                <div
                  className="w-[42%] xs:w-[41%] sm:w-[32%] shrink-0 snap-start"
                  key={item.id || idx}
                >
                  {renderCard(item, idx)}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop view (lg+): Carrossel de 4 Cartazes Verticais por página com paginação e setas */}
          <div
            className="relative hidden lg:block"
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${safeCurrentPage * 100}%)` }}
              >
                {pages.map((pageItems, pIdx) => (
                  <div
                    className="grid grid-cols-4 gap-5 w-full shrink-0"
                    key={pIdx}
                  >
                    {pageItems.map((item, idx) => {
                      const globalIdx = pIdx * itemsPerPage + idx;
                      return (
                        <div key={item.id || globalIdx}>
                          {renderCard(item, globalIdx)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <>
                <button
                  aria-label="Evento anterior"
                  className="absolute -left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#E2091E] shadow-xl transition hover:scale-105 active:scale-95"
                  onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
                  type="button"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  aria-label="Próximo evento"
                  className="absolute -right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#E2091E] shadow-xl transition hover:scale-105 active:scale-95"
                  onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
                  type="button"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots inferiores no Desktop */}
          {totalPages > 1 && (
            <div className="mt-7 hidden lg:flex justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3.5 py-1.5 shadow-sm">
                {Array.from({ length: totalPages }).map((_, dot) => (
                  <button
                    aria-label={`Página de eventos ${dot + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      safeCurrentPage === dot ? 'w-5 bg-[#E2091E]' : 'w-1.5 bg-white/60 hover:bg-white'
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
      </div>
    </section>
  );
}
