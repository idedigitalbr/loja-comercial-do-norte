'use client';

import React, { useState } from 'react';
import { useElementor } from './editor/elementor-editor-context';
import { ElementorSectionWrapper } from './editor/elementor-section-wrapper';
import { ElementorAddSectionBox } from './editor/elementor-add-section-box';
import { renderWidget } from '@/lib/storefront/widget-registry';
import type { PageComposition, WidgetContextData } from '@/lib/storefront/widget-types';

export function HomeView({
  contextData,
}: {
  contextData: WidgetContextData;
  initialComposition?: PageComposition;
}) {
  const { composition, isEditing, previewMode } = useElementor();
  const [activeInsertBox, setActiveInsertBox] = useState<{
    index: number;
    position: 'above' | 'below';
  } | null>(null);

  const sortedWidgets = [...composition.widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-0 min-h-[50vh]">
      {sortedWidgets.map((widget, idx) => (
        <React.Fragment key={widget.id}>
          {/* Caixa de inserção contextual ACIMA quando o usuário aciona pelo menu */}
          {activeInsertBox?.index === idx && activeInsertBox?.position === 'above' && isEditing && !previewMode ? (
            <div className="relative animate-in fade-in slide-in-from-top-2 duration-150">
              <ElementorAddSectionBox
                initialOpen={true}
                insertIndex={idx}
                onClose={() => setActiveInsertBox(null)}
              />
            </div>
          ) : null}

          <ElementorSectionWrapper
            index={idx}
            onAddAbove={() => {
              setActiveInsertBox(
                activeInsertBox?.index === idx && activeInsertBox?.position === 'above'
                  ? null
                  : { index: idx, position: 'above' }
              );
            }}
            onAddBelow={() => {
              setActiveInsertBox(
                activeInsertBox?.index === idx && activeInsertBox?.position === 'below'
                  ? null
                  : { index: idx, position: 'below' }
              );
            }}
            totalWidgets={sortedWidgets.length}
            widget={widget}
          >
            {renderWidget(widget, contextData)}
          </ElementorSectionWrapper>

          {/* Caixa de inserção contextual ABAIXO quando o usuário aciona pelo menu */}
          {activeInsertBox?.index === idx && activeInsertBox?.position === 'below' && isEditing && !previewMode ? (
            <div className="relative animate-in fade-in slide-in-from-top-2 duration-150">
              <ElementorAddSectionBox
                initialOpen={true}
                insertIndex={idx + 1}
                onClose={() => setActiveInsertBox(null)}
              />
            </div>
          ) : null}
        </React.Fragment>
      ))}

      {/* Caixa de Inserção / Drop Box no final da vitrine */}
      <ElementorAddSectionBox insertIndex={sortedWidgets.length} />
    </div>
  );
}
