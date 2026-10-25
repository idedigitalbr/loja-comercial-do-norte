'use client';

import React, { useState } from 'react';
import { Check, Image as ImageIcon, Link2, Plus, Trash2, Unlink, X } from 'lucide-react';
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
  currentLinkUrl = '',
  title,
}: InlineImageEditorOverlayProps) {
  const {
    isEditing,
    previewMode,
    openMediaModal,
    removeSlideFromWidget,
    addSlideToWidget,
    updateSlideInWidget,
  } = useElementor();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState(currentLinkUrl);

  if (!isEditing || previewMode) return null;

  const handleRemoveSlide = () => {
    const itemName = title ? `"${title}"` : 'este slide';
    if (confirm(`Você tem certeza que deseja remover do slide o item ${itemName}?`)) {
      removeSlideFromWidget(widgetId, slideId);
    }
  };

  const handleSaveLink = (newUrl: string) => {
    const cleanUrl = newUrl.trim();
    updateSlideInWidget(widgetId, slideId, { linkUrl: cleanUrl });
    setIsLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    updateSlideInWidget(widgetId, slideId, { linkUrl: '' });
    setLinkInput('');
    setIsLinkModalOpen(false);
  };

  const hasActiveLink = Boolean(currentLinkUrl && currentLinkUrl.trim() !== '' && currentLinkUrl !== '#');

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 opacity-0 transition-all duration-300 hover:opacity-100 backdrop-blur-[2px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botões Centrais Flutuantes Minimalistas (Estilo Dark / Shadcn) */}
      <div className="relative flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
        {/* 1. BOTÃO TROCAR IMAGEM (Ícone em cima, texto em baixo em MAIÚSCULA minimalista) */}
        <button
          className="group/btn flex min-w-[96px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-zinc-700/80 bg-zinc-950/90 px-3.5 py-2.5 text-zinc-300 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-sky-500/70 hover:bg-black hover:text-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.3)]"
          onClick={() => openMediaModal({ widgetId, slideId, currentUrl: currentImageUrl })}
          title="Clique para escolher nova imagem ou enviar do computador"
          type="button"
        >
          <div className="relative transition-transform duration-200 group-hover/btn:scale-110">
            <ImageIcon className="size-5 transition-colors duration-200 group-hover/btn:text-sky-400" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-300 group-hover/btn:text-sky-300">
            Trocar Imagem
          </span>
        </button>

        {/* 2. BOTÃO TROCAR LINK (Ao lado do trocar imagem, ícone em cima, texto em baixo em MAIÚSCULA minimalista) */}
        <button
          className={`group/link flex min-w-[96px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border bg-zinc-950/90 px-3.5 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black hover:shadow-[0_0_25px_rgba(56,189,248,0.3)] ${
            hasActiveLink
              ? 'border-sky-500/60 text-sky-400 hover:border-sky-400'
              : 'border-zinc-700/80 text-zinc-300 hover:border-sky-500/70 hover:text-sky-400'
          }`}
          onClick={() => {
            setLinkInput(currentLinkUrl || '');
            setIsLinkModalOpen(true);
          }}
          title={hasActiveLink ? `Link ativo: ${currentLinkUrl}` : 'Sem link no banner (clique para definir)'}
          type="button"
        >
          <div className="relative transition-transform duration-200 group-hover/link:scale-110">
            <Link2 className="size-5 transition-colors duration-200" />
            {hasActiveLink && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-300 group-hover/link:text-sky-300">
            {hasActiveLink ? 'Trocar Link' : 'Definir Link'}
          </span>
        </button>

        {/* 3. BOTÃO REMOVER SLIDE (Lixeira com confirmação) */}
        <button
          aria-label="Remover item do slide"
          className="group/del flex size-12 cursor-pointer flex-col items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-950/90 text-zinc-400 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-red-500/70 hover:bg-black hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          onClick={handleRemoveSlide}
          title={`Remover este slide (${title || 'Slide'})`}
          type="button"
        >
          <Trash2 className="size-4.5 transition-transform duration-200 group-hover/del:scale-110" />
        </button>

        {/* 4. BOTÃO ADICIONAR NOVO SLIDE */}
        <button
          aria-label="Adicionar novo slide"
          className="group/add flex size-12 cursor-pointer flex-col items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-950/90 text-zinc-400 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-sky-500/70 hover:bg-black hover:text-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          onClick={() => addSlideToWidget(widgetId)}
          title="Adicionar novo slide ao carrossel"
          type="button"
        >
          <Plus className="size-5 transition-transform duration-200 group-hover/add:scale-110" />
        </button>

        {/* MODAL / POPOVER FLUTUANTE PARA CONFIGURAÇÃO DE LINK (Dark Mode Shadcn) */}
        {isLinkModalOpen && (
          <div
            className="absolute top-full left-1/2 mt-3 z-50 w-80 -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-100 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-sky-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Link do Banner
                </span>
              </div>
              <button
                aria-label="Fechar"
                className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsLinkModalOpen(false)}
                type="button"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
              Define para onde o usuário será direcionado ao clicar no banner. Se deixar sem link, o banner não será clicável.
            </p>

            {/* Input da URL */}
            <div className="mb-3">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                URL de Destino
              </label>
              <input
                autoFocus
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLink(linkInput);
                  if (e.key === 'Escape') setIsLinkModalOpen(false);
                }}
                placeholder="Ex: /loja ou https://wa.me/..."
                type="text"
                value={linkInput}
              />
            </div>

            {/* Atalhos Rápidos */}
            <div className="mb-4">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Destinos Rápidos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-sky-500 hover:text-sky-400 transition cursor-pointer"
                  onClick={() => setLinkInput('/loja')}
                  type="button"
                >
                  /loja (Catálogo)
                </button>
                <button
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-sky-500 hover:text-sky-400 transition cursor-pointer"
                  onClick={() => setLinkInput('https://api.whatsapp.com/send?phone=5591981242095')}
                  type="button"
                >
                  WhatsApp Comercial
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
              {hasActiveLink ? (
                <button
                  className="flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/50 hover:text-red-200 transition cursor-pointer"
                  onClick={handleRemoveLink}
                  title="Remover link (o banner não terá clique)"
                  type="button"
                >
                  <Unlink className="size-3.5" />
                  <span>Sem Clique</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                  onClick={() => setIsLinkModalOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-sky-500 transition cursor-pointer"
                  onClick={() => handleSaveLink(linkInput)}
                  type="button"
                >
                  <Check className="size-3.5" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
