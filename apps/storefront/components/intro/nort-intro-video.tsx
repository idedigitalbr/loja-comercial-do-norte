'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  STORAGE_KEY_INTRO_VIEWS,
  recordNortIntroView,
  shouldShowNortIntro,
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

export function NortIntroVideo({ forceOpen = false, onFinish }: NortIntroVideoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(25.6);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const finishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    setIsFadingOut(true);

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
    // Registra atalhos no window para testes rápidos pelo time
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
      setIsOpen(true);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    }
  }, [forceOpen]);

  // Autoplay handler com fallback seguro
  useEffect(() => {
    if (!isOpen) return;

    const vid = videoRef.current;
    if (vid) {
      vid.muted = isMuted;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Se falhou com áudio ligado por política de autoplay do browser, garante mute e tenta novamente
          vid.muted = true;
          setIsMuted(true);
          vid.play().catch(() => {
            // Em caso de falha irreversível, não bloqueia o usuário
            handleFinish();
          });
        });
      }
    }
  }, [isOpen, isMuted, handleFinish]);

  // Se o componente for desmontado, libera o scroll
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  if (!isOpen) return null;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSeconds = Math.max(0, Math.ceil(duration - currentTime));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Apresentação Oficial Comercial do Norte"
      data-testid="nort-intro-video-overlay"
      className={`fixed inset-0 z-[99999] bg-[#030712] flex flex-col items-center justify-between overflow-hidden select-none transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Luz ambiente refletida atrás do vídeo (estilo cinema) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 blur-3xl scale-125" aria-hidden="true">
        <video
          src="/videos/nort-intro.webm"
          muted
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* HEADER SUPERIOR: Marca + Controles Discretos (Som e Pular) */}
      <header className="relative z-30 w-full px-4 py-4 md:px-8 md:py-6 flex items-center justify-between bg-gradient-to-b from-[#030712]/90 via-[#030712]/40 to-transparent">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
          <span className="text-xs md:text-sm font-semibold tracking-wide text-white/90">
            Comercial do Norte
          </span>
          <span className="hidden sm:inline-block text-xs text-white/40">•</span>
          <span className="hidden sm:inline-block text-xs text-white/60">
            Apresentação Oficial
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Botão de Som */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/90 border border-white/15 backdrop-blur-md transition-all shadow-sm"
            aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
          >
            {isMuted ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <span>Ativar som</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Som ativo</span>
              </>
            )}
          </button>

          {/* Botão de Pular para a loja */}
          <button
            type="button"
            onClick={handleFinish}
            data-testid="nort-intro-skip-button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-blue-600 hover:border-blue-500 text-white border border-white/20 backdrop-blur-md transition-all shadow-sm"
          >
            <span>Pular para a loja</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL: Player Fullscreen Responsivo */}
      <div className="relative z-20 flex-1 w-full max-w-6xl max-h-[76vh] flex items-center justify-center p-2 sm:p-4">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={isMuted}
          onTimeUpdate={(e) => {
            const current = e.currentTarget.currentTime;
            setCurrentTime(current);
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
          className="w-full h-full max-h-[74vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl ring-1 ring-white/10 pointer-events-none"
        >
          <source src="/videos/nort-intro.webm" type="video/webm" />
          <source src="/videos/nort-intro.mp4" type="video/mp4" />
        </video>
      </div>

      {/* FOOTER INFERIOR: Barra de Fake Loading e Progresso */}
      <footer className="relative z-30 w-full px-4 pb-6 pt-3 md:px-8 md:pb-8 bg-gradient-to-t from-[#030712] via-[#030712]/90 to-transparent flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-2.5">
          {/* Informações de status e contagem regressiva */}
          <div className="flex items-center justify-between text-xs md:text-sm font-medium">
            <div className="flex items-center gap-2 text-white/90">
              <svg
                className="animate-spin h-3.5 w-3.5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Carregando loja virtual Comercial do Norte...</span>
            </div>

            <div className="flex items-center gap-2 text-white/60 tabular-nums">
              <span>{remainingSeconds}s restantes</span>
              <span className="text-white/30">•</span>
              <span className="font-semibold text-white/90">{Math.round(progressPercent)}%</span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div
            className="w-full h-2 md:h-2.5 bg-white/10 rounded-full overflow-hidden p-[1px] border border-white/15 backdrop-blur-md"
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-primary to-amber-400 transition-all duration-150 ease-linear shadow-sm shadow-blue-500/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Slogan institucional */}
          <p className="text-center text-[11px] md:text-xs text-white/50 tracking-wide">
            Tudo para quem faz o melhor • Confeitaria, Pizzaria, Lanchonete, Padaria, Embalagens e Mercearia
          </p>
        </div>
      </footer>
    </div>
  );
}
