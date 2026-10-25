'use client';

import React from 'react';
import { ImageUp, Link2, Plus, Trash2 } from 'lucide-react';
import { useElementor } from './elementor-editor-context';

interface InlineImageEditorOverlayProps {
  widgetId: string;
  slideId?: string;
  slideIndex?: number;
  currentImageUrl?: string;
  previewUrl?: string;
  currentLinkUrl?: string;
  fieldPath?: string;
  linkFieldPath?: string;
  title?: string;
  canAdd?: boolean;
  canRemove?: boolean;
}

export function InlineImageEditorOverlay({
  widgetId,
  slideId,
  slideIndex,
  currentImageUrl,
  previewUrl,
  currentLinkUrl = '',
  fieldPath,
  linkFieldPath,
  title,
  canAdd = true,
  canRemove = true,
}: InlineImageEditorOverlayProps) {
  const {
    isEditing,
    previewMode,
    openMediaModal,
    openLinkModal,
    removeSlideFromWidget,
    addSlideToWidget,
  } = useElementor();

  if (!isEditing || previewMode) return null;

  const effectiveImageUrl = currentImageUrl || previewUrl || '';

  const handleRemoveSlide = () => {
    if (!slideId) return;
    const itemName = title ? `"${title}"` : 'este slide';
    if (confirm(`Você tem certeza que deseja remover do slide o item ${itemName}?`)) {
      removeSlideFromWidget(widgetId, slideId);
    }
  };

  const hasActiveLink = Boolean(currentLinkUrl && currentLinkUrl.trim() !== '' && currentLinkUrl !== '#');

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 opacity-0 transition-all duration-300 hover:opacity-100 backdrop-blur-[2px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barra Flutuante Minimalista de Ícones no Centro (Estilo Dark / Shadcn) */}
      <div className="flex items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        {/* 1. ÍCONE TROCAR IMAGEM (Ícone de imagem com setinha de upload para cima) */}
        <div className="group/tip relative flex items-center justify-center">
          <button
            aria-label="Trocar imagem do banner"
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition-all duration-150 hover:bg-zinc-800 hover:text-sky-400 hover:scale-105 active:scale-95"
            onClick={() =>
              openMediaModal({
                widgetId,
                slideId,
                slideIndex,
                fieldPath,
                currentUrl: effectiveImageUrl,
                previewUrl: effectiveImageUrl,
                slideTitle: title,
                title,
              })
            }
            type="button"
          >
            <ImageUp className="size-4.5" />
          </button>
          <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[9px] font-normal tracking-widest text-zinc-300 uppercase shadow-xl opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 z-50">
            Trocar Imagem
          </span>
        </div>

        {/* 2. ÍCONE TROCAR LINK */}
        <div className="group/tip relative flex items-center justify-center">
          <button
            aria-label="Configurar link do banner"
            className="relative flex size-9 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition-all duration-150 hover:bg-zinc-800 hover:text-sky-400 hover:scale-105 active:scale-95"
            onClick={() =>
              openLinkModal({
                widgetId,
                slideId: slideId || '',
                fieldPath: linkFieldPath,
                currentLinkUrl,
                currentImageUrl: effectiveImageUrl,
                slideTitle: title,
              })
            }
            type="button"
          >
            <Link2 className="size-4.5" />
            {hasActiveLink && (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
            )}
          </button>
          <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[9px] font-normal tracking-widest text-zinc-300 uppercase shadow-xl opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 z-50">
            {hasActiveLink ? 'Trocar Link' : 'Adicionar Link'}
          </span>
        </div>

        {(canAdd || (canRemove && slideId)) && (
          <span className="h-4 w-px bg-zinc-800 mx-0.5" />
        )}

        {/* 3. ÍCONE ADICIONAR NOVO SLIDE */}
        {canAdd && (
          <div className="group/tip relative flex items-center justify-center">
            <button
              aria-label="Adicionar novo slide"
              className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition-all duration-150 hover:bg-zinc-800 hover:text-sky-400 hover:scale-105 active:scale-95"
              onClick={() => addSlideToWidget(widgetId)}
              type="button"
            >
              <Plus className="size-4.5" />
            </button>
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[9px] font-normal tracking-widest text-zinc-300 uppercase shadow-xl opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 z-50">
              Novo Slide
            </span>
          </div>
        )}

        {/* 4. ÍCONE REMOVER SLIDE */}
        {canRemove && slideId && (
          <div className="group/tip relative flex items-center justify-center">
            <button
              aria-label="Remover item do slide"
              className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition-all duration-150 hover:bg-zinc-800 hover:text-red-400 hover:scale-105 active:scale-95"
              onClick={handleRemoveSlide}
              type="button"
            >
              <Trash2 className="size-4" />
            </button>
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[9px] font-normal tracking-widest text-zinc-300 uppercase shadow-xl opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 z-50">
              Remover Slide
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
