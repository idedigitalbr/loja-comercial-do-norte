'use client';

import Link from 'next/link';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import type { ProductCarouselProps, WidgetContextData } from '@/lib/storefront/widget-types';

export function ProductCarouselWidget({
  title,
  subtitle,
  badge,
  viewAllLink = '/loja',
  source = 'offers',
  limit = 8,
  contextData,
}: ProductCarouselProps & { contextData?: WidgetContextData }) {
  const items =
    source === 'offers'
      ? contextData?.offers && contextData.offers.length > 0
        ? contextData.offers
        : contextData?.products ?? []
      : contextData?.products ?? [];

  const displayItems = items.slice(0, limit);

  if (displayItems.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          {badge ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-promo-soft px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-promo">
              <Flame aria-hidden className="size-3.5" />
              {badge}
            </span>
          ) : null}
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {viewAllLink ? (
          <Link
            className="inline-flex items-center gap-1 text-sm font-bold text-brand transition hover:text-brand-hover hover:underline"
            href={viewAllLink}
          >
            <span>Ver todos</span>
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {displayItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
