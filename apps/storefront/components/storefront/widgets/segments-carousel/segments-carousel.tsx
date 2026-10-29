'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Beer,
  Bike,
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
    case 'delivery':
      return <Bike className="size-4 text-white" />;
    default:
      return <UtensilsCrossed className="size-4 text-white" />;
  }
}

const SEGMENT_SLUG_MAP: Record<string, string> = {
  lanchonete: 'lanchonete',
  burger: 'lanchonete',
  hamburguer: 'lanchonete',
  pizzaria: 'pizzaria',
  pizza: 'pizzaria',
  padaria: 'padaria',
  bakery: 'padaria',
  festa: 'loja-de-festas',
  festas: 'loja-de-festas',
  'loja-de-festas': 'loja-de-festas',
  buffet: 'restaurante-buffet',
  restaurante: 'restaurante-buffet',
  'restaurante-buffet': 'restaurante-buffet',
  confeitaria: 'confeitaria-bolos',
  'confeitaria-bolos': 'confeitaria-bolos',
  bolo: 'confeitaria-bolos',
  doces: 'confeitaria-bolos',
  acai: 'sorveteria-acai',
  açaí: 'sorveteria-acai',
  sorveteria: 'sorveteria-acai',
  'sorveteria-acai': 'sorveteria-acai',
  bar: 'bar-distribuidora',
  distribuidora: 'bar-distribuidora',
  'bar-distribuidora': 'bar-distribuidora',
  delivery: 'delivery',
};

export function resolveSegmentUrl(item: { id?: string; title?: string; linkUrl?: string }): string {
  if (item.linkUrl && item.linkUrl.startsWith('/segmento/')) {
    return item.linkUrl;
  }
  const cleanId = (item.id || '').replace(/^seg[-_]/, '').toLowerCase();
  if (cleanId && SEGMENT_SLUG_MAP[cleanId]) {
    return `/segmento/${SEGMENT_SLUG_MAP[cleanId]}`;
  }
  if (item.linkUrl) {
    const qMatch = item.linkUrl.match(/[?&](?:q|segmento)=([^&#]+)/);
    if (qMatch && qMatch[1]) {
      const qVal = decodeURIComponent(qMatch[1]).toLowerCase();
      if (SEGMENT_SLUG_MAP[qVal]) {
        return `/segmento/${SEGMENT_SLUG_MAP[qVal]}`;
      }
    }
  }
  const cleanTitle = (item.title || '').toLowerCase();
  for (const [key, slug] of Object.entries(SEGMENT_SLUG_MAP)) {
    if (cleanTitle.includes(key)) {
      return `/segmento/${slug}`;
    }
  }
  return item.linkUrl || '/segmentos';
}

export function SegmentsCarouselWidget({
  widgetId,
  title = 'Para todos os Negócios',
  subtitle = 'De todos os tamanhos',
  ctaLabel = 'Ver todos os segmentos',
  ctaUrl = '/segmentos',
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
    <section aria-label={title} className="cn-container pt-4 pb-2 sm:pt-6 sm:pb-3">
      <div className="relative bg-transparent">
        {/* Topo Azul Escuro: onde era azul permanece azul com gradiente oficial */}
        <div className="relative rounded-[24px] bg-gradient-to-r from-[#002868] via-[#003E99] to-[#002B66] px-6 pb-36 pt-7 shadow-md sm:px-10 sm:pt-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-lg font-medium text-white sm:text-xl">
                {subtitle}
              </p>
              <div className="mt-2.5 h-1 w-28 rounded-full bg-[#E2091E]" />
            </div>

            <Link
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/40 bg-[#002868]/70 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20 sm:self-auto"
              href={ctaUrl}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Carrossel de Cards sobrepondo o fundo azul com base transparente (sem fundo branco na parte de baixo) */}
        <div className="relative -mt-28 px-5 pb-2 sm:px-9">
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
                    const targetUrl = resolveSegmentUrl(item);
                    return (
                      <div
                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                        key={item.id || globalIdx}
                      >
                        {/* Foto Superior */}
                        <div className="group/img relative aspect-[1.05/1] w-full overflow-hidden bg-slate-100">
                          <Link
                            className="block size-full"
                            href={targetUrl}
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
                              currentLinkUrl={targetUrl}
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
                        <Link
                          className="flex flex-1 flex-col px-5 pb-5 pt-4 transition hover:bg-slate-50/60"
                          href={targetUrl}
                          onClick={(e) => {
                            if (isEditing && !previewMode) e.preventDefault();
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E2091E] shadow-md transition group-hover:scale-105">
                              <SegmentIcon type={item.iconType} />
                            </div>
                            <div>
                              <span className="block text-[11px] font-medium text-slate-400">
                                {item.prefix}
                              </span>
                              <h3 className="text-xl font-bold leading-tight tracking-tight text-[#002868] transition group-hover:text-[#004CB1]">
                                {item.title}
                              </h3>
                            </div>
                          </div>
                          <div className="my-3 h-[3px] w-12 rounded-full bg-[#E2091E]" />
                          <p className="text-xs leading-relaxed text-slate-600">{item.description}</p>
                        </Link>
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
                className="absolute left-1 sm:left-3 top-1/3 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 sm:flex"
                onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Próximo segmento"
                className="absolute right-1 sm:right-3 top-1/3 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 sm:flex"
                onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>

              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5 shadow-sm">
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}
