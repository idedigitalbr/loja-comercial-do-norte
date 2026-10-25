'use client';

import React from 'react';
import { ElementorEditorProvider } from './editor/elementor-editor-context';
import { ElementorTopBar } from './editor/elementor-top-bar';
import { ElementorPanel } from './editor/elementor-panel';
import { ElementorNavigator } from './editor/elementor-navigator';
import { ElementorCanvas } from './editor/elementor-canvas';
import { ElementorTogglePill } from './editor/elementor-toggle-pill';

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
      {/* Barra de Ferramentas Superior Fixa no Topo da Janela */}
      <ElementorTopBar />

      {/* Painel Lateral Esquerdo Retrátil do Elementor */}
      <ElementorPanel />

      {/* Navegador Flutuante em Árvore */}
      <ElementorNavigator />

      {/* Canvas com Offset Dinâmico e Viewport Responsivo */}
      <ElementorCanvas>
        {header}
        {children}
        {footer}
      </ElementorCanvas>

      {/* Botão Flutuante de Ativação do Elementor */}
      <ElementorTogglePill />
    </ElementorEditorProvider>
  );
}
