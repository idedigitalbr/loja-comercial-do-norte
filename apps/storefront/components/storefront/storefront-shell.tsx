'use client';

import React from 'react';
import { ElementorEditorProvider, useElementor } from './editor/elementor-editor-context';
import { ElementorTopBar } from './editor/elementor-top-bar';
import { ElementorCanvas } from './editor/elementor-canvas';
import { ElementorTogglePill } from './editor/elementor-toggle-pill';
import { ElementorMediaModal } from './editor/elementor-media-modal';
import { ElementorLinkModal } from './editor/elementor-link-modal';

function ElementorGlobalMediaModal() {
  const { mediaModalState, closeMediaModal, updateSlideInWidget } = useElementor();

  return (
    <ElementorMediaModal
      currentImageUrl={mediaModalState.currentUrl}
      isOpen={mediaModalState.isOpen}
      onClose={closeMediaModal}
      onSelectImage={(imageUrl, altText) => {
        if (mediaModalState.widgetId && mediaModalState.slideId) {
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
  const { linkModalState, closeLinkModal, updateSlideInWidget } = useElementor();

  return (
    <ElementorLinkModal
      currentImageUrl={linkModalState.currentImageUrl}
      currentLinkUrl={linkModalState.currentLinkUrl}
      isOpen={linkModalState.isOpen}
      onClose={closeLinkModal}
      onSaveLink={(linkUrl) => {
        if (linkModalState.widgetId && linkModalState.slideId) {
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
      {/* Barra Superior Discreta de Ferramentas */}
      <ElementorTopBar />

      {/* Modal Global de Mídia e Upload (Abre ao clicar no ícone de imagem) */}
      <ElementorGlobalMediaModal />

      {/* Modal Global de Link do Banner (Abre ao clicar no ícone de link) */}
      <ElementorGlobalLinkModal />

      {/* Canvas da Loja 100% Normal e em Largura Total (Sem painel lateral empurrando a página) */}
      <ElementorCanvas>
        {header}
        {children}
        {footer}
      </ElementorCanvas>

      {/* Botão Flutuante de Ativação do Modo Edição */}
      <ElementorTogglePill />
    </ElementorEditorProvider>
  );
}
