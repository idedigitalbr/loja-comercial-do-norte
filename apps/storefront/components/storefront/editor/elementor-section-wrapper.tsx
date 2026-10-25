'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
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
    setActiveTab,
    setPanelCollapsed,
    addWidget,
  } = useElementor();

  const [isHovered, setIsHovered] = useState(false);

  // Se não estiver no modo de edição ou estiver no modo Preview, renderiza a seção limpa
  if (!isEditing || previewMode) {
    if (!widget.enabled) return null;
    return <section id={`section-${widget.id}`}>{children}</section>;
  }

  const isSelected = selectedWidgetId === widget.id;
  const meta = widgetLabels[widget.type] || {
    label: widget.type,
    badge: 'WIDGET',
    color: '#8C1D40',
  };

  return (
    <section
      className={`group/section relative transition-all duration-150 ${
        isSelected
          ? 'outline-2 outline-[#8C1D40] outline-offset-[-2px] z-20'
          : isHovered
            ? 'outline-1 outline-dashed outline-[#8C1D40]/70 z-10'
            : ''
      } ${!widget.enabled ? 'opacity-40 grayscale select-none' : ''}`}
      id={`section-${widget.id}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedWidgetId(widget.id);
        setPanelCollapsed(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Alça Superior Suspensa Estilo Elementor (Aparece no Hover ou quando Selecionado) */}
      <div
        className={`absolute -top-4.5 left-1/2 -translate-x-1/2 z-30 flex items-center transition-all duration-150 ${
          isHovered || isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center rounded-md bg-[#8C1D40] text-white shadow-lg overflow-hidden border border-white/20">
          {/* Botão + : Inserir seção acima */}
          <button
            aria-label="Adicionar seção acima"
            className="flex size-7 cursor-pointer items-center justify-center transition hover:bg-black/20"
            onClick={onAddAbove}
            title="Adicionar seção acima (+)"
            type="button"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
          </button>

          {/* Alça Central / Editar Seção ::: */}
          <button
            aria-label="Editar Seção"
            className={`flex h-7 items-center gap-1 px-2 font-bold text-xs cursor-pointer transition ${
              isSelected ? 'bg-black/25 text-white' : 'hover:bg-black/20'
            }`}
            onClick={() => {
              setSelectedWidgetId(widget.id);
              setActiveTab('content');
              setPanelCollapsed(false);
            }}
            title="Editar Seção no Painel"
            type="button"
          >
            <GripVertical className="size-3.5" />
            <span className="text-[11px] uppercase tracking-wide">Editar Seção</span>
          </button>

          {/* Duplicar widget */}
          <button
            aria-label="Duplicar seção"
            className="flex size-7 cursor-pointer items-center justify-center transition hover:bg-black/20"
            onClick={() => addWidget(widget.type, widget.order + 1)}
            title="Duplicar seção"
            type="button"
          >
            <Copy className="size-3.5" />
          </button>

          {/* Mover para Cima */}
          <button
            aria-label="Mover para cima"
            className="flex size-7 cursor-pointer items-center justify-center transition hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={index === 0}
            onClick={() => moveWidget(widget.id, 'up')}
            title="Mover para cima"
            type="button"
          >
            <ArrowUp className="size-3.5" />
          </button>

          {/* Mover para Baixo */}
          <button
            aria-label="Mover para baixo"
            className="flex size-7 cursor-pointer items-center justify-center transition hover:bg-black/20 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={index === totalWidgets - 1}
            onClick={() => moveWidget(widget.id, 'down')}
            title="Mover para baixo"
            type="button"
          >
            <ArrowDown className="size-3.5" />
          </button>

          {/* Ocultar / Mostrar */}
          <button
            aria-label="Ocultar / Mostrar seção"
            className="flex size-7 cursor-pointer items-center justify-center transition hover:bg-black/20"
            onClick={() => toggleWidget(widget.id)}
            title={widget.enabled ? 'Ocultar na vitrine' : 'Tornar visível'}
            type="button"
          >
            {widget.enabled ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-red-300" />}
          </button>

          {/* Botão X : Deletar seção */}
          <button
            aria-label="Excluir seção"
            className="flex size-7 cursor-pointer items-center justify-center transition bg-red-600/80 hover:bg-red-700"
            onClick={() => {
              if (confirm(`Remover "${meta.label}" da página?`)) {
                removeWidget(widget.id);
              }
            }}
            title="Excluir seção"
            type="button"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Badge de Identificação no Canto Superior Esquerdo */}
      <div
        className={`absolute top-2 left-2 z-20 flex items-center gap-1.5 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-xs transition-opacity duration-150 ${
          isHovered || isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <span>{meta.badge}</span>
        <span className="text-white/60">#{widget.id.slice(-4)}</span>
        {!widget.enabled && <span className="text-red-400 font-extrabold">(Oculto)</span>}
      </div>

      {/* Conteúdo Real do Widget */}
      <div className="relative">
        {children}
      </div>
    </section>
  );
}
