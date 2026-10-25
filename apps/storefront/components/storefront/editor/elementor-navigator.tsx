'use client';

import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Grid,
  Layers,
  Layout,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Tv,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { WidgetType } from '@/lib/storefront/widget-types';

const widgetIcons: Record<string, React.ElementType> = {
  'hero-carousel': Tv,
  'contained-hero': Layout,
  'benefits-bar': Sparkles,
  'product-carousel': ShoppingBag,
  'category-grid': Grid,
};

const widgetFriendlyNames: Record<string, string> = {
  'hero-carousel': 'Carrossel Full (Hero ML)',
  'contained-hero': 'Carrossel Padrão (Campanhas)',
  'benefits-bar': 'Barra de Benefícios (4 Ícones)',
  'product-carousel': 'Vitrine de Produtos / Ofertas',
  'category-grid': 'Grade de Departamentos',
};

export function ElementorNavigator() {
  const {
    isEditing,
    previewMode,
    showNavigator,
    setShowNavigator,
    composition,
    selectedWidgetId,
    setSelectedWidgetId,
    moveWidget,
    removeWidget,
    toggleWidget,
    setActiveTab,
    setPanelCollapsed,
  } = useElementor();

  if (!isEditing || previewMode || !showNavigator) return null;

  const sortedWidgets = [...composition.widgets].sort((a, b) => a.order - b.order);

  const handleSelect = (id: string) => {
    setSelectedWidgetId(id);
    setActiveTab('content');
    setPanelCollapsed(false);

    // Scroll suave até o elemento
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <aside
      aria-label="Navegador de Seções"
      className="fixed bottom-6 right-6 z-[90] flex w-80 flex-col rounded-xl border border-slate-300 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {/* Cabeçalho do Navegador Elementor */}
      <div className="flex h-10 items-center justify-between bg-[#26292c] px-3 text-white select-none">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-[#8C1D40]" />
          <span className="text-xs font-bold tracking-wide">Navegador da Vitrine</span>
          <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-white/70">
            {sortedWidgets.length} seções
          </span>
        </div>

        <button
          aria-label="Fechar Navegador"
          className="flex size-6 cursor-pointer items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white"
          onClick={() => setShowNavigator(false)}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Lista em Árvore das Seções */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
        {sortedWidgets.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            Nenhuma seção adicionada. Use o botão + para criar seções.
          </div>
        ) : (
          sortedWidgets.map((widget, idx) => {
            const Icon = widgetIcons[widget.type] || Layers;
            const isSelected = selectedWidgetId === widget.id;
            const name = widgetFriendlyNames[widget.type] || widget.type;

            return (
              <div
                className={`group flex items-center justify-between rounded-lg p-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#8C1D40]/10 text-[#8C1D40] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                } ${!widget.enabled ? 'opacity-40 grayscale' : ''}`}
                key={widget.id}
                onClick={() => handleSelect(widget.id)}
              >
                {/* Ícone e Nome da Seção */}
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded ${
                      isSelected ? 'bg-[#8C1D40] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="truncate text-xs">
                    <span className="block truncate">{name}</span>
                    <span className="block text-[10px] text-slate-400">#{widget.id.slice(-4)}</span>
                  </div>
                </div>

                {/* Ações Rápidas da Linha */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {/* Subir */}
                  <button
                    aria-label="Mover para cima"
                    className="flex size-6 cursor-pointer items-center justify-center rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20"
                    disabled={idx === 0}
                    onClick={() => moveWidget(widget.id, 'up')}
                    title="Mover para cima"
                    type="button"
                  >
                    <ArrowUp className="size-3" />
                  </button>

                  {/* Descer */}
                  <button
                    aria-label="Mover para baixo"
                    className="flex size-6 cursor-pointer items-center justify-center rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20"
                    disabled={idx === sortedWidgets.length - 1}
                    onClick={() => moveWidget(widget.id, 'down')}
                    title="Mover para baixo"
                    type="button"
                  >
                    <ArrowDown className="size-3" />
                  </button>

                  {/* Visibilidade */}
                  <button
                    aria-label="Alternar visibilidade"
                    className="flex size-6 cursor-pointer items-center justify-center rounded hover:bg-slate-200 text-slate-600"
                    onClick={() => toggleWidget(widget.id)}
                    title={widget.enabled ? 'Ocultar' : 'Mostrar'}
                    type="button"
                  >
                    {widget.enabled ? <Eye className="size-3" /> : <EyeOff className="size-3 text-red-500" />}
                  </button>

                  {/* Deletar */}
                  <button
                    aria-label="Remover seção"
                    className="flex size-6 cursor-pointer items-center justify-center rounded hover:bg-red-50 text-red-500"
                    onClick={() => {
                      if (confirm(`Remover "${name}"?`)) {
                        removeWidget(widget.id);
                      }
                    }}
                    title="Excluir"
                    type="button"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé do Navegador com Atalho para Adicionar Seção */}
      <div className="border-t border-slate-100 bg-slate-50 p-2">
        <button
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#8C1D40]/40 bg-white py-1.5 text-xs font-bold text-[#8C1D40] transition hover:border-[#8C1D40] hover:bg-[#8C1D40]/5"
          onClick={() => setSelectedWidgetId('NEW_WIDGET_CATALOG')}
          type="button"
        >
          <Plus className="size-3.5" />
          <span>Adicionar Nova Seção</span>
        </button>
      </div>
    </aside>
  );
}
