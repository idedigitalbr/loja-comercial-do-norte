'use client';

import React from 'react';
import { ElementorEditorProvider, useElementor } from './editor/elementor-editor-context';
import { ElementorTopBar } from './editor/elementor-top-bar';
import { ElementorCanvas } from './editor/elementor-canvas';
import { ElementorTogglePill } from './editor/elementor-toggle-pill';
import { ElementorMediaModal } from './editor/elementor-media-modal';
import { ElementorLinkModal } from './editor/elementor-link-modal';

function ElementorGlobalMediaModal() {
  const { mediaModalState, closeMediaModal, updateSlideInWidget, updateWidgetNestedField } = useElementor();

  return (
    <ElementorMediaModal
      currentImageUrl={mediaModalState.currentUrl}
      isOpen={mediaModalState.isOpen}
      onClose={closeMediaModal}
      onSelectImage={(imageUrl, altText) => {
        if (!mediaModalState.widgetId) return;
        if (mediaModalState.fieldPath) {
          updateWidgetNestedField(mediaModalState.widgetId, mediaModalState.fieldPath, imageUrl);
        } else if (mediaModalState.slideId) {
          updateSlideInWidget(mediaModalState.widgetId, mediaModalState.slideId, {
            imageUrl,
            altText: altText || undefined,
          });
        }
      }}
      slideTitle={mediaModalState.slideTitle}
      title="Selecionar ou Enviar Imagem do Banner"
    />
  );
}

function ElementorGlobalLinkModal() {
  const { linkModalState, closeLinkModal, updateSlideInWidget, updateWidgetNestedField } = useElementor();

  return (
    <ElementorLinkModal
      currentImageUrl={linkModalState.currentImageUrl}
      currentLinkUrl={linkModalState.currentLinkUrl}
      isOpen={linkModalState.isOpen}
      onClose={closeLinkModal}
      onSaveLink={(linkUrl) => {
        if (!linkModalState.widgetId) return;
        if (linkModalState.fieldPath) {
          updateWidgetNestedField(linkModalState.widgetId, linkModalState.fieldPath, linkUrl);
        } else if (linkModalState.slideId) {
          updateSlideInWidget(linkModalState.widgetId, linkModalState.slideId, {
            linkUrl,
          });
        }
      }}
      slideTitle={linkModalState.slideTitle}
    />
  );
}

export function StorefrontShell({
  header,
  children,
  footer,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <ElementorEditorProvider>
      <ElementorTopBar />
      <ElementorGlobalMediaModal />
      <ElementorGlobalLinkModal />

      <ElementorCanvas>
        {header}
        {children}
        {footer}
      </ElementorCanvas>

      <ElementorTogglePill />
    </ElementorEditorProvider>
  );
}
