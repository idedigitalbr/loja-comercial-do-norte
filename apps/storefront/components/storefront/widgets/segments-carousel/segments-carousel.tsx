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
  const [activeIdx, setActiveIdx] = useState(4);

  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
        {/* Topo Azul Escuro com Barra Vermelha abaixo do Subtítulo */}
        <div className="relative bg-gradient-to-r from-[#002868] via-[#003E99] to-[#002B66] px-6 pb-36 pt-7 sm:px-10 sm:pt-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-lg font-medium text-blue-100 sm:text-xl">
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

        {/* Grid de Cards sobrepondo o fundo azul */}
        <div className="relative -mt-28 px-5 pb-7 sm:px-9">
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

                {/* Conteúdo do Card (Ícone circular vermelho + Para sua + Título + Linha vermelha + Descrição) */}
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E2091E] shadow-md">
                      <SegmentIcon type={item.iconType} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-slate-400">
                        {item.prefix}
                      </span>
                      <h3 className="text-xl font-extrabold leading-tight tracking-tight text-[#002868]">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <div className="my-3 h-[3px] w-12 rounded-full bg-[#E2091E]" />
                  <p className="text-xs leading-relaxed text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Setas Laterais e Pílula Azul Marinho Inferior */}
          <button
            aria-label="Segmento anterior"
            className="absolute left-3 top-1/3 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p - 1 + 6) % 6)}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Próximo segmento"
            className="absolute right-3 top-1/3 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p + 1) % 6)}
            type="button"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5">
              {[0, 1, 2, 3, 4, 5].map((dot) => (
                <button
                  aria-label={`Slide ${dot + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIdx === dot ? 'w-4 bg-[#E2091E]' : 'w-1.5 bg-white/40 hover:bg-white/70'
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
