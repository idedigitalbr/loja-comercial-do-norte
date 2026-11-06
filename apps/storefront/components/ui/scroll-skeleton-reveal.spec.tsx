/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import {
  ProductCardSkeleton,
  ScrollCatalogProductItem,
  ScrollSkeletonSection,
  WidgetSectionSkeleton,
} from './scroll-skeleton-reveal';

describe('ScrollSkeletonSection & Fluid Scroll Animations', () => {
  let intersectionCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    intersectionCallback = null;

    class MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        intersectionCallback = cb;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds = [];
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reveals above-the-fold sections (index < 2) immediately without waiting for scroll', () => {
    render(
      <ScrollSkeletonSection index={0} widgetType="hero-carousel">
        <div data-testid="hero-content">Conteúdo Hero</div>
      </ScrollSkeletonSection>,
    );

    expect(screen.queryByTestId('section-skeleton-hero-carousel')).toBeNull();
    expect(screen.getByTestId('hero-content')).toBeDefined();
  });

  it('renders skeleton first for below-the-fold sections (index >= 2) and reveals smoothly when scrolled into view', () => {
    render(
      <ScrollSkeletonSection
        index={3}
        skeletonDurationMs={300}
        variant="standard-5col"
        widgetType="product-carousel"
      >
        <div data-testid="carousel-content">Produtos em Destaque</div>
      </ScrollSkeletonSection>,
    );

    // Antes do scroll: exibe o skeleton da seção
    expect(screen.getByTestId('section-skeleton-product-carousel')).toBeDefined();
    expect(screen.getByTestId('carousel-content')).toBeDefined();

    // Simula entrada na viewport durante o scroll
    act(() => {
      if (intersectionCallback) {
        intersectionCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }
    });

    // Durante a transição de skeleton (300ms): skeleton ainda visível
    expect(screen.getByTestId('section-skeleton-product-carousel')).toBeDefined();

    // Após completar o tempo do skeleton: revela o conteúdo real com animação fluida
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.queryByTestId('section-skeleton-product-carousel')).toBeNull();
    expect(screen.getByTestId('carousel-content')).toBeDefined();
  });

  it('renders skeletons for different widget types without errors', () => {
    const types = [
      'hero-carousel',
      'contained-hero',
      'category-grid',
      'product-carousel',
      'banner-grid',
      'brands-carousel',
      'segments-carousel',
      'promo-strip',
      'video-articles-carousel',
      'events-carousel',
      'instagram-feed',
      'testimonials-grid',
      'store-locations-map',
    ] as const;

    types.forEach((type) => {
      const { unmount } = render(<WidgetSectionSkeleton widgetType={type} />);
      unmount();
    });

    const { unmount: unmountCard } = render(<ProductCardSkeleton />);
    unmountCard();
  });

  it('animates catalog product items on scroll after the first 8 items', () => {
    render(
      <ScrollCatalogProductItem index={10}>
        <div data-testid="catalog-card">Card 10</div>
      </ScrollCatalogProductItem>,
    );

    // Simula scroll até o card
    act(() => {
      if (intersectionCallback) {
        intersectionCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }
    });

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(screen.getByTestId('catalog-card')).toBeDefined();
  });
});
