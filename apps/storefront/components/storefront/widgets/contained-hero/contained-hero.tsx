"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InlineImageEditorOverlay } from "@/components/storefront/editor/inline-image-editor-overlay";
import { useElementor } from "@/components/storefront/editor/elementor-editor-context";
import type { ContainedHeroProps } from "@/lib/storefront/widget-types";

export function ContainedHeroWidget({
  widgetId,
  slides,
  autoplayIntervalMs = 6000,
  showArrows = true,
  showDots = true,
  overlapTop = true,
}: ContainedHeroProps) {
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
    <div
      className={`cn-container relative z-20 ${
        overlapTop
          ? "-mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 pb-6 sm:pb-8 md:pb-10"
          : "py-5 sm:py-6 md:py-8"
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="group relative w-full overflow-hidden rounded-2xl border border-white/25 bg-[#122347] shadow-2xl md:rounded-3xl">
        <div className="relative aspect-[2.8/1] min-h-[180px] w-full sm:aspect-[2.9/1] md:aspect-[3.1/1] md:min-h-[240px] lg:aspect-[3.2/1] lg:min-h-[270px] lg:max-h-[340px]">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                aria-hidden={!isActive}
                className={`group/slide absolute inset-0 transition-all duration-700 ease-in-out ${
                  isActive
                    ? "scale-100 opacity-100 z-10 pointer-events-auto"
                    : "scale-105 opacity-0 z-0 pointer-events-none"
                }`}
                key={slide.id}
              >
                {slide.linkUrl &&
                slide.linkUrl.trim() !== "" &&
                slide.linkUrl !== "#" ? (
                  <Link
                    aria-label={slide.title}
                    className="block size-full focus:outline-none cursor-pointer"
                    href={slide.linkUrl}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {/* eslint-disable-next-js/next/no-img-element */}
                    <img
                      alt={slide.altText}
                      className={`block size-full object-cover object-center transition-all duration-300 ${
                        isEditMode
                          ? "group-hover/slide:grayscale group-hover/slide:brightness-40"
                          : ""
                      }`}
                      decoding="async"
                      fetchPriority="auto"
                      height={1056}
                      loading={index === 0 ? "eager" : "lazy"}
                      src={slide.imageUrl}
                      width={4064}
                    />
                  </Link>
                ) : (
                  <div className="block size-full select-none cursor-default">
                    {/* eslint-disable-next-js/next/no-img-element */}
                    <img
                      alt={slide.altText}
                      className={`block size-full object-cover object-center transition-all duration-300 ${
                        isEditMode
                          ? "group-hover/slide:grayscale group-hover/slide:brightness-40"
                          : ""
                      }`}
                      decoding="async"
                      fetchPriority="auto"
                      height={1056}
                      loading={index === 0 ? "eager" : "lazy"}
                      src={slide.imageUrl}
                      width={4064}
                    />
                  </div>
                )}

                {/* ÍCONE DE TROCAR FOTO NO CENTRO DO BANNER (Minimalista, Dark, sem pontilhado) */}
                {isActive && (
                  <InlineImageEditorOverlay
                    currentImageUrl={slide.imageUrl}
                    currentLinkUrl={slide.linkUrl}
                    slideId={slide.id}
                    title={slide.title}
                    widgetId={widgetId || "hero-secundario-contido"}
                  />
                )}
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
              <ChevronLeft
                aria-hidden
                className="size-4 stroke-[2.5] sm:size-5"
              />
            </button>
            <button
              aria-label="Próximo slide de campanha"
              className="absolute right-2.5 top-1/2 z-20 hidden size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-promo active:scale-95 focus:outline-none sm:right-4 sm:size-10 md:flex md:right-6 md:size-11"
              onClick={nextSlide}
              type="button"
            >
              <ChevronRight
                aria-hidden
                className="size-4 stroke-[2.5] sm:size-5"
              />
            </button>
          </>
        ) : null}

        {/* Pontos de Paginação com Pílula Ativa (Padrão Canônico) */}
        {showDots && slides.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md sm:bottom-4">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  aria-label={`Ir para o slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                    isActive
                      ? "w-6 bg-[#E2091E] shadow-md"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                  key={slide.id}
                  onClick={() => setCurrentIndex(index)}
                  type="button"
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
