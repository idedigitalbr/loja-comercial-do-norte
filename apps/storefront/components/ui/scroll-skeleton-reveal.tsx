'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { WidgetType } from '@/lib/storefront/widget-types';

/**
 * Bloco base de Skeleton estilo shadcn/ui:
 * Cor cinza sólida plana (#E2E8F0), cantos arredondados e animação clássica de pulso suave.
 * Zero gradientes, zero listras, 100% limpo e elegante.
 */
export function SkeletonBlock({
  className = '',
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md ${dark ? 'cn-skeleton-dark' : 'cn-skeleton'} ${className}`}
    />
  );
}

/**
 * Skeleton fiel ao ProductCard (Card branco com borda sutil, sombra limpa e elementos em cinza plano shadcn)
 */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full flex-col rounded-[14px] border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.07)]"
    >
      {/* Badge + Favorito no topo */}
      <div className="mb-2 flex items-center justify-between">
        <SkeletonBlock className="h-4 w-14 rounded-full" />
        <SkeletonBlock className="size-6 rounded-full" />
      </div>

      {/* Área da foto 4:3 */}
      <SkeletonBlock className="aspect-[4/3] w-full rounded-xl" />

      {/* Título em 2 linhas */}
      <div className="mt-3 space-y-1.5">
        <SkeletonBlock className="h-3.5 w-full rounded-md" />
        <SkeletonBlock className="h-3.5 w-4/5 rounded-md" />
      </div>

      {/* Estrelas */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <SkeletonBlock className="h-3 w-20 rounded-md" />
        <SkeletonBlock className="h-3 w-10 rounded-md" />
      </div>

      {/* Preço e nota de atacado */}
      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
        <SkeletonBlock className="h-2.5 w-16 rounded-md" />
        <SkeletonBlock className="h-5 w-28 rounded-md" />
        <SkeletonBlock className="h-3 w-full rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton específico para cada tipo de seção da Home:
 * Containers brancos com borda e sombra idênticos aos widgets finais, com blocos cinzas estilo shadcn/ui.
 */
export function WidgetSectionSkeleton({
  widgetType,
  variant,
}: {
  widgetType: WidgetType;
  variant?: string;
}) {
  switch (widgetType) {
    case 'hero-carousel':
      return (
        <div aria-hidden="true" className="w-full overflow-hidden">
          <SkeletonBlock className="h-[220px] sm:h-[340px] lg:h-[420px] w-full rounded-none" />
        </div>
      );

    case 'contained-hero':
      return (
        <div aria-hidden="true" className="cn-container py-3 sm:py-4">
          <SkeletonBlock className="h-[190px] sm:h-[290px] lg:h-[360px] w-full rounded-2xl" />
        </div>
      );

    case 'category-grid':
      return (
        <div aria-hidden="true" className="cn-container py-3 sm:py-4">
          <div className="no-scrollbar -mx-4 flex flex-nowrap items-start gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0 sm:gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                className={`flex w-[76px] shrink-0 flex-col items-center gap-2 sm:w-auto sm:shrink ${
                  i >= 4 ? 'hidden sm:flex' : 'flex'
                }`}
                key={i}
              >
                <div className="flex size-[64px] sm:size-[74px] shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs">
                  <SkeletonBlock className="size-full rounded-xl" />
                </div>
                <SkeletonBlock className="h-3 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'product-carousel':
      if (variant === 'split-banner') {
        return (
          <div aria-hidden="true" className="cn-container py-3 sm:py-5">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Banner lateral esquerdo */}
                <div className="lg:col-span-3">
                  <SkeletonBlock className="h-[240px] lg:h-full min-h-[320px] w-full rounded-2xl" />
                </div>
                {/* 3 Cards de produtos à direita */}
                <div className="lg:col-span-9 flex flex-col justify-between">
                  <div className="mb-4 flex items-center justify-between">
                    <SkeletonBlock className="h-7 w-48 rounded-lg" />
                    <SkeletonBlock className="h-5 w-24 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <div className="hidden sm:block">
                      <ProductCardSkeleton />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div aria-hidden="true" className="cn-container py-3 sm:py-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
            {/* Header da vitrine */}
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-6 w-44 rounded-lg" />
                <SkeletonBlock className="h-1.5 w-20 rounded-full" />
              </div>
              <SkeletonBlock className="h-5 w-24 rounded-full" />
            </div>

            {/* Grade de 5 colunas no desktop / 2x2 no mobile */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3.5">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <div className="hidden sm:block">
                <ProductCardSkeleton />
              </div>
              <div className="hidden lg:block">
                <ProductCardSkeleton />
              </div>
              <div className="hidden lg:block">
                <ProductCardSkeleton />
              </div>
            </div>

            {/* Pílula inferior */}
            <div className="mt-4 flex justify-center">
              <SkeletonBlock className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      );

    case 'banner-grid':
      return (
        <div aria-hidden="true" className="cn-container py-3 sm:py-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 sm:gap-4">
              <SkeletonBlock className="aspect-[16/9] w-full rounded-xl" />
              <SkeletonBlock className="hidden md:block aspect-[16/9] w-full rounded-xl" />
              <SkeletonBlock className="hidden md:block aspect-[16/9] w-full rounded-xl" />
            </div>
            <div className="mt-3.5 flex justify-center">
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      );

    case 'brands-carousel':
      return (
        <div aria-hidden="true" className="cn-container py-4 sm:py-6">
          <div className="relative">
            <div className="mb-5 sm:mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <SkeletonBlock className="size-8 rounded-lg" />
                <div className="h-8 w-px bg-slate-300/80" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-6 w-48 rounded-lg" />
                  <SkeletonBlock className="h-3.5 w-64 rounded-md" />
                </div>
              </div>
              <SkeletonBlock className="h-10 w-44 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6 sm:gap-4 lg:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  className={`aspect-square w-full rounded-full border border-slate-200/80 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.06)] flex items-center justify-center ${
                    i >= 3 ? 'hidden md:flex' : 'flex'
                  }`}
                  key={i}
                >
                  <SkeletonBlock className="size-3/4 rounded-full" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <SkeletonBlock className="size-2.5 rounded-full" />
              <SkeletonBlock className="size-2.5 rounded-full" />
              <SkeletonBlock className="size-2.5 rounded-full" />
            </div>
          </div>
        </div>
      );

    case 'segments-carousel':
      return (
        <div aria-hidden="true" className="w-full py-3 sm:py-5">
          <div className="cn-container">
            <div className="rounded-[28px] bg-[#071A3E] p-6 sm:p-8 lg:p-10 shadow-xl">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-36 rounded-md" dark />
                  <SkeletonBlock className="h-8 w-64 rounded-lg" dark />
                </div>
                <div className="flex gap-2.5">
                  <SkeletonBlock className="h-10 w-40 rounded-xl" dark />
                  <SkeletonBlock className="h-10 w-40 rounded-xl" dark />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock
                    className={`h-[290px] w-full rounded-2xl ${i >= 1 ? 'hidden sm:block' : ''} ${
                      i >= 2 ? 'sm:hidden lg:block' : ''
                    }`}
                    dark
                    key={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'promo-strip':
      return (
        <div aria-hidden="true" className="cn-container py-2.5 sm:py-3.5">
          <SkeletonBlock className="h-20 sm:h-28 w-full rounded-2xl" />
        </div>
      );

    case 'video-articles-carousel':
      return (
        <div aria-hidden="true" className="cn-container py-3 sm:py-5">
          <div className="rounded-[26px] border border-slate-200/90 bg-white p-5 sm:p-7 shadow-[0_4px_20px_rgba(15,23,42,0.06)] flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="w-full lg:w-1/3 space-y-3">
              <SkeletonBlock className="h-8 w-48 rounded-lg" />
              <SkeletonBlock className="h-4 w-64 rounded-md" />
              <SkeletonBlock className="h-4 w-52 rounded-md" />
            </div>
            <div className="w-full lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3 shadow-xs space-y-2.5">
                <SkeletonBlock className="aspect-video w-full rounded-xl" />
                <SkeletonBlock className="h-4 w-3/4 rounded-md" />
                <SkeletonBlock className="h-3 w-1/2 rounded-md" />
              </div>
              <div className="hidden sm:block rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3 shadow-xs space-y-2.5">
                <SkeletonBlock className="aspect-video w-full rounded-xl" />
                <SkeletonBlock className="h-4 w-3/4 rounded-md" />
                <SkeletonBlock className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'events-carousel':
      return (
        <div aria-hidden="true" className="w-full py-3 sm:py-5">
          <div className="rounded-[28px] sm:rounded-[36px] bg-[#060709] py-10 sm:py-14">
            <div className="cn-container">
              <div className="mb-8 flex items-end justify-between">
                <div className="space-y-2">
                  <SkeletonBlock className="h-5 w-36 rounded-md" dark />
                  <SkeletonBlock className="h-8 w-72 rounded-lg" dark />
                </div>
                <SkeletonBlock className="h-9 w-40 rounded-xl" dark />
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock className="aspect-[9/16] w-full rounded-2xl" dark key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'instagram-feed':
      return (
        <div aria-hidden="true" className="cn-container py-4 sm:py-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-end justify-between">
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-36 rounded-md" />
                <SkeletonBlock className="h-7 w-80 max-w-full rounded-lg" />
              </div>
              <SkeletonBlock className="h-9 w-36 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock className="aspect-[9/16] w-full rounded-xl" key={i} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'testimonials-grid':
      return (
        <div aria-hidden="true" className="cn-container py-6 sm:py-8">
          <div className="mb-6 flex flex-col items-center space-y-2">
            <SkeletonBlock className="h-3.5 w-40 rounded-full" />
            <SkeletonBlock className="h-8 w-80 max-w-full rounded-lg" />
            <SkeletonBlock className="h-4 w-64 rounded-md" />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                className={`rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-[0_2px_10px_rgba(15,23,42,0.06)] ${
                  i >= 2 ? 'hidden lg:block' : ''
                }`}
                key={i}
              >
                <div className="flex items-center gap-2.5">
                  <SkeletonBlock className="size-8 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <SkeletonBlock className="h-3 w-24 rounded-md" />
                    <SkeletonBlock className="h-2.5 w-16 rounded-md" />
                  </div>
                </div>
                <SkeletonBlock className="h-3 w-20 rounded-md" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-2.5 w-full rounded-md" />
                  <SkeletonBlock className="h-2.5 w-5/6 rounded-md" />
                  <SkeletonBlock className="h-2.5 w-4/6 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'store-locations-map':
      return (
        <div aria-hidden="true" className="w-full pt-4">
          <div className="rounded-t-[32px] bg-[#0B0C10] pb-12 pt-10">
            <div className="cn-container">
              <div className="mb-8 flex flex-col items-center space-y-2">
                <SkeletonBlock className="h-4 w-44 rounded-md" dark />
                <SkeletonBlock className="h-8 w-64 rounded-lg" dark />
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="flex flex-col gap-3 lg:col-span-5">
                  <SkeletonBlock className="h-11 w-full rounded-xl" dark />
                  <SkeletonBlock className="h-32 w-full rounded-2xl" dark />
                  <SkeletonBlock className="h-32 w-full rounded-2xl" dark />
                  <SkeletonBlock className="h-32 w-full rounded-2xl" dark />
                </div>
                <div className="lg:col-span-7">
                  <SkeletonBlock className="h-[420px] lg:h-full min-h-[420px] w-full rounded-2xl" dark />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div aria-hidden="true" className="cn-container py-4">
          <SkeletonBlock className="h-48 w-full rounded-2xl" />
        </div>
      );
  }
}

/**
 * Wrapper de Scroll com Skeleton Shadcn -> Revelação Suave e Rápida
 */
export function ScrollSkeletonSection({
  children,
  widgetType,
  variant,
  index,
  disabled = false,
  skeletonDurationMs = 280,
}: {
  children: React.ReactNode;
  widgetType: WidgetType;
  variant?: string;
  index: number;
  disabled?: boolean;
  skeletonDurationMs?: number;
}) {
  // Apenas a 1ª seção (Hero principal) inicia aberta; as demais carregam com Skeleton no scroll
  const isAboveFold = index < 1;

  const [phase, setPhase] = useState<'idle' | 'skeleton' | 'revealed'>(() =>
    disabled || isAboveFold ? 'revealed' : 'idle',
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || isAboveFold) {
      setPhase('revealed');
      return;
    }

    if (typeof window === 'undefined') return;

    try {
      if (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        setPhase('revealed');
        return;
      }
    } catch {}

    if (typeof window.IntersectionObserver !== 'function') {
      setPhase('revealed');
      return;
    }

    const el = containerRef.current;
    if (!el) {
      setPhase('revealed');
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          observer.disconnect();
          setPhase('skeleton');
          timer = setTimeout(() => {
            setPhase('revealed');
          }, skeletonDurationMs);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05,
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [disabled, isAboveFold, skeletonDurationMs]);

  if (disabled) {
    return <>{children}</>;
  }

  const isRevealed = phase === 'revealed';

  return (
    <div
      className="relative"
      data-scroll-phase={phase}
      ref={containerRef}
    >
      {!isRevealed && (
        <div
          aria-hidden="true"
          className="pointer-events-none select-none transition-opacity duration-200 ease-out"
          data-testid={`section-skeleton-${widgetType}`}
        >
          <WidgetSectionSkeleton variant={variant} widgetType={widgetType} />
        </div>
      )}

      <div
        className={
          isRevealed
            ? 'animate-cn-section-reveal'
            : 'sr-only opacity-0 pointer-events-none'
        }
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Componente genérico para blocos de posts, eventos e seções internas
 */
export function ScrollRevealBlock({
  children,
  className = '',
  delayMs = 0,
  skeleton,
  skeletonDurationMs = 240,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  skeleton?: React.ReactNode;
  skeletonDurationMs?: number;
}) {
  const [phase, setPhase] = useState<'idle' | 'skeleton' | 'revealed'>('idle');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        setPhase('revealed');
        return;
      }
    } catch {}

    if (typeof window.IntersectionObserver !== 'function') {
      setPhase('revealed');
      return;
    }

    const el = ref.current;
    if (!el) {
      setPhase('revealed');
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          observer.disconnect();
          if (skeleton) {
            setPhase('skeleton');
            timer = setTimeout(() => {
              setPhase('revealed');
            }, skeletonDurationMs);
          } else {
            setPhase('revealed');
          }
        }
      },
      {
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05,
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [skeleton, skeletonDurationMs]);

  const isRevealed = phase === 'revealed';

  return (
    <div className={`relative ${className}`} ref={ref}>
      {!isRevealed && skeleton ? (
        <div aria-hidden="true" className="pointer-events-none select-none">
          {skeleton}
        </div>
      ) : null}

      <div
        className={
          isRevealed
            ? 'animate-cn-section-reveal'
            : skeleton
              ? 'sr-only opacity-0 pointer-events-none'
              : 'opacity-0 translate-y-2 transition-all duration-300'
        }
        style={isRevealed && delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Item individual de produto no Catálogo estilo shadcn:
 * 1ª linha aparece direta, 2ª linha em diante carrega com Skeleton shadcn e transição limpa
 */
export function ScrollCatalogProductItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const isAboveFold = index < 4;
  const [phase, setPhase] = useState<'idle' | 'skeleton' | 'revealed'>(() =>
    isAboveFold ? 'revealed' : 'idle',
  );
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAboveFold) {
      setPhase('revealed');
      return;
    }

    if (typeof window === 'undefined') return;

    try {
      if (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        setPhase('revealed');
        return;
      }
    } catch {}

    if (typeof window.IntersectionObserver !== 'function') {
      setPhase('revealed');
      return;
    }

    const el = ref.current;
    if (!el) {
      setPhase('revealed');
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    const colIndex = index % 4;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          observer.disconnect();
          setPhase('skeleton');
          timer = setTimeout(() => {
            setPhase('revealed');
          }, 220 + colIndex * 40);
        }
      },
      {
        rootMargin: '0px 0px -20px 0px',
        threshold: 0.04,
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [index, isAboveFold]);

  const isRevealed = phase === 'revealed';
  const staggerDelay = isAboveFold ? (index % 4) * 35 : 0;

  return (
    <div className="relative h-full w-full" data-card-phase={phase} ref={ref}>
      {!isRevealed && (
        <div aria-hidden="true" className="pointer-events-none select-none">
          <ProductCardSkeleton />
        </div>
      )}

      <div
        className={
          isRevealed
            ? 'animate-cn-card-reveal h-full w-full'
            : 'sr-only opacity-0 pointer-events-none'
        }
        style={isRevealed && staggerDelay > 0 ? { animationDelay: `${staggerDelay}ms` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
