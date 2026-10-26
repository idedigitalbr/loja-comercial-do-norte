'use client';

import React, { useState } from 'react';
import {
  Check,
  Eye,
  Flame,
  Grid,
  Laptop,
  Layout,
  Plus,
  Redo2,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Tv,
  Undo2,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { WidgetType } from '@/lib/storefront/widget-types';

const availableNewWidgets: Array<{
  type: WidgetType;
  title: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    type: 'hero-carousel',
    title: 'Carrossel Full Largura',
    desc: 'Banners 100% largura estilo Mercado Livre',
    icon: Tv,
  },
  {
    type: 'contained-hero',
    title: 'Carrossel Padrão (Campanhas)',
    desc: 'Banners arredondados em caixa de destaque',
    icon: Layout,
  },
  {
    type: 'category-grid',
    title: 'Barra de Ícones / Categorias',
    desc: '8 atalhos visuais ou grade de departamentos',
    icon: Grid,
  },
  {
    type: 'product-carousel',
    title: 'Vitrine de Produtos / Ofertas',
    desc: 'Vitrine com botão de cotação e preços de atacado',
    icon: Flame,
  },
  {
    type: 'banner-grid',
    title: 'Banners Triplos Promocionais',
    desc: '3 banners lado a lado em container arredondado',
    icon: Layout,
  },
  {
    type: 'quote-steps-banner',
    title: 'Como Funciona a Cotação',
    desc: '4 passos numerados + Mascote James 3D',
    icon: Sparkles,
  },
  {
    type: 'segments-carousel',
    title: 'Carrossel de Segmentos',
    desc: 'Lanchonete, Pizzaria, Padaria e Loja de Festas',
    icon: Grid,
  },
  {
    type: 'promo-strip',
    title: 'Faixa Promocional / WhatsApp',
    desc: 'Ofertas Imperdíveis, Condições ou Grupo VIP',
    icon: Sparkles,
  },
  {
    type: 'events-carousel',
    title: 'Nossos Eventos',
    desc: '4 cartazes verticais em fundo escuro',
    icon: Tv,
  },
  {
    type: 'video-articles-carousel',
    title: 'Explica Aí Nort',
    desc: 'Dicas em vídeos e artigos para o negócio',
    icon: Tv,
  },
  {
    type: 'instagram-feed',
    title: 'A Loja no Instagram',
    desc: '6 cards verticais com selo do Instagram',
    icon: Grid,
  },
  {
    type: 'testimonials-grid',
    title: 'Avaliações no Google',
    desc: '10 depoimentos 5 estrelas em 2 linhas',
    icon: Sparkles,
  },
  {
    type: 'store-locations-map',
    title: 'Unidades + Mapa Interativo',
    desc: 'Busca por CEP, 3 lojas e Google Maps',
    icon: Layout,
  },
];

