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

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type ElementorTab = 'content' | 'style' | 'advanced';

interface ElementorContextValue {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  viewport: ViewportMode;
  setViewport: (vp: ViewportMode) => void;
  showNavigator: boolean;
  setShowNavigator: (show: boolean) => void;
  activeTab: ElementorTab;
  setActiveTab: (tab: ElementorTab) => void;
  composition: PageComposition;
  selectedWidgetId: string | null;
  setSelectedWidgetId: (id: string | null) => void;
  updateWidgetProps: (id: string, newProps: any) => void;
  moveWidget: (id: string, direction: 'up' | 'down') => void;
  removeWidget: (id: string) => void;
  toggleWidget: (id: string) => void;
  addWidget: (type: WidgetType, insertIndex?: number) => void;
  addSlideToWidget: (widgetId: string) => void;
  removeSlideFromWidget: (widgetId: string, slideId: string) => void;
  updateSlideInWidget: (widgetId: string, slideId: string, partial: any) => void;
  updateBenefitItem: (widgetId: string, index: number, partial: Partial<BenefitItem>) => void;
  resetToDefault: () => void;
  saveComposition: () => void;
  hasUnsavedChanges: boolean;
  saveMessage: string | null;
  panelCollapsed: boolean;
  setPanelCollapsed: (collapsed: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ElementorContext = createContext<ElementorContextValue | null>(null);

export function ElementorEditorProvider({
  children,
  initialComposition = defaultHomeComposition,
}: {
  children: React.ReactNode;
  initialComposition?: PageComposition;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [showNavigator, setShowNavigator] = useState(false);
  const [activeTab, setActiveTab] = useState<ElementorTab>('content');
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const [composition, setComposition] = useState<PageComposition>(initialComposition);
  const [history, setHistory] = useState<PageComposition[]>([initialComposition]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.widgets && Array.isArray(parsed.widgets)) {
          setComposition(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
        }
      }
    } catch {
      // Ignora erro de storage
    }
  }, []);

