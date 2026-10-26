'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Edit2, ImageUp, Layers } from 'lucide-react';
import { useElementor } from '@/components/storefront/editor/elementor-editor-context';
import type { CategoryGridProps, CategoryIconItem, WidgetContextData } from '@/lib/storefront/widget-types';
import type { ApiCategory } from '@/lib/types';

const DEFAULT_ICON_ITEMS: CategoryIconItem[] = [
  { id: 'cat-embalagens', label: 'Embalagens', imageUrl: '/assets/categorias/cat-embalagens.jpg', linkUrl: '/categoria/embalagens' },
  { id: 'cat-descartaveis', label: 'Descartáveis', imageUrl: '/assets/categorias/cat-descartaveis.jpg', linkUrl: '/categoria/descartaveis' },
  { id: 'cat-limpeza', label: 'Limpeza', imageUrl: '/assets/categorias/cat-limpeza.jpg', linkUrl: '/categoria/limpeza' },
  { id: 'cat-sacolas', label: 'Sacos e Sacolas', imageUrl: '/assets/categorias/cat-sacolas.jpg', linkUrl: '/loja?q=sacolas' },
  { id: 'cat-festas', label: 'Festas & Eventos', imageUrl: '/assets/categorias/cat-festas.jpg', linkUrl: '/categoria/artigos-festa' },
  { id: 'cat-confeitaria', label: 'Confeitaria', imageUrl: '/assets/categorias/cat-confeitaria.jpg', linkUrl: '/categoria/confeitaria' },
  { id: 'cat-foodservice', label: 'Food Service', imageUrl: '/assets/categorias/cat-foodservice.jpg', linkUrl: '/loja?q=marmita' },
  { id: 'cat-ofertas', label: 'Ofertas de Atacado', imageUrl: '/assets/categorias/cat-ofertas.jpg', linkUrl: '/loja?oferta=1' },
];

export function CategoryGridWidget({
  widgetId,
  variant = 'icons-bar',
  title,
  subtitle,
  viewAllLink = '/loja',
  columns = 4,
  maxItems = 8,
  customItems,
  contextData,
}: CategoryGridProps & { contextData?: WidgetContextData }) {
  const { isEditing, previewMode, updateWidgetProps, openMediaModal } = useElementor();
  const [editingTitle, setEditingTitle] = useState(false);

  if (variant === 'icons-bar') {
    const items = customItems && customItems.length > 0 ? customItems : DEFAULT_ICON_ITEMS;

    return (
      <section aria-label={title || 'Atalhos de categorias'} className="cn-container py-2.5 sm:py-3.5">
        <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:px-8 sm:py-5">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-4">
            {items.map((item, idx) => (
              <div className="group relative flex flex-col items-center text-center" key={item.id}>
                <div className="relative size-[64px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#004CB1] group-hover:shadow-md sm:size-[74px]">
                  <Link
                    className="block size-full"
                    href={item.linkUrl || '/loja'}
                    onClick={(e) => {
                      if (isEditing && !previewMode) e.preventDefault();
                    }}
                  >
                    <Image
                      alt={item.label}
                      className="size-full object-cover"
                      height={146}
                      src={item.imageUrl}
                      unoptimized
                      width={146}
                    />
                  </Link>
                  {isEditing && !previewMode && widgetId ? (
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openMediaModal({
                          widgetId,
                          slideIndex: idx,
                          fieldPath: `customItems.${idx}.imageUrl`,
                          title: `Ícone: ${item.label}`,
                          previewUrl: item.imageUrl,
                        });
                      }}
                      title="Trocar ícone"
                      type="button"
                    >
                      <ImageUp className="size-4" />
                    </button>
                  ) : null}
                </div>
                <Link
                  className="mt-2 flex h-[30px] items-center justify-center text-center line-clamp-2 text-[11px] font-medium leading-tight text-slate-700 transition-colors group-hover:text-[#004CB1] sm:text-[12px]"
                  href={item.linkUrl || '/loja'}
                  onClick={(e) => {
                    if (isEditing && !previewMode) e.preventDefault();
                  }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const allCategories = contextData?.categories ?? [];
  const rootCategories = allCategories.filter((c) => !c.parentId).slice(0, maxItems);

  if (rootCategories.length === 0) return null;

  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
    8: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-8',
  }[columns];

  return (
    <section aria-label={title} className="cn-container py-6 sm:py-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          {isEditing && !previewMode ? (
            <div className="group/title relative flex items-center gap-2">
              {editingTitle ? (
                <input
                  autoFocus
                  className="rounded-lg border-2 border-[#004CB1] bg-white px-2 py-1 text-2xl font-extrabold text-ink outline-none sm:text-3xl"
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
                  className="flex cursor-pointer items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition"
                  onClick={() => setEditingTitle(true)}
                  title="Clique para editar o título diretamente"
                >
                  <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                    {title}
                  </h2>
                  <Edit2 className="size-4 text-[#004CB1] opacity-0 group-hover/title:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          ) : (
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
          )}

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
              <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
