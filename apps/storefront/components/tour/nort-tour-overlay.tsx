'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [cardPosition, setCardPosition] = useState<{ top?: number; bottom?: number; left: number }>({ left: 16 });
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calcula e atualiza a posição do elemento alvo em coordenadas da viewport
  const updatePositions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);

    const el = document.querySelector(step.selector);
    if (!el) {
      // Elemento não encontrado: posiciona no centro da viewport
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setHighlightRect(null);
      setCardPosition({
        top: Math.max(20, cy - 120),
        left: Math.max(16, cx - 280),
      });
      return;
    }

    const rect = el.getBoundingClientRect();
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

    // Posicionamento inteligente do cartão do Nort
    if (mobile) {
      // No mobile, ancora suavemente na base da tela para nunca vazar
      setCardPosition({
        bottom: 16,
        left: 12,
      });
    } else {
      const cardWidth = 560; // largura estimada máxima do card com o mascote
      const cardHeight = 240;

      // Centraliza horizontalmente sobre o elemento alvo e faz o clamping
      let left = rect.left + rect.width / 2 - cardWidth / 2;
      left = Math.max(20, Math.min(left, window.innerWidth - cardWidth - 20));

      const spaceBelow = window.innerHeight - (rect.bottom + pad);
      const spaceAbove = rect.top - pad;

      let top: number;
      if (spaceBelow >= cardHeight + 20 || spaceBelow >= spaceAbove) {
        // Posiciona abaixo do elemento
        top = Math.min(window.innerHeight - cardHeight - 20, rect.bottom + pad + 16);
      } else {
        // Posiciona acima do elemento
        top = Math.max(20, rect.top - pad - cardHeight - 16);
      }

      setCardPosition({
        top,
        left,
      });
    }
  }, [step]);

  // Rola o elemento suavemente para o centro da tela na transição de passo
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top >= 40 &&
        rect.bottom <= window.innerHeight - 40;

      if (!inView) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: window.innerWidth < 640 ? 'start' : 'center',
          inline: 'nearest',
        });
      }
    }

    // Atualiza imediatamente e com micro-delay para acomodar scrolls dinâmicos
    updatePositions();
    const t1 = setTimeout(updatePositions, 100);
    const t2 = setTimeout(updatePositions, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step, updatePositions]);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tour guiado pelo site Comercial do Norte com o mascote Nort"
      className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden"
    >
      {/* MÁSCARA SVG DO SPOTLIGHT COM CUTOUT SUAVE */}
      <svg
        className="absolute inset-0 size-full pointer-events-none transition-all duration-300"
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

        {/* Camada escura de foco com leve desfoque */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(2, 14, 38, 0.74)"
          mask="url(#nort-tour-spotlight-mask)"
        />
      </svg>

      {/* ANEL PULSANTE DOURADO DE DESTAQUE AO REDOR DO ELEMENTO FOCADO */}
      {highlightRect && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${highlightRect.x}px`,
            top: `${highlightRect.y}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            borderRadius: `${highlightRect.rx}px`,
          }}
          className="pointer-events-none ring-4 ring-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.65)] animate-pulse transition-all duration-300 ease-out z-[9998]"
        />
      )}

      {/* CARTÃO DO NORT COM BALÃO DE FALA */}
      <div
        ref={cardRef}
        style={{
          position: 'absolute',
          left: `${cardPosition.left}px`,
          top: cardPosition.top !== undefined ? `${cardPosition.top}px` : undefined,
          bottom: cardPosition.bottom !== undefined ? `${cardPosition.bottom}px` : undefined,
          maxWidth: isMobile ? 'calc(100vw - 24px)' : '620px',
        }}
        className="z-[9999] transition-all duration-200 ease-out"
      >
        <NortTourCard
          step={step}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={onNext}
          onPrev={onPrev}
          onClose={onClose}
          onStepClick={onStepClick}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
