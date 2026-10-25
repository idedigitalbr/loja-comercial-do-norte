'use client';

import React, { useState } from 'react';
import {
  AlignLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  Grid,
  Image as ImageIcon,
  Layers,
  Layout,
  Menu,
  Minus,
  Move,
  Palette,
  Plus,
  Search,
  Settings,
  Sliders,
  Sparkles,
  Trash2,
  Tv,
  X,
} from 'lucide-react';
import { useElementor } from './elementor-editor-context';
import type { BenefitItem, ContainedHeroSlide, HeroSlide, WidgetType } from '@/lib/storefront/widget-types';

const availableBanners = [
  {
    name: 'Intelbras Semana (Verde ML)',
    url: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_977867-MLA118147004068_102026-OO.webp',
  },
  {
    name: 'Super Ofertas (Azul ML)',
    url: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_690577-MLA118270011000_102026-OO.webp',
  },
  {
    name: 'Copo Cristalcopo',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_x5pilwx5pilwx5pi.jpg',
  },
  {
    name: 'Outlet Embalagens',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k46c0pk46c0pk46c.jpg',
  },
  {
    name: 'Verão Total',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg',
  },
  {
    name: 'Pará Trigo Gastronomia',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_m54tnlm54tnlm54t.jpg',
  },
  {
    name: 'Ofertas Faltam 3 Dias',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_nmv06jnmv06jnmv0.jpg',
  },
  {
    name: 'Fachada Comercial do Norte',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_u1xlqu1xlqu1xlqu.jpg',
  },
  {
    name: 'Convenção Futuro',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_yr0ncxyr0ncxyr0n (1).jpg',
  },
];

