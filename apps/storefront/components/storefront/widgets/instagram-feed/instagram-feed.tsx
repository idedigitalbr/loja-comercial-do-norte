'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { InstagramFeedProps } from '@/lib/storefront/widget-types';

export function InstagramFeedWidget({
  widgetId,
  title = 'A Loja no Instagram',
  subtitle = 'Acompanhe bastidores, lançamentos e ações especiais nas nossas lojas físicas',
  handleLabel = '@comercialdonorte',
  handleUrl = 'https://www.instagram.com/comercialdonorte',
  items = [],
}: InstagramFeedProps) {
  const { isEditing, previewMode } = useElementor();
  const [activeIdx, setActiveIdx] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-base font-medium text-slate-600 sm:text-lg">
              {title}
            </p>
            <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-[#0B1E3F] sm:text-2xl">
              {subtitle}
            </h2>
            <div className="mt-2 h-1 w-24 rounded-full bg-[#E2091E]" />
          </div>

          <Link
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-[#004CB1] transition hover:border-[#004CB1] sm:self-auto"
            href={handleUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>{handleLabel}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Grid 6 Cards Verticais + Setas */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3.5">
            {items.map((item, idx) => (
              <div
                className="group/img relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-slate-900 shadow-xs"
                key={item.id || idx}
              >
                <Link
                  className="block size-full"
                  href={item.linkUrl || handleUrl}
                  onClick={(e) => {
                    if (isEditing && !previewMode) e.preventDefault();
                  }}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Image
                    alt={item.label}
                    className={`size-full object-cover transition duration-500 ${
                      isEditing && !previewMode
                        ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                        : 'group-hover/img:scale-105'
                    }`}
                    height={685}
                    src={item.imageUrl}
                    unoptimized
                    width={384}
                  />
                  {/* Gradiente inferior + Selo Instagram */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3 pt-8 text-white">
                    <Instagram className="size-3.5 shrink-0 text-white" />
                    <span className="truncate text-[11px] font-bold tracking-tight">
                      {item.label}
                    </span>
                  </div>
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
                    title={`Instagram: ${item.label}`}
                    widgetId={widgetId}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <button
            aria-label="Instagram anterior"
            className="absolute -left-3.5 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-md transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p - 1 + 4) % 4)}
            type="button"
          >
            <ChevronLeft className="size-4.5" />
          </button>
          <button
            aria-label="Próximo Instagram"
            className="absolute -right-3.5 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-md transition hover:scale-105 sm:flex"
            onClick={() => setActiveIdx((p) => (p + 1) % 4)}
            type="button"
          >
            <ChevronRight className="size-4.5" />
          </button>
        </div>

        {/* Dots inferiores em pílula azul marinho (#101F3C) */}
        <div className="mt-5 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5 shadow-xs">
            {[0, 1, 2, 3].map((dot) => (
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
