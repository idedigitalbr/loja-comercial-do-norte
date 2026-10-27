'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { VideoArticlesCarouselProps } from '@/lib/storefront/widget-types';

export function VideoArticlesCarouselWidget({
  widgetId,
  title = 'Explica Aí Nort',
  subtitle = 'Dicas em vídeos e artigos para você usar no seu negócio.',
  viewAllLabel = 'Ver todos',
  viewAllUrl = '/loja',
  mascotImageUrl = '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-Boneco3D-explica-ai-nort-trimmed.webp',
  bgImageUrl = '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-bg-fundo-vermelho-geometrico-abstrato.webp',
  items = [],
}: VideoArticlesCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  if (!items.length) return null;

  const isExplicaAi = title.toLowerCase().includes('explica a') || title.toLowerCase().includes('explica');

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setEdges({
      start: el.scrollLeft <= 5,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 5,
    });
  };

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const scrollStep = card ? card.offsetWidth + 14 : 310;
    element.scrollBy({
      left: direction * scrollStep,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative isolate overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#cb001c] p-4 sm:p-6 lg:p-7 shadow-lg lg:h-[350px] xl:h-[365px] flex flex-col justify-between">
        {/* Background geométrico abstrato oficial */}
        <Image
          src={bgImageUrl}
          alt=""
          fill
          priority
          className="pointer-events-none select-none object-cover object-center -z-10"
        />

        {/* Top bar / Header links */}
        <div className="flex items-center justify-between mb-2 lg:mb-0 lg:absolute lg:top-5 lg:right-7 xl:right-9 z-20">
          <div className="lg:hidden" />
          <Link
            href={viewAllUrl}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-white/95 hover:text-white transition-opacity tracking-tight ml-auto"
          >
            <span>{viewAllLabel}</span>
            <ChevronRight aria-hidden="true" className="size-3.5 sm:size-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* Coluna Esquerda: Título Oficial + Subtítulo */}
        <div className="z-10 max-w-[240px] sm:max-w-[270px] lg:max-w-[250px] xl:max-w-[280px] lg:pt-2">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-white leading-[1.04] tracking-tight">
            {isExplicaAi ? (
              <>
                <span className="block">Explica Aí</span>
                <span className="flex items-center gap-2 mt-0.5">
                  <span>Nort!</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-7 lg:size-8 items-center justify-center rounded-full border-2 border-white/70 text-white bg-transparent shadow-sm shrink-0"
                  >
                    <Play className="size-3.5 lg:size-4 fill-white ml-0.5" />
                  </span>
                </span>
              </>
            ) : (
              <span className="flex items-center gap-2">
                <span>{title}</span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-7 lg:size-8 items-center justify-center rounded-full border-2 border-white/70 text-white bg-transparent shadow-sm shrink-0"
                >
                  <Play className="size-3.5 lg:size-4 fill-white ml-0.5" />
                </span>
              </span>
            )}
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm lg:text-[13px] xl:text-sm leading-relaxed text-white/90 font-normal">
            {subtitle}
          </p>
        </div>

        {/* Mascote 3D (Boneco com balão de fala 'O que você quer aprender hoje?') */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute bottom-0 left-[200px] lg:left-[215px] xl:left-[240px] 2xl:left-[265px] h-[92%] xl:h-[96%] w-[250px] lg:w-[270px] xl:w-[295px] 2xl:w-[315px] z-10 pointer-events-none select-none"
        >
          <Image
            src={mascotImageUrl}
            alt="Mascote Explica Aí Nort"
            fill
            priority
            className="object-contain object-bottom"
          />
        </div>

        {/* Mascote compacto para tablets */}
        <div
          aria-hidden="true"
          className="hidden md:block lg:hidden absolute top-3 right-28 h-28 w-28 pointer-events-none select-none z-10"
        >
          <Image
            src={mascotImageUrl}
            alt="Mascote Explica Aí Nort"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* Carrossel de Cards à Direita */}
        <div className="relative mt-4 lg:mt-0 lg:absolute lg:top-[66px] lg:bottom-4 lg:right-6 xl:right-8 lg:left-[435px] xl:left-[480px] 2xl:left-[520px] flex items-center z-10">
          <div
            ref={track}
            aria-label="Dicas e artigos"
            onScroll={handleScroll}
            tabIndex={0}
            className="no-scrollbar flex w-full snap-x snap-mandatory gap-3.5 overflow-x-auto py-2 px-1 focus:outline-none"
          >
            {items.map((item, index) => (
              <article
                key={item.id}
                className="group relative flex w-[88%] sm:w-[58%] lg:w-[calc(50%-7px)] shrink-0 snap-start flex-row items-stretch rounded-[20px] bg-white p-2 shadow-md transition-shadow hover:shadow-lg h-[190px] lg:h-[200px] xl:h-[210px]"
              >
                {/* Coluna 1: Foto com Botão Play */}
                <div className="relative w-[46%] shrink-0 overflow-hidden rounded-[14px] bg-slate-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 35vw, 45vw"
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                  <Link
                    href={item.ctaUrl || '/loja'}
                    aria-label={`Ver vídeo: ${item.title}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors"
                  >
                    <span className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-[#e2091e] text-white shadow-md transition-transform duration-200 group-hover:scale-110">
                      <Play aria-hidden="true" className="size-4 sm:size-5 fill-white ml-0.5" />
                    </span>
                  </Link>
                  {widgetId ? (
                    <InlineImageEditorOverlay
                      canAdd={false}
                      canRemove={false}
                      currentLinkUrl={item.ctaUrl}
                      fieldPath={`items.${index}.imageUrl`}
                      linkFieldPath={`items.${index}.ctaUrl`}
                      previewUrl={item.imageUrl}
                      slideIndex={index}
                      title={`Vídeo/Artigo: ${item.title}`}
                      widgetId={widgetId}
                    />
                  ) : null}
                </div>

                {/* Coluna 2: Conteúdo (Tags, Título, Tópicos, CTA) */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-1 pl-2.5 pr-1.5">
                  {/* Topo: Tags e Título */}
                  <div>
                    <div className="mb-1 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#fde8eb] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#d6112c] leading-none"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="line-clamp-2 text-xs sm:text-[13px] xl:text-sm font-bold leading-snug text-[#0c2340]">
                      {item.title}
                    </h3>
                  </div>

                  {/* Meio: Tópicos explicativos */}
                  <div className="my-auto space-y-0.5 py-1 text-[10px] sm:text-[11px] leading-tight text-[#55667e]">
                    {item.paragraphs.map((paragraph, pIdx) => (
                      <p key={pIdx} className="line-clamp-1">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Base: Botão Ver Completo estilo pílula */}
                  <Link
                    href={item.ctaUrl || '/loja'}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-[#e2091e] py-1 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#e2091e] transition-colors hover:bg-red-50 hover:border-[#c4001a] text-center"
                  >
                    <span>{item.ctaLabel || 'Ver Completo'}</span>
                    <ChevronRight aria-hidden="true" className="size-3 stroke-[2.5]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Botões de Navegação Circular Brancos */}
          {items.length > 1 && (
            <>
              <button
                aria-label="Dica anterior"
                disabled={edges.start}
                onClick={() => move(-1)}
                type="button"
                className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex size-9 sm:size-10 items-center justify-center rounded-full bg-white text-[#e2091e] shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-default"
              >
                <ChevronLeft aria-hidden="true" className="size-5 stroke-[2.5]" />
              </button>
              <button
                aria-label="Próxima dica"
                disabled={edges.end}
                onClick={() => move(1)}
                type="button"
                className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 flex size-9 sm:size-10 items-center justify-center rounded-full bg-white text-[#e2091e] shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-default"
              >
                <ChevronRight aria-hidden="true" className="size-5 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
