'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Instagram } from 'lucide-react';
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

  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-6">
        {/* Header */}
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h2>
            <span className="text-xs text-slate-500 sm:text-sm">{subtitle}</span>
          </div>

          <Link
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#004CB1] transition hover:underline sm:text-sm"
            href={handleUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>{handleLabel}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Grid 6 Cards Verticais */}
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
      </div>
    </section>
  );
}
