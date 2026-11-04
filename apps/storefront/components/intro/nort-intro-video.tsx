'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  STORAGE_KEY_INTRO_VIEWS,
  recordNortIntroView,
  shouldShowNortIntro,
  setIntroActive,
} from './nort-intro-helpers';

export const NORT_INTRO_FINISHED_EVENT = 'nort-intro-finished';

export interface NortIntroVideoProps {
  /**
   * Forçar abertura para testes ou previews
   */
  forceOpen?: boolean;
  /**
   * Callback disparado quando o vídeo termina ou é pulado
   */
  onFinish?: () => void;
}

function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function NortIntroVideo({ forceOpen = false, onFinish }: NortIntroVideoProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  // Áudio inicia ligado por padrão conforme solicitado
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(25.6);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const finishedRef = useRef(false);

  // Sinaliza imediatamente para o ecossistema que a intro está ativa no client
  if (typeof window !== 'undefined' && (forceOpen || shouldShowNortIntro())) {
    setIntroActive(true);
  }

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    setIsFadingOut(true);
    setIntroActive(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NORT_INTRO_FINISHED_EVENT));
    }

    onFinish?.();

    const timer = setTimeout(() => {
      setIsOpen(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [onFinish]);

  useEffect(() => {
    setMounted(true);

    // Atalhos globais para testes manuais
    if (typeof window !== 'undefined') {
      (window as unknown as { __replayNortIntro?: () => void }).__replayNortIntro = () => {
        try {
          localStorage.removeItem(STORAGE_KEY_INTRO_VIEWS);
          window.location.search = '?intro=1';
        } catch {}
      };
      (window as unknown as { __resetNortIntro?: () => void }).__resetNortIntro = () => {
        try {
          localStorage.removeItem(STORAGE_KEY_INTRO_VIEWS);
          window.location.reload();
        } catch {}
      };
    }

    if (forceOpen || shouldShowNortIntro()) {
      recordNortIntroView();
      setIntroActive(true);
      setIsOpen(true);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      setIntroActive(false);
    }
  }, [forceOpen]);

  // Autoplay handler com áudio ligado por padrão + fallback automático sem travar o vídeo
  useEffect(() => {
    if (!isOpen) return;

    const vid = videoRef.current;
    if (vid) {
      vid.muted = false;
      setIsMuted(false);

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMuted(false);
          })
          .catch(() => {
            // Se a política de autoplay do navegador exigir interação do usuário para áudio desmutado:
            vid.muted = true;
            setIsMuted(true);
            vid.play().catch(() => {
              handleFinish();
            });

            // Ao primeiro clique ou toque na tela, liga o som automaticamente
            const enableAudioOnGesture = () => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
              }
              window.removeEventListener('click', enableAudioOnGesture);
              window.removeEventListener('touchstart', enableAudioOnGesture);
              window.removeEventListener('keydown', enableAudioOnGesture);
            };

            window.addEventListener('click', enableAudioOnGesture, { once: true });
            window.addEventListener('touchstart', enableAudioOnGesture, { once: true });
            window.addEventListener('keydown', enableAudioOnGesture, { once: true });
          });
      }
    }
  }, [isOpen, handleFinish]);

  // Restaura overflow ao desmontar
  useEffect(() => {
    return () => {
      setIntroActive(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vídeo de Apresentação Oficial Comercial do Norte"
      data-testid="nort-intro-video-overlay"
      className={`fixed inset-0 z-[9999999] w-screen h-screen bg-black overflow-hidden select-none transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* VÍDEO FULLSCREEN TOTAL: Preenche 100% da tela sem bordas, caixas ou textos */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={isMuted}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (dur && !Number.isNaN(dur)) {
            setDuration(dur);
          }
        }}
        onEnded={handleFinish}
        onError={handleFinish}
        data-testid="nort-intro-video-element"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      >
        <source src="/videos/nort-intro.webm" type="video/webm" />
        <source src="/videos/nort-intro.mp4" type="video/mp4" />
      </video>

      {/* BOTÃO DISCRETO DE PULAR NO TOPO DIREITO (Estilo YouTube) */}
      <button
        type="button"
        onClick={handleFinish}
        data-testid="nort-intro-skip-button"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/60 hover:bg-black/90 text-white/90 border border-white/20 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
        aria-label="Pular apresentação"
      >
        <span>Pular</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      {/* BARRA DE PROGRESSO LIMPA NO RODAPÉ ESTILO YOUTUBE (Sem textos poluídos) */}
      <footer className="absolute bottom-0 inset-x-0 z-40 px-3 pb-3 pt-8 sm:px-6 sm:pb-4 sm:pt-12 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col gap-2">
        {/* Barra fina de progresso com indicador vermelho estilo YouTube */}
        <div
          className="relative w-full h-1 sm:h-1.5 bg-white/20 rounded-full overflow-visible"
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-red-600 rounded-full relative transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(220,38,38,0.8)]"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber dot circular vermelho (típico do YouTube) */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full shadow-md ring-2 ring-white/80" />
          </div>
        </div>

        {/* Linha de controles mínimos estilo YouTube: Som + Tempo decorrido */}
        <div className="flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-3">
            {/* Botão de volume / som */}
            <button
              type="button"
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (videoRef.current) {
                  videoRef.current.muted = nextMuted;
                }
              }}
              data-testid="nort-intro-sound-toggle"
              className="p-1 rounded hover:bg-white/10 transition-colors text-white/90"
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              {isMuted ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* Marcador de tempo minimalista (ex: 0:04 / 0:25) */}
            <span className="font-mono text-[11px] sm:text-xs text-white/80 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <span className="text-[11px] text-white/50 hidden sm:inline">
            Clique na tela para controlar ou pular
          </span>
        </div>
      </footer>
    </div>
  );

  return createPortal(content, document.body);
}
