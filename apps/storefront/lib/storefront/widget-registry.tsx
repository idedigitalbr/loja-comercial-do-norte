import React from 'react';
import { BenefitsBarWidget } from '@/components/storefront/widgets/benefits-bar/benefits-bar';
import { CategoryGridWidget } from '@/components/storefront/widgets/category-grid/category-grid';
import { ContainedHeroWidget } from '@/components/storefront/widgets/contained-hero/contained-hero';
import { HeroCarouselWidget } from '@/components/storefront/widgets/hero-carousel/hero-carousel';
import { ProductCarouselWidget } from '@/components/storefront/widgets/product-carousel/product-carousel';
import type { PageComposition, WidgetConfig, WidgetContextData } from './widget-types';

export function renderWidget(widget: WidgetConfig, contextData: WidgetContextData): React.ReactNode {
  if (!widget.enabled) return null;

  switch (widget.type) {
    case 'hero-carousel':
      return <HeroCarouselWidget key={widget.id} {...widget.props} />;
    case 'contained-hero':
      return <ContainedHeroWidget key={widget.id} {...widget.props} />;
    case 'benefits-bar':
      return <BenefitsBarWidget key={widget.id} {...widget.props} />;
    case 'product-carousel':
      return <ProductCarouselWidget contextData={contextData} key={widget.id} {...widget.props} />;
    case 'category-grid':
      return <CategoryGridWidget contextData={contextData} key={widget.id} {...widget.props} />;
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
