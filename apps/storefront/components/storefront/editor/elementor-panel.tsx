'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  Flame,
  Grid,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Layout,
  Link as LinkIcon,
  Menu,
  Minus,
  Move,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sliders,
  Sparkles,
  Trash2,
  Tv,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import { ElementorMediaModal, availableMediaLibrary } from './elementor-media-modal';
import type { BenefitItem, ContainedHeroSlide, HeroSlide, WidgetType } from '@/lib/storefront/widget-types';

const widgetDefinitions: Array<{
  type: WidgetType;
  title: string;
  category: string;
  icon: React.ElementType;
  desc: string;
  badge: string;
}> = [
  {
    type: 'hero-carousel',
    title: 'Carrossel Full',
    category: 'Básico',
    icon: Tv,
    desc: 'Banners 100% largura estilo Mercado Livre',
    badge: 'HERO',
  },
  {
    type: 'contained-hero',
    title: 'Carrossel Padrão',
    category: 'Básico',
    icon: Layout,
    desc: 'Banners arredondados de campanhas',
    badge: 'BANNER',
  },
  {
    type: 'benefits-bar',
    title: 'Barra de Benefícios',
    category: 'Geral',
    icon: Sparkles,
    desc: '4 colunas com ícones e vantagens',
    badge: 'ICONS',
  },
  {
    type: 'product-carousel',
    title: 'Vitrine de Produtos',
    category: 'Pro',
    icon: Flame,
    desc: 'Carrossel de ofertas com cotação',
    badge: 'OFERTAS',
  },
  {
    type: 'category-grid',
    title: 'Grade Categorias',
    category: 'Pro',
    icon: Grid,
    desc: 'Departamentos da loja em grade',
    badge: 'GRID',
  },
];

