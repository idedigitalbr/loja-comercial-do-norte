'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Edit3, Eye, EyeOff, Layers, Trash2 } from 'lucide-react';
import { useEditor } from './editor-context';
import type { WidgetConfig } from '@/lib/storefront/widget-types';

const widgetLabels: Record<string, string> = {
  'hero-carousel': 'Carrossel Full Largura (Mercado Livre)',
  'contained-hero': 'Carrossel Padrão Contido (Campanhas)',
  'benefits-bar': 'Linha de 4 Cards / Ícones (Benefícios)',
  'product-carousel': 'Vitrine de Produtos / Ofertas',
  'category-grid': 'Grade de Departamentos',
};

export function WidgetContainer({
  widget,
  children,
  isFirst,
  isLast,
}: {
  widget: WidgetConfig;
  children: React.ReactNode;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { isEditing, selectedWidgetId, setSelectedWidgetId, moveWidget, removeWidget, toggleWidget } = useEditor();

  if (!isEditing) {
    if (!widget.enabled) return null;
    return <>{children}</>;
  }

  const isSelected = selectedWidgetId === widget.id;
  const label = widgetLabels[widget.type] || widget.type;

  return (
    <div
      className={`group/widget relative my-2 transition-all duration-200 ${
        isSelected
          ? 'ring-4 ring-[#004CB1] rounded-2xl bg-blue-50/10'
          : 'hover:ring-2 hover:ring-dashed hover:ring-[#004CB1]/60 rounded-xl'
      } ${!widget.enabled ? 'opacity-40 grayscale' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedWidgetId(widget.id);
      }}
    >
      {/* Barra de Ação Suspensa do Widget no Modo Edição */}
      <div className="sticky top-20 z-40 mb-1 flex items-center justify-between gap-2 rounded-t-xl bg-[#004CB1] px-4 py-2 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Layers aria-hidden className="size-4 text-white/80" />
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
          {!widget.enabled ? (
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase">Oculto</span>
          ) : null}
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Subir */}
          <button
            aria-label="Mover para cima"
            className="flex size-7 cursor-pointer items-center justify-center rounded bg-white/10 hover:bg-white/25 disabled:opacity-30"
            disabled={isFirst}
            onClick={() => moveWidget(widget.id, 'up')}
            title="Mover para cima"
            type="button"
          >
            <ArrowUp className="size-3.5" />
          </button>

          {/* Descer */}
          <button
            aria-label="Mover para baixo"
            className="flex size-7 cursor-pointer items-center justify-center rounded bg-white/10 hover:bg-white/25 disabled:opacity-30"
            disabled={isLast}
            onClick={() => moveWidget(widget.id, 'down')}
            title="Mover para baixo"
            type="button"
          >
            <ArrowDown className="size-3.5" />
          </button>

          {/* Visibilidade */}
          <button
            aria-label="Alternar visibilidade"
            className="flex size-7 cursor-pointer items-center justify-center rounded bg-white/10 hover:bg-white/25"
            onClick={() => toggleWidget(widget.id)}
            title={widget.enabled ? 'Ocultar widget' : 'Ativar widget'}
            type="button"
          >
            {widget.enabled ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-red-300" />}
          </button>

          {/* Editar no Painel */}
          <button
            aria-label="Editar propriedades"
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              isSelected ? 'bg-white text-[#004CB1]' : 'bg-white/20 hover:bg-white text-white hover:text-[#004CB1]'
            }`}
            onClick={() => setSelectedWidgetId(widget.id)}
            type="button"
          >
            <Edit3 className="size-3" />
            <span>Editar</span>
          </button>

          {/* Excluir */}
          <button
            aria-label="Remover widget"
            className="flex size-7 cursor-pointer items-center justify-center rounded bg-red-600/80 hover:bg-red-600 text-white"
            onClick={() => {
              if (confirm(`Remover a seção "${label}" da vitrine?`)) {
                removeWidget(widget.id);
              }
            }}
            title="Excluir widget"
            type="button"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Conteúdo Real do Widget */}
      <div className="relative pointer-events-auto">{children}</div>
    </div>
  );
}
