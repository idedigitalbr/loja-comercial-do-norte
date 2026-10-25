'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { EditorProvider, useEditor } from './editor/editor-context';
import { EditorSidebar } from './editor/editor-sidebar';
import { EditorToolbar } from './editor/editor-toolbar';
import { WidgetContainer } from './editor/widget-container';
import { renderWidget } from '@/lib/storefront/widget-registry';
import type { PageComposition, WidgetContextData } from '@/lib/storefront/widget-types';

function HomeWidgetList({ contextData }: { contextData: WidgetContextData }) {
  const { composition, isEditing, setSelectedWidgetId } = useEditor();

  const sortedWidgets = [...composition.widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-0">
      {sortedWidgets.map((widget, idx) => (
        <WidgetContainer
          isFirst={idx === 0}
          isLast={idx === sortedWidgets.length - 1}
          key={widget.id}
          widget={widget}
        >
          {renderWidget(widget, contextData)}
        </WidgetContainer>
      ))}

      {/* Botão de adicionar seção no final quando em modo de edição */}
      {isEditing ? (
        <div className="cn-container my-8 flex justify-center">
          <button
            className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed border-[#004CB1]/40 bg-blue-50/20 px-8 py-5 text-sm font-bold text-[#004CB1] transition-all hover:border-[#004CB1] hover:bg-blue-50 hover:shadow-md"
            onClick={() => setSelectedWidgetId('NEW_WIDGET_CATALOG')}
            type="button"
          >
            <Plus className="size-5" />
            <span>Adicionar Nova Seção / Widget</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function HomeView({
  initialComposition,
  contextData,
}: {
  initialComposition: PageComposition;
  contextData: WidgetContextData;
}) {
  return (
    <EditorProvider initialComposition={initialComposition}>
      <EditorToolbar />
      <div className="relative">
        <HomeWidgetList contextData={contextData} />
        <EditorSidebar />
      </div>
    </EditorProvider>
  );
}
