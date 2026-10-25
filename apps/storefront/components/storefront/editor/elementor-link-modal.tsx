'use client';

import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, Link2, Unlink, X } from 'lucide-react';

interface ElementorLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLink: (linkUrl: string) => void;
  currentLinkUrl?: string;
  currentImageUrl?: string;
  slideTitle?: string;
}

export function ElementorLinkModal({
  isOpen,
  onClose,
  onSaveLink,
  currentLinkUrl = '',
  currentImageUrl,
  slideTitle,
}: ElementorLinkModalProps) {
  const [linkInput, setLinkInput] = useState(currentLinkUrl);

  useEffect(() => {
    setLinkInput(currentLinkUrl || '');
  }, [currentLinkUrl, isOpen]);

  if (!isOpen) return null;

  const hasActiveLink = Boolean(linkInput && linkInput.trim() !== '' && linkInput !== '#');

  const handleConfirm = () => {
    onSaveLink(linkInput.trim());
    onClose();
  };

  const handleClearLink = () => {
    setLinkInput('');
    onSaveLink('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="flex h-auto max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Shadcn Dark Mode (Fiel ao print) */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-6 select-none">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-sky-400 font-bold text-xs">
              <Link2 className="size-4" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Configurar Link de Destino do Banner
            </h2>
          </div>

          <button
            aria-label="Fechar"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Card de Preview do Item do Slide Sendo Editado */}
          <div className="flex items-center gap-4 rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-3.5">
            {currentImageUrl ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-black">
                {/* eslint-disable-next-js/next/no-img-element */}
                <img
                  alt={slideTitle || 'Preview do Banner'}
                  className="size-full object-cover"
                  src={currentImageUrl}
                />
              </div>
            ) : null}

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Item do Slide Atual
              </span>
              <h4 className="text-sm font-bold text-white truncate">
                {slideTitle || 'Banner em Destaque'}
              </h4>
              <div className="mt-1 flex items-center gap-2">
                {hasActiveLink ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Clicável: {linkInput}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    <Unlink className="size-3" />
                    Sem Link (Apenas Visual)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Campo de URL (Idêntico ao layout do anexo) */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-zinc-300 mb-2">
              Insira o link direto para onde o banner vai ao ser clicado (URL Web ou rota interna):
            </label>
            <input
              autoFocus
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-sky-400 outline-none transition focus:ring-1 focus:ring-sky-400"
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') onClose();
              }}
              placeholder="Ex: /loja ou https://wa.me/5591981242095"
              type="text"
              value={linkInput}
            />
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Se este campo estiver vazio, o banner não terá clique (não abrirá nenhuma página ao ser tocado).
            </p>
          </div>

          {/* Destinos Rápidos */}
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Destinos Rápidos Recomendados:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 hover:border-sky-500 hover:text-sky-400 transition cursor-pointer"
                onClick={() => setLinkInput('/loja')}
                type="button"
              >
                /loja (Catálogo Completo)
              </button>
              <button
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 hover:border-sky-500 hover:text-sky-400 transition cursor-pointer"
                onClick={() => setLinkInput('https://api.whatsapp.com/send?phone=5591981242095')}
                type="button"
              >
                WhatsApp Comercial do Norte
              </button>
              {hasActiveLink && (
                <button
                  className="rounded-xl border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition cursor-pointer"
                  onClick={() => setLinkInput('')}
                  type="button"
                >
                  Deixar Sem Clique
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé Shadcn (Idêntico ao anexo com botão branco à direita) */}
        <div className="flex h-16 items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-6 select-none">
          <div className="text-xs text-zinc-400 truncate max-w-sm">
            {slideTitle ? (
              <span>
                Slide: <strong className="text-white">{slideTitle}</strong>
              </span>
            ) : (
              <span>Configurando link do banner</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-bold text-zinc-950 shadow-md transition hover:bg-zinc-200"
              onClick={handleConfirm}
              type="button"
            >
              <Check className="size-4" />
              <span>Salvar Link no Banner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
