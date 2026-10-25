'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { BannerGridProps } from '@/lib/storefront/widget-types';

export function BannerGridWidget({
  widgetId,
  columns = 3,
  banners = [],
}: BannerGridProps) {
  const { isEditing, previewMode } = useElementor();

  if (!banners || banners.length === 0) return null;

  const gridClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <section aria-label="Banners promocionais" className="cn-container py-3 sm:py-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-4">
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
      </div>
    </section>
  );
}
