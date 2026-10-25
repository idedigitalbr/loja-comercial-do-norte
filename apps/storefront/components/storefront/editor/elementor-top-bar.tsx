'use client';

import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
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
  badge: string;
  badgeColor: string;
}> = [
  {
    type: 'hero-carousel',
    title: 'Carrossel Full Largura',
    desc: 'Banners 100% largura estilo Mercado Livre com degradê suave',
    icon: Tv,
    badge: 'HERO',
    badgeColor: 'bg-[#004CB1]',
  },
  {
    type: 'contained-hero',
    title: 'Carrossel Padrão (Campanhas)',
    desc: 'Banners arredondados em caixa de destaque para ofertas',
    icon: Layout,
    badge: 'BANNER',
    badgeColor: 'bg-[#E2091E]',
  },
  {
    type: 'benefits-bar',
    title: 'Barra de Benefícios',
    desc: '4 colunas com ícones de vantagens (Entrega, Atacado, etc.)',
    icon: Sparkles,
    badge: 'ICONS',
    badgeColor: 'bg-[#028F34]',
  },
  {
    type: 'product-carousel',
    title: 'Vitrine de Produtos / Ofertas',
    desc: 'Carrossel de produtos com botão de cotação e preços de atacado',
    icon: Flame,
    badge: 'PRODUTOS',
    badgeColor: 'bg-[#FF7A00]',
  },
  {
    type: 'category-grid',
    title: 'Grade de Departamentos',
    desc: 'Navegação visual pelas principais categorias da loja',
    icon: Grid,
    badge: 'CATEGORIAS',
    badgeColor: 'bg-[#8C1D40]',
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
        <div className="fixed top-14 right-6 z-[99999] flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Check className="size-4" />
          <span className="text-xs">{saveMessage}</span>
        </div>
      ) : null}

      {/* MODAL FLUTUANTE DE ADICIONAR NOVA SEÇÃO (Sem sidebar empurrando a página) */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#1e2022] p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-[#004CB1] text-xs font-black text-white">
                  +
                </span>
                <h3 className="text-sm font-bold text-white">Adicionar Nova Seção à Vitrine</h3>
              </div>
              <button
                aria-label="Fechar"
                className="flex size-7 cursor-pointer items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                onClick={() => setAddModalOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {availableNewWidgets.map((w) => {
                const Icon = w.icon;
                return (
                  <button
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-[#004CB1] hover:bg-white/10 cursor-pointer"
                    key={w.type}
                    onClick={() => {
                      addWidget(w.type);
                      setAddModalOpen(false);
                    }}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-black/40 text-[#004CB1] group-hover:bg-[#004CB1] group-hover:text-white transition">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{w.title}</span>
                          <span className={`rounded px-1.5 py-0.2 text-[9px] font-black text-white ${w.badgeColor}`}>
                            {w.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60">{w.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#004CB1] opacity-0 group-hover:opacity-100 transition">
                      + Inserir
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR FIXA NO TOPO (44px) */}
      <header
        aria-label="Barra de Ferramentas do Modo Edição"
        className="fixed top-0 left-0 right-0 z-[9990] flex h-11 w-full items-center justify-between border-b border-black/40 bg-[#161719] px-4 text-white select-none shadow-xl"
      >
        {/* Lado Esquerdo: Marca, Adicionar Seção e Desfazer/Refazer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-[#004CB1] text-xs font-black text-white shadow-sm">
              E
            </div>
            <span className="hidden text-xs font-bold text-white md:inline">
              Modo Edição Visual
            </span>
          </div>

          {/* Botão + Adicionar Nova Seção */}
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-[#004CB1] px-2.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-[#00357B]"
            onClick={() => setAddModalOpen(true)}
            title="Adicionar Seção à Vitrine"
            type="button"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Nova Seção</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border-l border-white/10 pl-2">
            <button
              aria-label="Desfazer"
              className="flex size-7 cursor-pointer items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!canUndo}
              onClick={undo}
              title="Desfazer (Ctrl+Z)"
              type="button"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              aria-label="Refazer"
              className="flex size-7 cursor-pointer items-center justify-center rounded text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="flex items-center gap-1 rounded-lg bg-black/40 p-0.5 border border-white/10">
          <button
            aria-label="Visualização Desktop"
            className={`flex size-6.5 cursor-pointer items-center justify-center rounded transition ${
              viewport === 'desktop'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setViewport('desktop')}
            title="Desktop (100% largura)"
            type="button"
          >
            <Laptop className="size-3.5" />
          </button>

          <button
            aria-label="Visualização Tablet"
            className={`flex size-6.5 cursor-pointer items-center justify-center rounded transition ${
              viewport === 'tablet'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setViewport('tablet')}
            title="Tablet (768px)"
            type="button"
          >
            <Tablet className="size-3.5" />
          </button>

          <button
            aria-label="Visualização Mobile"
            className={`flex size-6.5 cursor-pointer items-center justify-center rounded transition ${
              viewport === 'mobile'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/10'
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
          {/* Preview Mode (Esconde lápis e ferramentas para ver como cliente) */}
          <button
            aria-label="Modo Preview"
            className={`flex size-7 cursor-pointer items-center justify-center rounded transition ${
              previewMode ? 'bg-[#004CB1] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setPreviewMode(!previewMode)}
            title={previewMode ? 'Sair do Modo Preview' : 'Modo Preview (Ocultar ferramentas)'}
            type="button"
          >
            <Eye className="size-4" />
          </button>

          {/* Resetar padrão */}
          <button
            className="hidden text-[11px] text-white/50 hover:text-white/90 underline cursor-pointer lg:inline-block pr-1"
            onClick={resetToDefault}
            title="Voltar ao layout original oficial"
            type="button"
          >
            Resetar
          </button>

          {/* Botão SALVAR NO SERVIDOR (Sincroniza com a API do backend) */}
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-white shadow-md transition ${
              hasUnsavedChanges
                ? 'bg-[#E2091E] hover:bg-[#C92F27] animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            onClick={saveComposition}
            type="button"
          >
            <Save className="size-3.5" />
            <span>{hasUnsavedChanges ? 'Salvar *' : 'Salvo no Servidor'}</span>
          </button>

          {/* Sair do Modo Edição */}
          <button
            aria-label="Sair da Edição"
            className="flex size-7 cursor-pointer items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white"
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