export function ElementorTopBar() {
  const {
    isEditing,
    setIsEditing,
    previewMode,
    setPreviewMode,
    viewport,
    setViewport,
    saveComposition,
    hasUnsavedChanges,
    saveMessage,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToDefault,
    addWidget,
  } = useElementor();

  const [addModalOpen, setAddModalOpen] = useState(false);

  if (!isEditing) return null;

  return (
    <>
      {/* Toast flutuante de sucesso / sincronização com o servidor */}
      {saveMessage ? (
        <div className="fixed top-14 right-6 z-[99999] flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 font-medium text-white shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 text-emerald-400" />
          <span className="text-xs">{saveMessage}</span>
        </div>
      ) : null}

      {/* Modal Minimalista de Adicionar Nova Seção (Shadcn Dark Mode) */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-sky-400 text-xs font-black">
                  +
                </div>
                <h3 className="text-sm font-semibold text-white">Adicionar Nova Seção à Vitrine</h3>
              </div>
              <button
                aria-label="Fechar"
                className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
                onClick={() => setAddModalOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3.5 flex flex-col gap-2">
              {availableNewWidgets.map((w) => {
                const Icon = w.icon;
                return (
                  <button
                    className="group flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-left transition hover:border-sky-500/50 hover:bg-zinc-900 cursor-pointer"
                    key={w.type}
                    onClick={() => {
                      addWidget(w.type);
                      setAddModalOpen(false);
                    }}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:text-sky-400 group-hover:border-sky-500/40 transition">
                        <Icon className="size-4.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-white group-hover:text-sky-400 transition">
                          {w.title}
                        </span>
                        <span className="block text-[11px] text-zinc-500">{w.desc}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-sky-400 opacity-0 group-hover:opacity-100 transition">
                      + Inserir
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR FIXA SHADCN DARK MODE (44px) */}
      <header
        aria-label="Barra de Ferramentas do Modo Edição"
        className="fixed top-0 left-0 right-0 z-[9990] flex h-11 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 text-zinc-200 select-none shadow-xl backdrop-blur-md"
      >
        {/* Lado Esquerdo: Marca, Adicionar Seção e Desfazer/Refazer */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-xs font-black text-sky-400">
              E
            </span>
            <span className="hidden text-xs font-semibold text-zinc-300 sm:inline">
              Modo Edição
            </span>
          </div>

          {/* Botão + Adicionar Nova Seção */}
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 hover:border-zinc-600"
            onClick={() => setAddModalOpen(true)}
            title="Adicionar Seção à Vitrine"
            type="button"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Nova Seção</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border-l border-zinc-800 pl-2">
            <button
              aria-label="Desfazer"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={!canUndo}
              onClick={undo}
              title="Desfazer (Ctrl+Z)"
              type="button"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              aria-label="Refazer"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={!canRedo}
              onClick={redo}
              title="Refazer (Ctrl+Y)"
              type="button"
            >
              <Redo2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Centro: Seletor de Responsividade (Desktop / Tablet / Mobile) */}
        <div className="flex items-center gap-0.5 rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
          <button
            aria-label="Visualização Desktop"
            className={`flex size-6.5 cursor-pointer items-center justify-center rounded-md transition ${
              viewport === 'desktop'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            onClick={() => setViewport('desktop')}
            title="Desktop (100% largura)"
            type="button"
          >
            <Laptop className="size-3.5" />
          </button>

          <button
            aria-label="Visualização Tablet"
            className={`flex size-6.5 cursor-pointer items-center justify-center rounded-md transition ${
              viewport === 'tablet'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            onClick={() => setViewport('tablet')}
            title="Tablet (768px)"
            type="button"
          >
            <Tablet className="size-3.5" />
          </button>

          <button
            aria-label="Visualização Mobile"
            className={`flex size-6.5 cursor-pointer items-center justify-center rounded-md transition ${
              viewport === 'mobile'
                ? 'bg-white text-zinc-950 font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            onClick={() => setViewport('mobile')}
            title="Mobile (390px)"
            type="button"
          >
            <Smartphone className="size-3.5" />
          </button>
        </div>

        {/* Lado Direito: Preview, Resetar, Salvar e Sair */}
        <div className="flex items-center gap-2">
          {/* Preview Mode */}
          <button
            aria-label="Modo Preview"
            className={`flex size-7 cursor-pointer items-center justify-center rounded-lg transition ${
              previewMode
                ? 'bg-sky-500 text-zinc-950'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
            onClick={() => setPreviewMode(!previewMode)}
            title={previewMode ? 'Sair do Modo Preview' : 'Modo Preview (Ocultar ferramentas)'}
            type="button"
          >
            <Eye className="size-4" />
          </button>

          {/* Resetar padrão */}
          <button
            className="hidden text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer lg:inline-block pr-1"
            onClick={resetToDefault}
            title="Voltar ao layout original oficial"
            type="button"
          >
            Resetar
          </button>

          {/* Botão SALVAR NO SERVIDOR (Shadcn style) */}
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              hasUnsavedChanges
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
            onClick={saveComposition}
            type="button"
          >
            <Save className="size-3.5 text-emerald-400" />
            <span>{hasUnsavedChanges ? 'Salvar *' : 'Salvo no Servidor'}</span>
          </button>

          {/* Sair do Modo Edição */}
          <button
            aria-label="Sair da Edição"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
            onClick={() => {
              setIsEditing(false);
              setPreviewMode(false);
            }}
            title="Fechar edição e voltar à loja"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>
    </>
  );
}
