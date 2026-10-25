'use client';

import React from 'react';
import { Check, Edit, PlusCircle, RotateCcw, Save, Sliders, X } from 'lucide-react';
import { useEditor } from './editor-context';

export function EditorToolbar() {
  const {
    isEditing,
    setIsEditing,
    saveComposition,
    resetToDefault,
    hasUnsavedChanges,
    saveMessage,
    setSelectedWidgetId,
  } = useEditor();

  if (!isEditing) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          className="group flex cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-[#004CB1] to-[#E2091E] px-5 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30"
          onClick={() => setIsEditing(true)}
          type="button"
        >
          <Edit className="size-5 transition-transform group-hover:rotate-12" />
          <span className="text-sm tracking-wide">Editar Vitrine (Elementor)</span>
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Barra de Notificação Toast de Sucesso */}
      {saveMessage ? (
        <div className="fixed top-20 right-6 z-[70] flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Check className="size-5" />
          <span className="text-sm">{saveMessage}</span>
        </div>
      ) : null}

      {/* Barra Superior Fixa de Controle do Modo Editor */}
      <div className="sticky top-0 z-[60] w-full border-b border-white/10 bg-[#13213B] px-4 py-2.5 text-white shadow-xl">
        <div className="cn-container flex flex-wrap items-center justify-between gap-3">
          {/* Lado Esquerdo: Identificação do Modo */}
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#004CB1] text-white">
              <Sliders className="size-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">Modo Editor da Vitrine</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  AO VIVO
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Selecione seções na página ou adicione widgets para editar em tempo real.
              </p>
            </div>
          </div>

          {/* Lado Direito: Ações */}
          <div className="flex items-center gap-2">
            {/* Abrir catálogo de widgets */}
            <button
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              onClick={() => setSelectedWidgetId('NEW_WIDGET_CATALOG')}
              type="button"
            >
              <PlusCircle className="size-3.5" />
              <span>Adicionar Widget</span>
            </button>

            {/* Restaurar padrão oficial */}
            <button
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20 hover:text-white"
              onClick={resetToDefault}
              type="button"
            >
              <RotateCcw className="size-3.5" />
              <span>Restaurar</span>
            </button>

            {/* Salvar */}
            <button
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold shadow-md transition ${
                hasUnsavedChanges
                  ? 'bg-[#E33C34] hover:bg-[#C92F27] text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              onClick={saveComposition}
              type="button"
            >
              <Save className="size-3.5" />
              <span>{hasUnsavedChanges ? 'Salvar Alterações *' : 'Salvo no Navegador'}</span>
            </button>

            {/* Sair do Modo de Edição */}
            <button
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              onClick={() => {
                setSelectedWidgetId(null);
                setIsEditing(false);
              }}
              title="Fechar editor"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
