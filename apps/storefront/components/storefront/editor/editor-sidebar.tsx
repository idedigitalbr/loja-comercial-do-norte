'use client';

import React from 'react';
import {
  ChevronRight,
  Eye,
  Flame,
  Grid,
  Image as ImageIcon,
  Layers,
  Palette,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useEditor } from './editor-context';
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
    name: 'Pará Trigo Panificação',
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
    name: 'Convenção Rumo ao Futuro',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_yr0ncxyr0ncxyr0n (1).jpg',
  },
];

export function EditorSidebar() {
  const {
    isEditing,
    composition,
    selectedWidgetId,
    setSelectedWidgetId,
    updateWidgetProps,
    addWidget,
    addSlideToWidget,
    removeSlideFromWidget,
    updateSlideInWidget,
    updateBenefitItem,
  } = useEditor();

  if (!isEditing || !selectedWidgetId) return null;

  const isCatalog = selectedWidgetId === 'NEW_WIDGET_CATALOG';
  const selectedWidget = composition.widgets.find((w) => w.id === selectedWidgetId);

  return (
    <aside
      aria-label="Painel de Propriedades do Elementor"
      className="fixed top-14 right-0 bottom-0 z-50 flex w-[380px] max-w-[90vw] flex-col border-l border-line bg-white shadow-2xl animate-in slide-in-from-right duration-300"
    >
      {/* Cabeçalho do Painel Lateral */}
      <div className="flex items-center justify-between border-b border-line bg-[#13213B] p-4 text-white">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-[#004CB1]" />
          <div>
            <h3 className="text-sm font-bold">
              {isCatalog ? 'Adicionar Novo Widget' : 'Propriedades da Seção'}
            </h3>
            <p className="text-[11px] text-white/70">
              {isCatalog ? 'Escolha um tipo de widget para inserir' : selectedWidget?.type}
            </p>
          </div>
        </div>
        <button
          aria-label="Fechar painel"
          className="cursor-pointer rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => setSelectedWidgetId(null)}
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Corpo do Painel Lateral */}
      <div className="no-scrollbar flex-1 overflow-y-auto p-4 text-sm text-ink">
        {/* CATÁLOGO DE WIDGETS */}
        {isCatalog ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted">
              Clique em um dos widgets disponíveis para adicionar à vitrine:
            </p>

            <button
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-left transition hover:border-[#004CB1] hover:bg-blue-50/30"
              onClick={() => addWidget('hero-carousel')}
              type="button"
            >
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#004CB1]">
                <ImageIcon className="size-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-ink">Carrossel Full Largura</h4>
                <p className="text-xs text-muted">Banner principal estilo Mercado Livre com largura total e degradê.</p>
              </div>
              <Plus className="size-4 text-brand" />
            </button>

            <button
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-left transition hover:border-[#004CB1] hover:bg-blue-50/30"
              onClick={() => addWidget('contained-hero')}
              type="button"
            >
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Layers className="size-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-ink">Carrossel Padrão Contido</h4>
                <p className="text-xs text-muted">Carrossel arredondado sobreposto com controles translúcidos.</p>
              </div>
              <Plus className="size-4 text-brand" />
            </button>

            <button
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-left transition hover:border-[#004CB1] hover:bg-blue-50/30"
              onClick={() => addWidget('benefits-bar')}
              type="button"
            >
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Sparkles className="size-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-ink">Linha de 4 Cards / Ícones</h4>
                <p className="text-xs text-muted">Faixa de benefícios com 4 colunas de selos de entrega e vantagens.</p>
              </div>
              <Plus className="size-4 text-brand" />
            </button>

            <button
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-left transition hover:border-[#004CB1] hover:bg-blue-50/30"
              onClick={() => addWidget('product-carousel')}
              type="button"
            >
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-[#E33C34]">
                <Flame className="size-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-ink">Vitrine de Ofertas</h4>
                <p className="text-xs text-muted">Carrossel de produtos com botão de cotação e preço de atacado.</p>
              </div>
              <Plus className="size-4 text-brand" />
            </button>

            <button
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-left transition hover:border-[#004CB1] hover:bg-blue-50/30"
              onClick={() => addWidget('category-grid')}
              type="button"
            >
              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Grid className="size-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-ink">Grade de Departamentos</h4>
                <p className="text-xs text-muted">Lista com cards modernos das principais categorias da loja.</p>
              </div>
              <Plus className="size-4 text-brand" />
            </button>
          </div>
        ) : null}

        {/* FORMULÁRIO DO WIDGET SELECIONADO */}
        {selectedWidget ? (
          <div className="flex flex-col gap-5">
            {/* 1. SE FOR HERO-CAROUSEL (FULL LARGURA) */}
            {selectedWidget.type === 'hero-carousel' ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-line p-3 bg-surface-soft">
                  <span className="text-xs font-bold uppercase text-muted">Configurações Gerais</span>
                  <div className="mt-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold text-body">
                      Tempo de Autoplay (ms):
                      <input
                        className="mt-1 w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink"
                        onChange={(e) =>
                          updateWidgetProps(selectedWidget.id, {
                            autoplayIntervalMs: Number(e.target.value) || 5000,
                          })
                        }
                        type="number"
                        value={(selectedWidget.props as any).autoplayIntervalMs || 5000}
                      />
                    </label>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-body">Degradê inferior:</span>
                      <input
                        checked={(selectedWidget.props as any).bottomGradient !== false}
                        className="size-4 accent-[#004CB1]"
                        onChange={(e) =>
                          updateWidgetProps(selectedWidget.id, {
                            bottomGradient: e.target.checked,
                          })
                        }
                        type="checkbox"
                      />
                    </div>
                  </div>
                </div>

                {/* Slides do Carrossel */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Slides do Carrossel ({(selectedWidget.props as any).slides?.length || 0})
                  </h4>
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded bg-[#004CB1] px-2 py-1 text-xs font-bold text-white hover:bg-[#003b8a]"
                    onClick={() => addSlideToWidget(selectedWidget.id)}
                    type="button"
                  >
                    <Plus className="size-3" />
                    <span>Novo Slide</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {(selectedWidget.props as any).slides?.map((slide: HeroSlide, idx: number) => (
                    <div className="rounded-xl border border-line bg-white p-3 shadow-xs" key={slide.id}>
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <span className="font-bold text-xs text-brand">Slide {idx + 1}</span>
                        <button
                          className="cursor-pointer text-red-600 hover:text-red-700"
                          onClick={() => removeSlideFromWidget(selectedWidget.id, slide.id)}
                          title="Remover slide"
                          type="button"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-col gap-2">
                        <label className="text-xs text-muted">
                          Título:
                          <input
                            className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                            onChange={(e) =>
                              updateSlideInWidget(selectedWidget.id, slide.id, { title: e.target.value })
                            }
                            type="text"
                            value={slide.title}
                          />
                        </label>

                        <label className="text-xs text-muted">
                          URL da Imagem:
                          <input
                            className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                            onChange={(e) =>
                              updateSlideInWidget(selectedWidget.id, slide.id, { imageUrl: e.target.value })
                            }
                            type="text"
                            value={slide.imageUrl}
                          />
                        </label>

                        {/* Atalhos para imagens já disponíveis */}
                        <div>
                          <span className="text-[10.5px] font-semibold text-muted">Escolher imagem rápida:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {availableBanners.slice(0, 4).map((b) => (
                              <button
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-body hover:bg-[#004CB1] hover:text-white"
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

                        <label className="text-xs text-muted">
                          Cor de Fundo:
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              className="size-7 rounded cursor-pointer border border-line"
                              onChange={(e) =>
                                updateSlideInWidget(selectedWidget.id, slide.id, { backgroundColor: e.target.value })
                              }
                              type="color"
                              value={slide.backgroundColor || '#028F34'}
                            />
                            <span className="text-xs font-mono">{slide.backgroundColor || '#028F34'}</span>
                          </div>
                        </label>

                        <label className="text-xs text-muted">
                          Link de Destino:
                          <input
                            className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                            onChange={(e) =>
                              updateSlideInWidget(selectedWidget.id, slide.id, { linkUrl: e.target.value })
                            }
                            type="text"
                            value={slide.linkUrl}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 2. SE FOR CONTAINED-HERO (CARROSSEL PADRÃO CONTIDO) */}
            {selectedWidget.type === 'contained-hero' ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-line p-3 bg-surface-soft">
                  <span className="text-xs font-bold uppercase text-muted">Configurações do Carrossel</span>
                  <div className="mt-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold text-body">
                      Tempo de Autoplay (ms):
                      <input
                        className="mt-1 w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink"
                        onChange={(e) =>
                          updateWidgetProps(selectedWidget.id, {
                            autoplayIntervalMs: Number(e.target.value) || 6000,
                          })
                        }
                        type="number"
                        value={(selectedWidget.props as any).autoplayIntervalMs || 6000}
                      />
                    </label>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-body">Sobrepor topo (-mt):</span>
                      <input
                        checked={(selectedWidget.props as any).overlapTop !== false}
                        className="size-4 accent-[#004CB1]"
                        onChange={(e) =>
                          updateWidgetProps(selectedWidget.id, {
                            overlapTop: e.target.checked,
                          })
                        }
                        type="checkbox"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Campanhas e Banners ({(selectedWidget.props as any).slides?.length || 0})
                  </h4>
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded bg-[#004CB1] px-2 py-1 text-xs font-bold text-white hover:bg-[#003b8a]"
                    onClick={() => addSlideToWidget(selectedWidget.id)}
                    type="button"
                  >
                    <Plus className="size-3" />
                    <span>Novo Banner</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {(selectedWidget.props as any).slides?.map((slide: ContainedHeroSlide, idx: number) => (
                    <div className="rounded-xl border border-line bg-white p-3 shadow-xs" key={slide.id}>
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <span className="font-bold text-xs text-brand">Banner {idx + 1}</span>
                        <button
                          className="cursor-pointer text-red-600 hover:text-red-700"
                          onClick={() => removeSlideFromWidget(selectedWidget.id, slide.id)}
                          title="Remover banner"
                          type="button"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-col gap-2">
                        <label className="text-xs text-muted">
                          Título / Campanha:
                          <input
                            className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                            onChange={(e) =>
                              updateSlideInWidget(selectedWidget.id, slide.id, { title: e.target.value })
                            }
                            type="text"
                            value={slide.title}
                          />
                        </label>

                        <label className="text-xs text-muted">
                          URL da Imagem:
                          <input
                            className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                            onChange={(e) =>
                              updateSlideInWidget(selectedWidget.id, slide.id, { imageUrl: e.target.value })
                            }
                            type="text"
                            value={slide.imageUrl}
                          />
                        </label>

                        {/* Atalhos para imagens já disponíveis */}
                        <div>
                          <span className="text-[10.5px] font-semibold text-muted">Escolher imagem rápida:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {availableBanners.slice(2).map((b) => (
                              <button
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-body hover:bg-[#004CB1] hover:text-white"
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

                        <label className="text-xs text-muted">
                          Link de Destino:
                          <input
                            className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                            onChange={(e) =>
                              updateSlideInWidget(selectedWidget.id, slide.id, { linkUrl: e.target.value })
                            }
                            type="text"
                            value={slide.linkUrl}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 3. SE FOR BENEFITS-BAR (LINHA DE 4 CARDS) */}
            {selectedWidget.type === 'benefits-bar' ? (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Cards de Benefícios (4 Colunas)
                </h4>

                {((selectedWidget.props as any).items || []).map((item: BenefitItem, idx: number) => (
                  <div className="rounded-xl border border-line bg-white p-3 shadow-xs" key={idx}>
                    <span className="font-bold text-xs text-brand">Card {idx + 1}</span>
                    <div className="mt-2 flex flex-col gap-2">
                      <label className="text-xs text-muted">
                        Ícone:
                        <select
                          className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink bg-white"
                          onChange={(e) =>
                            updateBenefitItem(selectedWidget.id, idx, {
                              iconName: e.target.value as any,
                            })
                          }
                          value={item.iconName}
                        >
                          <option value="truck">Caminhão (Entrega)</option>
                          <option value="tag">Etiqueta (Menor Preço)</option>
                          <option value="package">Pacote (Variedade)</option>
                          <option value="shield">Escudo (Garantia / Atendimento)</option>
                          <option value="store">Loja Física (Retirada)</option>
                          <option value="clock">Relógio (Agilidade)</option>
                        </select>
                      </label>

                      <label className="text-xs text-muted">
                        Título:
                        <input
                          className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                          onChange={(e) => updateBenefitItem(selectedWidget.id, idx, { title: e.target.value })}
                          type="text"
                          value={item.title}
                        />
                      </label>

                      <label className="text-xs text-muted">
                        Descrição:
                        <input
                          className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
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
              </div>
            ) : null}

            {/* 4. SE FOR PRODUCT-CAROUSEL */}
            {selectedWidget.type === 'product-carousel' ? (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Vitrine de Produtos</h4>

                <label className="text-xs text-muted">
                  Título da Seção:
                  <input
                    className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                    onChange={(e) => updateWidgetProps(selectedWidget.id, { title: e.target.value })}
                    type="text"
                    value={(selectedWidget.props as any).title || ''}
                  />
                </label>

                <label className="text-xs text-muted">
                  Subtítulo:
                  <input
                    className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                    onChange={(e) => updateWidgetProps(selectedWidget.id, { subtitle: e.target.value })}
                    type="text"
                    value={(selectedWidget.props as any).subtitle || ''}
                  />
                </label>

                <label className="text-xs text-muted">
                  Texto do Badge:
                  <input
                    className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                    onChange={(e) => updateWidgetProps(selectedWidget.id, { badge: e.target.value })}
                    type="text"
                    value={(selectedWidget.props as any).badge || ''}
                  />
                </label>

                <label className="text-xs text-muted">
                  Limite de Itens:
                  <input
                    className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                    onChange={(e) =>
                      updateWidgetProps(selectedWidget.id, { limit: Number(e.target.value) || 8 })
                    }
                    type="number"
                    value={(selectedWidget.props as any).limit || 8}
                  />
                </label>
              </div>
            ) : null}

            {/* 5. SE FOR CATEGORY-GRID */}
            {selectedWidget.type === 'category-grid' ? (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Grade de Departamentos</h4>

                <label className="text-xs text-muted">
                  Título:
                  <input
                    className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                    onChange={(e) => updateWidgetProps(selectedWidget.id, { title: e.target.value })}
                    type="text"
                    value={(selectedWidget.props as any).title || ''}
                  />
                </label>

                <label className="text-xs text-muted">
                  Subtítulo:
                  <input
                    className="mt-1 w-full rounded border border-line px-2 py-1 text-xs text-ink"
                    onChange={(e) => updateWidgetProps(selectedWidget.id, { subtitle: e.target.value })}
                    type="text"
                    value={(selectedWidget.props as any).subtitle || ''}
                  />
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
