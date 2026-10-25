'use client';

import React from 'react';
import {
  Check,
  ChevronDown,
  Eye,
  HelpCircle,
  Laptop,
  Layers,
  Plus,
  Redo2,
  Save,
  Search,
  Smartphone,
  Tablet,
  Undo2,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';

export function ElementorTopBar() {
  const {
    isEditing,
    setIsEditing,
    previewMode,
    setPreviewMode,
    viewport,
    setViewport,
    showNavigator,
    setShowNavigator,
    setSelectedWidgetId,
    saveComposition,
    hasUnsavedChanges,
    saveMessage,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToDefault,
  } = useElementor();

  if (!isEditing) return null;

  return (
    <>
      {/* Toast flutuante de sucesso */}
      {saveMessage ? (
        <div className="fixed top-14 right-6 z-[9999] flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Check className="size-4" />
          <span className="text-xs">{saveMessage}</span>
        </div>
      ) : null}

      <header
        aria-label="Barra de Ferramentas Superior Elementor"
        className="sticky top-0 z-[100] flex h-12 w-full items-center justify-between border-b border-black/40 bg-[#161719] px-3 text-white select-none shadow-md"
      >
        {/* Lado Esquerdo: Marca, Add Widget, Undo/Redo e Título da Página */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logo Elementor Círculo 'E' */}
          <div
            className="flex size-7.5 items-center justify-center rounded-full bg-[#E2091E] font-black text-sm text-white shadow-sm cursor-pointer"
            title="Comercial do Norte - Elementor Studio"
          >
            <span>E</span>
          </div>

          {/* Botão + Add Element */}
          <button
            aria-label="Adicionar Elemento"
            className="flex size-7 cursor-pointer items-center justify-center rounded text-white/80 transition hover:bg-white/10 hover:text-white"
            onClick={() => {
              setSelectedWidgetId('NEW_WIDGET_CATALOG');
              setPreviewMode(false);
            }}
            title="Adicionar Widget (+)"
            type="button"
          >
            <Plus className="size-4.5 stroke-[2.2]" />
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border-l border-white/10 pl-2">
            <button
              aria-label="Desfazer"
              className="flex size-7 cursor-pointer items-center justify-center rounded text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!canUndo}
              onClick={undo}
              title="Desfazer (Ctrl+Z)"
              type="button"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              aria-label="Refazer"
              className="flex size-7 cursor-pointer items-center justify-center rounded text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!canRedo}
              onClick={redo}
              title="Refazer (Ctrl+Y)"
              type="button"
            >
              <Redo2 className="size-3.5" />
            </button>
          </div>

          {/* Título da Página */}
          <div className="hidden items-center gap-1.5 border-l border-white/10 pl-3 md:flex">
            <span className="text-xs font-semibold text-white/90">Home (Comercial do Norte)</span>
            <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-white/60">Rascunho</span>
            <ChevronDown className="size-3 text-white/60" />
          </div>
        </div>

        {/* Centro: Seletor de Responsividade (Desktop / Tablet / Mobile) */}
        <div className="flex items-center gap-1 rounded-lg bg-black/40 p-1 border border-white/5">
          <button
            aria-label="Visualização Desktop"
            className={`flex size-7 cursor-pointer items-center justify-center rounded transition ${
              viewport === 'desktop'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setViewport('desktop')}
            title="Desktop (100%)"
            type="button"
          >
            <Laptop className="size-4" />
          </button>

          <button
            aria-label="Visualização Tablet"
            className={`flex size-7 cursor-pointer items-center justify-center rounded transition ${
              viewport === 'tablet'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setViewport('tablet')}
            title="Tablet (768px)"
            type="button"
          >
            <Tablet className="size-4" />
          </button>

          <button
            aria-label="Visualização Mobile"
            className={`flex size-7 cursor-pointer items-center justify-center rounded transition ${
              viewport === 'mobile'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setViewport('mobile')}
            title="Mobile (390px)"
            type="button"
          >
            <Smartphone className="size-4" />
          </button>
        </div>

        {/* Lado Direito: Navigator, Preview e Botão Publish */}
        <div className="flex items-center gap-2">
          {/* Navigator / Estrutura em Árvore */}
          <button
            aria-label="Estrutura da Página"
            className={`flex size-7 cursor-pointer items-center justify-center rounded transition ${
              showNavigator ? 'bg-[#004CB1] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setShowNavigator(!showNavigator)}
            title="Estrutura / Navigator"
            type="button"
          >
            <Layers className="size-4" />
          </button>

          {/* Preview Mode */}
          <button
            aria-label="Pré-visualizar sem interface"
            className={`flex size-7 cursor-pointer items-center justify-center rounded transition ${
              previewMode ? 'bg-[#E2091E] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setPreviewMode(!previewMode)}
            title={previewMode ? 'Sair do Modo Preview' : 'Modo Preview (Ocultar painéis)'}
            type="button"
          >
            <Eye className="size-4" />
          </button>

          {/* Resetar Padrão Oficial */}
          <button
            className="hidden text-[11px] text-white/50 hover:text-white/90 underline cursor-pointer lg:inline-block pr-1"
            onClick={resetToDefault}
            title="Voltar ao layout original oficial"
            type="button"
          >
            Resetar
          </button>

          {/* Botão PUBLISH oficial (Lilás/Rosa Elementor ou Verde Publicar) */}
          <div className="flex items-center overflow-hidden rounded-md shadow-sm">
            <button
              className={`flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white transition ${
                hasUnsavedChanges
                  ? 'bg-[#E2091E] hover:bg-[#C92F27] animate-pulse'
                  : 'bg-[#92003B] hover:bg-[#7a0031]'
              }`}
              onClick={saveComposition}
              type="button"
            >
              <Save className="size-3.5" />
              <span>{hasUnsavedChanges ? 'Publicar *' : 'Publicado'}</span>
            </button>
          </div>

          {/* Sair do Elementor */}
          <button
            aria-label="Fechar Modo Edição"
            className="flex size-7 cursor-pointer items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              setSelectedWidgetId(null);
              setIsEditing(false);
              setPreviewMode(false);
            }}
            title="Sair do Elementor e voltar à loja"
            type="button"
          >
            <X className="size-4.5" />
          </button>
        </div>
      </header>
    </>
  );
}
