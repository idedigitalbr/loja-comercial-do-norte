'use client';

import React from 'react';
import { ElementorEditorProvider, useElementor } from './editor/elementor-editor-context';
import { ElementorTopBar } from './editor/elementor-top-bar';
import { ElementorCanvas } from './editor/elementor-canvas';
import { ElementorTogglePill } from './editor/elementor-toggle-pill';
import { ElementorMediaModal } from './editor/elementor-media-modal';

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
      title="Selecionar ou Enviar Imagem do Banner"
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

      {/* Modal Global de Mídia e Upload (Abre ao clicar no centro da imagem) */}
      <ElementorGlobalMediaModal />

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
