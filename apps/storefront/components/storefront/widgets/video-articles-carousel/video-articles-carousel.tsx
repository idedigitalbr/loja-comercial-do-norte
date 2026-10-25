'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { VideoArticlesCarouselProps } from '@/lib/storefront/widget-types';

export function VideoArticlesCarouselWidget({
  widgetId,
  title = 'Explica aí comercial',
  subtitle = 'Dicas em vídeos e artigos para você usar no seu negócio.',
  viewAllLabel = 'Ver todos',
  viewAllUrl = '/loja',
  items = [],
}: VideoArticlesCarouselProps) {
  const { isEditing, previewMode } = useElementor();
  const [activeIdx, setActiveIdx] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#A50010] via-[#88000D] to-[#5E0008] p-6 shadow-xl sm:p-9">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-base font-medium text-red-100 sm:text-lg">
              {title}
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {subtitle}
            </h2>
            <div className="mt-2.5 h-1 w-28 rounded-full bg-[#004CB1]" />
          </div>

          <Link
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-white/35 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 sm:self-auto"
            href={viewAllUrl}
          >
            <span>{viewAllLabel}</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Cards Horizontais (2 colunas iguais no desktop) */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {items.map((item, idx) => (
              <div
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg sm:flex-row"
                key={item.id || idx}
              >
                {/* Coluna Foto com Play Button */}
                <div className="group/img relative shrink-0 overflow-hidden bg-slate-900 sm:w-[44%]">
                  <Image
                    alt={item.title}
                    className={`h-full min-h-[260px] w-full object-cover transition duration-500 ${
                      isEditing && !previewMode
                        ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                        : 'group-hover/img:scale-105'
                    }`}
                    height={665}
                    src={item.imageUrl}
                    unoptimized
                    width={495}
                  />
                  {/* Botão Play Vermelho Central */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
                    <span className="flex size-13 items-center justify-center rounded-full bg-[#E2091E] text-white shadow-xl ring-4 ring-white/30">
                      <Play className="ml-0.5 size-6 fill-white" />
                    </span>
                  </div>

                  {widgetId ? (
                    <InlineImageEditorOverlay
                      canAdd={false}
                      canRemove={false}
                      currentLinkUrl={item.ctaUrl}
                      fieldPath={`items.${idx}.imageUrl`}
                      linkFieldPath={`items.${idx}.ctaUrl`}
                      previewUrl={item.imageUrl}
                      slideIndex={idx}
                      title={`Vídeo/Artigo: ${item.title}`}
                      widgetId={widgetId}
                    />
                  ) : null}
                </div>

                {/* Coluna Conteúdo */}
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div>
                    <div className="mb-2.5 flex flex-wrap gap-1.5">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ${
                            tIdx === 0 ? 'bg-[#E2091E]' : 'bg-[#004CB1]'
                          }`}
                          key={tIdx}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-extrabold leading-snug text-[#0B1E3F] sm:text-xl">
                      {item.title}
                    </h3>

                    <div className="mt-3 divide-y divide-slate-200/80 text-[11px] leading-relaxed text-slate-600">
                      {item.paragraphs.map((p, pIdx) => (
                        <p className="py-2 first:pt-0 last:pb-0" key={pIdx}>
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <Link
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E2091E]/50 bg-white px-4 py-1.5 text-xs font-bold text-[#E2091E] transition hover:bg-red-50"
                      href={item.ctaUrl || '/loja'}
                    >
                      <span>{item.ctaLabel || 'Ver Completo'}</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            aria-label="Anterior"
            className="absolute -left-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p - 1 + 3) % 3)}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Próximo"
            className="absolute -right-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p + 1) % 3)}
            type="button"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Dots inferiores em pílula azul marinho (#101F3C) */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3.5 py-1.5 shadow-sm">
            {[0, 1, 2].map((dot) => (
              <button
                aria-label={`Página ${dot + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeIdx === dot ? 'w-5 bg-[#E2091E]' : 'w-1.5 bg-white/60'
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
