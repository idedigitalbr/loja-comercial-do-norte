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

const STORAGE_KEY = 'cdn_home_composition_v2';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type ElementorTab = 'content' | 'style' | 'advanced';

export interface MediaModalState {
  isOpen: boolean;
  widgetId?: string;
  slideId?: string;
  slideIndex?: number;
  fieldPath?: string;
  currentUrl?: string;
  slideTitle?: string;
}

export interface LinkModalState {
  isOpen: boolean;
  widgetId?: string;
  slideId?: string;
  fieldPath?: string;
  currentLinkUrl?: string;
  currentImageUrl?: string;
  slideTitle?: string;
}

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
  updateWidgetNestedField: (id: string, fieldPath: string, value: any) => void;
  moveWidget: (id: string, direction: 'up' | 'down') => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  removeWidget: (id: string) => void;
  toggleWidget: (id: string) => void;
  addWidget: (type: WidgetType, insertIndex?: number) => void;
  addSlideToWidget: (widgetId: string) => void;
  removeSlideFromWidget: (widgetId: string, slideId: string) => void;
  updateSlideInWidget: (widgetId: string, slideId: string, partial: any) => void;
  updateBenefitItem: (widgetId: string, index: number, partial: Partial<BenefitItem>) => void;
  resetToDefault: () => void;
  saveComposition: () => Promise<void>;
  hasUnsavedChanges: boolean;
  saveMessage: string | null;
  panelCollapsed: boolean;
  setPanelCollapsed: (collapsed: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  mediaModalState: MediaModalState;
  openMediaModal: (options: {
    widgetId: string;
    slideId?: string;
    slideIndex?: number;
    fieldPath?: string;
    currentUrl?: string;
    previewUrl?: string;
    slideTitle?: string;
    title?: string;
  }) => void;
  closeMediaModal: () => void;
  linkModalState: LinkModalState;
  openLinkModal: (options: {
    widgetId: string;
    slideId?: string;
    fieldPath?: string;
    currentLinkUrl?: string;
    currentImageUrl?: string;
    slideTitle?: string;
  }) => void;
  closeLinkModal: () => void;
}

const ElementorContext = createContext<ElementorContextValue | null>(null);