export function ElementorPanel() {
  const {
    isEditing,
    previewMode,
    composition,
    selectedWidgetId,
    setSelectedWidgetId,
    activeTab,
    setActiveTab,
    panelCollapsed,
    setPanelCollapsed,
    updateWidgetProps,
    addWidget,
    addSlideToWidget,
    removeSlideFromWidget,
    updateSlideInWidget,
    updateBenefitItem,
  } = useElementor();

  const [widgetSearch, setWidgetSearch] = useState('');
  const [contentSectionOpen, setContentSectionOpen] = useState(true);
  const [settingsSectionOpen, setSettingsSectionOpen] = useState(true);

  if (!isEditing || previewMode) return null;

  const selectedWidget = composition.widgets.find((w) => w.id === selectedWidgetId);
  const isEditingWidget = !!selectedWidget;

  return (
    <aside
      aria-label="Painel Lateral Elementor"
      className={`fixed top-12 bottom-0 left-0 z-[90] flex border-r border-[#d5d8dc] bg-[#f7f8f9] transition-transform duration-300 ${
        panelCollapsed ? '-translate-x-[300px]' : 'translate-x-0'
      } w-[300px] select-none shadow-2xl flex-col`}
    >
      {/* Botão Retrátil na borda direita do painel */}
      <button
        aria-label={panelCollapsed ? 'Expandir Painel' : 'Recolher Painel'}
        className="absolute top-1/2 -right-4 z-10 flex h-10 w-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r border border-l-0 border-[#d5d8dc] bg-[#eef0f2] text-gray-600 shadow-sm hover:bg-white hover:text-black"
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        title={panelCollapsed ? 'Abrir painel lateral' : 'Recolher painel lateral'}
        type="button"
      >
        {panelCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>

      {/* CABEÇALHO VINHO CANÔNICO DO ELEMENTOR (#8C1D40 / #92003B) */}
      <div className="flex h-11 items-center justify-between bg-[#8C1D40] px-3.5 text-white">
        <button
          className="flex cursor-pointer items-center text-white/80 hover:text-white"
          onClick={() => setSelectedWidgetId(null)}
          title="Menu de Elementos"
          type="button"
        >
          <Menu className="size-4.5" />
        </button>

        <span className="text-xs font-bold uppercase tracking-wide">
          {isEditingWidget ? `Editar Seção` : 'Elementor'}
        </span>

        {/* Ícone de Grid 9 pontinhos (Volta para os Elementos) */}
        <button
          className="flex cursor-pointer items-center text-white/80 hover:text-white"
          onClick={() => setSelectedWidgetId(null)}
          title="Ver todos os Widgets"
          type="button"
        >
          <Grid className="size-4.5" />
        </button>
      </div>

      {/* SE ESTIVER EDITANDO UM WIDGET: 3 ABAS CANÔNICAS (Content | Style | Advanced) */}
      {isEditingWidget ? (
        <div className="flex border-b border-[#d5d8dc] bg-white">
          <button
            className={`flex flex-1 cursor-pointer flex-col items-center py-2 text-[11px] font-bold uppercase tracking-wider transition ${
              activeTab === 'content'
                ? 'border-b-2 border-[#8C1D40] text-[#8C1D40]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('content')}
            type="button"
          >
            <span>Content</span>
          </button>
          <button
            className={`flex flex-1 cursor-pointer flex-col items-center py-2 text-[11px] font-bold uppercase tracking-wider transition ${
              activeTab === 'style'
                ? 'border-b-2 border-[#8C1D40] text-[#8C1D40]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('style')}
            type="button"
          >
            <span>Style</span>
          </button>
          <button
            className={`flex flex-1 cursor-pointer flex-col items-center py-2 text-[11px] font-bold uppercase tracking-wider transition ${
              activeTab === 'advanced'
                ? 'border-b-2 border-[#8C1D40] text-[#8C1D40]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('advanced')}
            type="button"
          >
            <span>Advanced</span>
          </button>
        </div>
      ) : (
        /* SE ESTIVER NO MODO LISTA DE WIDGETS: BARRA DE BUSCA */
        <div className="border-b border-[#d5d8dc] bg-white p-2.5">
          <div className="flex items-center rounded border border-[#d5d8dc] bg-[#fbfcfc] px-2 py-1 text-xs">
            <Search className="mr-1.5 size-3.5 text-gray-400" />
            <input
              className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
              onChange={(e) => setWidgetSearch(e.target.value)}
              placeholder="Search Widget..."
              type="text"
              value={widgetSearch}
            />
          </div>
        </div>
      )}

      {/* CORPO DO PAINEL LATERAL (SCROLLÁVEL) */}
      <div className="no-scrollbar flex-1 overflow-y-auto p-3 text-xs text-gray-700">
        {/* ========================================================
            MODO 1: LISTA DE WIDGETS DISPONÍVEIS (GRID ESTILO ELEMENTOR)
            ======================================================== */}
        {!isEditingWidget ? (
          <div className="flex flex-col gap-4">
            {/* Categoria 1: Banners e Hero */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Banners &amp; Destaques</span>
                <ChevronDown className="size-3 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Widget 1: Carrossel Full Largura */}
                <button
                  className="group flex flex-col items-center justify-center rounded border border-[#d5d8dc] bg-white p-3 text-center transition hover:border-[#8C1D40] hover:shadow-sm cursor-pointer"
                  onClick={() => addWidget('hero-carousel')}
                  type="button"
                >
                  <div className="mb-2 flex size-8 items-center justify-center rounded bg-gray-50 text-gray-600 group-hover:text-[#8C1D40]">
                    <ImageIcon className="size-4.5" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 leading-tight">Carrossel Full ML</span>
                </button>

                {/* Widget 2: Carrossel Contido */}
                <button
                  className="group flex flex-col items-center justify-center rounded border border-[#d5d8dc] bg-white p-3 text-center transition hover:border-[#8C1D40] hover:shadow-sm cursor-pointer"
                  onClick={() => addWidget('contained-hero')}
                  type="button"
                >
                  <div className="mb-2 flex size-8 items-center justify-center rounded bg-gray-50 text-gray-600 group-hover:text-[#8C1D40]">
                    <Layers className="size-4.5" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 leading-tight">Carrossel Contido</span>
                </button>
              </div>
            </div>

            {/* Categoria 2: Vantagens e Produtos */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Estrutura Comercial</span>
                <ChevronDown className="size-3 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Widget 3: Linha de 4 Cards Benefícios */}
                <button
                  className="group flex flex-col items-center justify-center rounded border border-[#d5d8dc] bg-white p-3 text-center transition hover:border-[#8C1D40] hover:shadow-sm cursor-pointer"
                  onClick={() => addWidget('benefits-bar')}
                  type="button"
                >
                  <div className="mb-2 flex size-8 items-center justify-center rounded bg-gray-50 text-gray-600 group-hover:text-[#8C1D40]">
                    <Sparkles className="size-4.5" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 leading-tight">4 Cards Benefícios</span>
                </button>

                {/* Widget 4: Vitrine de Ofertas */}
                <button
                  className="group flex flex-col items-center justify-center rounded border border-[#d5d8dc] bg-white p-3 text-center transition hover:border-[#8C1D40] hover:shadow-sm cursor-pointer"
                  onClick={() => addWidget('product-carousel')}
                  type="button"
                >
                  <div className="mb-2 flex size-8 items-center justify-center rounded bg-gray-50 text-gray-600 group-hover:text-[#8C1D40]">
                    <Flame className="size-4.5" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 leading-tight">Vitrine Ofertas</span>
                </button>

                {/* Widget 5: Grade de Departamentos */}
                <button
                  className="group flex flex-col items-center justify-center rounded border border-[#d5d8dc] bg-white p-3 text-center transition hover:border-[#8C1D40] hover:shadow-sm cursor-pointer"
                  onClick={() => addWidget('category-grid')}
                  type="button"
                >
                  <div className="mb-2 flex size-8 items-center justify-center rounded bg-gray-50 text-gray-600 group-hover:text-[#8C1D40]">
                    <Grid className="size-4.5" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 leading-tight">Departamentos</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             MODO 2: EDIÇÃO DO WIDGET SELECIONADO (CONTENT / STYLE / ADVANCED)
             ======================================================== */
          <div className="flex flex-col gap-3">
            {/* ABA 1: CONTENT (CONTEÚDO E SLIDES) */}
            {activeTab === 'content' ? (
              <div className="flex flex-col gap-3">
                {/* Accordion: Conteúdo / Banners */}
                <div className="rounded border border-[#d5d8dc] bg-white">
                  <button
                    className="flex w-full cursor-pointer items-center justify-between p-2.5 font-bold text-gray-800 hover:bg-gray-50"
                    onClick={() => setContentSectionOpen(!contentSectionOpen)}
                    type="button"
                  >
                    <span className="text-xs">Itens e Slides</span>
                    <ChevronDown className={`size-3.5 transition-transform ${contentSectionOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {contentSectionOpen ? (
                    <div className="border-t border-[#d5d8dc] p-3 flex flex-col gap-3">
                      {/* SLIDES PARA CARROSSEL FULL LARGURA */}
                      {selectedWidget.type === 'hero-carousel' ? (
                        <>
                          {(selectedWidget.props as any).slides?.map((slide: HeroSlide, idx: number) => (
                            <div className="rounded border border-gray-200 bg-gray-50/70 p-2.5" key={slide.id}>
                              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                                <span className="font-bold text-[11px] text-[#8C1D40]">Slide {idx + 1}</span>
                                <button
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                  onClick={() => removeSlideFromWidget(selectedWidget.id, slide.id)}
                                  type="button"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>

                              <div className="mt-2 flex flex-col gap-1.5">
                                <label className="text-[10.5px] text-gray-500 font-semibold">
                                  Título:
                                  <input
                                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 outline-none"
                                    onChange={(e) =>
                                      updateSlideInWidget(selectedWidget.id, slide.id, { title: e.target.value })
                                    }
                                    type="text"
                                    value={slide.title}
                                  />
                                </label>

                                <label className="text-[10.5px] text-gray-500 font-semibold">
                                  URL da Imagem:
                                  <input
                                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 outline-none"
                                    onChange={(e) =>
                                      updateSlideInWidget(selectedWidget.id, slide.id, { imageUrl: e.target.value })
                                    }
                                    type="text"
                                    value={slide.imageUrl}
                                  />
                                </label>

                                {/* Mini galeria com atalho para os banners da loja */}
                                <div className="mt-1">
                                  <span className="text-[10px] text-gray-400">Trocar por imagem da loja:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {availableBanners.slice(0, 3).map((b) => (
                                      <button
                                        className="rounded bg-gray-200 px-1.5 py-0.5 text-[9.5px] text-gray-700 hover:bg-[#8C1D40] hover:text-white"
                                        key={b.name}
                                        onClick={() =>
                                          updateSlideInWidget(selectedWidget.id, slide.id, { imageUrl: b.url })
                                        }
                                        type="button"
                                      >
                                        {b.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <label className="text-[10.5px] text-gray-500 font-semibold">
                                  Cor de Fundo:
                                  <div className="mt-1 flex items-center gap-2">
                                    <input
                                      className="size-6 cursor-pointer rounded border border-gray-300"
                                      onChange={(e) =>
                                        updateSlideInWidget(selectedWidget.id, slide.id, { backgroundColor: e.target.value })
                                      }
                                      type="color"
                                      value={slide.backgroundColor || '#028F34'}
                                    />
                                    <span className="text-[11px] font-mono text-gray-600">{slide.backgroundColor || '#028F34'}</span>
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}

                          <button
                            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-[#8C1D40] bg-pink-50/40 py-2 font-bold text-xs text-[#8C1D40] transition hover:bg-pink-50"
                            onClick={() => addSlideToWidget(selectedWidget.id)}
                            type="button"
                          >
                            <Plus className="size-3.5" />
                            <span>+ Adicionar Slide</span>
                          </button>
                        </>
                      ) : null}

                      {/* SLIDES PARA CARROSSEL CONTIDO */}
                      {selectedWidget.type === 'contained-hero' ? (
                        <>
                          {(selectedWidget.props as any).slides?.map((slide: ContainedHeroSlide, idx: number) => (
                            <div className="rounded border border-gray-200 bg-gray-50/70 p-2.5" key={slide.id}>
                              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                                <span className="font-bold text-[11px] text-[#8C1D40]">Banner {idx + 1}</span>
                                <button
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                  onClick={() => removeSlideFromWidget(selectedWidget.id, slide.id)}
                                  type="button"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>

                              <div className="mt-2 flex flex-col gap-1.5">
                                <label className="text-[10.5px] text-gray-500 font-semibold">
                                  Título / Campanha:
                                  <input
                                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 outline-none"
                                    onChange={(e) =>
                                      updateSlideInWidget(selectedWidget.id, slide.id, { title: e.target.value })
                                    }
                                    type="text"
                                    value={slide.title}
                                  />
                                </label>

                                <label className="text-[10.5px] text-gray-500 font-semibold">
                                  URL da Imagem:
                                  <input
                                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 outline-none"
                                    onChange={(e) =>
                                      updateSlideInWidget(selectedWidget.id, slide.id, { imageUrl: e.target.value })
                                    }
                                    type="text"
                                    value={slide.imageUrl}
                                  />
                                </label>

                                <div className="mt-1">
                                  <span className="text-[10px] text-gray-400">Imagens oficiais da Comercial:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {availableBanners.slice(2, 6).map((b) => (
                                      <button
                                        className="rounded bg-gray-200 px-1.5 py-0.5 text-[9.5px] text-gray-700 hover:bg-[#8C1D40] hover:text-white"
                                        key={b.name}
                                        onClick={() =>
                                          updateSlideInWidget(selectedWidget.id, slide.id, { imageUrl: b.url })
                                        }
                                        type="button"
                                      >
                                        {b.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-[#8C1D40] bg-pink-50/40 py-2 font-bold text-xs text-[#8C1D40] transition hover:bg-pink-50"
                            onClick={() => addSlideToWidget(selectedWidget.id)}
                            type="button"
                          >
                            <Plus className="size-3.5" />
                            <span>+ Adicionar Banner</span>
                          </button>
                        </>
                      ) : null}

                      {/* ITENS PARA 4 CARDS DE BENEFÍCIOS */}
                      {selectedWidget.type === 'benefits-bar' ? (
                        <>
                          {((selectedWidget.props as any).items || []).map((item: BenefitItem, idx: number) => (
                            <div className="rounded border border-gray-200 bg-gray-50 p-2" key={idx}>
                              <span className="font-bold text-[11px] text-[#8C1D40]">Card {idx + 1}</span>
                              <div className="mt-1.5 flex flex-col gap-1.5">
                                <label className="text-[10px] text-gray-500">
                                  Ícone:
                                  <select
                                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                                    onChange={(e) =>
                                      updateBenefitItem(selectedWidget.id, idx, { iconName: e.target.value as any })
                                    }
                                    value={item.iconName}
                                  >
                                    <option value="truck">Caminhão (Entrega)</option>
                                    <option value="tag">Etiqueta (Preço)</option>
                                    <option value="package">Pacote (Variedade)</option>
                                    <option value="shield">Escudo (Confiança)</option>
                                    <option value="store">Loja Física (Retirada)</option>
                                    <option value="clock">Relógio (Agilidade)</option>
                                  </select>
                                </label>

                                <label className="text-[10px] text-gray-500">
                                  Título:
                                  <input
                                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                                    onChange={(e) => updateBenefitItem(selectedWidget.id, idx, { title: e.target.value })}
                                    type="text"
                                    value={item.title}
                                  />
                                </label>

                                <label className="text-[10px] text-gray-500">
                                  Descrição:
                                  <input
                                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                                    onChange={(e) =>
                                      updateBenefitItem(selectedWidget.id, idx, { description: e.target.value })
                                    }
                                    type="text"
                                    value={item.description}
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : null}

                      {/* PROPRIEDADES DE PRODUTOS */}
                      {selectedWidget.type === 'product-carousel' ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-[10.5px] font-semibold text-gray-600">
                            Título:
                            <input
                              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              onChange={(e) => updateWidgetProps(selectedWidget.id, { title: e.target.value })}
                              type="text"
                              value={(selectedWidget.props as any).title || ''}
                            />
                          </label>

                          <label className="text-[10.5px] font-semibold text-gray-600">
                            Badge:
                            <input
                              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              onChange={(e) => updateWidgetProps(selectedWidget.id, { badge: e.target.value })}
                              type="text"
                              value={(selectedWidget.props as any).badge || ''}
                            />
                          </label>

                          <label className="text-[10.5px] font-semibold text-gray-600">
                            Quantidade:
                            <input
                              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              onChange={(e) => updateWidgetProps(selectedWidget.id, { limit: Number(e.target.value) || 8 })}
                              type="number"
                              value={(selectedWidget.props as any).limit || 8}
                            />
                          </label>
                        </div>
                      ) : null}

                      {/* PROPRIEDADES DE CATEGORIAS */}
                      {selectedWidget.type === 'category-grid' ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-[10.5px] font-semibold text-gray-600">
                            Título:
                            <input
                              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              onChange={(e) => updateWidgetProps(selectedWidget.id, { title: e.target.value })}
                              type="text"
                              value={(selectedWidget.props as any).title || ''}
                            />
                          </label>

                          <label className="text-[10.5px] font-semibold text-gray-600">
                            Colunas:
                            <select
                              className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                              onChange={(e) => updateWidgetProps(selectedWidget.id, { columns: Number(e.target.value) || 4 })}
                              value={(selectedWidget.props as any).columns || 4}
                            >
                              <option value="2">2 Colunas</option>
                              <option value="3">3 Colunas</option>
                              <option value="4">4 Colunas</option>
                            </select>
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* ABA 2: STYLE (ESTILO, CORES E SOMBRAS) */}
            {activeTab === 'style' ? (
              <div className="flex flex-col gap-3">
                <div className="rounded border border-[#d5d8dc] bg-white p-3">
                  <span className="font-bold text-xs uppercase text-gray-700">Comportamento Visual</span>
                  <div className="mt-3 flex flex-col gap-2.5">
                    {selectedWidget.type === 'hero-carousel' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-600">Degradê de Transição:</span>
                          <input
                            checked={(selectedWidget.props as any).bottomGradient !== false}
                            className="size-4 accent-[#8C1D40]"
                            onChange={(e) =>
                              updateWidgetProps(selectedWidget.id, { bottomGradient: e.target.checked })
                            }
                            type="checkbox"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-600">Mostrar Setas:</span>
                          <input
                            checked={(selectedWidget.props as any).showArrows !== false}
                            className="size-4 accent-[#8C1D40]"
                            onChange={(e) =>
                              updateWidgetProps(selectedWidget.id, { showArrows: e.target.checked })
                            }
                            type="checkbox"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-600">Mostrar Indicadores:</span>
                          <input
                            checked={(selectedWidget.props as any).showDots !== false}
                            className="size-4 accent-[#8C1D40]"
                            onChange={(e) =>
                              updateWidgetProps(selectedWidget.id, { showDots: e.target.checked })
                            }
                            type="checkbox"
                          />
                        </div>
                      </>
                    ) : null}

                    {selectedWidget.type === 'contained-hero' ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-600">Sobreposição Superior (-mt):</span>
                        <input
                          checked={(selectedWidget.props as any).overlapTop !== false}
                          className="size-4 accent-[#8C1D40]"
                          onChange={(e) =>
                            updateWidgetProps(selectedWidget.id, { overlapTop: e.target.checked })
                          }
                          type="checkbox"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* ABA 3: ADVANCED (AVANÇADO / RESPONSIVIDADE) */}
            {activeTab === 'advanced' ? (
              <div className="flex flex-col gap-3">
                <div className="rounded border border-[#d5d8dc] bg-white p-3">
                  <span className="font-bold text-xs uppercase text-gray-700">Tempo de Rotação</span>
                  <div className="mt-2">
                    <label className="text-[11px] text-gray-600">
                      Autoplay Interval (ms):
                      <input
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        onChange={(e) =>
                          updateWidgetProps(selectedWidget.id, {
                            autoplayIntervalMs: Number(e.target.value) || 5000,
                          })
                        }
                        type="number"
                        value={(selectedWidget.props as any).autoplayIntervalMs || 5000}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded border border-[#d5d8dc] bg-white p-3">
                  <span className="font-bold text-xs uppercase text-gray-700">Ordem da Seção</span>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Posição atual na vitrine: <b>#{selectedWidget.order}</b>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
