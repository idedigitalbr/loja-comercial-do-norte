'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Beer,
  Bike,
  Cake,
  ChevronLeft,
  ChevronRight,
  Croissant,
  IceCream,
  PartyPopper,
  Pizza,
  Play,
  Soup,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { SegmentCardItem, SegmentsCarouselProps } from '@/lib/storefront/widget-types';

function SegmentIcon({ type }: { type: SegmentCardItem['iconType'] }) {
  switch (type) {
    case 'burger':
      return <UtensilsCrossed className="size-4 text-white" />;
    case 'pizza':
      return <Pizza className="size-4 text-white" />;
    case 'bakery':
      return <Croissant className="size-4 text-white" />;
    case 'party':
      return <PartyPopper className="size-4 text-white" />;
    case 'buffet':
      return <Soup className="size-4 text-white" />;
    case 'confectionery':
      return <Cake className="size-4 text-white" />;
    case 'icecream':
      return <IceCream className="size-4 text-white" />;
    case 'bar':
      return <Beer className="size-4 text-white" />;
    case 'delivery':
      return <Bike className="size-4 text-white" />;
    default:
      return <UtensilsCrossed className="size-4 text-white" />;
  }
}

const SEGMENT_SLUG_MAP: Record<string, string> = {
  lanchonete: 'lanchonete',
  burger: 'lanchonete',
  hamburguer: 'lanchonete',
  pizzaria: 'pizzaria',
  pizza: 'pizzaria',
  padaria: 'padaria',
  bakery: 'padaria',
  festa: 'loja-de-festas',
  festas: 'loja-de-festas',
  'loja-de-festas': 'loja-de-festas',
  buffet: 'restaurante-buffet',
  restaurante: 'restaurante-buffet',
  'restaurante-buffet': 'restaurante-buffet',
  confeitaria: 'confeitaria-bolos',
  'confeitaria-bolos': 'confeitaria-bolos',
  bolo: 'confeitaria-bolos',
  doces: 'confeitaria-bolos',
  acai: 'sorveteria-acai',
  açaí: 'sorveteria-acai',
  sorveteria: 'sorveteria-acai',
  'sorveteria-acai': 'sorveteria-acai',
  bar: 'bar-distribuidora',
  distribuidora: 'bar-distribuidora',
  'bar-distribuidora': 'bar-distribuidora',
  delivery: 'delivery',
};

