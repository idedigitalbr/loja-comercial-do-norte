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
    name: 'Copo Descartável Transparente 300ml — Pct 100 un.',
    slug: 'copo-descartavel-transparente-300ml',
    description: 'Sai a R$ 0,12 por copo no atacado',
    status: 'ACTIVE',
    brand: { id: 'b1', name: 'Cristalcopo', slug: 'cristalcopo' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img1', path: '/assets/PRODUTOS/produtos-imgs/copo-300ml.png', altText: 'Copo Descartável 300ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-1', publicId: 'v-fallback-1', sku: 'COPO-300ML', priceCents: 1229, compareAtPriceCents: 1890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-2',
    publicId: 'fallback-prod-2',
    name: 'Marmita de Isopor com Tampa 900ml — Pct 50 un.',
    slug: 'marmita-isopor-com-tampa-900ml',
    description: 'Vedação térmica ideal para delivery',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Copobras', slug: 'copobras' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img2', path: '/assets/PRODUTOS/produtos-imgs/marmita-900ml.jpg', altText: 'Marmita de Isopor 900ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-2', publicId: 'v-fallback-2', sku: 'MARM-900', priceCents: 2990, compareAtPriceCents: 4150, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-3',
    publicId: 'fallback-prod-3',
    name: 'Sacola Plástica Branca 50×60 — Pct 5kg',
    slug: 'sacola-plastica-branca-50x60',
    description: 'Alta resistência para atacado e comércio',
    status: 'ACTIVE',
    brand: { id: 'b3', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'c3', name: 'Sacos & Sacolas', slug: 'sacos-e-sacolas' } }],
    images: [{ id: 'img3', path: '/assets/PRODUTOS/produtos-imgs/sacola-50x60.jpg', altText: 'Sacola Plástica 50x60', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-3', publicId: 'v-fallback-3', sku: 'SAC-50X60', priceCents: 6990, compareAtPriceCents: 8990, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-4',
    publicId: 'fallback-prod-4',
    name: 'Papel Toalha Interfolhado — Pct 1.000 folhas',
    slug: 'papel-toalha-interfolhado-1000-folhas',
    description: 'Uso comercial em banheiros e cozinhas',
    status: 'ACTIVE',
    brand: { id: 'b4', name: 'Mili Profissional', slug: 'mili' },
    categories: [{ category: { id: 'c4', name: 'Limpeza Profissional', slug: 'limpeza-profissional' } }],
    images: [{ id: 'img4', path: '/assets/PRODUTOS/produtos-imgs/papel-toalha.jpg', altText: 'Papel Toalha Interfolhado', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-4', publicId: 'v-fallback-4', sku: 'PAPEL-1000', priceCents: 1999, compareAtPriceCents: 2440, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-5',
    publicId: 'fallback-prod-5',
    name: 'Caixa de Pizza Papelão 35cm — Pct 25 un.',
    slug: 'caixa-pizza-papelao-35cm',
    description: 'Linha reforçada com respiro anti-umidade',
    status: 'ACTIVE',
    brand: { id: 'b5', name: 'Comercial do Norte', slug: 'comercial-do-norte' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img5', path: '/assets/PRODUTOS/produtos-imgs/caixa-pizza-35cm.jpg', altText: 'Caixa de Pizza 35cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-5', publicId: 'v-fallback-5', sku: 'CX-PIZZA-35', priceCents: 2723, compareAtPriceCents: 3890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-6',
    publicId: 'fallback-prod-6',
    name: 'Prato Descartável Fundo 18cm Branco — Pct 50 un.',
    slug: 'prato-descartavel-fundo-18cm',
    description: 'Ideal para refeições, caldos e eventos',
    status: 'ACTIVE',
    brand: { id: 'b1', name: 'Cristalcopo', slug: 'cristalcopo' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img6', path: '/assets/PRODUTOS/produtos-imgs/copo-200ml.png', altText: 'Prato Descartável 18cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-6', publicId: 'v-fallback-6', sku: 'PRATO-18', priceCents: 1450, compareAtPriceCents: 1990, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-7',
    publicId: 'fallback-prod-7',
    name: 'Copo Descartável 200ml Água — Pct 100 un.',
    slug: 'copo-descartavel-200ml-agua',
    description: 'Uso comercial diário para água e café',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Copobras', slug: 'copobras' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img7', path: '/assets/PRODUTOS/produtos-imgs/copo-200ml.png', altText: 'Copo Descartável 200ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-7', publicId: 'v-fallback-7', sku: 'COPO-200ML', priceCents: 890, compareAtPriceCents: 1250, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-8',
    publicId: 'fallback-prod-8',
    name: 'Detergente Líquido Neutro Concentrado 5L',
    slug: 'detergente-liquido-neutro-5l',
    description: 'Alto rendimento para cozinhas industriais',
    status: 'ACTIVE',
    brand: { id: 'b6', name: 'Limpeza Pro', slug: 'limpeza-pro' },
    categories: [{ category: { id: 'c4', name: 'Limpeza', slug: 'limpeza' } }],
    images: [{ id: 'img8', path: '/assets/PRODUTOS/produtos-imgs/detergente-5l.jpg', altText: 'Detergente 5L', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-8', publicId: 'v-fallback-8', sku: 'DET-5L', priceCents: 3290, compareAtPriceCents: 4200, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-9',
    publicId: 'fallback-prod-9',
    name: 'Marmita Térmica de Alumínio 750ml — Pct 50 un.',
    slug: 'marmita-termica-aluminio-750ml',
    description: 'Mantém o prato quente por mais tempo',
    status: 'ACTIVE',
    brand: { id: 'b7', name: 'Wyda', slug: 'wyda' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img9', path: '/assets/PRODUTOS/produtos-imgs/marmita-750ml.jpg', altText: 'Marmita Alumínio 750ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-9', publicId: 'v-fallback-9', sku: 'MARM-ALUM-750', priceCents: 3850, compareAtPriceCents: 4890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-10',
    publicId: 'fallback-prod-10',
    name: 'Sacola Plástica Reforçada 38×48 — Pct 5kg',
    slug: 'sacola-plastica-reforcada-38x48',
    description: 'Tamanho padrão para padarias e mercadinhos',
    status: 'ACTIVE',
    brand: { id: 'b3', name: 'NortePlast', slug: 'norteplast' },
    categories: [{ category: { id: 'c3', name: 'Sacos & Sacolas', slug: 'sacos-e-sacolas' } }],
    images: [{ id: 'img10', path: '/assets/PRODUTOS/produtos-imgs/sacola-38x48.jpg', altText: 'Sacola Reforçada 38x48', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-10', publicId: 'v-fallback-10', sku: 'SAC-38X48', priceCents: 5490, compareAtPriceCents: 6890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-11',
    publicId: 'fallback-prod-11',
    name: 'Caixa de Pizza Oitavada 25cm Brotinho — Pct 25 un.',
    slug: 'caixa-pizza-oitavada-25cm',
    description: 'Excelente para porções individuais e esfihas',
    status: 'ACTIVE',
    brand: { id: 'b5', name: 'Comercial do Norte', slug: 'comercial-do-norte' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img11', path: '/assets/PRODUTOS/produtos-imgs/caixa-pizza-25cm.jpg', altText: 'Caixa de Pizza 25cm', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-11', publicId: 'v-fallback-11', sku: 'CX-PIZZA-25', priceCents: 2190, compareAtPriceCents: 2890, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-12',
    publicId: 'fallback-prod-12',
    name: 'Copo Descartável Reforçado 300ml — Pct 100 un.',
    slug: 'copo-descartavel-reforcado-300ml',
    description: 'Para sucos, refrigerantes e chopp',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Copobras', slug: 'copobras' },
    categories: [{ category: { id: 'c1', name: 'Descartáveis', slug: 'descartaveis' } }],
    images: [{ id: 'img12', path: '/assets/PRODUTOS/produtos-imgs/copo-300ml.png', altText: 'Copo Reforçado 300ml', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-12', publicId: 'v-fallback-12', sku: 'COPO-REF-300', priceCents: 1590, compareAtPriceCents: 2100, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-13',
    publicId: 'fallback-prod-13',
    name: 'Luva Nitrílica Sem Pó Azul — Cx 100 un.',
    slug: 'luva-nitrilica-sem-po-azul',
    description: 'Higiene e proteção profissional na manipulação',
    status: 'ACTIVE',
    brand: { id: 'b8', name: 'Supermax', slug: 'supermax' },
    categories: [{ category: { id: 'c4', name: 'Limpeza & Higiene', slug: 'limpeza' } }],
    images: [{ id: 'img13', path: '/assets/PRODUTOS/produtos-imgs/detergente-5l.jpg', altText: 'Luva Nitrílica Azul', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-13', publicId: 'v-fallback-13', sku: 'LUV-NIT-AZUL', priceCents: 2710, compareAtPriceCents: 3590, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-14',
    publicId: 'fallback-prod-14',
    name: 'Hamburgueira de Isopor Térmica — Pct 100 un.',
    slug: 'hamburgueira-isopor-termica',
    description: 'Mantém o lanche montado e aquecido',
    status: 'ACTIVE',
    brand: { id: 'b2', name: 'Copobras', slug: 'copobras' },
    categories: [{ category: { id: 'c2', name: 'Embalagens', slug: 'embalagens' } }],
    images: [{ id: 'img14', path: '/assets/PRODUTOS/produtos-imgs/marmita-750ml.jpg', altText: 'Hamburgueira Isopor', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-14', publicId: 'v-fallback-14', sku: 'HAMB-ISOPOR', priceCents: 8595, compareAtPriceCents: 10400, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
  },
  {
    id: 'fallback-prod-15',
    publicId: 'fallback-prod-15',
    name: 'Luva Nitrílica Sem Pó Vermelho — Cx 100 un.',
    slug: 'luva-nitrilica-sem-po-vermelho',
    description: 'Resistência química e mecânica certificada',
    status: 'ACTIVE',
    brand: { id: 'b8', name: 'Supermax', slug: 'supermax' },
    categories: [{ category: { id: 'c4', name: 'Limpeza & Higiene', slug: 'limpeza' } }],
    images: [{ id: 'img15', path: '/assets/PRODUTOS/produtos-imgs/marmita-900ml.jpg', altText: 'Luva Nitrílica Vermelho', isPrimary: true, sortOrder: 0, variantId: null }],
    variants: [{ id: 'v-fallback-15', publicId: 'v-fallback-15', sku: 'LUV-NIT-VERM', priceCents: 2710, compareAtPriceCents: 3590, weightGrams: null, widthMm: null, heightMm: null, lengthMm: null, stockStatus: 'IN_STOCK', status: 'ACTIVE' }],
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
  const totalPages = Math.max(1, Math.ceil(baseList.length / targetCount));
  const safePage = Math.min(page, totalPages - 1);

  // Paginação real sem repetir itens na mesma página
  const startIndex = safePage * targetCount;
  const displayItems = baseList.slice(startIndex, startIndex + targetCount);

  // Se a última página tiver menos itens que o target, preenche de forma cíclica para manter o layout
  if (displayItems.length < targetCount && baseList.length >= targetCount) {
    const diff = targetCount - displayItems.length;
    for (let i = 0; i < diff; i++) {
      const extraItem = baseList[i % baseList.length];
      if (extraItem) displayItems.push(extraItem);
    }
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

  const renderDarkNavyPaginationPill = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101F3C] px-3 py-1.5">
        {Array.from({ length: totalPages }).map((_, dotIdx) => (
          <button
            aria-label={`Página ${dotIdx + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              safePage === dotIdx ? 'w-4 bg-[#E2091E]' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
            key={dotIdx}
            onClick={() => setPage(dotIdx)}
            type="button"
          />
        ))}
      </div>
    );
  };

  if (variant === 'split-banner') {
    const banner = sideBanner ?? {
      title: 'Ofertas',
      subtitle: 'Mês de Outubro',
      tag: 'Semana do Feirante',
      imageUrl: '/assets/HOME Vitrine/S4-CARD-ESQ-Promocional/S4-CARD-ESQ-Promocional.webp',
      linkUrl: '/loja?oferta=1',
      altText: 'Semana do Feirante Comercial do Norte',
    };

    return (
      <section aria-label={title} className="cn-container py-3 sm:py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Card Esquerdo: Banner Vertical */}
          <div className="flex flex-col min-h-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] lg:col-span-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[19px] font-extrabold text-slate-900">{banner.title}</span>
                {banner.subtitle ? (
                  <span className="text-xs font-bold text-[#004CB1]">{banner.subtitle}</span>
                ) : null}
              </div>
              {banner.tag ? (
                <span className="text-[11px] font-medium text-slate-400">{banner.tag} ⌄</span>
              ) : null}
            </div>

            <div className="group/img relative flex-1 min-h-[260px] sm:min-h-[320px] lg:min-h-0 overflow-hidden rounded-xl bg-[#002B66]">
              {banner.linkUrl ? (
                <Link
                  className="relative block size-full"
                  href={banner.linkUrl}
                  onClick={(e) => {
                    if (isEditing && !previewMode) e.preventDefault();
                  }}
                >
                  <Image
                    alt={banner.altText ?? banner.title}
                    className={`object-cover transition duration-500 ${
                      isEditing && !previewMode
                        ? 'group-hover/img:brightness-50 group-hover/img:grayscale'
                        : 'group-hover/img:scale-[1.02]'
                    }`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    src={banner.imageUrl}
                    unoptimized
                  />
                </Link>
              ) : (
                <Image
                  alt={banner.altText ?? banner.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  src={banner.imageUrl}
                  unoptimized
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
            <div className="mb-5 sm:mb-6 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                {renderEditableTitle()}
                <Link
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#004CB1] hover:underline"
                  href={viewAllLink}
                >
                  <span>Ver todos</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>

              {renderDarkNavyPaginationPill()}
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 items-start">
                {displayItems.map((product, idx) => (
                  <ProductCard
                    flashBadge={idx % 2 === 0}
                    key={`${product.id}-${safePage}-${idx}`}
                    product={product}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <>
                  <button
                    aria-label="Anterior"
                    className="absolute -left-3 top-1/2 z-50 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 sm:flex cursor-pointer"
                    onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                    type="button"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    aria-label="Próximo"
                    className="absolute -right-3 top-1/2 z-50 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 sm:flex cursor-pointer"
                    onClick={() => setPage((p) => (p + 1) % totalPages)}
                    type="button"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
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
        <div className="mb-5 sm:mb-6 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2.5">
            {renderEditableTitle()}
            <Link
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#004CB1] hover:underline"
              href={viewAllLink}
            >
              <span>Ver todos</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {renderDarkNavyPaginationPill()}
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-3.5 items-start">
            {displayItems.map((product, idx) => (
              <ProductCard
                flashBadge={idx === 0 || idx === 2}
                key={`${product.id}-${safePage}-${idx}`}
                product={product}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <>
              <button
                aria-label="Anterior"
                className="absolute -left-3.5 top-1/2 z-50 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 sm:flex cursor-pointer"
                onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Próximo"
                className="absolute -right-3.5 top-1/2 z-50 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#E2091E] shadow-lg transition hover:scale-105 hover:bg-slate-50 sm:flex cursor-pointer"
                onClick={() => setPage((p) => (p + 1) % totalPages)}
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
