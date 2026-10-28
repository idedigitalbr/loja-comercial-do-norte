'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';

export interface VideoArticleCardProps {
  id?: string;
  title: string;
  imageUrl: string;
  tags?: string[];
  paragraphs?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  widgetId?: string;
  index?: number;
  className?: string;
}

export function VideoArticleCard({
  title,
  imageUrl,
  tags = [],
  paragraphs = [],
  ctaLabel = 'Ver Completo',
  ctaUrl = '/loja',
  widgetId,
  index,
  className = '',
}: VideoArticleCardProps) {
  return (
    <article
      className={`group relative flex flex-row items-stretch rounded-[18px] lg:rounded-[20px] bg-white p-2 shadow-sm transition-all hover:shadow-md h-[180px] lg:h-[184px] xl:h-[190px] ${className}`}
    >
      {/* Coluna 1: Foto com Botão Play */}
      <div className="relative w-[46%] shrink-0 overflow-hidden rounded-[13px] lg:rounded-[14px] bg-slate-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
        <Link
          href={ctaUrl}
          aria-label={`Ver vídeo: ${title}`}
          className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors"
        >
          <span className="flex size-8.5 sm:size-9 items-center justify-center rounded-full bg-[#e2091e] text-white shadow-md transition-transform duration-200 group-hover:scale-110">
            <Play aria-hidden="true" className="size-3.5 sm:size-4 fill-white ml-0.5" />
          </span>
        </Link>
        {widgetId && typeof index === 'number' ? (
          <InlineImageEditorOverlay
            canAdd={false}
            canRemove={false}
            currentLinkUrl={ctaUrl}
            fieldPath={`items.${index}.imageUrl`}
            linkFieldPath={`items.${index}.ctaUrl`}
            previewUrl={imageUrl}
            slideIndex={index}
            title={`Vídeo/Artigo: ${title}`}
            widgetId={widgetId}
          />
        ) : null}
      </div>

      {/* Coluna 2: Conteúdo (Tags, Título, Tópicos, CTA) */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pl-2.5 pr-1">
        {/* Topo: Tags e Título */}
        <div>
          {tags.length > 0 && (
            <div className="mb-0.5 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#fde8ea] px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-[#d6112c] leading-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 className="line-clamp-2 text-[12px] sm:text-[12.5px] xl:text-[13px] font-bold leading-tight text-[#0c2340]">
            <Link href={ctaUrl} className="hover:text-[#cb001c] transition-colors">
              {title}
            </Link>
          </h3>
        </div>

        {/* Meio: Tópicos explicativos sem truncamento */}
        {paragraphs.length > 0 && (
          <div className="my-auto py-0.5 space-y-0.5 text-[9.5px] sm:text-[10px] xl:text-[10.5px] leading-[1.28] text-[#55667e]">
            {paragraphs.map((paragraph, pIdx) => (
              <p key={pIdx}>{paragraph}</p>
            ))}
          </div>
        )}

        {/* Base: Botão Ver Completo estilo pílula */}
        <Link
          href={ctaUrl}
          className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-[#e2091e] py-1 px-2 text-[10px] sm:text-[10.5px] font-bold text-[#e2091e] transition-colors hover:bg-red-50 hover:border-[#c4001a] text-center shrink-0"
        >
          <span>{ctaLabel}</span>
          <ChevronRight aria-hidden="true" className="size-2.5 sm:size-3 stroke-[2.5]" />
        </Link>
      </div>
    </article>
  );
}
