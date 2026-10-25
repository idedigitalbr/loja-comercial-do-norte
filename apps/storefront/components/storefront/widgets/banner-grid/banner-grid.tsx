'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { BannerGridProps } from '@/lib/storefront/widget-types';

export function BannerGridWidget({
  widgetId,
  columns = 3,
  banners = [],
}: BannerGridProps) {
  const { isEditing, previewMode } = useElementor();
  const [activeIdx, setActiveIdx] = useState(4);

  if (!banners || banners.length === 0) return null;

  const gridClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <section aria-label="Banners promocionais" className="cn-container py-3 sm:py-4">
      <div className="relative rounded-2xl border border-slate-200/80 bg-white px-4 pb-4 pt-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:px-5 sm:pb-5 sm:pt-5">
        <div className={`grid gap-3.5 sm:gap-4 ${gridClass}`}>
          {banners.map((banner, idx) => (
            <div
              className="group/img relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100"
              key={banner.id || idx}
            >
              {banner.linkUrl ? (
                <Link
                  className="block size-full"
                  href={banner.linkUrl}
                  onClick={(e) => {
                    if (isEditing && !previewMode) e.preventDefault();
                  }}
                >
                  <Image
                    alt={banner.altText || banner.title || `Banner ${idx + 1}`}
                    className={`size-full object-cover transition duration-500 ${
                      isEditing && !previewMode
                        ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                        : 'group-hover/img:scale-[1.02]'
                    }`}
                    height={450}
                    src={banner.imageUrl}
                    unoptimized
                    width={800}
                  />
                </Link>
              ) : (
                <Image
                  alt={banner.altText || banner.title || `Banner ${idx + 1}`}
                  className={`size-full object-cover transition duration-500 ${
                    isEditing && !previewMode
                      ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                      : ''
                  }`}
                  height={450}
                  src={banner.imageUrl}
                  unoptimized
                  width={800}
                />
              )}

              {widgetId ? (
                <InlineImageEditorOverlay
                  canAdd={false}
                  canRemove={false}
                  currentLinkUrl={banner.linkUrl}
                  fieldPath={`banners.${idx}.imageUrl`}
                  linkFieldPath={`banners.${idx}.linkUrl`}
                  previewUrl={banner.imageUrl}
                  slideIndex={idx}
                  title={banner.title || banner.altText || `Banner ${idx + 1}`}
                  widgetId={widgetId}
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* Setas circulares nas bordas (idêntico ao site-final.jpg) */}
        <button
          aria-label="Banner anterior"
          className="absolute -left-3.5 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
          onClick={() => setActiveIdx((p) => (p - 1 + 6) % 6)}
          type="button"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          aria-label="Próximo banner"
          className="absolute -right-3.5 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 sm:flex"
          onClick={() => setActiveIdx((p) => (p + 1) % 6)}
          type="button"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Pílula de paginação azul marinho no centro inferior */}
        <div className="mt-3.5 flex justify-center">
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
    </section>
  );
}
