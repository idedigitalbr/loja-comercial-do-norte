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
  const [insertAboveIndex, setInsertAboveIndex] = useState<number | null>(null);

  const sortedWidgets = [...composition.widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-0 min-h-[50vh]">
      {sortedWidgets.map((widget, idx) => (
        <React.Fragment key={widget.id}>
          {/* Caixa de inserção contextual quando o usuário clica no + da seção */}
          {insertAboveIndex === idx && isEditing && !previewMode ? (
            <div className="relative">
              <ElementorAddSectionBox insertIndex={widget.order} />
            </div>
          ) : null}

          <ElementorSectionWrapper
            index={idx}
            onAddAbove={() => {
              setInsertAboveIndex(insertAboveIndex === idx ? null : idx);
            }}
            totalWidgets={sortedWidgets.length}
            widget={widget}
          >
            {renderWidget(widget, contextData)}
          </ElementorSectionWrapper>
        </React.Fragment>
      ))}

      {/* Caixa de Inserção / Drop Box no final da vitrine */}
      <ElementorAddSectionBox insertIndex={sortedWidgets.length + 1} />
    </div>
  );
}
