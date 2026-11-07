'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { VideoArticleCard } from './video-article-card';
import type { VideoArticlesCarouselProps } from '@/lib/storefront/widget-types';

export { VideoArticleCard };

/**
 * Faíscas amarelas de ação/energia no canto superior direito do título "Explica Aí Nort!" (Anexo 2)
 */
function YellowActionSparks({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 42 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Raio superior */}
      <line x1="8" y1="26" x2="16" y2="6" stroke="#FFCE00" strokeWidth="3.5" strokeLinecap="round" />
      {/* Raio central longo */}
      <line x1="14" y1="28" x2="34" y2="12" stroke="#FFCE00" strokeWidth="4" strokeLinecap="round" />
      {/* Raio inferior */}
      <line x1="18" y1="32" x2="36" y2="28" stroke="#FFCE00" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Faíscas brancas de ação/reação à esquerda da cabeça do Mascote Nort (Anexo 2)
 */
function WhiteActionSparks({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Raio superior inclinado para cima */}
      <line x1="22" y1="18" x2="6" y2="8" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      {/* Raio central horizontal */}
      <line x1="24" y1="24" x2="4" y2="24" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      {/* Raio inferior inclinado para baixo */}
      <line x1="22" y1="30" x2="8" y2="38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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
  const [activeIndex, setActiveIndex] = useState(0);

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
    if (items.length > 0) {
      const card = el.firstElementChild as HTMLElement | null;
      const cardWidth = card ? card.offsetWidth + 10 : 280;
      const newIndex = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), items.length - 1));
    }
  };

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const scrollStep = card ? card.offsetWidth + 12 : 300;
    element.scrollBy({
      left: direction * scrollStep,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  function scrollToIndex(index: number) {
    const element = track.current;
    if (!element) return;
    const card = element.children[index] as HTMLElement | undefined;
    if (card) {
      card.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    } else {
      const cardWidth = element.firstElementChild
        ? (element.firstElementChild as HTMLElement).offsetWidth + 10
        : 280;
      element.scrollTo({
        left: index * cardWidth,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
    setActiveIndex(index);
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
        className={`pointer-events-none select-none object-cover object-center -z-10 ${
          isConfeitaria ? 'hidden lg:block' : ''
        }`}
      />

      {/* Background mobile dedicado para Confeitaria (Ondas e cores fiéis ao Anexo 2) */}
      {isConfeitaria && (
        <Image
          src="/assets/confeitaria/bg-confeitaria-banner-mobile.svg"
          alt=""
          fill
          priority
          className="pointer-events-none select-none object-cover object-center -z-10 block lg:hidden"
        />
      )}

      {/* Barra de Topo do Carrossel quando há topHeading Contextual ("Dicas para sua Lanchonete") */}
      {topHeading && (
        <div className="relative flex items-center justify-center mb-3 lg:mb-0 lg:absolute z-20 lg:top-3.5 xl:top-4 lg:left-[43.5%] xl:left-[43%] lg:right-5 xl:right-6">
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

          {showViewAll && viewAllLabel && (
            <Link
              href={resolvedViewAllUrl}
              className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-white/95 hover:text-white transition-opacity tracking-tight"
            >
              <span>{viewAllLabel}</span>
              <ChevronRight aria-hidden="true" className="size-3.5 stroke-[2.5]" />
            </Link>
          )}
        </div>
      )}

      {/* HEADER: Estrutura dedicada para Confeitaria (Fiel ao Anexo 2) vs Explica Aí Nort */}
      {isConfeitaria ? (
        <div className="relative lg:static z-10 min-h-[235px] xs:min-h-[255px] sm:min-h-[285px] lg:min-h-0 mb-1.5 xs:mb-2 lg:mb-0">
          {/* Coluna Esquerda: Título Oficial, Subtítulo e Link Ver todos */}
          <div
            className="w-[50%] xs:w-[49%] sm:w-[53%] lg:w-auto lg:max-w-[270px] xl:max-w-[285px] pt-1 xs:pt-1.5 lg:pt-0 flex flex-col justify-start items-start z-10 relative lg:absolute lg:left-7 xl:left-8 lg:top-1/2 lg:-translate-y-1/2"
          >
            <h2
              className="text-[19px] xs:text-[21px] sm:text-[24px] lg:text-[27px] xl:text-[29px] font-bold leading-[1.08] tracking-tight"
              style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
            >
              <span className="block text-white whitespace-nowrap">Workshops &amp;</span>
              <span className="block text-white whitespace-nowrap">Aulas Práticas</span>
              <span className="inline-flex items-center gap-1.5 text-[#e26678] whitespace-nowrap mt-0.5">
                <span>de Confeitaria</span>
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center size-5.5 xs:size-6 rounded-full border-[1.5px] border-white bg-[#ca2953] shadow-sm shrink-0"
                >
                  <Play className="size-2.5 xs:size-3 fill-white text-white translate-x-[0.5px]" />
                </span>
              </span>
            </h2>
            <div className="mt-2.5 xs:mt-3 border-l-[2.5px] border-[#e26678] pl-2 xs:pl-2.5 sm:pl-3 text-[11px] xs:text-[11.5px] sm:text-[12px] xl:text-[12.5px] leading-snug text-white/95 font-normal">
              <p className="block">Faça suas compras e ganhe</p>
              <p className="block">
                treinamento <span className="font-bold text-white">gratuitamente.</span>
              </p>
            </div>
            {/* Link Ver todos mobile */}
            {!topHeading && showViewAll && viewAllLabel && (
              <div className="mt-3 xs:mt-3.5 flex justify-start lg:hidden">
                <Link
                  href={resolvedViewAllUrl}
                  className="inline-flex items-center gap-1 text-xs xs:text-[12.5px] font-semibold text-white/95 hover:text-white transition-opacity tracking-tight"
                >
                  <span>{viewAllLabel}</span>
                  <ChevronRight aria-hidden="true" className="size-3.5 stroke-[2.5]" />
                </Link>
              </div>
            )}
          </div>

          {/* Confeiteira (Mobile: posicionada à direita no topo com bolo e balão de fala perfeitamente legíveis) */}
          <div
            aria-hidden="true"
            className="block lg:hidden absolute top-0 right-[-6px] xs:right-0 sm:right-2 w-[54%] xs:w-[52%] sm:w-[48%] max-w-[270px] h-[245px] xs:h-[268px] sm:h-[295px] pointer-events-none select-none z-10"
          >
            <Image
              src={resolvedMascotImage}
              alt="Workshop de Confeitaria"
              fill
              priority
              className="object-contain object-top xs:object-right-top"
            />
          </div>

          {/* Confeiteira (Desktop: posicionada no centro-esquerda ao fundo dos cards) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute bottom-0 left-[20.5%] xl:left-[21.5%] h-[95%] xl:h-[96%] w-[21.5%] max-w-[230px] z-10 pointer-events-none select-none"
          >
            <Image
              src={resolvedMascotImage}
              alt="Workshop de Confeitaria"
              fill
              priority
              className="object-contain object-bottom"
            />
          </div>

          {/* Link Ver todos desktop */}
          {!topHeading && showViewAll && viewAllLabel && (
            <div className="z-20 lg:absolute lg:top-4 lg:right-6 xl:top-4.5 xl:right-7 hidden lg:flex justify-end">
              <Link
                href={resolvedViewAllUrl}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/95 hover:text-white transition-opacity tracking-tight"
              >
                <span>{viewAllLabel}</span>
                <ChevronRight aria-hidden="true" className="size-3.5 stroke-[2.5]" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Header Grid para Explica Aí Nort (Mascote à esquerda no mobile, Título à direita) */
        <div className="relative lg:static z-10 grid grid-cols-[46%_54%] xs:grid-cols-[45%_55%] items-end gap-x-1.5 xs:gap-x-2 pt-1 pb-3 px-1 lg:block lg:p-0">
          {/* 1. Mascote 3D Explica Aí */}
          <div
            aria-hidden="true"
            className="col-start-1 row-start-1 row-span-2 relative w-full h-[160px] xs:h-[180px] sm:h-[200px] flex flex-col justify-end items-center pointer-events-none select-none z-10 lg:col-auto lg:row-auto lg:absolute lg:bottom-0 lg:left-[14.5%] xl:left-[15.5%] lg:h-[92%] xl:h-[93%] lg:w-[26%] lg:max-w-[265px] lg:min-w-[220px]"
          >
            {isExplicaAi && (
              <WhiteActionSparks className="block lg:hidden absolute -left-1 top-4 xs:top-5 size-6 xs:size-7 pointer-events-none select-none z-20" />
            )}

            <div className="relative w-full h-full">
              <Image
                src={resolvedMascotImage}
                alt="Mascote Explica Aí Nort"
                fill
                priority
                className="object-contain object-bottom"
              />
            </div>
          </div>

          {/* 2. Título e Subtítulo Explica Aí */}
          <div className="col-start-2 row-start-1 relative flex flex-col justify-end items-start pl-1 xs:pl-1.5 pb-0.5 z-10 lg:col-auto lg:row-auto lg:p-0 lg:max-w-[205px] xl:max-w-[225px] lg:absolute lg:left-7 xl:left-8 lg:top-1/2 lg:-translate-y-1/2">
            {isExplicaAi && (
              <YellowActionSparks className="block lg:hidden absolute -top-1 xs:-top-1.5 right-1 xs:right-3 size-7 xs:size-8 pointer-events-none select-none" />
            )}

            <h2 className="text-[25px] xs:text-[27px] sm:text-[28px] lg:text-[30px] xl:text-[32px] font-black text-white leading-[1.0] lg:leading-[1.02] tracking-tight">
              {isExplicaAi ? (
                <>
                  <span className="block">Explica Aí</span>
                  <span className="block mt-0.5">Nort!</span>
                </>
              ) : (
                <span>{title}</span>
              )}
            </h2>
            <div className="mt-2 lg:mt-2.5 sm:mt-3 text-[11px] xs:text-[11.5px] sm:text-[12px] xl:text-[13px] leading-[1.3] lg:leading-snug text-white/95 lg:text-white/90 font-normal">
              <p className="block">Dicas em vídeos e artigos</p>
              <p className="block">para você usar no seu negócio.</p>
            </div>
          </div>

          {/* 3. Link Ver todos Explica Aí */}
          {!topHeading && showViewAll && viewAllLabel && (
            <div className="col-start-2 row-start-2 z-20 mt-2.5 xs:mt-3 pl-1 xs:pl-1.5 lg:col-auto lg:row-auto lg:mt-0 lg:pl-0 lg:absolute lg:top-4 lg:right-6 xl:top-4.5 xl:right-7 flex justify-start lg:justify-end">
              <Link
                href={resolvedViewAllUrl}
                className="inline-flex items-center justify-center gap-1.5 w-full max-w-[150px] xs:max-w-[165px] py-1.5 xs:py-2 px-3 rounded-full border-2 border-white bg-[#cb001c]/90 hover:bg-white text-white hover:text-[#cb001c] font-bold text-xs xs:text-[12.5px] shadow-sm transition-all active:scale-95 text-center lg:w-auto lg:max-w-none lg:p-0 lg:border-0 lg:bg-transparent lg:shadow-none lg:text-white/95 lg:hover:text-white lg:text-[13px] lg:font-semibold tracking-tight"
              >
                <span>{viewAllLabel}</span>
                <ChevronRight aria-hidden="true" className="size-3.5 stroke-[3] lg:stroke-[2.5]" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Carrossel de Cards com Setas de Navegação e Bolinhas de Paginação */}
      <div
        className={`relative ${
          isConfeitaria ? 'mt-1 xs:mt-2' : 'mt-2'
        } lg:mt-0 lg:absolute ${
          showViewAll ? 'lg:top-[48px] xl:top-[50px]' : 'lg:top-1/2 lg:-translate-y-1/2'
        } lg:bottom-4 xl:bottom-4.5 lg:left-[43.5%] xl:left-[43%] lg:right-5 xl:right-6 flex flex-col justify-center z-10`}
      >
        <div className="relative flex items-center w-full">
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
                className="w-[85%] xs:w-[86%] sm:w-[58%] lg:w-[calc(50%-6px)] shrink-0 snap-start shadow-md hover:shadow-lg"
              />
            ))}
          </div>

          {/* Botões de Navegação Circular Brancos - visíveis no mobile e desktop (Fiel ao Anexo 2) */}
          {items.length > 1 && (
            <>
              <button
                aria-label={isConfeitaria ? 'Workshop anterior' : 'Dica anterior'}
                disabled={edges.start}
                onClick={() => move(-1)}
                type="button"
                className={`absolute left-0 xs:-left-1 sm:-left-4 top-1/2 -translate-y-1/2 z-20 flex size-7.5 xs:size-8 sm:size-9 items-center justify-center rounded-full bg-white ${navArrowClass} shadow-[0_2px_10px_rgba(0,0,0,0.22)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
              >
                <ChevronLeft aria-hidden="true" className="size-3.5 xs:size-4 sm:size-4.5 stroke-[2.5]" />
              </button>
              <button
                aria-label={isConfeitaria ? 'Próximo workshop' : 'Próxima dica'}
                disabled={edges.end}
                onClick={() => move(1)}
                type="button"
                className={`absolute right-0 xs:-right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-20 flex size-7.5 xs:size-8 sm:size-9 items-center justify-center rounded-full bg-white ${navArrowClass} shadow-[0_2px_10px_rgba(0,0,0,0.22)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
              >
                <ChevronRight aria-hidden="true" className="size-3.5 xs:size-4 sm:size-4.5 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>

        {/* Bolinhas de Paginação (Visíveis no mobile e tablets, fiéis ao Anexo 2) */}
        {items.length > 1 && (
          <div
            role="tablist"
            aria-label={isConfeitaria ? 'Paginação de workshops' : 'Paginação de dicas'}
            className="flex lg:hidden items-center justify-center gap-2 mt-3 xs:mt-3.5 mb-0.5 z-10"
          >
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${isConfeitaria ? 'Workshop' : 'Dica'} ${idx + 1}`}
                  onClick={() => scrollToIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? isConfeitaria
                        ? 'w-4.5 xs:w-5 h-2 bg-[#e26678]'
                        : 'w-5 xs:w-6 h-1.5 bg-white'
                      : isConfeitaria
                      ? 'size-2 bg-white/85 hover:bg-white'
                      : 'size-1.5 bg-white/45 hover:bg-white/75'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  if (fullWidth) {
    return (
      <section aria-label={title} className={`w-full ${bgContainerClass} rounded-b-[28px] sm:rounded-b-[36px] shadow-sm relative isolate overflow-hidden mb-0`}>
        <div className="relative isolate min-h-[260px] lg:h-[260px] xl:h-[270px]">
          <div className={`cn-container h-full relative ${
            isConfeitaria ? 'pt-4 pb-6 xs:pb-7 px-3.5 xs:px-4 sm:p-6 lg:p-0' : 'p-3.5 xs:p-4 sm:p-6 lg:p-0'
          }`}>
            {bannerInner}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={title} className="cn-container py-3 sm:py-5">
      <div className={`relative isolate overflow-hidden rounded-[26px] xs:rounded-[28px] sm:rounded-[30px] lg:rounded-[30px] ${bgContainerClass} ${
        isConfeitaria ? 'pt-4 pb-6 xs:pb-7 px-3.5 xs:px-4.5 sm:p-6 lg:p-0' : 'p-3.5 xs:p-4 sm:p-6 lg:p-0'
      } shadow-lg lg:h-[260px] xl:h-[270px]`}>
        {bannerInner}
      </div>
    </section>
  );
}
