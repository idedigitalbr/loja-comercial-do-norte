'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { VideoArticlesCarouselProps } from '@/lib/storefront/widget-types';

export function VideoArticlesCarouselWidget({ widgetId, title = 'Explica Aí Nort', subtitle = 'Dicas em vídeos e artigos para você usar no seu negócio.', viewAllLabel = 'Ver todos', viewAllUrl = '/loja', items = [] }: VideoArticlesCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  if (!items.length) return null;
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    element.scrollBy({ left: direction * ((card?.offsetWidth ?? element.clientWidth) + 24), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return (
    <section aria-label={title} className="cn-container py-4 sm:py-6">
      <div className="relative isolate overflow-hidden rounded-3xl bg-[#b40016] py-7 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_0%,#ef002b_0%,transparent_55%),linear-gradient(135deg,transparent_55%,#e60024_55%,#990010_85%)]" />
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
            <p className="mt-1 text-base leading-snug text-[#ff8d98] sm:text-xl lg:text-2xl">{subtitle}</p>
            <div aria-hidden="true" className="mt-4 h-1.5 w-36 bg-[#004cb1] sm:w-48" />
          </div>
          <Link className="inline-flex items-center gap-1 text-sm font-bold text-white underline-offset-4 hover:underline" href={viewAllUrl}>{viewAllLabel}<ChevronRight aria-hidden="true" className="size-4" /></Link>
        </div>
        <div className="relative">
          <div ref={track} aria-label="Dicas e artigos" className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8" onScroll={(event) => { const element = event.currentTarget; setEdges({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 }); }} tabIndex={0}>
            {items.map((item, index) => (
              <article key={item.id} className="relative flex w-[94%] shrink-0 snap-start scroll-ml-5 flex-col rounded-[22px] bg-white p-2 shadow-[-9px_9px_0_#ff0750] sm:w-[82%] sm:scroll-ml-8 sm:flex-row lg:w-[45%]">
                <div className="group relative aspect-[4/3] shrink-0 overflow-hidden rounded-[18px] bg-slate-100 sm:aspect-auto sm:w-[51%]">
                  <Image alt={item.title} className="h-full w-full object-cover object-top sm:absolute sm:inset-0" height={960} width={720} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 90vw" src={item.imageUrl} />
                  <Link href={item.ctaUrl || '/loja'} aria-label={`Ver completo: ${item.title}`} className="absolute inset-0 flex items-center justify-center bg-black/5"><span className="flex size-16 items-center justify-center rounded-full bg-[#ff102b] text-white shadow-lg transition-transform group-hover:scale-105 sm:size-20"><Play aria-hidden="true" className="ml-1 size-8 fill-current" /></span></Link>
                  {widgetId ? <InlineImageEditorOverlay canAdd={false} canRemove={false} currentLinkUrl={item.ctaUrl} fieldPath={`items.${index}.imageUrl`} linkFieldPath={`items.${index}.ctaUrl`} previewUrl={item.imageUrl} slideIndex={index} title={`Vídeo/Artigo: ${item.title}`} widgetId={widgetId} /> : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-6 sm:min-h-[360px] sm:px-5 sm:py-8 xl:min-h-[400px] xl:px-7">
                  <div className="mb-3 flex flex-wrap gap-1.5">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-[#ffdade] px-2.5 py-1 text-[10px] font-bold uppercase leading-none text-[#e2091e]">{tag}</span>)}</div>
                  <h3 className="text-xl font-bold leading-[1.12] tracking-tight text-[#0b234b]">{item.title}</h3>
                  <div className="mt-3 space-y-3 text-sm leading-snug text-[#63718a]">{item.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
                  <Link className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#ff1633] px-2 py-2 text-sm font-bold text-[#e2091e] transition-colors hover:bg-red-50" href={item.ctaUrl || '/loja'}>{item.ctaLabel || 'Ver Completo'}<ChevronRight aria-hidden="true" className="size-4" /></Link>
                </div>
              </article>
            ))}
          </div>
          {items.length > 1 && <>
            <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#b40016] to-transparent transition-opacity sm:w-[18%] ${edges.end ? 'opacity-0' : 'opacity-100'}`} />
            <button aria-label="Dica anterior" disabled={edges.start} onClick={() => move(-1)} type="button" className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#e2091e] shadow-lg disabled:hidden sm:left-4 sm:size-14"><ChevronLeft aria-hidden="true" /></button>
            <button aria-label="Próxima dica" disabled={edges.end} onClick={() => move(1)} type="button" className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#e2091e] shadow-lg disabled:hidden sm:right-5 sm:size-16"><ChevronRight aria-hidden="true" className="size-7" /></button>
          </>}
        </div>
      </div>
    </section>
  );
}

