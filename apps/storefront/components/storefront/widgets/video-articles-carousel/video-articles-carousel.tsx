'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { VideoArticleCard } from './video-article-card';
import type { VideoArticlesCarouselProps } from '@/lib/storefront/widget-types';

export { VideoArticleCard };

export function VideoArticlesCarouselWidget({
  widgetId,
  variant,
  title = 'Explica Aí Nort',
  subtitle = 'Dicas em vídeos e artigos para você usar no seu negócio.',
  topHeading,
  viewAllLabel = 'Ver mais',
  viewAllUrl,
  showViewAll = true,
  fullWidth = false,
  mascotImageUrl,
  bgImageUrl,
  items = [],
}: VideoArticlesCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  if (!items.length) return null;

  const isConfeitaria =
    variant === 'confeitaria' ||
    title.toLowerCase().includes('confeitaria') ||
    title.toLowerCase().includes('workshop');

  const isExplicaAi = !isConfeitaria && (title.toLowerCase().includes('explica a') || title.toLowerCase().includes('explica'));

  const resolvedBgImage =
    bgImageUrl ||
    (isConfeitaria
      ? '/assets/confeitaria/bg-confeitaria-banner.svg'
      : '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-bg-fundo-vermelho-geometrico-abstrato-hd.png');

  const resolvedMascotImage =
    mascotImageUrl ||
    (isConfeitaria
      ? '/assets/confeitaria/confeiteira-banner-cutout-trimmed.webp'
      : '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/S14-Boneco3D-explica-ai-nort-trimmed.webp');

  const resolvedViewAllUrl =
    viewAllUrl || (isConfeitaria ? '/eventos/workshops/aulas-confeitaria' : '/post');

  const bgContainerClass = isConfeitaria ? 'bg-[#3d1316]' : 'bg-[#cb001c]';
  const navArrowClass = isConfeitaria ? 'text-[#c42646]' : 'text-[#e2091e]';

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
    const scrollStep = card ? card.offsetWidth + 16 : 320;
    element.scrollBy({
      left: direction * scrollStep,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  // Conteúdo interno do banner (compartilhado entre os modos fullWidth e contained)
  const bannerInner = (
    <>
      {/* Background geométrico abstrato oficial */}
      <Image
        src={resolvedBgImage}
        alt=""
        fill
        priority
        className="pointer-events-none select-none object-cover object-center -z-10"
      />

      {/* Barra de Topo do Carrossel: Título Contextual ("Dicas para sua Lanchonete") e Link "Ver mais >" */}
      {(topHeading || (showViewAll && viewAllLabel)) && (
        <div
          className={`flex items-center mb-3 lg:mb-0 lg:absolute z-20 ${
            topHeading
              ? 'relative justify-center lg:top-3.5 xl:top-4 lg:left-[43.5%] xl:left-[43%] lg:right-5 xl:right-6'
              : 'justify-end lg:top-4 lg:right-6 xl:top-4.5 xl:right-7'
          }`}
        >
          {topHeading && (
            <h3 className="text-base sm:text-lg lg:text-[21px] xl:text-[22px] font-bold text-white tracking-tight text-center px-12 sm:px-0">
              {typeof topHeading === 'string' ? (
                topHeading
              ) : (
                <span>
                  {topHeading.prefix}{' '}
                  <span className="relative inline-block border-b-[3px] border-[#1552E6] pb-0.5 font-bold text-white">
                    {topHeading.highlight}
                  </span>
                </span>
              )}
            </h3>
          )}

          {showViewAll && viewAllLabel && (
            <Link
              href={resolvedViewAllUrl}
              className={`${
                topHeading ? 'absolute right-0 top-1/2 -translate-y-1/2' : 'ml-auto'
              } inline-flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-white/95 hover:text-white transition-opacity tracking-tight`}
            >
              <span>{viewAllLabel}</span>
              <ChevronRight aria-hidden="true" className="size-3.5 stroke-[2.5]" />
            </Link>
          )}
        </div>
      )}

      {/* Coluna Esquerda: Título Oficial + Subtítulo Perfeitamente Diagramado */}
      <div
        className={`z-10 ${
          isConfeitaria
            ? 'max-w-[260px] sm:max-w-[270px] lg:max-w-[270px] xl:max-w-[285px]'
            : 'max-w-[200px] sm:max-w-[220px] lg:max-w-[205px] xl:max-w-[225px]'
        } lg:absolute lg:left-7 xl:left-8 lg:top-1/2 lg:-translate-y-1/2`}
      >
        {isConfeitaria ? (
          <>
            <h2
              className="text-2xl sm:text-[26px] lg:text-[27px] xl:text-[29px] font-bold leading-[1.08] tracking-tight"
              style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
            >
              <span className="block text-white whitespace-nowrap">Workshops &amp;</span>
              <span className="block text-white whitespace-nowrap">Aulas Práticas</span>
              <span className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                <span className="text-[#e26678]">de Confeitaria</span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 sm:size-6.5 items-center justify-center rounded-full border-2 border-[#e26678] bg-[#e26678]/25 text-[#e26678] shadow-sm shrink-0"
                >
                  <Play className="size-2.5 sm:size-3 fill-white ml-0.5 text-white" />
                </span>
              </span>
            </h2>
            <div className="mt-3 border-l-[2.5px] border-[#e26678] pl-2.5 sm:pl-3 text-xs sm:text-[12px] xl:text-[12.5px] leading-snug text-white/95 font-normal">
              <p className="block">Faça suas compras e ganhe</p>
              <p className="block">
                treinamento <span className="font-bold text-white">gratuitamente.</span>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-[28px] lg:text-[30px] xl:text-[32px] font-black text-white leading-[1.02] tracking-tight">
              {isExplicaAi ? (
                <>
                  <span className="block">Explica Aí</span>
                  <span className="flex items-center gap-2 mt-0.5">
                    <span>Nort!</span>
                    <span
                      aria-hidden="true"
                      className="inline-flex size-6 sm:size-7 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-white shadow-sm shrink-0"
                    >
                      <Play className="size-3 sm:size-3.5 fill-white ml-0.5" />
                    </span>
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{title}</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-6 sm:size-7 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-white shadow-sm shrink-0"
                  >
                    <Play className="size-3 sm:size-3.5 fill-white ml-0.5" />
                  </span>
                </span>
              )}
            </h2>
            <div className="mt-2.5 sm:mt-3 text-xs sm:text-[12px] xl:text-[13px] leading-snug text-white/90 font-normal">
              <p className="block">Dicas em vídeos e artigos</p>
              <p className="block">para você usar no seu negócio.</p>
            </div>
          </>
        )}
      </div>

      {/* Mascote 3D / Confeiteira */}
      <div
        aria-hidden="true"
        className={`hidden lg:block absolute bottom-0 ${
          isConfeitaria
            ? 'left-[20.5%] xl:left-[21.5%] h-[95%] xl:h-[96%] w-[21.5%] max-w-[230px]'
            : 'left-[14.5%] xl:left-[15.5%] h-[92%] xl:h-[93%] w-[26%] max-w-[265px] min-w-[220px]'
        } z-10 pointer-events-none select-none`}
      >
        <Image
          src={resolvedMascotImage}
          alt={isConfeitaria ? 'Workshop de Confeitaria' : 'Mascote Explica Aí Nort'}
          fill
          priority
          className="object-contain object-bottom"
        />
      </div>

      {/* Mascote compacto para tablets */}
      <div
        aria-hidden="true"
        className="hidden md:block lg:hidden absolute top-2 right-28 h-24 w-24 pointer-events-none select-none z-10"
      >
        <Image
          src={resolvedMascotImage}
          alt={isConfeitaria ? 'Workshop de Confeitaria' : 'Mascote Explica Aí Nort'}
          fill
          className="object-contain object-bottom"
        />
      </div>

      {/* Carrossel de Cards à Direita */}
      <div
        className={`relative mt-4 lg:mt-0 lg:absolute ${
          showViewAll ? 'lg:top-[48px] xl:top-[50px]' : 'lg:top-1/2 lg:-translate-y-1/2'
        } lg:bottom-4 xl:bottom-4.5 lg:left-[43.5%] xl:left-[43%] lg:right-5 xl:right-6 flex items-center z-10`}
      >
        <div
          ref={track}
          aria-label={isConfeitaria ? 'Workshops e aulas' : 'Dicas e artigos'}
          onScroll={handleScroll}
          tabIndex={0}
          className="no-scrollbar flex w-full snap-x snap-mandatory gap-2.5 lg:gap-3 overflow-x-auto py-1 px-0.5 focus:outline-none"
        >
          {items.map((item, index) => (
            <VideoArticleCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl}
              tags={item.tags}
              paragraphs={item.paragraphs}
              ctaLabel={item.ctaLabel}
              ctaUrl={item.ctaUrl}
              widgetId={widgetId}
              index={index}
              variant={isConfeitaria ? 'confeitaria' : 'default'}
              className="w-[85%] sm:w-[58%] lg:w-[calc(50%-6px)] shrink-0 snap-start shadow-md hover:shadow-lg"
            />
          ))}
        </div>

        {/* Botões de Navegação Circular Brancos */}
        {items.length > 1 && (
          <>
            <button
              aria-label={isConfeitaria ? 'Workshop anterior' : 'Dica anterior'}
              disabled={edges.start}
              onClick={() => move(-1)}
              type="button"
              className={`absolute -left-3.5 sm:-left-4 top-1/2 -translate-y-1/2 z-20 flex size-8 sm:size-9 items-center justify-center rounded-full bg-white ${navArrowClass} shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 transition-all disabled:opacity-90 disabled:cursor-default cursor-pointer`}
            >
              <ChevronLeft aria-hidden="true" className="size-4 sm:size-4.5 stroke-[2.5]" />
            </button>
            <button
              aria-label={isConfeitaria ? 'Próximo workshop' : 'Próxima dica'}
              disabled={edges.end}
              onClick={() => move(1)}
              type="button"
              className={`absolute -right-2.5 sm:-right-3 top-1/2 -translate-y-1/2 z-20 flex size-8 sm:size-9 items-center justify-center rounded-full bg-white ${navArrowClass} shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:scale-105 active:scale-95 transition-all disabled:opacity-90 disabled:cursor-default cursor-pointer`}
            >
              <ChevronRight aria-hidden="true" className="size-4 sm:size-4.5 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>
    </>
  );

  if (fullWidth) {
    return (
      <section aria-label={title} className={`w-full ${bgContainerClass} rounded-b-[28px] sm:rounded-b-[36px] shadow-sm relative isolate overflow-hidden mb-0`}>
        <div className="relative isolate min-h-[260px] lg:h-[260px] xl:h-[270px]">
          <div className="cn-container h-full relative p-4 sm:p-6 lg:p-0">
            {bannerInner}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={title} className="cn-container py-3 sm:py-5">
      <div className={`relative isolate overflow-hidden rounded-[24px] sm:rounded-[28px] lg:rounded-[30px] ${bgContainerClass} p-4 sm:p-6 lg:p-0 shadow-lg lg:h-[260px] xl:h-[270px]`}>
        {bannerInner}
      </div>
    </section>
  );
}
