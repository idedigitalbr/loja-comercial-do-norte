'use client';

import React, { useState } from 'react';
import {
  Folder,
  Grid,
  Layers,
  Layout,
  Plus,
  ShoppingBag,
  Sparkles,
  Tv,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { WidgetType } from '@/lib/storefront/widget-types';

interface ElementorAddSectionBoxProps {
  insertIndex?: number;
}

const availableWidgets: Array<{
  type: WidgetType;
  title: string;
  desc: string;
  icon: React.ElementType;
  badge: string;
  tagColor: string;
}> = [
  {
    type: 'hero-carousel',
    title: 'Carrossel Full Largura',
    desc: 'Banners 100% de largura estilo Mercado Livre com degradê inferior e setas brancas',
    icon: Tv,
    badge: 'HERO',
    tagColor: 'bg-[#004CB1]',
  },
  {
    type: 'contained-hero',
    title: 'Carrossel Padrão (Campanhas)',
    desc: 'Banners contidos com bordas arredondadas e sobreposição ao topo',
    icon: Layout,
    badge: 'BANNER',
    tagColor: 'bg-[#E2091E]',
  },
  {
    type: 'benefits-bar',
    title: 'Barra de Benefícios',
    desc: '4 colunas de cartões com ícones e vantagens (Entrega, Atacado, etc.)',
    icon: Sparkles,
    badge: 'ICONS',
    tagColor: 'bg-[#028F34]',
  },
  {
    type: 'product-carousel',
    title: 'Carrossel de Produtos / Ofertas',
    desc: 'Vitrine de produtos com cotação imediata, preços e badges promocionais',
    icon: ShoppingBag,
    badge: 'PRODUTOS',
    tagColor: 'bg-[#FF7A00]',
  },
  {
    type: 'category-grid',
    title: 'Grade de Departamentos',
    desc: 'Grid visual de categorias para navegação rápida do cliente',
    icon: Grid,
    badge: 'CATEGORIAS',
    tagColor: 'bg-[#8C1D40]',
  },
];

export function ElementorAddSectionBox({ insertIndex }: ElementorAddSectionBoxProps) {
  const { isEditing, previewMode, addWidget, setSelectedWidgetId } = useElementor();
  const [isOpen, setIsOpen] = useState(false);

  if (!isEditing || previewMode) return null;

  return (
    <div className="cn-container my-6 transition-all duration-200">
      {!isOpen ? (
        <div
          className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c2cbd2] bg-white/70 py-8 px-4 transition-all duration-200 hover:border-[#8C1D40] hover:bg-white hover:shadow-md"
          onClick={() => setIsOpen(true)}
        >
          {/* Círculos Centrais Estilo Elementor */}
          <div className="flex items-center gap-4">
            {/* Botão + Vinho Elementor */}
            <button
              aria-label="Adicionar Nova Seção"
              className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-[#8C1D40] text-white shadow-md transition-transform duration-150 group-hover:scale-110 hover:bg-[#a6224c]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              title="Adicionar Nova Seção"
              type="button"
            >
              <Plus className="size-6 stroke-[2.6]" />
            </button>

            {/* Botão Pasta Cinza (Biblioteca / Templates) */}
            <button
              aria-label="Biblioteca de Seções"
              className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-[#6d7882] text-white shadow-md transition-transform duration-150 hover:scale-110 hover:bg-[#555d65]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWidgetId('NEW_WIDGET_CATALOG');
              }}
              title="Abrir Biblioteca de Widgets no Painel"
              type="button"
            >
              <Folder className="size-5" />
            </button>
          </div>

          {/* Texto de Apoio Clássico do Elementor */}
          <p className="mt-3 text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-800">
            Arraste um widget aqui ou clique no <span className="font-bold text-[#8C1D40]">+</span> para adicionar uma nova seção
          </p>
        </div>
      ) : (
        /* Painel Expandido: Selecionar o Widget / Estrutura */
        <div className="rounded-2xl border-2 border-[#8C1D40] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#8C1D40] text-white text-xs font-black">
                E
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Selecione o Widget para Inserir na Vitrine
              </h3>
            </div>
            <button
              aria-label="Fechar"
              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Grid de Opções de Widgets */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableWidgets.map((w) => {
              const IconComp = w.icon;
              return (
                <button
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left transition hover:border-[#8C1D40] hover:bg-white hover:shadow-md cursor-pointer"
                  key={w.type}
                  onClick={() => {
                    addWidget(w.type, insertIndex);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-xs group-hover:bg-[#8C1D40] group-hover:text-white transition-colors text-slate-700">
                        <IconComp className="size-5" />
                      </div>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${w.tagColor}`}>
                        {w.badge}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#8C1D40]">
                      {w.title}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-snug">
                      {w.desc}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#8C1D40] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="size-3" />
                    <span>Inserir na página</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Barra inferior de atalho para o painel completo */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Mais opções de estilização ficam disponíveis no painel à esquerda após a inserção.</span>
            <button
              className="font-bold text-[#8C1D40] hover:underline cursor-pointer"
              onClick={() => {
                setSelectedWidgetId('NEW_WIDGET_CATALOG');
                setIsOpen(false);
              }}
              type="button"
            >
              Ver biblioteca completa →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
