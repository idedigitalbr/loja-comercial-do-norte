'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { WidgetConfig } from '@/lib/storefront/widget-types';

const widgetLabels: Record<string, string> = {
  'hero-carousel': 'Carrossel Full Largura',
  'contained-hero': 'Carrossel Padrão (Campanhas)',
  'benefits-bar': 'Barra de Benefícios',
  'product-carousel': 'Vitrine de Produtos / Ofertas',
  'category-grid': 'Grade de Departamentos',
};

export function ElementorSectionWrapper({
  widget,
  index,
  totalWidgets,
  children,
  onAddAbove,
  onAddBelow,
}: {
  widget: WidgetConfig;
  index: number;
  totalWidgets: number;
  children: React.ReactNode;
  onAddAbove: () => void;
  onAddBelow: () => void;
}) {
  const {
    isEditing,
    previewMode,
    selectedWidgetId,
    setSelectedWidgetId,
    moveWidget,
    reorderWidgets,
    removeWidget,
    toggleWidget,
    addWidget,
  } = useElementor();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isEditing || previewMode) {
    if (!widget.enabled) return null;
    return <section id={`section-${widget.id}`}>{children}</section>;
  }

  const isSelected = selectedWidgetId === widget.id;
  const label = widgetLabels[widget.type] || widget.type;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/section-index', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fromIndex = Number(e.dataTransfer.getData('text/section-index'));
    if (!isNaN(fromIndex) && fromIndex !== index) {
      reorderWidgets(fromIndex, index);
    }
  };

  return (
    <section
      className={`group/section relative transition-all duration-200 ${
        isSelected
          ? 'ring-1 ring-zinc-500/70 rounded-2xl'
          : 'hover:ring-1 hover:ring-zinc-600/40 rounded-2xl'
      } ${isDragOver ? 'ring-2 ring-sky-500 bg-sky-950/10' : ''} ${
        !widget.enabled ? 'opacity-40 grayscale select-none' : ''
      }`}
      id={`section-${widget.id}`}
      onClick={() => setSelectedWidgetId(widget.id)}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* LADO DIREITO: CÁPSULA MINIMALISTA SHADCN COM LÁPIS À ESQUERDA DAS BOLINHAS */}
      <div
        className="absolute top-3 right-4 z-40 transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div
            className="flex items-center gap-0.5 rounded-xl border border-zinc-800 bg-zinc-950/90 p-1 text-zinc-400 shadow-xl backdrop-blur-md opacity-0 group-hover/section:opacity-100 group-hover/section:translate-y-0 translate-y-1 transition-all duration-150 focus-within:opacity-100"
          >
            {/* 1. Lápis / Pincel Minimalista (do lado esquerdo das bolinhas) */}
            <button
              aria-label={`Opções da seção ${label}`}
              className={`flex size-7 cursor-pointer items-center justify-center rounded-lg transition-all duration-150 hover:bg-zinc-800 hover:text-sky-400 ${
                isMenuOpen ? 'bg-zinc-800 text-sky-400' : 'text-zinc-400'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Configurar esta seção (inserir acima/abaixo, duplicar, excluir)"
              type="button"
            >
              <Pencil className="size-3.5" />
            </button>

            <span className="h-4 w-px bg-zinc-800" />

            {/* 2. Bolinhas / Quadradinhos de Drag & Drop */}
            <div
              aria-label="Arrastar para reordenar"
              className="flex size-7 cursor-grab active:cursor-grabbing items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-sky-400 transition"
              draggable={true}
              onDragStart={handleDragStart}
              title="Arraste para mover esta seção para cima ou para baixo"
            >
              <GripVertical className="size-4" />
            </div>

            <span className="h-4 w-px bg-zinc-800" />

            {/* 3. Subir */}
            <button
              aria-label="Subir seção"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={index === 0}
              onClick={() => moveWidget(widget.id, 'up')}
              title="Mover para cima"
              type="button"
            >
              <ArrowUp className="size-3.5" />
            </button>

            {/* 4. Descer */}
            <button
              aria-label="Descer seção"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg hover:bg-zinc-800 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={index === totalWidgets - 1}
              onClick={() => moveWidget(widget.id, 'down')}
              title="Mover para baixo"
              type="button"
            >
              <ArrowDown className="size-3.5" />
            </button>
          </div>

          {/* Janela Suspensa Shadcn Dark Mode de Opções (ancorada à direita abaixo da cápsula) */}
          {isMenuOpen && (
            <div className="absolute top-11 right-0 z-50 w-64 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              {/* Topo do Menu */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2">
                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                  {label}
                </span>
                <button
                  aria-label="Fechar"
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                  type="button"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Lista de Ações Limpas */}
              <div className="flex flex-col gap-1 text-xs">
                {/* Inserir Seção Acima */}
                <button
                  className="flex items-center gap-2 rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                  onClick={() => {
                    onAddAbove();
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  <Plus className="size-3.5 text-sky-400" />
                  <span>Inserir seção acima</span>
                </button>

                {/* Inserir Seção Abaixo */}
                <button
                  className="flex items-center gap-2 rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                  onClick={() => {
                    onAddBelow();
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  <Plus className="size-3.5 text-sky-400" />
                  <span>Inserir seção abaixo</span>
                </button>

                {/* Duplicar */}
                <button
                  className="flex items-center gap-2 rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                  onClick={() => {
                    addWidget(widget.type, index + 1);
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  <Copy className="size-3.5 text-zinc-400" />
                  <span>Duplicar seção</span>
                </button>

                {/* Visibilidade */}
                <button
                  className="flex items-center gap-2 rounded-lg p-2 text-zinc-300 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                  onClick={() => toggleWidget(widget.id)}
                  type="button"
                >
                  {widget.enabled ? (
                    <>
                      <Eye className="size-3.5 text-emerald-400" />
                      <span>Visível na vitrine</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-3.5 text-red-400" />
                      <span className="text-red-400">Oculto</span>
                    </>
                  )}
                </button>

                {/* Excluir Seção */}
                <div className="mt-1 pt-1 border-t border-zinc-800/80">
                  <button
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-red-400 hover:bg-red-950/40 hover:text-red-300 transition cursor-pointer"
                    onClick={() => {
                      if (confirm(`Remover "${label}" da página?`)) {
                        removeWidget(widget.id);
                        setIsMenuOpen(false);
                      }
                    }}
                    type="button"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Excluir seção</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Real do Widget */}
      <div className="relative">
        {children}
      </div>
    </section>
  );
}
