'use client';

import React from 'react';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useElementor } from './elementor-editor-context';

interface InlineImageEditorOverlayProps {
  widgetId: string;
  slideId: string;
  currentImageUrl: string;
  currentLinkUrl?: string;
  title?: string;
}

export function InlineImageEditorOverlay({
  widgetId,
  slideId,
  currentImageUrl,
  title,
}: InlineImageEditorOverlayProps) {
  const { isEditing, previewMode, openMediaModal, removeSlideFromWidget, addSlideToWidget } = useElementor();

  if (!isEditing || previewMode) return null;

  const handleRemoveSlide = () => {
    const itemName = title ? `"${title}"` : 'este slide';
    if (confirm(`Você tem certeza que deseja remover do slide o item ${itemName}?`)) {
      removeSlideFromWidget(widgetId, slideId);
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 opacity-0 transition-all duration-300 hover:opacity-100 backdrop-blur-[2px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botões Centrais Flutuantes Minimalistas (Estilo Dark / Shadcn) */}
      <div className="flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
        {/* BOTÃO PRINCIPAL: Trocar Imagem (Branco para cinza, animação e azul claro no hover) */}
        <button
          className="group/btn flex cursor-pointer items-center gap-2.5 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-5 py-3 text-zinc-300 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-sky-500/60 hover:bg-black hover:text-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]"
          onClick={() => openMediaModal({ widgetId, slideId, currentUrl: currentImageUrl })}
          title="Clique para escolher nova imagem ou enviar do computador"
          type="button"
        >
          <div className="relative transition-transform duration-200 group-hover/btn:scale-110">
            <ImageIcon className="size-5 transition-colors duration-200 group-hover/btn:text-sky-400" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            Trocar Imagem
          </span>
        </button>

        {/* BOTÃO: Remover este item do slide com confirmação */}
        <button
          aria-label="Remover item do slide"
          className="group/del flex size-11 cursor-pointer items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900/90 text-zinc-400 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-red-500/60 hover:bg-black hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
          onClick={handleRemoveSlide}
          title={`Remover este slide (${title || 'Slide'})`}
          type="button"
        >
          <Trash2 className="size-4.5 transition-transform duration-200 group-hover/del:scale-110" />
        </button>

        {/* BOTÃO: Adicionar novo slide */}
        <button
          aria-label="Adicionar novo slide"
          className="group/add flex size-11 cursor-pointer items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900/90 text-zinc-400 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-sky-500/60 hover:bg-black hover:text-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]"
          onClick={() => addSlideToWidget(widgetId)}
          title="Adicionar novo slide ao carrossel"
          type="button"
        >
          <Plus className="size-5 transition-transform duration-200 group-hover/add:scale-110" />
        </button>
      </div>
    </div>
  );
}
