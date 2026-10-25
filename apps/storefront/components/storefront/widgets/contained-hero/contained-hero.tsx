'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { ContainedHeroProps } from '@/lib/storefront/widget-types';

export function ContainedHeroWidget({
  slides,
  autoplayIntervalMs = 6000,
  showArrows = true,
  showDots = true,
  overlapTop = true,
}: ContainedHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(nextSlide, autoplayIntervalMs);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoplayIntervalMs, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className={`cn-container relative z-20 pb-6 sm:pb-8 md:pb-10 ${
        overlapTop ? '-mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20' : ''
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="group relative w-full overflow-hidden rounded-2xl border border-white/25 bg-[#122347] shadow-2xl md:rounded-3xl">
        <div className="relative aspect-[2.4/1] min-h-[160px] w-full sm:aspect-[2.8/1] md:aspect-[3.2/1] md:min-h-[240px] lg:aspect-[3.6/1] lg:min-h-[300px] lg:max-h-[460px]">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isActive
                    ? 'scale-100 opacity-100 z-10 pointer-events-auto'
                    : 'scale-105 opacity-0 z-0 pointer-events-none'
                }`}
                key={slide.id}
              >
                <Link
                  aria-label={slide.title}
                  className="block size-full focus:outline-none"
                  href={slide.linkUrl}
                  tabIndex={isActive ? 0 : -1}
                >
                  <img
                    alt={slide.altText}
                    className="block size-full object-cover object-center"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    height={1056}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    src={slide.imageUrl}
                    width={4064}
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Setas Laterais Translúcidas Escuras (Fidelidade à Referência) */}
        {showArrows && slides.length > 1 ? (
          <>
            <button
              aria-label="Slide anterior de campanha"
              className="absolute left-2.5 top-1/2 z-20 hidden size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-promo active:scale-95 focus:outline-none sm:left-4 sm:size-10 md:flex md:left-6 md:size-11"
              onClick={prevSlide}
              type="button"
            >
              <ChevronLeft aria-hidden className="size-4 stroke-[2.5] sm:size-5" />
            </button>
            <button
              aria-label="Próximo slide de campanha"
              className="absolute right-2.5 top-1/2 z-20 hidden size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-promo active:scale-95 focus:outline-none sm:right-4 sm:size-10 md:flex md:right-6 md:size-11"
              onClick={nextSlide}
              type="button"
            >
              <ChevronRight aria-hidden className="size-4 stroke-[2.5] sm:size-5" />
            </button>
          </>
        ) : null}

        {/* Indicador de Pontos com Logo e Badge Comercial do Norte */}
        {showDots && slides.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 shadow-xl backdrop-blur-md sm:bottom-4 md:bottom-5">
            <div className="flex items-center gap-1 border-r border-white/20 pr-1.5">
              <span className="flex size-3.5 items-center justify-center rounded-full border-2 border-white">
                <span className="size-1.5 rounded-full bg-promo" />
              </span>
              <span className="hidden text-[10px] font-bold tracking-tight text-white/80 sm:inline">
                comercial
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {slides.map((slide, idx) => (
                <button
                  aria-label={`Ir para campanha ${idx + 1}`}
                  className={`size-2 rounded-full transition-all duration-300 sm:size-2.5 ${
                    idx === currentIndex
                      ? 'bg-promo shadow-xs scale-125'
                      : 'bg-white/40 hover:bg-white'
                  }`}
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  type="button"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