  function commitChange(newComp: PageComposition) {
    setComposition(newComp);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newComp]);
    setHistoryIndex((prev) => prev + 1);
    setHasUnsavedChanges(true);
  }

  function undo() {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setComposition(history[nextIndex]);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setComposition(history[nextIndex]);
    }
  }

  function updateWidgetProps(id: string, newProps: any) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) =>
        w.id === id ? { ...w, props: { ...w.props, ...newProps } } : w
      ) as WidgetConfig[],
    };
    commitChange(updated);
  }

  function moveWidget(id: string, direction: 'up' | 'down') {
    const sorted = [...composition.widgets].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((w) => w.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentOrder = sorted[index].order;
    const targetOrder = sorted[targetIndex].order;

    sorted[index].order = targetOrder;
    sorted[targetIndex].order = currentOrder;

    commitChange({
      ...composition,
      widgets: [...sorted].sort((a, b) => a.order - b.order),
    });
  }

  function removeWidget(id: string) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.filter((w) => w.id !== id),
    };
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
    commitChange(updated);
  }

  function toggleWidget(id: string) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) =>
        w.id === id ? { ...w, enabled: !w.enabled } : w
      ) as WidgetConfig[],
    };
    commitChange(updated);
  }

  function addWidget(type: WidgetType, insertIndex?: number) {
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
            title: 'Semana Intelbras no seu ritmo',
            imageUrl: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_977867-MLA118147004068_102026-OO.webp',
            linkUrl: '/loja',
            altText: 'Banner Comercial do Norte',
            backgroundColor: '#028F34',
          },
        ],
      };
    } else if (type === 'contained-hero') {
      defaultProps = {
        autoplayIntervalMs: 6000,
        showArrows: true,
        showDots: true,
        overlapTop: true,
        slides: [
          {
            id: `slide-c-${Date.now()}`,
            title: 'Super Oferta Cristalcopo',
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_x5pilwx5pilwx5pi.jpg',
            linkUrl: '/loja',
            altText: 'Campanha Comercial do Norte',
          },
        ],
      };
    } else if (type === 'benefits-bar') {
      defaultProps = {
        items: [
          { iconName: 'truck', title: 'Entrega em Belém', description: 'Logística rápida para sua empresa' },
          { iconName: 'tag', title: 'Menor Preço Atacado', description: 'Condições de distribuidora oficial' },
          { iconName: 'package', title: 'Tudo em um Só Lugar', description: 'Embalagens, descartáveis e festas' },
          { iconName: 'shield', title: 'Atendimento Próximo', description: 'Cotação rápida por WhatsApp' },
        ],
      };
    } else if (type === 'product-carousel') {
      defaultProps = {
        title: 'Ofertas em Destaque',
        subtitle: 'Preços especiais para cotação imediata',
        badge: 'OFERTAS',
        source: 'offers',
        limit: 8,
        viewAllLink: '/loja',
      };
    } else if (type === 'category-grid') {
      defaultProps = {
        title: 'Departamentos da Loja',
        subtitle: 'Encontre o que você precisa com facilidade',
        viewAllLink: '/loja',
        columns: 4,
      };
    }

    const newWidget: WidgetConfig = {
      id: newId,
      type,
      enabled: true,
      order: typeof insertIndex === 'number' ? insertIndex : maxOrder + 1,
      props: defaultProps,
    } as WidgetConfig;

    const newWidgets = [...composition.widgets, newWidget].sort((a, b) => a.order - b.order);
    commitChange({ ...composition, widgets: newWidgets });
    setSelectedWidgetId(newId);
    setActiveTab('content');
    setPanelCollapsed(false);
  }

  function addSlideToWidget(widgetId: string) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) => {
        if (w.id !== widgetId) return w;
        if (w.type === 'hero-carousel') {
          const currentSlides = (w.props as any).slides || [];
          const newSlide: HeroSlide = {
            id: `slide-${Date.now()}`,
            title: `Novo Slide ${currentSlides.length + 1}`,
            imageUrl: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_690577-MLA118270011000_102026-OO.webp',
            linkUrl: '/loja',
            altText: 'Banner Comercial do Norte',
            backgroundColor: '#004CB1',
          };
          return { ...w, props: { ...w.props, slides: [...currentSlides, newSlide] } };
        }
        if (w.type === 'contained-hero') {
          const currentSlides = (w.props as any).slides || [];
          const newSlide: ContainedHeroSlide = {
            id: `slide-c-${Date.now()}`,
            title: `Novo Banner ${currentSlides.length + 1}`,
            imageUrl: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k46c0pk46c0pk46c.jpg',
            linkUrl: '/loja',
            altText: 'Campanha Comercial do Norte',
          };
          return { ...w, props: { ...w.props, slides: [...currentSlides, newSlide] } };
        }
        return w;
      }) as WidgetConfig[],
    };
    commitChange(updated);
  }

  function removeSlideFromWidget(widgetId: string, slideId: string) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) => {
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
    };
    commitChange(updated);
  }

  function updateSlideInWidget(widgetId: string, slideId: string, partial: any) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) => {
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
    };
    commitChange(updated);
  }

  function updateBenefitItem(widgetId: string, index: number, partial: Partial<BenefitItem>) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) => {
        if (w.id !== widgetId || w.type !== 'benefits-bar') return w;
        const items = [...((w.props as any).items || [])];
        if (items[index]) {
          items[index] = { ...items[index], ...partial };
        }
        return { ...w, props: { ...w.props, items } };
      }) as WidgetConfig[],
    };
    commitChange(updated);
  }

  function saveComposition() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(composition));
      setHasUnsavedChanges(false);
      setSaveMessage('Alterações salvas e publicadas!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage('Erro ao gravar no navegador.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  function resetToDefault() {
    if (confirm('Deseja restaurar a vitrine oficial do Comercial do Norte?')) {
      localStorage.removeItem(STORAGE_KEY);
      commitChange(defaultHomeComposition);
      setSelectedWidgetId(null);
      setHasUnsavedChanges(false);
      setSaveMessage('Vitrine resetada para o padrão!');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  return (
    <ElementorContext.Provider
      value={{
        isEditing,
        setIsEditing,
        previewMode,
        setPreviewMode,
        viewport,
        setViewport,
        showNavigator,
        setShowNavigator,
        activeTab,
        setActiveTab,
        panelCollapsed,
        setPanelCollapsed,
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
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
      }}
    >
      {children}
    </ElementorContext.Provider>
  );
}

export function useElementor() {
  const ctx = useContext(ElementorContext);
  if (!ctx) throw new Error('useElementor deve ser usado dentro de ElementorEditorProvider');
  return ctx;
}
