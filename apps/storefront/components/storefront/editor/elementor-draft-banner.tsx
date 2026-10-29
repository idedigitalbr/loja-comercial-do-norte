'use client';

import React, { useState } from 'react';
import { AlertTriangle, Edit3, Trash2, X, RefreshCw } from 'lucide-react';
import { useElementor } from './elementor-editor-context';

export function ElementorDraftBanner() {
  const { hasDraft, isEditing, previewMode, setIsEditing, setPreviewMode, discardDraft } = useElementor();
  const [dismissed, setDismissed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Não exibe se não houver rascunho, ou se foi dispensado, ou se estiver editando no Elementor
  if (!hasDraft || dismissed || (isEditing && !previewMode)) {
    return null;
  }

  const handleDeleteDraft = async () => {
    setIsDeleting(true);
    try {
      await discardDraft(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditor = () => {
    setIsEditing(true);
    setPreviewMode(false);
  };

  return (
    <aside
      aria-label="Aviso de versão rascunho da vitrine"
      className="sticky top-0 z-[9990] w-full border-b border-amber-500/50 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 shadow-md backdrop-blur-md"
    >
      <div className="cn-container flex flex-wrap items-center justify-between gap-3 py-2 px-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-900/15 text-amber-950 shadow-xs">
            <AlertTriangle className="size-4" />
          </div>
          <div className="leading-tight text-xs sm:text-sm">
            <span className="font-extrabold uppercase tracking-wide">
              Modo Rascunho (Draft) Ativo:
            </span>{' '}
            <span className="font-medium text-amber-950/90">
              Você está visualizando uma versão não publicada / rascunho local da vitrine.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#002868] px-3 py-1.5 font-bold text-white shadow-xs transition hover:bg-[#003E99] active:scale-95"
            onClick={handleOpenEditor}
            title="Abrir o editor visual Elementor para atualizar ou editar a página"
            type="button"
          >
            <Edit3 className="size-3.5" />
            <span>Abrir no Editor</span>
          </button>

          <button
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-xs transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
            disabled={isDeleting}
            onClick={handleDeleteDraft}
            title="Excluir o rascunho local e restaurar a versão oficial do código"
            type="button"
          >
            {isDeleting ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            <span>Excluir Rascunho</span>
          </button>

          <button
            aria-label="Ocultar aviso de rascunho"
            className="cursor-pointer rounded-md p-1 text-amber-950/70 transition hover:bg-amber-900/10 hover:text-amber-950"
            onClick={() => setDismissed(true)}
            title="Fechar aviso temporariamente"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
