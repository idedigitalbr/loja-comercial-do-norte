import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import type { CategoryGridProps, WidgetContextData } from '@/lib/storefront/widget-types';
import type { ApiCategory } from '@/lib/types';

export function CategoryGridWidget({
  title,
  subtitle,
  viewAllLink = '/loja',
  columns = 4,
  maxItems = 8,
  contextData,
}: CategoryGridProps & { contextData?: WidgetContextData }) {
  const allCategories = contextData?.categories ?? [];
  const rootCategories = allCategories.filter((c) => !c.parentId).slice(0, maxItems);

  if (rootCategories.length === 0) return null;

  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
  }[columns];

  return (
    <section aria-label={title} className="cn-container py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {viewAllLink ? (
          <Link
            className="inline-flex items-center gap-1 text-sm font-bold text-brand transition hover:text-brand-hover hover:underline"
            href={viewAllLink}
          >
            <span>Ver departamentos</span>
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className={`mt-6 grid gap-3 sm:gap-4 ${colClasses}`}>
        {rootCategories.map((category: ApiCategory) => (
          <Link
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-card"
            href={`/categoria/${category.slug}`}
            key={category.id}
          >
            <div>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Layers aria-hidden className="size-5" />
              </div>
              <h3 className="text-base font-bold text-ink transition-colors group-hover:text-brand">
                {category.name}
              </h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-muted">
              <span>{category.children?.length ? `${category.children.length} subcategorias` : 'Explorar'}</span>
              <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