export function ElementorPanel() {
  const {
    isEditing,
    previewMode,
    activeTab,
    setActiveTab,
    selectedWidgetId,
    setSelectedWidgetId,
    composition,
    updateWidgetProps,
    removeWidget,
    toggleWidget,
    addWidget,
    addSlideToWidget,
    removeSlideFromWidget,
    updateSlideInWidget,
    updateBenefitItem,
    panelCollapsed,
    setPanelCollapsed,
  } = useElementor();

  const [widgetSearch, setWidgetSearch] = useState('');
  const [openSlideIndex, setOpenSlideIndex] = useState<number | null>(0);
  const [mediaModalState, setMediaModalState] = useState<{
    isOpen: boolean;
    slideId?: string;
    currentUrl?: string;
  }>({ isOpen: false });

  if (!isEditing || previewMode) return null;

  const selectedWidget = composition.widgets.find((w) => w.id === selectedWidgetId);
  const isBrowsingCatalog = selectedWidgetId === 'NEW_WIDGET_CATALOG' || !selectedWidget;

  const filteredWidgets = widgetDefinitions.filter((w) =>
    w.title.toLowerCase().includes(widgetSearch.toLowerCase()) ||
    w.desc.toLowerCase().includes(widgetSearch.toLowerCase())
  );

  return (
    <>
      {/* Modal de Biblioteca de Mídia Elementor */}
      <ElementorMediaModal
        currentImageUrl={mediaModalState.currentUrl}
        isOpen={mediaModalState.isOpen}
        onClose={() => setMediaModalState({ isOpen: false })}
        onSelectImage={(imageUrl, altText) => {
          if (selectedWidget && mediaModalState.slideId) {
            updateSlideInWidget(selectedWidget.id, mediaModalState.slideId, {
              imageUrl,
              altText: altText || undefined,
            });
          }
        }}
        title="Biblioteca de Mídia Elementor"
      />

      {/* Botão de Aba Retrátil que fica na borda direita do painel */}
      <button
        aria-label={panelCollapsed ? 'Expandir Painel Elementor' : 'Recolher Painel Elementor'}
        className={`fixed top-1/2 z-[9995] flex h-14 w-4 -translate-y-1/2 items-center justify-center rounded-r-md bg-[#26292c] text-white/70 shadow-xl transition-all duration-300 hover:bg-[#8C1D40] hover:text-white cursor-pointer border-y border-r border-white/10 ${
          panelCollapsed ? 'left-0' : 'left-[300px]'
        }`}
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        title={panelCollapsed ? 'Expandir painel' : 'Recolher painel'}
        type="button"
      >
        {panelCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>

      {/* PAINEL LATERAL ESQUERDO DO ELEMENTOR */}
      <aside
        aria-label="Painel de Edição Elementor"
        className={`fixed top-12 left-0 bottom-0 z-[9990] flex w-[300px] flex-col border-r border-black/40 bg-[#26292c] text-[#d5dadf] shadow-2xl transition-transform duration-300 select-none ${
          panelCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* CABEÇALHO DO PAINEL ESTILO ELEMENTOR */}
        <div className="flex h-11 shrink-0 items-center justify-between bg-[#1e2022] px-3 text-white border-b border-black/40">
          {/* Botão Menu Hamburger */}
          <button
            aria-label="Menu Principal Elementor"
            className="flex size-7 cursor-pointer items-center justify-center rounded text-white/80 transition hover:bg-white/10 hover:text-white"
            onClick={() => setSelectedWidgetId('NEW_WIDGET_CATALOG')}
            title="Menu de Widgets"
            type="button"
          >
            <Menu className="size-4" />
          </button>

          {/* Título do Cabeçalho */}
          <div className="truncate text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {isBrowsingCatalog
                ? 'ELEMENTOR'
                : selectedWidget?.type === 'hero-carousel'
                  ? 'Edit Media Carousel'
                  : selectedWidget?.type === 'contained-hero'
                    ? 'Edit Image Carousel'
                    : `Edit ${selectedWidget?.type || 'Section'}`}
            </span>
          </div>

          {/* Botão Grid de Elementos (Voltar à Biblioteca de Widgets) */}
          <button
            aria-label="Biblioteca de Widgets"
            className={`flex size-7 cursor-pointer items-center justify-center rounded transition ${
              isBrowsingCatalog ? 'bg-[#8C1D40] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setSelectedWidgetId('NEW_WIDGET_CATALOG')}
            title="Ver todos os Widgets (⊞)"
            type="button"
          >
            <Grid className="size-4" />
          </button>
        </div>

        {/* MODO 1: CATÁLOGO DE WIDGETS (Quando nenhum widget está selecionado ou clicou em ⊞) */}
        {isBrowsingCatalog ? (
          <div className="flex flex-1 flex-col overflow-hidden bg-[#26292c]">
            {/* Campo de Busca de Widgets */}
            <div className="p-3">
              <div className="flex items-center gap-2 rounded bg-[#1e2022] px-2.5 py-1.5 border border-white/10">
                <Search className="size-3.5 text-white/40" />
                <input
                  className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
                  onChange={(e) => setWidgetSearch(e.target.value)}
                  placeholder="Search Widget..."
                  type="text"
                  value={widgetSearch}
                />
                {widgetSearch && (
                  <button
                    className="text-white/40 hover:text-white"
                    onClick={() => setWidgetSearch('')}
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Cabeçalho da Seção de Widgets com Dica de Drag & Drop */}
            <div className="flex items-center justify-between border-t border-b border-black/30 bg-[#222426] px-3 py-1.5 text-[11px] font-bold uppercase text-white/60">
              <span>BÁSICOS</span>
              <span className="text-[9px] text-[#8C1D40] lowercase">arraste para o canvas</span>
            </div>

            {/* Grade de Widgets em 2 Colunas com suporte a DRAG AND DROP */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {filteredWidgets.map((w) => {
                  const Icon = w.icon;
                  return (
                    <div
                      aria-label={`Arrastar ou inserir ${w.title}`}
                      className="group flex flex-col items-center justify-center rounded-md border border-black/40 bg-[#1e2022] p-3 text-center transition-all duration-150 hover:border-[#8C1D40] hover:bg-[#2e3134] hover:shadow-lg cursor-grab active:cursor-grabbing relative"
                      draggable={true}
                      key={w.type}
                      onClick={() => addWidget(w.type)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/widget-type', w.type);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      title={`${w.title} — Arraste para o canvas ou clique para adicionar`}
                    >
                      <div className="flex size-9 items-center justify-center rounded text-white/70 transition-transform group-hover:scale-110 group-hover:text-[#8C1D40]">
                        <Icon className="size-5" />
                      </div>
                      <span className="mt-1.5 text-[11px] font-medium text-white/90 group-hover:text-white leading-tight">
                        {w.title}
                      </span>

                      {/* Indicador de badge */}
                      <span className="mt-1 rounded bg-black/40 px-1 py-0.2 text-[8px] font-bold text-white/50 group-hover:text-[#8C1D40]">
                        {w.badge}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-dashed border-white/10 bg-black/20 p-3 text-center">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  💡 <strong>Dica Elementor:</strong> Arraste qualquer card acima para a caixa pontilhada no canvas para inseri-lo na posição desejada.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* MODO 2: EDIÇÃO DO WIDGET SELECIONADO COM AS 3 ABAS (Content | Style | Advanced) */
          <div className="flex flex-1 flex-col overflow-hidden bg-[#26292c]">
            {/* BARRA DAS 3 ABAS DO ELEMENTOR (EXATA AOS PRINTS) */}
            <div className="flex h-10 shrink-0 border-b border-black/40 bg-[#1e2022] select-none">
              <button
                className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold transition cursor-pointer border-b-2 ${
                  activeTab === 'content'
                    ? 'border-[#8C1D40] text-white font-bold bg-[#26292c]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('content')}
                type="button"
              >
                <Edit className="size-3.5" />
                <span>Content</span>
              </button>

              <button
                className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold transition cursor-pointer border-b-2 ${
                  activeTab === 'style'
                    ? 'border-[#8C1D40] text-white font-bold bg-[#26292c]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('style')}
                type="button"
              >
                <Palette className="size-3.5" />
                <span>Style</span>
              </button>

              <button
                className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold transition cursor-pointer border-b-2 ${
                  activeTab === 'advanced'
                    ? 'border-[#8C1D40] text-white font-bold bg-[#26292c]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('advanced')}
                type="button"
              >
                <Settings className="size-3.5" />
                <span>Advanced</span>
              </button>
            </div>

            {/* CORPO DO PAINEL CONFORME A ABA ATIVA */}
            <div className="flex-1 overflow-y-auto p-3 text-xs">
              {/* ABA 1: CONTENT */}
              {activeTab === 'content' && (
                <div className="flex flex-col gap-3">
                  {/* EDIÇÃO PARA HERO CAROUSEL OU CONTAINED HERO */}
                  {(selectedWidget.type === 'hero-carousel' || selectedWidget.type === 'contained-hero') && (
                    <div className="flex flex-col gap-3">
                      {/* ACCORDION: ▾ Slides / ▾ Image Carousel */}
                      <div className="rounded-lg border border-black/40 bg-[#1e2022] overflow-hidden">
                        <div className="flex items-center justify-between bg-[#222426] px-3 py-2 text-xs font-bold text-white border-b border-black/30">
                          <div className="flex items-center gap-1.5">
                            <ChevronDown className="size-3.5 text-[#8C1D40]" />
                            <span>Slides do Carrossel</span>
                          </div>
                          <span className="rounded bg-black/40 px-1.5 py-0.2 text-[10px] text-white/70">
                            {((selectedWidget.props as any).slides || []).length} itens
                          </span>
                        </div>

                        {/* BOX DE VISÃO GERAL DE IMAGENS SELECIONADAS (ESTILO ANEXOS 3 E 5) */}
                        <div className="p-3 border-b border-black/30 bg-[#1b1c1e]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-white/80 mb-2">
                            <span>
                              {((selectedWidget.props as any).slides || []).length} Imagens Selecionadas
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                aria-label="Limpar todas as imagens"
                                className="flex size-6 cursor-pointer items-center justify-center rounded text-white/50 hover:bg-red-500/20 hover:text-red-400"
                                onClick={() => {
                                  if (confirm('Deseja remover todos os slides deste carrossel?')) {
                                    updateWidgetProps(selectedWidget.id, { slides: [] });
                                  }
                                }}
                                title="Limpar todas as imagens"
                                type="button"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                              <button
                                aria-label="Adicionar novo slide"
                                className="flex size-6 cursor-pointer items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white"
                                onClick={() => addSlideToWidget(selectedWidget.id)}
                                title="Adicionar slide"
                                type="button"
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                          </div>

                          {/* Tira com miniaturas quadradas das imagens (Anexos 3 e 5) */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            {((selectedWidget.props as any).slides || []).map((slide: any, idx: number) => {
                              const isActive = openSlideIndex === idx;
                              return (
                                <button
                                  className={`relative size-11 shrink-0 overflow-hidden rounded-md border-2 transition cursor-pointer ${
                                    isActive
                                      ? 'border-[#8C1D40] ring-1 ring-[#8C1D40]'
                                      : 'border-white/15 hover:border-white/40 opacity-70 hover:opacity-100'
                                  }`}
                                  key={slide.id || idx}
                                  onClick={() => setOpenSlideIndex(idx)}
                                  title={`Slide ${idx + 1}: ${slide.title || 'Banner'}`}
                                  type="button"
                                >
                                  {/* eslint-disable-next-js/next/no-img-element */}
                                  <img
                                    alt={slide.altText || 'Thumbnail'}
                                    className="h-full w-full object-cover"
                                    src={slide.imageUrl}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* REPEATER LIST DE SLIDES (ESTILO ANEXO 4: ITEM #1 COM BOX DE IMAGEM GRANDE) */}
                        <div className="divide-y divide-black/30 p-2">
                          {((selectedWidget.props as any).slides || []).map((slide: any, index: number) => {
                            const isOpen = openSlideIndex === index;
                            return (
                              <div className="rounded-md overflow-hidden my-1 bg-[#222426]" key={slide.id || index}>
                                {/* Barra do Item */}
                                <div
                                  className="flex items-center justify-between px-3 py-2 bg-[#25282a] hover:bg-[#2b2e31] cursor-pointer"
                                  onClick={() => setOpenSlideIndex(isOpen ? null : index)}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <GripVertical className="size-3 text-white/30" />
                                    <span className="font-bold text-white text-xs truncate">
                                      Item #{index + 1}: {slide.title || 'Slide'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {/* Duplicar */}
                                    <button
                                      aria-label="Duplicar slide"
                                      className="flex size-6 cursor-pointer items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white"
                                      onClick={() => addSlideToWidget(selectedWidget.id)}
                                      title="Duplicar slide"
                                      type="button"
                                    >
                                      <Copy className="size-3" />
                                    </button>
                                    {/* Excluir */}
                                    <button
                                      aria-label="Excluir slide"
                                      className="flex size-6 cursor-pointer items-center justify-center rounded text-white/50 hover:bg-red-500/20 hover:text-red-400"
                                      onClick={() => removeSlideFromWidget(selectedWidget.id, slide.id)}
                                      title="Remover slide"
                                      type="button"
                                    >
                                      <X className="size-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Formulário Expandido do Slide (ESTILO ANEXO 4) */}
                                {isOpen && (
                                  <div className="p-3 bg-[#1e2022] flex flex-col gap-3 animate-in fade-in duration-100">
                                    {/* BOX DE PREVIEW DE IMAGEM GRANDE (ANEXO 4) */}
                                    <div>
                                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                                        Imagem do Banner
                                      </label>
                                      <div
                                        className="group relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed border-white/20 bg-black/40 hover:border-[#8C1D40] transition cursor-pointer"
                                        onClick={() => {
                                          setMediaModalState({
                                            isOpen: true,
                                            slideId: slide.id,
                                            currentUrl: slide.imageUrl,
                                          });
                                        }}
                                        title="Clique para escolher imagem na biblioteca"
                                      >
                                        {/* eslint-disable-next-js/next/no-img-element */}
                                        <img
                                          alt={slide.altText || 'Slide banner'}
                                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                          src={slide.imageUrl}
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <ImageIcon className="size-6 text-white mb-1" />
                                          <span className="rounded bg-[#8C1D40] px-2 py-0.5 text-[10px] font-bold text-white">
                                            Alterar Imagem
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Título / Legenda */}
                                    <div>
                                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                                        Título do Slide
                                      </label>
                                      <input
                                        className="w-full rounded border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#8C1D40] outline-none"
                                        onChange={(e) =>
                                          updateSlideInWidget(selectedWidget.id, slide.id, {
                                            title: e.target.value,
                                          })
                                        }
                                        type="text"
                                        value={slide.title || ''}
                                      />
                                    </div>

                                    {/* Link de Destino */}
                                    <div>
                                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                                        Link do Slide
                                      </label>
                                      <input
                                        className="w-full rounded border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#8C1D40] outline-none"
                                        onChange={(e) =>
                                          updateSlideInWidget(selectedWidget.id, slide.id, {
                                            linkUrl: e.target.value,
                                          })
                                        }
                                        placeholder="/loja ou https://..."
                                        type="text"
                                        value={slide.linkUrl || ''}
                                      />
                                    </div>

                                    {/* Texto Alternativo (SEO) */}
                                    <div>
                                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                                        Texto Alternativo (Alt)
                                      </label>
                                      <input
                                        className="w-full rounded border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#8C1D40] outline-none"
                                        onChange={(e) =>
                                          updateSlideInWidget(selectedWidget.id, slide.id, {
                                            altText: e.target.value,
                                          })
                                        }
                                        type="text"
                                        value={slide.altText || ''}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Botão + Add Item (ANEXO 4) */}
                        <div className="p-3 border-t border-black/30 bg-[#1e2022]">
                          <button
                            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#8C1D40] py-2 text-xs font-bold text-white transition hover:bg-[#a6224c]"
                            onClick={() => addSlideToWidget(selectedWidget.id)}
                            type="button"
                          >
                            <Plus className="size-4" />
                            <span>+ Adicionar Item</span>
                          </button>
                        </div>
                      </div>

                      {/* CONTROLES DE COLUNAS E ESPAÇAMENTO (EXATOS AO ANEXO 3) */}
                      <div className="rounded-lg border border-black/40 bg-[#1e2022] p-3">
                        <span className="text-[11px] font-bold uppercase text-white/60 block mb-3">
                          Configurações de Exibição
                        </span>

                        {/* Tempo de transição */}
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[11px] text-white/80">Intervalo (ms)</label>
                          <input
                            className="w-20 rounded border border-white/10 bg-black/30 px-2 py-1 text-right text-xs text-white outline-none"
                            max={15000}
                            min={1000}
                            onChange={(e) =>
                              updateWidgetProps(selectedWidget.id, {
                                autoplayIntervalMs: Number(e.target.value),
                              })
                            }
                            step={500}
                            type="number"
                            value={(selectedWidget.props as any).autoplayIntervalMs || 5000}
                          />
                        </div>

                        {/* Lazy Load Toggle (ANEXO 3) */}
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] text-white/80">Lazy Load</label>
                          <button
                            className="rounded-full bg-[#8C1D40] px-2.5 py-0.5 text-[10px] font-bold text-white cursor-pointer"
                            type="button"
                          >
                            Sim
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIÇÃO PARA VITRINE DE PRODUTOS / OFERTAS */}
                  {selectedWidget.type === 'product-carousel' && (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-lg border border-black/40 bg-[#1e2022] p-3">
                        <span className="text-[11px] font-bold uppercase text-white/60 block mb-3">
                          Conteúdo da Vitrine
                        </span>

                        <div className="mb-3">
                          <label className="text-[11px] text-white/70 block mb-1">Título da Seção</label>
                          <input
                            className="w-full rounded border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none"
                            onChange={(e) => updateWidgetProps(selectedWidget.id, { title: e.target.value })}
                            type="text"
                            value={(selectedWidget.props as any).title || ''}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="text-[11px] text-white/70 block mb-1">Subtítulo</label>
                          <input
                            className="w-full rounded border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none"
                            onChange={(e) => updateWidgetProps(selectedWidget.id, { subtitle: e.target.value })}
                            type="text"
                            value={(selectedWidget.props as any).subtitle || ''}
                          />
                        </div>

                        {/* Columns Stepper (ANEXO 3) */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1 text-[11px] text-white/80">
                            <span>Columns</span>
                            <Tv className="size-3 text-white/50" />
                          </div>
                          <input
                            className="w-16 rounded border border-white/10 bg-black/30 px-2 py-1 text-center text-xs text-white outline-none"
                            max={6}
                            min={2}
                            onChange={(e) => updateWidgetProps(selectedWidget.id, { limit: Number(e.target.value) * 2 })}
                            type="number"
                            value={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDIÇÃO PARA BARRA DE BENEFÍCIOS */}
                  {selectedWidget.type === 'benefits-bar' && (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-lg border border-black/40 bg-[#1e2022] p-3">
                        <span className="text-[11px] font-bold uppercase text-white/60 block mb-2">
                          4 Cartões de Vantagens
                        </span>
                        {((selectedWidget.props as any).items || []).map((item: BenefitItem, bIdx: number) => (
                          <div className="my-2 rounded border border-white/10 bg-black/20 p-2" key={bIdx}>
                            <span className="text-[10px] font-bold text-[#8C1D40]">Item #{bIdx + 1}</span>
                            <input
                              className="mt-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white outline-none"
                              onChange={(e) => updateBenefitItem(selectedWidget.id, bIdx, { title: e.target.value })}
                              type="text"
                              value={item.title}
                            />
                            <input
                              className="mt-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-white/70 outline-none"
                              onChange={(e) => updateBenefitItem(selectedWidget.id, bIdx, { description: e.target.value })}
                              type="text"
                              value={item.description}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EDIÇÃO PARA GRADE DE CATEGORIAS */}
                  {selectedWidget.type === 'category-grid' && (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-lg border border-black/40 bg-[#1e2022] p-3">
                        <label className="text-[11px] text-white/70 block mb-1">Título</label>
                        <input
                          className="w-full rounded border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-white outline-none"
                          onChange={(e) => updateWidgetProps(selectedWidget.id, { title: e.target.value })}
                          type="text"
                          value={(selectedWidget.props as any).title || ''}
                        />

                        {/* Spacing Slider (ANEXO 3) */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-[11px] text-white/80 mb-1">
                            <div className="flex items-center gap-1">
                              <span>Spacing</span>
                              <Tv className="size-3 text-white/50" />
                            </div>
                            <span className="rounded bg-black/40 px-2 py-0.5 text-xs text-white font-mono">16</span>
                          </div>
                          <input className="w-full accent-[#8C1D40]" max={40} min={4} type="range" value={16} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ABA 2: STYLE */}
              {activeTab === 'style' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-black/40 bg-[#1e2022] p-3">
                    <span className="text-[11px] font-bold uppercase text-white/60 block mb-3">
                      Estilos Visuais Elementor
                    </span>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[11px] text-white/80">Setas de Navegação</span>
                      <input
                        checked={(selectedWidget.props as any).showArrows !== false}
                        className="accent-[#8C1D40]"
                        onChange={(e) => updateWidgetProps(selectedWidget.id, { showArrows: e.target.checked })}
                        type="checkbox"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[11px] text-white/80">Pontos de Paginação</span>
                      <input
                        checked={(selectedWidget.props as any).showDots !== false}
                        className="accent-[#8C1D40]"
                        onChange={(e) => updateWidgetProps(selectedWidget.id, { showDots: e.target.checked })}
                        type="checkbox"
                      />
                    </div>

                    {selectedWidget.type === 'hero-carousel' && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-[11px] text-white/80">Degradê Inferior Suave</span>
                        <input
                          checked={(selectedWidget.props as any).bottomGradient !== false}
                          className="accent-[#8C1D40]"
                          onChange={(e) => updateWidgetProps(selectedWidget.id, { bottomGradient: e.target.checked })}
                          type="checkbox"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ABA 3: ADVANCED */}
              {activeTab === 'advanced' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-black/40 bg-[#1e2022] p-3">
                    <span className="text-[11px] font-bold uppercase text-white/60 block mb-3">
                      Posicionamento e Seção
                    </span>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[11px] text-white/80">Visibilidade da Seção</span>
                      <button
                        className={`rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          selectedWidget.enabled ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                        onClick={() => toggleWidget(selectedWidget.id)}
                        type="button"
                      >
                        {selectedWidget.enabled ? 'Ativo' : 'Oculto'}
                      </button>
                    </div>

                    <div className="mt-4 pt-2 border-t border-white/10">
                      <button
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded bg-red-600/20 py-2 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition"
                        onClick={() => {
                          if (confirm('Deseja remover esta seção permanentemente da página?')) {
                            removeWidget(selectedWidget.id);
                          }
                        }}
                        type="button"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Excluir Esta Seção</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
