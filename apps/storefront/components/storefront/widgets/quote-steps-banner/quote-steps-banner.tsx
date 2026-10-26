'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { QuoteStepsBannerProps } from '@/lib/storefront/widget-types';

export function QuoteStepsBannerWidget({
  widgetId,
  title = 'Como funciona a cotação online',
  imageUrl = '/assets/banners/s07-banner-como-funciona-cotacao.png',
  ctaUrl = '/cotacao',
  altText = 'Como funciona a cotação online no Comercial do Norte',
}: QuoteStepsBannerProps) {
  const { isEditing, previewMode } = useElementor();

  const effectiveImageUrl = imageUrl || '/assets/banners/s07-banner-como-funciona-cotacao.png';
  const effectiveAltText = altText || title || 'Como funciona a cotação online';

  const imageElement = (
    <Image
      alt={effectiveAltText}
      className={`size-full object-cover transition duration-300 ${
        isEditing && !previewMode ? 'group-hover/img:brightness-50 group-hover/img:grayscale' : 'hover:opacity-95'
      }`}
      height={315}
      priority={false}
      src={effectiveImageUrl}
      unoptimized
      width={1200}
    />
  );

  return (
    <section aria-label={title || 'Como funciona a cotação online'} className="cn-container py-3 sm:py-5">
      <div className="group/img relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#002868] via-[#003E99] to-[#990012] shadow-[0_8px_28px_rgba(0,40,104,0.18)]">
        {ctaUrl ? (
          <Link
            className="block size-full"
            href={ctaUrl}
            onClick={(e) => {
              if (isEditing && !previewMode) e.preventDefault();
            }}
          >
            {imageElement}
          </Link>
        ) : (
          imageElement
        )}

        {widgetId ? (
          <InlineImageEditorOverlay
            canAdd={false}
            canRemove={false}
            currentImageUrl={effectiveImageUrl}
            currentLinkUrl={ctaUrl}
            fieldPath="imageUrl"
            linkFieldPath="ctaUrl"
            previewUrl={effectiveImageUrl}
            slideIndex={0}
            title={title || 'Banner Como Funciona Cotação'}
            widgetId={widgetId}
          />
        ) : null}
      </div>
    </section>
  );
}
