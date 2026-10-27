'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Beer,
  Cake,
  ChevronLeft,
  ChevronRight,
  Croissant,
  IceCream,
  PartyPopper,
  Pizza,
  Soup,
  UtensilsCrossed,
} from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { SegmentCardItem, SegmentsCarouselProps } from '@/lib/storefront/widget-types';

function SegmentIcon({ type }: { type: SegmentCardItem['iconType'] }) {
  switch (type) {
    case 'burger':
      return <UtensilsCrossed className="size-4 text-white" />;
    case 'pizza':
      return <Pizza className="size-4 text-white" />;
    case 'bakery':
      return <Croissant className="size-4 text-white" />;
    case 'party':
      return <PartyPopper className="size-4 text-white" />;
    case 'buffet':
      return <Soup className="size-4 text-white" />;
    case 'confectionery':
      return <Cake className="size-4 text-white" />;
    case 'icecream':
      return <IceCream className="size-4 text-white" />;
    case 'bar':
      return <Beer className="size-4 text-white" />;
    default:
      return <UtensilsCrossed className="size-4 text-white" />;
  }
}

export function SegmentsCarouselWidget({
  widgetId,
  title = 'Tudo para todos os negócios',
  subtitle = 'Para todos os tamanhos!',
  ctaLabel = 'Ver todos os segmentos',
  ctaUrl = '/loja',
  items = [],
}: SegmentsCarouselProps) {
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
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-[24px] border border-blue-900/40 bg-gradient-to-r from-[#002868] via-[#003E99] to-[#002B66] shadow-[0_8px_32px_rgba(0,40,104,0.18)]">
        {/* Topo Azul Escuro com Barra Vermelha abaixo do Subtítulo */}
        <div className="px-6 pt-7 sm:px-10 sm:pt-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-lg font-medium text-blue-100 sm:text-xl">
                {subtitle}
              </p>
              <div className="mt-2.5 h-1 w-28 rounded-full bg-[#E2091E]" />
            </div>

            <Link
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20 sm:self-auto"
              href={ctaUrl}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Carrossel de Cards sobre o fundo azul unificado (cards brancos em alto destaque) */}
        <div className="relative px-5 pb-7 pt-6 sm:px-9 sm:pb-9">
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${safeCurrentPage * 100}%)` }}
              >
                {pages.map((pageItems, pIdx) => (
                  <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full shrink-0"
                    key={pIdx}
                  >
                    {pageItems.map((item, idx) => {
                      const globalIdx = pIdx * itemsPerPage + idx;
                      return (
                        <div
                          className="group flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
                          key={item.id || globalIdx}
                        >
                          {/* Foto Superior */}
                          <div className="group/img relative aspect-[1.05/1] w-full overflow-hidden bg-slate-100">
                            <Link
                              className="block size-full"
                              href={item.linkUrl || '/loja'}
                              onClick={(e) => {
                                if (isEditing && !previewMode) e.preventDefault();
                              }}
                            >
                              <Image
                                alt={`${item.prefix} ${item.title}`}
                                className={`size-full object-cover transition duration-500 ${
                                  isEditing && !previewMode
                                    ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                                    : 'group-hover:scale-105'
                                }`}
                                height={535}
                                src={item.imageUrl}
                                unoptimized
                                width={530}
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
                                title={`Segmento: ${item.title}`}
                                widgetId={widgetId}
                              />
                            ) : null}
                          </div>

                          {/* Conteúdo do Card */}
                          <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E2091E] shadow-md">
                                <SegmentIcon type={item.iconType} />
                              </div>
                              <div>
                                <span className="block text-[11px] font-medium text-slate-400">
                                  {item.prefix}
                                </span>
                                <h3 className="text-xl font-bold leading-tight tracking-tight text-[#002868]">
                                  {item.title}
                                </h3>
                              </div>
                            </div>
                            <div className="my-3 h-[3px] w-12 rounded-full bg-[#E2091E]" />
                            <p className="text-xs leading-relaxed text-slate-600">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Setas Laterais */}
            {totalPages > 1 && (
              <>
                <button
                  aria-label="Segmento anterior"
                  className="absolute -left-3 sm:-left-4 top-[40%] z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 sm:flex"
                  onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
                  type="button"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  aria-label="Próximo segmento"
                  className="absolute -right-3 sm:-right-4 top-[40%] z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 sm:flex"
                  onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
                  type="button"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {/* Pílula de Paginação Inferior */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5 border border-white/10 shadow-sm">
                {Array.from({ length: totalPages }).map((_, dot) => (
                  <button
                    aria-label={`Página ${dot + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      safeCurrentPage === dot ? 'w-5 bg-[#E2091E]' : 'w-1.5 bg-white/40 hover:bg-white/70'
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
