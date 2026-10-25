'use client';

import React from 'react';
import { Star } from 'lucide-react';
import type { TestimonialsGridProps } from '@/lib/storefront/widget-types';

export function TestimonialsGridWidget({
  eyebrow = 'AVALIAÇÕES NO GOOGLE',
  title = 'O que nossos clientes dizem no Google.',
  ratingSummary = 'Classificação 4.8 de 5.0 estrelas',
  totalReviewsLabel = 'Um bloco com mais de 2 mil avaliações',
  items = [],
}: TestimonialsGridProps) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-label={title} className="cn-container py-6 sm:py-8">
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

      {/* Grid de 10 Depoimentos (2 linhas de 5 colunas no desktop) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {items.map((item, idx) => (
          <article
            className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:shadow-md"
            key={item.id || idx}
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
              <div className="mt-2.5 flex items-center gap-1.5">
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
              <p className="mt-2 line-clamp-4 text-[11px] leading-relaxed text-slate-600">
                “{item.text}”
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
