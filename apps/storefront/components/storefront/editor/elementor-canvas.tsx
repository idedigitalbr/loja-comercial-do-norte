'use client';

import React from 'react';
import { Smartphone, Tablet } from 'lucide-react';
import { useElementor } from './elementor-editor-context';

export function ElementorCanvas({ children }: { children: React.ReactNode }) {
  const { isEditing, previewMode, viewport, panelCollapsed } = useElementor();

  const isResponsiveDevice = isEditing && !previewMode && (viewport === 'tablet' || viewport === 'mobile');

  // Offset esquerdo e superior para acomodar a TopBar e o Painel Lateral
  const canvasOffsetClass =
    isEditing && !previewMode
      ? panelCollapsed
        ? 'pt-12 md:pl-0'
        : 'pt-12 md:pl-[300px]'
      : '';

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${canvasOffsetClass} ${
        isResponsiveDevice ? 'bg-[#3b3d40] py-6 px-4' : 'bg-white'
      }`}
    >
      {/* Indicador de Viewport e Moldura de Dispositivo */}
      {isResponsiveDevice ? (
        <div className="flex flex-col items-center">
          {/* Header do Dispositivo */}
          <div className="mb-2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white/90 shadow-md backdrop-blur-md">
            {viewport === 'tablet' ? (
              <>
                <Tablet className="size-3.5 text-[#8C1D40]" />
                <span>Simulador Tablet (768px)</span>
              </>
            ) : (
              <>
                <Smartphone className="size-3.5 text-[#8C1D40]" />
                <span>Simulador Mobile (390px)</span>
              </>
            )}
          </div>

          {/* Canvas do Device com sombra e moldura física */}
          <div
            className={`w-full bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-300 ${
              viewport === 'tablet'
                ? 'max-w-[768px] rounded-2xl ring-4 ring-black/40 overflow-hidden'
                : 'max-w-[390px] rounded-[36px] ring-8 ring-[#1c1d1f] overflow-hidden'
            }`}
          >
            {/* Se for mobile, simula a Notch / Dynamic Island */}
            {viewport === 'mobile' && (
              <div className="flex h-5 w-full items-center justify-center bg-black">
                <div className="h-3 w-20 rounded-full bg-zinc-900" />
              </div>
            )}

            <div className="overflow-x-hidden">{children}</div>

            {/* Barra inferior de navegação mobile */}
            {viewport === 'mobile' && (
              <div className="flex h-4 w-full items-center justify-center bg-white pb-1">
                <div className="h-1 w-28 rounded-full bg-slate-300" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}
