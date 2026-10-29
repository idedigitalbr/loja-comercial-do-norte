'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ElementorEditorProvider, useElementor } from './editor/elementor-editor-context';
import { ElementorTopBar } from './editor/elementor-top-bar';
import { ElementorDraftBanner } from './editor/elementor-draft-banner';
import { ElementorCanvas } from './editor/elementor-canvas';
import { ElementorTogglePill } from './editor/elementor-toggle-pill';
import { ElementorMediaModal } from './editor/elementor-media-modal';
import { ElementorLinkModal } from './editor/elementor-link-modal';
import { ElementorRevisionsModal } from './editor/elementor-revisions-modal';
import type { PageComposition } from '@/lib/storefront/widget-types';

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
  initialComposition,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  initialComposition?: PageComposition;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname?.startsWith('/login/');

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {children}
        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          <p>© {new Date().getFullYear()} Comercial do Norte - Todos os direitos reservados. Belém/PA.</p>
        </footer>
      </div>
    );
  }

  return (
    <ElementorEditorProvider initialComposition={initialComposition}>
      <ElementorDraftBanner />
      <ElementorTopBar />
      <ElementorGlobalMediaModal />
      <ElementorGlobalLinkModal />
      <ElementorRevisionsModal />

      <ElementorCanvas>
        {header}
        {children}
        {footer}
      </ElementorCanvas>

      <ElementorTogglePill />
    </ElementorEditorProvider>
  );
}
