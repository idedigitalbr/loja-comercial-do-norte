import React from 'react';
import { BannerGridWidget } from '@/components/storefront/widgets/banner-grid/banner-grid';
import { BenefitsBarWidget } from '@/components/storefront/widgets/benefits-bar/benefits-bar';
import { CategoryGridWidget } from '@/components/storefront/widgets/category-grid/category-grid';
import { ContainedHeroWidget } from '@/components/storefront/widgets/contained-hero/contained-hero';
import { EventsCarouselWidget } from '@/components/storefront/widgets/events-carousel/events-carousel';
import { HeroCarouselWidget } from '@/components/storefront/widgets/hero-carousel/hero-carousel';
import { InstagramFeedWidget } from '@/components/storefront/widgets/instagram-feed/instagram-feed';
import { ProductCarouselWidget } from '@/components/storefront/widgets/product-carousel/product-carousel';
import { PromoStripWidget } from '@/components/storefront/widgets/promo-strip/promo-strip';
import { QuoteStepsBannerWidget } from '@/components/storefront/widgets/quote-steps-banner/quote-steps-banner';
import { SegmentsCarouselWidget } from '@/components/storefront/widgets/segments-carousel/segments-carousel';
import { StoreLocationsMapWidget } from '@/components/storefront/widgets/store-locations-map/store-locations-map';
import { TestimonialsGridWidget } from '@/components/storefront/widgets/testimonials-grid/testimonials-grid';
import { VideoArticlesCarouselWidget } from '@/components/storefront/widgets/video-articles-carousel/video-articles-carousel';
import type { PageComposition, WidgetConfig, WidgetContextData } from './widget-types';

export function renderWidget(widget: WidgetConfig, contextData: WidgetContextData): React.ReactNode {
  if (!widget.enabled) return null;

  switch (widget.type) {
    case 'hero-carousel':
      return <HeroCarouselWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'contained-hero':
      return <ContainedHeroWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'benefits-bar':
      return <BenefitsBarWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'product-carousel':
      return <ProductCarouselWidget contextData={contextData} key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'category-grid':
      return <CategoryGridWidget contextData={contextData} key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'banner-grid':
      return <BannerGridWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'quote-steps-banner':
      return <QuoteStepsBannerWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'segments-carousel':
      return <SegmentsCarouselWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'promo-strip':
      return <PromoStripWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'events-carousel':
      return <EventsCarouselWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'video-articles-carousel':
      return <VideoArticlesCarouselWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'instagram-feed':
      return <InstagramFeedWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'testimonials-grid':
      return <TestimonialsGridWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    case 'store-locations-map':
      return <StoreLocationsMapWidget key={widget.id} widgetId={widget.id} {...widget.props} />;
    default:
      return null;
  }
}

export interface PageRendererProps {
  composition: PageComposition;
  contextData: WidgetContextData;
}

export function PageRenderer({ composition, contextData }: PageRendererProps) {
  const sortedWidgets = [...composition.widgets]
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-0">
      {sortedWidgets.map((widget) => renderWidget(widget, contextData))}
    </div>
  );
}
