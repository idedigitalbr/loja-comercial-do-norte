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
  desc: string;
  icon: React.ElementType;
}> = [
  {
    type: 'hero-carousel',
    title: 'Carrossel Full Largura',
    desc: 'Banners 100% largura estilo Mercado Livre',
    icon: Tv,
  },
  {
    type: 'contained-hero',
    title: 'Carrossel Padrão (Campanhas)',
    desc: 'Banners arredondados em caixa de destaque',
    icon: Layout,
  },
  {
    type: 'benefits-bar',
    title: 'Barra de Benefícios',
    desc: '4 colunas de cartões com ícones e vantagens',
    icon: Sparkles,
  },
  {
    type: 'product-carousel',
    title: 'Vitrine de Produtos / Ofertas',
    desc: 'Carrossel de produtos com botão de cotação',
    icon: Flame,
  },
  {
    type: 'category-grid',
    title: 'Grade de Departamentos',
    desc: 'Navegação visual pelas categorias da loja',
    icon: Grid,
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
          className={`group relative flex flex-col items-center justify-center rounded-2xl border border-dashed py-6 px-4 transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-sky-400 bg-sky-950/20 scale-[1.01] shadow-lg ring-1 ring-sky-500/30'
              : 'border-zinc-300/80 bg-zinc-50/50 hover:border-zinc-500 hover:bg-zinc-100/60'
          }`}
          onClick={() => setIsOpen(true)}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Botão + Minimalista */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Adicionar Nova Seção"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 shadow-md transition-all duration-150 group-hover:scale-105 group-hover:border-sky-400 group-hover:text-sky-400 group-hover:bg-black"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              title="Adicionar Nova Seção Aqui"
              type="button"
            >
              <Plus className="size-5 stroke-[2.2]" />
            </button>
          </div>

          <p className="mt-2 text-xs font-medium text-zinc-500 group-hover:text-zinc-800">
            {isDragOver ? (
              <span className="font-semibold text-sky-600">Solte para adicionar nesta posição</span>
            ) : (
              <>
                Clique no <strong className="text-zinc-800 font-semibold">+</strong> para adicionar uma nova seção
              </>
            )}
          </p>
        </div>
      ) : (
        /* Janela Suspensa Shadcn Dark Mode */
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-sky-400 text-xs font-black">
                +
              </div>
              <h4 className="text-xs font-semibold text-white">
                Selecione o tipo de seção a inserir:
              </h4>
            </div>
            <button
              aria-label="Fechar"
              className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {quickWidgets.map((w) => {
              const Icon = w.icon;
              return (
                <button
                  className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-left transition hover:border-sky-500/50 hover:bg-zinc-900 cursor-pointer"
                  key={w.type}
                  onClick={() => {
                    addWidget(w.type, insertIndex);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:text-sky-400 group-hover:border-sky-500/40 transition">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-white group-hover:text-sky-400 transition">
                        {w.title}
                      </span>
                      <span className="block text-[11px] text-zinc-500 line-clamp-1">
                        {w.desc}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
