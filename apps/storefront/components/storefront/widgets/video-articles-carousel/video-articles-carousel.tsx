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
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-red-100 sm:text-base">{subtitle}</p>
          </div>

          <Link
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 sm:self-auto"
            href={viewAllUrl}
          >
            <span>{viewAllLabel}</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Cards Horizontais */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {items.map((item, idx) => (
              <div
                className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg sm:flex-row ${
                  idx === 0 ? 'lg:col-span-8' : 'lg:col-span-4'
                }`}
                key={item.id || idx}
              >
                {/* Coluna Foto com Play Button */}
                <div
                  className={`group/img relative shrink-0 overflow-hidden bg-slate-900 ${
                    idx === 0 ? 'sm:w-[44%]' : 'sm:w-[48%]'
                  }`}
                >
                  <Image
                    alt={item.title}
                    className={`h-full min-h-[240px] w-full object-cover transition duration-500 ${
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
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            tIdx === 0
                              ? 'bg-red-50 text-[#E2091E] border border-red-200'
                              : 'bg-blue-50 text-[#004CB1] border border-blue-200'
                          }`}
                          key={tIdx}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-extrabold leading-snug text-slate-900 sm:text-xl">
                      {item.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
                      {item.paragraphs.map((p, pIdx) => (
                        <p className={idx > 0 && pIdx > 0 ? 'hidden xl:block' : ''} key={pIdx}>
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-2">
                    <Link
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-[#004CB1] hover:text-[#004CB1]"
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

        {/* Dots inferiores */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5">
            {[0, 1, 2].map((dot) => (
              <button
                aria-label={`Página ${dot + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeIdx === dot ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
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
