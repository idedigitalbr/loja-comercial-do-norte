'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Palette,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { WidgetConfig } from '@/lib/storefront/widget-types';

const widgetLabels: Record<string, { label: string; badge: string; color: string }> = {
  'hero-carousel': {
    label: 'Carrossel Full Largura (Mercado Livre)',
    badge: 'HERO',
    color: '#004CB1',
  },
  'contained-hero': {
    label: 'Carrossel Padrão (Campanhas)',
    badge: 'BANNER',
    color: '#E2091E',
  },
  'benefits-bar': {
    label: 'Barra de Benefícios (4 Ícones)',
    badge: 'ICONS',
    color: '#028F34',
  },
  'product-carousel': {
    label: 'Carrossel de Produtos / Ofertas',
    badge: 'PRODUTOS',
    color: '#FF7A00',
  },
  'category-grid': {
    label: 'Grade de Departamentos',
    badge: 'CATEGORIAS',
    color: '#8C1D40',
  },
};

export function ElementorSectionWrapper({
  widget,
  index,
  totalWidgets,
  children,
  onAddAbove,
}: {
  widget: WidgetConfig;
  index: number;
  totalWidgets: number;
  children: React.ReactNode;
  onAddAbove: () => void;
}) {
  const {
    isEditing,
    previewMode,
    selectedWidgetId,
    setSelectedWidgetId,
    moveWidget,
    removeWidget,
    toggleWidget,
    addWidget,
    updateWidgetProps,
  } = useElementor();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Se não estiver editando ou estiver em modo Preview, renderiza a seção de forma 100% limpa
  if (!isEditing || previewMode) {
    if (!widget.enabled) return null;
    return <section id={`section-${widget.id}`}>{children}</section>;
  }

  const isSelected = selectedWidgetId === widget.id;
  const meta = widgetLabels[widget.type] || {
    label: widget.type,
    badge: 'WIDGET',
    color: '#004CB1',
  };

  return (
    <section
      className={`group/section relative transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-[#004CB1] rounded-2xl'
          : 'hover:ring-2 hover:ring-dashed hover:ring-[#004CB1]/40 rounded-2xl'
      } ${!widget.enabled ? 'opacity-40 grayscale select-none' : ''}`}
      id={`section-${widget.id}`}
      onClick={() => setSelectedWidgetId(widget.id)}
    >
      {/* LAPIZINHO MINIMALISTA: Aparece suavemente no canto superior direito no hover (Conforme solicitado) */}
      <div
        className="absolute top-3 right-4 z-40 transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* O Lápis Botão Minimalista com Badge */}
          <button
            aria-label={`Editar ${meta.label}`}
            className="flex items-center gap-1.5 rounded-full bg-[#004CB1] px-3 py-1.5 text-xs font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#00357B] cursor-pointer opacity-0 group-hover/section:opacity-100 group-hover/section:translate-y-0 translate-y-1 focus:opacity-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Clique para abrir opções desta seção"
            type="button"
          >
            <Edit3 className="size-3.5" />
            <span>Editar Seção</span>
            <span
              className="ml-1 rounded px-1.5 py-0.2 text-[9px] font-black text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.badge}
            </span>
          </button>

          {/* JANELA FLUTUANTE / TOOLTIP DE OPÇÕES DA SEÇÃO (Abre ao clicar no lápis) */}
          {isMenuOpen && (
            <div className="absolute top-10 right-0 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
              {/* Cabeçalho do Popover */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs font-bold truncate max-w-[170px]">{meta.label}</span>
                </div>
                <button
                  aria-label="Fechar"
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                  type="button"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Grid de Ações Rápidas da Seção */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {/* Mover para Cima */}
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-medium text-slate-700"
                  disabled={index === 0}
                  onClick={() => moveWidget(widget.id, 'up')}
                  type="button"
                >
                  <ArrowUp className="size-3.5 text-[#004CB1]" />
                  <span>Subir</span>
                </button>

                {/* Mover para Baixo */}
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-medium text-slate-700"
                  disabled={index === totalWidgets - 1}
                  onClick={() => moveWidget(widget.id, 'down')}
                  type="button"
                >
                  <ArrowDown className="size-3.5 text-[#004CB1]" />
                  <span>Descer</span>
                </button>

                {/* Duplicar Seção */}
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition cursor-pointer font-medium text-slate-700"
                  onClick={() => {
                    addWidget(widget.type, widget.order + 1);
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  <Copy className="size-3.5 text-slate-600" />
                  <span>Duplicar</span>
                </button>

                {/* Alternar Visibilidade */}
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition cursor-pointer font-medium text-slate-700"
                  onClick={() => toggleWidget(widget.id)}
                  type="button"
                >
                  {widget.enabled ? (
                    <>
                      <Eye className="size-3.5 text-emerald-600" />
                      <span>Visível</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-3.5 text-red-500" />
                      <span className="text-red-500 font-bold">Oculto</span>
                    </>
                  )}
                </button>
              </div>

              {/* Botão de Inserir Seção Acima */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <button
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-1.5 text-xs font-bold text-[#004CB1] hover:bg-blue-100 transition cursor-pointer"
                  onClick={() => {
                    onAddAbove();
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  <Plus className="size-3.5" />
                  <span>Inserir Nova Seção Acima</span>
                </button>

                {/* Excluir Seção */}
                <button
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-50 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                  onClick={() => {
                    if (confirm(`Remover "${meta.label}" da página?`)) {
                      removeWidget(widget.id);
                      setIsMenuOpen(false);
                    }
                  }}
                  type="button"
                >
                  <Trash2 className="size-3.5" />
                  <span>Excluir Seção</span>
                </button>
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
