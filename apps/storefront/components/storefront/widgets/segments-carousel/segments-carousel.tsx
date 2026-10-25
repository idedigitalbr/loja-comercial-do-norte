'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Croissant, PartyPopper, Pizza, UtensilsCrossed } from 'lucide-react';
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
  const [activeIdx, setActiveIdx] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
        {/* Topo Azul Escuro com Curva Diagonal */}
        <div className="relative bg-gradient-to-r from-[#002B66] via-[#003B8E] to-[#004CB1] px-6 pb-36 pt-7 sm:px-10 sm:pt-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-0.5 text-lg font-medium text-blue-100 sm:text-xl">
                {subtitle}
              </p>
            </div>

            <Link
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20 sm:self-auto"
              href={ctaUrl}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Grid de Cards sobrepondo o fundo azul */}
        <div className="relative -mt-28 px-5 pb-8 sm:px-9">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => (
              <div
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                key={item.id || idx}
              >
                {/* Foto Superior Configurável */}
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
                      fieldPath={`items.${idx}.imageUrl`}
                      linkFieldPath={`items.${idx}.linkUrl`}
                      previewUrl={item.imageUrl}
                      slideIndex={idx}
                      title={`Segmento: ${item.title}`}
                      widgetId={widgetId}
                    />
                  ) : null}
                </div>

                {/* Conteúdo do Card */}
                <div className="relative flex flex-1 flex-col px-5 pb-5 pt-6">
                  {/* Ícone Circular Vermelho Sobreposto */}
                  <div className="absolute -top-5 left-5 flex size-10 items-center justify-center rounded-full border-2 border-white bg-[#E2091E] shadow-md">
                    <SegmentIcon type={item.iconType} />
                  </div>

                  <span className="text-xs font-medium text-slate-500">{item.prefix}</span>
                  <h3 className="text-xl font-extrabold tracking-tight text-[#00357B]">
                    {item.title}
                  </h3>
                  <div className="my-2.5 h-[3px] w-7 rounded-full bg-[#E2091E]" />
                  <p className="text-xs leading-relaxed text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Setas Laterais e Dots Inferiores */}
          <button
            aria-label="Segmento anterior"
            className="absolute left-2 top-1/3 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p - 1 + 4) % 4)}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Próximo segmento"
            className="absolute right-2 top-1/3 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p + 1) % 4)}
            type="button"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              {[0, 1, 2, 3].map((dot) => (
                <button
                  aria-label={`Slide ${dot + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIdx === dot ? 'w-5 bg-[#E2091E]' : 'w-1.5 bg-slate-300'
                  }`}
                  key={dot}
                  onClick={() => setActiveIdx(dot)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
