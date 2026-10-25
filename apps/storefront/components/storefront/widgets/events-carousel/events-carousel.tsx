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
  ctaUrl = '/loja',
  topThumbUrl = '/assets/home-ref/s12-event-top-thumb.jpg',
  items = [],
}: EventsCarouselProps) {
  const { isEditing, previewMode } = useElementor();
  const [activeIdx, setActiveIdx] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="w-full bg-[#060709] py-10 sm:py-14">
      <div className="cn-container">
        {/* Header escuro com mini-thumb à direita */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-base font-medium text-slate-300 sm:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-full border border-white/15 bg-white/5 p-1.5 pr-5 backdrop-blur-xs sm:self-auto">
            {topThumbUrl ? (
              <div className="relative h-10 w-20 overflow-hidden rounded-full border border-white/10">
                <Image
                  alt="Eventos Comercial do Norte"
                  className="size-full object-cover"
                  height={120}
                  src={topThumbUrl}
                  unoptimized
                  width={225}
                />
              </div>
            ) : null}
            <Link
              className="inline-flex items-center gap-2 text-xs font-bold text-white transition hover:text-blue-300 sm:text-sm"
              href={ctaUrl}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Grid de 4 Cartazes Verticais */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {items.map((item, idx) => (
              <div
                className="group/img relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition duration-300 hover:-translate-y-1"
                key={item.id || idx}
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
                    fieldPath={`items.${idx}.imageUrl`}
                    linkFieldPath={`items.${idx}.linkUrl`}
                    previewUrl={item.imageUrl}
                    slideIndex={idx}
                    title={`Evento: ${item.title}`}
                    widgetId={widgetId}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <button
            aria-label="Evento anterior"
            className="absolute -left-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#E2091E] shadow-xl transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p - 1 + 4) % 4)}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Próximo evento"
            className="absolute -right-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#E2091E] shadow-xl transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p + 1) % 4)}
            type="button"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Dots inferiores */}
        <div className="mt-7 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
            {[0, 1, 2, 3].map((dot) => (
              <button
                aria-label={`Evento ${dot + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeIdx === dot ? 'w-5 bg-[#E2091E]' : 'w-1.5 bg-white/40'
                }`}
                key={dot}
                onClick={() => setActiveIdx(dot)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
