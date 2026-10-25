'use client';

import React, { useState } from 'react';
import { Flame, Grid, Layout, Plus, Sparkles, Tv, X } from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { WidgetType } from '@/lib/storefront/widget-types';

interface ElementorAddSectionBoxProps {
  insertIndex?: number;
}

const quickWidgets: Array<{
  type: WidgetType;
  title: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
}> = [
  {
    type: 'hero-carousel',
    title: 'Carrossel Full (Hero ML)',
    icon: Tv,
    badge: 'HERO',
    badgeColor: 'bg-[#004CB1]',
  },
  {
    type: 'contained-hero',
    title: 'Carrossel Padrão (Campanhas)',
    icon: Layout,
    badge: 'BANNER',
    badgeColor: 'bg-[#E2091E]',
  },
  {
    type: 'benefits-bar',
    title: 'Barra de Benefícios (4 Ícones)',
    icon: Sparkles,
    badge: 'ICONS',
    badgeColor: 'bg-[#028F34]',
  },
  {
    type: 'product-carousel',
    title: 'Vitrine de Produtos / Ofertas',
    icon: Flame,
    badge: 'PRODUTOS',
    badgeColor: 'bg-[#FF7A00]',
  },
  {
    type: 'category-grid',
    title: 'Grade de Departamentos',
    icon: Grid,
    badge: 'CATEGORIAS',
    badgeColor: 'bg-[#8C1D40]',
  },
];

export function ElementorAddSectionBox({ insertIndex }: ElementorAddSectionBoxProps) {
  const { isEditing, previewMode, addWidget } = useElementor();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isEditing || previewMode) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const widgetType = e.dataTransfer.getData('text/widget-type') as WidgetType;
    if (widgetType) {
      addWidget(widgetType, insertIndex);
    }
  };

  return (
    <div className="cn-container my-6 transition-all duration-200">
      {!isOpen ? (
        <div
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-6 px-4 transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-[#004CB1] bg-blue-50/50 scale-[1.01] shadow-lg ring-2 ring-[#004CB1]/30'
              : 'border-slate-300 bg-slate-50/50 hover:border-[#004CB1] hover:bg-white hover:shadow-md'
          }`}
          onClick={() => setIsOpen(true)}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Botão + Circular */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Adicionar Nova Seção Aqui"
              className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#004CB1] text-white shadow-md transition-transform duration-150 group-hover:scale-110 hover:bg-[#00357B]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              title="Adicionar Nova Seção Aqui"
              type="button"
            >
              <Plus className="size-5.5 stroke-[2.6]" />
            </button>
          </div>

          <p className="mt-2.5 text-xs font-semibold text-slate-500 group-hover:text-slate-800">
            {isDragOver ? (
              <span className="font-bold text-[#004CB1]">Solte para adicionar nesta posição</span>
            ) : (
              <>
                Clique no <strong className="text-[#004CB1]">+</strong> para adicionar uma nova seção nesta posição
              </>
            )}
          </p>
        </div>
      ) : (
        /* Janela Suspensa Limpa de Seleção Rápida de Seção */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#004CB1] text-white text-xs font-black">
                +
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                Selecione o tipo de seção a inserir:
              </h4>
            </div>
            <button
              aria-label="Fechar"
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {quickWidgets.map((w) => {
              const Icon = w.icon;
              return (
                <button
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-left transition hover:border-[#004CB1] hover:bg-white hover:shadow-md cursor-pointer"
                  key={w.type}
                  onClick={() => {
                    addWidget(w.type, insertIndex);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 group-hover:bg-[#004CB1] group-hover:text-white transition">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#004CB1]">
                      {w.title}
                    </span>
                  </div>
                  <span className={`rounded px-1.5 py-0.2 text-[8px] font-black text-white ${w.badgeColor}`}>
                    {w.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
