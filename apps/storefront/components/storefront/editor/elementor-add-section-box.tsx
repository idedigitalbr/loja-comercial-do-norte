'use client';

import React, { useState } from 'react';
import { Folder, Plus } from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { WidgetType } from '@/lib/storefront/widget-types';

interface ElementorAddSectionBoxProps {
  insertIndex?: number;
}

export function ElementorAddSectionBox({ insertIndex }: ElementorAddSectionBoxProps) {
  const { isEditing, previewMode, addWidget, setSelectedWidgetId, setPanelCollapsed, setActiveTab } = useElementor();
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isEditing || previewMode) return null;

  const handleOpenWidgetCatalog = () => {
    setSelectedWidgetId('NEW_WIDGET_CATALOG');
    setPanelCollapsed(false);
    setActiveTab('content');
  };

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
      <div
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 px-4 transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-[#8C1D40] bg-[#8C1D40]/10 scale-[1.01] shadow-lg ring-2 ring-[#8C1D40]/30'
            : 'border-[#c2cbd2] bg-white/70 hover:border-[#8C1D40] hover:bg-white hover:shadow-md'
        }`}
        onClick={handleOpenWidgetCatalog}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Círculos Centrais Estilo Elementor */}
        <div className="flex items-center gap-4">
          {/* Botão + Vinho Elementor */}
          <button
            aria-label="Abrir Biblioteca de Widgets à Esquerda"
            className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-[#8C1D40] text-white shadow-md transition-transform duration-150 group-hover:scale-110 hover:bg-[#a6224c]"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenWidgetCatalog();
            }}
            title="Abrir Biblioteca de Widgets à Esquerda"
            type="button"
          >
            <Plus className="size-6 stroke-[2.6]" />
          </button>

          {/* Botão Pasta Cinza */}
          <button
            aria-label="Biblioteca de Widgets"
            className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-[#6d7882] text-white shadow-md transition-transform duration-150 hover:scale-110 hover:bg-[#555d65]"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenWidgetCatalog();
            }}
            title="Abrir Biblioteca de Widgets à Esquerda"
            type="button"
          >
            <Folder className="size-5" />
          </button>
        </div>

        {/* Texto de Apoio Clássico do Elementor */}
        <p className="mt-3 text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-800">
          {isDragOver ? (
            <span className="font-bold text-[#8C1D40]">Solte o widget aqui para adicionar nesta posição</span>
          ) : (
            <>
              Arraste um widget aqui ou clique no <span className="font-bold text-[#8C1D40]">+</span> para abrir os widgets à esquerda
            </>
          )}
        </p>
      </div>
    </div>
  );
}
