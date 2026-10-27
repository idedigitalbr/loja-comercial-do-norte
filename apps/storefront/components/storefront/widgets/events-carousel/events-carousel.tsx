'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { EventsCarouselProps } from '@/lib/storefront/widget-types';

export function EventsCarouselWidget({
  widgetId,
  title = 'Nossos Eventos',
  subtitle = 'Tudo que acontece no Comercial do Norte',
  items = [],
}: EventsCarouselProps) {
  const { isEditing, previewMode } = useElementor();
  const [currentPage, setCurrentPage] = useState(0);

  if (!items || items.length === 0) return null;

  const itemsPerPage = 4;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const pages = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage));
  }

  const safeCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  return (
    <section aria-label={title} className="w-full py-3 sm:py-5">
      <div className="w-full overflow-hidden rounded-[24px] sm:rounded-[36px] md:rounded-[44px] bg-[#060709] bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:36px_36px] py-10 sm:py-14 shadow-xl border-y border-white/10">
        <div className="cn-container">
          {/* Header escuro com barra vermelha à esquerda */}
          <div className="mb-8">
            <p className="text-lg font-medium text-slate-300 sm:text-xl">
              {title}
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {subtitle}
            </h2>
            <div className="mt-2.5 h-1 w-28 rounded-full bg-[#E2091E]" />
          </div>

          {/* Carrossel de 4 Cartazes Verticais por página */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${safeCurrentPage * 100}%)` }}
              >
                {pages.map((pageItems, pIdx) => (
                  <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 w-full shrink-0"
                    key={pIdx}
                  >
                    {pageItems.map((item, idx) => {
                      const globalIdx = pIdx * itemsPerPage + idx;
                      return (
                        <div
                          className="group/img relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition duration-300 hover:-translate-y-1"
                          key={item.id || globalIdx}
                        >
                          <Link
                            className="block size-full"
                            href={item.linkUrl || '/loja'}
                            onClick={(e) => {
                              if (isEditing && !previewMode) e.preventDefault();
                            }}
                          >
                            <Image
                              alt={item.title}
                              className={`size-full object-cover transition duration-500 ${
                                isEditing && !previewMode
                                  ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                                  : 'group-hover/img:scale-[1.02]'
                              }`}
                              height={1025}
                              src={item.imageUrl}
                              unoptimized
                              width={578}
                            />
                          </Link>

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
                    })}
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <>
                <button
                  aria-label="Evento anterior"
                  className="absolute -left-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#E2091E] shadow-xl transition hover:scale-105 active:scale-95 sm:flex"
                  onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
                  type="button"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  aria-label="Próximo evento"
                  className="absolute -right-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#E2091E] shadow-xl transition hover:scale-105 active:scale-95 sm:flex"
                  onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
                  type="button"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots inferiores em pílula azul marinho (#101F3C) com quantidade real */}
          {totalPages > 1 && (
            <div className="mt-7 flex justify-center">
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
