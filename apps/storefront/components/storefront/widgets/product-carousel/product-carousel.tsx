'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import { InlineImageEditorOverlay } from '@/components/storefront/editor/inline-image-editor-overlay';
import type { ProductCarouselProps, WidgetContextData } from '@/lib/storefront/widget-types';
import type { ApiProduct } from '@/lib/types';

const FALLBACK_CATALOG_PRODUCTS: ApiProduct[] = [
  {
    id: 'fallback-prod-1',
    publicId: 'fallback-prod-1',
    name: 'Prato Descartável Raso Branco 15cm Pct c/ 10 un - Copobras',
    slug: 'prato-descartavel-raso-branco-15cm',
    description: 'Prato descartável resistente para festas, eventos e lanchonetes.',
    status: 'ACTIVE',
    brand: { id: 'b1', name: 'Copobras', slug: 'copobras' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img1', path: '/assets/home-ref/prod-prato-descartavel.jpg', altText: 'Prato Descartável', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-1', publicId: 'v-fallback-1', sku: 'PRATO-15CM', priceCents: 1229, compareAtPriceCents: 1890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-2',
    publicId: 'fallback-prod-2',
    name: 'Caixa para Pizza Oitavada N° 35 Papelão Ondulado Pct c/ 25 un',
    slug: 'caixa-pizza-oitavada-35cm',
    description: 'Caixa de pizza oitavada reforçada para delivery.',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Comercial do Norte', slug: 'comercial-do-norte' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img2', path: '/assets/home-ref/prod-caixa-pizza.jpg', altText: 'Caixa para Pizza', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-2', publicId: 'v-fallback-2', sku: 'CX-PIZZA-35', priceCents: 4290, compareAtPriceCents: 5490, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-3',
    publicId: 'fallback-prod-3',
    name: 'Sacola Plástica Alça Camiseta Branca 40x50cm Milheiro Reforçada',
    slug: 'sacola-plastica-alca-camiseta-40x50',
    description: 'Sacola plástica de alta densidade ideal para supermercados e feirantes.',
    status: 'ACTIVE',
    brand: { id: 'b3', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'c3', name: 'Sacos & Sacolas', slug: 'sacos-e-sacolas' } }],
    images: [{ id: 'img3', path: '/assets/home-ref/prod-sacola-plastica.jpg', altText: 'Sacola Plástica', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-3', publicId: 'v-fallback-3', sku: 'SAC-40X50', priceCents: 2490, compareAtPriceCents: 3200, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-4',
    publicId: 'fallback-prod-4',
    name: 'Copo Descartável Transparente 180ml Cristalcopo Tira c/ 100 un',
    slug: 'copo-descartavel-180ml-cristalcopo',
    description: 'Copo descartável 180ml certificado ABNT.',
    status: 'ACTIVE',
    brand: { id: 'b4', name: 'Cristalcopo', slug: 'cristalcopo' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img4', path: '/assets/home-ref/prod-copo-descartavel.jpg', altText: 'Copo Descartável 180ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-4', publicId: 'v-fallback-4', sku: 'COPO-180ML', priceCents: 649, compareAtPriceCents: 890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-5',
    publicId: 'fallback-prod-5',
    name: 'Papel Toalha Interfolha Branco 100% Celulose Fardo c/ 1000 folhas',
    slug: 'papel-toalha-interfolha-1000-folhas',
    description: 'Papel toalha interfolhado 2 dobras extra macio.',
    status: 'ACTIVE',
    brand: { id: 'b5', name: 'Mili Profissional', slug: 'mili' },
    categories: [{ category: { id: 'c4', name: 'Limpeza Profissional', slug: 'limpeza-profissional' } }],
    images: [{ id: 'img5', path: '/assets/home-ref/prod-papel-toalha.jpg', altText: 'Papel Toalha Interfolha', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-5', publicId: 'v-fallback-5', sku: 'PAPEL-1000', priceCents: 1850, compareAtPriceCents: 2490, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
];

export function ProductCarouselWidget({
  widgetId,
  variant = 'standard-5col',
  title,
  viewAllLink = '/loja',
  source = 'offers',
  limit,
  sideBanner,
  contextData,
}: ProductCarouselProps & { contextData?: WidgetContextData }) {
  const { isEditing, previewMode, updateWidgetProps } = useElementor();
  const [editingTitle, setEditingTitle] = useState(false);
  const [page, setPage] = useState(0);

  const rawItems =
    source === 'offers'
      ? contextData?.offers && contextData.offers.length > 0
        ? contextData.offers
        : contextData?.products ?? []
      : contextData?.products ?? [];

  const baseList = rawItems.length > 0 ? rawItems : FALLBACK_CATALOG_PRODUCTS;
  const targetCount = limit ?? (variant === 'split-banner' ? 3 : 5);

  const displayItems: ApiProduct[] = [];
  for (let i = 0; i < targetCount; i++) {
    const item = baseList[(i + page) % baseList.length];
    if (item) displayItems.push(item);
  }

  const renderEditableTitle = () =>
    isEditing && !previewMode ? (
      <div className="group/title relative flex items-center gap-1.5">
        {editingTitle ? (
          <input
            autoFocus
            className="rounded-lg border-2 border-[#004CB1] bg-white px-2 py-0.5 text-lg font-extrabold text-slate-900 outline-none sm:text-xl"
            onBlur={() => setEditingTitle(false)}
            onChange={(e) => {
              if (widgetId) updateWidgetProps(widgetId, { title: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingTitle(false);
            }}
            value={title}
          />
        ) : (
          <div
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1 py-0.5 transition hover:bg-slate-100"
            onClick={() => setEditingTitle(true)}
            title="Clique para editar o título"
          >
            <h2 className="text-[19px] font-extrabold tracking-tight text-slate-900 sm:text-[21px]">
              {title}
            </h2>
            <Edit2 className="size-3.5 text-[#004CB1] opacity-0 transition-opacity group-hover/title:opacity-100" />
          </div>
        )}
      </div>
    ) : (
      <h2 className="text-[19px] font-extrabold tracking-tight text-slate-900 sm:text-[21px]">
        {title}
      </h2>
    );

  if (variant === 'split-banner') {
    const banner = sideBanner ?? {
      title: 'Ofertas',
      subtitle: 'Mês de Outubro',
      tag: 'Semana do Feirante',
      imageUrl: '/assets/home-ref/s04-side-banner-feirante.jpg',
      linkUrl: '/loja?oferta=1',
      altText: 'Semana do Feirante Comercial do Norte',
    };

    return (
      <section aria-label={title} className="cn-container py-3 sm:py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Card Esquerdo: Banner Vertical */}
          <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] lg:col-span-4">
            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm">
              <span className="text-[18px] font-extrabold text-slate-900">{banner.title}</span>
              <span className="text-slate-300">·</span>
              {banner.subtitle ? (
                <span className="text-xs font-medium text-slate-500">{banner.subtitle}</span>
              ) : null}
              {banner.tag ? (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-bold text-[#004CB1]">{banner.tag}</span>
                </>
              ) : null}
            </div>

            <div className="group/img relative flex-1 overflow-hidden rounded-xl bg-[#002B66]">
              {banner.linkUrl ? (
                <Link
                  className="block size-full"
                  href={banner.linkUrl}
                  onClick={(e) => {
                    if (isEditing && !previewMode) e.preventDefault();
                  }}
                >
                  <Image
                    alt={banner.altText ?? banner.title}
                    className={`h-full w-full object-cover transition duration-500 ${
                      isEditing && !previewMode
                        ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                        : 'group-hover/img:scale-[1.02]'
                    }`}
                    height={905}
                    src={banner.imageUrl}
                    unoptimized
                    width={670}
                  />
                </Link>
              ) : (
                <Image
                  alt={banner.altText ?? banner.title}
                  className="h-full w-full object-cover"
                  height={905}
                  src={banner.imageUrl}
                  unoptimized
                  width={670}
                />
              )}

              {widgetId ? (
                <InlineImageEditorOverlay
                  canAdd={false}
                  canRemove={false}
                  currentLinkUrl={banner.linkUrl}
                  fieldPath="sideBanner.imageUrl"
                  linkFieldPath="sideBanner.linkUrl"
                  previewUrl={banner.imageUrl}
                  slideIndex={0}
                  title={banner.title}
                  widgetId={widgetId}
                />
              ) : null}
            </div>
          </div>

          {/* Card Direito: Carrossel 3 Produtos em Promoção */}
          <div className="relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-5 lg:col-span-8">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {renderEditableTitle()}
                <span className="text-slate-300">·</span>
                <Link
                  className="inline-flex items-center gap-0.5 text-xs font-bold text-[#004CB1] hover:underline"
                  href={viewAllLink}
                >
                  <span>Ver todos</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>

              {/* Paginação em pílula estilo site-final */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5">
                {[0, 1, 2, 3, 4].map((dotIdx) => (
                  <button
                    aria-label={`Página ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      page % 5 === dotIdx ? 'w-4 bg-[#E2091E]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    key={dotIdx}
                    onClick={() => setPage(dotIdx)}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <div className="relative flex-1">
              <div className="grid h-full grid-cols-1 gap-3.5 sm:grid-cols-3">
                {displayItems.map((product, idx) => (
                  <ProductCard
                    flashBadge
                    key={`${product.id}-${idx}`}
                    product={product}
                  />
                ))}
              </div>

              <button
                aria-label="Anterior"
                className="absolute -left-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#004CB1] shadow-md transition hover:scale-105 hover:bg-slate-50 sm:flex"
                onClick={() => setPage((p) => (p - 1 + 5) % 5)}
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Próximo"
                className="absolute -right-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#004CB1] shadow-md transition hover:scale-105 hover:bg-slate-50 sm:flex"
                onClick={() => setPage((p) => (p + 1) % 5)}
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variante 'standard-5col' (Mais vendidos / Para você)
  return (
    <section aria-label={title} className="cn-container py-3 sm:py-4">
      <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {renderEditableTitle()}
            <span className="text-slate-300">·</span>
            <Link
              className="inline-flex items-center gap-0.5 text-xs font-bold text-[#004CB1] hover:underline"
              href={viewAllLink}
            >
              <span>Ver todos</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5">
            {[0, 1, 2, 3, 4].map((dotIdx) => (
              <button
                aria-label={`Página ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  page % 5 === dotIdx ? 'w-4 bg-[#E2091E]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                key={dotIdx}
                onClick={() => setPage(dotIdx)}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-3.5">
            {displayItems.map((product, idx) => (
              <ProductCard
                flashBadge={source === 'offers'}
                key={`${product.id}-${idx}`}
                product={product}
              />
            ))}
          </div>

          <button
            aria-label="Anterior"
            className="absolute -left-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#004CB1] shadow-md transition hover:scale-105 hover:bg-slate-50 sm:flex"
            onClick={() => setPage((p) => (p - 1 + 5) % 5)}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Próximo"
            className="absolute -right-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#004CB1] shadow-md transition hover:scale-105 hover:bg-slate-50 sm:flex"
            onClick={() => setPage((p) => (p + 1) % 5)}
            type="button"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
