'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { defaultHomeComposition } from '@/lib/storefront/home-configuration';
import type {
  BenefitItem,
  ContainedHeroSlide,
  HeroSlide,
  PageComposition,
  WidgetConfig,
  WidgetType,
} from '@/lib/storefront/widget-types';

const STORAGE_KEY = 'cdn_home_composition_v1';

interface EditorContextValue {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  composition: PageComposition;
  selectedWidgetId: string | null;
  setSelectedWidgetId: (id: string | null) => void;
  updateWidgetProps: (id: string, newProps: any) => void;
  moveWidget: (id: string, direction: 'up' | 'down') => void;
  removeWidget: (id: string) => void;
  toggleWidget: (id: string) => void;
  addWidget: (type: WidgetType) => void;
  addSlideToWidget: (widgetId: string) => void;
  removeSlideFromWidget: (widgetId: string, slideId: string) => void;
  updateSlideInWidget: (widgetId: string, slideId: string, partial: any) => void;
  updateBenefitItem: (widgetId: string, index: number, partial: Partial<BenefitItem>) => void;
  resetToDefault: () => void;
  saveComposition: () => void;
  hasUnsavedChanges: boolean;
  saveMessage: string | null;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  children,
  initialComposition = defaultHomeComposition,
}: {
  children: React.ReactNode;
  initialComposition?: PageComposition;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [composition, setComposition] = useState<PageComposition>(initialComposition);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Carrega do localStorage no cliente se existir versão salva
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.widgets && Array.isArray(parsed.widgets)) {
          setComposition(parsed);
        }
      }
    } catch {
      // Ignora erro de parse e mantém padrão
    }
  }, []);

  function updateWidgetProps(id: string, newProps: any) {
    setComposition((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, props: { ...w.props, ...newProps } } : w)) as WidgetConfig[],
    }));
    setHasUnsavedChanges(true);
  }

  function moveWidget(id: string, direction: 'up' | 'down') {
    setComposition((prev) => {
      const sorted = [...prev.widgets].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((w) => w.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === sorted.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const currentOrder = sorted[index].order;
      const targetOrder = sorted[targetIndex].order;

      sorted[index].order = targetOrder;
      sorted[targetIndex].order = currentOrder;

      return {
        ...prev,
        widgets: [...sorted].sort((a, b) => a.order - b.order),
      };
    });
    setHasUnsavedChanges(true);
  }

  function removeWidget(id: string) {
    setComposition((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== id),
    }));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
    setHasUnsavedChanges(true);
  }

  function toggleWidget(id: string) {
    setComposition((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)) as WidgetConfig[],
    }));
    setHasUnsavedChanges(true);
  }

  function addWidget(type: WidgetType) {
    const newId = `${type}-${Date.now().toString(36)}`;
    const maxOrder = composition.widgets.reduce((max, w) => Math.max(max, w.order), 0);

    let defaultProps: any = {};
    if (type === 'hero-carousel') {
      defaultProps = {
        autoplayIntervalMs: 5000,
        showArrows: true,
        showDots: true,
        bottomGradient: true,
        slides: [
          {
            id: `slide-${Date.now()}`,
            title: 'Novo Banner Destaque',
            imageUrl: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_977867-MLA118147004068_102026-OO.webp',
            linkUrl: '/loja',
            altText: 'Novo Banner Comercial do Norte',
            backgroundColor: '#004CB1',
          },
        ],
      };
    } else if (type === 'contained-hero') {
      defaultProps = {
        autoplayIntervalMs: 6000,
        showArrows: true,
        showDots: true,
        overlapTop: false,
        slides: [
          {
            id: `slide-c-${Date.now()}`,
            title: 'Campanha Comercial do Norte',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_x5pilwx5pilwx5pi.jpg',
            linkUrl: '/loja',
            altText: 'Campanha Comercial do Norte',
          },
        ],
      };
    } else if (type === 'benefits-bar') {
      defaultProps = {
        items: [
          { iconName: 'truck', title: 'Entrega Rápida', description: 'Em Belém e Região Metropolitana' },
          { iconName: 'tag', title: 'Menor Preço', description: 'Condições de atacado e varejo' },
          { iconName: 'package', title: 'Variedade', description: 'Milhares de itens em um só lugar' },
          { iconName: 'shield', title: 'Qualidade Garantida', description: 'Tradição e atendimento comercial' },
        ],
      };
    } else if (type === 'product-carousel') {
      defaultProps = {
        title: 'Produtos em Destaque',
        subtitle: 'Confira as melhores ofertas para o seu negócio',
        badge: 'DESTAQUES',
        source: 'offers',
        limit: 8,
        viewAllLink: '/loja',
      };
    } else if (type === 'category-grid') {
      defaultProps = {
        title: 'Navegue por Departamentos',
        subtitle: 'Encontre embalagens, descartáveis e mais',
        viewAllLink: '/loja',
        columns: 4,
      };
    }

    const newWidget: WidgetConfig = {
      id: newId,
      type,
      enabled: true,
      order: maxOrder + 1,
      props: defaultProps,
    } as WidgetConfig;

    setComposition((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));
    setSelectedWidgetId(newId);
    setHasUnsavedChanges(true);
  }

  function addSlideToWidget(widgetId: string) {
    setComposition((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => {
        if (w.id !== widgetId) return w;
        if (w.type === 'hero-carousel') {
          const currentSlides = (w.props as any).slides || [];
          const newSlide: HeroSlide = {
            id: `slide-${Date.now()}`,
            title: `Novo Slide ${currentSlides.length + 1}`,
            imageUrl: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_690577-MLA118270011000_102026-OO.webp',
            linkUrl: '/loja',
            altText: 'Banner Comercial do Norte',
            backgroundColor: '#028F34',
          };
          return { ...w, props: { ...w.props, slides: [...currentSlides, newSlide] } };
        }
        if (w.type === 'contained-hero') {
          const currentSlides = (w.props as any).slides || [];
          const newSlide: ContainedHeroSlide = {
            id: `slide-c-${Date.now()}`,
            title: `Novo Banner de Campanha ${currentSlides.length + 1}`,
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k46c0pk46c0pk46c.jpg',
            linkUrl: '/loja',
            altText: 'Campanha Comercial do Norte',
          };
          return { ...w, props: { ...w.props, slides: [...currentSlides, newSlide] } };
        }
        return w;
      }) as WidgetConfig[],
    }));
    setHasUnsavedChanges(true);
  }

  function removeSlideFromWidget(widgetId: string, slideId: string) {
    setComposition((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => {
        if (w.id !== widgetId) return w;
        const currentSlides = (w.props as any).slides || [];
        return {
          ...w,
          props: {
            ...w.props,
            slides: currentSlides.filter((s: any) => s.id !== slideId),
          },
        };
      }) as WidgetConfig[],
    }));
    setHasUnsavedChanges(true);
  }

  function updateSlideInWidget(widgetId: string, slideId: string, partial: any) {
    setComposition((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => {
        if (w.id !== widgetId) return w;
        const currentSlides = (w.props as any).slides || [];
        return {
          ...w,
          props: {
            ...w.props,
            slides: currentSlides.map((s: any) => (s.id === slideId ? { ...s, ...partial } : s)),
          },
        };
      }) as WidgetConfig[],
    }));
    setHasUnsavedChanges(true);
  }

  function updateBenefitItem(widgetId: string, index: number, partial: Partial<BenefitItem>) {
    setComposition((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => {
        if (w.id !== widgetId || w.type !== 'benefits-bar') return w;
        const items = [...((w.props as any).items || [])];
        if (items[index]) {
          items[index] = { ...items[index], ...partial };
        }
        return { ...w, props: { ...w.props, items } };
      }) as WidgetConfig[],
    }));
    setHasUnsavedChanges(true);
  }

  function saveComposition() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(composition));
      setHasUnsavedChanges(false);
      setSaveMessage('Alterações salvas com sucesso no navegador!');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch {
      setSaveMessage('Erro ao salvar no navegador.');
      setTimeout(() => setSaveMessage(null), 3500);
    }
  }

  function resetToDefault() {
    if (confirm('Tem certeza de que deseja restaurar o layout original da vitrine?')) {
      localStorage.removeItem(STORAGE_KEY);
      setComposition(defaultHomeComposition);
      setSelectedWidgetId(null);
      setHasUnsavedChanges(false);
      setSaveMessage('Vitrine restaurada para o padrão oficial!');
      setTimeout(() => setSaveMessage(null), 3500);
    }
  }

  return (
    <EditorContext.Provider
      value={{
        isEditing,
        setIsEditing,
        composition,
        selectedWidgetId,
        setSelectedWidgetId,
        updateWidgetProps,
        moveWidget,
        removeWidget,
        toggleWidget,
        addWidget,
        addSlideToWidget,
        removeSlideFromWidget,
        updateSlideInWidget,
        updateBenefitItem,
        resetToDefault,
        saveComposition,
        hasUnsavedChanges,
        saveMessage,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor deve ser usado dentro de um EditorProvider');
  }
  return context;
}
