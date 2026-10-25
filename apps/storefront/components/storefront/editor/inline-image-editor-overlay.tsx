'use client';

import React, { useRef } from 'react';
import { ArrowUp, Image as ImageIcon, Link as LinkIcon, Plus, Upload } from 'lucide-react';
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
  currentLinkUrl,
  title,
}: InlineImageEditorOverlayProps) {
  const { isEditing, previewMode, openMediaModal, updateSlideInWidget, addSlideToWidget } = useElementor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEditing || previewMode) return null;

  // Lida com upload direto de arquivo do computador do usuário
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          updateSlideInWidget(widgetId, slideId, {
            imageUrl: result,
            altText: file.name.replace(/\.[^/.]+$/, ''),
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Input de arquivo invisível para upload direto */}
      <input
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
        ref={fileInputRef}
        type="file"
      />

      {/* Camada centralizada de edição sobre a imagem (Conforme Anexo do usuário) */}
      <div
        className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-200 hover:opacity-100 backdrop-blur-[1px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Caixa Central de Seleção Estilo Print do Usuário */}
          <div
            className="group/box relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white bg-black/60 p-4 shadow-2xl backdrop-blur-md transition-transform hover:scale-105 hover:border-amber-300"
            onClick={() => openMediaModal({ widgetId, slideId, currentUrl: currentImageUrl })}
            title="Clique para trocar imagem do banner"
          >
            {/* 4 Alças nas pontas da caixa estilo ferramenta gráfica */}
            <span className="absolute -top-1.5 -left-1.5 size-2.5 rounded-xs border border-black bg-white" />
            <span className="absolute -top-1.5 -right-1.5 size-2.5 rounded-xs border border-black bg-white" />
            <span className="absolute -bottom-1.5 -left-1.5 size-2.5 rounded-xs border border-black bg-white" />
            <span className="absolute -bottom-1.5 -right-1.5 size-2.5 rounded-xs border border-black bg-white" />

            {/* Ícone de Foto com Seta para Cima (Exato ao Anexo do Usuário) */}
            <div className="relative mb-1 flex size-14 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-xl">
              <ImageIcon className="size-7 text-[#004CB1]" />
              <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-[#E2091E] text-white shadow-md">
                <ArrowUp className="size-3 stroke-[3]" />
              </div>
            </div>

            <span className="text-xs font-bold text-white tracking-wide">
              Trocar Imagem do Banner
            </span>
            <span className="text-[10px] text-white/70">
              Galeria ou Upload do PC
            </span>
          </div>

          {/* Barra Flutuante com Ações Rápidas (Pill abaixo da caixa) */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/85 p-1 text-white shadow-2xl backdrop-blur-md">
            {/* Botão Ver Galeria */}
            <button
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition hover:bg-white/20 cursor-pointer"
              onClick={() => openMediaModal({ widgetId, slideId, currentUrl: currentImageUrl })}
              type="button"
            >
              <ImageIcon className="size-3.5 text-amber-300" />
              <span>Ver Galeria</span>
            </button>

            <span className="h-3 w-px bg-white/20" />

            {/* Botão Fazer Upload */}
            <button
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition hover:bg-white/20 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Upload className="size-3.5 text-emerald-300" />
              <span>Enviar Foto</span>
            </button>

            <span className="h-3 w-px bg-white/20" />

            {/* Botão Alterar Link */}
            <button
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition hover:bg-white/20 cursor-pointer"
              onClick={() => {
                const newLink = prompt('Informe o link do banner (ex: /loja ou https://...):', currentLinkUrl || '/loja');
                if (newLink !== null) {
                  updateSlideInWidget(widgetId, slideId, { linkUrl: newLink });
                }
              }}
              type="button"
            >
              <LinkIcon className="size-3.5 text-sky-300" />
              <span>Link</span>
            </button>

            <span className="h-3 w-px bg-white/20" />

            {/* Botão Adicionar Mais Um Slide */}
            <button
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition hover:bg-[#004CB1] cursor-pointer"
              onClick={() => addSlideToWidget(widgetId)}
              title="Adicionar novo slide ao carrossel"
              type="button"
            >
              <Plus className="size-3.5" />
              <span>+ Slide</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
