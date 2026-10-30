'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NortTourCard } from './nort-tour-card';
import type { NortTourStep } from './nort-tour-types';

interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
}

interface NortTourOverlayProps {
  step: NortTourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onStepClick: (index: number) => void;
}

export function NortTourOverlay({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  onStepClick,
}: NortTourOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Busca o elemento alvo considerando preferências mobile
  const getTargetElement = useCallback((): Element | null => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;
    if (!step.selector) return null; // Passos como Boas-vindas ou Conclusão não recortam o topo

    const isSmall = window.innerWidth < 768;
    if (isSmall && step.mobileSelector) {
      const mobEl = document.querySelector(step.mobileSelector);
      if (mobEl) {
        const mobRect = mobEl.getBoundingClientRect();
        if (mobRect.width > 0 && mobRect.height > 0) {
          return mobEl;
        }
      }
    }

    const defaultEl = document.querySelector(step.selector);
    if (defaultEl) {
      const rect = defaultEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return defaultEl;
      }
    }

    // Fallback: se houver mobileSelector mas defaultEl estava com width 0
    if (step.mobileSelector) {
      const mobEl = document.querySelector(step.mobileSelector);
      if (mobEl) return mobEl;
    }

    return defaultEl;
  }, [step]);

  // Calcula e atualiza a posição do elemento alvo em coordenadas da viewport
  const updatePositions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const el = getTargetElement();
    if (!el) {
      setHighlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setHighlightRect(null);
      return;
    }

    const pad = step.highlightPadding ?? 12;
    const rad = step.highlightRadius ?? 16;

    const x = Math.max(0, rect.left - pad);
    const y = Math.max(0, rect.top - pad);
    const width = Math.min(window.innerWidth, rect.width + pad * 2);
    const height = Math.min(window.innerHeight, rect.height + pad * 2);

    setHighlightRect({
      x,
      y,
      width,
      height,
      rx: rad,
      ry: rad,
    });
  }, [step, getTargetElement]);

  // Rola o elemento suavemente para o topo da tela na transição de passo
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const el = getTargetElement();
    if (el) {
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top >= 20 &&
        rect.top <= window.innerHeight * 0.4 &&
        rect.width > 0 &&
        rect.height > 0;

      if (!inView) {
        try {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        } catch {
          // Navegadores legados
        }
      }
    }

    // Atualiza imediatamente e com micro-delay para acomodar scrolls dinâmicos
    updatePositions();
    const t1 = setTimeout(updatePositions, 80);
    const t2 = setTimeout(updatePositions, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step, updatePositions, getTargetElement]);

  // Listener contínuo de scroll e resize (via requestAnimationFrame para 60fps sem engasgo)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const handleScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePositions();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [updatePositions]);

  // Atalhos de teclado: Escape (fechar), ArrowRight (próximo), ArrowLeft (anterior)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tour guiado pelo site Comercial do Norte com o mascote Nort"
      className="fixed inset-0 z-[99999] pointer-events-auto overflow-hidden select-none"
    >
      {/* MÁSCARA SVG DO SPOTLIGHT COM RECORTE SUAVE E FILTRO MAIS ESCURO (CONTRASTE CINEMATOGRÁFICO) */}
      <svg
        className="fixed inset-0 w-screen h-screen pointer-events-none transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="nort-tour-spotlight-mask">
            {/* Fundo branco completo (revela o overlay escuro) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Retângulo preto suave onde está o elemento (faz o furo/spotlight) */}
            {highlightRect && (
              <rect
                x={highlightRect.x}
                y={highlightRect.y}
                width={highlightRect.width}
                height={highlightRect.height}
                rx={highlightRect.rx}
                ry={highlightRect.ry}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Camada bem mais escura de foco total conforme solicitado (rgba 2, 6, 23 com 92% de opacidade) */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.92)"
          mask="url(#nort-tour-spotlight-mask)"
        />
      </svg>

      {/* ANEL PULSANTE DOURADO DE DESTAQUE AO REDOR DO ELEMENTO FOCADO */}
      {highlightRect && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: `${highlightRect.x}px`,
            top: `${highlightRect.y}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            borderRadius: `${highlightRect.rx}px`,
          }}
          className="pointer-events-none ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.85),inset_0_0_15px_rgba(251,191,36,0.3)] animate-pulse transition-all duration-300 ease-out z-[99998]"
        />
      )}

      {/* MASCOTE NORT BEM GRANDE CENTRALIZADO E ENCOSTADO NO CANTO INFERIOR (BOTTOM: 0) COM O BALÃO DE FALA */}
      <div className="fixed inset-x-0 bottom-0 z-[99999] flex flex-col items-center justify-end pointer-events-none pb-0 px-3 sm:px-6">
        <div className="pointer-events-auto w-full flex justify-center">
          <NortTourCard
            step={step}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onNext={onNext}
            onPrev={onPrev}
            onClose={onClose}
            onStepClick={onStepClick}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