export function resolveSegmentUrl(item: { id?: string; title?: string; linkUrl?: string }): string {
  if (item.linkUrl && item.linkUrl.startsWith('/segmento/')) {
    return item.linkUrl;
  }
  const cleanId = (item.id || '').replace(/^seg[-_]/, '').toLowerCase();
  if (cleanId && SEGMENT_SLUG_MAP[cleanId]) {
    return `/segmento/${SEGMENT_SLUG_MAP[cleanId]}`;
  }
  if (item.linkUrl) {
    const qMatch = item.linkUrl.match(/[?&](?:q|segmento)=([^&#]+)/);
    if (qMatch && qMatch[1]) {
      const qVal = decodeURIComponent(qMatch[1]).toLowerCase();
      if (SEGMENT_SLUG_MAP[qVal]) {
        return `/segmento/${SEGMENT_SLUG_MAP[qVal]}`;
      }
    }
  }
  const cleanTitle = (item.title || '').toLowerCase();
  for (const [key, slug] of Object.entries(SEGMENT_SLUG_MAP)) {
    if (cleanTitle.includes(key)) {
      return `/segmento/${slug}`;
    }
  }
  return item.linkUrl || '/segmentos';
}

const CLONE_COUNT = 4;

export function SegmentsCarouselWidget({
  widgetId,
  title = 'Para todos os Negócios',
  subtitle = 'De todos os tamanhos',
  ctaLabel = 'Ver todos os segmentos',
  ctaUrl = '/segmentos',
  videoButtonLabel = 'Assista nosso vídeo',
  videoUrl = '/videos/nort-intro.mp4',
  mascotImageUrl = '/assets/nort-segmentos.png',
  items = [],
  autoplayIntervalMs = 5000,
}: SegmentsCarouselProps) {
  const { isEditing, previewMode } = useElementor();

  const canLoop = Boolean(items && items.length > 4);

  const [currentIndex, setCurrentIndex] = useState(() => (canLoop ? CLONE_COUNT : 0));
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    if (!isVideoModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoModalOpen]);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const isAnimatingRef = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Sincroniza índice inicial se a lista de itens mudar
  useEffect(() => {
    if (canLoop) {
      setCurrentIndex(CLONE_COUNT);
      currentIndexRef.current = CLONE_COUNT;
    } else {
      setCurrentIndex(0);
      currentIndexRef.current = 0;
    }
  }, [canLoop, items?.length]);

  const allSlides = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (!canLoop) {
      return items.map((item, originalIndex) => ({
        item,
        originalIndex,
        isClone: false,
      }));
    }

    const prefixClones = items.slice(-CLONE_COUNT).map((item, i) => ({
      item,
      originalIndex: items.length - CLONE_COUNT + i,
      isClone: true,
    }));
    const realSlides = items.map((item, originalIndex) => ({
      item,
      originalIndex,
      isClone: false,
    }));
    const suffixClones = items.slice(0, CLONE_COUNT).map((item, originalIndex) => ({
      item,
      originalIndex,
      isClone: true,
    }));

    return [...prefixClones, ...realSlides, ...suffixClones];
  }, [items, canLoop]);

  const handleTransitionEnd = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    if (!canLoop) {
      isAnimatingRef.current = false;
      return;
    }

    const cur = currentIndexRef.current;
    const realLength = items.length;

    if (cur >= realLength + CLONE_COUNT) {
      setIsTransitionEnabled(false);
      const nextIdx = cur - realLength;
      setCurrentIndex(nextIdx);
      currentIndexRef.current = nextIdx;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
          isAnimatingRef.current = false;
        });
      });
    } else if (cur < CLONE_COUNT) {
      setIsTransitionEnabled(false);
      const nextIdx = cur + realLength;
      setCurrentIndex(nextIdx);
      currentIndexRef.current = nextIdx;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
          isAnimatingRef.current = false;
        });
      });
    } else {
      isAnimatingRef.current = false;
    }
  }, [canLoop, items.length]);

  const handleNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitionEnabled(true);
    setCurrentIndex((prev) => {
      const next = canLoop ? prev + 1 : (prev + 1) % items.length;
      currentIndexRef.current = next;
      return next;
    });

    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      if (isAnimatingRef.current) {
        handleTransitionEnd();
      }
    }, 600);
  }, [canLoop, items.length, handleTransitionEnd]);

  const handlePrev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitionEnabled(true);
    setCurrentIndex((prev) => {
      const next = canLoop ? prev - 1 : (prev - 1 + items.length) % items.length;
      currentIndexRef.current = next;
      return next;
    });

    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      if (isAnimatingRef.current) {
        handleTransitionEnd();
      }
    }, 600);
  }, [canLoop, items.length, handleTransitionEnd]);

  const handleDotClick = useCallback(
    (dotIdx: number) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setIsTransitionEnabled(true);
      const nextIdx = canLoop ? CLONE_COUNT + dotIdx : dotIdx;
      setCurrentIndex(nextIdx);
      currentIndexRef.current = nextIdx;

      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        if (isAnimatingRef.current) {
          handleTransitionEnd();
        }
      }, 600);
    },
    [canLoop, handleTransitionEnd]
  );

  // Autoplay que pausa no hover ou em edição
  useEffect(() => {
    if (
      isPaused ||
      (isEditing && !previewMode) ||
      !canLoop ||
      autoplayIntervalMs <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, autoplayIntervalMs);

    return () => clearInterval(timer);
  }, [isPaused, isEditing, previewMode, canLoop, autoplayIntervalMs, handleNext]);

  // Limpa safety timeout ao desmontar
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  if (!items || items.length === 0) return null;

  const activeDot = canLoop
    ? ((currentIndex - CLONE_COUNT) % items.length + items.length) % items.length
    : currentIndex % items.length;

  return (
    <section aria-label={title} className="cn-container pt-4 pb-2 sm:pt-6 sm:pb-3">
      <div className="relative bg-transparent">
        {/* Topo Azul Escuro: compacto e encaixado perfeitamente com os cards e o mascote Nort */}
        <div className="relative rounded-[24px] bg-gradient-to-r from-[#002868] via-[#003E99] to-[#002B66] px-5 pt-5 pb-24 sm:px-10 sm:pt-6 sm:pb-32 lg:pb-32 shadow-md">
          {/* Header Superior: Textos à esquerda e CTA à direita */}
          <div className="relative z-20 flex flex-col justify-between gap-3.5 sm:gap-4 sm:flex-row sm:items-center">
            {/* Bloco Esquerda: Título, Subtítulo, Traço Vermelho e Botão Assista nosso vídeo */}
            <div className="max-w-md">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-base font-medium text-white sm:text-lg">
                {subtitle}
              </p>
              <div className="mt-2 h-1 w-20 sm:w-24 rounded-full bg-[#E2091E]" />

              <button
                type="button"
                onClick={() => {
                  if (isEditing && !previewMode) return;
                  setIsVideoModalOpen(true);
                }}
                className="mt-3.5 sm:mt-5 inline-flex items-center gap-2.5 cursor-pointer group select-none text-left transition hover:opacity-95"
                aria-label={videoButtonLabel}
              >
                <span className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#E2091E] text-white shadow-md transition-transform duration-200 group-hover:scale-105 ring-2 ring-white/30 shrink-0">
                  <Play className="size-3.5 sm:size-4 text-white fill-white ml-0.5" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide group-hover:text-white/90 transition-colors">
                  {videoButtonLabel}
                </span>
              </button>
            </div>

            {/* Bloco Direita: CTA Ver todos os segmentos */}
            <Link
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/40 bg-[#002868]/70 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20 sm:self-center"
              href={ctaUrl}
              onClick={(e) => {
                if (isEditing && !previewMode) e.preventDefault();
              }}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mascote Nort 3D Centralizado com Balão "Veja os produtos para seu segmento" (Anexo 3) */}
          <div
            aria-hidden="true"
            data-testid="segments-nort-mascot"
            className="pointer-events-none z-10 flex items-start justify-center select-none w-[270px] xs:w-[310px] sm:w-[410px] md:w-[450px] lg:w-[480px] xl:w-[500px] relative mx-auto mt-2 -mb-16 xs:-mb-20 sm:mt-0 sm:mb-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:-top-7 md:-top-8"
          >
            <div className="relative w-full aspect-[1024/576]">
              <Image
                alt="Nort — Veja os produtos para seu segmento"
                className="size-full object-contain object-top drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
                fill
                priority
                sizes="(max-width: 640px) 310px, (max-width: 768px) 410px, (max-width: 1024px) 450px, 500px"
                src={mascotImageUrl}
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Carrossel de Cards sobrepondo o fundo azul com base transparente (sem fundo branco na parte de baixo) */}
        <div
          className="relative -mt-28 px-5 pb-2 sm:px-9 z-20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <div className="overflow-hidden py-3 -my-3">
            <div
              className={`flex -mx-2 [--card-step:100%] sm:[--card-step:50%] lg:[--card-step:25%] ${
                isTransitionEnabled
                  ? 'transition-transform duration-500 ease-in-out'
                  : 'transition-none'
              }`}
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(calc(-1 * ${currentIndex} * var(--card-step)))`,
              }}
            >
              {allSlides.map((slide, idx) => {
                const targetUrl = resolveSegmentUrl(slide.item);
                const isClone = slide.isClone;
                const origIdx = slide.originalIndex;

                return (
                  <div
                    aria-hidden={isClone}
                    className="w-full sm:w-1/2 lg:w-1/4 shrink-0 px-2 select-none"
                    key={`${slide.item.id || origIdx}-${idx}`}
                  >
                    <div className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                      {/* Foto Superior */}
                      <div className="group/img relative aspect-[1.05/1] w-full overflow-hidden bg-slate-100">
                        <Link
                          className="block size-full"
                          href={targetUrl}
                          onClick={(e) => {
                            if (isEditing && !previewMode) e.preventDefault();
                          }}
                          tabIndex={isClone ? -1 : 0}
                        >
                          <Image
                            alt={`${slide.item.prefix} ${slide.item.title}`}
                            className={`size-full object-cover transition duration-500 ${
                              isEditing && !previewMode
                                ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                                : 'group-hover:scale-105'
                            }`}
                            height={535}
                            src={slide.item.imageUrl}
                            unoptimized
                            width={530}
                          />
                        </Link>

                        {widgetId && !isClone ? (
                          <InlineImageEditorOverlay
                            canAdd={false}
                            canRemove={false}
                            currentLinkUrl={targetUrl}
                            fieldPath={`items.${origIdx}.imageUrl`}
                            linkFieldPath={`items.${origIdx}.linkUrl`}
                            previewUrl={slide.item.imageUrl}
                            slideIndex={origIdx}
                            title={`Segmento: ${slide.item.title}`}
                            widgetId={widgetId}
                          />
                        ) : null}
                      </div>

                      {/* Conteúdo do Card */}
                      <Link
                        className="flex flex-1 flex-col px-5 pb-5 pt-4 transition hover:bg-slate-50/60"
                        href={targetUrl}
                        onClick={(e) => {
                          if (isEditing && !previewMode) e.preventDefault();
                        }}
                        tabIndex={isClone ? -1 : 0}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E2091E] shadow-md transition group-hover:scale-105">
                            <SegmentIcon type={slide.item.iconType} />
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-slate-400">
                              {slide.item.prefix}
                            </span>
                            <h3 className="text-xl font-bold leading-tight tracking-tight text-[#002868] transition group-hover:text-[#004CB1]">
                              {slide.item.title}
                            </h3>
                          </div>
                        </div>
                        <div className="my-3 h-[3px] w-12 rounded-full bg-[#E2091E]" />
                        <p className="text-xs leading-relaxed text-slate-600">{slide.item.description}</p>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setas Laterais e Paginação */}
          {canLoop && (
            <>
              <button
                aria-label="Segmento anterior"
                className="absolute left-1 sm:left-3 top-1/3 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 sm:flex"
                onClick={handlePrev}
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Próximo segmento"
                className="absolute right-1 sm:right-3 top-1/3 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 active:scale-95 sm:flex"
                onClick={handleNext}
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>

              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5 shadow-sm">
                  {items.map((item, dot) => (
                    <button
                      aria-label={`Segmento ${dot + 1}: ${item.title}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeDot === dot ? 'w-5 bg-[#E2091E]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      key={item.id || dot}
                      onClick={() => handleDotClick(dot)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Vídeo Institucional dos Segmentos */}
      {isVideoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vídeo institucional dos segmentos"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#E2091E] text-white">
                  <Play className="size-3 fill-white ml-0.5" />
                </span>
                <span className="text-xs sm:text-sm font-bold">
                  Comercial do Norte — Para todos os Negócios
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Fechar vídeo"
                className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <video
                controls
                autoPlay
                playsInline
                className="size-full object-contain"
              >
                <source src="/videos/nort-intro-compressed.webm" type="video/webm" />
                <source src={videoUrl || '/videos/nort-intro.mp4'} type="video/mp4" />
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