function setByPath(obj: any, pathStr: string, value: any): any {
  const keys = pathStr.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur: any = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextIsIndex = !isNaN(Number(keys[i + 1]));
    const existing = cur[k];
    cur[k] = Array.isArray(existing)
      ? [...existing]
      : existing && typeof existing === 'object'
        ? { ...existing }
        : nextIsIndex
          ? []
          : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

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
  const [panelCollapsed, setPanelCollapsed] = useState(true);

  const [composition, setComposition] = useState<PageComposition>(initialComposition);
  const [history, setHistory] = useState<PageComposition[]>([initialComposition]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [mediaModalState, setMediaModalState] = useState<MediaModalState>({
    isOpen: false,
  });

  const [linkModalState, setLinkModalState] = useState<LinkModalState>({
    isOpen: false,
  });

  useEffect(() => {
    let loadedFromLocal = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.version === 2 && parsed?.widgets && Array.isArray(parsed.widgets)) {
          setComposition(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
          loadedFromLocal = true;
        }
      }
    } catch {
      // Ignora erro
    }

    if (!loadedFromLocal) {
      fetch('/api/storefront/composition')
        .then((res) => res.json())
        .then((res) => {
          if (res?.success && res?.data?.version === 2 && res?.data?.widgets?.length) {
            setComposition(res.data);
            setHistory([res.data]);
            setHistoryIndex(0);
          }
        })
        .catch(() => {});
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

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  function updateWidgetProps(id: string, newProps: any) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) =>
        w.id === id ? { ...w, props: { ...w.props, ...newProps } } : w
      ) as WidgetConfig[],
    };
    commitChange(updated);
  }

  function updateWidgetNestedField(id: string, fieldPath: string, value: any) {
    const updated: PageComposition = {
      ...composition,
      widgets: composition.widgets.map((w) => {
        if (w.id !== id) return w;
        const nextProps = setByPath(w.props, fieldPath, value);
        return { ...w, props: nextProps };
      }) as WidgetConfig[],
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

  function reorderWidgets(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const sorted = [...composition.widgets].sort((a, b) => a.order - b.order);
    const [moved] = sorted.splice(fromIndex, 1);
    if (!moved) return;
    sorted.splice(toIndex, 0, moved);
    const updated = sorted.map((w, idx) => ({ ...w, order: idx + 1 }));
    commitChange({ ...composition, widgets: updated });
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

    // Procura um template equivalente na composição oficial ou usa fallback rico
    const templateWidget = defaultHomeComposition.widgets.find((w) => w.type === type);
    const defaultProps: any = templateWidget
      ? JSON.parse(JSON.stringify(templateWidget.props))
      : {};

    const newWidget: WidgetConfig = {
      id: newId,
      type,
      enabled: true,
      order: 0,
      props: defaultProps,
    } as WidgetConfig;

    const sorted = [...composition.widgets].sort((a, b) => a.order - b.order);
    if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= sorted.length) {
      sorted.splice(insertIndex, 0, newWidget);
      const updated = sorted.map((w, idx) => ({ ...w, order: idx + 1 }));
      commitChange({ ...composition, widgets: updated });
    } else {
      newWidget.order = maxOrder + 1;
      const updated = [...sorted, newWidget].map((w, idx) => ({ ...w, order: idx + 1 }));
      commitChange({ ...composition, widgets: updated });
    }
    setSelectedWidgetId(newId);
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
            imageUrl: '/assets/home-ref/s01-hero-pizzaria.jpg',
            linkUrl: '/loja',
            altText: 'Banner Comercial do Norte',
            backgroundColor: '#022B76',
          };
          return {
            ...w,
            props: { ...w.props, slides: [...currentSlides, newSlide] },
          };
        }
        if (w.type === 'contained-hero') {
          const currentSlides = (w.props as any).slides || [];
          const newSlide: ContainedHeroSlide = {
            id: `slide-c-${Date.now()}`,
            title: `Nova Oferta ${currentSlides.length + 1}`,
            imageUrl: '/assets/home-ref/s02-contained-feirante.jpg',
            linkUrl: '/loja',
            altText: 'Campanha Comercial do Norte',
          };
          return {
            ...w,
            props: { ...w.props, slides: [...currentSlides, newSlide] },
          };
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

  async function saveComposition() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(composition));

      await fetch('/api/storefront/composition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composition),
      });

      setHasUnsavedChanges(false);
      setSaveMessage('Alterações salvas e sincronizadas com o servidor!');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch {
      setSaveMessage('Erro ao sincronizar com o servidor.');
      setTimeout(() => setSaveMessage(null), 3500);
    }
  }

  function resetToDefault() {
    if (confirm('Deseja restaurar a vitrine oficial de 19 seções do Comercial do Norte?')) {
      localStorage.removeItem(STORAGE_KEY);
      commitChange(defaultHomeComposition);
      setSelectedWidgetId(null);
      setHasUnsavedChanges(false);
      setSaveMessage('Vitrine oficial restaurada!');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  function openMediaModal(options: {
    widgetId: string;
    slideId?: string;
    slideIndex?: number;
    fieldPath?: string;
    currentUrl?: string;
    previewUrl?: string;
    slideTitle?: string;
    title?: string;
  }) {
    setMediaModalState({
      isOpen: true,
      widgetId: options.widgetId,
      slideId: options.slideId,
      slideIndex: options.slideIndex,
      fieldPath: options.fieldPath,
      currentUrl: options.currentUrl || options.previewUrl,
      slideTitle: options.slideTitle || options.title,
    });
  }

  function closeMediaModal() {
    setMediaModalState({ isOpen: false });
  }

  function openLinkModal(options: {
    widgetId: string;
    slideId?: string;
    fieldPath?: string;
    currentLinkUrl?: string;
    currentImageUrl?: string;
    slideTitle?: string;
  }) {
    setLinkModalState({
      isOpen: true,
      widgetId: options.widgetId,
      slideId: options.slideId,
      fieldPath: options.fieldPath,
      currentLinkUrl: options.currentLinkUrl,
      currentImageUrl: options.currentImageUrl,
      slideTitle: options.slideTitle,
    });
  }

  function closeLinkModal() {
    setLinkModalState({ isOpen: false });
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
        composition,
        selectedWidgetId,
        setSelectedWidgetId,
        updateWidgetProps,
        updateWidgetNestedField,
        moveWidget,
        reorderWidgets,
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
        panelCollapsed,
        setPanelCollapsed,
        undo,
        redo,
        canUndo,
        canRedo,
        mediaModalState,
        openMediaModal,
        closeMediaModal,
        linkModalState,
        openLinkModal,
        closeLinkModal,
      }}
    >
      {children}
    </ElementorContext.Provider>
  );
}

export function useElementor() {
  const ctx = useContext(ElementorContext);
  if (!ctx) {
    throw new Error('useElementor must be used within an ElementorEditorProvider');
  }
  return ctx;
}
