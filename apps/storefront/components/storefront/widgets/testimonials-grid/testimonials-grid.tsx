'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Star } from 'lucide-react';
import type { TestimonialItem, TestimonialsGridProps } from '@/lib/storefront/widget-types';

export function TestimonialCard({
  item,
  className = '',
}: {
  item: TestimonialItem;
  className?: string;
}) {
  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:shadow-md select-none ${className}`}
    >
      <div>
        {/* Topo: Avatar + Nome + Quantidade de avaliações */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
            style={{ backgroundColor: item.avatarColor || '#004CB1' }}
          >
            {item.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900">
              {item.authorName}
            </p>
            <p className="truncate text-[10px] text-slate-400">
              {item.authorHandle}
            </p>
          </div>
        </div>

        {/* Meio: 5 Estrelas + Tempo atrás */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: item.rating || 5 }).map((_, i) => (
              <Star className="size-3 fill-amber-400 text-amber-400" key={i} />
            ))}
          </div>
          <span className="text-[10px] text-slate-400">
            {item.timeAgo || '1 mês atrás'}
          </span>
        </div>

        {/* Base: Texto do depoimento */}
        <p className="mt-2 line-clamp-3 sm:line-clamp-4 text-[11px] leading-relaxed text-slate-600">
          “{item.text}”
        </p>
      </div>
    </article>
  );
}

export function TestimonialsGridWidget({
  widgetId,
  eyebrow = 'AVALIAÇÕES NO GOOGLE',
  title = 'O que nossos clientes dizem no Google.',
  ratingSummary = 'Classificação 4.8 de 5.0 estrelas',
  totalReviewsLabel = 'Um bloco com mais de 2 mil avaliações',
  items = [],
}: TestimonialsGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const set1Ref = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const isPausedRef = useRef(false);
  const scrollPosRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag com mouse para testes no desktop em modo responsivo
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  // Divide os itens em 2 linhas para formar o mosaico no mobile
  const { row1Items, row2Items } = useMemo(() => {
    if (!items || items.length === 0) return { row1Items: [], row2Items: [] };
    const r1: TestimonialItem[] = [];
    const r2: TestimonialItem[] = [];
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        r1.push(item);
      } else {
        r2.push(item);
      }
    });
    // Se a quantidade for ímpar, equilibra para que os ciclos tenham o mesmo comprimento
    if (r1.length > r2.length && r1.length > 0) {
      r2.push(r1[0]);
    } else if (r2.length > r1.length && r2.length > 0) {
      r1.push(r2[0]);
    }
    return { row1Items: r1, row2Items: r2 };
  }, [items]);

  const getCycleWidth = () => {
    if (set1Ref.current && set1Ref.current.offsetWidth > 0) {
      return set1Ref.current.offsetWidth + 12; // largura do conjunto + gap-3 (12px)
    }
    return row1Items.length * 287; // fallback estimado (275px card + 12px gap)
  };

  // Posiciona inicialmente no Set 2 para que haja itens à esquerda e à direita
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cycleWidth = getCycleWidth();
    if (cycleWidth > 0 && container.scrollLeft === 0) {
      container.scrollLeft = cycleWidth;
      scrollPosRef.current = cycleWidth;
    }
  }, [row1Items]);

  // Listener para respeitar prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (typeof window.matchMedia !== 'function') return;
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery?.matches) {
        isPausedRef.current = true;
      }
      const handler = (e: MediaQueryListEvent) => {
        isPausedRef.current = e.matches;
      };
      mediaQuery?.addEventListener?.('change', handler);
      return () => mediaQuery?.removeEventListener?.('change', handler);
    } catch {}
  }, []);

  // Pausa a animação se a aba do navegador estiver oculta
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Loop de animação contínua (marquee fluido)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || row1Items.length === 0) return;

    let animationFrameId: number;
    let lastTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isPausedRef.current && !isInteractingRef.current) {
        const cycleWidth = getCycleWidth();
        if (cycleWidth > 0) {
          // Deslocamento suave: ~32 pixels por segundo
          const speed = (32 * Math.min(delta, 100)) / 1000;
          scrollPosRef.current += speed;

          // Se passar do Set 2 para o Set 3, reposiciona imperceptivelmente de volta ao Set 2
          if (scrollPosRef.current >= cycleWidth * 2) {
            scrollPosRef.current -= cycleWidth;
          }

          container.scrollLeft = scrollPosRef.current;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [row1Items]);

  // Interação por toque (Touch / Mobile)
  const handleTouchStart = () => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleTouchEnd = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollPosRef.current = scrollContainerRef.current.scrollLeft;
      }
      isInteractingRef.current = false;
    }, 2200);
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const currentScroll = container.scrollLeft;

    if (isInteractingRef.current) {
      scrollPosRef.current = currentScroll;
      const cycleWidth = getCycleWidth();
      if (cycleWidth > 0) {
        if (currentScroll >= cycleWidth * 2) {
          container.scrollLeft = currentScroll - cycleWidth;
          scrollPosRef.current = container.scrollLeft;
        } else if (currentScroll < cycleWidth * 0.5) {
          container.scrollLeft = currentScroll + cycleWidth;
          scrollPosRef.current = container.scrollLeft;
        }
      }
    }
  };

  // Interação por mouse no desktop (hover e drag)
  const handleMouseEnter = () => {
    isPausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleMouseUp();
      return;
    }
    isPausedRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    dragStartXRef.current = e.pageX;
    dragStartScrollRef.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - dragStartXRef.current) * 1.2;
    scrollContainerRef.current.scrollLeft = dragStartScrollRef.current - walk;
    scrollPosRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollPosRef.current = scrollContainerRef.current.scrollLeft;
      }
      isInteractingRef.current = false;
    }, 2000);
  };

  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-6 sm:py-8" data-widget-id={widgetId}>
      {/* Header Centralizado */}
      <div className="mb-6 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#E2091E]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[0, 1, 2, 3, 4].map((s) => (
              <Star className="size-3.5 fill-amber-400 text-amber-400" key={s} />
            ))}
          </div>
          <span className="font-bold text-slate-800">{ratingSummary}</span>
          <span className="text-slate-300">·</span>
          <span>{totalReviewsLabel}</span>
        </div>
      </div>

      {/* Versão Mobile (<sm): Mosaico em 2 Linhas com Deslizamento Contínuo e Arraste por Toque */}
      <div className="relative sm:hidden">
        {/* Gradientes laterais para suavizar as bordas */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--cn-bg,#f4f7fb)] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--cn-bg,#f4f7fb)] to-transparent z-10" />

        <div
          ref={scrollContainerRef}
          className="relative -mx-4 overflow-x-auto no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing select-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          aria-label="Depoimentos do Google em carrossel contínuo móvel"
        >
          <div className="flex flex-col gap-3 px-4 w-max py-1">
            {/* Linha 1 */}
            <div className="flex gap-3">
              <div ref={set1Ref} className="flex gap-3 shrink-0">
                {row1Items.map((item, idx) => (
                  <TestimonialCard
                    key={`r1-s1-${item.id || idx}`}
                    item={item}
                    className="w-[275px] h-[142px] shrink-0"
                  />
                ))}
              </div>
              <div className="flex gap-3 shrink-0">
                {row1Items.map((item, idx) => (
                  <TestimonialCard
                    key={`r1-s2-${item.id || idx}`}
                    item={item}
                    className="w-[275px] h-[142px] shrink-0"
                  />
                ))}
              </div>
              <div className="flex gap-3 shrink-0">
                {row1Items.map((item, idx) => (
                  <TestimonialCard
                    key={`r1-s3-${item.id || idx}`}
                    item={item}
                    className="w-[275px] h-[142px] shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Linha 2 com deslocamento (pl-8) para efeito mosaico */}
            <div className="flex gap-3 pl-8">
              <div className="flex gap-3 shrink-0">
                {row2Items.map((item, idx) => (
                  <TestimonialCard
                    key={`r2-s1-${item.id || idx}`}
                    item={item}
                    className="w-[275px] h-[142px] shrink-0"
                  />
                ))}
              </div>
              <div className="flex gap-3 shrink-0">
                {row2Items.map((item, idx) => (
                  <TestimonialCard
                    key={`r2-s2-${item.id || idx}`}
                    item={item}
                    className="w-[275px] h-[142px] shrink-0"
                  />
                ))}
              </div>
              <div className="flex gap-3 shrink-0">
                {row2Items.map((item, idx) => (
                  <TestimonialCard
                    key={`r2-s3-${item.id || idx}`}
                    item={item}
                    className="w-[275px] h-[142px] shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Versão Desktop (sm+): Grid de 10 Depoimentos (2 linhas de 5 colunas) */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {items.map((item, idx) => (
          <TestimonialCard key={item.id || idx} item={item} />
        ))}
      </div>
    </section>
  );
}
