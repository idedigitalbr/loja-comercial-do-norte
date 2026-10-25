'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import type { HeroCarouselProps } from '@/lib/storefront/widget-types';

export function HeroCarouselWidget({
  widgetId,
  slides,
  autoplayIntervalMs = 5000,
  showArrows = true,
  showDots = true,
  bottomGradient = true,
}: HeroCarouselProps) {
  const { isEditing, previewMode } = useElementor();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isEditMode = isEditing && !previewMode;

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
    <section
      aria-label="Carrossel Principal de Banners"
      className="relative w-full overflow-hidden select-none bg-[#EBEBEB]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: slides[currentIndex]?.backgroundColor ?? '#028F34' }}
      >
        <div className="relative w-full h-[180px] sm:h-[240px] md:h-[280px] lg:h-[300px] xl:h-[340px]">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                aria-hidden={!isActive}
                className={`group/slide absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
                key={slide.id}
              >
                <Link
                  aria-label={slide.title}
                  className="block size-full focus:outline-none"
                  href={slide.linkUrl}
                  tabIndex={isActive ? 0 : -1}
                >
                  {/* eslint-disable-next-js/next/no-img-element */}
                  <img
                    alt={slide.altText}
                    className={`block size-full object-cover object-center transition-all duration-300 ${
                      isEditMode ? 'group-hover/slide:grayscale group-hover/slide:brightness-40' : ''
                    }`}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    height={500}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    src={slide.imageUrl}
                    width={1920}
                  />
                </Link>

                {/* ÍCONE DE TROCAR FOTO NO CENTRO DA IMAGEM (Minimalista, Dark, sem pontilhado) */}
                {isActive && (
                  <InlineImageEditorOverlay
                    currentImageUrl={slide.imageUrl}
                    currentLinkUrl={slide.linkUrl}
                    slideId={slide.id}
                    title={slide.title}
                    widgetId={widgetId || 'ml-hero-superior'}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Setas Laterais de Navegação Estilo Mercado Livre */}
        {showArrows && slides.length > 1 ? (
          <>
            <button
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white text-header-blue shadow-lg transition-all duration-200 hover:scale-110 hover:text-promo focus:outline-none sm:left-4 sm:size-11 md:left-6 md:size-12"
              onClick={prevSlide}
              type="button"
            >
              <ChevronLeft aria-hidden className="size-5 stroke-[2.5] sm:size-6" />
            </button>
            <button
              aria-label="Próximo slide"
              className="absolute right-2 top-1/2 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white text-header-blue shadow-lg transition-all duration-200 hover:scale-110 hover:text-promo focus:outline-none sm:right-4 sm:size-11 md:right-6 md:size-12"
              onClick={nextSlide}
              type="button"
            >
              <ChevronRight aria-hidden className="size-5 stroke-[2.5] sm:size-6" />
            </button>
          </>
        ) : null}

        {/* Pontos de Paginação com Pílula Ativa */}
        {showDots && slides.length > 1 ? (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-8">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  aria-label={`Ir para o slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                    isActive ? 'w-6 bg-white shadow-md' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  key={slide.id}
                  onClick={() => setCurrentIndex(index)}
                  type="button"
                />
              );
            })}
          </div>
        ) : null}

        {/* FAIXA DEGRADÊ SUAVE INFERIOR */}
        {bottomGradient ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 bg-gradient-to-t from-[#EBEBEB] to-transparent sm:h-12 md:h-14"
          />
        ) : null}
      </div>
    </section>
  );
}
